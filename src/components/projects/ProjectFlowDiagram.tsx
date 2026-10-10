"use client";

import { useMemo, useState } from "react";
import { buildProjectFlowGraph } from "@/components/projects/projectFlowGraph.mjs";

interface StepInput {
  step?: string;
  title?: string;
  description?: string;
  tech?: string;
}

interface Props {
  steps: readonly StepInput[];
  evidenceStatus?: string;
}

export function ProjectFlowDiagram({ steps, evidenceStatus = "static-portfolio-content" }: Props) {
  const graph = useMemo(() => buildProjectFlowGraph(steps), [steps]);
  const [activeId, setActiveId] = useState<string | undefined>(graph.nodes[0]?.id);

  const activeNode = graph.nodes.find((node) => node.id === activeId) ?? graph.nodes[0];
  if (!graph.nodes.length) return null;

  return (
    <section className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3" aria-label="Diagrama interativo de arquitetura">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-wide text-[#38BDF8]">ARQUITETURA DECLARADA · GRAFO MCP</span>
        <span className="font-mono text-[8px] text-white/45">{evidenceStatus} · não é execução ao vivo</span>
      </div>
      <p className="text-[10px] text-white/60">Selecione uma etapa para inspecionar a responsabilidade e a tecnologia.</p>

      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-max items-center gap-2" aria-label="Etapas do fluxo">
          {graph.nodes.map((node, index) => (
            <li key={`${node.id}-${node.order}`} className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={activeNode.id === node.id}
                onClick={() => setActiveId(node.id)}
                className={`glass-panel-subtle flex min-h-[66px] w-[138px] flex-col items-start justify-center rounded-lg px-2.5 py-2 text-left transition-colors ${activeNode.id === node.id ? "border-[#1856FF]/70 bg-[#1856FF]/15" : "hover:border-white/30"}`}
              >
                <span className="font-mono text-[8px] text-white/45">{String(node.order).padStart(2, "0")} · {node.id}</span>
                <span className="mt-0.5 text-[11px] font-semibold text-white">{node.title}</span>
                <span className="font-mono text-[8px] text-[#38BDF8]/80">{node.tech}</span>
              </button>
              {index < graph.edges.length && (
                <span aria-hidden="true" className="select-none font-mono text-lg text-[#1856FF]">→</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="min-h-[48px] rounded-lg border-l-2 border-[#1856FF] bg-white/[0.035] px-3 py-2" aria-live="polite">
        <span className="font-mono text-[9px] text-white/45">{activeNode.id} · {activeNode.tech}</span>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/85">{activeNode.description}</p>
      </div>
    </section>
  );
}
