import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FLOOR_TILE_TEXTURE_KEY,
  DEFAULT_WALL_TILE_TEXTURE_KEY,
  HIGHLANDS_FLOOR_TILE_TEXTURE_KEY,
  HIGHLANDS_WALL_TILE_TEXTURE_KEY,
  MARSH_FLOOR_TILE_TEXTURE_KEY,
  MARSH_WALL_TILE_TEXTURE_KEY,
  firstAvailableOverworldTileTexture,
  overworldTileTextureCandidates
} from '../src/render/overworldTileArt';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

describe('Overworld-Regionstiles', () => {
  it('priorisiert Geistmoor- und Hochland-Tiles vor den Default-Tiles', () => {
    expect(overworldTileTextureCandidates('spirit-marsh', false)).toEqual([
      MARSH_FLOOR_TILE_TEXTURE_KEY,
      DEFAULT_FLOOR_TILE_TEXTURE_KEY,
      'ph-tile-grass'
    ]);
    expect(overworldTileTextureCandidates('spirit-marsh', true)).toEqual([
      MARSH_WALL_TILE_TEXTURE_KEY,
      DEFAULT_WALL_TILE_TEXTURE_KEY,
      'ph-tile-wall'
    ]);
    expect(overworldTileTextureCandidates('spirit-highlands', false)[0]).toBe(HIGHLANDS_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('spirit-highlands', true)[0]).toBe(HIGHLANDS_WALL_TILE_TEXTURE_KEY);
  });

  it('lässt Start-/Prologkarten auf Default-Tiles fallen', () => {
    expect(overworldTileTextureCandidates('tempest-start', false)).toEqual([
      DEFAULT_FLOOR_TILE_TEXTURE_KEY,
      'ph-tile-grass'
    ]);
    expect(overworldTileTextureCandidates('sealed-cave', true)).toEqual([
      DEFAULT_WALL_TILE_TEXTURE_KEY,
      'ph-tile-wall'
    ]);
  });

  it('wählt den ersten geladenen Kandidaten deterministisch', () => {
    expect(firstAvailableOverworldTileTexture('spirit-marsh', false, (key) => key === MARSH_FLOOR_TILE_TEXTURE_KEY))
      .toBe(MARSH_FLOOR_TILE_TEXTURE_KEY);
    expect(firstAvailableOverworldTileTexture('spirit-marsh', false, (key) => key === DEFAULT_FLOOR_TILE_TEXTURE_KEY))
      .toBe(DEFAULT_FLOOR_TILE_TEXTURE_KEY);
    expect(firstAvailableOverworldTileTexture('spirit-marsh', false, () => false)).toBeNull();
  });

  it('lädt die regionalen Imagegen-Tiles in der Preload-Szene', () => {
    for (const file of [
      'tile-marsh-floor.webp',
      'tile-marsh-wall.webp',
      'tile-highlands-floor.webp',
      'tile-highlands-wall.webp'
    ]) {
      expect(preloadSource).toContain(`../assets/tiles/${file}`);
    }
  });
});
