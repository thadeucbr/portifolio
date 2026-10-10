"use client";

import { startTransition, useCallback, useEffect, useState, ViewTransition, addTransitionType } from "react";
import { Activity, FileCheck, Grid3X3, Network, ShieldCheck, Cpu } from "lucide-react";
import { NeuralMissionHero } from "@/components/neural/NeuralMissionHero";
import { ProjectAtlas } from "@/components/projects/ProjectAtlas";
import { SystemResilienceWorkbench } from "@/components/workbench/SystemResilienceWorkbench";
import { ZeroTrustDlpInspector } from "@/components/security/ZeroTrustDlpInspector";
import { RecruiterDossierView } from "@/components/dossier/RecruiterDossierView";
import { EdgeAgentConsole } from "@/components/console/EdgeAgentConsole";
import { stageForShortcut, transitionDirection, type StageId } from "./stageNavigation.mjs";

const STAGES = [
  { id: "hero", label: "Core", icon: Network, tint: "text-[#38BDF8]" },
  { id: "systems", label: "Sistemas", icon: Grid3X3, tint: "" },
  { id: "resilience", label: "Resiliência", icon: Activity, tint: "text-amber-400" },
  { id: "security", label: "Zero Trust & DLP", icon: ShieldCheck, tint: "text-[#07CA6B]" },
  { id: "agent", label: "Agente Edge", icon: Cpu, tint: "text-[#38BDF8]" },
  { id: "dossier", label: "Dossiê", icon: FileCheck, tint: "text-purple-300" },
] as const;

/**
 * Palco navegável do portfólio: as mesmas telas agora usam ViewTransition na rota ativa.
 * Atalhos numéricos são desativados enquanto o foco estiver em um campo editável.
 */
export function StageShell() {
  const [stage, setStage] = useState<StageId>("hero");

  const go = useCallback((next: StageId) => {
    const direction = transitionDirection(stage, next);
    if (!direction) return;

    startTransition(() => {
      addTransitionType(direction);
      setStage(next);
    });
  }, [stage]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const editing = target instanceof HTMLElement && Boolean(
        target.closest("input, textarea, select, [contenteditable='true']"),
      );
      const next = stageForShortcut(event.key, editing);
      if (next) go(next);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <>
      <section className="relative z-30 flex-1 min-h-[min(72vh,720px)] max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 flex items-center justify-center" aria-label="Experiências do portfólio">
        <ViewTransition
          key={stage}
          name="stage-content"
          enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
          exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
          default="none"
        >
          <div className="w-full min-h-[min(68vh,680px)] flex items-center justify-center">
            {stage === "hero" && (
              <NeuralMissionHero
                onGoToSystems={() => go("systems")}
                onGoToResilience={() => go("resilience")}
                onGoToSecurity={() => go("security")}
              />
            )}
            {stage === "systems" && <ProjectAtlas />}
            {stage === "resilience" && <SystemResilienceWorkbench />}
            {stage === "security" && <ZeroTrustDlpInspector />}
            {stage === "agent" && (
              <div className="w-full max-w-3xl">
                <EdgeAgentConsole />
              </div>
            )}
            {stage === "dossier" && <RecruiterDossierView />}
          </div>
        </ViewTransition>
      </section>

      <footer className="relative z-40 px-3 sm:px-6 pb-4 no-print">
        <nav aria-label="Navegação principal do portfólio" className="max-w-full mx-auto overflow-x-auto glass-panel rounded-2xl p-2 flex items-center gap-1.5 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] font-sans text-xs">
          {STAGES.map((item, index) => {
            const Icon = item.icon;
            const active = stage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                aria-label={`${index + 1}. ${item.label}`}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                  active
                    ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)] font-semibold"
                    : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon aria-hidden="true" className={`w-3.5 h-3.5 ${active ? "" : item.tint}`} />
                <span className="sm:hidden">{index + 1}</span>
                <span className="hidden sm:inline">{index + 1}. {item.label}</span>
              </button>
            );
          })}
          <span className="hidden md:flex shrink-0 font-mono text-[10px] text-white/65 px-2">Atalhos 1–6</span>
        </nav>
      </footer>
    </>
  );
}
