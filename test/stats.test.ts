import { describe, expect, it } from 'vitest';
import { addPartialStats, multiplyPartialStats } from '../src/systems/stats';

describe('stats helpers', () => {
  it('addiert partielle Werte fehlertolerant pro Stat', () => {
    expect(addPartialStats(
      { attack: 2, maxHp: 10 },
      { attack: 3, defense: 4 }
    )).toEqual({
      maxHp: 10,
      maxMp: 0,
      attack: 5,
      defense: 4,
      magic: 0,
      spirit: 0,
      agility: 0
    });
  });

  it('skaliert partielle Werte pro Stat', () => {
    expect(multiplyPartialStats({ attack: 4, agility: 2 }, 2.5)).toEqual({
      maxHp: 0,
      maxMp: 0,
      attack: 10,
      defense: 0,
      magic: 0,
      spirit: 0,
      agility: 5
    });
  });
});
