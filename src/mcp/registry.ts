export interface LocalActionDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

/** Local UI actions are intentionally separate from the remote MCP tool registry. */
export const LOCAL_ACTIONS: Record<string, LocalActionDefinition> = {
  requestExecutiveContact: {
    name: "requestExecutiveContact",
    description: "Open the consent form for an explicit professional contact request.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Professional name" },
        email: { type: "string", description: "Reply address" },
        company: { type: "string", description: "Company (optional)" },
        intent: { type: "string", description: "Reason for contacting the portfolio owner" },
      },
      required: ["name", "email", "intent"],
    },
  },
};
