import type { ExecutionStage } from "@/data/systems";
export function buildCurriculumSimulationEvents(project: { title?: string; executionFlow?: readonly ExecutionStage[] }): string[];
