import test from "node:test";
import assert from "node:assert/strict";
import { stageForShortcut, transitionDirection } from "../src/components/stage/stageNavigation.mjs";

test("shortcuts 1–5 select the five portfolio stages", () => {
  assert.deepEqual(
    ["1", "2", "3", "4", "5"].map((key) => stageForShortcut(key)),
    ["hero", "systems", "resilience", "agent", "dossier"],
  );
});

test("keyboard shortcuts do not steal digits while a field is being edited", () => {
  assert.equal(stageForShortcut("2", true), null);
  assert.equal(stageForShortcut("2", false), "systems");
});

test("non-navigation keys and out-of-range digits do not select a stage", () => {
  assert.equal(stageForShortcut("0"), null);
  assert.equal(stageForShortcut("6"), null);
  assert.equal(stageForShortcut("7"), null);
  assert.equal(stageForShortcut("ArrowRight"), null);
});

test("stage changes receive a forward or backward transition direction", () => {
  assert.equal(transitionDirection("hero", "systems"), "nav-forward");
  assert.equal(transitionDirection("dossier", "agent"), "nav-back");
  assert.equal(transitionDirection("agent", "agent"), null);
});
