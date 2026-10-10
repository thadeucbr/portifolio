import type { PortfolioMcpTool } from "@/hooks/usePortfolioMcp";
import type { PortfolioAnswerMessage } from "./answerPrompt.mjs";

export interface RetrievedProjectCandidate {
  id: string;
  title: string;
}
export interface McpToolRoutingDecision {
  name: "portfolio_list_projects" | "portfolio_get_project";
  arguments: Record<string, string>;
}
export declare function buildMcpToolRoutingMessages(
  question: string,
  candidates: RetrievedProjectCandidate[],
  tools: PortfolioMcpTool[],
): PortfolioAnswerMessage[];
export declare function parseMcpToolRoutingDecision(
  output: string,
  tools: PortfolioMcpTool[],
  allowedProjectIds: string[],
): McpToolRoutingDecision | null;
