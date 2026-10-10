import test from "node:test";
import assert from "node:assert/strict";
import { createBrowserFetch } from "../src/mcp/browserFetch.mjs";

test("calls the browser fetch method with Window as its receiver", async () => {
  const fakeWindow = {
    fetch(input, init) {
      assert.equal(this, fakeWindow);
      assert.equal(input, "/api/mcp");
      assert.equal(init.method, "POST");
      return Promise.resolve({ ok: true });
    },
  };

  const fetchForSdk = createBrowserFetch(fakeWindow);
  const response = await fetchForSdk("/api/mcp", { method: "POST" });

  assert.equal(response.ok, true);
});

test("turns an unbound native-style fetch Illegal Invocation into a passing bound call", async () => {
  const fakeWindow = {
    fetch() {
      if (this !== fakeWindow) throw new TypeError("Illegal invocation");
      return Promise.resolve("ok");
    },
  };
  const unbound = fakeWindow.fetch;
  assert.throws(() => unbound(), /Illegal invocation/);
  await assert.doesNotReject(createBrowserFetch(fakeWindow)());
});
