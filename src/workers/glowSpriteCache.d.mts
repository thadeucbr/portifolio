export interface GlowSpriteParams {
  color: number | string;
  size: number;
  shadowBlur: number;
  opacity: number;
}
export function glowSpriteCacheKey(params: GlowSpriteParams): string;
export function createGlowSpriteCache<TCanvas>(
  createCanvas: (size: number) => TCanvas,
  drawSprite: (canvas: TCanvas, params: GlowSpriteParams) => void,
): (params: GlowSpriteParams) => TCanvas;
