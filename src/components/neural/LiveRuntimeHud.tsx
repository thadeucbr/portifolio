"use client";

import React, { useEffect, useState } from "react";
import { Cpu, MonitorDot } from "lucide-react";
import { useEdgeEmbeddings } from "@/hooks/useEdgeEmbeddings";

/** HUD com telemetria verdadeira: o que está rodando de fato neste navegador agora. */
export function LiveRuntimeHud() {
  const { state } = useEdgeEmbeddings();
  const [render, setRender] = useState("detectando…");

  useEffect(() => {
    const on = (e: Event) => setRender((e as CustomEvent<{ name: string }>).detail.name);
    window.addEventListener("neural:backend", on);
    return () => window.removeEventListener("neural:backend", on);
  }, []);

  const rt = state.runtime;
  const inference = rt
    ? `${rt.model.split("/")[1]} · ${rt.device.toUpperCase()} ${rt.dtype}`
    : state.phase === "error"
      ? "indisponível"
      : `carregando ${Math.round(state.progress * 100)}%`;

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
      <span className="px-2.5 py-1 rounded-full bg-[#1856FF]/15 border border-[#1856FF]/35 text-[#38BDF8] flex items-center gap-1.5">
        <MonitorDot className="w-3 h-3" /> RENDER: {render} · TSL · OffscreenCanvas worker
      </span>
      <span
        className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
          rt ? "bg-[#07CA6B]/10 border-[#07CA6B]/30 text-[#07CA6B]" : "bg-white/[0.06] border-white/15 text-white/60"
        }`}
      >
        <Cpu className="w-3 h-3" /> INFERÊNCIA: {inference}
      </span>
    </div>
  );
}
