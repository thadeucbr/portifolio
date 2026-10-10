export type FieldLayout = "orbital" | "circle" | "grid" | "triangle";
export type FieldShape = "chip" | "card";
export interface FieldTarget {
  x: number;
  y: number;
}
export interface ThrowImpulse {
  free: boolean;
  vx: number;
  vy: number;
}
export declare function createThrowImpulse(input: {
  distance: number;
  velocityX: number;
  velocityY: number;
  cancelled?: boolean;
}): ThrowImpulse;
export declare function createFieldLayoutTargets(
  ids: string[],
  layout: FieldLayout,
  selectedId: string | undefined,
  width: number,
  height: number,
  shape?: FieldShape,
): Record<string, FieldTarget> | null;
