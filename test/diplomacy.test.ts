import { describe, expect, it } from 'vitest';
import { DIALOGS, ENCOUNTERS, FACTIONS, type DialogDefinition, type EncounterDefinition, type WorldEffect } from '../src/data';
import {
  adjustReputation,
  buildDiplomacyView,
  clampReputation,
  currentThreshold,
  factionRewardStatus,
  getReputation,
  MAX_REPUTATION,
  validateFactions
} from '../src/systems/diplomacy';
import { applyEffects, createWorldState, applyWorldState, type WorldState } from '../src/systems/world';
import { createNewSave } from '../src/systems/save';

const factionIds = new Set<string>(FACTIONS.map((faction) => faction.id));

describe('diplomacy data', () => {
  it('ist datenintegritär (streng steigende Schwellen, eindeutige Flags)', () => {
    expect(validateFactions()).toEqual([]);
  });

  it('alle adjust-reputation-Welteffekte referenzieren echte Faktionen', () => {
    const dialogs = DIALOGS as readonly DialogDefinition[];
    const encounters = ENCOUNTERS as readonly EncounterDefinition[];
    const effects: WorldEffect[] = [
      ...dialogs.flatMap((dialog) => dialog.nodes.flatMap((node) => node.choices.flatMap((choice) => choice.effects ?? []))),
      ...encounters.flatMap((encounter) => [...(encounter.startEffects ?? []), ...(encounter.victoryEffects ?? [])])
    ];
    const repEffects = effects.filter((effect) => effect.type === 'adjust-reputation');
    expect(repEffects.length).toBeGreaterThan(0);
    for (const effect of repEffects) {
      if (effect.type === 'adjust-reputation') {
        expect(factionIds.has(effect.factionId)).toBe(true);
      }
    }
  });
});

describe('diplomacy rules', () => {
  it('klemmt Reputation auf [0, max]', () => {
    expect(clampReputation(-10)).toBe(0);
    expect(clampReputation(999)).toBe(MAX_REPUTATION);
    expect(clampReputation(42.6)).toBe(43);
  });

  it('setzt beim Überschreiten einer Schwelle deren Unlock-Flag', () => {
    const change = adjustReputation({}, {}, 'dwargon', 55);
    expect(getReputation(change.reputation, 'dwargon')).toBe(55);
    // 20 (known) und 50 (trusted) erreicht, 90 (allied) noch nicht
    expect(change.flags['reputation.dwargon.known']).toBe(true);
    expect(change.flags['reputation.dwargon.trusted']).toBe(true);
    expect(change.flags['reputation.dwargon.allied']).toBeUndefined();
    expect(change.crossed.map((threshold) => threshold.unlockFlag)).toEqual([
      'reputation.dwargon.known',
      'reputation.dwargon.trusted'
    ]);
  });

  it('setzt bereits gesetzte Flags nicht erneut als „crossed"', () => {
    const first = adjustReputation({}, {}, 'orcs', 25);
    const second = adjustReputation(first.reputation, first.flags, 'orcs', 30);
    // known war schon gesetzt; nur trusted (50) kommt neu dazu
    expect(second.crossed.map((t) => t.unlockFlag)).toEqual(['reputation.orcs.trusted']);
  });

  it('ignoriert unbekannte Faktionen ohne Zustandsänderung', () => {
    const change = adjustReputation({ dwargon: 10 }, {}, 'atlantis', 40);
    expect(change.reputation).toEqual({ dwargon: 10 });
    expect(change.flags).toEqual({});
    expect(change.crossed).toEqual([]);
  });

  it('senkt Reputation und hält bereits erreichte Flags (kein Zurücknehmen)', () => {
    const up = adjustReputation({}, {}, 'blumund', 60);
    const down = adjustReputation(up.reputation, up.flags, 'blumund', -40);
    expect(getReputation(down.reputation, 'blumund')).toBe(20);
    // Flags bleiben gesetzt (Ansehen einmal verdient); currentThreshold folgt den Punkten
    expect(down.flags['reputation.blumund.trusted']).toBe(true);
    const faction = FACTIONS.find((f) => f.id === 'blumund')!;
    expect(currentThreshold(faction, getReputation(down.reputation, 'blumund'))?.title).toBe('Bekannt');
  });

  it('baut eine Ansicht mit Rang und Fortschritt zur nächsten Stufe', () => {
    const view = buildDiplomacyView({ dwargon: 30 });
    const dwargon = view.find((row) => row.faction.id === 'dwargon')!;
    expect(dwargon.rankTitle).toBe('Geduldet');
    expect(dwargon.nextThreshold?.points).toBe(50);
    expect(dwargon.pointsToNext).toBe(20);
    const fremd = view.find((row) => row.faction.id === 'lizardmen')!;
    expect(fremd.rankTitle).toBe('Fremd');
  });
});

describe('factionRewardStatus (Phase 180)', () => {
  it('ohne Flags ist keine Belohnung aktiv (0/3 pro Fraktion)', () => {
    const status = factionRewardStatus({});
    expect(status).toHaveLength(FACTIONS.length);
    for (const entry of status) {
      expect(entry.activeCount).toBe(0);
      expect(entry.total).toBe(3);
      expect(entry.rewards.every((reward) => !reward.active)).toBe(true);
    }
  });

  it('markiert genau die gesetzten Unlock-Flags als aktiv (Reihenfolge erhalten)', () => {
    const { flags } = adjustReputation({}, {}, 'dwargon', 55);
    const status = factionRewardStatus(flags);
    const dwargon = status.find((entry) => entry.factionId === 'dwargon')!;
    expect(dwargon.activeCount).toBe(2);
    expect(dwargon.rewards.map((reward) => reward.active)).toEqual([true, true, false]);
    // Andere Fraktionen bleiben unberührt.
    expect(status.find((entry) => entry.factionId === 'orcs')!.activeCount).toBe(0);
  });

  it('alle Schwellen einer Fraktion überschritten → 3/3 aktiv', () => {
    const { flags } = adjustReputation({}, {}, 'blumund', MAX_REPUTATION);
    const blumund = factionRewardStatus(flags).find((entry) => entry.factionId === 'blumund')!;
    expect(blumund.activeCount).toBe(3);
    expect(blumund.rewards.every((reward) => reward.active)).toBe(true);
  });
});

describe('diplomacy world integration', () => {
  it('verschiebt Reputation über den Welt-Effekt und schreibt sie in den Save zurück', () => {
    const save = createNewSave();
    const world = createWorldState(save);
    const next = applyEffects(world, [{ type: 'adjust-reputation', factionId: 'dwargon', amount: 90 }]);

    expect(getReputation(next.factionReputation ?? {}, 'dwargon')).toBe(90);
    expect(next.flags['reputation.dwargon.allied']).toBe(true);

    const persisted = applyWorldState(save, next);
    expect(persisted.progression.factionReputationByFactionId.dwargon).toBe(90);
  });

  it('lässt Reputation bei alten WorldState-Literalen ohne das Feld neutral', () => {
    const bare: WorldState = { flags: {}, quests: {}, inventory: [], gold: 0 };
    const next = applyEffects(bare, [{ type: 'adjust-reputation', factionId: 'orcs', amount: 20 }]);
    expect(getReputation(next.factionReputation ?? {}, 'orcs')).toBe(20);
    expect(next.flags['reputation.orcs.known']).toBe(true);
  });
});
