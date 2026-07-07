import { describe, it, expect } from 'vitest';
import { makeRng } from '../src/systems/rng';

describe('makeRng', () => {
  it('ist deterministisch: gleicher Seed → gleiche Sequenz', () => {
    const a = makeRng(42), b = makeRng(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('unterschiedliche Seeds → unterschiedliche Sequenzen', () => {
    const a = makeRng(1), b = makeRng(2);
    expect(a()).not.toEqual(b());
  });

  it('liefert Werte in [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
