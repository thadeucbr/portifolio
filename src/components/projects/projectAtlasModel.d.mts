export interface ProjectIdentity {
  id: string;
}
export declare function buildProjectGravityScores(
  projects: readonly ProjectIdentity[],
  selectedId: string,
): Record<string, number>;
