const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function glowSpriteCacheKey({ color, size, shadowBlur, opacity }) {
  const colorKey = typeof color === "number"
    ? `#${Math.max(0, Math.trunc(color)).toString(16).padStart(6, "0").slice(-6)}`
    : String(color ?? "").trim().toLowerCase();
  return JSON.stringify([
    colorKey,
    Math.max(1, Math.round(finite(size))),
    Math.max(0, finite(shadowBlur)),
    Math.max(0, Math.min(1, finite(opacity))),
  ]);
}

/** Memoizes the result of an expensive offscreen sprite render per material combination. */
export function createGlowSpriteCache(createCanvas, drawSprite) {
  if (typeof createCanvas !== "function" || typeof drawSprite !== "function") {
    throw new TypeError("Sprite cache requires canvas creation and drawing functions.");
  }
  const cache = new Map();
  return (params) => {
    const key = glowSpriteCacheKey(params);
    if (cache.has(key)) return cache.get(key);
    const canvas = createCanvas(Math.max(1, Math.round(finite(params.size))));
    drawSprite(canvas, params);
    cache.set(key, canvas);
    return canvas;
  };
}
