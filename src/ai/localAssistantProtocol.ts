export type LocalAssistantDevice = "webgpu" | "wasm";
export type LocalAssistantDtype = "q4f16" | "q4";
export type LocalAssistantPhase = "idle" | "probing" | "downloading" | "loading" | "ready" | "error";

export interface PortfolioChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type LocalAssistantRequest =
  | { type: "load" }
  | { type: "generate"; requestId: string; messages: PortfolioChatMessage[] };

export type LocalAssistantResponse =
  | {
      type: "status";
      phase: Exclude<LocalAssistantPhase, "idle">;
      detail: string;
      model?: string;
      revision?: string;
      device?: LocalAssistantDevice;
      dtype?: LocalAssistantDtype;
    }
  | { type: "progress"; file: string; loaded: number; total: number; percent: number }
  | { type: "token"; requestId: string; text: string }
  | {
      type: "done";
      requestId: string;
      answer: string;
      inferenceMs: number;
      model: string;
      revision: string;
      device: LocalAssistantDevice;
      dtype: LocalAssistantDtype;
    }
  | { type: "failure"; requestId?: string; detail: string };

export interface LocalAssistantSnapshot {
  phase: LocalAssistantPhase;
  detail?: string;
  progress: { file: string; loaded: number; total: number; percent: number } | null;
  model?: string;
  revision?: string;
  device?: LocalAssistantDevice;
  dtype?: LocalAssistantDtype;
  inferenceMs?: number;
}

export interface LocalAssistantCompletion {
  answer: string;
  inferenceMs: number;
  model: string;
  revision: string;
  device: LocalAssistantDevice;
  dtype: LocalAssistantDtype;
}
