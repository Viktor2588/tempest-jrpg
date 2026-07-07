import { resolveTempestGrowthStage, type StoryFlags } from '../systems/tempestGrowth';

export const DEFAULT_FLOOR_TILE_TEXTURE_KEY = 'tile-grass';
export const DEFAULT_WALL_TILE_TEXTURE_KEY = 'tile-wall';
export const PLACEHOLDER_FLOOR_TILE_TEXTURE_KEY = 'ph-tile-grass';
export const PLACEHOLDER_WALL_TILE_TEXTURE_KEY = 'ph-tile-wall';

export const MARSH_FLOOR_TILE_TEXTURE_KEY = 'tile-marsh-floor';
export const MARSH_WALL_TILE_TEXTURE_KEY = 'tile-marsh-wall';
export const HIGHLANDS_FLOOR_TILE_TEXTURE_KEY = 'tile-highlands-floor';
export const HIGHLANDS_WALL_TILE_TEXTURE_KEY = 'tile-highlands-wall';
export const BLUMUND_FLOOR_TILE_TEXTURE_KEY = 'tile-blumund-floor';
export const BLUMUND_WALL_TILE_TEXTURE_KEY = 'tile-blumund-wall';
export const DWARGON_FLOOR_TILE_TEXTURE_KEY = 'tile-dwargon-floor';
export const DWARGON_WALL_TILE_TEXTURE_KEY = 'tile-dwargon-wall';
export const JURA_BATTLEFIELD_FLOOR_TILE_TEXTURE_KEY = 'tile-jura-battlefield-floor';
export const JURA_BATTLEFIELD_WALL_TILE_TEXTURE_KEY = 'tile-jura-battlefield-wall';
export const LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY = 'tile-lizardman-marsh-floor';
export const LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY = 'tile-lizardman-marsh-wall';
export const EMBER_HOLLOW_FLOOR_TILE_TEXTURE_KEY = 'tile-ember-hollow-floor';
export const EMBER_HOLLOW_WALL_TILE_TEXTURE_KEY = 'tile-ember-hollow-wall';
export const TEMPEST_CAMP_FLOOR_TILE_TEXTURE_KEY = 'tile-tempest-camp-floor';
export const TEMPEST_VILLAGE_FLOOR_TILE_TEXTURE_KEY = 'tile-tempest-village-floor';
export const TEMPEST_CITY_FLOOR_TILE_TEXTURE_KEY = 'tile-tempest-city-floor';

export interface OverworldTileTheme {
  readonly floorKey: string;
  readonly wallKey: string;
}

export const DEFAULT_OVERWORLD_TILE_THEME: OverworldTileTheme = {
  floorKey: DEFAULT_FLOOR_TILE_TEXTURE_KEY,
  wallKey: DEFAULT_WALL_TILE_TEXTURE_KEY
};

export const OVERWORLD_TILE_THEMES: Readonly<Record<string, OverworldTileTheme>> = {
  // Frühe Band-1-Maps haben keine eigenen Kacheln – auf vorhandene, thematisch
  // passende .webp-Sets zeigen statt auf das degenerierte Default-Theme
  // (grass/wall.png). ponytail: reuse existing tiles, keine neuen Assets.
  'sealed-cave': {
    floorKey: DWARGON_FLOOR_TILE_TEXTURE_KEY,
    wallKey: DWARGON_WALL_TILE_TEXTURE_KEY
  },
  'goblin-village': {
    floorKey: LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY,
    wallKey: LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY
  },
  'direwolf-den': {
    floorKey: LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY,
    wallKey: LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY
  },
  'tempest-start': {
    floorKey: LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY,
    wallKey: LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY
  },
  'spirit-marsh': {
    floorKey: MARSH_FLOOR_TILE_TEXTURE_KEY,
    wallKey: MARSH_WALL_TILE_TEXTURE_KEY
  },
  'spirit-highlands': {
    floorKey: HIGHLANDS_FLOOR_TILE_TEXTURE_KEY,
    wallKey: HIGHLANDS_WALL_TILE_TEXTURE_KEY
  },
  'blumund': {
    floorKey: BLUMUND_FLOOR_TILE_TEXTURE_KEY,
    wallKey: BLUMUND_WALL_TILE_TEXTURE_KEY
  },
  'freedom-academy': {
    floorKey: BLUMUND_FLOOR_TILE_TEXTURE_KEY,
    wallKey: BLUMUND_WALL_TILE_TEXTURE_KEY
  },
  'dwargon': {
    floorKey: DWARGON_FLOOR_TILE_TEXTURE_KEY,
    wallKey: DWARGON_WALL_TILE_TEXTURE_KEY
  },
  'jura-battlefield': {
    floorKey: JURA_BATTLEFIELD_FLOOR_TILE_TEXTURE_KEY,
    wallKey: JURA_BATTLEFIELD_WALL_TILE_TEXTURE_KEY
  },
  'lizardman-marsh': {
    floorKey: LIZARDMAN_MARSH_FLOOR_TILE_TEXTURE_KEY,
    wallKey: LIZARDMAN_MARSH_WALL_TILE_TEXTURE_KEY
  },
  'ember-hollow': {
    floorKey: EMBER_HOLLOW_FLOOR_TILE_TEXTURE_KEY,
    wallKey: EMBER_HOLLOW_WALL_TILE_TEXTURE_KEY
  }
};

export function overworldTileTextureCandidates(
  mapId: string,
  wall: boolean,
  flags: StoryFlags = {}
): readonly string[] {
  const theme = OVERWORLD_TILE_THEMES[mapId] ?? DEFAULT_OVERWORLD_TILE_THEME;
  const tempestStage = mapId === 'tempest-start' ? resolveTempestGrowthStage(flags) : 'wilderness';
  const tempestFloorKey = tempestStage === 'camp'
    ? TEMPEST_CAMP_FLOOR_TILE_TEXTURE_KEY
    : tempestStage === 'village'
      ? TEMPEST_VILLAGE_FLOOR_TILE_TEXTURE_KEY
      : tempestStage === 'city'
        ? TEMPEST_CITY_FLOOR_TILE_TEXTURE_KEY
        : null;
  const themedKey = wall ? theme.wallKey : tempestFloorKey ?? theme.floorKey;
  const defaultKey = wall ? DEFAULT_WALL_TILE_TEXTURE_KEY : DEFAULT_FLOOR_TILE_TEXTURE_KEY;
  const placeholderKey = wall ? PLACEHOLDER_WALL_TILE_TEXTURE_KEY : PLACEHOLDER_FLOOR_TILE_TEXTURE_KEY;

  return themedKey === defaultKey
    ? [defaultKey, placeholderKey]
    : [themedKey, defaultKey, placeholderKey];
}

export function firstAvailableOverworldTileTexture(
  mapId: string,
  wall: boolean,
  exists: (textureKey: string) => boolean,
  flags: StoryFlags = {}
): string | null {
  return overworldTileTextureCandidates(mapId, wall, flags).find((textureKey) => exists(textureKey)) ?? null;
}
