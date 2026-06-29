import { describe, expect, it } from 'vitest';
import { buildMinimap } from '../src/systems/minimap';

describe('minimap-modell', () => {
  it('skaliert die Karte ins Panel und projiziert Marker geclamped', () => {
    const model = buildMinimap(24, 16, [
      { x: 0, y: 0, kind: 'player' },
      { x: 23, y: 15, kind: 'gateway' },
      { x: 14, y: 8, kind: 'objective' }
    ], 120);

    expect(model.cell).toBe(5); // floor(120 / 24)
    expect(model.width).toBe(120);
    expect(model.height).toBe(80);
    expect(model.dots[0]).toEqual({ px: 2.5, py: 2.5, kind: 'player' });

    const last = model.dots[1]!;
    expect(last.px).toBeLessThanOrEqual(model.width);
    expect(last.py).toBeLessThanOrEqual(model.height);
    expect(last.px).toBeGreaterThan(model.width - model.cell);
    expect(model.dots[2]).toEqual({ px: 72.5, py: 42.5, kind: 'objective' });
  });

  it('hält eine Mindestzellgröße auch bei sehr großen Karten', () => {
    expect(buildMinimap(200, 200, [], 120).cell).toBeGreaterThanOrEqual(2);
  });
});
