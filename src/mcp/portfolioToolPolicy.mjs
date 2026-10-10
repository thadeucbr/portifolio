const APPROVED = Object.freeze({
  portfolio_list_projects: {
    description: "List public project summaries from the static portfolio profile. This tool does not query production systems.",
    properties: {},
    required: [],
  },
  portfolio_get_project: {
    description: "Return a single project description from the public static portfolio profile; values are not live telemetry.",
    properties: { projectId: { type: "string", minLength: 1, maxLength: 100 } },
    required: ["projectId"],
  },
});

const sorted = (values) => [...values].sort();

/** Pin remote tool names, descriptions, schemas, and safety hints before exposing calls to the UI. */
export function verifyPortfolioToolManifest(tools) {
  if (!Array.isArray(tools)) return { ok: false, reason: "MCP tool list is not an array." };

  const actualNames = sorted(tools.map((tool) => tool?.name).filter((name) => typeof name === "string"));
  const approvedNames = sorted(Object.keys(APPROVED));
  const unexpected = actualNames.find((name) => !Object.hasOwn(APPROVED, name));
  if (unexpected) return { ok: false, reason: `Unexpected tool: ${unexpected}.` };

  const missing = approvedNames.find((name) => !actualNames.includes(name));
  if (missing || actualNames.length !== approvedNames.length) {
    return { ok: false, reason: `Approved tool missing or duplicated: ${missing ?? "unknown"}.` };
  }

  for (const name of approvedNames) {
    const tool = tools.find((candidate) => candidate.name === name);
    const expected = APPROVED[name];
    if (tool.description !== expected.description) {
      return { ok: false, reason: `Tool definition changed: ${name} description drift.` };
    }
    const annotations = tool.annotations ?? {};
    if (
      annotations.readOnlyHint !== true ||
      annotations.destructiveHint !== false ||
      annotations.idempotentHint !== true ||
      annotations.openWorldHint !== false
    ) {
      return { ok: false, reason: `Tool definition changed: ${name} safety annotations drift.` };
    }

    const properties = tool.inputSchema?.properties ?? {};
    const actualProperties = sorted(Object.keys(properties));
    const expectedProperties = sorted(Object.keys(expected.properties));
    const actualRequired = sorted(tool.inputSchema?.required ?? []);
    const expectedRequired = sorted(expected.required);
    if (JSON.stringify(actualProperties) !== JSON.stringify(expectedProperties) ||
        JSON.stringify(actualRequired) !== JSON.stringify(expectedRequired)) {
      return { ok: false, reason: `Tool definition changed: ${name} input schema drift.` };
    }
    for (const [propertyName, property] of Object.entries(expected.properties)) {
      const actual = properties[propertyName];
      if (actual?.type !== property.type || actual?.minLength !== property.minLength || actual?.maxLength !== property.maxLength) {
        return { ok: false, reason: `Tool definition changed: ${name}.${propertyName} constraints drift.` };
      }
    }
  }

  return { ok: true };
}
