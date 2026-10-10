import { SYSTEMS_DATA } from "@/data/systems";
import { createPortfolioMcpHandler } from "@/mcp/portfolioServer.mjs";

const handler = createPortfolioMcpHandler(SYSTEMS_DATA);
const dispatch = (request: Request) => handler.fetch(request);

export const GET = dispatch;
export const POST = dispatch;
export const DELETE = dispatch;
