import test from "node:test";
import assert from "node:assert/strict";
import { createGlowSpriteCache, glowSpriteCacheKey } from "../src/workers/glowSpriteCache.mjs";

const params = { color: 0x1856ff, size: 128, shadowBlur: 16, opacity: 0.35 };

test("sprite cache keys are stable and include every visual parameter", () => {
  assert.equal(glowSpriteCacheKey(params), glowSpriteCacheKey({ ...params }));
  assert.notEqual(glowSpriteCacheKey(params), glowSpriteCacheKey({ ...params, color: 0x3a344e }));
  assert.notEqual(glowSpriteCacheKey(params), glowSpriteCacheKey({ ...params, shadowBlur: 24 }));
  assert.notEqual(glowSpriteCacheKey(params), glowSpriteCacheKey({ ...params, size: 256 }));
  assert.notEqual(glowSpriteCacheKey(params), glowSpriteCacheKey({ ...params, opacity: 0.2 }));
});

test("pre-render cache reuses a sprite and draws each visual combination once", () => {
  let created = 0;
  let drawn = 0;
  const cache = createGlowSpriteCache(
    (size) => ({ size, serial: ++created }),
    () => { drawn += 1; },
  );

  const first = cache(params);
  const same = cache({ ...params });
  const different = cache({ ...params, color: 0x3a344e });
  assert.strictEqual(first, same);
  assert.notStrictEqual(first, different);
  assert.equal(created, 2);
  assert.equal(drawn, 2);
});
