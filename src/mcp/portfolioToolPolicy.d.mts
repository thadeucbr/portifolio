export type PortfolioToolVerification = { ok: true } | { ok: false; reason: string };
export declare function verifyPortfolioToolManifest(tools: unknown[]): PortfolioToolVerification;
