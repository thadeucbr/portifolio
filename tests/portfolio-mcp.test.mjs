import test from "node:test";
import assert from "node:assert/strict";
import { createMCPClient } from "@ai-sdk/mcp";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createPortfolioMcpHandler } from "../src/mcp/portfolioServer.mjs";
import { verifyPortfolioToolManifest } from "../src/mcp/portfolioToolPolicy.mjs";

const fixture = [
  {
    id: "broker-1",
    codename: "BROKER-ONE",
    title: "Broker de Mensageria",
    category: "Platform Architecture",
    period: "2026",
    summary: "Roteia mensagens por um buffer desacoplado.",
    architectureHighlights: ["Idempotência", "Circuit breaker"],
    stack: ["TypeScript", "Redis"],
    metrics: [{ label: "Latência declarada", value: "< 45ms" }],
    executionFlow: [{ step: "INGRESS", title: "Entrada", description: "Normaliza payload", tech: "HTTP" }],
    failureHandling: "Retém eventos em fila de retentativa.",
  },
];

async function withClient(run) {
  const handler = createPortfolioMcpHandler(fixture);
  const transport = new StreamableHTTPClientTransport(new URL("http://portfolio.test/api/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client({ name: "portfolio-integration-test", version: "1.0.0" }, {
    versionNegotiation: { mode: "auto" },
  });
  try {
    await client.connect(transport);
    await run(client);
  } finally {
    await client.close();
    await handler.close();
  }
}

test("serves only allowlisted, read-only MCP project tools over Streamable HTTP", async () => {
  await withClient(async (client) => {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((tool) => tool.name).sort(), ["portfolio_get_project", "portfolio_list_projects"]);
    for (const tool of tools) {
      assert.equal(tool.annotations?.readOnlyHint, true);
      assert.equal(tool.annotations?.destructiveHint, false);
      assert.equal(tool.annotations?.idempotentHint, true);
    }
  });
});

test("returns curated project details as structured MCP content", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({ name: "portfolio_get_project", arguments: { projectId: "broker-1" } });
    assert.notEqual(result.isError, true);
    assert.equal(result.structuredContent.project.id, "broker-1");
    assert.equal(result.structuredContent.project.title, "Broker de Mensageria");
    assert.equal(result.structuredContent.evidenceStatus, "static-portfolio-content");
  });
});

test("rejects unknown project identifiers without returning unrelated records", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({ name: "portfolio_get_project", arguments: { projectId: "missing-secret" } });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /not found/i);
    assert.doesNotMatch(JSON.stringify(result), /BROKER-ONE|Redis/);
  });
});

test("AI SDK MCP client negotiates the route and invokes the pinned tool", async () => {
  const handler = createPortfolioMcpHandler(fixture);
  const client = await createMCPClient({
    clientName: "ai-sdk-portfolio-integration-test",
    version: "1.0.0",
    transport: {
      type: "http",
      url: "http://portfolio.test/api/mcp",
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    },
  });

  try {
    const listed = await client.listTools();
    assert.deepEqual(verifyPortfolioToolManifest(listed.tools), { ok: true });
    const result = await client.callTool({ name: "portfolio_get_project", arguments: { projectId: "broker-1" } });
    assert.equal(result.structuredContent.project.codename, "BROKER-ONE");
  } finally {
    await client.close();
    await handler.close();
  }
});
