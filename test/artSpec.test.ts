import { describe, it, expect } from 'vitest';
import {
  ART,
  PALETTE,
  PLACEHOLDER_KINDS,
  PORTRAIT_KINDS,
  UI_SKIN_KINDS,
  VFX_KINDS,
  placeholderSpec,
  portraitSpec,
  idleBobSpec,
  uiSkinSpec,
  vfxSpec
} from '../src/render/artSpec';

const HEX = /^#[0-9a-f]{6}$/i;
const paletteValues = new Set<string>(Object.values(PALETTE));

describe('artSpec', () => {
  it('Palette enthält nur gültige 6-stellige Hex-Farben', () => {
    for (const color of Object.values(PALETTE)) expect(color).toMatch(HEX);
  });

  it('ART definiert Top-down mit 32px-Kacheln/Sprites', () => {
    expect(ART.tile).toBe(32);
    expect(ART.sprite).toBe(32);
    expect(ART.perspective).toBe('top-down');
  });

  it('jede bekannte Art liefert eine gültige Spec aus der Palette', () => {
    for (const kind of PLACEHOLDER_KINDS) {
      const spec = placeholderSpec(kind);
      expect(spec.size).toBe(32);
      expect(['block', 'round']).toContain(spec.shape);
      expect(kind.startsWith('tile-') ? 'block' : 'round').toBe(spec.shape);
      for (const c of [spec.base, spec.accent, spec.outline]) {
        expect(c).toMatch(HEX);
        expect(paletteValues.has(c)).toBe(true);
      }
    }
  });

  it('ist deterministisch (gleiche Art → gleiche Spec)', () => {
    expect(placeholderSpec('hero')).toEqual(placeholderSpec('hero'));
  });

  it('unbekannte Art → neutraler Fallback (rund, gültige Farben)', () => {
    const spec = placeholderSpec('gibtsnicht');
    expect(spec.size).toBe(32);
    expect(spec.shape).toBe('round');
    expect(spec.base).toMatch(HEX);
  });

  it('definiert einen kohärenten VFX-Satz aus der Projektpalette', () => {
    expect(VFX_KINDS).toEqual([
      'hit-burst',
      'heal-spark',
      'death-poof',
      'physical-bolt',
      'magic-bolt',
      'target-ring'
    ]);
    for (const kind of VFX_KINDS) {
      const spec = vfxSpec(kind);
      expect(spec.size).toBeGreaterThanOrEqual(24);
      expect(['burst', 'spark', 'puff', 'bolt', 'ring']).toContain(spec.shape);
      for (const c of [spec.base, spec.accent, spec.outline]) {
        expect(c).toMatch(HEX);
        expect(paletteValues.has(c)).toBe(true);
      }
    }
  });

  it('definiert Portrait-Specs für Party- und Storyfiguren aus der Projektpalette', () => {
    expect(PORTRAIT_KINDS).toEqual([
      'rimuru',
      'gobta',
      'shuna',
      'sora',
      'vael',
      'lyrre',
      'rigurd',
      'storm-dragon',
      'ranga',
      'shizu',
      'fuze',
      'benimaru',
      'shion',
      'hakurou',
      'kurobe',
      'souei',
      'kaijin',
      'eir',
      'kael',
      'gazel',
      'blumund-adventurers',
      'treyni',
      'milim',
      'souka',
      'mordrahn'
    ]);
    for (const kind of PORTRAIT_KINDS) {
      const spec = portraitSpec(kind);
      expect(spec.size).toBe(64);
      expect(['slime', 'goblin', 'priest', 'warrior', 'mage', 'scout', 'elder', 'dragon', 'shadow'])
        .toContain(spec.motif);
      for (const c of [spec.base, spec.accent, spec.outline, spec.background]) {
        expect(c).toMatch(HEX);
        expect(paletteValues.has(c)).toBe(true);
      }
    }
  });

  it('definiert einen wiederverwendbaren UI-Skin aus der Projektpalette', () => {
    expect(UI_SKIN_KINDS).toEqual([
      'panel',
      'button',
      'button-active',
      'button-danger',
      'button-success'
    ]);
    for (const kind of UI_SKIN_KINDS) {
      const spec = uiSkinSpec(kind);
      for (const c of [spec.base, spec.accent, spec.outline, spec.highlight, spec.shadow]) {
        expect(c).toMatch(HEX);
        expect(paletteValues.has(c)).toBe(true);
      }
    }
  });

  it('liefert deterministische, phasenversetzte Idle-Bobs und respektiert reduzierte Bewegung', () => {
    expect(idleBobSpec('unit-a', { reducedMotion: true, dead: false })).toBeNull();
    expect(idleBobSpec('unit-a', { reducedMotion: false, dead: true })).toBeNull();

    const a = idleBobSpec('unit-a', { reducedMotion: false, dead: false })!;
    const b = idleBobSpec('unit-b', { reducedMotion: false, dead: false })!;
    expect(a).toEqual(idleBobSpec('unit-a', { reducedMotion: false, dead: false })); // deterministisch
    expect(a.amplitudePx).toBeGreaterThan(0);
    expect(a.durationMs).toBeGreaterThanOrEqual(1400);
    expect(a.durationMs).toBeLessThan(2000);
    expect(a.delayMs).toBeGreaterThanOrEqual(0);
    expect(a.delayMs).toBeLessThan(400);
    expect(a.delayMs).not.toBe(b.delayMs); // unterschiedlicher Phasenversatz
  });
});
