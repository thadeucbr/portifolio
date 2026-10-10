"use client";

import React, { useState, useEffect } from "react";
import { NeuralMissionHero } from "@/components/neural/NeuralMissionHero";
import { SynapticNeuralMesh } from "@/components/neural/SynapticNeuralMesh";
import { ModeKineticGrid } from "@/components/modes/ModeKineticGrid";
import { SystemResilienceWorkbench } from "@/components/workbench/SystemResilienceWorkbench";
import { ZeroTrustDlpInspector } from "@/components/security/ZeroTrustDlpInspector";
import { RecruiterDossierView } from "@/components/dossier/RecruiterDossierView";
import { EdgeAgentConsole } from "@/components/console/EdgeAgentConsole";
import { PROFILE_DATA } from "@/data/systems";
import { 
  Network, 
  Grid3X3, 
  Activity, 
  ShieldCheck, 
  FileCheck, 
  Cpu, 
  Mail, 
  Layers
} from "lucide-react";

type StageMode = "hero" | "systems" | "resilience" | "security" | "agent" | "dossier";

export default function Home() {
  const [currentStage, setCurrentStage] = useState<StageMode>("hero");

  // Teclas de atalho para alternar rapidamente entre as ferramentas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") setCurrentStage("hero");
      if (e.key === "2") setCurrentStage("systems");
      if (e.key === "3") setCurrentStage("resilience");
      if (e.key === "4") setCurrentStage("security");
      if (e.key === "5") setCurrentStage("agent");
      if (e.key === "6") setCurrentStage("dossier");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#060810] text-[#F8FAFC] select-none font-sans flex flex-col justify-between">
      {/* 1. Eixo Z Negativo: Luzes Neon Ambientais Sutis (Electric Blue & Cyan) */}
      <div className={`ambient-glow-primary top-10 -left-20 transition-all duration-700 ${
        currentStage === "security" ? "scale-125 opacity-35 bg-[#07CA6B]/20" : "opacity-20"
      }`} />
      <div className="ambient-glow-secondary top-40 right-0 opacity-25" />
      <div className="ambient-glow-primary bottom-10 right-1/4 opacity-20" />

      {/* 2. Motor Visual Sináptico de IA: Neurônios, Axônios e Potenciais de Ação Dinâmicos */}
      <SynapticNeuralMesh />

      {/* 3. Top HUD: Identidade de Engenharia & Telemetria */}
      <header className="relative z-40 px-6 pt-4 shrink-0">
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-5 py-3 flex items-center justify-between border border-white/15 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1856FF] to-[#38BDF8] flex items-center justify-center font-mono font-bold text-xs shadow-[0_0_20px_rgba(24,86,255,0.6)]">
              TR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight">
                  Thadeu Castelo Branco Ramos
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#07CA6B]/20 text-[#07CA6B] border border-[#07CA6B]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
                  SYNAPTIC CORE ONLINE
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Senior Software Engineer • Backend & AI Systems Architecture (Banco Safra)
              </p>
            </div>
          </div>

          {/* Socials & Contato */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <a
              href={PROFILE_DATA.contact.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href={PROFILE_DATA.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <a
              href={`mailto:${PROFILE_DATA.contact.email}`}
              className="px-3.5 py-1.5 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 text-white font-sans font-medium flex items-center gap-1.5 transition-all shadow-md"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Conectar</span>
            </a>
          </div>
        </div>
      </header>

      {/* 4. PALCO DE ENGENHARIA DE UTILIDADE REAL (Recipiente Mutável 100vh) */}
      <section className="relative z-30 flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 my-auto flex items-center justify-center">
        {currentStage === "hero" && (
          <NeuralMissionHero
            onGoToSystems={() => setCurrentStage("systems")}
            onGoToResilience={() => setCurrentStage("resilience")}
            onGoToSecurity={() => setCurrentStage("security")}
          />
        )}

        {currentStage === "systems" && (
          <ModeKineticGrid />
        )}

        {currentStage === "resilience" && (
          <SystemResilienceWorkbench />
        )}

        {currentStage === "security" && (
          <ZeroTrustDlpInspector />
        )}

        {currentStage === "agent" && (
          <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-500">
            <EdgeAgentConsole />
          </div>
        )}

        {currentStage === "dossier" && (
          <RecruiterDossierView />
        )}
      </section>

      {/* 5. DOCK ORBITAL DE COMANDO DAS FERRAMENTAS DE IA E ENGENHARIA */}
      <footer className="relative z-40 px-6 pb-4 shrink-0 no-print">
        <div className="max-w-fit mx-auto glass-panel rounded-2xl p-2 flex items-center gap-1.5 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] font-mono text-xs">
          <button
            onClick={() => setCurrentStage("hero")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStage === "hero"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)] font-semibold"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>1. Core Sináptico</span>
          </button>

          <button
            onClick={() => setCurrentStage("systems")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStage === "systems"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)] font-semibold"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>2. Sistemas</span>
          </button>

          <button
            onClick={() => setCurrentStage("resilience")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStage === "resilience"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)] font-semibold"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Teste de Falhas</span>
          </button>

          <button
            onClick={() => setCurrentStage("security")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStage === "security"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)] font-semibold"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#07CA6B]" />
            <span>4. Zero Trust & DLP</span>
          </button>

          <button
            onClick={() => setCurrentStage("agent")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStage === "agent"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)] font-semibold"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>5. Edge IA (MCP)</span>
          </button>

          <button
            onClick={() => setCurrentStage("dossier")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStage === "dossier"
                ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] font-semibold"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>6. Dossiê Executivo</span>
          </button>

          <div className="w-[1px] h-5 bg-white/10 hidden sm:block mx-1" />

          <div className="hidden sm:flex items-center text-[10px] font-mono text-white/40 px-2">
            Teclas 1 a 6
          </div>
        </div>
      </footer>
    </main>
  );
}
