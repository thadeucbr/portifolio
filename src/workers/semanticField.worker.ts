/// <reference lib="webworker" />
// Guideline linhas 37-40, 49-50, 53, 121-124: física rígida via Rapier (Rust→WASM) em microgravidade,
// isolada da Main Thread. Utilidade: o campo é a visualização física do ranking semântico —
// a força de atração de cada sistema ao núcleo é proporcional à similaridade calculada pelo modelo.

import RAPIER from "@dimforge/rapier2d-compat";

export type FieldIn =
  | { type: "init"; ids: string[]; width: number; height: number }
  | { type: "resize"; width: number; height: number }
  | { type: "scores"; scores: Record<string, number> }
  | { type: "pointer"; x: number; y: number; active: boolean };

export type FieldOut = { type: "frame"; positions: Float32Array } | { type: "ready" };

const SCALE = 50; // px por unidade de física
const RADIUS = 0.62;

let world: RAPIER.World | null = null;
let bodies: RAPIER.RigidBody[] = [];
let walls: RAPIER.Collider[] = [];
let ids: string[] = [];
let W = 1;
let H = 1;
let weights = new Map<string, number>(); // 0..1, 1 = mais relevante
const pointer = { x: 0, y: 0, active: false };

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const raf: (cb: () => void) => void =
  typeof ctx.requestAnimationFrame === "function" ? (cb) => ctx.requestAnimationFrame(cb) : (cb) => setTimeout(cb, 16);

function buildWalls() {
  if (!world) return;
  walls.forEach((w) => world!.removeCollider(w, false));
  const hw = W / SCALE / 2;
  const hh = H / SCALE / 2;
  const t = 0.5;
  walls = [
    RAPIER.ColliderDesc.cuboid(hw, t).setTranslation(0, -hh - t),
    RAPIER.ColliderDesc.cuboid(hw, t).setTranslation(0, hh + t),
    RAPIER.ColliderDesc.cuboid(t, hh).setTranslation(-hw - t, 0),
    RAPIER.ColliderDesc.cuboid(t, hh).setTranslation(hw + t, 0),
  ].map((d) => world!.createCollider(d));
}

function step() {
  if (!world) return;
  const hw = W / SCALE / 2;
  const maxR = Math.max(1, Math.min(hw, H / SCALE / 2) * 0.95 + hw * 0.3);

  bodies.forEach((b, i) => {
    const p = b.translation();
    const len = Math.hypot(p.x, p.y) || 1e-3;
    const w = weights.get(ids[i]) ?? 0.5;
    // Alvo radial: relevância 1 → núcleo; relevância 0 → periferia.
    const targetR = (1 - w) * maxR;
    const k = 6;
    b.resetForces(true);
    b.addForce({ x: (p.x / len) * (targetR - len) * k, y: (p.y / len) * (targetR - len) * k }, true);

    // Raio de repulsão do cursor (linha 39).
    if (pointer.active) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < 1.6 && d > 1e-3) {
        const f = (1 - d / 1.6) * 30;
        b.addForce({ x: (dx / d) * f, y: (dy / d) * f }, true);
      }
    }
  });

  world.step();

  const out = new Float32Array(bodies.length * 2);
  bodies.forEach((b, i) => {
    const p = b.translation();
    out[i * 2] = p.x * SCALE + W / 2;
    out[i * 2 + 1] = p.y * SCALE + H / 2;
  });
  ctx.postMessage({ type: "frame", positions: out } satisfies FieldOut, [out.buffer]);
  raf(step);
}

ctx.onmessage = async (e: MessageEvent<FieldIn>) => {
  const m = e.data;
  if (m.type === "init") {
    await RAPIER.init();
    W = m.width;
    H = m.height;
    ids = m.ids;
    world = new RAPIER.World({ x: 0, y: 0 }); // microgravidade
    bodies = ids.map((_, i) => {
      const a = (i / ids.length) * Math.PI * 2;
      const body = world!.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(Math.cos(a) * 2, Math.sin(a) * 1.2)
          .setLinearDamping(3.5),
      );
      world!.createCollider(RAPIER.ColliderDesc.ball(RADIUS).setRestitution(0.35).setFriction(0.2), body);
      return body;
    });
    buildWalls();
    ctx.postMessage({ type: "ready" } satisfies FieldOut);
    raf(step);
  } else if (m.type === "resize") {
    W = m.width;
    H = m.height;
    buildWalls();
  } else if (m.type === "scores") {
    const vals = Object.values(m.scores);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    weights = new Map(Object.entries(m.scores).map(([id, s]) => [id, (s - min) / span]));
  } else if (m.type === "pointer") {
    pointer.x = (m.x - W / 2) / SCALE;
    pointer.y = (m.y - H / 2) / SCALE;
    pointer.active = m.active;
  }
};
