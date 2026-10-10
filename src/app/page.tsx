"use client";

import React, { useState } from "react";
import { AntigravityCanvas } from "@/components/canvas/AntigravityCanvas";
import { DriftingCard } from "@/components/cards/DriftingCard";
import { ArchitectureInspector } from "@/components/inspector/ArchitectureInspector";
import { EdgeAgentConsole } from "@/components/console/EdgeAgentConsole";
import { SYSTEMS_DATA, PROFILE_DATA, SystemProject } from "@/data/systems";
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  ExternalLink, 
  Mail, 
  Sparkles, 
  Radio,
  Layers,
  CheckCircle,
  FileText
} from "lucide-react";

export default function Home() {
  const [selectedSystem, setSelectedSystem] = useState<SystemProject | null>(SYSTEMS_DATA[0]);
  const [activeView, setActiveView] = useState<"architecture" | "agent">("architecture");

  return (
    <main className="relative min-h-screen bg-[#07090E] text-[#F8FAFC] selection:bg-[#1856FF]/30 selection:text-white pb-24">
      {/* 1. Eixo Z Negativo: Orbes Neon e Iluminação Ambiente Cósmica */}
      <div className="ambient-glow-primary top-10 -left-20" />
      <div className="ambient-glow-secondary top-40 right-0" />
      <div className="ambient-glow-primary bottom-20 right-1/4 opacity-40" />

      {/* 2. Motor Gráfico: Antigravity Zero-G Particle & Core Canvas */}
      <AntigravityCanvas />

      {/* 3. Top Navigation Bar com Dark Glassmorphism 3.0 */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1856FF] to-[#38BDF8] flex items-center justify-center font-mono font-bold text-sm shadow-[0_0_20px_rgba(24,86,255,0.5)]">
              TR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight">
                  Thadeu Ramos
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#07CA6B]/15 text-[#07CA6B] border border-[#07CA6B]/25">
                  SYS_ONLINE
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Senior Software Engineer • Platform & AI Architecture
              </p>
            </div>
          </div>

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
              className="px-3 py-1.5 rounded-xl bg-[#1856FF] hover:bg-[#1856FF]/90 text-white font-sans font-medium flex items-center gap-1.5 transition-all shadow-md"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Conectar</span>
            </a>
          </div>
        </div>
      </header>

      {/* 4. Hero Section: Manifesto de Impacto e Senioridade */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#38BDF8] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#1856FF]" />
            <span>DISRUPTIVE ENGINEERING • BANCO SAFRA TO EDGE AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Engenharia de Plataforma de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1856FF] via-[#38BDF8] to-white">
              Missão Crítica
            </span>{" "}
            e Sistemas de IA.
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed mb-8">
            Desenho, implementação e sustentação de brokers agnósticos de mensageria para IA sob altíssima volumetria, malhas de segurança corporativa Zero Trust com tokens criptográficos assinados e canais autônomos 100% IA no setor financeiro.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/80">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <ShieldCheck className="w-4 h-4 text-[#07CA6B]" />
              <span>Zero Trust M2M / RBAC AD</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <Layers className="w-4 h-4 text-[#1856FF]" />
              <span>Agnostic AI Messaging Broker</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <Cpu className="w-4 h-4 text-[#38BDF8]" />
              <span>Model Context Protocol (MCP)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Seção Principal: Antigravity UI + Dynamic Inspector / Edge Console */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Sistemas de Alta Complexidade</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#1856FF]/20 text-[#38BDF8] border border-[#1856FF]/30">
                {SYSTEMS_DATA.length} Projetos Ativos
              </span>
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Clique em qualquer sistema para inspecionar fluxos, decisões arquiteturais e telemetria.
            </p>
          </div>

          {/* Toggle de Visualização Superior (Inspetor vs Agente Edge) */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveView("architecture")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeView === "architecture"
                  ? "bg-[#1856FF] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Topologia & Código</span>
            </button>
            <button
              onClick={() => setActiveView("agent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeView === "agent"
                  ? "bg-[#1856FF] text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Agente Edge MCP</span>
            </button>
          </div>
        </div>

        {/* Grid Dual: Drifting Cards à Esquerda & Inspetor / Console à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Drifting Cards em Microgravidade */}
          <div className="lg:col-span-7 space-y-4">
            {SYSTEMS_DATA.map((system, index) => (
              <DriftingCard
                key={system.id}
                system={system}
                index={index}
                isSelected={selectedSystem?.id === system.id}
                onSelect={() => setSelectedSystem(system)}
              />
            ))}
          </div>

          {/* Coluna Direita: Sticky Inspector ou Edge AI Console */}
          <div className="lg:col-span-5 sticky top-24">
            {activeView === "architecture" ? (
              <ArchitectureInspector system={selectedSystem} />
            ) : (
              <EdgeAgentConsole />
            )}
          </div>
        </div>
      </section>

      {/* 6. Footer Técnico de Telemetria e Transparência */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 mt-20">
        <div className="glass-panel-subtle rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/[0.08]">
          <div className="text-xs text-[#94A3B8]">
            <p className="text-white font-medium">Thadeu Castelo Branco Ramos © 2026</p>
            <p className="mt-0.5">Construído com Next.js 16 • React 19 • Dark Glassmorphism 3.0 • Antigravity UI</p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-white/70">
            <span className="flex items-center gap-1 text-[#07CA6B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
              Zero Third-Party Tracking
            </span>
            <span>•</span>
            <span className="text-[#38BDF8]">WebGPU / Canvas Accel</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
