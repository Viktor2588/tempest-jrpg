// Seedbarer RNG (mulberry32) — rein, deterministisch, ohne Phaser/DOM.
// Grundlage für reproduzierbare Kämpfe und Tests.

export type Rng = () => number;

/** Erzeugt einen deterministischen RNG aus einem ganzzahligen Seed. Liefert Werte in [0, 1). */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ganzzahl in [min, max] (inklusiv). */
export function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Wählt deterministisch ein Element aus einer nicht-leeren Liste. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}
