export interface PortfolioAnswerMessage {
  role: "system" | "user";
  content: string;
}
export interface PortfolioAnswerEvidence {
  id?: string;
  title?: string;
  text: string;
}
export declare function buildPortfolioAnswerMessages(
  question: string,
  evidence?: PortfolioAnswerEvidence[],
): PortfolioAnswerMessage[];
export interface SafeAnswerStreamFilter {
  push(chunk: string): void;
  finish(): void;
}
export declare function createSafeAnswerStreamFilter(onVisibleText: (text: string) => void): SafeAnswerStreamFilter;
export declare function cleanGeneratedAnswer(answer: unknown): string;
