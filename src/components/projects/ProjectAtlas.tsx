"use client";

import { startTransition, useMemo, useState, type CSSProperties } from "react";
import { ArrowUpRight, Orbit, Workflow } from "lucide-react";
import { SYSTEMS_DATA } from "@/data/systems";
import { SemanticGravityField } from "@/components/console/SemanticGravityField";
import { buildProjectGravityScores } from "./projectAtlasModel.mjs";
import { projectTransitionName } from "./projectTransition.mjs";
import type { FieldLayout } from "@/workers/fieldLayouts.mjs";

const PROJECT_IDS = SYSTEMS_DATA.map((project) => project.id);
const PROJECT_CARD_INFO = Object.fromEntries(SYSTEMS_DATA.map((project) => [project.id, {
  title: project.title,
  subtitle: `${project.shortLabel} · ${project.category}`,
}]));
const LAYOUTS: { id: FieldLayout; label: string }[] = [
  { id: "orbital", label: "Órbita" },
  { id: "circle", label: "Círculo" },
  { id: "grid", label: "Matriz" },
  { id: "triangle", label: "Triângulo" },
];

/** Project browser: Rapier moves each project node; selection pulls it toward the core. */
export function ProjectAtlas() {
  const [selectedId, setSelectedId] = useState(PROJECT_IDS[0]);
  const [layout, setLayout] = useState<FieldLayout>("orbital");
  const selected = SYSTEMS_DATA.find((project) => project.id === selectedId) ?? SYSTEMS_DATA[0];
  const scores = useMemo(
    () => buildProjectGravityScores(SYSTEMS_DATA, selected.id),
    [selected.id],
  );
  const selectProject = (projectId: string) => {
    startTransition(() => setSelectedId(projectId));
  };

  return (
    <div className="w-full min-h-[min(68vh,700px)] p-3 sm:p-6 flex flex-col gap-4 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#38BDF8]">
            <Orbit aria-hidden="true" className="w-4 h-4" />
            Project Atlas · campo físico local
          </div>
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Sistemas que convergem
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl">
            Arraste e arremesse cartões; colisões e molas rodam em Rapier no worker. Setas do teclado também movem o cartão focado.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <div role="group" aria-label="Alinhamento dos cartões" className="flex flex-wrap gap-1">
            {LAYOUTS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={layout === option.id}
                onClick={() => setLayout(option.id)}
                className={`rounded-lg border px-2 py-1 font-mono text-[9px] ${layout === option.id ? "border-[#38BDF8]/70 bg-[#1856FF]/20 text-[#BAE6FD]" : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="shrink-0 font-mono text-[9px] px-2.5 py-1 rounded-full border border-white/15 bg-white/[0.04] text-white/55">
            FÍSICA LOCAL · NENHUM SISTEMA EXTERNO CONECTADO
          </span>
        </div>
      </header>

      <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden">
        <SemanticGravityField
          ids={PROJECT_IDS}
          scores={scores}
          topId={selected.id}
          modeLabel="órbita por seleção"
          shape="card"
          layout={layout}
          cardInfo={PROJECT_CARD_INFO}
          onSelect={selectProject}
        />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        <article className="lg:col-span-7 glass-panel rounded-2xl border border-white/15 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase text-[#38BDF8]">
              <span>{selected.shortLabel}</span>
              <span className="text-white/30">/</span>
              <span>{selected.category}</span>
              <span className="text-white/30">/</span>
              <span>{selected.period}</span>
            </div>
            <h3
              style={{ viewTransitionName: projectTransitionName(selected.id) } as CSSProperties}
              className="text-lg sm:text-2xl font-bold text-white mt-1"
            >
              {selected.title}
            </h3>
            <p className="text-sm leading-relaxed text-[#CBD5E1] mt-2">{selected.summary}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/55 mb-2">
              <Workflow aria-hidden="true" className="w-3.5 h-3.5" />
              Fluxo arquitetural de referência
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {selected.executionFlow.map((step, index) => (
                <li key={step.step} className="rounded-xl bg-black/30 border border-white/10 p-3">
                  <span className="font-mono text-[9px] text-[#38BDF8]">0{index + 1} · {step.step}</span>
                  <h4 className="text-xs font-semibold text-white mt-1">{step.title}</h4>
                  <p className="text-[10px] leading-relaxed text-white/55 mt-1">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap gap-1.5" aria-label="Tecnologias descritas">
            {selected.stack.map((technology) => (
              <span key={technology} className="px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[10px] font-mono text-white/70">
                {technology}
              </span>
            ))}
          </div>
        </article>

        <aside className="lg:col-span-5 glass-panel rounded-2xl border border-white/15 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#38BDF8]">Decisões e limites</h3>
            <span className="text-[9px] text-white/65 font-mono">FICHA ESTÁTICA</span>
          </div>
          <ul className="space-y-2">
            {selected.architectureHighlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-xs leading-relaxed text-white/75">
                <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5 shrink-0 text-[#38BDF8] mt-0.5" />
                {highlight}
              </li>
            ))}
          </ul>
          <div className="mt-auto rounded-xl border border-[#EA2143]/20 bg-[#EA2143]/[0.05] p-3">
            <span className="font-mono text-[9px] uppercase text-[#EA2143]">Tratamento de falhas descrito</span>
            <p className="text-[11px] leading-relaxed text-white/70 mt-1">{selected.failureHandling}</p>
          </div>
          <p className="text-[10px] leading-relaxed text-white/65">
            Conteúdo e indicadores são descrições do portfólio, não telemetria ao vivo nem evidência independente do sistema original.
          </p>
        </aside>
      </section>
    </div>
  );
}
