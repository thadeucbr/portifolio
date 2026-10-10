export interface ProjectFlowStepInput {
  step?: string | number;
  title?: string;
  description?: string;
  tech?: string;
}
export interface ProjectFlowNode {
  id: string;
  order: number;
  title: string;
  description: string;
  tech: string;
}
export interface ProjectFlowEdge { from: string; to: string }
export function buildProjectFlowGraph(steps: unknown): { nodes: ProjectFlowNode[]; edges: ProjectFlowEdge[] };
