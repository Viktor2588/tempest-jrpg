import { describe, expect, it } from 'vitest';
import {
  generatedTexturePoint,
  generatedTextureSize,
  generatedTextureStroke,
  KENNEY_PIXEL_TEXTURE_KEYS,
  RENDER_PIXEL_ART,
  RENDER_ROUND_PIXELS
} from '../src/render/textureSharpness';
import mainSource from '../src/main.ts?raw';
import battleBackgroundAtlasSource from '../src/render/battleBackgroundAtlas.ts?raw';
import placeholderArtSource from '../src/render/placeholderArt.ts?raw';
import portraitAtlasSource from '../src/render/portraitAtlas.ts?raw';
import vfxAtlasSource from '../src/render/vfxAtlas.ts?raw';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

describe('Phase 58 texture sharpness helpers', () => {
  it('skaliert prozedurale Texturen deterministisch auf DPR-Groessen', () => {
    expect(generatedTextureSize(64, 1)).toBe(64);
    expect(generatedTextureSize(64, 2)).toBe(128);
    expect(generatedTextureSize(33, 1.5)).toBe(50);
    expect(generatedTexturePoint(12, 2)).toBe(24);
    expect(generatedTextureStroke(1, 2)).toBe(2);
  });

  it('setzt globale Pixel-Art-Rundung ab und benennt die gezielten Pixelquellen', () => {
    expect(RENDER_PIXEL_ART).toBe(false);
    expect(RENDER_ROUND_PIXELS).toBe(false);
    expect(KENNEY_PIXEL_TEXTURE_KEYS).toEqual([
      'tile-grass',
      'tile-wall',
      'tile-path',
      'sprite-hero',
      'sprite-enemy-slime',
      'sprite-enemy-wolf',
      'sprite-enemy-imp',
      'sprite-enemy-ogre'
    ]);
  });

  it('verdrahtet Filterpolitik und DPR-Generatoren in den Rendering-Modulen', () => {
    expect(mainSource).toContain('pixelArt: RENDER_PIXEL_ART');
    expect(mainSource).toContain('roundPixels: RENDER_ROUND_PIXELS');
    expect(preloadSource).toContain('Phaser.Textures.FilterMode.LINEAR');
    expect(preloadSource).toContain('Phaser.Textures.FilterMode.NEAREST');
    expect(preloadSource).toContain('TEMPEST_CITY_FLOOR_TILE_TEXTURE_KEY');
    expect(preloadSource).toContain('...VFX_KINDS.map(vfxKey)');
    expect(preloadSource).toContain('...PLACEHOLDER_KINDS.map(placeholderKey)');

    for (const source of [
      placeholderArtSource,
      portraitAtlasSource,
      vfxAtlasSource,
      battleBackgroundAtlasSource
    ]) {
      expect(source).toContain('generatedTextureSize');
    }
  });
});
