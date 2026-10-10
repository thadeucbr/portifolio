const CONTACT_FIELDS = ["name", "email", "company", "intent"];

/** Adapts validated MCP elicitation data to the existing progressive Server Action. */
export function createPortfolioContactSubmitter(submitRecruiterSignal) {
  if (typeof submitRecruiterSignal !== "function") {
    throw new TypeError("A contact Server Action is required.");
  }

  return async (contact) => {
    const formData = new FormData();
    formData.set("decision", "accept");
    formData.set("website", "");
    for (const field of CONTACT_FIELDS) {
      const value = contact?.[field];
      if (typeof value === "string") formData.set(field, value);
    }
    return submitRecruiterSignal({ status: "idle" }, formData);
  };
}
