import { describe, it, expect } from 'vitest';
import { ART, PALETTE, PLACEHOLDER_KINDS, placeholderSpec } from '../src/render/artSpec';

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
});
