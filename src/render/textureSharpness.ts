import { GAME_RENDER_SCALE } from './hiDpi';

export const RENDER_PIXEL_ART = false;
export const RENDER_ROUND_PIXELS = false;
export const GENERATED_TEXTURE_SCALE = GAME_RENDER_SCALE;

export const KENNEY_PIXEL_TEXTURE_KEYS = [
  'tile-grass',
  'tile-wall',
  'tile-path',
  'sprite-hero',
  'sprite-enemy-slime',
  'sprite-enemy-wolf',
  'sprite-enemy-imp',
  'sprite-enemy-ogre'
] as const;

export function generatedTextureSize(logicalSize: number, scale = GENERATED_TEXTURE_SCALE): number {
  return Math.max(1, Math.round(logicalSize * Math.max(1, scale)));
}

export function generatedTextureStroke(logicalWidth: number, scale = GENERATED_TEXTURE_SCALE): number {
  return Math.max(1, logicalWidth * Math.max(1, scale));
}

export function generatedTexturePoint(logicalPoint: number, scale = GENERATED_TEXTURE_SCALE): number {
  return logicalPoint * Math.max(1, scale);
}
