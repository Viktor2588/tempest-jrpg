import { describe, expect, it } from 'vitest';
import {
  BLUMUND_FLOOR_TILE_TEXTURE_KEY,
  BLUMUND_WALL_TILE_TEXTURE_KEY,
  DEFAULT_FLOOR_TILE_TEXTURE_KEY,
  DEFAULT_WALL_TILE_TEXTURE_KEY,
  DWARGON_FLOOR_TILE_TEXTURE_KEY,
  DWARGON_WALL_TILE_TEXTURE_KEY,
  EMBER_HOLLOW_FLOOR_TILE_TEXTURE_KEY,
  EMBER_HOLLOW_WALL_TILE_TEXTURE_KEY,
  GOBLIN_VILLAGE_FLOOR_TILE_TEXTURE_KEY,
  GOBLIN_VILLAGE_WALL_TILE_TEXTURE_KEY,
  HIGHLANDS_FLOOR_TILE_TEXTURE_KEY,
  HIGHLANDS_WALL_TILE_TEXTURE_KEY,
  JURA_BATTLEFIELD_FLOOR_TILE_TEXTURE_KEY,
  JURA_BATTLEFIELD_WALL_TILE_TEXTURE_KEY,
  LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY,
  LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY,
  MARSH_FLOOR_TILE_TEXTURE_KEY,
  MARSH_WALL_TILE_TEXTURE_KEY,
  RAMIRIS_LABYRINTH_FLOOR_TILE_TEXTURE_KEY,
  RAMIRIS_LABYRINTH_WALL_TILE_TEXTURE_KEY,
  SEALED_CAVE_FLOOR_TILE_TEXTURE_KEY,
  SEALED_CAVE_WALL_TILE_TEXTURE_KEY,
  TEMPEST_CAMP_FLOOR_TILE_TEXTURE_KEY,
  TEMPEST_CITY_FLOOR_TILE_TEXTURE_KEY,
  TEMPEST_COLOSSEUM_FLOOR_TILE_TEXTURE_KEY,
  TEMPEST_COLOSSEUM_WALL_TILE_TEXTURE_KEY,
  TEMPEST_VILLAGE_FLOOR_TILE_TEXTURE_KEY,
  firstAvailableOverworldTileTexture,
  overworldTileTextureCandidates
} from '../src/render/overworldTileArt';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

describe('Overworld-Regionstiles', () => {
  it('priorisiert regionale Imagegen-Tiles vor den Default-Tiles', () => {
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
    expect(overworldTileTextureCandidates('blumund', false)[0]).toBe(BLUMUND_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('blumund', true)[0]).toBe(BLUMUND_WALL_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('dwargon', false)[0]).toBe(DWARGON_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('dwargon', true)[0]).toBe(DWARGON_WALL_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('jura-battlefield', false)[0]).toBe(JURA_BATTLEFIELD_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('jura-battlefield', true)[0]).toBe(JURA_BATTLEFIELD_WALL_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('lizardman-marsh', false)[0]).toBe(LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('lizardman-marsh', true)[0]).toBe(LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('ember-hollow', false)[0]).toBe(EMBER_HOLLOW_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('ember-hollow', true)[0]).toBe(EMBER_HOLLOW_WALL_TILE_TEXTURE_KEY);
  });

  it('gibt den eigenständigen Schauplätzen eigene Tiles', () => {
    expect(overworldTileTextureCandidates('sealed-cave', false)).toEqual([
      SEALED_CAVE_FLOOR_TILE_TEXTURE_KEY,
      DEFAULT_FLOOR_TILE_TEXTURE_KEY,
      'ph-tile-grass'
    ]);
    expect(overworldTileTextureCandidates('sealed-cave', true)).toEqual([
      SEALED_CAVE_WALL_TILE_TEXTURE_KEY,
      DEFAULT_WALL_TILE_TEXTURE_KEY,
      'ph-tile-wall'
    ]);
    expect(overworldTileTextureCandidates('goblin-village', false)[0]).toBe(GOBLIN_VILLAGE_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('goblin-village', true)[0]).toBe(GOBLIN_VILLAGE_WALL_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('ramiris-labyrinth', false)).toEqual([
      RAMIRIS_LABYRINTH_FLOOR_TILE_TEXTURE_KEY,
      DEFAULT_FLOOR_TILE_TEXTURE_KEY,
      'ph-tile-grass'
    ]);
    expect(overworldTileTextureCandidates('ramiris-labyrinth', true)).toEqual([
      RAMIRIS_LABYRINTH_WALL_TILE_TEXTURE_KEY,
      DEFAULT_WALL_TILE_TEXTURE_KEY,
      'ph-tile-wall'
    ]);
    expect(overworldTileTextureCandidates('tempest-colosseum', false)).toEqual([
      TEMPEST_COLOSSEUM_FLOOR_TILE_TEXTURE_KEY,
      DEFAULT_FLOOR_TILE_TEXTURE_KEY,
      'ph-tile-grass'
    ]);
    expect(overworldTileTextureCandidates('tempest-colosseum', true)).toEqual([
      TEMPEST_COLOSSEUM_WALL_TILE_TEXTURE_KEY,
      DEFAULT_WALL_TILE_TEXTURE_KEY,
      'ph-tile-wall'
    ]);
    expect(overworldTileTextureCandidates('tempest-start', false)).toEqual([
      LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY,
      DEFAULT_FLOOR_TILE_TEXTURE_KEY,
      'ph-tile-grass'
    ]);
  });

  it('wechselt Tempests Bodenart mit dem sichtbaren Siedlungswachstum', () => {
    expect(overworldTileTextureCandidates('tempest-start', false, {
      'story.tempest.named': true
    })[0]).toBe(TEMPEST_CAMP_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('tempest-start', false, {
      'story.tempest.named': true,
      'story.council.ready': true
    })[0]).toBe(TEMPEST_VILLAGE_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('tempest-start', false, {
      'story.tempest.named': true,
      'story.council.ready': true,
      'story.kijin.named': true,
      'faction.dwargon.allied': true
    })[0]).toBe(TEMPEST_CITY_FLOOR_TILE_TEXTURE_KEY);
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
      'tile-sealed-cave-floor.webp',
      'tile-sealed-cave-wall.webp',
      'tile-goblin-village-floor.webp',
      'tile-goblin-village-wall.webp',
      'tile-ramiris-labyrinth-floor.webp',
      'tile-ramiris-labyrinth-wall.webp',
      'tile-tempest-colosseum-floor.webp',
      'tile-tempest-colosseum-wall.webp',
      'tile-marsh-floor.webp',
      'tile-marsh-wall.webp',
      'tile-highlands-floor.webp',
      'tile-highlands-wall.webp',
      'tile-blumund-floor.webp',
      'tile-blumund-wall.webp',
      'tile-dwargon-floor.webp',
      'tile-dwargon-wall.webp',
      'tile-jura-battlefield-floor.webp',
      'tile-jura-battlefield-wall.webp',
      'tile-lizardman-marsh-floor.webp',
      'tile-lizardman-marsh-wall.webp',
      'tile-ember-hollow-floor.webp',
      'tile-ember-hollow-wall.webp',
      'tile-tempest-camp-floor.webp',
      'tile-tempest-village-floor.webp',
      'tile-tempest-city-floor.webp'
    ]) {
      expect(preloadSource).toContain(`../assets/tiles/${file}`);
    }
  });
});
