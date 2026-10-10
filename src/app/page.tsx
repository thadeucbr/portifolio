"use client";

import React, { useState } from "react";
import { AntigravityCanvas } from "@/components/canvas/AntigravityCanvas";
import { InteractiveDriftingDeck } from "@/components/cards/InteractiveDriftingDeck";
import { LiveArchitectureSandbox } from "@/components/sandbox/LiveArchitectureSandbox";
import { ArchitectureInspector } from "@/components/inspector/ArchitectureInspector";
import { EdgeAgentConsole } from "@/components/console/EdgeAgentConsole";
import { SYSTEMS_DATA, PROFILE_DATA, SystemProject } from "@/data/systems";
import { 
  ShieldCheck, 
  Cpu, 
  Mail, 
  Sparkles, 
  Layers, 
  Terminal as TerminalIcon,
  Activity,
  ArrowRight,
  ExternalLink,
  Code2,
  CheckCircle,
  X
} from "lucide-react";

export default function Home() {
  const [selectedSystem, setSelectedSystem] = useState<SystemProject | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"sandbox" | "agent">("sandbox");

  return (
    <main className="relative min-h-screen bg-[#07090E] text-[#F8FAFC] selection:bg-[#1856FF]/30 selection:text-white pb-24 overflow-x-hidden font-sans">
      {/* 1. Eixo Z Negativo: Orbes Neon e Iluminação Ambiente Cósmica */}
      <div className="ambient-glow-primary top-10 -left-20" />
      <div className="ambient-glow-secondary top-48 right-0" />
      <div className="ambient-glow-primary bottom-32 left-1/3 opacity-30" />

      {/* 2. Motor Gráfico Antigravity de Fundo (Partículas Quânticas & Micro-gravidade) */}
      <AntigravityCanvas />

      {/* 3. Top Navigation Bar com Dark Glassmorphism 3.0 */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-2xl border border-white/15">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1856FF] to-[#38BDF8] flex items-center justify-center font-mono font-bold text-sm shadow-[0_0_20px_rgba(24,86,255,0.6)]">
              TR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight">
                  Thadeu Castelo Branco Ramos
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#07CA6B]/20 text-[#07CA6B] border border-[#07CA6B]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
                  SR_PLATFORM
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Senior Software Engineer • Backend & AI Systems Architecture
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

      {/* 4. HERO SECTION: Identidade Disruptiva e Senioridade Bancária */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#38BDF8] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#1856FF]" />
            <span>DISRUPTIVE PLATFORM ARCHITECTURE • BANCO SAFRA</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Engenharia de Plataformas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1856FF] via-[#38BDF8] to-white">
              Zero Trust
            </span>{" "}
            e Sistemas de IA em Alta Volumetria.
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed mb-8">
            Concepção e sustentação de brokers agnósticos de mensageria para Inteligência Artificial, malhas de segurança máquina-a-máquina com tokens criptográficos assinados e canal autônomo 100% IA para o PIX no setor financeiro.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/80">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#07CA6B]" />
              <span>Zero Trust M2M / Active Directory</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <Layers className="w-4 h-4 text-[#1856FF]" />
              <span>Agnostic AI Messaging Broker</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Edge AI & Model Context Protocol (MCP)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEÇÃO DO SANDBOX INTERATIVO COM TRANSMISSÃO DE FIBRA ÓPTICA EM TEMPO REAL */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <LiveArchitectureSandbox />
      </section>

      {/* 6. SEÇÃO DOS DRIFTING CARDS (DARK GLASSMORPHISM 3.0 & SPRING REACTION) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase text-[#38BDF8]">
                SISTEMAS DE ALTA SENIORIDADE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Drifting Systems Deck (Física Óptica & Microgravidade)
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Aproxime o cursor para sentir a física vetorial dos cartões ou clique para inspecionar decisões arquiteturais.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/60">
            <span className="w-2 h-2 rounded-full bg-[#07CA6B]" />
            <span>5 Projetos Reais Validados</span>
          </div>
        </div>

        {/* Deck de Cartões Táteis */}
        <InteractiveDriftingDeck
          systems={SYSTEMS_DATA}
          selectedId={selectedSystem?.id || ""}
          onSelect={(system) => setSelectedSystem(system)}
        />
      </section>

      {/* 7. CONSOLE DE INTELIGÊNCIA ARTIFICIAL ON-DEVICE (MCP AGENT) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="mb-4">
          <span className="font-mono text-xs uppercase text-[#38BDF8]">
            EDGE COMPUTING PRIVACY-FIRST
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Console de Agente Autônomo Local (MCP Tools)
          </h2>
        </div>
        <EdgeAgentConsole />
      </section>

      {/* 8. MODAL HOLOGRÁFICO DE INSPEÇÃO DE ARQUITETURA QUANDO UM CARD É CLICADO */}
      {selectedSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl h-[600px] max-h-[90vh]">
            <button
              onClick={() => setSelectedSystem(null)}
              className="absolute -top-3 -right-3 z-50 p-2.5 rounded-full bg-black/90 hover:bg-black text-white/80 hover:text-white border border-white/20 shadow-2xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <ArchitectureInspector
              system={selectedSystem}
              onClose={() => setSelectedSystem(null)}
            />
          </div>
        </div>
      )}

      {/* 9. RODAPÉ DE TELEMETRIA */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 mt-16">
        <div className="glass-panel-subtle rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
          <div className="text-xs text-[#94A3B8]">
            <p className="text-white font-medium">Thadeu Castelo Branco Ramos © 2026</p>
            <p className="mt-0.5">Construído com Next.js 16 • React 19 • Dark Glassmorphism 3.0 • Transformers.js MCP</p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-white/70">
            <span className="flex items-center gap-1 text-[#07CA6B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
              Zero Third-Party Tracking
            </span>
            <span>•</span>
            <span className="text-[#38BDF8]">WASM / WebGPU Ready</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
