import { env, pipeline, TextStreamer, type TextGenerationPipeline } from "@huggingface/transformers";
import { cleanGeneratedAnswer, createSafeAnswerStreamFilter } from "../mcp/answerPrompt.mjs";
import type {
  LocalAssistantDevice,
  LocalAssistantDtype,
  LocalAssistantRequest,
  LocalAssistantResponse,
  PortfolioChatMessage,
} from "../ai/localAssistantProtocol";

const MODEL_ID = "onnx-community/Qwen3.5-0.8B-ONNX";
const MODEL_REVISION = "d1ea95774d40a29f0479bf9138cdf488a0394b6b";
type GpuAdapterLike = { features: { has(feature: string): boolean } };
type GpuLike = { requestAdapter(options?: { powerPreference?: "high-performance" | "low-power" }): Promise<GpuAdapterLike | null> };
const workerScope = globalThis as unknown as {
  navigator: { gpu?: GpuLike };
  postMessage: (message: LocalAssistantResponse) => void;
  addEventListener: (type: "message", listener: (event: MessageEvent<LocalAssistantRequest>) => void) => void;
};

type Candidate = { device: LocalAssistantDevice; dtype: LocalAssistantDtype };
type ActiveModel = Candidate & { pipeline: TextGenerationPipeline };

let activeModel: ActiveModel | null = null;
let loadPromise: Promise<void> | null = null;

env.allowLocalModels = false;
env.useBrowserCache = true;
// Notebooks híbridos: sem isto o ONNX Runtime pode pegar a GPU integrada.
const onnxEnv = env.backends.onnx as { webgpu?: { powerPreference?: string } };
onnxEnv.webgpu = { ...onnxEnv.webgpu, powerPreference: "high-performance" };

function post(message: LocalAssistantResponse) {
  workerScope.postMessage(message);
}

function safeErrorDetail(error: unknown) {
  const detail = error instanceof Error ? error.message.toLowerCase() : "";
  if (/network|fetch|http|download|timeout/.test(detail)) {
    return "Não foi possível baixar os pesos do modelo. Verifique a conexão e tente novamente.";
  }
  return "O modelo não pôde ser carregado neste dispositivo. A busca semântica continua disponível.";
}

/**
 * Ordem: WebGPU q4f16 (só se o adaptador expõe shader-f16) → WebGPU q4 → WASM q4.
 * WASM é o último recurso: sem cross-origin isolation ele roda em uma única thread.
 */
async function candidates(forceWasm = false): Promise<Candidate[]> {
  const wasm: Candidate = { device: "wasm", dtype: "q4" };
  if (forceWasm || !workerScope.navigator.gpu) return [wasm];
  let adapter: GpuAdapterLike | null = null;
  try {
    adapter = await workerScope.navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  } catch {
    adapter = null;
  }
  if (!adapter) return [wasm];
  const list: Candidate[] = [];
  if (adapter.features.has("shader-f16")) list.push({ device: "webgpu", dtype: "q4f16" });
  list.push({ device: "webgpu", dtype: "q4" }, wasm);
  return list;
}

function reportProgress(event: unknown) {
  if (typeof event !== "object" || event === null) return;
  const progress = event as {
    status?: string;
    file?: string;
    loaded?: number;
    total?: number;
    progress?: number;
  };
  if (progress.status === "progress_total" && typeof progress.loaded === "number" && typeof progress.total === "number") {
    post({
      type: "progress",
      file: "pesos e tokenizer",
      loaded: progress.loaded,
      total: progress.total,
      percent: progress.progress ?? 0,
    });
    return;
  }
  if (progress.status === "progress" && typeof progress.loaded === "number" && typeof progress.total === "number") {
    post({
      type: "progress",
      file: progress.file ?? "arquivo do modelo",
      loaded: progress.loaded,
      total: progress.total,
      percent: progress.progress ?? 0,
    });
  }
}

async function ensureModel(forceWasm = false) {
  if (activeModel && (!forceWasm || activeModel.device === "wasm")) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    post({ type: "status", phase: "probing", detail: "Verificando backend local…", model: MODEL_ID, revision: MODEL_REVISION });
    let lastError: unknown;
    for (const candidate of await candidates(forceWasm)) {
      post({
        type: "status",
        phase: "downloading",
        detail: candidate.device === "webgpu" ? "Carregando Qwen3.5 0.8B q4f16 no WebGPU…" : "Carregando Qwen3.5 0.8B q4 no fallback WASM…",
        model: MODEL_ID,
        revision: MODEL_REVISION,
        device: candidate.device,
        dtype: candidate.dtype,
      });
      try {
        const generator = await pipeline("text-generation", MODEL_ID, {
          device: candidate.device,
          dtype: candidate.dtype,
          revision: MODEL_REVISION,
          progress_callback: reportProgress,
        });
        activeModel = { ...candidate, pipeline: generator };
        
        // Warmup rápido de 1 token para compilar shaders WebGPU sem penalizar a primeira pergunta:
        try {
          await generator([{ role: "user", content: "ok" }], { max_new_tokens: 1, do_sample: false });
        } catch {
          // Warmup é best-effort
        }

        post({
          type: "status",
          phase: "ready",
          detail: `Qwen3.5 0.8B pronto em ${candidate.device === "webgpu" ? "WebGPU" : "WASM"}.`,
          model: MODEL_ID,
          revision: MODEL_REVISION,
          device: candidate.device,
          dtype: candidate.dtype,
        });
        return;
      } catch (error) {
        lastError = error;
        if (candidate.device === "wasm" || /network|fetch|http|download|timeout/i.test(error instanceof Error ? error.message : "")) {
          throw error;
        }
        post({
          type: "status",
          phase: "loading",
          detail: "WebGPU indisponível para este modelo; tentando o fallback WASM q4…",
          model: MODEL_ID,
          revision: MODEL_REVISION,
        });
      }
    }
    throw lastError ?? new Error("No compatible local inference backend.");
  })().finally(() => {
    loadPromise = null;
  });

  return loadPromise;
}

function extractAnswer(output: unknown) {
  if (!Array.isArray(output)) return "";
  const first = output[0];
  if (typeof first !== "object" || first === null || !("generated_text" in first)) return "";
  const generated = first.generated_text;
  if (typeof generated === "string") return generated;
  if (!Array.isArray(generated)) return "";
  const last = generated.at(-1);
  if (typeof last === "object" && last !== null && "content" in last && typeof last.content === "string") {
    return last.content;
  }
  return "";
}

async function runGeneration(requestId: string, messages: PortfolioChatMessage[]) {
  const model = activeModel;
  if (!model) throw new Error("Local model is not ready.");
  const start = performance.now();
  let firstTokenMs: number | undefined;
  let generatedTokens = 0;
  const filter = createSafeAnswerStreamFilter((text) => post({ type: "token", requestId, text }));
  const streamer = new TextStreamer(model.pipeline.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => filter.push(text),
    token_callback_function: (tokens) => {
      generatedTokens += tokens.length;
      if (firstTokenMs === undefined && tokens.length > 0) firstTokenMs = performance.now() - start;
    },
  });
  const output = await model.pipeline(messages, {
    max_new_tokens: 48,
    do_sample: false,
    streamer,
    tokenizer_encode_kwargs: { enable_thinking: false },
  });
  filter.finish();
  const answer = cleanGeneratedAnswer(extractAnswer(output));
  if (!answer) throw new Error("The local model returned an empty answer.");
  return {
    answer,
    inferenceMs: performance.now() - start,
    firstTokenMs: firstTokenMs ?? performance.now() - start,
    generatedTokens,
    model: MODEL_ID,
    revision: MODEL_REVISION,
    device: model.device,
    dtype: model.dtype,
  };
}

async function handleRequest(message: LocalAssistantRequest) {
  if (message.type === "load") {
    try {
      await ensureModel();
    } catch (error) {
      post({ type: "failure", detail: safeErrorDetail(error) });
    }
    return;
  }

  try {
    if (!activeModel) await ensureModel();
    try {
      const completion = await runGeneration(message.requestId, message.messages);
      post({ type: "done", requestId: message.requestId, ...completion });
    } catch (error) {
      if (activeModel?.device !== "webgpu") throw error;
      try {
        await activeModel.pipeline.dispose();
      } catch {
        // Releasing a failed GPU session is best-effort before the WASM fallback.
      }
      activeModel = null;
      post({ type: "status", phase: "loading", detail: "Falha durante a inferência WebGPU; alternando para WASM q4…", model: MODEL_ID, revision: MODEL_REVISION });
      await ensureModel(true);
      const completion = await runGeneration(message.requestId, message.messages);
      post({ type: "done", requestId: message.requestId, ...completion });
    }
  } catch (error) {
    post({ type: "failure", requestId: message.requestId, detail: safeErrorDetail(error) });
  }
}

workerScope.addEventListener("message", (event: MessageEvent<LocalAssistantRequest>) => {
  void handleRequest(event.data);
});
