"use client";

import React from "react";
import { Sparkles, Activity, ChevronRight } from "lucide-react";

interface ModeArchitectProps {
  onExploreGrid: () => void;
  onLaunchPipeline: () => void;
}

export function ModeArchitect({ onExploreGrid, onLaunchPipeline }: ModeArchitectProps) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Top Banner com Tag de Status e Arquitetura */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-panel-subtle border border-white/10 font-mono text-xs text-[#38BDF8]">
          <span className="w-2 h-2 rounded-full bg-[#07CA6B] animate-ping" />
          <span>AUTONOMOUS SYSTEMS ARCHITECT // 2026 EDITION</span>
        </div>

        <div className="hidden md:flex items-center gap-3 font-mono text-xs text-white/60">
          <span>PORTFÓLIO • RESUMOS CURRICULARES</span>
        </div>
      </div>

      {/* Hero Central Imersivo com Teatralidade Cinematográfica */}
      <div className="max-w-4xl py-6 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1856FF]/15 border border-[#1856FF]/30 text-[#38BDF8] text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#1856FF]" />
          <span>BANCO SAFRA PLATFORMS • AGNOSTIC MESSAGING BROKER • EDGE AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
          Engenharia de Plataformas de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1856FF] via-[#38BDF8] to-white">
            Missão Crítica
          </span>{" "}
          e Sistemas de IA.
        </h1>

        <p className="text-base sm:text-xl text-[#94A3B8] leading-relaxed max-w-2xl mb-8">
          Arquiteto de software com histórico comprovado no desenho de brokers agnósticos de mensageria para IA sob altíssima volumetria, malhas corporativas Zero Trust com tokens criptográficos assinados e canais autônomos 100% IA no setor financeiro.
        </p>

        {/* Botões de Ação com Fator WoW */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onExploreGrid}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#1856FF] to-[#38BDF8] hover:opacity-95 text-white font-semibold text-sm flex items-center gap-2.5 transition-all shadow-[0_0_35px_rgba(24,86,255,0.4)] cursor-pointer group"
          >
            <span>Explorar Rede Cinética (Kinetic Grid)</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onLaunchPipeline}
            className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/[0.12] text-white font-mono text-xs flex items-center gap-2.5 transition-all border border-white/20 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[#07CA6B]" />
            <span>Explorar demonstração conceitual local</span>
          </button>
        </div>
      </div>

      {/* Rodapé: fatos curriculares, não indicadores de produção */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 font-mono text-xs">
        <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/10">
          <div className="text-[10px] text-[#94A3B8]">ORGANIZAÇÃO PRINCIPAL</div>
          <div className="text-sm font-bold text-white mt-1">Banco Safra</div>
          <div className="text-[10px] text-[#07CA6B] mt-0.5">Engenheiro Sênior</div>
        </div>

        <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/10">
          <div className="text-[10px] text-[#94A3B8]">SEGURANÇA CORPORATIVA</div>
          <div className="text-sm font-bold text-white mt-1">Zero Trust M2M</div>
          <div className="text-[10px] text-[#38BDF8] mt-0.5">Tokens Criptográficos / AD</div>
        </div>

        <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/10">
          <div className="text-[10px] text-[#94A3B8]">MENSAGERIA & CANAIS</div>
          <div className="text-sm font-bold text-white mt-1">Broker Agnóstico</div>
          <div className="text-[10px] text-purple-300 mt-0.5">WhatsApp COEX / Telegram</div>
        </div>

        <div className="glass-panel-subtle p-3.5 rounded-2xl border border-white/10">
          <div className="text-[10px] text-[#94A3B8]">PROCESSO COGNITIVO</div>
          <div className="text-sm font-bold text-white mt-1">100% IA no PIX</div>
          <div className="text-[10px] text-[#07CA6B] mt-0.5">Promoção em 7 meses</div>
        </div>
      </div>
    </div>
  );
}
