"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SystemProject } from "@/data/systems";
import { Play, RotateCcw, Zap } from "lucide-react";
import { buildProjectSimulationEvents } from "./projectSimulation.mjs";

interface PipelineSimulatorProps {
  system: SystemProject;
}

export function PipelineSimulator({ system }: PipelineSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const runId = useRef(0);
  const events = useMemo(() => buildProjectSimulationEvents(system), [system]);

  useEffect(() => () => { runId.current += 1; }, []);

  const runSimulation = () => {
    if (isRunning) return;
    const run = ++runId.current;
    const stages = system.executionFlow;
    setIsRunning(true);
    setCurrentStep(0);
    setLogs([events[0]]);

    stages.forEach((_stage, index) => {
      setTimeout(() => {
        if (runId.current !== run) return;
        setCurrentStep(index + 1);
        setLogs((previous) => [...previous, events[index + 1]]);
      }, 650 * (index + 1));
    });

    setTimeout(() => {
      if (runId.current !== run) return;
      setLogs((previous) => [...previous, events.at(-1) ?? "Demonstração finalizada."]);
      setIsRunning(false);
    }, 650 * (stages.length + 1));
  };

  const resetSimulation = () => {
    runId.current += 1;
    setIsRunning(false);
    setCurrentStep(0);
    setLogs([]);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#38BDF8]" />
          <span className="font-semibold text-white">Demonstração conceitual local</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all ${isRunning ? "cursor-not-allowed bg-white/10 text-white/40" : "cursor-pointer bg-[#1856FF] text-white shadow-md hover:bg-[#1856FF]/90"}`}
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Executar etapas</span>
          </button>
          <button onClick={resetSimulation} className="rounded-lg bg-white/5 p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white" title="Reiniciar demonstração">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-2 text-[10px] leading-relaxed text-amber-100/70">
        Esta animação é uma demonstração local; não chama sistemas internos, não envia payloads e não mede tempos ou resultados.
      </p>

      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Etapas conceituais da demonstração">
        {system.executionFlow.map((stage, index) => (
          <li key={stage.step} className={`rounded-xl border p-3 transition-colors ${currentStep > index ? "border-[#1856FF]/70 bg-[#1856FF]/10 text-white" : "border-white/10 bg-black/30 text-white/50"}`}>
            <div className="text-[10px] font-bold uppercase">{String(index + 1).padStart(2, "0")} · {stage.step}</div>
            <div className="mt-1 text-[11px] leading-relaxed">{stage.title}</div>
          </li>
        ))}
      </ol>

      <div className="h-40 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/60 p-3.5" aria-live="polite">
        {logs.length === 0 ? (
          <div className="py-8 text-center italic text-white/35">Execute a demonstração para percorrer as etapas conceituais deste projeto.</div>
        ) : logs.map((log, index) => (
          <div key={`${index}-${log}`} className="leading-relaxed text-white/80">
            <span className="text-[#38BDF8]">›</span> {log}
          </div>
        ))}
      </div>
    </div>
  );
}
