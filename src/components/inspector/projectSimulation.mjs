export function buildProjectSimulationEvents(project) {
  const title = String(project?.title ?? "projeto");
  const stages = Array.isArray(project?.executionFlow) ? project.executionFlow : [];
  return [
    `SIMULAÇÃO LOCAL — ${title}. Etapas ilustrativas; nenhuma integração real foi executada.`,
    ...stages.map((stage) => `[DEMO] ${String(stage.step ?? "ETAPA")}: ${String(stage.title ?? "")} — ${String(stage.description ?? "")}`),
    "Fim da demonstração: nenhum sistema real foi chamado e nenhum resultado operacional foi medido.",
  ];
}
