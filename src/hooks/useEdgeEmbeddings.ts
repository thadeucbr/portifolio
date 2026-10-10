"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import type { WorkerIn, WorkerOut } from "@/workers/embedding.worker";
import { buildCorpus, lexicalRank } from "@/mcp/semanticEngine";
import { createSharedStore } from "./sharedEngineStore.mjs";

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

let sharedWorker: Worker | null = null;
let workerInitSent = false;
const engineStore = createSharedStore<EngineState>({ phase: "idle", progress: 0 });
type PendingRank = { resolve: (result: RankResult) => void; reject: (error: Error) => void };
const pending = new Map<string, PendingRank>();
const fileProgress = new Map<string, { loaded: number; total: number }>();
const corpus = buildCorpus();

function setShared(patch: Partial<EngineState>) {
  engineStore.publish(patch);
}

function subscribeEngine(listener: () => void) {
  return engineStore.subscribe(listener);
}

function getEngineSnapshot() {
  return engineStore.getSnapshot();
}

function rejectPending(error: Error) {
  for (const request of pending.values()) request.reject(error);
  pending.clear();
}

function ensureWorker() {
  if (sharedWorker || typeof window === "undefined") return sharedWorker;
  try {
    const worker = new Worker(new URL("../workers/embedding.worker.ts", import.meta.url), { type: "module" });
    sharedWorker = worker;
    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      const m = e.data;
      switch (m.type) {
        case "status":
          if (m.phase === "error") workerInitSent = false;
          setShared({ phase: m.phase, detail: m.detail, ...(m.phase === "error" ? { progress: 0 } : {}) });
          break;
        case "progress": {
          fileProgress.set(m.file, { loaded: m.loaded, total: m.total });
          let loaded = 0;
          let total = 0;
          fileProgress.forEach((value) => {
            loaded += value.loaded;
            total += value.total;
          });
          setShared({ progress: total ? loaded / total : 0 });
          break;
        }
        case "ready": {
          const { type: _type, ...runtime } = m;
          void _type;
          setShared({ phase: "ready", progress: 1, runtime, detail: undefined });
          emitNeuralPulse(1);
          break;
        }
        case "result": {
          pending.get(m.requestId)?.resolve({
            engine: "neural",
            inferenceMs: m.inferenceMs,
            threshold: m.threshold,
            ranking: m.ranking,
          });
          pending.delete(m.requestId);
          break;
        }
        case "error": {
          const request = m.requestId ? pending.get(m.requestId) : undefined;
          request?.reject(new Error(m.message));
          if (m.requestId) pending.delete(m.requestId);
          else {
            workerInitSent = false;
            setShared({ phase: "error", progress: 0, detail: m.message });
          }
          break;
        }
      }
    };
    worker.onerror = (event) => {
      const error = new Error(event.message || "O worker de embeddings falhou.");
      rejectPending(error);
      worker.terminate();
      if (sharedWorker === worker) sharedWorker = null;
      workerInitSent = false;
      setShared({ phase: "error", progress: 0, detail: "Falha no worker de embeddings; o fallback lexical continua disponível." });
    };
    return worker;
  } catch (error) {
    workerInitSent = false;
    setShared({ phase: "error", progress: 0, detail: error instanceof Error ? error.message : "Não foi possível iniciar o worker de embeddings." });
    return null;
  }
}

function initializeWorker() {
  const worker = ensureWorker();
  if (!worker || workerInitSent) return;
  workerInitSent = true;
  fileProgress.clear();
  setShared({ phase: "probing", progress: 0, detail: "Verificando inferência local…" });
  try {
    const init: WorkerIn = { type: "init", corpus };
    worker.postMessage(init);
  } catch (error) {
    workerInitSent = false;
    setShared({ phase: "error", progress: 0, detail: error instanceof Error ? error.message : "Não foi possível iniciar embeddings." });
  }
}

export function useEdgeEmbeddings() {
  const state = useSyncExternalStore(subscribeEngine, getEngineSnapshot, getEngineSnapshot);
  const counter = useRef(0);

  const loadEmbeddings = useCallback(() => {
    const phase = engineStore.getSnapshot().phase;
    if (phase === "ready" || ["probing", "downloading", "indexing"].includes(phase)) return;
    initializeWorker();
  }, []);

  const rank = useCallback(async (text: string): Promise<RankResult> => {
    emitNeuralPulse(0.6);
    const currentWorker = sharedWorker;
    if (engineStore.getSnapshot().phase !== "ready" || !currentWorker) {
      const t0 = performance.now();
      const ranking = lexicalRank(text, corpus);
      return { engine: "lexical", inferenceMs: performance.now() - t0, threshold: 0.12, ranking };
    }

    const requestId = `q${Date.now()}-${counter.current++}`;
    try {
      const result = await new Promise<RankResult>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          const request = pending.get(requestId);
          if (!request) return;
          pending.delete(requestId);
          request.reject(new Error("A busca neural excedeu o tempo limite."));
        }, 30_000);
        pending.set(requestId, {
          resolve: (value) => { window.clearTimeout(timeout); resolve(value); },
          reject: (error) => { window.clearTimeout(timeout); reject(error); },
        });
        try {
          const msg: WorkerIn = { type: "query", requestId, text };
          currentWorker.postMessage(msg);
        } catch (error) {
          pending.delete(requestId);
          window.clearTimeout(timeout);
          reject(error instanceof Error ? error : new Error("Falha ao enviar consulta ao worker."));
        }
      });
      emitNeuralPulse(Math.min(1, Math.max(0.3, result.ranking[0]?.score ?? 0)));
      return result;
    } catch {
      const t0 = performance.now();
      const ranking = lexicalRank(text, corpus);
      return { engine: "lexical", inferenceMs: performance.now() - t0, threshold: 0.12, ranking };
    }
  }, []);

  return { state, rank, loadEmbeddings };
}
