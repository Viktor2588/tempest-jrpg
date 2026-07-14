import { describe, expect, it } from 'vitest';
import { ENCOUNTERS } from '../src/data/world';
import { ENEMIES } from '../src/data/enemies';
import { getMap } from '../src/data/maps';
import { isWalkable } from '../src/systems/overworld';
import { resolveEncounter } from '../src/systems/world';
import { makeRng } from '../src/systems/rng';
import type { WorldState } from '../src/systems/world';

// Phase 73: jeder zuvor encounter-lose Gegner ist jetzt per Trigger erreichbar,
// steht auf einer begehbaren Kachel und löst mit gesetztem Gate-Flag genau
// seinen Encounter aus.
const CASES = [
  { enemyId: 'orc-grunt', encounterId: 'orc-scout-patrol', flag: 'story.treyni.met' },
  { enemyId: 'ogre-warrior', encounterId: 'grieving-ogres', flag: 'story.orc.engaged' },
  { enemyId: 'orc-lord', encounterId: 'orc-lord-remnant', flag: 'story.geld.devoured' },
  { enemyId: 'milim', encounterId: 'milim-duel', flag: 'story.milim.met' }
] as const;

describe('Phase 73 — fehlende Gegner eingebaut', () => {
  it('macht alle vier Gegner über einen begehbaren, flag-gegateten Trigger erreichbar', () => {
    for (const { enemyId, encounterId, flag } of CASES) {
      const enc = ENCOUNTERS.find((e) => e.id === encounterId);
      expect(enc, encounterId).toBeDefined();
      // Trigger-Encounter (mit fester Position) — grenzt gegen Random-Encounter ab.
      if (!enc || enc.kind !== 'trigger') throw new Error(`${encounterId} ist kein Trigger-Encounter`);
      expect(enc.enemyIds).toContain(enemyId);
      expect(ENEMIES.some((en) => en.id === enemyId), enemyId).toBe(true);

      const flags = { [flag]: true };
      const map = getMap(enc.mapId, flags);
      expect(isWalkable(map, enc.position.x, enc.position.y), `${encounterId} walkable`).toBe(true);

      const state: WorldState = { flags, quests: {}, inventory: [], gold: 0 };
      const hit = resolveEncounter(state, enc.mapId, enc.position, makeRng(1));
      expect(hit.state.encounter?.id, encounterId).toBe(encounterId);

      // Ohne Gate-Flag darf der Trigger nicht auslösen.
      const locked = resolveEncounter(
        { flags: {}, quests: {}, inventory: [], gold: 0 },
        enc.mapId,
        enc.position,
        makeRng(1)
      );
      expect(locked.state.encounter?.id, `${encounterId} gated`).not.toBe(encounterId);
    }
  });
});
