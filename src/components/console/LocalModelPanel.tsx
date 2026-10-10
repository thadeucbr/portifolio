"use client";

import { Download, Loader2, Sparkles } from "lucide-react";
import type { LocalAssistantSnapshot } from "@/ai/localAssistantProtocol";

const MODEL_URL = "https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX/tree/d1ea95774d40a29f0479bf9138cdf488a0394b6b";

function formatMegabytes(bytes: number) {
  return `${(bytes / 1_000_000).toFixed(0)} MB`;
}

export function LocalModelPanel({ state, onLoad }: { state: LocalAssistantSnapshot; onLoad: () => void }) {
  const loading = ["probing", "downloading", "loading"].includes(state.phase);
  const percent = Math.max(0, Math.min(100, state.progress?.percent ?? 0));

  return (
    <section className="px-3.5 py-2.5 border-y border-white/10 bg-black/25" aria-label="Modelo de resposta local">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-300" />
          <div className="min-w-0">
            <div className="text-[10px] font-semibold tracking-wide text-violet-200">RESPOSTAS LOCAIS · QWEN3.5 0.8B</div>
            <p className="text-[9px] leading-relaxed text-white/50">
              Opt-in: ~437 MB (WebGPU q4f16) ou ~485 MB (WASM q4), mais tokenizer. Pergunta e evidências ficam no navegador; só o ID do projeto segue ao MCP read-only.
              {" "}
              <a href={MODEL_URL} target="_blank" rel="noreferrer" className="underline decoration-white/30 hover:text-white/80">modelo Apache-2.0</a>
            </p>
          </div>
        </div>
        {state.phase === "ready" ? (
          <span className="shrink-0 rounded border border-violet-400/40 bg-violet-400/10 px-2 py-1 font-mono text-[9px] text-violet-200">
            {state.device?.toUpperCase()} · {state.dtype}
          </span>
        ) : (
          <button
            type="button"
            onClick={onLoad}
            disabled={loading}
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-400/10 px-2.5 py-1.5 font-mono text-[9px] text-violet-100 hover:bg-violet-400/20 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            {loading ? "CARREGANDO" : state.phase === "error" ? "TENTAR DE NOVO" : "ATIVAR MODELO"}
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-2" role="status" aria-live="polite">
          <div className="flex justify-between gap-2 font-mono text-[9px] text-white/55">
            <span className="truncate">{state.detail ?? "Preparando o worker local…"}{state.progress?.file ? ` · ${state.progress.file}` : ""}</span>
            <span className="shrink-0">{percent.toFixed(0)}%{state.progress?.total ? ` · ${formatMegabytes(state.progress.loaded)} / ${formatMegabytes(state.progress.total)}` : ""}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <div className="h-full bg-violet-400 transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
      {state.phase === "error" && <p role="alert" className="mt-1 text-[9px] text-rose-300">{state.detail}</p>}
    </section>
  );
}
