"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkerIn, WorkerOut } from "@/workers/embedding.worker";
import { buildCorpus, lexicalRank } from "@/mcp/semanticEngine";

export interface RuntimeInfo {
  model: string;
  device: "webgpu" | "wasm";
  dtype: string;
  dims: number;
  chunks: number;
  threshold: number;
  warmCache: boolean;
  loadMs: number;
  indexMs: number;
}

export interface EngineState {
  phase: "idle" | "probing" | "downloading" | "indexing" | "ready" | "error";
  detail?: string;
  progress: number; // 0..1, agregado de todos os arquivos
  runtime?: RuntimeInfo;
}

export interface RankResult {
  engine: "neural" | "lexical";
  inferenceMs: number;
  threshold: number;
  ranking: { systemId: string; score: number; bestChunk?: string }[];
}

/** Notifica o fundo neural (render worker) de que houve atividade de inferência. */
export function emitNeuralPulse(intensity: number) {
  window.dispatchEvent(new CustomEvent("neural:pulse", { detail: { intensity } }));
}

// Worker único por aba: o modelo é carregado uma vez e sobrevive à troca de telas.
let sharedWorker: Worker | null = null;
let sharedState: EngineState = { phase: "idle", progress: 0 };
const listeners = new Set<(s: EngineState) => void>();
const pending = new Map<string, (r: RankResult) => void>();
const fileProgress = new Map<string, { loaded: number; total: number }>();
const corpus = buildCorpus();

function setShared(patch: Partial<EngineState>) {
  sharedState = { ...sharedState, ...patch };
  listeners.forEach((l) => l(sharedState));
}

function ensureWorker() {
  if (sharedWorker || typeof window === "undefined") return;
  sharedWorker = new Worker(new URL("../workers/embedding.worker.ts", import.meta.url), { type: "module" });
  sharedWorker.onmessage = (e: MessageEvent<WorkerOut>) => {
    const m = e.data;
    switch (m.type) {
      case "status":
        setShared({ phase: m.phase, detail: m.detail });
        break;
      case "progress": {
        fileProgress.set(m.file, { loaded: m.loaded, total: m.total });
        let l = 0;
        let t = 0;
        fileProgress.forEach((v) => {
          l += v.loaded;
          t += v.total;
        });
        setShared({ progress: t ? l / t : 0 });
        break;
      }
      case "ready": {
        const { type: _t, ...runtime } = m;
        void _t;
        setShared({ phase: "ready", progress: 1, runtime, detail: undefined });
        emitNeuralPulse(1);
        break;
      }
      case "result":
        pending.get(m.requestId)?.({
          engine: "neural",
          inferenceMs: m.inferenceMs,
          threshold: m.threshold,
          ranking: m.ranking,
        });
        pending.delete(m.requestId);
        break;
      case "error":
        if (m.requestId) pending.delete(m.requestId);
        setShared({ detail: m.message });
        break;
    }
  };
  const init: WorkerIn = { type: "init", corpus };
  sharedWorker.postMessage(init);
}

export function useEdgeEmbeddings() {
  const [state, setState] = useState<EngineState>(sharedState);
  const counter = useRef(0);

  useEffect(() => {
    ensureWorker();
    listeners.add(setState);
    setState(sharedState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const rank = useCallback(async (text: string): Promise<RankResult> => {
    emitNeuralPulse(0.6);
    if (sharedState.phase !== "ready" || !sharedWorker) {
      const t0 = performance.now();
      const ranking = lexicalRank(text, corpus);
      return { engine: "lexical", inferenceMs: performance.now() - t0, threshold: 0.12, ranking };
    }
    const requestId = `q${Date.now()}-${counter.current++}`;
    const result = await new Promise<RankResult>((resolve) => {
      pending.set(requestId, resolve);
      const msg: WorkerIn = { type: "query", requestId, text };
      sharedWorker!.postMessage(msg);
    });
    emitNeuralPulse(Math.min(1, Math.max(0.3, result.ranking[0]?.score ?? 0)));
    return result;
  }, []);

  return { state, rank };
}
