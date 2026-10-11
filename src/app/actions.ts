"use server";

// Guideline linhas 90-92 e 138-141: mutação via Server Action, sem rota /api,
// com validação no servidor e progressive enhancement (funciona mesmo sem o JS do canvas).

import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { PROFILE_DATA } from "@/data/systems";
import { classifyContactDecision } from "./contactDecision.mjs";

export interface SignalState {
  status: "idle" | "error" | "accepted";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "intent", string>>;
  channels?: { email: string; phone: string; linkedin: string };
  receiptId?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM_TOKEN_RE = /^\d+:[A-Za-z0-9_-]{35,}$/;
const INTENTS = new Set(["vaga-senior-staff", "consultoria", "palestra", "outro"]);
const INTENT_LABELS: Record<string, string> = {
  "vaga-senior-staff": "Vaga Sênior / Staff",
  consultoria: "Consultoria",
  palestra: "Palestra",
  outro: "Outro",
};

// Rate limiting: máx. 5 requisições por IP a cada 10 minutos
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestHistory = new Map<string, number[]>();

async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    const forwarded = headerStore.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    const realIp = headerStore.get("x-real-ip");
    if (realIp) return realIp.trim();
    const cfIp = headerStore.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  } catch {
    // Chamada fora de contexto HTTP (testes ou CLI)
  }
  return "127.0.0.1";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequestHistory.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  ipRequestHistory.set(ip, timestamps);
  return true;
}

async function getTelegramBotToken() {
  const tokenFile = process.env.TELEGRAM_BOT_TOKEN_FILE;
  if (tokenFile) {
    try {
      return (await readFile(tokenFile, "utf8")).trim();
    } catch {
      return "";
    }
  }
  return process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
}

function telegramSafeField(value: string) {
  return Array.from(value, (character) => {
    const code = character.charCodeAt(0);
    return code === 0 || code === 10 || code === 13 ? " " : character;
  }).join("").trim();
}

async function sendTelegramContact(record: {
  receiptId: string;
  at: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  intent: string;
}, token: string, chatId: string) {
  const text = [
    "Novo contato aceito pelo formulário do portfólio",
    `Nome: ${telegramSafeField(record.name)}`,
    `E-mail: ${telegramSafeField(record.email)}`,
    `Telefone: ${telegramSafeField(record.phone || "não informado")}`,
    `Empresa: ${telegramSafeField(record.company) || "não informada"}`,
    `Motivo: ${INTENT_LABELS[record.intent] ?? "Outro"}`,
    `Recebido: ${record.at}`,
    `Recibo: ${record.receiptId}`,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8_000),
  });
  const result = await response.json().catch(() => null) as { ok?: boolean } | null;
  if (!response.ok || result?.ok !== true) throw new Error("Telegram notification rejected");
}

export async function submitRecruiterSignal(_prev: SignalState, formData: FormData): Promise<SignalState> {
  // Honeypot anti-bot: campo invisível que humanos não preenchem.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "error", message: "Requisição rejeitada." };
  }

  // Rate limiting por IP: previne spam de notificações e exaustão da cota do Telegram
  const clientIp = await getClientIp();
  if (!checkRateLimit(clientIp)) {
    return {
      status: "error",
      message: "Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos antes de enviar novamente.",
    };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 40);
  const company = String(formData.get("company") ?? "").trim().slice(0, 120);
  const intent = String(formData.get("intent") ?? "");
  // Fail closed: only a submitted, explicit "accept" may persist contact data.
  const rawDecision = formData.get("decision");
  const decision = classifyContactDecision(typeof rawDecision === "string" ? rawDecision : "");

  // Decline/cancel/invalid decisions exit before validation or persistence.
  if (decision === "decline") {
    return { status: "idle", message: "Elicitation recusada. Nenhum dado foi enviado ou armazenado." };
  }
  if (decision === "cancel") {
    return { status: "idle", message: "Elicitation cancelada. Nenhum dado foi enviado ou armazenado." };
  }
  if (decision !== "accept") {
    return { status: "error", message: "Decisão de contato inválida." };
  }

  const fieldErrors: SignalState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = "Informe seu nome.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "E-mail inválido.";
  if (!INTENTS.has(intent)) fieldErrors.intent = "Selecione o motivo do contato.";
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Revise os campos destacados.", fieldErrors };
  }

  const telegramToken = await getTelegramBotToken();
  const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim() ?? "";
  const hasTelegramToken = Boolean(telegramToken);
  const hasTelegramChat = Boolean(telegramChatId);
  if (hasTelegramToken !== hasTelegramChat) {
    return { status: "error", message: "Canal de contato indisponível: configuração do Telegram incompleta." };
  }
  if (hasTelegramToken && !TELEGRAM_TOKEN_RE.test(telegramToken)) {
    return { status: "error", message: "Canal de contato indisponível: formato do token do Telegram inválido." };
  }
  if (hasTelegramChat && !/^-?\d+$/.test(telegramChatId) && !/^@[A-Za-z0-9_]{5,}$/.test(telegramChatId)) {
    return { status: "error", message: "Canal de contato indisponível: chat ID do Telegram inválido." };
  }
  // Production never persists contact PII locally or reports success without delivery.
  if (process.env.NODE_ENV === "production" && !hasTelegramToken) {
    return { status: "error", message: "Canal de contato indisponível: notificação segura não configurada." };
  }

  // Persist only after explicit consent and input validation.
  const receiptId = `sig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const record = { receiptId, at: new Date().toISOString(), name, email, phone, company, intent };

  try {
    if (hasTelegramToken && hasTelegramChat) {
      await sendTelegramContact(record, telegramToken, telegramChatId);
    } else {
      const dir = path.join(process.cwd(), ".data");
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, "recruiter-signals.jsonl"), JSON.stringify(record) + "\n", "utf8");
    }
  } catch (error) {
    console.error("[submitRecruiterSignal] contato não pôde ser entregue:", error instanceof Error ? error.name : "UnknownError");
    return { status: "error", message: "Não foi possível registrar agora. Tente novamente em instantes." };
  }

  return {
    status: "accepted",
    receiptId,
    message: hasTelegramToken
      ? `Obrigado, ${name.split(" ")[0]}. Seu pedido de contato foi encaminhado.`
      : `Obrigado, ${name.split(" ")[0]}. Seu pedido foi registrado neste ambiente de desenvolvimento.`,
    channels: {
      email: PROFILE_DATA.contact.email,
      phone: PROFILE_DATA.contact.phone,
      linkedin: PROFILE_DATA.contact.linkedin,
    },
  };
}
