import type { SystemProject } from "../data/systems";

export interface PortfolioMcpHandler {
  fetch(request: Request): Promise<Response>;
  close(): Promise<void>;
}
export interface PortfolioContactInput {
  name: string;
  email: string;
  company?: string;
  intent: "vaga-senior-staff" | "consultoria" | "palestra" | "outro";
}
export type PortfolioContactSubmitter = (contact: PortfolioContactInput) => Promise<unknown>;

export declare function createPortfolioMcpServer(
  systems: readonly SystemProject[],
  submitContact?: PortfolioContactSubmitter,
): unknown;
export declare function createPortfolioMcpHandler(
  systems: readonly SystemProject[],
  submitContact?: PortfolioContactSubmitter,
): PortfolioMcpHandler;
