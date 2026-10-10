import test from "node:test";
import assert from "node:assert/strict";
import { buildProjectGravityScores } from "../src/components/projects/projectAtlasModel.mjs";

const projects = [{ id: "broker" }, { id: "zero-trust" }, { id: "edge-ai" }];

test("selected project is attracted to the center and peers remain in orbit", () => {
  const scores = buildProjectGravityScores(projects, "zero-trust");

  assert.equal(scores["zero-trust"], 1);
  assert.equal(scores.broker, 0.28);
  assert.equal(scores["edge-ai"], 0.28);
});

test("unknown project selection falls back to the first available project", () => {
  const scores = buildProjectGravityScores(projects, "missing");

  assert.equal(scores.broker, 1);
  assert.equal(scores["zero-trust"], 0.28);
});

test("empty project collections produce an empty score map", () => {
  assert.deepEqual(buildProjectGravityScores([], "missing"), {});
});
