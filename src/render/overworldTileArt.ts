export const DEFAULT_FLOOR_TILE_TEXTURE_KEY = 'tile-grass';
export const DEFAULT_WALL_TILE_TEXTURE_KEY = 'tile-wall';
export const PLACEHOLDER_FLOOR_TILE_TEXTURE_KEY = 'ph-tile-grass';
export const PLACEHOLDER_WALL_TILE_TEXTURE_KEY = 'ph-tile-wall';

export const MARSH_FLOOR_TILE_TEXTURE_KEY = 'tile-marsh-floor';
export const MARSH_WALL_TILE_TEXTURE_KEY = 'tile-marsh-wall';
export const HIGHLANDS_FLOOR_TILE_TEXTURE_KEY = 'tile-highlands-floor';
export const HIGHLANDS_WALL_TILE_TEXTURE_KEY = 'tile-highlands-wall';

export interface OverworldTileTheme {
  readonly floorKey: string;
  readonly wallKey: string;
}

export const DEFAULT_OVERWORLD_TILE_THEME: OverworldTileTheme = {
  floorKey: DEFAULT_FLOOR_TILE_TEXTURE_KEY,
  wallKey: DEFAULT_WALL_TILE_TEXTURE_KEY
};

export const OVERWORLD_TILE_THEMES: Readonly<Record<string, OverworldTileTheme>> = {
  'spirit-marsh': {
    floorKey: MARSH_FLOOR_TILE_TEXTURE_KEY,
    wallKey: MARSH_WALL_TILE_TEXTURE_KEY
  },
  'spirit-highlands': {
    floorKey: HIGHLANDS_FLOOR_TILE_TEXTURE_KEY,
    wallKey: HIGHLANDS_WALL_TILE_TEXTURE_KEY
  }
};

export function overworldTileTextureCandidates(mapId: string, wall: boolean): readonly string[] {
  const theme = OVERWORLD_TILE_THEMES[mapId] ?? DEFAULT_OVERWORLD_TILE_THEME;
  const themedKey = wall ? theme.wallKey : theme.floorKey;
  const defaultKey = wall ? DEFAULT_WALL_TILE_TEXTURE_KEY : DEFAULT_FLOOR_TILE_TEXTURE_KEY;
  const placeholderKey = wall ? PLACEHOLDER_WALL_TILE_TEXTURE_KEY : PLACEHOLDER_FLOOR_TILE_TEXTURE_KEY;

  return themedKey === defaultKey
    ? [defaultKey, placeholderKey]
    : [themedKey, defaultKey, placeholderKey];
}

export function firstAvailableOverworldTileTexture(
  mapId: string,
  wall: boolean,
  exists: (textureKey: string) => boolean
): string | null {
  return overworldTileTextureCandidates(mapId, wall).find((textureKey) => exists(textureKey)) ?? null;
}
