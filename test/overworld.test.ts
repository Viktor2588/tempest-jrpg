import { describe, it, expect } from 'vitest';
import { parseMap, isWalkable, tileKey, tryStep, WALL, FLOOR } from '../src/systems/overworld';
import { JURA_FIELD } from '../src/data/maps';

const MAP = parseMap([
  '#####',
  '#...#',
  '#.#.#',
  '#...#',
  '#####'
], { x: 1, y: 1 });

describe('overworld grid', () => {
  it('parseMap erkennt Wände und Boden und füllt Breite auf', () => {
    expect(MAP.width).toBe(5);
    expect(MAP.height).toBe(5);
    expect(MAP.tiles[0]![0]).toBe(WALL);
    expect(MAP.tiles[1]![1]).toBe(FLOOR);
    expect(MAP.tiles[2]![2]).toBe(WALL); // Innenhindernis
  });

  it('isWalkable: Boden begehbar, Wand und außerhalb nicht', () => {
    expect(isWalkable(MAP, 1, 1)).toBe(true);
    expect(isWalkable(MAP, 0, 0)).toBe(false); // Wand
    expect(isWalkable(MAP, 2, 2)).toBe(false); // Innenhindernis
    expect(isWalkable(MAP, -1, 1)).toBe(false); // außerhalb
    expect(isWalkable(MAP, 5, 1)).toBe(false); // außerhalb
  });

  it('tryStep bewegt auf Boden und blockiert an Wänden', () => {
    expect(tryStep(MAP, { x: 1, y: 1 }, 'right')).toEqual({ x: 2, y: 1 });
    expect(tryStep(MAP, { x: 1, y: 1 }, 'up')).toEqual({ x: 1, y: 1 });   // Wand oben → blockiert
    expect(tryStep(MAP, { x: 1, y: 1 }, 'left')).toEqual({ x: 1, y: 1 }); // Wand links → blockiert
    // gegen das Innenhindernis (2,2) von (1,2) nach rechts → blockiert
    expect(tryStep(MAP, { x: 1, y: 2 }, 'right')).toEqual({ x: 1, y: 2 });
  });

  it('tryStep blockiert von Entitäten besetzte Kacheln (NPC-Kollision)', () => {
    const blocked = new Set([tileKey(2, 1)]); // NPC steht auf (2,1)
    // Ziel (2,1) ist begehbarer Boden, aber von einem NPC besetzt → man bleibt stehen.
    expect(tryStep(MAP, { x: 1, y: 1 }, 'right', blocked)).toEqual({ x: 1, y: 1 });
    // Freie Richtung bleibt begehbar.
    expect(tryStep(MAP, { x: 1, y: 1 }, 'down', blocked)).toEqual({ x: 1, y: 2 });
    // Ohne Blockierset verhält sich tryStep wie zuvor.
    expect(tryStep(MAP, { x: 1, y: 1 }, 'right')).toEqual({ x: 2, y: 1 });
  });

  it('das Spielfeld JURA_FIELD ist umrandet und hat einen begehbaren Spawn', () => {
    expect(JURA_FIELD.tiles[0]!.every((t) => t === WALL)).toBe(true); // obere Randwand
    expect(isWalkable(JURA_FIELD, JURA_FIELD.spawn.x, JURA_FIELD.spawn.y)).toBe(true);
  });
});
