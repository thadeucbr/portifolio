import test from "node:test";
import assert from "node:assert/strict";
import { createSharedStore } from "../src/hooks/sharedEngineStore.mjs";

test("shared store exposes its initial snapshot", () => {
  const store = createSharedStore({ phase: "idle", progress: 0 });
  assert.deepEqual(store.getSnapshot(), { phase: "idle", progress: 0 });
});

test("publishing a patch updates the snapshot and notifies subscribers", () => {
  const store = createSharedStore({ phase: "idle", progress: 0 });
  let notifications = 0;
  store.subscribe(() => notifications++);

  store.publish({ phase: "downloading", progress: 0.4 });

  assert.deepEqual(store.getSnapshot(), { phase: "downloading", progress: 0.4 });
  assert.equal(notifications, 1);
});

test("unsubscribed listeners are no longer notified", () => {
  const store = createSharedStore({ phase: "idle" });
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  unsubscribe();

  store.publish({ phase: "ready" });

  assert.equal(notifications, 0);
});
