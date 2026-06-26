import { describe, it, expect } from 'vitest';
import { makeRng, randomInt, pick } from '../src/systems/rng';

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

  it('randomInt bleibt im inklusiven Bereich', () => {
    const r = makeRng(123);
    for (let i = 0; i < 1000; i++) {
      const v = randomInt(r, 3, 8);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(8);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('pick wählt deterministisch ein Element', () => {
    const items = ['a', 'b', 'c', 'd'] as const;
    const r1 = makeRng(99), r2 = makeRng(99);
    expect(pick(r1, items)).toBe(pick(r2, items));
    expect(items).toContain(pick(makeRng(5), items));
  });
});
