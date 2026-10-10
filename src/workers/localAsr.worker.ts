/// <reference lib="webworker" />

import { env, pipeline } from "@huggingface/transformers";
import type { LocalAsrDevice, LocalAsrRequest, LocalAsrResponse } from "../ai/localAsrProtocol";

const MODEL_ID = "onnx-community/whisper-small";
const MODEL_REVISION = "36050c46d777d46dc4b5f43f6d90574fc38f8732";
const scope = globalThis as unknown as {
  navigator: { gpu?: unknown };
  postMessage: (message: LocalAsrResponse, transfer?: Transferable[]) => void;
  addEventListener: (type: "message", listener: (event: MessageEvent<LocalAsrRequest>) => void) => void;
};

type Transcriber = {
  (audio: Float32Array, options?: { language?: string; task?: string; chunk_length_s?: number; stride_length_s?: number }): Promise<{ text: string }>;
  dispose?: () => Promise<void>;
};

type ActiveModel = { device: LocalAsrDevice; transcriber: Transcriber };

let activeModel: ActiveModel | null = null;
let loadPromise: Promise<void> | null = null;

env.allowLocalModels = false;
env.useBrowserCache = true;

function post(message: LocalAsrResponse) {
  scope.postMessage(message);
}

function candidates(): LocalAsrDevice[] {
  return typeof scope.navigator.gpu !== "undefined" ? ["webgpu", "wasm"] : ["wasm"];
}

function progressCallback(event: unknown) {
  if (!event || typeof event !== "object") return;
  const item = event as { status?: string; file?: string; loaded?: number; total?: number; progress?: number };
  if (item.status === "progress_total" && typeof item.loaded === "number" && typeof item.total === "number") {
    post({ type: "status", phase: "downloading", detail: "Whisper Small · pesos e tokenizer", loaded: item.loaded, total: item.total, percent: item.progress ?? 0 });
  } else if (item.status === "progress" && typeof item.loaded === "number" && typeof item.total === "number") {
    post({ type: "status", phase: "downloading", detail: item.file ?? "arquivo ONNX", loaded: item.loaded, total: item.total, percent: item.progress ?? 0 });
  }
}

function safeErrorDetail(error: unknown) {
  const raw = error instanceof Error ? error.message.toLowerCase() : "";
  if (/network|fetch|http|download|timeout/.test(raw)) {
    return "O modelo Whisper Small não pôde ser baixado. Verifique a conexão e tente novamente.";
  }
  return "A transcrição local falhou neste dispositivo. O áudio permaneceu nesta aba.";
}

async function ensureModel() {
  if (activeModel) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    post({ type: "status", phase: "probing", detail: "Preparando Whisper Small local…" });
    let lastError: unknown;
    for (const device of candidates()) {
      post({
        type: "status",
        phase: "downloading",
        detail: device === "webgpu" ? "Carregando pesos ONNX Q4 no WebGPU…" : "Carregando pesos ONNX Q4 no fallback WASM…",
        device,
      });
      try {
        const transcriber = await pipeline("automatic-speech-recognition", MODEL_ID, {
          device,
          dtype: "q4",
          revision: MODEL_REVISION,
          progress_callback: progressCallback,
        }) as unknown as Transcriber;
        activeModel = { device, transcriber };
        post({ type: "status", phase: "ready", detail: `Whisper Small pronto em ${device.toUpperCase()}.`, device });
        return;
      } catch (error) {
        lastError = error;
        if (device === "wasm" || /network|fetch|http|download|timeout/i.test(error instanceof Error ? error.message : "")) throw error;
        post({ type: "status", phase: "loading", detail: "WebGPU indisponível para este checkpoint; alternando para WASM Q4…", device: "wasm" });
      }
    }
    throw lastError ?? new Error("No local ASR backend is available.");
  })().finally(() => {
    loadPromise = null;
  });
  return loadPromise;
}

async function transcribe(requestId: string, audio: Float32Array) {
  if (!(audio instanceof Float32Array) || audio.length === 0) throw new Error("O áudio não contém amostras válidas.");
  await ensureModel();
  const model = activeModel;
  if (!model) throw new Error("Whisper Small ainda não está pronto.");
  const start = performance.now();
  const result = await model.transcriber(audio, { task: "transcribe", language: "portuguese", chunk_length_s: 30, stride_length_s: 5 });
  const text = result.text.trim();
  if (!text) throw new Error("Nenhuma fala reconhecível foi encontrada.");
  post({ type: "transcript", requestId, text, inferenceMs: performance.now() - start, device: model.device, model: MODEL_ID, revision: MODEL_REVISION });
}

async function handle(request: LocalAsrRequest) {
  if (request.type === "load") {
    try {
      await ensureModel();
    } catch (error) {
      post({ type: "status", phase: "error", detail: safeErrorDetail(error) });
    }
    return;
  }

  try {
    post({ type: "status", phase: "loading", detail: "Transcrevendo áudio localmente…", device: activeModel?.device });
    await transcribe(request.requestId, request.audio);
  } catch (error) {
    post({ type: "failure", requestId: request.requestId, detail: safeErrorDetail(error) });
  }
}

scope.addEventListener("message", (event) => {
  void handle(event.data);
});
