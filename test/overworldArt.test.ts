import { describe, expect, it } from 'vitest';
import {
  LEGACY_OVERWORLD_HERO_TEXTURE_KEY,
  OVERWORLD_PLAYER_TEXTURE_CANDIDATES,
  OVERWORLD_RIMURU_TEXTURE_KEY,
  OVERWORLD_WALK_BOB_PX,
  PLACEHOLDER_OVERWORLD_HERO_TEXTURE_KEY,
  firstAvailableOverworldPlayerTexture,
  overworldPlayerFlipX
} from '../src/render/overworldArt';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

describe('Oberwelt-Spieler-Asset', () => {
  it('priorisiert Rimurus Schleimform vor Legacy- und Platzhalter-Sprites', () => {
    expect(OVERWORLD_PLAYER_TEXTURE_CANDIDATES).toEqual([
      OVERWORLD_RIMURU_TEXTURE_KEY,
      LEGACY_OVERWORLD_HERO_TEXTURE_KEY,
      PLACEHOLDER_OVERWORLD_HERO_TEXTURE_KEY
    ]);
  });

  it('fällt deterministisch auf alte Texturen zurück', () => {
    expect(firstAvailableOverworldPlayerTexture((key) => key === OVERWORLD_RIMURU_TEXTURE_KEY)).toBe(OVERWORLD_RIMURU_TEXTURE_KEY);
    expect(firstAvailableOverworldPlayerTexture((key) => key === LEGACY_OVERWORLD_HERO_TEXTURE_KEY)).toBe(LEGACY_OVERWORLD_HERO_TEXTURE_KEY);
    expect(firstAvailableOverworldPlayerTexture((key) => key === PLACEHOLDER_OVERWORLD_HERO_TEXTURE_KEY)).toBe(PLACEHOLDER_OVERWORLD_HERO_TEXTURE_KEY);
    expect(firstAvailableOverworldPlayerTexture(() => false)).toBeNull();
  });

  it('spiegelt Rimuru nur bei linksgerichteter Bewegung und hat einen sichtbaren Walk-Bob', () => {
    expect(overworldPlayerFlipX('left')).toBe(true);
    expect(overworldPlayerFlipX('right')).toBe(false);
    expect(overworldPlayerFlipX('up')).toBe(false);
    expect(overworldPlayerFlipX('down')).toBe(false);
    expect(OVERWORLD_WALK_BOB_PX).toBeGreaterThan(0);
  });

  it('lädt die Phase-24-Bildassets in der Preload-Szene', () => {
    expect(preloadSource).toContain('../assets/sprites/overworld-rimuru-slime.webp');
    expect(preloadSource).toContain('../assets/sprites/enemy-forest-slime.webp');
    expect(preloadSource).toContain('../assets/sprites/portrait-veldora.webp');
  });
});
