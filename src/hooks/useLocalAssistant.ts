"use client";

import { useCallback, useEffect, useState } from "react";
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

// Singleton compartilhado por aba: o modelo sobrevive à troca de páginas e permanece pronto na memória.
let sharedWorker: Worker | null = null;
let sharedState: LocalAssistantSnapshot = INITIAL_STATE;
const listeners = new Set<(snapshot: LocalAssistantSnapshot) => void>();
const pendingMap = new Map<string, PendingGeneration>();
let requestCounter = 0;

function setSharedState(updater: (previous: LocalAssistantSnapshot) => LocalAssistantSnapshot) {
  sharedState = updater(sharedState);
  for (const listener of listeners) listener(sharedState);
}

function ensureSharedWorker() {
  if (sharedWorker || typeof window === "undefined") return sharedWorker;
  const worker = new Worker(new URL("../workers/localAnswer.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<LocalAssistantResponse>) => {
    const message = event.data;
    if (message.type === "status") {
      setSharedState((previous) => ({
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
      setSharedState((previous) => ({ ...previous, phase: "downloading", progress: message }));
      return;
    }
    if (message.type === "token") {
      pendingMap.get(message.requestId)?.onToken?.(message.text);
      return;
    }
    if (message.type === "done") {
      setSharedState((previous) => ({
        ...previous,
        phase: "ready",
        progress: null,
        model: message.model,
        revision: message.revision,
        device: message.device,
        dtype: message.dtype,
        inferenceMs: message.inferenceMs,
        firstTokenMs: message.firstTokenMs,
        generatedTokens: message.generatedTokens,
      }));
      pendingMap.get(message.requestId)?.resolve({
        answer: message.answer,
        inferenceMs: message.inferenceMs,
        firstTokenMs: message.firstTokenMs,
        generatedTokens: message.generatedTokens,
        model: message.model,
        revision: message.revision,
        device: message.device,
        dtype: message.dtype,
      });
      pendingMap.delete(message.requestId);
      return;
    }
    if (message.type === "failure") {
      if (message.requestId) {
        pendingMap.get(message.requestId)?.reject(new Error(message.detail));
        pendingMap.delete(message.requestId);
      } else {
        setSharedState((previous) => ({ ...previous, phase: "error", detail: message.detail, progress: null }));
      }
    }
  };
  worker.onerror = () => {
    setSharedState((previous) => ({ ...previous, phase: "error", detail: "O worker local falhou. Tente carregar o modelo novamente." }));
    for (const pending of pendingMap.values()) pending.reject(new Error("Local model worker failed."));
    pendingMap.clear();
  };
  sharedWorker = worker;
  return sharedWorker;
}

export function useLocalAssistant() {
  const [state, setState] = useState<LocalAssistantSnapshot>(sharedState);

  useEffect(() => {
    listeners.add(setState);
    setState(sharedState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const loadModel = useCallback(() => {
    if (sharedState.phase === "ready" || ["probing", "downloading", "loading"].includes(sharedState.phase)) return;
    const worker = ensureSharedWorker();
    if (!worker) return;
    const request: LocalAssistantRequest = { type: "load" };
    worker.postMessage(request);
  }, []);

  const generate = useCallback((messages: PortfolioChatMessage[], onToken?: (text: string) => void) => {
    if (sharedState.phase !== "ready") return Promise.reject(new Error("O modelo local ainda não está pronto."));
    const worker = ensureSharedWorker();
    if (!worker) return Promise.reject(new Error("Worker indisponível."));
    const requestId = `answer-${++requestCounter}`;
    return new Promise<LocalAssistantCompletion>((resolve, reject) => {
      pendingMap.set(requestId, { resolve, reject, onToken });
      try {
        worker.postMessage({ type: "generate", requestId, messages } satisfies LocalAssistantRequest);
      } catch (error) {
        pendingMap.delete(requestId);
        reject(error instanceof Error ? error : new Error("Não foi possível iniciar a geração local."));
      }
    });
  }, []);

  return { state, loadModel, generate };
}
