export declare const STAGE_IDS: readonly ["hero", "systems", "resilience", "security", "agent", "dossier"];
export type StageId = (typeof STAGE_IDS)[number];
export type TransitionDirection = "nav-forward" | "nav-back";
export declare function stageForShortcut(key: string, editing?: boolean): StageId | null;
export declare function transitionDirection(current: StageId, next: StageId): TransitionDirection | null;
