import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/data/maps';
import {
  DEFAULT_REGION_BANNER_TEXTURE_KEY,
  REGION_BANNER_TEXTURES,
  TEMPEST_GROWTH_BANNER_TEXTURES,
  coverCrop,
  regionBannerTextureForMap
} from '../src/render/regionBannerArt';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';
import menuSource from '../src/scenes/MenuScene.ts?raw';

describe('Gebietsindikator-Banner', () => {
  it('zeigt das vorhandene Tempest-Wachstumsbanner auch bei den Einrichtungen', () => {
    expect(menuSource).toContain("regionBannerTextureForMap(\n      'tempest-start'");
    expect(menuSource).toContain('addRegionBannerImage(this, 836, 172, bannerKey, 104, 40)');
  });

  it('zeigt vorhandene Gebiets-Banner auch in den Diplomatiekarten', () => {
    expect(menuSource).toContain("standing.faction.id === 'orcs' ? 'jura-battlefield'");
    expect(menuSource).toContain("standing.faction.id === 'lizardmen' ? 'lizardman-marsh'");
    expect(menuSource).toContain('addRegionBannerImage(this, 336, y, bannerKey, 54, 54)');
  });

  it('zeigt vorhandene Gebiets-Banner auch in Rangas Reiseliste', () => {
    expect(menuSource).toContain('regionBannerTextureForMap(\n        destination.mapId');
    expect(menuSource).toContain("destination.status === 'unknown' || destination.status === 'locked'");
  });

  it('zeigt vorhandene Gebiets-Banner auch bei Questzielen', () => {
    expect(menuSource).toContain('quest.steps.find((step) => step.current)');
    expect(menuSource).toContain('addRegionBannerImage(this, 70, y, bannerKey, 54, 54)');
    expect(menuSource).toContain('addRegionBannerImage(this, 842, 210, bannerKey, 128, 64)');
  });

  it('deckt jede vorhandene Overworld-Karte ab', () => {
    expect(Object.keys(REGION_BANNER_TEXTURES).sort()).toEqual(Object.keys(MAPS).sort());
  });

  it('zeigt für Tempest die zur Story passende Ausbauvariante', () => {
    expect(regionBannerTextureForMap('tempest-start', () => true, {
      'story.tempest.named': true
    })).toBe(TEMPEST_GROWTH_BANNER_TEXTURES.camp);
    expect(regionBannerTextureForMap('tempest-start', () => true, {
      'story.council.ready': true
    })).toBe(TEMPEST_GROWTH_BANNER_TEXTURES.village);
    expect(regionBannerTextureForMap('tempest-start', () => true, {
      'story.kijin.named': true,
      'faction.dwargon.allied': true
    })).toBe(TEMPEST_GROWTH_BANNER_TEXTURES.city);
  });

  it('liefert deterministische Texture-Keys mit Startgebiet-Fallback', () => {
    expect(regionBannerTextureForMap('sealed-cave')).toBe(REGION_BANNER_TEXTURES['sealed-cave']);
    expect(regionBannerTextureForMap('spirit-highlands')).toBe(REGION_BANNER_TEXTURES['spirit-highlands']);
    expect(regionBannerTextureForMap('dwargon')).toBe('ui-region-dwargon');
    expect(regionBannerTextureForMap('jura-battlefield')).toBe('ui-region-jura-battlefield');
    expect(regionBannerTextureForMap('lizardman-marsh')).toBe('ui-region-lizardman-marsh');
    expect(regionBannerTextureForMap('ember-hollow')).toBe('ui-region-ember-hollow');
    expect(regionBannerTextureForMap('blumund')).toBe('ui-region-blumund');
    expect(regionBannerTextureForMap('freedom-academy')).toBe('ui-region-freedom-academy');
    expect(regionBannerTextureForMap('tempest-colosseum')).toBe('ui-region-tempest-colosseum');
    expect(regionBannerTextureForMap('ramiris-labyrinth')).toBe('ui-region-ramiris-labyrinth');
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
      'region-blumund.webp',
      'region-freedom-academy.webp',
      'region-tempest-colosseum.webp',
      'region-ramiris-labyrinth.webp',
      'region-tempest-camp.webp',
      'region-tempest-village.webp',
      'region-tempest-city.webp'
    ]) {
      expect(preloadSource).toContain(`../assets/ui/${file}`);
    }
  });

  it('schneidet breite und hohe Quellen mittig zu statt sie zu verzerren', () => {
    expect(coverCrop(512, 128, 54, 54)).toEqual([192, 0, 128, 128]);
    expect(coverCrop(1774, 887, 536, 128)[3]).toBeCloseTo(423.64, 2);
  });
});
