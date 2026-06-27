// Art-Spezifikation (Phaser-/DOM-frei → headless testbar). Definiert die
// kohärente Palette, Kachel-/Sprite-Größe und deterministische Platzhalter-Specs
// gemäß ART_BIBLE.md. Die eigentliche Textur-Erzeugung (Phaser) liegt in
// placeholderArt.ts und liest nur diese Specs.

export const ART = {
  tile: 32,          // px — Top-down-Kachelgröße (CC0-Zielstil)
  sprite: 32,        // px — Charakter-/Gegner-Sprite-Kantenlänge
  perspective: 'top-down',
  outlineWidth: 1    // px — 1px dunkle Outline für Lesbarkeit
} as const;

// Begrenzte, kohärente Palette (Hex). Bewusst klein für Stilkohärenz.
export const PALETTE = {
  ink: '#10131c',      // Outline / dunkelster Ton
  shadow: '#222a3a',
  steel: '#3a4760',
  mist: '#9fb2cc',
  bone: '#e9eef7',     // hellster Ton / Highlights
  grass: '#4f8a4f',
  grassDark: '#33602f',
  water: '#3a6ea5',
  stone: '#5b6577',
  gold: '#e9c56c',
  ember: '#d8643c',
  arcane: '#9a6cff',
  hp: '#53d98b',
  enemy: '#c0506a'
} as const;

export type Hex = (typeof PALETTE)[keyof typeof PALETTE];

export type PlaceholderKind =
  | 'tile-grass' | 'tile-path' | 'tile-wall' | 'tile-water'
  | 'hero' | 'ally-sora' | 'ally-vael' | 'ally-lyrre'
  | 'enemy-slime' | 'enemy-wolf' | 'enemy-imp' | 'enemy-ogre';

export interface PlaceholderSpec {
  size: number;             // Kantenlänge in px
  base: Hex;                // Grundfläche
  accent: Hex;             // Detail/Highlight
  outline: Hex;            // Umrandung
  shape: 'block' | 'round'; // Kacheln = block, Figuren = round
}

const TILE_SPECS: Record<string, Omit<PlaceholderSpec, 'size' | 'outline'>> = {
  'tile-grass': { base: PALETTE.grass, accent: PALETTE.grassDark, shape: 'block' },
  'tile-path': { base: PALETTE.stone, accent: PALETTE.mist, shape: 'block' },
  'tile-wall': { base: PALETTE.steel, accent: PALETTE.shadow, shape: 'block' },
  'tile-water': { base: PALETTE.water, accent: PALETTE.bone, shape: 'block' }
};

const UNIT_SPECS: Record<string, Omit<PlaceholderSpec, 'size' | 'outline'>> = {
  hero: { base: PALETTE.hp, accent: PALETTE.bone, shape: 'round' },
  'ally-sora': { base: PALETTE.ember, accent: PALETTE.gold, shape: 'round' },
  'ally-vael': { base: PALETTE.arcane, accent: PALETTE.bone, shape: 'round' },
  'ally-lyrre': { base: PALETTE.mist, accent: PALETTE.gold, shape: 'round' },
  'enemy-slime': { base: PALETTE.water, accent: PALETTE.bone, shape: 'round' },
  'enemy-wolf': { base: PALETTE.steel, accent: PALETTE.mist, shape: 'round' },
  'enemy-imp': { base: PALETTE.ember, accent: PALETTE.ink, shape: 'round' },
  'enemy-ogre': { base: PALETTE.enemy, accent: PALETTE.bone, shape: 'round' }
};

export const PLACEHOLDER_KINDS: readonly PlaceholderKind[] = [
  ...Object.keys(TILE_SPECS), ...Object.keys(UNIT_SPECS)
] as PlaceholderKind[];

/** Deterministische Platzhalter-Spec je Art; unbekannte Keys → neutraler Fallback. */
export function placeholderSpec(kind: string): PlaceholderSpec {
  const isTile = kind.startsWith('tile-');
  const size = isTile ? ART.tile : ART.sprite;
  const def = TILE_SPECS[kind] ?? UNIT_SPECS[kind];
  if (!def) {
    return { size, base: PALETTE.steel, accent: PALETTE.mist, outline: PALETTE.ink, shape: isTile ? 'block' : 'round' };
  }
  return { size, outline: PALETTE.ink, ...def };
}
