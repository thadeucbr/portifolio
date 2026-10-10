import { SYSTEMS_DATA } from "@/data/systems";
import { submitRecruiterSignal } from "@/app/actions";
import { createPortfolioContactSubmitter } from "@/mcp/contactSubmission.mjs";
import { createPortfolioMcpHandler } from "@/mcp/portfolioServer.mjs";

const handler = createPortfolioMcpHandler(
  SYSTEMS_DATA,
  createPortfolioContactSubmitter(submitRecruiterSignal),
);
const dispatch = (request: Request) => handler.fetch(request);

export const GET = dispatch;
export const POST = dispatch;
export const DELETE = dispatch;
