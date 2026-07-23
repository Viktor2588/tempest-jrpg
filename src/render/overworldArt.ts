import type { Dir } from '../systems/overworld';

export const OVERWORLD_RIMURU_TEXTURE_KEY = 'sprite-overworld-rimuru-slime';
export const LEGACY_OVERWORLD_HERO_TEXTURE_KEY = 'sprite-hero';
export const PLACEHOLDER_OVERWORLD_HERO_TEXTURE_KEY = 'ph-hero';
export const OVERWORLD_WALK_BOB_PX = 5;

export const OVERWORLD_PLAYER_TEXTURE_CANDIDATES = [
  OVERWORLD_RIMURU_TEXTURE_KEY,
  LEGACY_OVERWORLD_HERO_TEXTURE_KEY,
  PLACEHOLDER_OVERWORLD_HERO_TEXTURE_KEY
] as const;

export function firstAvailableOverworldPlayerTexture(
  exists: (textureKey: string) => boolean
): string | null {
  return OVERWORLD_PLAYER_TEXTURE_CANDIDATES.find((textureKey) => exists(textureKey)) ?? null;
}

/** The slime artwork faces right by default; mirror it only for leftward travel. */
export function overworldPlayerFlipX(facing: Dir): boolean {
  return facing === 'left';
}
