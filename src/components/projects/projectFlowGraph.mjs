function text(value, fallback = "") {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

export function buildProjectFlowGraph(steps) {
  if (!Array.isArray(steps)) return { nodes: [], edges: [] };

  const nodes = steps
    .filter((step) => step && typeof step === "object")
    .map((step, index) => ({
      id: text(step.step, `step-${index + 1}`),
      order: index + 1,
      title: text(step.title, `Etapa ${index + 1}`),
      description: text(step.description),
      tech: text(step.tech),
    }));

  const edges = nodes.slice(1).map((node, index) => ({
    from: nodes[index].id,
    to: node.id,
  }));

  return { nodes, edges };
}
