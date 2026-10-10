import type { FieldLayout, FieldShape } from "./fieldLayouts.mjs";

export interface RapierFieldOptions {
  ids: string[];
  width: number;
  height: number;
  shape?: FieldShape;
}
export interface RapierFieldFrame {
  positions: Float32Array;
  rotations: Float32Array;
}
export declare class RapierFieldSimulation {
  static create(options: RapierFieldOptions): Promise<RapierFieldSimulation>;
  constructor(options: RapierFieldOptions);
  resize(width: number, height: number): void;
  setScores(scores: Record<string, number>): void;
  setLayout(pattern: FieldLayout, selectedId?: string): void;
  setPointer(x: number, y: number, active: boolean): void;
  startDrag(index: number, x: number, y: number): void;
  moveDrag(x: number, y: number): void;
  endDrag(input: { vx: number; vy: number; free: boolean }): void;
  step(): RapierFieldFrame;
  dispose(): void;
}
