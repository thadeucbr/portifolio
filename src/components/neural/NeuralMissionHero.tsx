"use client";

import React from "react";
import { Zap, Cpu, Sparkles, ChevronRight } from "lucide-react";
import { LiveRuntimeHud } from "./LiveRuntimeHud";

interface NeuralMissionHeroProps {
  onGoToSystems: () => void;
  onGoToResilience: () => void;
  onGoToAgent: () => void;
}

export function NeuralMissionHero({
  onGoToSystems,
  onGoToResilience,
  onGoToAgent,
}: NeuralMissionHeroProps) {

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-10 animate-in fade-in duration-500">
      {/* Top HUD: telemetria real do runtime (nada hardcoded) */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <LiveRuntimeHud />
      </div>

      {/* Bloco Central Hero: IA e Missão Crítica Convergidas */}
      <div className="max-w-4xl my-auto py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[#38BDF8] font-mono text-xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#1856FF]" />
          <span>BANCO SAFRA ENTERPRISE PLATFORMS • AGNOSTIC MESSAGING BROKER • EDGE AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-5">
          Engenharia de Plataformas de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1856FF] via-[#38BDF8] to-emerald-400">
            Missão Crítica
          </span>{" "}
          e Ecossistemas de IA.
        </h1>

        <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl mb-8 font-sans">
          Arquiteto de software sênior especializado na convergência entre brokers agnósticos de mensageria para IA em altíssima volumetria, malhas corporativas Zero Trust com tokens criptográficos assinados e autoatendimento autônomo 100% IA para o PIX.
        </p>

        {/* Botões de Ação Imediata */}
        <div className="flex flex-wrap items-center gap-3.5 font-mono text-xs">
          <button
            onClick={onGoToSystems}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#1856FF] to-[#38BDF8] hover:opacity-95 text-white font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(24,86,255,0.4)] transition-all"
          >
            <span>Explorar Matriz de Sistemas (5 Módulos)</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToResilience}
            className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/[0.12] text-amber-300 border border-amber-500/30 flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)]"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulador de Falhas & Crises</span>
          </button>

          <button
            onClick={onGoToAgent}
            className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/[0.12] text-[#38BDF8] border border-[#38BDF8]/30 flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          >
            <Cpu className="w-4 h-4 text-[#38BDF8]" />
            <span>Agente Edge & Playground</span>
          </button>
        </div>
      </div>

      {/* Radar de Competências Comprovadas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 font-mono text-xs">
        <div className="glass-panel-subtle p-3 rounded-2xl border border-white/10">
          <div className="text-[10px] text-[#38BDF8]">INSTITUIÇÃO BANCÁRIA</div>
          <div className="font-bold text-white mt-0.5">Banco Safra</div>
          <div className="text-[10px] text-[#07CA6B]">Engenheiro Sênior</div>
        </div>

        <div className="glass-panel-subtle p-3 rounded-2xl border border-white/10">
          <div className="text-[10px] text-purple-300">SEGURANÇA CORPORATIVA</div>
          <div className="font-bold text-white mt-0.5">Zero Trust M2M</div>
          <div className="text-[10px] text-white/60">Tokens assinados & AD</div>
        </div>

        <div className="glass-panel-subtle p-3 rounded-2xl border border-white/10">
          <div className="text-[10px] text-amber-300">ROTEAMENTO AGNOSTICO</div>
          <div className="font-bold text-white mt-0.5">Broker para IA</div>
          <div className="text-[10px] text-white/60">WhatsApp COEX / Telegram</div>
        </div>

        <div className="glass-panel-subtle p-3 rounded-2xl border border-white/10">
          <div className="text-[10px] text-[#07CA6B]">AUTONOMIA PIX</div>
          <div className="font-bold text-white mt-0.5">100% IA no Canal</div>
          <div className="text-[10px] text-[#07CA6B]">Promoção em 7 meses</div>
        </div>
      </div>
    </div>
  );
}
