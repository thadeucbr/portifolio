"use server";

// Guideline linhas 90-92 e 138-141: mutação via Server Action, sem rota /api,
// com validação no servidor e progressive enhancement (funciona mesmo sem o JS do canvas).

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
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
const INTENTS = new Set(["vaga-senior-staff", "consultoria", "palestra", "outro"]);

export async function submitRecruiterSignal(_prev: SignalState, formData: FormData): Promise<SignalState> {
  // Honeypot anti-bot: campo invisível que humanos não preenchem.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "error", message: "Requisição rejeitada." };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
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

  // Prevent production contact PII from falling back to an ephemeral/local file.
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (process.env.NODE_ENV === "production" && !webhook) {
    return { status: "error", message: "Canal de contato indisponível: destino seguro não configurado." };
  }

  // Persist only after explicit consent and input validation.
  const receiptId = `sig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const record = { receiptId, at: new Date().toISOString(), name, email, company, intent };

  try {
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } else {
      const dir = path.join(process.cwd(), ".data");
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, "recruiter-signals.jsonl"), JSON.stringify(record) + "\n", "utf8");
    }
  } catch (err) {
    console.error("[submitRecruiterSignal] persistência falhou:", err);
    return { status: "error", message: "Não foi possível registrar agora. Tente novamente em instantes." };
  }

  return {
    status: "accepted",
    receiptId,
    message: `Obrigado, ${name.split(" ")[0]}. Canal liberado.`,
    channels: {
      email: PROFILE_DATA.contact.email,
      phone: PROFILE_DATA.contact.phone,
      linkedin: PROFILE_DATA.contact.linkedin,
    },
  };
}
