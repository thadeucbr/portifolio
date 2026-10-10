"use client";

import React, { useEffect, useRef } from "react";
import type { MeshIn, MeshOut } from "@/workers/neuralMesh.worker";

/** Backend gráfico efetivamente em uso — publicado para a HUD exibir a verdade, não um selo fixo. */
export function emitRenderBackend(name: string) {
  window.dispatchEvent(new CustomEvent("neural:backend", { detail: { name } }));
}

/**
 * Fundo neural. Este componente não renderiza nada na Main Thread: ele cria um <canvas>,
 * transfere o controle para um Web Worker (OffscreenCanvas) e apenas repassa ponteiro,
 * resize e pulsos de inferência. Todo WebGPU/TSL/Bloom roda em src/workers/neuralMesh.worker.ts.
 */
export function SynapticNeuralMesh({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (typeof OffscreenCanvas === "undefined" || !("transferControlToOffscreen" in HTMLCanvasElement.prototype)) {
      emitRenderBackend("indisponível (sem OffscreenCanvas)");
      return;
    }

    // Canvas criado no efeito: transferControlToOffscreen só pode ser chamado uma vez por elemento,
    // e o StrictMode monta efeitos duas vezes em desenvolvimento.
    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 w-full h-full";
    host.appendChild(canvas);
    const offscreen = canvas.transferControlToOffscreen();

    const worker = new Worker(new URL("../../workers/neuralMesh.worker.ts", import.meta.url), { type: "module" });
    const send = (m: MeshIn, transfer: Transferable[] = []) => worker.postMessage(m, transfer);

    worker.onmessage = (e: MessageEvent<MeshOut>) => {
      if (e.data.type === "backend") emitRenderBackend(e.data.name);
      if (e.data.type === "error") {
        console.error("[neuralMesh.worker]", e.data.message);
        emitRenderBackend("falhou");
      }
    };

    send(
      {
        type: "init",
        canvas: offscreen,
        width: host.clientWidth,
        height: host.clientHeight,
        dpr: window.devicePixelRatio,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      },
      [offscreen],
    );

    const onResize = () =>
      send({ type: "resize", width: host.clientWidth, height: host.clientHeight, dpr: window.devicePixelRatio });
    const onMove = (e: PointerEvent) =>
      send({ type: "pointer", x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 });
    const onPulse = (e: Event) => send({ type: "pulse", intensity: (e as CustomEvent<{ intensity: number }>).detail.intensity });

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("neural:pulse", onPulse);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("neural:pulse", onPulse);
      worker.terminate();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true" />;
}
