"use client";

import React, { useRef, useState, useEffect } from "react";
import { SYSTEMS_DATA, SystemProject } from "@/data/systems";
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Activity, 
  Maximize2, 
  Minimize2, 
  Flame, 
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Lock,
  Volume2,
  VolumeX
} from "lucide-react";

interface FloatingCardState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  isDragging: boolean;
  isExpanded: boolean;
}

export function ChaosCollisionChamber() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<FloatingCardState[]>(() =>
    SYSTEMS_DATA.map((sys, idx) => {
      // Distribuição orbital inicial aleatória no espaço
      const angle = (idx / SYSTEMS_DATA.length) * Math.PI * 2;
      return {
        id: sys.id,
        x: Math.cos(angle) * 280,
        y: Math.sin(angle) * 160,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        rot: (Math.random() - 0.5) * 12,
        vRot: (Math.random() - 0.5) * 0.08,
        isDragging: false,
        isExpanded: false,
      };
    })
  );

  const [activeChaos, setActiveChaos] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; cardX: number; cardY: number }>({
    mouseX: 0,
    mouseY: 0,
    cardX: 0,
    cardY: 0,
  });
  const [expandedSystem, setExpandedSystem] = useState<SystemProject | null>(null);

  // Laço Físico de Gravidade Zero & Colisão Elástica (Spring Physics + Newtonian Motion)
  useEffect(() => {
    let animId: number;

    const updatePhysics = () => {
      setCards((prevCards) => {
        const boundsX = 460;
        const boundsY = 250;

        return prevCards.map((card, i) => {
          if (card.isDragging || card.isExpanded) return card;

          let nx = card.x + card.vx * (activeChaos ? 2.8 : 1.0);
          let ny = card.y + card.vy * (activeChaos ? 2.8 : 1.0);
          const nrot = card.rot + card.vRot;
          let nvx = card.vx;
          let nvy = card.vy;

          // Colisão com as paredes elásticas da câmara
          if (Math.abs(nx) > boundsX) {
            nvx *= -0.88;
            nx = Math.sign(nx) * boundsX;
          }
          if (Math.abs(ny) > boundsY) {
            nvy *= -0.88;
            ny = Math.sign(ny) * boundsY;
          }

          // Damping / atrito cósmico suave
          nvx *= 0.998;
          nvy *= 0.998;

          // Se estiver muito parado, adicionar micro-deriva de gravidade zero
          if (Math.abs(nvx) < 0.1 && Math.abs(nvy) < 0.1) {
            nvx += (Math.random() - 0.5) * 0.2;
            nvy += (Math.random() - 0.5) * 0.2;
          }

          return {
            ...card,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            rot: nrot,
          };
        });
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [activeChaos]);

  // Manipulação de Arraste Físico com Arremesso (Throw & Fling Physics)
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;

    setDraggedId(id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cardX: card.x,
      cardY: card.y,
    };

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDragging: true, vx: 0, vy: 0 } : c))
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedId) return;

    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    setCards((prev) =>
      prev.map((c) =>
        c.id === draggedId
          ? {
              ...c,
              x: dragStartRef.current.cardX + dx,
              y: dragStartRef.current.cardY + dy,
              vx: dx * 0.12, // Inércia para arremesso
              vy: dy * 0.12,
            }
          : c
      )
    );
  };

  const handleMouseUp = () => {
    if (!draggedId) return;
    setCards((prev) =>
      prev.map((c) => (c.id === draggedId ? { ...c, isDragging: false } : c))
    );
    setDraggedId(null);
  };

  // Organizar instantaneamente em Matriz Geométrica (Kinetic Snap)
  const snapToMatrix = () => {
    setCards((prev) =>
      prev.map((c, idx) => {
        const cols = 3;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        return {
          ...c,
          x: (col - 1) * 260,
          y: (row - 0.5) * 180,
          vx: 0,
          vy: 0,
          rot: 0,
          vRot: 0,
        };
      })
    );
  };

  // Disparar Impulso de Caos & Microgravidade
  const triggerChaosPulse = () => {
    setActiveChaos(true);
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        vRot: (Math.random() - 0.5) * 1.5,
      }))
    );
    setTimeout(() => setActiveChaos(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing p-6"
    >
      {/* Top Controls da Câmara de Gravidade Zero */}
      <div className="flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#07CA6B] animate-ping" />
          <span className="font-mono text-xs uppercase text-[#38BDF8] tracking-wider">
            CÂMARA DE COLISÃO NEWTONIANA // GRAVIDADE ZERO REAL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={snapToMatrix}
            className="px-3.5 py-1.5 rounded-xl glass-panel text-white hover:bg-white/[0.12] font-mono text-xs flex items-center gap-1.5 transition-all border border-white/15 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Alinhar Matriz</span>
          </button>

          <button
            onClick={triggerChaosPulse}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600/80 to-[#1856FF] text-white hover:opacity-90 font-mono text-xs flex items-center gap-1.5 transition-all shadow-[0_0_25px_rgba(234,33,67,0.4)] cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>Pulso de Gravidade Zero</span>
          </button>
        </div>
      </div>

      {/* Espaço Central de Flutuação dos Cartões Físicos */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        {cards.map((card) => {
          const system = SYSTEMS_DATA.find((s) => s.id === card.id);
          if (!system) return null;

          return (
            <div
              key={card.id}
              onMouseDown={(e) => handleMouseDown(e, card.id)}
              style={{
                transform: `translate3d(${card.x}px, ${card.y}px, 0) rotate(${card.rot}deg)`,
                willChange: "transform",
                transition: card.isDragging ? "none" : "box-shadow 0.2s ease",
              }}
              className="absolute w-72 sm:w-80 rounded-3xl p-5 select-none glass-panel border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group hover:border-[#1856FF] hover:shadow-[0_0_35px_rgba(24,86,255,0.4)] transition-colors"
            >
              {/* Light Catcher Top Highlight */}
              <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Header do Card com Tag e Drag Handler */}
              <div className="flex items-center justify-between mb-3 pointer-events-none">
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#1856FF]/20 text-[#38BDF8] border border-[#1856FF]/30 uppercase font-semibold">
                  {system.sourceLabel}
                </span>
                <span className="font-mono text-[9px] text-white/50">
                  {system.organization}
                </span>
              </div>

              {/* Título do Sistema */}
              <h4 className="text-sm font-bold text-white tracking-tight mb-1.5 pointer-events-none">
                {system.title}
              </h4>

              {/* Resumo */}
              <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-2 mb-4 pointer-events-none">
                {system.summary}
              </p>

              {/* Fatos curriculares selecionados */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-black/40 p-2 font-mono text-[10px]">
                {[system.facts[0], system.facts[1]].filter(Boolean).map((fact) => (
                  <div key={fact.label}>
                    <span className="text-[9px] text-white/50">{fact.label.toUpperCase()}:</span>
                    <div className="font-bold text-white">{fact.value}</div>
                  </div>
                ))}
              </div>

              {/* Footer do Card com Botão de Inspeção */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <span className="text-[9px] font-mono text-white/40">
                  Arraste & Solte para Arremessar
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSystem(system);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#1856FF] text-white font-mono text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Inspecionar</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dica de Interatividade no Rodapé */}
      <div className="relative z-20 text-center pointer-events-none">
        <span className="glass-panel-subtle px-4 py-1.5 rounded-full text-[11px] font-mono text-white/60 border border-white/10">Resumo interativo baseado no CV · não representa telemetria ou topologia interna</span>
      </div>

      {/* Modal de Detalhe Holográfico Completo */}
      {expandedSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-8 border border-white/20 shadow-[0_0_80px_rgba(24,86,255,0.4)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-xs text-[#38BDF8] uppercase">
                  {expandedSystem.category} • {expandedSystem.period}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {expandedSystem.title}
                </h3>
              </div>
              <button
                onClick={() => setExpandedSystem(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer transition-colors"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="py-6 space-y-4">
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                {expandedSystem.summary}
              </p>

              <div className="space-y-2">
                <span className="text-xs font-mono text-[#38BDF8] uppercase block">
                  Destaques de Arquitetura:
                </span>
                {expandedSystem.architectureHighlights.map((hl, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/90">
                    ❯ {hl}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-[#07CA6B]">
                <span className="text-xs font-mono text-[#07CA6B]">Contexto: {expandedSystem.organization}</span>
              </span>
              <button
                onClick={() => setExpandedSystem(null)}
                className="px-4 py-2 rounded-xl bg-[#1856FF] text-white text-xs font-semibold cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
