"use client";

import React, { useState } from "react";
import { SpatialZeroGCanvas } from "@/components/spatial/SpatialZeroGCanvas";
import { ArchitectureInspector } from "@/components/inspector/ArchitectureInspector";
import { EdgeAgentConsole } from "@/components/console/EdgeAgentConsole";
import { SYSTEMS_DATA, PROFILE_DATA, SystemProject } from "@/data/systems";
import { 
  ShieldCheck, 
  Cpu, 
  Mail, 
  Sparkles, 
  Layers, 
  Orbit, 
  Grid3X3, 
  Compass, 
  Maximize2,
  X,
  Sliders,
  Terminal as TerminalIcon,
  Activity
} from "lucide-react";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(SYSTEMS_DATA[0].id);
  const [gravityMode, setGravityMode] = useState<"zero-g" | "orbit" | "grid">("zero-g");
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [activeSideTool, setActiveSideTool] = useState<"inspector" | "agent">("inspector");

  const currentSystem = SYSTEMS_DATA.find((s) => s.id === selectedId) || SYSTEMS_DATA[0];

  const handleSelectSystem = (id: string) => {
    setSelectedId(id);
    setIsInspectorOpen(true);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07090E] text-[#F8FAFC] select-none font-sans">
      {/* 1. Eixo Z Negativo: Orbes Neon e Iluminação Ambiente Cósmica */}
      <div className="ambient-glow-primary top-10 left-10 opacity-30" />
      <div className="ambient-glow-secondary bottom-10 right-10 opacity-40" />

      {/* 2. CÂMARA 3D FULLSCREEN: Spatial Zero-G Engine */}
      <SpatialZeroGCanvas
        systems={SYSTEMS_DATA}
        selectedId={selectedId}
        mode={gravityMode}
        onSelectSystem={handleSelectSystem}
      />

      {/* 3. Top HUD: Identidade de Engenharia & Telemetria */}
      <header className="absolute top-6 left-6 right-6 z-40 pointer-events-none flex items-center justify-between">
        <div className="glass-panel pointer-events-auto rounded-2xl px-5 py-3 flex items-center gap-3.5 border border-white/15 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1856FF] to-[#38BDF8] flex items-center justify-center font-mono font-bold text-sm shadow-[0_0_25px_rgba(24,86,255,0.6)]">
            TR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                Thadeu Ramos
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#07CA6B]/20 text-[#07CA6B] border border-[#07CA6B]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
                ZERO-G CHAMBER
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Senior Software Engineer • Platform & AI Architecture (Banco Safra)
            </p>
          </div>
        </div>

        {/* Links Rápidos e Conexão */}
        <div className="glass-panel pointer-events-auto rounded-2xl px-4 py-2 flex items-center gap-3 border border-white/15 text-xs font-mono">
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
            className="px-3 py-1.5 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 text-white font-sans font-medium flex items-center gap-1.5 transition-all shadow-md"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Conectar</span>
          </a>
        </div>
      </header>

      {/* 4. Crosshair Central e Guia de Interação Tátil */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center text-center">
        {!isInspectorOpen && (
          <div className="glass-panel-subtle px-4 py-2 rounded-full border border-white/10 text-xs font-mono text-white/70 animate-pulse">
            ✦ Mova o cursor para deformar o campo gravitacional • Clique em um monolito 3D para inspecionar a arquitetura
          </div>
        )}
      </div>

      {/* 5. DOCK DE COMANDO ORBITAL (Inferior Central) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <div className="glass-panel rounded-2xl p-2 flex items-center gap-2 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {/* Seletor de Modo de Física Antigravitacional */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setGravityMode("zero-g")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                gravityMode === "zero-g"
                  ? "bg-[#1856FF] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
              title="Flutuação livre em microgravidade"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Zero-G Drift</span>
            </button>
            <button
              onClick={() => setGravityMode("orbit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                gravityMode === "orbit"
                  ? "bg-[#1856FF] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
              title="Alinhamento em anel orbital harmônico"
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Orbital Ring</span>
            </button>
            <button
              onClick={() => setGravityMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                gravityMode === "grid"
                  ? "bg-[#1856FF] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
              title="Matriz cinética precisa"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Kinetic Grid</span>
            </button>
          </div>

          <div className="w-[1px] h-6 bg-white/10" />

          {/* Botões de Abertura do Inspetor e Agente Edge */}
          <button
            onClick={() => {
              setActiveSideTool("inspector");
              setIsInspectorOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all border ${
              isInspectorOpen && activeSideTool === "inspector"
                ? "bg-[#1856FF] text-white border-[#1856FF]"
                : "bg-white/[0.04] text-white/80 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Inspetor de Sistemas</span>
          </button>

          <button
            onClick={() => {
              setActiveSideTool("agent");
              setIsInspectorOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all border ${
              isInspectorOpen && activeSideTool === "agent"
                ? "bg-[#1856FF] text-white border-[#1856FF]"
                : "bg-white/[0.04] text-white/80 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#07CA6B]" />
            <span>Agente Edge MCP</span>
          </button>
        </div>
      </div>

      {/* 6. OVERLAY CINEMÁTICO: Painel Holográfico Lateral (Dark Glassmorphism 3.0) */}
      {isInspectorOpen && (
        <aside className="absolute top-20 right-6 bottom-20 w-[480px] max-w-[calc(100vw-3rem)] z-50 animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="relative h-full flex flex-col">
            {/* Botão de Fechamento do Painel */}
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="absolute -top-3 -left-3 z-50 p-2 rounded-full bg-black/80 hover:bg-black text-white/80 hover:text-white border border-white/20 shadow-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Alternância Dinâmica entre Inspetor e Agente MCP */}
            {activeSideTool === "inspector" ? (
              <ArchitectureInspector system={currentSystem} onClose={() => setIsInspectorOpen(false)} />
            ) : (
              <EdgeAgentConsole />
            )}
          </div>
        </aside>
      )}

      {/* 7. HUD de Status Inferior Esquerdo */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none hidden md:block">
        <div className="glass-panel-subtle rounded-xl px-4 py-2 border border-white/10 font-mono text-[11px] text-white/60 space-y-0.5">
          <div className="flex items-center gap-2 text-white/90">
            <span className="w-2 h-2 rounded-full bg-[#07CA6B] animate-ping" />
            <span>SISTEMA ATIVO: {currentSystem.codename}</span>
          </div>
          <div>FPS: 60 • Three.js WebGL/WebGPU Pipeline • Zero DOM Bloat</div>
        </div>
      </div>
    </main>
  );
}
