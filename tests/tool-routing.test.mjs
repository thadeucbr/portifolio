import test from "node:test";
import assert from "node:assert/strict";
import { buildMcpToolRoutingMessages, parseMcpToolRoutingDecision } from "../src/mcp/toolRouting.mjs";

const tools = [
  {
    name: "portfolio_list_projects",
    description: "List public project summaries from the static portfolio profile. This tool does not query production systems.",
    inputSchema: { type: "object", properties: {}, required: [] },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "portfolio_get_project",
    description: "Return one public project record from the static portfolio profile. This tool does not query production systems.",
    inputSchema: { type: "object", properties: { projectId: { type: "string" } }, required: ["projectId"] },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
];
const candidates = [
  { id: "broker", title: "Messaging Broker" },
  { id: "mesh", title: "Zero Trust Mesh" },
];

test("routing prompt exposes only retrieved candidates and live read-only MCP schemas", () => {
  const messages = buildMcpToolRoutingMessages("Liste todos os projetos", candidates, tools);
  assert.match(messages[0].content, /JSON/);
  assert.match(messages[1].content, /portfolio_list_projects/);
  assert.match(messages[1].content, /projectId/);
  assert.match(messages[1].content, /broker/);
  assert.doesNotMatch(messages[1].content, /executive-contact|requestExecutiveContact/i);
});

test("accepts a valid project lookup only for a retrieved candidate", () => {
  assert.deepEqual(
    parseMcpToolRoutingDecision('{"tool":"portfolio_get_project","arguments":{"projectId":"mesh"}}', tools, ["broker", "mesh"]),
    { name: "portfolio_get_project", arguments: { projectId: "mesh" } },
  );
});

test("accepts the list tool only with empty arguments", () => {
  assert.deepEqual(
    parseMcpToolRoutingDecision('{"tool":"portfolio_list_projects","arguments":{}}', tools, ["broker"]),
    { name: "portfolio_list_projects", arguments: {} },
  );
  assert.equal(parseMcpToolRoutingDecision('{"tool":"portfolio_list_projects","arguments":{"query":"secret"}}', tools, ["broker"]), null);
});

test("rejects unknown, mutating, drifted, or non-JSON tool decisions", () => {
  assert.equal(parseMcpToolRoutingDecision('{"tool":"send_email","arguments":{}}', tools, ["broker"]), null);
  assert.equal(parseMcpToolRoutingDecision('{"tool":"portfolio_get_project","arguments":{"projectId":"private"}}', tools, ["broker"]), null);
  assert.equal(parseMcpToolRoutingDecision('{"tool":"portfolio_get_project","arguments":{"projectId":"broker","extra":true}}', tools, ["broker"]), null);
  assert.equal(parseMcpToolRoutingDecision('I will inspect the database now.', tools, ["broker"]), null);

  const dangerousTools = tools.map((tool) => tool.name === "portfolio_get_project"
    ? { ...tool, annotations: { ...tool.annotations, destructiveHint: true } }
    : tool);
  assert.equal(parseMcpToolRoutingDecision('{"tool":"portfolio_get_project","arguments":{"projectId":"broker"}}', dangerousTools, ["broker"]), null);
});
