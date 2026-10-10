const CPF_PATTERN = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
const CARD_PATTERN = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

/**
 * Runs a deliberately local, illustrative ruleset. This is not a cryptographic,
 * Active Directory, bank, or production DLP integration.
 */
export function simulateSecurityInspection(payload, { hasToken, role }) {
  const cpfMasked = (payload.match(CPF_PATTERN) ?? []).length > 0;
  const cardMasked = (payload.match(CARD_PATTERN) ?? []).length > 0;
  const m2mValid = Boolean(hasToken) && role !== "UNTRUSTED_APP";
  const rbacGranted = role === "BANK_MANAGER";
  const sanitizedText = payload
    .replace(CPF_PATTERN, "[DLP_PROTECTED_CPF:***.***.***-**]")
    .replace(CARD_PATTERN, "[DLP_PROTECTED_CARD:**** **** **** ****]");

  const decision = !m2mValid || !rbacGranted
    ? "BLOCKED"
    : cpfMasked || cardMasked
      ? "SANITIZED_ALLOWED"
      : "ALLOWED";

  return { cpfMasked, cardMasked, m2mValid, rbacGranted, sanitizedText, decision };
}
