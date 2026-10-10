import test from "node:test";
import assert from "node:assert/strict";
import { RapierFieldSimulation } from "../src/workers/rapierFieldSimulation.mjs";

async function createSimulation(ids) {
  const simulation = await RapierFieldSimulation.create({ ids, width: 640, height: 320, shape: "card" });
  return simulation;
}

test("Rapier keeps a dragged card under its target and applies a free throw impulse", async (context) => {
  const simulation = await createSimulation(["a"]);
  context.after(() => simulation.dispose());

  simulation.startDrag(0, 420, 160);
  simulation.moveDrag(350, 160);
  for (let index = 0; index < 40; index += 1) simulation.step();
  const beforeThrow = simulation.step().positions[0];

  simulation.endDrag({ vx: 8, vy: 0, free: true });
  let afterThrow = beforeThrow;
  for (let index = 0; index < 10; index += 1) afterThrow = simulation.step().positions[0];

  assert.ok(afterThrow > beforeThrow + 20, `expected rightward throw, got ${beforeThrow} -> ${afterThrow}`);
});

test("Rapier collision solver separates cards while one is spring-dragged into another", async (context) => {
  const simulation = await createSimulation(["a", "b"]);
  context.after(() => simulation.dispose());

  simulation.startDrag(0, 420, 160);
  simulation.moveDrag(220, 160);
  let frame;
  for (let index = 0; index < 90; index += 1) frame = simulation.step();
  const separation = Math.abs(frame.positions[0] - frame.positions[2]);

  assert.ok(separation > 30, `expected collider response, card centers only ${separation}px apart`);
});

test("layout targets produce finite Rapier transforms at narrow viewport sizes", async (context) => {
  const simulation = await RapierFieldSimulation.create({ ids: ["a", "b", "c", "d", "e"], width: 320, height: 240, shape: "card" });
  context.after(() => simulation.dispose());
  simulation.setLayout("triangle", "c");

  let frame;
  for (let index = 0; index < 60; index += 1) frame = simulation.step();
  assert.ok(Array.from(frame.positions).every(Number.isFinite));
  assert.ok(Array.from(frame.rotations).every(Number.isFinite));
});
