"use client";

import React, { useState, useEffect } from "react";
import { ModeArchitect } from "@/components/modes/ModeArchitect";
import { ModeKineticGrid } from "@/components/modes/ModeKineticGrid";
import { LiveArchitectureSandbox } from "@/components/sandbox/LiveArchitectureSandbox";
import { EdgeAgentConsole } from "@/components/console/EdgeAgentConsole";
import { AntigravityCanvas } from "@/components/canvas/AntigravityCanvas";
import { PROFILE_DATA } from "@/data/systems";
import { 
  Compass, 
  Grid3X3, 
  Activity, 
  Cpu, 
  Terminal, 
  Layers, 
  Share2, 
  Mail, 
  Maximize2,
  Sparkles
} from "lucide-react";

type StageMode = "architect" | "grid" | "cockpit" | "agent";

export default function Home() {
  const [currentMode, setCurrentMode] = useState<StageMode>("architect");

  // Teclas de atalho para alternar modos cinematográficos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") setCurrentMode("architect");
      if (e.key === "2") setCurrentMode("grid");
      if (e.key === "3") setCurrentMode("cockpit");
      if (e.key === "4") setCurrentMode("agent");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07090E] text-[#F8FAFC] select-none font-sans flex flex-col justify-between">
      {/* 1. Eixo Z Negativo: Orbes Neon e Iluminação Ambiente Cósmica */}
      <div className={`ambient-glow-primary top-10 -left-20 transition-all duration-700 ${
        currentMode === "cockpit" ? "scale-125 opacity-40 bg-[#07CA6B]/20" : "opacity-25"
      }`} />
      <div className="ambient-glow-secondary top-40 right-0 opacity-30" />
      <div className="ambient-glow-primary bottom-10 right-1/4 opacity-25" />

      {/* 2. Motor Gráfico Antigravity de Microgravidade (Canvas Desacoplado) */}
      <AntigravityCanvas />

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
                  Thadeu Ramos
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#07CA6B]/20 text-[#07CA6B] border border-[#07CA6B]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
                  RECIPIENTE MUTÁVEL // 100VH
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Senior Software Engineer • Platform & AI Architecture (Banco Safra)
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

      {/* 4. PALCO CINEMÁTICO PRINCIPAL (Recipiente Mutável sem Scroll Monótono) */}
      <section className="relative z-30 flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 my-auto flex items-center justify-center">
        {currentMode === "architect" && (
          <ModeArchitect
            onExploreGrid={() => setCurrentMode("grid")}
            onLaunchPipeline={() => setCurrentMode("cockpit")}
          />
        )}

        {currentMode === "grid" && (
          <ModeKineticGrid />
        )}

        {currentMode === "cockpit" && (
          <div className="w-full max-h-[82vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
            <LiveArchitectureSandbox />
          </div>
        )}

        {currentMode === "agent" && (
          <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-500">
            <EdgeAgentConsole />
          </div>
        )}
      </section>

      {/* 5. DOCK DE COMANDO ORBITAL (Navegação Cinemática de Modos) */}
      <footer className="relative z-40 px-6 pb-4 shrink-0">
        <div className="max-w-fit mx-auto glass-panel rounded-2xl p-2 flex items-center gap-2 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <button
            onClick={() => setCurrentMode("architect")}
            className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              currentMode === "architect"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)]"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. O Arquiteto</span>
          </button>

          <button
            onClick={() => setCurrentMode("grid")}
            className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              currentMode === "grid"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)]"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>2. Kinetic Grid</span>
          </button>

          <button
            onClick={() => setCurrentMode("cockpit")}
            className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              currentMode === "cockpit"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)]"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#07CA6B]" />
            <span>3. Sandbox Cockpit</span>
          </button>

          <button
            onClick={() => setCurrentMode("agent")}
            className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              currentMode === "agent"
                ? "bg-[#1856FF] text-white shadow-[0_0_20px_rgba(24,86,255,0.5)]"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>4. Edge MCP</span>
          </button>

          <div className="w-[1px] h-5 bg-white/10 hidden sm:block mx-1" />

          <div className="hidden sm:flex items-center text-[10px] font-mono text-white/40 px-2">
            Pressione 1, 2, 3 ou 4
          </div>
        </div>
      </footer>
    </main>
  );
}
