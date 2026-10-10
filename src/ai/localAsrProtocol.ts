export type LocalAsrDevice = "webgpu" | "wasm";
export type LocalAsrPhase = "idle" | "probing" | "downloading" | "loading" | "ready" | "recording" | "transcribing" | "error";

export type LocalAsrRequest =
  | { type: "load" }
  | { type: "transcribe"; requestId: string; audio: Float32Array };

export type LocalAsrResponse =
  | { type: "status"; phase: Exclude<LocalAsrPhase, "idle" | "recording" | "transcribing">; detail: string; device?: LocalAsrDevice; percent?: number; loaded?: number; total?: number }
  | { type: "transcript"; requestId: string; text: string; inferenceMs: number; device: LocalAsrDevice; model: string; revision: string }
  | { type: "failure"; requestId?: string; detail: string };
