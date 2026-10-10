const normalize = (value) => String(value ?? "")
  .toLocaleLowerCase("pt-BR")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

const DIRECT_CONTACT_PATTERNS = [
  /\b(?:quero|gostaria(?: de)?|preciso|posso|poderia)\s+(?:falar|conversar)\s+com\s+(?:ele|voce|o candidato|thadeu)\b/,
  /\b(?:como\s+(?:posso|poderia)\s+)?entrar em contato\b/,
  /\b(?:quero|gostaria(?: de)?|preciso|posso|poderia)\s+(?:contatar|contactar|enviar mensagem)\b/,
  /\b(?:tenho|ofereco|procuro|busco)\b.{0,40}\b(?:vaga|oportunidade de trabalho|proposta de trabalho)\b/,
];

export function isExplicitContactRequest(text) {
  const normalized = normalize(text);
  return normalized.length > 0 && DIRECT_CONTACT_PATTERNS.some((pattern) => pattern.test(normalized));
}
