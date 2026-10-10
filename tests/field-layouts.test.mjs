import test from "node:test";
import assert from "node:assert/strict";
import { createFieldLayoutTargets, createThrowImpulse } from "../src/workers/fieldLayouts.mjs";

const ids = ["a", "b", "c", "d", "e"];

for (const layout of ["circle", "grid", "triangle"]) {
  test(`${layout} layout returns finite in-bounds targets for every card`, () => {
    const targets = createFieldLayoutTargets(ids, layout, "c", 12, 7, "card");

    assert.deepEqual(Object.keys(targets).sort(), [...ids].sort());
    for (const point of Object.values(targets)) {
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
      assert.ok(Math.abs(point.x) <= 12 / 2 - 1.76);
      assert.ok(Math.abs(point.y) <= 7 / 2 - 0.64);
    }
  });
}

test("circle and grid keep the selected project at the core", () => {
  for (const layout of ["circle", "grid"]) {
    const targets = createFieldLayoutTargets(ids, layout, "c", 12, 7, "card");
    assert.deepEqual(targets.c, { x: 0, y: 0 });
    assert.ok(Object.values(targets).filter((point) => point.x === 0 && point.y === 0).length === 1);
  }
});

test("triangle places the selected project at its top vertex", () => {
  const targets = createFieldLayoutTargets(ids, "triangle", "c", 12, 7, "card");
  assert.ok(targets.c.y < 0);
  assert.equal(targets.c.x, 0);
});

test("orbital mode delegates to continuous radial gravity; empty input stays empty", () => {
  assert.equal(createFieldLayoutTargets(ids, "orbital", "c", 12, 7, "card"), null);
  assert.deepEqual(createFieldLayoutTargets([], "grid", undefined, 12, 7, "card"), {});
});

test("a click stays attached to its layout while a real toss enters free motion", () => {
  assert.deepEqual(createThrowImpulse({ distance: 7.9, velocityX: 10, velocityY: -4 }), {
    free: false,
    vx: 0,
    vy: 0,
  });
  assert.deepEqual(createThrowImpulse({ distance: 24, velocityX: 4, velocityY: -3 }), {
    free: true,
    vx: 4,
    vy: -3,
  });
});

test("throw impulses are capped and cancelled gestures never throw", () => {
  assert.deepEqual(createThrowImpulse({ distance: 40, velocityX: 80, velocityY: -80 }), {
    free: true,
    vx: 18,
    vy: -18,
  });
  assert.deepEqual(createThrowImpulse({ distance: 40, velocityX: 8, velocityY: 8, cancelled: true }), {
    free: false,
    vx: 0,
    vy: 0,
  });
});
