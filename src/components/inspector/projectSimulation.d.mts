import type { ExecutionStage } from "@/data/systems";
export function buildProjectSimulationEvents(project: { title?: string; executionFlow?: readonly ExecutionStage[] }): string[];
