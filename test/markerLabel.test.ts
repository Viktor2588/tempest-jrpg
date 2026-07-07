import { describe, expect, it } from 'vitest';
import { markerLabelVisible } from '../src/systems/overworld';

// Phase 107 — Dauer-Namenslabels nur nahe dem Spieler oder am getrackten Ziel,
// damit die Overworld (v. a. der Gateway-Cluster) nicht zum Beschriftungs-Feld wird.
describe('Phase 107 — markerLabelVisible', () => {
  const player = { x: 10, y: 10 };

  it('zeigt das Label immer am getrackten Ziel, unabhängig von der Distanz', () => {
    expect(markerLabelVisible(player, { x: 0, y: 0 }, true)).toBe(true);
  });

  it('zeigt Nicht-Ziel-Labels nur innerhalb des Standard-Radius (Chebyshev = 3)', () => {
    expect(markerLabelVisible(player, { x: 13, y: 10 }, false)).toBe(true); // exakt 3
    expect(markerLabelVisible(player, { x: 13, y: 13 }, false)).toBe(true); // diagonal 3
    expect(markerLabelVisible(player, { x: 14, y: 10 }, false)).toBe(false); // 4
    expect(markerLabelVisible(player, { x: 10, y: 15 }, false)).toBe(false); // 5
  });

  it('respektiert einen abweichenden Radius', () => {
    expect(markerLabelVisible(player, { x: 15, y: 10 }, false, 5)).toBe(true);
    expect(markerLabelVisible(player, { x: 16, y: 10 }, false, 5)).toBe(false);
  });
});
