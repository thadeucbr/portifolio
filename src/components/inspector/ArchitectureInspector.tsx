"use client";

import React, { useState } from "react";
import { SystemProject } from "@/data/systems";
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Network,
  Share2,
  Lock,
  ArrowRight,
  Zap
} from "lucide-react";
import { PipelineSimulator } from "./PipelineSimulator";

interface ArchitectureInspectorProps {
  system: SystemProject | null;
  onClose?: () => void;
}

export function ArchitectureInspector({ system, onClose }: ArchitectureInspectorProps) {
  const [activeTab, setActiveTab] = useState<"topology" | "simulator" | "highlights" | "telemetry">("topology");

  if (!system) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[520px] border border-white/10">
        <Network className="w-12 h-12 text-[#1856FF]/40 mb-3 animate-pulse" />
        <h3 className="text-base font-medium text-white/80 mb-1">
          Nenhum Sistema Selecionado
        </h3>
        <p className="text-xs text-[#94A3B8] max-w-xs leading-relaxed">
          Clique em qualquer um dos cartões flutuantes na câmara antigravidade para inspecionar a topologia e a telemetria do sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden flex flex-col h-full transition-all">
      {/* Top Header do Inspetor */}
      <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#07CA6B] animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase text-[#38BDF8] tracking-wider">
                {system.codename} // INSPECTOR
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/60 font-mono">
                {system.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {system.title}
            </h2>
          </div>
        </div>

        {/* Abas de Navegação do Inspetor */}
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("topology")}
            className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${
              activeTab === "topology"
                ? "bg-[#1856FF] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Topologia
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${
              activeTab === "simulator"
                ? "bg-[#1856FF] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Simulador
          </button>
          <button
            onClick={() => setActiveTab("highlights")}
            className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${
              activeTab === "highlights"
                ? "bg-[#1856FF] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Destaques
          </button>
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${
              activeTab === "telemetry"
                ? "bg-[#1856FF] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Telemetria
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico Baseado na Aba */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {activeTab === "topology" && (
          <div className="space-y-4">
            <div className="text-xs text-[#94A3B8] flex items-center justify-between">
              <span className="font-mono uppercase text-[#38BDF8]">
                Diagrama de Fluxo & Decoupling
              </span>
              <span className="font-mono text-[11px] text-white/50">
                Resiliência Garantida: 99.99%
              </span>
            </div>

            {/* Simulação Visual de Pipeline de Arquitetura (Architecture as Code) */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#1856FF]/20 text-[#38BDF8] border border-[#1856FF]/40">
                  INPUT
                </span>
                <span className="text-white/80">Canais de Entrada: WhatsApp, Telegram & Enterprise Webhooks</span>
              </div>
              <div className="pl-6 text-[#1856FF]">↓ [Zero Data Leakage Validation via DLP / Sentinel]</div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ROUTER
                </span>
                <span className="text-white/80">Broker Agnóstico de Mensageria (Buffer Desacoplado)</span>
              </div>
              <div className="pl-6 text-purple-400">↓ [Token Criptográfico M2M Assinado + RBAC via Active Directory]</div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#07CA6B]/20 text-[#07CA6B] border border-[#07CA6B]/40">
                  DISPATCH
                </span>
                <span className="text-white/80">Model Context Protocol (MCP) + Ferramental Dinâmico</span>
              </div>
              <div className="pl-6 text-[#07CA6B]">↓ [Execução de Modelos de IA & Callbacks Assíncronos]</div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  OUTPUT
                </span>
                <span className="text-white/80">Resposta Transacional Segura & Baixa Latência</span>
              </div>
            </div>

            {/* Resumo de Valor */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2 font-mono">
                Por que este design é disruptivo:
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Em vez de acoplar diretamente APIs de terceiros aos modelos, esta arquitetura garante que a queda de qualquer canal não degrade o ecossistema de inteligência e viabiliza governança com auditoria contínua e não-repúdio.
              </p>
            </div>
          </div>
        )}

        {activeTab === "simulator" && (
          <PipelineSimulator system={system} />
        )}

        {activeTab === "highlights" && (
          <div className="space-y-3">
            <div className="text-xs text-[#94A3B8] font-mono uppercase text-[#38BDF8]">
              Decisões Críticas de Engenharia
            </div>
            <div className="grid gap-2.5">
              {system.architectureHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#07CA6B] shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90 leading-relaxed font-sans">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-xs text-[#94A3B8] font-mono uppercase text-[#38BDF8] block mb-2">
                Stack de Tecnologias Empregada
              </span>
              <div className="flex flex-wrap gap-2">
                {system.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white/90"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "telemetry" && (
          <div className="space-y-4 font-mono">
            <div className="text-xs text-[#94A3B8] uppercase text-[#38BDF8]">
              Indicadores de Performance e Segurança
            </div>
            <div className="grid grid-cols-2 gap-3">
              {system.metrics.map((m, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-black/40 border border-white/[0.08]"
                >
                  <div className="text-[11px] text-[#94A3B8] mb-1">{m.label}</div>
                  <div className="text-lg font-bold text-white">{m.value}</div>
                </div>
              ))}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="text-[11px] text-[#94A3B8] mb-1">Impacto Organizacional</div>
                <div className="text-xs font-semibold text-[#07CA6B] mt-1">
                  {system.organization} • Produção Ativa
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="text-[11px] text-[#94A3B8] mb-1">Status Criptográfico</div>
                <div className="text-xs font-semibold text-[#38BDF8] mt-1">
                  Validação Ativa (Zero Trust)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
