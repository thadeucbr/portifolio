"use client";

import { useState } from "react";
import { SYSTEMS_DATA, type SystemProject } from "@/data/systems";
import { AlertTriangle, CheckCircle2, ChevronRight, Grid } from "lucide-react";

export function ModeKineticGrid() {
  const [selectedSystem, setSelectedSystem] = useState<SystemProject>(SYSTEMS_DATA[0]);
  const [activeTab, setActiveTab] = useState<"topology" | "decisions" | "telemetry">("topology");

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-500">
      {/* Top Header do Modo Kinetic Grid */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#38BDF8]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
              MODO II // REDE CINÉTICA DE SISTEMAS (KINETIC GRID)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Sistemas de Alta Complexidade & Engenharia de Plataforma
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-white/50">
          <span>5 PROJETOS DESCRITOS</span>
          <span>•</span>
          <span className="text-[#07CA6B]">CONTEÚDO ESTÁTICO</span>
        </div>
      </div>

      {/* Grid Dual: Seleção Interativa à Esquerda + Visualizador Holográfico à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 flex-1 min-h-0 items-stretch">
        {/* Coluna Esquerda: Lista de Sistemas em Cartões de Vidro */}
        <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto pr-1">
          {SYSTEMS_DATA.map((sys) => {
            const isSelected = sys.id === selectedSystem.id;
            return (
              <div
                key={sys.id}
                onClick={() => setSelectedSystem(sys)}
                className={`p-4 rounded-2xl cursor-pointer select-none transition-all duration-300 border ${
                  isSelected
                    ? "glass-panel bg-white/[0.12] border-[#1856FF] shadow-[0_0_30px_rgba(24,86,255,0.3)] ring-1 ring-[#1856FF]/50 -translate-x-1"
                    : "glass-panel-subtle hover:bg-white/[0.06] border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase text-[#38BDF8] tracking-wider font-semibold">
                    {sys.sourceLabel}
                  </span>
                  <span className="font-mono text-[10px] text-white/50 px-2 py-0.5 rounded-full bg-white/[0.04]">
                    {sys.organization}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight mb-1 flex items-center justify-between">
                  <span>{sys.title}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-[#38BDF8] translate-x-1" : "text-white/30"
                    }`}
                  />
                </h3>

                <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {sys.summary}
                </p>

                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/[0.06] font-mono text-[10px] text-white/60">
                  <span>{sys.facts[0].label}: <strong className="text-white">{sys.facts[0].value}</strong></span>
                  <span>•</span>
                  <span>{sys.facts[1].label}: <strong className="text-white">{sys.facts[1].value}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coluna Direita: O Painel Holográfico Expandido com Fluxo EXCLUSIVO do Sistema Ativo */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/15 flex flex-col justify-between overflow-hidden relative">
          {/* Luz Ambiente Interna */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1856FF]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header do Sistema com Abas */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-[11px] uppercase text-[#38BDF8] tracking-wider block">
                  {selectedSystem.category} • {selectedSystem.period}
                </span>
                <h3 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
                  {selectedSystem.title}
                </h3>
              </div>

              {/* Seletor de Abas */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 font-mono text-xs">
                <button
                  onClick={() => setActiveTab("topology")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === "topology"
                      ? "bg-[#1856FF] text-white shadow-sm font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Topologia
                </button>
                <button
                  onClick={() => setActiveTab("decisions")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === "decisions"
                      ? "bg-[#1856FF] text-white shadow-sm font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Decisões
                </button>
                <button
                  onClick={() => setActiveTab("telemetry")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === "telemetry"
                      ? "bg-[#1856FF] text-white shadow-sm font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Resumo CV
                </button>
              </div>
            </div>

            {/* Conteúdo Dinâmico por Aba */}
            <div className="mt-5 space-y-4">
              {activeTab === "topology" && (
                <div className="space-y-4">
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {selectedSystem.summary}
                  </p>

                  {/* Fluxograma Arquitetural Único e Específico do Sistema Selecionado */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-[10px] uppercase text-[#38BDF8] pb-1 border-b border-white/5 font-bold">
                      <span>Visão conceitual · baseada no CV</span>
                      <span className="text-white/50">{selectedSystem.executionFlow.length} ESTÁGIOS</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {selectedSystem.executionFlow.map((stage, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold shrink-0 ${stage.badgeColor}`}>
                              {stage.step}
                            </span>
                            <div className="flex items-center justify-between w-full">
                              <span className="text-white font-semibold text-xs">{stage.title}</span>
                              <span className="text-[10px] text-white/40 hidden sm:inline">{stage.tech}</span>
                            </div>
                          </div>
                          <div className="pl-6 text-[11px] text-[#94A3B8]">
                            {stage.description}
                          </div>
                          <div className="pl-6 text-[10px] text-[#07CA6B]/90 font-mono flex items-center gap-1">
                            <span>❯</span>
                            <span>{stage.actionOutput}</span>
                          </div>
                          {idx < selectedSystem.executionFlow.length - 1 && (
                            <div className="pl-6 text-[#1856FF] text-[11px] py-0.5">↓</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Tratamento de Falha do Sistema */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mt-3 text-[11px] text-amber-200/90 font-sans flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Nota de escopo:</strong> {selectedSystem.failureHandling}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "decisions" && (
                <div className="space-y-3">
                  <div className="text-[11px] font-mono text-[#38BDF8] uppercase">
                    Pilares Técnicos e Hardening Implementado em {selectedSystem.organization}:
                  </div>
                  <div className="grid gap-2">
                    {selectedSystem.architectureHighlights.map((hl, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5 text-xs text-white/90"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#07CA6B] shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "telemetry" && (
                <div className="space-y-4 font-mono">
                  <div className="text-[11px] text-[#38BDF8] uppercase">
                    Indicadores curriculares cadastrados na ficha (não são telemetria):
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedSystem.facts.map((m, i) => (
                      <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/10 text-center">
                        <div className="text-base font-bold text-white">{m.value}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#94A3B8] font-sans">
                    Estes fatos vêm do resumo curricular; não são telemetria ao vivo nem confirmação do ambiente interno.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer do Painel com Stack de Tecnologias */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {selectedSystem.stack.map((stk) => (
                <span
                  key={stk}
                  className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white/80"
                >
                  {stk}
                </span>
              ))}
            </div>
            <span className="text-xs font-mono text-[#07CA6B] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
              DESCRIÇÃO DE REFERÊNCIA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
