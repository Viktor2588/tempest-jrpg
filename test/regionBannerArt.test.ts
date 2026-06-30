import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/data/maps';
import {
  DEFAULT_REGION_BANNER_TEXTURE_KEY,
  REGION_BANNER_TEXTURES,
  regionBannerTextureForMap
} from '../src/render/regionBannerArt';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

describe('Gebietsindikator-Banner', () => {
  it('deckt jede vorhandene Overworld-Karte ab', () => {
    expect(Object.keys(REGION_BANNER_TEXTURES).sort()).toEqual(Object.keys(MAPS).sort());
  });

  it('liefert deterministische Texture-Keys mit Startgebiet-Fallback', () => {
    expect(regionBannerTextureForMap('sealed-cave')).toBe(REGION_BANNER_TEXTURES['sealed-cave']);
    expect(regionBannerTextureForMap('spirit-highlands')).toBe(REGION_BANNER_TEXTURES['spirit-highlands']);
    expect(regionBannerTextureForMap('unknown-map')).toBe(DEFAULT_REGION_BANNER_TEXTURE_KEY);
    expect(regionBannerTextureForMap('sealed-cave', () => false)).toBeNull();
  });

  it('lädt alle Imagegen-Banner in der Preload-Szene', () => {
    for (const file of [
      'region-sealed-cave.webp',
      'region-goblin-village.webp',
      'region-direwolf-den.webp',
      'region-jura-forest.webp',
      'region-spirit-marsh.webp',
      'region-spirit-highlands.webp'
    ]) {
      expect(preloadSource).toContain(`../assets/ui/${file}`);
    }
  });
});
