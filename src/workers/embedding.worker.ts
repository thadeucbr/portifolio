/// <reference lib="webworker" />
// Inferência de embeddings 100% no dispositivo do visitante.
// Guideline: linhas 56-80 (Transformers.js v4 + ONNX Runtime Web, WebGPU com fallback WASM,
// Cache API, inferência em Web Worker) e linhas 146-149 (EmbeddingGemma quantizado).

import { env, pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

// Pesos são persistidos no Cache API do navegador: a segunda visita carrega do disco.
env.allowLocalModels = false;
env.useBrowserCache = true;

type Device = "webgpu" | "wasm";

interface Candidate {
  model: string;
  label: string;
  device: Device;
  dtype: "q4" | "q8" | "fp16" | "fp32";
  queryPrefix: string;
  docPrefix: string;
  /** Similaridade mínima para considerar um match confiável (escala depende do modelo). */
  threshold: number;
}

// Ordem de preferência: EmbeddingGemma na GPU → EmbeddingGemma na CPU (WASM) → e5-small multilíngue na CPU.
const CANDIDATES: Candidate[] = [
  {
    model: "onnx-community/embeddinggemma-300m-ONNX",
    label: "EmbeddingGemma-300M",
    device: "webgpu",
    dtype: "q4",
    queryPrefix: "task: search result | query: ",
    docPrefix: "title: none | text: ",
    threshold: 0.3,
  },
  {
    model: "onnx-community/embeddinggemma-300m-ONNX",
    label: "EmbeddingGemma-300M",
    device: "wasm",
    dtype: "q8",
    queryPrefix: "task: search result | query: ",
    docPrefix: "title: none | text: ",
    threshold: 0.3,
  },
  {
    model: "Xenova/multilingual-e5-small",
    label: "multilingual-e5-small",
    device: "wasm",
    dtype: "q8",
    queryPrefix: "query: ",
    docPrefix: "passage: ",
    threshold: 0.8,
  },
];

export interface CorpusChunk {
  id: string;
  systemId: string;
  text: string;
}

export type WorkerIn =
  | { type: "init"; corpus: CorpusChunk[] }
  | { type: "query"; requestId: string; text: string };

export type WorkerOut =
  | { type: "status"; phase: "probing" | "downloading" | "indexing" | "ready" | "error"; detail?: string }
  | { type: "progress"; file: string; loaded: number; total: number }
  | {
      type: "ready";
      model: string;
      device: Device;
      dtype: string;
      dims: number;
      chunks: number;
      threshold: number;
      warmCache: boolean;
      loadMs: number;
      indexMs: number;
    }
  | {
      type: "result";
      requestId: string;
      inferenceMs: number;
      threshold: number;
      ranking: { systemId: string; score: number; bestChunk: string }[];
    }
  | { type: "error"; requestId?: string; message: string };

const post = (msg: WorkerOut) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);

let extractor: FeatureExtractionPipeline | null = null;
let active: Candidate | null = null;
let corpus: CorpusChunk[] = [];
let corpusVectors: Float32Array[] = [];
let dims = 0;

async function hasWebGPU(): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return false;
  try {
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

async function isCacheWarm(model: string): Promise<boolean> {
  try {
    if (!("caches" in self)) return false;
    const cache = await caches.open("transformers-cache");
    const keys = await cache.keys();
    return keys.some((k) => k.url.includes(model));
  } catch {
    return false;
  }
}

async function embed(texts: string[]): Promise<Float32Array[]> {
  if (!extractor) throw new Error("Extractor não inicializado");
  const out = await extractor(texts, { pooling: "mean", normalize: true });
  const [n, d] = out.dims as [number, number];
  const data = out.data as Float32Array;
  const vecs: Float32Array[] = [];
  for (let i = 0; i < n; i++) vecs.push(data.slice(i * d, (i + 1) * d));
  return vecs;
}

// Vetores já normalizados: produto escalar == similaridade de cosseno.
function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

async function init(chunks: CorpusChunk[]) {
  corpus = chunks;
  post({ type: "status", phase: "probing" });
  const gpuOk = await hasWebGPU();

  for (const candidate of CANDIDATES) {
    if (candidate.device === "webgpu" && !gpuOk) continue;
    try {
      const warmCache = await isCacheWarm(candidate.model);
      post({
        type: "status",
        phase: "downloading",
        detail: `${candidate.label} · ${candidate.device.toUpperCase()} · ${candidate.dtype}${warmCache ? " · Cache API" : ""}`,
      });

      const t0 = performance.now();
      extractor = (await pipeline("feature-extraction", candidate.model, {
        device: candidate.device,
        dtype: candidate.dtype,
        progress_callback: (p: { status: string; file?: string; loaded?: number; total?: number }) => {
          if (p.status === "progress" && p.file && p.total) {
            post({ type: "progress", file: p.file, loaded: p.loaded ?? 0, total: p.total });
          }
        },
      })) as FeatureExtractionPipeline;
      const loadMs = performance.now() - t0;

      active = candidate;
      post({ type: "status", phase: "indexing", detail: `${chunks.length} trechos do currículo` });

      const t1 = performance.now();
      corpusVectors = await embed(chunks.map((c) => candidate.docPrefix + c.text));
      dims = corpusVectors[0]?.length ?? 0;
      const indexMs = performance.now() - t1;

      post({
        type: "ready",
        model: candidate.model,
        device: candidate.device,
        dtype: candidate.dtype,
        dims,
        chunks: chunks.length,
        threshold: candidate.threshold,
        warmCache,
        loadMs,
        indexMs,
      });
      return;
    } catch (err) {
      extractor = null;
      post({
        type: "status",
        phase: "probing",
        detail: `Falha em ${candidate.label}/${candidate.device}: ${(err as Error).message}. Tentando próximo backend…`,
      });
    }
  }

  post({ type: "status", phase: "error", detail: "Nenhum backend de inferência disponível neste navegador." });
}

async function query(requestId: string, text: string) {
  if (!extractor || !active) {
    post({ type: "error", requestId, message: "Modelo ainda não está pronto." });
    return;
  }
  const t0 = performance.now();
  const [q] = await embed([active.queryPrefix + text]);

  // Agrega por sistema usando o melhor trecho (max-pooling de relevância).
  const best = new Map<string, { score: number; chunk: string }>();
  corpus.forEach((chunk, i) => {
    const score = dot(q, corpusVectors[i]);
    const cur = best.get(chunk.systemId);
    if (!cur || score > cur.score) best.set(chunk.systemId, { score, chunk: chunk.text });
  });

  const ranking = [...best.entries()]
    .map(([systemId, v]) => ({ systemId, score: v.score, bestChunk: v.chunk }))
    .sort((a, b) => b.score - a.score);

  post({ type: "result", requestId, inferenceMs: performance.now() - t0, threshold: active.threshold, ranking });
}

self.onmessage = (e: MessageEvent<WorkerIn>) => {
  const msg = e.data;
  if (msg.type === "init") void init(msg.corpus);
  if (msg.type === "query") {
    query(msg.requestId, msg.text).catch((err) =>
      post({ type: "error", requestId: msg.requestId, message: (err as Error).message }),
    );
  }
};
