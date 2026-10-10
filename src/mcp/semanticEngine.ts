// Corpus semântico derivado dos dados reais do currículo (src/data/systems.ts).
// O ranqueamento principal é feito por embeddings neurais no Web Worker (src/workers/embedding.worker.ts).
// Este módulo também expõe um ranqueamento LÉXICO de contingência, usado apenas enquanto o modelo
// ainda está sendo baixado (guideline linha 80: a experiência não pode paralisar durante o warmup).
// A UI sempre rotula qual dos dois motores produziu a resposta.

import { SYSTEMS_DATA, PROFILE_DATA } from "@/data/systems";
import type { CorpusChunk } from "@/workers/embedding.worker";

export const CONTACT_SYSTEM_ID = "executive-contact";

/** Association between a retrieved project and its actual MCP tool; contact stays behind its consent action. */
export const SYSTEM_TOOL: Record<string, string> = {
  ...Object.fromEntries(SYSTEMS_DATA.map((system) => [system.id, "portfolio_get_project"])),
  [CONTACT_SYSTEM_ID]: "portfolio_request_contact",
};

export const SYSTEM_LABEL: Record<string, string> = {
  ...Object.fromEntries(SYSTEMS_DATA.map((s) => [s.id, s.codename])),
  [CONTACT_SYSTEM_ID]: "CONTATO",
};

export function buildCorpus(): CorpusChunk[] {
  const chunks: CorpusChunk[] = [];
  for (const s of SYSTEMS_DATA) {
    const push = (suffix: string, text: string) => chunks.push({ id: `${s.id}:${suffix}`, systemId: s.id, text });
    push("summary", `${s.title}. ${s.summary}`);
    s.architectureHighlights.forEach((h, i) => push(`hl${i}`, `${s.title}: ${h}`));
    s.executionFlow.forEach((st, i) => push(`flow${i}`, `${st.title}: ${st.description} (${st.tech})`));
    push("failure", `${s.title} — tolerância a falhas: ${s.failureHandling}`);
    push("stack", `${s.title} usa ${s.stack.join(", ")}`);
  }
  [
    `Contato profissional de ${PROFILE_DATA.name}: e-mail, telefone, LinkedIn e GitHub.`,
    `Disponibilidade para vagas ${PROFILE_DATA.availability}, entrevista, contratação e propostas de trabalho.`,
    `Formação: ${PROFILE_DATA.education.map((e) => `${e.degree} (${e.institution}, ${e.year})`).join("; ")}.`,
  ].forEach((text, i) => chunks.push({ id: `${CONTACT_SYSTEM_ID}:${i}`, systemId: CONTACT_SYSTEM_ID, text }));
  return chunks;
}

// ---------- Fallback léxico (sem rede neural) ----------

const normalize = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]{3,}/g) ?? [];

export function lexicalRank(query: string, corpus: CorpusChunk[]) {
  const q = new Set(normalize(query));
  const best = new Map<string, number>();
  for (const c of corpus) {
    const toks = normalize(c.text);
    if (!toks.length) continue;
    const hits = toks.filter((t) => q.has(t)).length;
    const score = hits / Math.sqrt(toks.length * Math.max(q.size, 1));
    best.set(c.systemId, Math.max(best.get(c.systemId) ?? 0, score));
  }
  return [...best.entries()].map(([systemId, score]) => ({ systemId, score })).sort((a, b) => b.score - a.score);
}
