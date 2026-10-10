"use client";

import React, { useRef, useState } from "react";
import { SystemProject } from "@/data/systems";
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Activity, 
  ArrowUpRight, 
  CheckCircle2,
  ChevronRight,
  Terminal,
  Lock
} from "lucide-react";

interface InteractiveDriftingDeckProps {
  systems: SystemProject[];
  selectedId: string;
  onSelect: (system: SystemProject) => void;
}

export function InteractiveDriftingDeck({
  systems,
  selectedId,
  onSelect,
}: InteractiveDriftingDeckProps) {
  const [offsets, setOffsets] = useState<{ [key: string]: { x: number; y: number } }>({});
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleMouseMoveOnCard = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const card = cardRefs.current[id];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Repulsão vetorial tátil suave (Spring Physics)
    setOffsets((prev) => ({
      ...prev,
      [id]: { x: x * 0.08, y: y * 0.08 },
    }));
  };

  const handleMouseLeaveCard = (id: string) => {
    setOffsets((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0 },
    }));
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Security & Zero Trust":
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#07CA6B]" />,
          color: "text-[#07CA6B] border-[#07CA6B]/30 bg-[#07CA6B]/10",
        };
      case "Platform Architecture":
        return {
          icon: <Layers className="w-3.5 h-3.5 text-[#1856FF]" />,
          color: "text-[#38BDF8] border-[#1856FF]/30 bg-[#1856FF]/10",
        };
      case "Edge AI & Multi-Agent":
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-sky-400" />,
          color: "text-sky-400 border-sky-400/30 bg-sky-400/10",
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5 text-purple-400" />,
          color: "text-purple-400 border-purple-400/30 bg-purple-400/10",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {systems.map((system, idx) => {
        const isSelected = system.id === selectedId;
        const badge = getCategoryBadge(system.category);
        const offset = offsets[system.id] || { x: 0, y: 0 };

        return (
          <div
            key={system.id}
            ref={(el) => {
              cardRefs.current[system.id] = el;
            }}
            onClick={() => onSelect(system)}
            onMouseMove={(e) => handleMouseMoveOnCard(e, system.id)}
            onMouseLeave={() => handleMouseLeaveCard(system.id)}
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease",
            }}
            className={`group relative rounded-3xl p-6 cursor-pointer select-none border transition-all duration-300 ${
              isSelected
                ? "glass-panel bg-[rgba(255,255,255,0.13)] border-[#1856FF] shadow-[0_16px_50px_rgba(24,86,255,0.35)] ring-2 ring-[#1856FF]/50"
                : "glass-panel glass-panel-interactive border-white/15 hover:border-white/30"
            }`}
          >
            {/* Light Catcher Top Highlight */}
            <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            {/* Glowing Light Leak Local */}
            <div
              className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-opacity duration-500 ${
                isSelected ? "bg-[#1856FF]/30 opacity-100" : "bg-[#1856FF]/10 opacity-0 group-hover:opacity-100"
              }`}
            />

            {/* Header: Codename e Período */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${badge.color}`}>
                  {badge.icon}
                  <span>{system.shortLabel}</span>
                </span>
              </div>
              <span className="font-mono text-[10px] text-white/50 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/5">
                {system.organization} • {system.period}
              </span>
            </div>

            {/* Título & Seta de Ação */}
            <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-[#38BDF8] transition-colors flex items-center justify-between">
              <span>{system.title}</span>
              <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-[#38BDF8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </h3>

            {/* Resumo do Caso Real de Engenharia */}
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-5 line-clamp-3">
              {system.summary}
            </p>

            {/* Resumo profissional, não métricas de produção */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/40 border border-white/[0.06] mb-4">
              {system.facts.map((m, i) => (
                <div key={i} className="text-center">
                  <div className="font-mono text-[11px] font-bold text-white">
                    {m.value}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Stack Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
              <div className="flex flex-wrap gap-1.5">
                {system.stack.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[9px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/70 border border-white/5"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-[#38BDF8] font-mono group-hover:underline flex items-center gap-0.5">
                <span>Inspecionar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
