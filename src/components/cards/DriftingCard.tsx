"use client";

import React, { useState } from "react";
import { SystemProject } from "@/data/systems";
import { 
  ShieldCheck, 
  Cpu, 
  Terminal as TerminalIcon, 
  Layers, 
  ArrowUpRight, 
  Activity,
  CheckCircle2
} from "lucide-react";

interface DriftingCardProps {
  system: SystemProject;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function DriftingCard({ system, index, isSelected, onSelect }: DriftingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Ícones contextuais por categoria
  const getCategoryIcon = () => {
    switch (system.category) {
      case "Security & Zero Trust":
        return <ShieldCheck className="w-4 h-4 text-[#07CA6B]" />;
      case "Platform Architecture":
        return <Layers className="w-4 h-4 text-[#1856FF]" />;
      case "Edge AI & Multi-Agent":
        return <Cpu className="w-4 h-4 text-[#38BDF8]" />;
      default:
        return <Activity className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(false)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 select-none ${
        isSelected
          ? "glass-panel bg-[rgba(255,255,255,0.14)] border-[#1856FF] shadow-[0_16px_50px_rgba(24,86,255,0.3)] ring-1 ring-[#1856FF]/40 -translate-y-1"
          : "glass-panel glass-panel-interactive"
      }`}
    >
      {/* Luz ambiente interna do card (Light Leak local) */}
      <div 
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-500 ${
          isSelected ? "bg-[#1856FF]/25 opacity-100" : "bg-[#1856FF]/10 opacity-0 group-hover:opacity-100"
        }`} 
      />

      {/* Header do Card com Codename e Categoria */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/[0.06] border border-white/10">
            {getCategoryIcon()}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
            {system.codename}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#07CA6B] animate-pulse" />
          <span className="font-mono text-[10px] text-white/80">{system.period}</span>
        </div>
      </div>

      {/* Título & Organização */}
      <h3 className="text-lg font-semibold text-white tracking-tight mb-1 group-hover:text-[#38BDF8] transition-colors flex items-center justify-between">
        <span>{system.title}</span>
        <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#38BDF8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </h3>

      <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-4">
        <span className="text-white/60 font-medium">{system.organization}</span>
        <span>•</span>
        <span className="text-white/40">{system.category}</span>
      </div>

      {/* Resumo Direto de Engenharia */}
      <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3 mb-5">
        {system.summary}
      </p>

      {/* Métricas de Impacto em Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/25 border border-white/[0.06] mb-4">
        {system.metrics.map((metric, i) => (
          <div key={i} className="text-center">
            <div className="font-mono text-[11px] font-semibold text-[#F8FAFC]">
              {metric.value}
            </div>
            <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tags de Tecnologias */}
      <div className="flex flex-wrap gap-1.5">
        {system.stack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/70 border border-white/[0.06]"
          >
            {tech}
          </span>
        ))}
        {system.stack.length > 4 && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 text-[#94A3B8]">
            +{system.stack.length - 4}
          </span>
        )}
      </div>
    </div>
  );
}
