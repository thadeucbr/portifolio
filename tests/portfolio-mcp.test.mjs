import test from "node:test";
import assert from "node:assert/strict";
import { createMCPClient } from "@ai-sdk/mcp";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createPortfolioMcpHandler } from "../src/mcp/portfolioServer.mjs";
import { verifyPortfolioToolManifest } from "../src/mcp/portfolioToolPolicy.mjs";
import { parseMcpToolRoutingDecision } from "../src/mcp/toolRouting.mjs";
import {
  PORTFOLIO_CONTACT_ELICITATION_MESSAGE,
  isTrustedPortfolioContactElicitation,
} from "../src/mcp/contactElicitation.mjs";

const fixture = [
  {
    id: "broker-1",
    sourceLabel: "RESUMO CURRICULAR",
    title: "Broker de Mensageria",
    category: "Platform Architecture",
    period: "2026",
    summary: "Roteia mensagens por um buffer desacoplado.",
    architectureHighlights: ["Idempotência", "Circuit breaker"],
    stack: ["TypeScript", "Redis"],
    facts: [{ label: "Canais descritos", value: "WhatsApp · Telegram" }],
    executionFlow: [{ step: "INGRESS", title: "Entrada", description: "Normaliza payload", tech: "HTTP" }],
    failureHandling: "Retém eventos em fila de retentativa.",
  },
];

async function withClient(run, options = {}) {
  const handler = createPortfolioMcpHandler(fixture, options.submitContact);
  const transport = new StreamableHTTPClientTransport(new URL("http://portfolio.test/api/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  });
  const client = new Client({ name: "portfolio-integration-test", version: "1.0.0" }, {
    versionNegotiation: { mode: "auto" },
    ...(options.elicitation ? {
      capabilities: { elicitation: { form: {} } },
      inputRequired: { autoFulfill: true, maxRounds: 2 },
    } : {}),
  });
  try {
    await client.connect(transport);
    await run(client);
  } finally {
    await client.close();
    await handler.close();
  }
}

test("serves two read-only tools and one consent-gated MCP contact tool", async () => {
  await withClient(async (client) => {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((tool) => tool.name).sort(), [
      "portfolio_get_project",
      "portfolio_list_projects",
      "portfolio_request_contact",
    ]);
    for (const tool of tools.filter((candidate) => candidate.name !== "portfolio_request_contact")) {
      assert.equal(tool.annotations?.readOnlyHint, true);
      assert.equal(tool.annotations?.destructiveHint, false);
      assert.equal(tool.annotations?.idempotentHint, true);
    }
    const contact = tools.find((tool) => tool.name === "portfolio_request_contact");
    assert.equal(contact.annotations?.readOnlyHint, false);
    assert.equal(contact.annotations?.destructiveHint, true);
    assert.equal(contact.annotations?.idempotentHint, false);
  });
});

test("returns curated project details as structured MCP content", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({ name: "portfolio_get_project", arguments: { projectId: "broker-1" } });
    assert.notEqual(result.isError, true);
    assert.equal(result.structuredContent.project.id, "broker-1");
    assert.equal(result.structuredContent.project.title, "Broker de Mensageria");
    assert.equal(result.structuredContent.project.sourceLabel, "RESUMO CURRICULAR");
    assert.deepEqual(result.structuredContent.project.facts, [{ label: "Canais descritos", value: "WhatsApp · Telegram" }]);
    assert.equal("codename" in result.structuredContent.project, false);
    assert.equal("metrics" in result.structuredContent.project, false);
    assert.equal(result.structuredContent.evidenceStatus, "static-portfolio-content");
  });
});

test("lists only curated project summaries as structured MCP content", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({ name: "portfolio_list_projects", arguments: {} });
    assert.notEqual(result.isError, true);
    assert.deepEqual(result.structuredContent.projects.map((project) => project.id), ["broker-1"]);
    assert.equal(result.structuredContent.projects[0].title, "Broker de Mensageria");
    assert.equal(result.structuredContent.evidenceStatus, "static-portfolio-content");
  });
});

test("rejects unknown project identifiers without returning unrelated records", async () => {
  await withClient(async (client) => {
    const result = await client.callTool({ name: "portfolio_get_project", arguments: { projectId: "missing-secret" } });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /not found/i);
    assert.doesNotMatch(JSON.stringify(result), /RESUMO CURRICULAR|Redis/);
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
    assert.equal(result.structuredContent.project.sourceLabel, "RESUMO CURRICULAR");
  } finally {
    await client.close();
    await handler.close();
  }
});

test("live MCP tools are routable only to the safe list/detail operations", async () => {
  await withClient(async (client) => {
    const { tools } = await client.listTools();
    assert.deepEqual(verifyPortfolioToolManifest(tools), { ok: true });
    assert.deepEqual(
      parseMcpToolRoutingDecision('{"tool":"portfolio_list_projects","arguments":{}}', tools, ["broker-1"]),
      { name: "portfolio_list_projects", arguments: {} },
    );
    assert.deepEqual(
      parseMcpToolRoutingDecision('{"tool":"portfolio_get_project","arguments":{"projectId":"broker-1"}}', tools, ["broker-1"]),
      { name: "portfolio_get_project", arguments: { projectId: "broker-1" } },
    );
    assert.equal(
      parseMcpToolRoutingDecision('{"tool":"portfolio_get_project","arguments":{"projectId":"another-project"}}', tools, ["broker-1"]),
      null,
    );
    assert.equal(
      parseMcpToolRoutingDecision('{"tool":"portfolio_request_contact","arguments":{}}', tools, ["broker-1"]),
      null,
    );
  });
});

test("accepted MCP contact elicitation submits once without echoing visitor PII", async () => {
  const submissions = [];
  await withClient(async (client) => {
    client.setRequestHandler("elicitation/create", async (request) => {
      assert.equal(request.params.message, PORTFOLIO_CONTACT_ELICITATION_MESSAGE);
      assert.equal(isTrustedPortfolioContactElicitation(request), true);
      return {
        action: "accept",
        content: {
          name: "Ada Visitor",
          email: "ada@example.test",
          company: "Analytical Engine",
          intent: "vaga-senior-staff",
        },
      };
    });
    const result = await client.callTool({ name: "portfolio_request_contact", arguments: {} });
    assert.equal(result.structuredContent.status, "accepted");
    assert.equal(result.structuredContent.receiptId, "receipt-123");
    assert.doesNotMatch(JSON.stringify(result), /ada@example\\.test|Ada Visitor/);
  }, {
    elicitation: true,
    submitContact: async (contact) => {
      submissions.push(contact);
      return { status: "accepted", receiptId: "receipt-123", message: "Contact request recorded." };
    },
  });
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].email, "ada@example.test");
});

test("declining MCP contact elicitation never persists visitor data", async () => {
  let submissions = 0;
  await withClient(async (client) => {
    client.setRequestHandler("elicitation/create", async () => ({ action: "decline" }));
    const result = await client.callTool({ name: "portfolio_request_contact", arguments: {} });
    assert.equal(result.structuredContent.status, "declined");
  }, {
    elicitation: true,
    submitContact: async () => { submissions += 1; return { status: "accepted" }; },
  });
  assert.equal(submissions, 0);
});

test("cancelling MCP contact elicitation never persists visitor data", async () => {
  let submissions = 0;
  await withClient(async (client) => {
    client.setRequestHandler("elicitation/create", async () => ({ action: "cancel" }));
    const result = await client.callTool({ name: "portfolio_request_contact", arguments: {} });
    assert.equal(result.structuredContent.status, "cancelled");
  }, {
    elicitation: true,
    submitContact: async () => { submissions += 1; return { status: "accepted" }; },
  });
  assert.equal(submissions, 0);
});
