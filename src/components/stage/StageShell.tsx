"use client";

import React, { startTransition, useEffect, useState, ViewTransition, addTransitionType } from "react";
import { Network, Grid3X3, Activity, ShieldCheck, FileCheck, Cpu } from "lucide-react";
import { NeuralMissionHero } from "@/components/neural/NeuralMissionHero";
import { ModeKineticGrid } from "@/components/modes/ModeKineticGrid";
import { SystemResilienceWorkbench } from "@/components/workbench/SystemResilienceWorkbench";
import { ZeroTrustDlpInspector } from "@/components/security/ZeroTrustDlpInspector";
import { RecruiterDossierView } from "@/components/dossier/RecruiterDossierView";
import { EdgeAgentConsole } from "@/components/console/EdgeAgentConsole";

const STAGES = [
  { id: "hero", label: "Core", icon: Network, tint: "text-[#38BDF8]" },
  { id: "systems", label: "Sistemas", icon: Grid3X3, tint: "" },
  { id: "resilience", label: "Teste de Falhas", icon: Activity, tint: "text-amber-400" },
  { id: "security", label: "Zero Trust & DLP", icon: ShieldCheck, tint: "text-[#07CA6B]" },
  { id: "agent", label: "Agente Edge (MCP)", icon: Cpu, tint: "text-[#38BDF8]" },
  { id: "dossier", label: "Dossiê", icon: FileCheck, tint: "text-purple-300" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

/**
 * Recipiente mutável (guideline linha 3) com transições nativas (linhas 93-95, 134-137).
 * A troca de estágio roda dentro de startTransition, o que ativa <ViewTransition>;
 * a direção (avançar/voltar) é codificada com addTransitionType.
 */
export function StageShell() {
  const [stage, setStage] = useState<StageId>("hero");

  const go = (next: StageId) => {
    if (next === stage) return;
    const dir = STAGES.findIndex((s) => s.id === next) > STAGES.findIndex((s) => s.id === stage) ? "nav-forward" : "nav-back";
    startTransition(() => {
      addTransitionType(dir);
      setStage(next);
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < STAGES.length) go(STAGES[idx].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <section className="relative z-30 flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 my-auto flex items-center justify-center">
        <ViewTransition
          key={stage}
          name="stage"
          enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
          exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
          default="none"
        >
          <div className="w-full h-full flex items-center justify-center">
            {stage === "hero" && (
              <NeuralMissionHero
                onGoToSystems={() => go("systems")}
                onGoToResilience={() => go("resilience")}
                onGoToSecurity={() => go("security")}
              />
            )}
            {stage === "systems" && <ModeKineticGrid />}
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

      <footer className="relative z-40 px-6 pb-4 shrink-0 no-print" style={{ viewTransitionName: "dock" }}>
        <nav className="max-w-fit mx-auto glass-panel rounded-2xl p-2 flex items-center gap-1.5 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] font-mono text-xs">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const active = stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                  active
                    ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)] font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "" : s.tint}`} />
                <span>
                  {i + 1}. {s.label}
                </span>
              </button>
            );
          })}
          <div className="w-px h-5 bg-white/10 hidden sm:block mx-1" />
          <span className="hidden sm:flex text-[10px] text-white/40 px-2">Teclas 1–6</span>
        </nav>
      </footer>
    </>
  );
}
