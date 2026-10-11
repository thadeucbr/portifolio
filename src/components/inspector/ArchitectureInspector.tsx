"use client";

import React, { useState } from "react";
import { SystemProject } from "@/data/systems";
import { CheckCircle2, Network } from "lucide-react";
import { PipelineSimulator } from "./PipelineSimulator";

interface ArchitectureInspectorProps {
  system: SystemProject | null;
  onClose?: () => void;
}

export function ArchitectureInspector({ system }: ArchitectureInspectorProps) {
  const [activeTab, setActiveTab] = useState<"topology" | "simulator" | "highlights" | "telemetry">("topology");

  if (!system) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[520px] border border-white/10">
        <Network className="w-12 h-12 text-[#1856FF]/40 mb-3 animate-pulse" />
        <h3 className="text-base font-medium text-white/80 mb-1">
          Nenhum Sistema Selecionado
        </h3>
        <p className="text-xs text-[#94A3B8] max-w-xs leading-relaxed">
          <span className="text-white/60">Clique em qualquer cartão para ver os destaques e a visão do projeto.</span>
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
                {system.shortLabel} • INSPECTOR
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
            Visão Geral
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico Baseado na Aba */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {activeTab === "topology" && (
          <div className="space-y-4">
            <div className="text-xs text-[#94A3B8] flex items-center justify-between">
              <span className="font-mono uppercase text-[#38BDF8]">
                Visão do projeto
              </span>
              <span className="font-mono text-[11px] text-white/50">
                Não é topologia de produção
              </span>
            </div>

            {/* Visão ilustrativa; não representa arquitetura em produção */}
            <ol className="grid gap-3 sm:grid-cols-3" aria-label="Tópicos do projeto">
              {system.executionFlow.map((stage) => (
                <li key={stage.step} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <span className={`inline-flex rounded border px-2 py-0.5 font-mono text-[11px] ${stage.badgeColor}`}>{stage.step}</span>
                  <h3 className="mt-2 text-sm font-semibold text-white">{stage.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">{stage.description}</p>
                </li>
              ))}
            </ol>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/60">
              Representação simplificada; não exibe topologia, controles operacionais ou estado dos sistemas internos.
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
                Destaques técnicos
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
            <div className="text-xs uppercase text-[#38BDF8]">Destaques do projeto</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {system.facts.map((fact) => (
                <div key={fact.label} className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
                  <div className="mb-1 text-[11px] text-[#94A3B8]">{fact.label}</div>
                  <div className="text-sm font-bold text-white">{fact.value}</div>
                </div>
              ))}
            </div>
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 font-sans text-[11px] leading-relaxed text-white/55">
              Estes dados são descritivos; não representam métricas medidas, telemetria, auditoria independente ou confirmação de estado de produção.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
