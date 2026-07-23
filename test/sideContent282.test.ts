import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { validateGameData } from './dataValidation';
import { ENCOUNTERS, QUESTS } from '../src/data/world';
import { ITEMS } from '../src/data/items';
import { MAPS } from '../src/data/maps';
import { FLOOR } from '../src/systems/overworld';
import { rarityOf } from '../src/systems/itemRarity';
import type { EncounterDefinition, ItemDefinition, QuestDefinition } from '../src/data';

// Phase 282 — Nebeninhalte & optionale Regionen. Drei lohnende Nebenpfade, je in eine
// bestehende Nebenregion (Hochland/Blumund/Akademie). Selbe Struktur wie die Phase-154-
// Loot-Quests: annehmen → Jagd-Encounter → abliefern, Gear-Belohnung. Der Test sichert:
// echtes Gear, begehbare Jagd-Kachel, vollstaendige Flag-/Quest-Verdrahtung, off-route.

const ALL_ITEMS = ITEMS as readonly ItemDefinition[];
const ALL_ENCOUNTERS = ENCOUNTERS as readonly EncounterDefinition[];
const ALL_QUESTS = QUESTS as readonly QuestDefinition[];
const itemById = new Map(ALL_ITEMS.map((item) => [item.id, item]));

interface SideWiring {
  readonly questId: string;
  readonly encounterId: string;
  readonly startedFlag: string;
  readonly clearedFlag: string;
  readonly huntStepId: string;
  readonly gearItemId: string;
  readonly mapId: string;
  readonly x: number;
  readonly y: number;
}

const SIDE_PATHS: readonly SideWiring[] = [
  {
    questId: 'stormpeak-hunt',
    encounterId: 'stormpeak-hunt-battle',
    startedFlag: 'sidequest.stormpeak.started',
    clearedFlag: 'sidequest.stormpeak.cleared',
    huntStepId: 'hunt-stormpeak',
    gearItemId: 'zephyr-band',
    mapId: 'spirit-highlands',
    x: 4,
    y: 10
  },
  {
    questId: 'blumund-raiders-hunt',
    encounterId: 'blumund-raiders-hunt-battle',
    startedFlag: 'sidequest.blumund-raiders.started',
    clearedFlag: 'sidequest.blumund-raiders.cleared',
    huntStepId: 'hunt-raiders',
    gearItemId: 'warded-brigandine',
    mapId: 'blumund',
    x: 8,
    y: 6
  },
  {
    questId: 'academy-cleansing-hunt',
    encounterId: 'academy-cleansing-hunt-battle',
    startedFlag: 'sidequest.academy-cleansing.started',
    clearedFlag: 'sidequest.academy-cleansing.cleared',
    huntStepId: 'hunt-cleansing',
    gearItemId: 'resonant-core',
    mapId: 'freedom-academy',
    x: 8,
    y: 6
  }
];

describe('Phase 282 — Nebeninhalte & optionale Regionen', () => {
  it('bricht die Spieldaten-Integritaet nicht (Quest-/Dialog-/Encounter-Wiring gueltig)', () => {
    expect(validateGameData(GAME_DATA)).toEqual([]);
  });

  it('belohnt jeden Nebenpfad mit echtem Ausruestungs-Gear (kein reines Verbrauchsgut)', () => {
    for (const wiring of SIDE_PATHS) {
      const quest = ALL_QUESTS.find((q) => q.id === wiring.questId);
      expect(quest, wiring.questId).toBeDefined();
      const gear = itemById.get(wiring.gearItemId);
      expect(gear, wiring.gearItemId).toBeDefined();
      expect(gear!.equipmentSlot).toBeTruthy();
      expect(rarityOf(gear!)).not.toBe('gewoehnlich');
      expect(quest!.reward?.itemIds ?? []).toContain(wiring.gearItemId);
    }
  });

  it('platziert jeden Jagd-Encounter auf einer begehbaren Kachel seiner Region', () => {
    for (const wiring of SIDE_PATHS) {
      const map = MAPS[wiring.mapId];
      expect(map, wiring.mapId).toBeDefined();
      const tile = map!.tiles[wiring.y]?.[wiring.x];
      expect(tile, `${wiring.encounterId} @(${wiring.x},${wiring.y})`).toBe(FLOOR);
    }
  });

  it('schliesst jeden Auftrag ueber Start-Flag, Jagd-Sieg und Cleared-Flag', () => {
    for (const wiring of SIDE_PATHS) {
      const encounter = ALL_ENCOUNTERS.find((e) => e.id === wiring.encounterId);
      expect(encounter, wiring.encounterId).toBeDefined();
      expect(encounter!.requirements ?? []).toContainEqual({ flag: wiring.startedFlag });
      expect(encounter!.requirements ?? []).toContainEqual({ notFlag: wiring.clearedFlag });
      expect(encounter!.victoryEffects ?? []).toContainEqual({
        type: 'set-flag',
        flag: wiring.clearedFlag,
        value: true
      });
      expect(encounter!.victoryEffects ?? []).toContainEqual({
        type: 'complete-quest-step',
        questId: wiring.questId,
        stepId: wiring.huntStepId
      });
    }
  });

  it('haelt die Jagd-Encounter off-route (in keiner Region-encounterIds-Liste)', () => {
    const huntIds = new Set(SIDE_PATHS.map((w) => w.encounterId));
    for (const region of GAME_DATA.progression.regions) {
      for (const encounterId of region.encounterIds) {
        expect(huntIds.has(encounterId)).toBe(false);
      }
    }
  });
});
