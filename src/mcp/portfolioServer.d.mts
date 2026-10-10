import type { SystemProject } from "../data/systems";

export interface PortfolioMcpHandler {
  fetch(request: Request): Promise<Response>;
  close(): Promise<void>;
}
export declare function createPortfolioMcpServer(systems: readonly SystemProject[]): unknown;
export declare function createPortfolioMcpHandler(systems: readonly SystemProject[]): PortfolioMcpHandler;
