import { readFile } from "node:fs/promises";
import path from "node:path";

const tokenFile = process.env.TELEGRAM_BOT_TOKEN_FILE || path.resolve("secrets/telegram_bot_token");

try {
  const token = (await readFile(tokenFile, "utf8")).trim();
  if (!token) throw new Error("empty");

  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
    signal: AbortSignal.timeout(8_000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok !== true || !Array.isArray(payload.result)) throw new Error("api");

  const chats = new Map();
  for (const update of payload.result) {
    const message = update.message ?? update.edited_message ?? update.channel_post;
    const chat = message?.chat;
    if (chat && (typeof chat.id === "number" || typeof chat.id === "string")) {
      chats.set(String(chat.id), String(chat.type ?? "unknown"));
    }
  }

  if (chats.size === 0) {
    console.log("Nenhuma conversa encontrada. Envie /start ao bot e execute novamente.");
  } else {
    for (const [id, type] of chats) console.log(`${type}\t${id}`);
  }
} catch {
  console.error("Não foi possível consultar atualizações do bot. Verifique o arquivo secreto e a conectividade; o token não foi exibido.");
  process.exitCode = 1;
}
