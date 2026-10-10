import { acceptedContent, createMcpHandler, inputRequired, inputResponse, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { PORTFOLIO_CONTACT_ELICITATION_MESSAGE } from "./contactElicitation.mjs";

const evidenceStatus = "static-portfolio-content";

const projectSummarySchema = z.object({
  id: z.string(),
  sourceLabel: z.string(),
  title: z.string(),
  category: z.string(),
  period: z.string(),
  summary: z.string(),
});

const projectDetailsSchema = projectSummarySchema.extend({
  architectureHighlights: z.array(z.string()),
  stack: z.array(z.string()),
  facts: z.array(z.object({ label: z.string(), value: z.string() })),
  executionFlow: z.array(z.object({
    step: z.string(),
    title: z.string(),
    description: z.string(),
    tech: z.string(),
  })),
  failureHandling: z.string(),
});

const annotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const contactAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false,
};

const contactFormSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  company: z.string().max(120).optional(),
  intent: z.enum(["vaga-senior-staff", "consultoria", "palestra", "outro"]),
});

const contactResultSchema = z.object({
  status: z.enum(["accepted", "declined", "cancelled", "error"]),
  message: z.string(),
  receiptId: z.string().optional(),
});

export function createPortfolioMcpServer(systems, submitContact = async () => ({ status: "error" })) {
  const server = new McpServer({ name: "thadeu-portfolio", version: "1.0.0" });

  server.registerTool(
    "portfolio_list_projects",
    {
      title: "List portfolio projects",
      description: "List public project summaries from the static portfolio profile. This tool does not query production systems.",
      annotations,
      inputSchema: z.object({}),
      outputSchema: z.object({
        projects: z.array(projectSummarySchema),
        evidenceStatus: z.literal(evidenceStatus),
      }),
    },
    async () => {
      const projects = systems.map(({ id, sourceLabel, title, category, period, summary }) => ({
        id, sourceLabel, title, category, period, summary,
      }));
      const structuredContent = { projects, evidenceStatus };
      return {
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "portfolio_get_project",
    {
      title: "Get portfolio project details",
      description: "Return a single project description from the public static portfolio profile; values are not live telemetry.",
      annotations,
      inputSchema: z.object({
        projectId: z.string().min(1).max(100).describe("Public project identifier listed by portfolio_list_projects"),
      }),
      outputSchema: z.object({
        project: projectDetailsSchema,
        evidenceStatus: z.literal(evidenceStatus),
      }),
    },
    async ({ projectId }) => {
      const source = systems.find((project) => project.id === projectId);
      if (!source) {
        return { content: [{ type: "text", text: "Project not found." }], isError: true };
      }

      const project = {
        id: source.id,
        sourceLabel: source.sourceLabel,
        title: source.title,
        category: source.category,
        period: source.period,
        summary: source.summary,
        architectureHighlights: source.architectureHighlights,
        stack: source.stack,
        facts: source.facts,
        executionFlow: source.executionFlow.map(({ step, title, description, tech }) => ({
          step, title, description, tech,
        })),
        failureHandling: source.failureHandling,
      };
      const structuredContent = { project, evidenceStatus };
      return {
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "portfolio_request_contact",
    {
      title: "Request contact with the candidate",
      description: "Open a consent elicitation for a contact request. This tool writes no data unless the visitor accepts.",
      annotations: contactAnnotations,
      inputSchema: z.object({}),
      outputSchema: contactResultSchema,
    },
    async (_args, context) => {
      const key = "portfolio-contact";
      const response = inputResponse(context.mcpReq.inputResponses, key);

      if (response.kind === "missing") {
        return inputRequired({
          inputRequests: {
            [key]: inputRequired.elicit({
              message: PORTFOLIO_CONTACT_ELICITATION_MESSAGE,
              requestedSchema: contactFormSchema,
            }),
          },
        });
      }

      if (response.kind === "elicit" && response.action === "decline") {
        const result = { status: "declined", message: "Contact request declined; no data was saved." };
        return { content: [{ type: "text", text: result.message }], structuredContent: result };
      }
      if (response.kind === "elicit" && response.action === "cancel") {
        const result = { status: "cancelled", message: "Contact request cancelled; no data was saved." };
        return { content: [{ type: "text", text: result.message }], structuredContent: result };
      }

      if (response.kind !== "elicit" || response.action !== "accept") {
        const result = { status: "error", message: "Contact request could not be verified." };
        return { content: [{ type: "text", text: result.message }], structuredContent: result, isError: true };
      }

      const contact = acceptedContent(context.mcpReq.inputResponses, key, contactFormSchema);
      if (!contact) {
        const result = { status: "error", message: "Contact details did not match the approved form." };
        return { content: [{ type: "text", text: result.message }], structuredContent: result, isError: true };
      }

      const submission = await submitContact(contact);
      if (submission?.status !== "accepted") {
        const result = { status: "error", message: "The contact request could not be recorded." };
        return { content: [{ type: "text", text: result.message }], structuredContent: result, isError: true };
      }
      const result = {
        status: "accepted",
        message: "Contact request recorded.",
        ...(typeof submission.receiptId === "string" ? { receiptId: submission.receiptId } : {}),
      };
      return { content: [{ type: "text", text: result.message }], structuredContent: result };
    },
  );

  return server;
}

export function createPortfolioMcpHandler(systems, submitContact) {
  return createMcpHandler(() => createPortfolioMcpServer(systems, submitContact));
}
