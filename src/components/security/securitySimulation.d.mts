export type TestRole = "BANK_MANAGER" | "GUEST" | "UNTRUSTED_APP";
export type SecurityDecision = "ALLOWED" | "BLOCKED" | "SANITIZED_ALLOWED";
export declare function simulateSecurityInspection(
  payload: string,
  options: { hasToken: boolean; role: TestRole },
): {
  cpfMasked: boolean;
  cardMasked: boolean;
  m2mValid: boolean;
  rbacGranted: boolean;
  sanitizedText: string;
  decision: SecurityDecision;
};
