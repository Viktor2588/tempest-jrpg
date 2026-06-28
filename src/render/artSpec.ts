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
  | 'enemy-slime' | 'enemy-wolf' | 'enemy-imp' | 'enemy-ogre'
  | 'enemy-moth' | 'enemy-orc' | 'enemy-lizard' | 'enemy-boss';

export interface PlaceholderSpec {
  size: number;             // Kantenlänge in px
  base: Hex;                // Grundfläche
  accent: Hex;             // Detail/Highlight
  outline: Hex;            // Umrandung
  shape: 'block' | 'round'; // Kacheln = block, Figuren = round
}

export type VfxKind =
  | 'hit-burst'
  | 'heal-spark'
  | 'death-poof'
  | 'physical-bolt'
  | 'magic-bolt'
  | 'target-ring';

export type VfxShape = 'burst' | 'spark' | 'puff' | 'bolt' | 'ring';

export type PortraitKind =
  | 'rimuru'
  | 'gobta'
  | 'shuna'
  | 'sora'
  | 'vael'
  | 'lyrre'
  | 'rigurd'
  | 'storm-dragon'
  | 'mordrahn';

export type PortraitMotif =
  | 'slime'
  | 'goblin'
  | 'priest'
  | 'warrior'
  | 'mage'
  | 'scout'
  | 'elder'
  | 'dragon'
  | 'shadow';

export type UiSkinKind = 'panel' | 'button' | 'button-active' | 'button-danger' | 'button-success';

export interface VfxSpec {
  size: number;
  base: Hex;
  accent: Hex;
  outline: Hex;
  shape: VfxShape;
}

export interface PortraitSpec {
  size: number;
  base: Hex;
  accent: Hex;
  outline: Hex;
  background: Hex;
  motif: PortraitMotif;
}

export interface UiSkinSpec {
  base: Hex;
  accent: Hex;
  outline: Hex;
  highlight: Hex;
  shadow: Hex;
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
  'enemy-ogre': { base: PALETTE.enemy, accent: PALETTE.bone, shape: 'round' },
  'enemy-moth': { base: PALETTE.arcane, accent: PALETTE.mist, shape: 'round' },
  'enemy-orc': { base: PALETTE.grassDark, accent: PALETTE.ember, shape: 'round' },
  'enemy-lizard': { base: PALETTE.grass, accent: PALETTE.gold, shape: 'round' },
  'enemy-boss': { base: PALETTE.shadow, accent: PALETTE.enemy, shape: 'round' }
};

export const PLACEHOLDER_KINDS: readonly PlaceholderKind[] = [
  ...Object.keys(TILE_SPECS), ...Object.keys(UNIT_SPECS)
] as PlaceholderKind[];

export const VFX_KINDS: readonly VfxKind[] = [
  'hit-burst',
  'heal-spark',
  'death-poof',
  'physical-bolt',
  'magic-bolt',
  'target-ring'
] as const;

export const PORTRAIT_KINDS: readonly PortraitKind[] = [
  'rimuru',
  'gobta',
  'shuna',
  'sora',
  'vael',
  'lyrre',
  'rigurd',
  'storm-dragon',
  'mordrahn'
] as const;

export const UI_SKIN_KINDS: readonly UiSkinKind[] = [
  'panel',
  'button',
  'button-active',
  'button-danger',
  'button-success'
] as const;

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

/** Deterministische VFX-Spec je Effekt; unbekannte Keys → Treffer-Burst-Fallback. */
export function vfxSpec(kind: string): VfxSpec {
  switch (kind) {
    case 'heal-spark':
      return { size: 32, base: PALETTE.hp, accent: PALETTE.bone, outline: PALETTE.ink, shape: 'spark' };
    case 'death-poof':
      return { size: 32, base: PALETTE.mist, accent: PALETTE.shadow, outline: PALETTE.ink, shape: 'puff' };
    case 'physical-bolt':
      return { size: 24, base: PALETTE.gold, accent: PALETTE.bone, outline: PALETTE.ink, shape: 'bolt' };
    case 'magic-bolt':
      return { size: 24, base: PALETTE.arcane, accent: PALETTE.bone, outline: PALETTE.ink, shape: 'bolt' };
    case 'target-ring':
      return { size: 32, base: PALETTE.hp, accent: PALETTE.bone, outline: PALETTE.ink, shape: 'ring' };
    case 'hit-burst':
    default:
      return { size: 32, base: PALETTE.ember, accent: PALETTE.gold, outline: PALETTE.ink, shape: 'burst' };
  }
}

/** Deterministische Portrait-Specs für prozedurale, CC0-freie Pixel-Busts. */
export function portraitSpec(kind: string): PortraitSpec {
  switch (kind) {
    case 'rimuru':
      return { size: 64, base: PALETTE.water, accent: PALETTE.bone, outline: PALETTE.ink, background: PALETTE.shadow, motif: 'slime' };
    case 'gobta':
      return { size: 64, base: PALETTE.grass, accent: PALETTE.gold, outline: PALETTE.ink, background: PALETTE.shadow, motif: 'goblin' };
    case 'shuna':
      return { size: 64, base: PALETTE.hp, accent: PALETTE.gold, outline: PALETTE.ink, background: PALETTE.steel, motif: 'priest' };
    case 'sora':
      return { size: 64, base: PALETTE.ember, accent: PALETTE.gold, outline: PALETTE.ink, background: PALETTE.shadow, motif: 'warrior' };
    case 'vael':
      return { size: 64, base: PALETTE.arcane, accent: PALETTE.bone, outline: PALETTE.ink, background: PALETTE.steel, motif: 'mage' };
    case 'lyrre':
      return { size: 64, base: PALETTE.mist, accent: PALETTE.gold, outline: PALETTE.ink, background: PALETTE.shadow, motif: 'scout' };
    case 'rigurd':
      return { size: 64, base: PALETTE.stone, accent: PALETTE.gold, outline: PALETTE.ink, background: PALETTE.shadow, motif: 'elder' };
    case 'storm-dragon':
      return { size: 64, base: PALETTE.water, accent: PALETTE.arcane, outline: PALETTE.ink, background: PALETTE.shadow, motif: 'dragon' };
    case 'mordrahn':
      return { size: 64, base: PALETTE.enemy, accent: PALETTE.arcane, outline: PALETTE.ink, background: PALETTE.shadow, motif: 'shadow' };
    default:
      return { size: 64, base: PALETTE.steel, accent: PALETTE.mist, outline: PALETTE.ink, background: PALETTE.shadow, motif: 'scout' };
  }
}

/** Deterministischer UI-Skin aus der Projektpalette. */
export function uiSkinSpec(kind: string): UiSkinSpec {
  switch (kind) {
    case 'button-active':
      return { base: PALETTE.water, accent: PALETTE.hp, outline: PALETTE.bone, highlight: PALETTE.mist, shadow: PALETTE.ink };
    case 'button-danger':
      return { base: PALETTE.enemy, accent: PALETTE.ember, outline: PALETTE.gold, highlight: PALETTE.bone, shadow: PALETTE.ink };
    case 'button-success':
      return { base: PALETTE.grassDark, accent: PALETTE.hp, outline: PALETTE.bone, highlight: PALETTE.hp, shadow: PALETTE.ink };
    case 'button':
      return { base: PALETTE.shadow, accent: PALETTE.water, outline: PALETTE.mist, highlight: PALETTE.steel, shadow: PALETTE.ink };
    case 'panel':
    default:
      return { base: PALETTE.shadow, accent: PALETTE.gold, outline: PALETTE.steel, highlight: PALETTE.mist, shadow: PALETTE.ink };
  }
}

export interface IdleBobSpec {
  readonly amplitudePx: number;
  readonly durationMs: number;
  readonly delayMs: number;
}

/**
 * Dezente, deterministische Idle-Bob-Animation für Kampf-Einheiten.
 * `null`, wenn reduzierte Bewegung aktiv ist oder die Einheit besiegt wurde —
 * dann bleibt das Sprite ruhig. Der Phasenversatz aus der ID verhindert, dass
 * alle Einheiten im Gleichschritt wippen.
 */
export function idleBobSpec(
  unitId: string,
  opts: { readonly reducedMotion: boolean; readonly dead: boolean }
): IdleBobSpec | null {
  if (opts.reducedMotion || opts.dead) return null;
  let hash = 0;
  for (let i = 0; i < unitId.length; i += 1) {
    hash = (hash * 31 + unitId.charCodeAt(i)) >>> 0;
  }
  return {
    amplitudePx: 3,
    durationMs: 1400 + (hash % 600), // 1400–1999 ms, leicht variierend
    delayMs: hash % 400
  };
}
