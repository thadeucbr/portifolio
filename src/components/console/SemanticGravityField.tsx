"use client";

import React, { useEffect, useRef, useState } from "react";
import type { FieldIn, FieldOut } from "@/workers/semanticField.worker";
import { createThrowImpulse, type FieldLayout, type FieldShape } from "@/workers/fieldLayouts.mjs";
import { SYSTEM_LABEL } from "@/mcp/semanticEngine";
import { projectTransitionName } from "@/components/projects/projectTransition.mjs";

interface Props {
  ids: string[];
  scores: Record<string, number> | null;
  topId?: string;
  modeLabel?: string;
  shape?: FieldShape;
  layout?: FieldLayout;
  cardInfo?: Record<string, { title: string; subtitle: string }>;
  onSelect: (systemId: string) => void;
}

interface ActiveDrag {
  index: number;
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  distance: number;
}

const PIXELS_PER_UNIT = 50;
const LAYOUT_NAMES: Record<FieldLayout, string> = {
  orbital: "órbita",
  circle: "círculo",
  grid: "matriz",
  triangle: "triângulo",
};

export function SemanticGravityField({
  ids,
  scores,
  topId,
  modeLabel = "gravidade semântica",
  shape = "chip",
  layout = "orbital",
  cardInfo,
  onSelect,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const dragRef = useRef<ActiveDrag | null>(null);
  const suppressClickRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const worker = new Worker(new URL("../../workers/semanticField.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<FieldOut>) => {
      if (event.data.type === "ready") setReady(true);
      if (event.data.type === "error") {
        setWorkerError(event.data.detail);
        const width = host.clientWidth;
        const height = host.clientHeight;
        const radius = Math.min(width, height) * 0.32;
        nodeRefs.current.forEach((element, index) => {
          if (!element || ids.length === 0) return;
          const angle = (index / ids.length) * Math.PI * 2 - Math.PI / 2;
          const x = width / 2 + Math.cos(angle) * radius;
          const y = height / 2 + Math.sin(angle) * radius;
          element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        });
      }
      if (event.data.type === "frame") {
        const { positions, rotations } = event.data;
        nodeRefs.current.forEach((element, index) => {
          if (!element) return;
          const angle = rotations[index] ?? 0;
          element.style.transform = `translate(${positions[index * 2]}px, ${positions[index * 2 + 1]}px) translate(-50%, -50%) rotate(${angle}rad)`;
        });
      }
    };

    const send = (message: FieldIn) => worker.postMessage(message);
    send({ type: "init", ids, width: host.clientWidth, height: host.clientHeight, shape });


    const resizeObserver = new ResizeObserver(() => {
      send({ type: "resize", width: host.clientWidth, height: host.clientHeight });
    });
    resizeObserver.observe(host);

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const activeDrag = dragRef.current;
      if (activeDrag) {
        const now = event.timeStamp;
        const elapsed = Math.max(8, now - activeDrag.lastTime);
        activeDrag.velocityX = ((x - activeDrag.lastX) / PIXELS_PER_UNIT) * (1000 / elapsed);
        activeDrag.velocityY = ((y - activeDrag.lastY) / PIXELS_PER_UNIT) * (1000 / elapsed);
        activeDrag.distance = Math.max(activeDrag.distance, Math.hypot(x - activeDrag.startX, y - activeDrag.startY));
        activeDrag.lastX = x;
        activeDrag.lastY = y;
        activeDrag.lastTime = now;
        send({ type: "drag-move", x, y });
      } else {
        send({ type: "pointer", x, y, active: true });
      }
    };
    const onPointerLeave = () => {
      if (!dragRef.current) send({ type: "pointer", x: 0, y: 0, active: false });
    };
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);

    return () => {
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      worker.terminate();
      dragRef.current = null;
      workerRef.current = null;
    };
  }, [ids, shape]);

  useEffect(() => {
    workerRef.current?.postMessage({ type: "scores", scores: scores ?? {} } satisfies FieldIn);
  }, [scores]);

  useEffect(() => {
    workerRef.current?.postMessage({ type: "layout", pattern: layout, selectedId: topId } satisfies FieldIn);
  }, [layout, topId]);

  const localPoint = (clientX: number, clientY: number) => {
    const bounds = hostRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return { x: clientX - bounds.left, y: clientY - bounds.top };
  };

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    if (shape !== "card" || event.button !== 0 || !event.isPrimary) return;
    const point = localPoint(event.clientX, event.clientY);
    const now = event.timeStamp;
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      lastX: point.x,
      lastY: point.y,
      lastTime: now,
      velocityX: 0,
      velocityY: 0,
      distance: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    workerRef.current?.postMessage({ type: "drag-start", index, ...point } satisfies FieldIn);
  };

  const endDrag = (event: React.PointerEvent<HTMLButtonElement>, index: number, cancelled = false) => {
    const activeDrag = dragRef.current;
    if (!activeDrag || activeDrag.index !== index || activeDrag.pointerId !== event.pointerId) return;
    const point = localPoint(event.clientX, event.clientY);
    const impulse = createThrowImpulse({
      distance: activeDrag.distance,
      velocityX: activeDrag.velocityX,
      velocityY: activeDrag.velocityY,
      cancelled,
    });
    workerRef.current?.postMessage({ type: "drag-move", ...point } satisfies FieldIn);
    workerRef.current?.postMessage({
      type: "drag-end",
      vx: impulse.vx,
      vy: impulse.vy,
      free: impulse.free,
    } satisfies FieldIn);
    dragRef.current = null;
    if (impulse.free) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }
  };

  const keyboardNudge = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (shape !== "card") return;
    const increments: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -28, y: 0 },
      ArrowRight: { x: 28, y: 0 },
      ArrowUp: { x: 0, y: -28 },
      ArrowDown: { x: 0, y: 28 },
    };
    const delta = increments[event.key];
    if (!delta) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const point = localPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    workerRef.current?.postMessage({ type: "drag-start", index, ...point } satisfies FieldIn);
    workerRef.current?.postMessage({ type: "drag-move", x: point.x + delta.x, y: point.y + delta.y } satisfies FieldIn);
    workerRef.current?.postMessage({ type: "drag-end", vx: delta.x / PIXELS_PER_UNIT, vy: delta.y / PIXELS_PER_UNIT, free: true } satisfies FieldIn);
  };

  return (
    <div
      ref={hostRef}
      role="group"
      aria-label={shape === "card" ? "Atlas físico. Arraste os cartões e solte para arremessar; setas do teclado também os movem." : "Campo físico interativo de sistemas"}
      className={`relative ${shape === "card" ? "h-64 sm:h-72 touch-pan-y" : "h-36"} border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(24,86,255,0.18),transparent_60%)] overflow-hidden`}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-[#1856FF]/40 pointer-events-none" />
      <span className="absolute left-3 top-2 z-10 font-mono text-[9px] text-white/40 pointer-events-none">
        RAPIER · {modeLabel} · {LAYOUT_NAMES[layout]} {workerError ? "(falha · modo estático)" : ready ? "" : "(inicializando WASM…)"}
      </span>
      {ids.map((id, index) => {
        const score = scores?.[id];
        const isTop = id === topId;
        const label = SYSTEM_LABEL[id] ?? id;
        const info = cardInfo?.[id];
        const transitionStyle = shape === "card" && !isTop
          ? { viewTransitionName: projectTransitionName(id) } as React.CSSProperties
          : undefined;
        return (
          <button
            key={id}
            ref={(element) => { nodeRefs.current[index] = element; }}
            type="button"
            onPointerDown={(event) => startDrag(event, index)}
            onPointerUp={(event) => endDrag(event, index)}
            onPointerCancel={(event) => endDrag(event, index, true)}
            onKeyDown={(event) => keyboardNudge(event, index)}
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              onSelect(id);
            }}
            aria-pressed={isTop}
            aria-label={shape === "card"
              ? `${info?.title ?? label}${info?.subtitle ? `, ${info.subtitle}` : ""}${score !== undefined ? `, relevância ${score.toFixed(2)}` : ""}. Arraste para mover e solte para arremessar.`
              : `${label}${score !== undefined ? `, relevância ${score.toFixed(2)}` : ""}`}
            aria-keyshortcuts={shape === "card" ? "ArrowLeft ArrowRight ArrowUp ArrowDown" : undefined}
            style={transitionStyle}
            className={shape === "card"
              ? `absolute left-0 top-0 w-44 h-16 px-3 py-2 rounded-xl text-left border backdrop-blur-md cursor-grab active:cursor-grabbing touch-none will-change-transform ${isTop ? "bg-[#1856FF]/90 border-[#38BDF8] text-white shadow-[0_0_24px_rgba(24,86,255,0.45)]" : "bg-slate-950/90 border-white/20 text-white/85 shadow-xl hover:border-white/40"}`
              : `absolute left-0 top-0 px-2 py-1 rounded-full font-mono text-[10px] whitespace-nowrap border backdrop-blur-md cursor-pointer will-change-transform transition-colors ${isTop ? "bg-[#1856FF] border-[#38BDF8] text-white shadow-[0_0_18px_rgba(24,86,255,0.7)]" : "bg-white/[0.08] border-white/15 text-white/75 hover:text-white"}`
            }
          >
            {shape === "card" ? (
              <span className="flex h-full items-center justify-between gap-2 overflow-hidden">
                <span className="min-w-0">
                  <span className="block truncate text-[10px] font-semibold">{info?.title ?? label}</span>
                  <span className="mt-1 block truncate font-mono text-[8px] text-white/55">
                    {info?.subtitle ?? label}{score !== undefined ? ` · ${score.toFixed(2)}` : ""}
                  </span>
                </span>
                <span aria-hidden="true" className="shrink-0 font-mono text-[8px] text-white/35">⠿</span>
              </span>
            ) : (
              <>{label}{score !== undefined && <span className="ml-1 opacity-70">{score.toFixed(2)}</span>}</>
            )}
          </button>
        );
      })}
    </div>
  );
}
