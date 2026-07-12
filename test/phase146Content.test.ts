import { describe, expect, it } from 'vitest';
import { ENCOUNTERS, ENEMIES } from '../src/data';
import { createLabyrinthRun } from '../src/systems/labyrinth';

const NEW_ENEMIES = ['thorn-treant', 'marsh-hexer', 'storm-shard'] as const;

describe('Phase 146 — Content-Vielfalt', () => {
  it('verdrahtet jede neue Art in Regionen und Labyrinth', () => {
    const ids = new Set(ENEMIES.map((enemy) => enemy.id));
    const regionIds = new Set(ENCOUNTERS.flatMap((encounter) => encounter.enemyIds));
    const labyrinthIds = new Set(createLabyrinthRun(146).floors.flatMap((floor) => floor.enemyIds));

    for (const id of NEW_ENEMIES) {
      expect(ids.has(id), id).toBe(true);
      expect(regionIds.has(id), `${id} region`).toBe(true);
      expect(labyrinthIds.has(id), `${id} labyrinth`).toBe(true);
    }
  });
});
