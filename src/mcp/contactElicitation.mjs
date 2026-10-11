export const PORTFOLIO_CONTACT_ELICITATION_MESSAGE =
  "Informe nome, e-mail, telefone (opcional), empresa (opcional) e motivo. Em desenvolvimento, pedidos aceitos são armazenados localmente; em produção, exigem um webhook seguro configurado e serão recusados sem ele. Recusar ou cancelar não envia nem grava os dados.";

const EXPECTED_FIELDS = Object.freeze({
  name: { type: "string", minLength: 2, maxLength: 120 },
  email: { type: "string", format: "email", maxLength: 200 },
  phone: { type: "string", maxLength: 40 },
  company: { type: "string", maxLength: 120 },
  intent: { type: "string", enum: ["vaga-senior-staff", "consultoria", "palestra", "outro"] },
});
const CONTACT_INTENTS = new Set(["vaga-senior-staff", "consultoria", "palestra", "outro"]);
const EXPECTED_REQUIRED = ["email", "intent", "name"];
const sorted = (values) => [...values].sort();

export function buildPortfolioContactAcceptResponse(fields) {
  const intent = String(fields?.intent ?? "");
  if (!CONTACT_INTENTS.has(intent)) throw new TypeError("Motivo de contato não aprovado.");
  const content = {
    name: String(fields?.name ?? "").trim(),
    email: String(fields?.email ?? "").trim(),
    intent,
  };
  const phone = String(fields?.phone ?? "").trim();
  if (phone) content.phone = phone;
  const company = String(fields?.company ?? "").trim();
  if (company) content.company = company;
  return { action: "accept", content };
}

export function createPortfolioContactElicitationHandler(requestConsent) {
  if (typeof requestConsent !== "function") {
    throw new TypeError("A contact consent UI handler is required.");
  }

  return async (request) => {
    if (!isTrustedPortfolioContactElicitation(request)) return { action: "decline" };
    return requestConsent(PORTFOLIO_CONTACT_ELICITATION_MESSAGE);
  };
}

/** Accept only the exact, non-secret contact form disclosed by this portfolio. */
export function isTrustedPortfolioContactElicitation(request) {
  const params = request?.params;
  const schema = params?.requestedSchema;
  if (
    request?.method !== "elicitation/create" ||
    params?.mode !== "form" ||
    params?.message !== PORTFOLIO_CONTACT_ELICITATION_MESSAGE ||
    schema?.type !== "object" ||
    schema?.additionalProperties === true ||
    !schema.properties || typeof schema.properties !== "object" ||
    JSON.stringify(sorted(schema.required ?? [])) !== JSON.stringify(EXPECTED_REQUIRED)
  ) return false;

  const actualFields = sorted(Object.keys(schema.properties));
  const expectedFields = sorted(Object.keys(EXPECTED_FIELDS));
  if (JSON.stringify(actualFields) !== JSON.stringify(expectedFields)) return false;

  return expectedFields.every((field) => {
    const actual = schema.properties[field];
    const expected = EXPECTED_FIELDS[field];
    if (actual?.type !== expected.type) return false;
    if (expected.format && actual.format !== expected.format) return false;
    if (expected.minLength !== undefined && actual.minLength !== expected.minLength) return false;
    if (expected.maxLength !== undefined && actual.maxLength !== expected.maxLength) return false;
    if (expected.enum && JSON.stringify(actual.enum) !== JSON.stringify(expected.enum)) return false;
    return true;
  });
}
