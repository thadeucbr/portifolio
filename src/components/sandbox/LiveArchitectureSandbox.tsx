"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Zap } from "lucide-react";
import { SYSTEMS_DATA } from "@/data/systems";
import { buildProjectSimulationEvents } from "@/components/inspector/projectSimulation.mjs";

export function LiveArchitectureSandbox() {
  const projects = SYSTEMS_DATA;
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const runId = useRef(0);
  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const events = useMemo(() => buildProjectSimulationEvents(project), [project]);

  useEffect(() => () => { runId.current += 1; }, []);

  const startDemo = () => {
    if (isRunning) return;
    const run = ++runId.current;
    setIsRunning(true);
    setActiveStep(0);
    setLogs([events[0]]);

    project.executionFlow.forEach((_stage, index) => {
      setTimeout(() => {
        if (runId.current !== run) return;
        setActiveStep(index + 1);
        setLogs((previous) => [...previous, events[index + 1]]);
      }, 550 * (index + 1));
    });
    setTimeout(() => {
      if (runId.current !== run) return;
      setLogs((previous) => [...previous, events.at(-1) ?? "Demonstração encerrada."]);
      setIsRunning(false);
    }, 550 * (project.executionFlow.length + 1));
  };

  const resetDemo = () => {
    runId.current += 1;
    setIsRunning(false);
    setActiveStep(0);
    setLogs([]);
  };

  if (!project) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/20 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.6)] sm:p-8">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#1856FF]/15 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#38BDF8]">Demonstração local · experiências profissionais</div>
            <h2 className="mt-1 text-lg font-bold text-white">Visão conceitual dos projetos</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/55">Não conecta a sistemas internos, não transmite payloads e não mostra métricas ou telemetria de produção.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startDemo} disabled={isRunning} className="flex items-center gap-2 rounded-xl bg-[#1856FF] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
              <Play className="h-3.5 w-3.5 fill-current" /> Percorrer resumo
            </button>
            <button onClick={resetDemo} className="rounded-xl border border-white/10 p-2 text-white/60" aria-label="Reiniciar demonstração">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2" aria-label="Selecionar experiência">
          {projects.map((item) => (
            <button key={item.id} onClick={() => { resetDemo(); setProjectId(item.id); }} className={`rounded-lg border px-3 py-1.5 text-[10px] ${item.id === project.id ? "border-[#1856FF]/60 bg-[#1856FF]/15 text-white" : "border-white/10 bg-black/20 text-white/60"}`}>
              {item.title}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-3 text-xs leading-relaxed text-amber-100/70">
          Os cartões abaixo ilustram os projetos; não são um diagrama aprovado da arquitetura interna.
        </div>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Tópicos do resumo selecionado">
          {project.executionFlow.map((step, index) => (
            <li key={step.step} className={`rounded-2xl border p-4 transition-colors ${activeStep > index ? "border-[#1856FF]/70 bg-[#1856FF]/10" : "border-white/10 bg-white/[0.03]"}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase text-[#38BDF8]">{String(index + 1).padStart(2, "0")} · {step.step}</span>
                <Zap className="h-3.5 w-3.5 text-white/35" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/70">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-xs" aria-live="polite">
          {logs.length ? logs.map((line, index) => <p key={`${index}-${line}`} className="leading-relaxed text-white/70">› {line}</p>) : <p className="py-3 text-center text-white/35">Nenhuma etapa executada. A demonstração é puramente local.</p>}
        </div>
      </div>
    </section>
  );
}
