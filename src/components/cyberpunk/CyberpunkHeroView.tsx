"use client";

import React from "react";
import { ShieldAlert, Zap, ChevronRight, Activity } from "lucide-react";

interface CyberpunkHeroProps {
  onLaunchGrid: () => void;
  onLaunchResilience: () => void;
  onLaunchSecurity: () => void;
}

export function CyberpunkHeroView({
  onLaunchGrid,
  onLaunchResilience,
  onLaunchSecurity,
}: CyberpunkHeroProps) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-10 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-[#38BDF8]">PORTFÓLIO PROFISSIONAL · EXPERIÊNCIAS</span>
          <span className="hidden font-mono text-[10px] text-white/45 md:inline">INTERAÇÕES LOCAIS · SEM CONEXÃO A SISTEMAS INTERNOS</span>
        </div>

      {/* Bloco Central Hero Estilo Terminal Cyberpunk 2077 */}
      <div className="max-w-4xl my-auto py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1856FF]/20 border-l-2 border-[#1856FF] text-[#38BDF8] font-mono text-xs mb-4">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>CYBERNETIC BACKEND ARCHITECT & DISTRIBUTED SYSTEMS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.04] mb-5">
          ARQUITETURA DE{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#1856FF] to-[#38BDF8]">
            MISSÃO CRÍTICA
          </span>{" "}
          E INTELIGÊNCIA DISTRIBUÍDA.
        </h1>

        <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl mb-8 font-sans">
          Desenho e blindagem de plataformas financeiras de alta volumetria: brokers de mensageria desacoplados para IA, malhas corporativas Zero Trust com autenticação M2M criptográfica e autoatendimento autônomo 100% IA para o PIX no Banco Safra.
        </p>

        {/* Botões com Estética Cyberpunk Chanfrada (cyber-corner) */}
        <div className="flex flex-wrap items-center gap-3.5 font-mono text-xs font-bold">
          <button
            onClick={onLaunchGrid}
            className="px-6 py-3.5 bg-gradient-to-r from-[#1856FF] to-[#38BDF8] hover:opacity-90 text-white cyber-corner flex items-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(24,86,255,0.4)] transition-all"
          >
            <span>[ ACESSAR MATRIZ DE SISTEMAS ]</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLaunchResilience}
            className="px-6 py-3.5 bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-500/40 cyber-corner flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>[ SIMULADOR DE FALHAS & CRISES ]</span>
          </button>

          <button
            onClick={onLaunchSecurity}
            className="px-6 py-3.5 bg-black/60 hover:bg-black/80 text-[#07CA6B] border border-[#07CA6B]/40 cyber-corner flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(7,202,107,0.2)]"
          >
            <ShieldAlert className="w-4 h-4 text-[#07CA6B]" />
            <span>[ SCANNER ZERO TRUST & DLP ]</span>
          </button>
        </div>
      </div>

      {/* Rodapé Industrial com Status de Nós */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 font-mono text-xs">
        <div className="p-3 bg-black/50 border border-white/10 cyber-corner">
          <div className="text-[10px] text-amber-400">CORPORATE_DEPLOYMENT</div>
          <div className="font-bold text-white mt-0.5">Banco Safra</div>
          <div className="text-[10px] text-[#07CA6B]">Senior Software Engineer</div>
        </div>

        <div className="p-3 bg-black/50 border border-white/10 cyber-corner">
          <div className="text-[10px] text-[#38BDF8]">SECURITY_HARDENING</div>
          <div className="font-bold text-white mt-0.5">Zero Trust M2M</div>
          <div className="text-[10px] text-white/60">Active Directory RBAC</div>
        </div>

        <div className="p-3 bg-black/50 border border-white/10 cyber-corner">
          <div className="text-[10px] text-purple-400">MESSAGING_BUS</div>
          <div className="font-bold text-white mt-0.5">Agnostic Broker</div>
          <div className="text-[10px] text-white/60">Meta COEX / Telegram</div>
        </div>

        <div className="p-3 bg-black/50 border border-white/10 cyber-corner">
          <div className="text-[10px] text-[#07CA6B]">PIX_AUTONOMY</div>
          <div className="font-bold text-white mt-0.5">100% IA no Canal</div>
          <div className="text-[10px] text-[#07CA6B]">Promoção em 7 meses</div>
        </div>
      </div>
    </div>
  );
}
