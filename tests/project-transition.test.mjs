import test from "node:test";
import assert from "node:assert/strict";
import { projectTransitionName } from "../src/components/projects/projectTransition.mjs";

test("project view-transition names are stable, unique, and valid identifiers", () => {
  const ids = ["ai-messaging-broker", "zero-trust-mesh", "governance-dlp"];
  const names = ids.map(projectTransitionName);

  assert.deepEqual(names, [
    "portfolio-project-ai-messaging-broker",
    "portfolio-project-zero-trust-mesh",
    "portfolio-project-governance-dlp",
  ]);
  assert.equal(new Set(names).size, ids.length);
  assert.ok(names.every((name) => /^[a-z][a-z0-9-]*$/.test(name)));
});

test("unsafe IDs are normalized before becoming CSS transition names", () => {
  assert.equal(projectTransitionName("project/with spaces"), "portfolio-project-project-with-spaces");
});
