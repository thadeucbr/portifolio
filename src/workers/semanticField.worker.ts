/// <reference lib="webworker" />
import { RapierFieldSimulation } from "./rapierFieldSimulation.mjs";
import type { FieldLayout, FieldShape } from "./fieldLayouts.mjs";

export type FieldIn =
  | { type: "init"; ids: string[]; width: number; height: number; shape: FieldShape }
  | { type: "resize"; width: number; height: number }
  | { type: "scores"; scores: Record<string, number> }
  | { type: "layout"; pattern: FieldLayout; selectedId?: string }
  | { type: "pointer"; x: number; y: number; active: boolean }
  | { type: "drag-start"; index: number; x: number; y: number }
  | { type: "drag-move"; x: number; y: number }
  | { type: "drag-end"; vx: number; vy: number; free: boolean };

export type FieldOut =
  | { type: "frame"; positions: Float32Array; rotations: Float32Array }
  | { type: "ready" }
  | { type: "error"; detail: string };

const worker = self as unknown as DedicatedWorkerGlobalScope;
const requestFrame: (callback: () => void) => void =
  typeof worker.requestAnimationFrame === "function"
    ? (callback) => worker.requestAnimationFrame(callback)
    : (callback) => setTimeout(callback, 16);

let simulation: RapierFieldSimulation | null = null;
let frameLoopRunning = false;
let pendingMessages: FieldIn[] = [];

function post(message: FieldOut, transfer?: Transferable[]) {
  worker.postMessage(message, transfer ?? []);
}

function apply(message: FieldIn) {
  if (!simulation) {
    pendingMessages.push(message);
    return;
  }
  switch (message.type) {
    case "resize":
      simulation.resize(message.width, message.height);
      break;
    case "scores":
      simulation.setScores(message.scores);
      break;
    case "layout":
      simulation.setLayout(message.pattern, message.selectedId);
      break;
    case "pointer":
      simulation.setPointer(message.x, message.y, message.active);
      break;
    case "drag-start":
      simulation.startDrag(message.index, message.x, message.y);
      break;
    case "drag-move":
      simulation.moveDrag(message.x, message.y);
      break;
    case "drag-end":
      simulation.endDrag({ vx: message.vx, vy: message.vy, free: message.free });
      break;
    case "init":
      break;
  }
}

function tick() {
  if (!simulation) {
    frameLoopRunning = false;
    return;
  }
  const frame = simulation.step();
  post({ type: "frame", ...frame }, [frame.positions.buffer, frame.rotations.buffer]);
  requestFrame(tick);
}

worker.onmessage = (event: MessageEvent<FieldIn>) => {
  const message = event.data;
  if (message.type !== "init") {
    apply(message);
    return;
  }

  void RapierFieldSimulation.create(message).then((nextSimulation) => {
    simulation?.dispose();
    simulation = nextSimulation;
    for (const queued of pendingMessages) apply(queued);
    pendingMessages = [];
    post({ type: "ready" });
    if (!frameLoopRunning) {
      frameLoopRunning = true;
      requestFrame(tick);
    }
  }).catch(() => {
    pendingMessages = [];
    post({ type: "error", detail: "A física Rapier não pôde ser inicializada neste dispositivo." });
  });
};
