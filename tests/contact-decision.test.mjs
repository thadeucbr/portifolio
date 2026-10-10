import test from "node:test";
import assert from "node:assert/strict";
import { classifyContactDecision } from "../src/app/contactDecision.mjs";

test("maps only explicit consent decisions to their non-writing outcomes", () => {
  assert.equal(classifyContactDecision("accept"), "accept");
  assert.equal(classifyContactDecision("decline"), "decline");
  assert.equal(classifyContactDecision("cancel"), "cancel");
  assert.equal(classifyContactDecision("unknown"), "invalid");
});
