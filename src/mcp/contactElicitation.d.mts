export type PortfolioContactIntent = "vaga-senior-staff" | "consultoria" | "palestra" | "outro";
export type PortfolioContactElicitationContent = Record<string, string> & {
  name: string;
  email: string;
  intent: PortfolioContactIntent;
};
export type PortfolioContactElicitationResponse =
  | { action: "accept"; content: PortfolioContactElicitationContent }
  | { action: "decline" }
  | { action: "cancel" };

export const PORTFOLIO_CONTACT_ELICITATION_MESSAGE: string;
export function buildPortfolioContactAcceptResponse(fields: Record<string, unknown>): Extract<PortfolioContactElicitationResponse, { action: "accept" }>;
export function isTrustedPortfolioContactElicitation(request: unknown): boolean;
export function createPortfolioContactElicitationHandler(
  requestConsent: (message: string) => Promise<PortfolioContactElicitationResponse> | PortfolioContactElicitationResponse,
): (request: unknown) => Promise<PortfolioContactElicitationResponse>;
