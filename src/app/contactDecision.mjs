export function classifyContactDecision(decision) {
  return decision === "accept" || decision === "decline" || decision === "cancel"
    ? decision
    : "invalid";
}
