import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const evidenceStatus = "static-portfolio-content";

const projectSummarySchema = z.object({
  id: z.string(),
  codename: z.string(),
  title: z.string(),
  category: z.string(),
  period: z.string(),
  summary: z.string(),
});

const projectDetailsSchema = projectSummarySchema.extend({
  architectureHighlights: z.array(z.string()),
  stack: z.array(z.string()),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })),
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

export function createPortfolioMcpServer(systems) {
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
      const projects = systems.map(({ id, codename, title, category, period, summary }) => ({
        id, codename, title, category, period, summary,
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
        codename: source.codename,
        title: source.title,
        category: source.category,
        period: source.period,
        summary: source.summary,
        architectureHighlights: source.architectureHighlights,
        stack: source.stack,
        metrics: source.metrics,
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

  return server;
}

export function createPortfolioMcpHandler(systems) {
  return createMcpHandler(() => createPortfolioMcpServer(systems));
}
