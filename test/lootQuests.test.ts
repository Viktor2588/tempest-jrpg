import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { validateGameData } from './dataValidation';
import { ENCOUNTERS, QUESTS } from '../src/data/world';
import { ITEMS } from '../src/data/items';
import { MAPS } from '../src/data/maps';
import { FLOOR } from '../src/systems/overworld';
import { rarityOf } from '../src/systems/itemRarity';
import type { EncounterDefinition, ItemDefinition, QuestDefinition } from '../src/data';

const ALL_ITEMS = ITEMS as readonly ItemDefinition[];
const ALL_ENCOUNTERS = ENCOUNTERS as readonly EncounterDefinition[];
const ALL_QUESTS = QUESTS as readonly QuestDefinition[];

// Phase 154 — an Loot gekoppelte Nebenquests. Jede Quest jagt in einer duennen Region
// und zahlt gezielt ein Gear-Stueck aus Welle 11 (Kern/selten/legendaer). Der Test
// sichert: die Belohnung ist echtes Gear (kein Verbrauchsgut), die Jagd steht auf einer
// begehbaren Kachel, und die Flag-/Quest-Verdrahtung schliesst den Auftrag ab.

const itemById = new Map(ALL_ITEMS.map((item) => [item.id, item]));

interface LootQuestWiring {
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

const LOOT_QUESTS: readonly LootQuestWiring[] = [
  {
    questId: 'emberforge-hunt',
    encounterId: 'emberforge-hunt-battle',
    startedFlag: 'sidequest.emberforge.started',
    clearedFlag: 'sidequest.emberforge.cleared',
    huntStepId: 'hunt-ember',
    gearItemId: 'ember-magicule-core',
    mapId: 'ember-hollow',
    x: 7,
    y: 4
  },
  {
    questId: 'echomoor-blade-hunt',
    encounterId: 'echomoor-blade-hunt-battle',
    startedFlag: 'sidequest.echomoor-blade.started',
    clearedFlag: 'sidequest.echomoor-blade.cleared',
    huntStepId: 'hunt-blade',
    gearItemId: 'orc-cleaver',
    mapId: 'lizardman-marsh',
    x: 7,
    y: 4
  },
  {
    questId: 'highland-ward-hunt',
    encounterId: 'highland-ward-hunt-battle',
    startedFlag: 'sidequest.highland-ward.started',
    clearedFlag: 'sidequest.highland-ward.cleared',
    huntStepId: 'hunt-ward',
    gearItemId: 'ward-talisman',
    mapId: 'spirit-highlands',
    x: 9,
    y: 4
  }
];

describe('Phase 154 — an Loot gekoppelte Nebenquests', () => {
  it('bricht die Spieldaten-Integritaet nicht (Quest-/Dialog-/Encounter-Wiring gueltig)', () => {
    expect(validateGameData(GAME_DATA)).toEqual([]);
  });

  it('belohnt jede Quest mit echtem Ausruestungs-Gear (kein reines Verbrauchsgut)', () => {
    for (const wiring of LOOT_QUESTS) {
      const quest = ALL_QUESTS.find((q) => q.id === wiring.questId);
      expect(quest, wiring.questId).toBeDefined();
      const gear = itemById.get(wiring.gearItemId);
      expect(gear, wiring.gearItemId).toBeDefined();
      // Belohnung ist ausruestbares Gear und keine 'gewoehnlich'-Grundausstattung.
      expect(gear!.equipmentSlot).toBeTruthy();
      expect(rarityOf(gear!)).not.toBe('gewoehnlich');
      // Das Gear taucht auch in der angezeigten Quest-Belohnung auf.
      expect(quest!.reward?.itemIds ?? []).toContain(wiring.gearItemId);
    }
  });

  it('platziert jeden Jagd-Encounter auf einer begehbaren Kachel seiner Region', () => {
    for (const wiring of LOOT_QUESTS) {
      const map = MAPS[wiring.mapId];
      expect(map, wiring.mapId).toBeDefined();
      const tile = map!.tiles[wiring.y]?.[wiring.x];
      expect(tile, `${wiring.encounterId} @(${wiring.x},${wiring.y})`).toBe(FLOOR);
    }
  });

  it('schliesst jeden Auftrag ueber Start-Flag, Jagd-Sieg und Cleared-Flag', () => {
    for (const wiring of LOOT_QUESTS) {
      const encounter = ALL_ENCOUNTERS.find((e) => e.id === wiring.encounterId);
      expect(encounter, wiring.encounterId).toBeDefined();
      // Erscheint nur waehrend des laufenden Auftrags.
      expect(encounter!.requirements ?? []).toContainEqual({ flag: wiring.startedFlag });
      expect(encounter!.requirements ?? []).toContainEqual({ notFlag: wiring.clearedFlag });
      // Sieg setzt den Cleared-Flag und schliesst den Jagd-Schritt ab.
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
    const huntIds = new Set(LOOT_QUESTS.map((w) => w.encounterId));
    for (const region of GAME_DATA.progression.regions) {
      for (const encounterId of region.encounterIds) {
        expect(huntIds.has(encounterId)).toBe(false);
      }
    }
  });
});
