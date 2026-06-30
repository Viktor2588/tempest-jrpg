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
    expect(regionBannerTextureForMap('dwargon')).toBe('ui-region-dwargon');
    expect(regionBannerTextureForMap('jura-battlefield')).toBe('ui-region-jura-battlefield');
    expect(regionBannerTextureForMap('lizardman-marsh')).toBe('ui-region-lizardman-marsh');
    expect(regionBannerTextureForMap('ember-hollow')).toBe('ui-region-ember-hollow');
    expect(regionBannerTextureForMap('blumund')).toBe('ui-region-blumund');
    expect(regionBannerTextureForMap('unknown-map')).toBe(DEFAULT_REGION_BANNER_TEXTURE_KEY);
    expect(regionBannerTextureForMap('sealed-cave', () => false)).toBeNull();
  });

  it('verwendet für jede Karte ein eigenes Banner statt eines Regions-Fallbacks', () => {
    expect(new Set(Object.values(REGION_BANNER_TEXTURES)).size).toBe(Object.keys(MAPS).length);
  });

  it('lädt alle Imagegen-Banner in der Preload-Szene', () => {
    for (const file of [
      'region-sealed-cave.webp',
      'region-goblin-village.webp',
      'region-direwolf-den.webp',
      'region-jura-forest.webp',
      'region-spirit-marsh.webp',
      'region-spirit-highlands.webp',
      'region-dwargon.webp',
      'region-jura-battlefield.webp',
      'region-lizardman-marsh.webp',
      'region-ember-hollow.webp',
      'region-blumund.webp'
    ]) {
      expect(preloadSource).toContain(`../assets/ui/${file}`);
    }
  });
});
