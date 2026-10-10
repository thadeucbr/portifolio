"use client";

import React, { useEffect, useRef, useState } from "react";
import type { FieldIn, FieldOut } from "@/workers/semanticField.worker";
import { SYSTEM_LABEL } from "@/mcp/semanticEngine";

interface Props {
  ids: string[];
  scores: Record<string, number> | null;
  topId?: string;
  modeLabel?: string;
  onSelect: (systemId: string) => void;
}

/**
 * Campo de gravidade semântica: cada sistema é um corpo rígido Rapier. Após cada consulta,
 * a atração ao núcleo é proporcional à similaridade de cosseno — o mais relevante "afunda"
 * no centro. Clicar num corpo seleciona o módulo local daquele sistema.
 */
export function SemanticGravityField({ ids, scores, topId, modeLabel = "gravidade semântica", onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const worker = new Worker(new URL("../../workers/semanticField.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<FieldOut>) => {
      if (e.data.type === "ready") setReady(true);
      if (e.data.type === "frame") {
        const p = e.data.positions;
        chipRefs.current.forEach((el, i) => {
          if (el) el.style.transform = `translate(${p[i * 2]}px, ${p[i * 2 + 1]}px) translate(-50%, -50%)`;
        });
      }
    };

    const send = (m: FieldIn) => worker.postMessage(m);
    send({ type: "init", ids, width: host.clientWidth, height: host.clientHeight });

    const ro = new ResizeObserver(() => send({ type: "resize", width: host.clientWidth, height: host.clientHeight }));
    ro.observe(host);

    const onMove = (ev: PointerEvent) => {
      const r = host.getBoundingClientRect();
      send({ type: "pointer", x: ev.clientX - r.left, y: ev.clientY - r.top, active: true });
    };
    const onLeave = () => send({ type: "pointer", x: 0, y: 0, active: false });
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      worker.terminate();
      workerRef.current = null;
    };
  }, [ids]);

  useEffect(() => {
    if (scores && workerRef.current) workerRef.current.postMessage({ type: "scores", scores } satisfies FieldIn);
  }, [scores]);

  return (
    <div
      ref={hostRef}
      role="group"
      aria-label="Campo físico interativo de sistemas"
      className="relative h-36 border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(24,86,255,0.18),transparent_60%)] overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-[#1856FF]/40 pointer-events-none" />
      <span className="absolute left-3 top-2 font-mono text-[9px] text-white/40 pointer-events-none">
        RAPIER · {modeLabel} {ready ? "" : "(inicializando WASM…)"}
      </span>
      {ids.map((id, i) => {
        const s = scores?.[id];
        const isTop = id === topId;
        return (
          <button
            key={id}
            type="button"
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            onClick={() => onSelect(id)}
            aria-pressed={isTop}
            aria-label={`${SYSTEM_LABEL[id] ?? id}${s !== undefined ? `, relevância ${s.toFixed(2)}` : ""}`}
            className={`absolute left-0 top-0 px-2 py-1 rounded-full font-mono text-[10px] whitespace-nowrap border backdrop-blur-md cursor-pointer will-change-transform transition-colors ${
              isTop
                ? "bg-[#1856FF] border-[#38BDF8] text-white shadow-[0_0_18px_rgba(24,86,255,0.7)]"
                : "bg-white/[0.08] border-white/15 text-white/75 hover:text-white"
            }`}
          >
            {SYSTEM_LABEL[id] ?? id}
            {s !== undefined && <span className="ml-1 opacity-70">{s.toFixed(2)}</span>}
          </button>
        );
      })}
    </div>
  );
}
