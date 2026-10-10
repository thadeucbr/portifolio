"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LocalAssistantCompletion,
  LocalAssistantRequest,
  LocalAssistantResponse,
  LocalAssistantSnapshot,
  PortfolioChatMessage,
} from "@/ai/localAssistantProtocol";

interface PendingGeneration {
  resolve: (result: LocalAssistantCompletion) => void;
  reject: (error: Error) => void;
  onToken?: (text: string) => void;
}

const INITIAL_STATE: LocalAssistantSnapshot = { phase: "idle", progress: null };

export function useLocalAssistant() {
  const [state, setState] = useState<LocalAssistantSnapshot>(INITIAL_STATE);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<string, PendingGeneration>());
  const requestCounterRef = useRef(0);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(new URL("../workers/localAnswer.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<LocalAssistantResponse>) => {
      const message = event.data;
      if (message.type === "status") {
        setState((previous) => ({
          ...previous,
          phase: message.phase,
          detail: message.detail,
          model: message.model ?? previous.model,
          revision: message.revision ?? previous.revision,
          device: message.device ?? previous.device,
          dtype: message.dtype ?? previous.dtype,
          progress: message.phase === "ready" ? null : previous.progress,
        }));
        return;
      }
      if (message.type === "progress") {
        setState((previous) => ({ ...previous, phase: "downloading", progress: message }));
        return;
      }
      if (message.type === "token") {
        pendingRef.current.get(message.requestId)?.onToken?.(message.text);
        return;
      }
      if (message.type === "done") {
        setState((previous) => ({
          ...previous,
          phase: "ready",
          progress: null,
          model: message.model,
          revision: message.revision,
          device: message.device,
          dtype: message.dtype,
          inferenceMs: message.inferenceMs,
        }));
        pendingRef.current.get(message.requestId)?.resolve({
          answer: message.answer,
          inferenceMs: message.inferenceMs,
          model: message.model,
          revision: message.revision,
          device: message.device,
          dtype: message.dtype,
        });
        pendingRef.current.delete(message.requestId);
        return;
      }
      if (message.type === "failure") {
        if (message.requestId) {
          pendingRef.current.get(message.requestId)?.reject(new Error(message.detail));
          pendingRef.current.delete(message.requestId);
        } else {
          setState((previous) => ({ ...previous, phase: "error", detail: message.detail, progress: null }));
        }
      }
    };
    worker.onerror = () => {
      setState((previous) => ({ ...previous, phase: "error", detail: "O worker local falhou. Tente carregar o modelo novamente." }));
      for (const pending of pendingRef.current.values()) pending.reject(new Error("Local model worker failed."));
      pendingRef.current.clear();
    };
    workerRef.current = worker;
    return worker;
  }, []);

  const loadModel = useCallback(() => {
    if (state.phase === "ready" || ["probing", "downloading", "loading"].includes(state.phase)) return;
    const request: LocalAssistantRequest = { type: "load" };
    ensureWorker().postMessage(request);
  }, [ensureWorker, state.phase]);

  const generate = useCallback((messages: PortfolioChatMessage[], onToken?: (text: string) => void) => {
    if (state.phase !== "ready") return Promise.reject(new Error("O modelo local ainda não está pronto."));
    const requestId = `answer-${++requestCounterRef.current}`;
    return new Promise<LocalAssistantCompletion>((resolve, reject) => {
      pendingRef.current.set(requestId, { resolve, reject, onToken });
      try {
        ensureWorker().postMessage({ type: "generate", requestId, messages } satisfies LocalAssistantRequest);
      } catch (error) {
        pendingRef.current.delete(requestId);
        reject(error instanceof Error ? error : new Error("Não foi possível iniciar a geração local."));
      }
    });
  }, [ensureWorker, state.phase]);

  useEffect(() => () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    for (const pending of pendingRef.current.values()) pending.reject(new Error("Local assistant unmounted."));
    pendingRef.current.clear();
  }, []);

  return { state, loadModel, generate };
}
