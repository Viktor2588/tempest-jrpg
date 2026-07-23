import { describe, expect, it } from 'vitest';
import { FACILITIES, ITEMS, RESIDENTS, type ResidentRole } from '../src/data';
import {
  buildFacilityOverview,
  facilityLevelForStage,
  facilityOutputAmount,
  KITCHEN_REST_BUFF_FLAG,
  runProductionCycle
} from '../src/systems/facilities';
import { createNewSave, exportSave, importSave, migrate } from '../src/systems/save';
import { applyEffects, applyWorldState, createWorldState } from '../src/systems/world';

const VALID_ROLES: readonly ResidentRole[] = ['Wache', 'Späher', 'Handwerk', 'Heilung', 'Bau'];
const itemIds = new Set(ITEMS.map((item) => item.id));

// Flags, die die Tempest-Wachstumsstufe (systems/tempestGrowth) auf 'camp' heben.
const CAMP_FLAGS = { 'story.tempest.named': true } as const;

function residentIdsForRole(role: ResidentRole): string[] {
  return RESIDENTS.filter((resident) => resident.role === role).map((resident) => resident.id);
}

describe('Einrichtungs-Daten', () => {
  it('haben eindeutige IDs, gültige Rollen und existierende Ausgabe-Items', () => {
    const ids = new Set<string>();
    for (const facility of FACILITIES) {
      expect(ids.has(facility.id), `doppelte Einrichtungs-ID '${facility.id}'`).toBe(false);
      ids.add(facility.id);
      expect(facility.staffRoles.length, `Einrichtung '${facility.id}' braucht Rollen`).toBeGreaterThan(0);
      for (const role of facility.staffRoles) {
        expect(VALID_ROLES).toContain(role);
      }
      expect(facility.output.perStaffPerLevel).toBeGreaterThan(0);
      expect(facility.growth.map((detail) => detail.level)).toEqual([1, 2, 3]);
      expect(new Set(facility.growth.map((detail) => detail.title)).size).toBe(3);
      expect(facility.growth.every((detail) => detail.description.length > 20)).toBe(true);
      if (facility.output.kind === 'item') {
        expect(itemIds.has(facility.output.itemId), `Ausgabe-Item '${facility.output.itemId}' unbekannt`).toBe(true);
      }
    }
  });

  it('decken jede Bewohner-Rolle durch genau eine Einrichtung ab', () => {
    const covered = new Map<ResidentRole, number>();
    for (const facility of FACILITIES) {
      for (const role of facility.staffRoles) {
        covered.set(role, (covered.get(role) ?? 0) + 1);
      }
    }
    for (const role of VALID_ROLES) {
      expect(covered.get(role), `Rolle '${role}' nicht (eindeutig) zugewiesen`).toBe(1);
    }
  });
});

describe('facilityLevelForStage', () => {
  it('skaliert monoton mit dem Nationsausbau, Wildnis produziert nicht', () => {
    expect(facilityLevelForStage('wilderness')).toBe(0);
    expect(facilityLevelForStage('camp')).toBe(1);
    expect(facilityLevelForStage('village')).toBe(2);
    expect(facilityLevelForStage('city')).toBe(3);
  });
});

describe('buildFacilityOverview', () => {
  it('sperrt alle Einrichtungen in der Wildnis (Stufe 0, keine Ausbeute)', () => {
    const overview = buildFacilityOverview(RESIDENTS.map((r) => r.id), {});
    expect(overview.stage).toBe('wilderness');
    expect(overview.level).toBe(0);
    expect(overview.totalPerCycle).toBe(0);
    expect(overview.facilities.every((view) => !view.unlocked)).toBe(true);
    expect(overview.facilities.every((view) => view.amountPerCycle === 0)).toBe(true);
  });

  it('weist Bewohner nach Rolle zu und beziffert die Ausbeute pro Zyklus', () => {
    const forge = FACILITIES.find((f) => f.id === 'forge')!;
    const handwerker = residentIdsForRole('Handwerk');
    const overview = buildFacilityOverview(handwerker, CAMP_FLAGS, handwerker.slice(0, 1));
    const forgeView = overview.facilities.find((view) => view.facility.id === forge.id)!;
    expect(forgeView.unlocked).toBe(true);
    expect(forgeView.staff.length).toBe(handwerker.length);
    expect(forgeView.staff[0]).toContain('★');
    expect(forgeView.amountPerCycle).toBe((handwerker.length + 1) * 1 * forge.output.perStaffPerLevel);

    const awakened = buildFacilityOverview(handwerker, CAMP_FLAGS, handwerker.slice(0, 1), handwerker.slice(0, 1));
    const awakenedForge = awakened.facilities.find((view) => view.facility.id === forge.id)!;
    expect(awakenedForge.staff[0]).toContain('✦');
    expect(awakenedForge.amountPerCycle).toBe((handwerker.length + 2) * 1 * forge.output.perStaffPerLevel);
  });

  it('zeigt für jede Wachstumsstufe eine eigene Facility-Ausbaustufe', () => {
    const forge = FACILITIES.find((facility) => facility.id === 'forge')!;
    const handwerker = residentIdsForRole('Handwerk');
    const camp = buildFacilityOverview(handwerker, CAMP_FLAGS).facilities.find((view) => view.facility.id === 'forge')!;
    const village = buildFacilityOverview(handwerker, { 'story.council.ready': true })
      .facilities.find((view) => view.facility.id === 'forge')!;
    const city = buildFacilityOverview(handwerker, {
      'story.kijin.named': true,
      'faction.dwargon.allied': true
    }).facilities.find((view) => view.facility.id === 'forge')!;

    expect(camp.growth).toEqual(forge.growth[0]);
    expect(village.growth).toEqual(forge.growth[1]);
    expect(city.growth).toEqual(forge.growth[2]);
  });

  // Phase 179 — Diplomatie speist die Produktion: `trusted`-Handelsrouten heben den Ausstoß.
  it('Echsenmenschen-Bündnis (trusted) liefert der Küche einen Heilkräuter-Nachschub', () => {
    const kitchen = FACILITIES.find((f) => f.id === 'kitchen')!;
    const heiler = residentIdsForRole('Heilung');
    const base = buildFacilityOverview(heiler, CAMP_FLAGS);
    const boosted = buildFacilityOverview(heiler, { ...CAMP_FLAGS, 'reputation.lizardmen.trusted': true });
    const baseKitchen = base.facilities.find((v) => v.facility.id === kitchen.id)!;
    const boostKitchen = boosted.facilities.find((v) => v.facility.id === kitchen.id)!;
    expect(baseKitchen.amountPerCycle).toBeGreaterThan(0);
    // Bonus = level(1) * perStaffPerLevel, genau eine Route.
    expect(boostKitchen.amountPerCycle).toBe(baseKitchen.amountPerCycle + 1 * kitchen.output.perStaffPerLevel);
  });

  it('Dwargon + Orks (trusted) kumulieren zwei Handelsrouten an der Schmiede', () => {
    const forge = FACILITIES.find((f) => f.id === 'forge')!;
    const handwerker = residentIdsForRole('Handwerk');
    const base = buildFacilityOverview(handwerker, CAMP_FLAGS);
    const both = buildFacilityOverview(handwerker, {
      ...CAMP_FLAGS,
      'reputation.dwargon.trusted': true,
      'reputation.orcs.trusted': true
    });
    const baseForge = base.facilities.find((v) => v.facility.id === forge.id)!;
    const bothForge = both.facilities.find((v) => v.facility.id === forge.id)!;
    expect(bothForge.amountPerCycle).toBe(baseForge.amountPerCycle + 2 * 1 * forge.output.perStaffPerLevel);
  });

  it('kein Nachschub-Bonus ohne Besetzung (baseAmount 0) und an falscher Einrichtung', () => {
    // Küche ohne Heiler produziert nichts — der Echsen-Bonus greift nicht.
    const empty = buildFacilityOverview([], { ...CAMP_FLAGS, 'reputation.lizardmen.trusted': true });
    expect(empty.facilities.find((v) => v.facility.id === 'kitchen')!.amountPerCycle).toBe(0);
    // Der Küchen-Bonus (Echsen) rührt die Schmiede nicht an.
    const handwerker = residentIdsForRole('Handwerk');
    const base = buildFacilityOverview(handwerker, CAMP_FLAGS);
    const lizardOnly = buildFacilityOverview(handwerker, { ...CAMP_FLAGS, 'reputation.lizardmen.trusted': true });
    const baseForge = base.facilities.find((v) => v.facility.id === 'forge')!.amountPerCycle;
    const lizardForge = lizardOnly.facilities.find((v) => v.facility.id === 'forge')!.amountPerCycle;
    expect(lizardForge).toBe(baseForge);
  });
});

describe('facilityOutputAmount', () => {
  const watch = FACILITIES.find((f) => f.id === 'watch')!;

  it('ist null ohne Ausbau oder ohne besetzende Bewohner', () => {
    expect(facilityOutputAmount(watch, residentIdsForRole('Wache'), 0)).toBe(0);
    expect(facilityOutputAmount(watch, [], 1)).toBe(0);
  });

  it('steigt monoton mit Stufe und Bewohnerzahl', () => {
    const one = residentIdsForRole('Wache').slice(0, 1);
    const all = [...residentIdsForRole('Wache'), ...residentIdsForRole('Späher')];
    expect(facilityOutputAmount(watch, all, 2)).toBeGreaterThan(facilityOutputAmount(watch, all, 1));
    expect(facilityOutputAmount(watch, all, 1)).toBeGreaterThan(facilityOutputAmount(watch, one, 1));
    expect(facilityOutputAmount(watch, one, 1, one)).toBe(facilityOutputAmount(watch, one, 1) * 2);
    expect(facilityOutputAmount(watch, one, 1, one, one)).toBe(facilityOutputAmount(watch, one, 1) * 3);
  });
});

describe('runProductionCycle', () => {
  it('produziert deterministisch dieselbe Ausbeute für dieselbe Eingabe', () => {
    const input = {
      residentIds: RESIDENTS.map((r) => r.id),
      flags: CAMP_FLAGS,
      inventory: [],
      gold: 0
    };
    const a = runProductionCycle(input);
    const b = runProductionCycle(input);
    expect(a.ok).toBe(true);
    expect(a.gold).toBe(b.gold);
    expect(a.inventory).toEqual(b.inventory);
    expect(a.yields).toEqual(b.yields);
  });

  it('zählt Offiziere bei der Produktion doppelt', () => {
    const handwerker = residentIdsForRole('Handwerk').slice(0, 1);
    const plain = runProductionCycle({ residentIds: handwerker, flags: CAMP_FLAGS, inventory: [], gold: 0 });
    const promoted = runProductionCycle({
      residentIds: handwerker,
      promotedResidentIds: handwerker,
      flags: CAMP_FLAGS,
      inventory: [],
      gold: 0
    });
    expect(promoted.yields[0]?.amount).toBe((plain.yields[0]?.amount ?? 0) * 2);
    const awakened = runProductionCycle({
      residentIds: handwerker,
      promotedResidentIds: handwerker,
      awakenedResidentIds: handwerker,
      flags: CAMP_FLAGS,
      inventory: [],
      gold: 0
    });
    expect(awakened.yields[0]?.amount).toBe((plain.yields[0]?.amount ?? 0) * 3);
  });

  it('fügt Material und Gold der besetzten Einrichtungen hinzu, ohne die Eingabe zu verändern', () => {
    const inputInventory = [{ itemId: 'magic-ore', quantity: 2 }] as const;
    const result = runProductionCycle({
      residentIds: RESIDENTS.map((r) => r.id),
      flags: CAMP_FLAGS,
      inventory: inputInventory,
      gold: 10
    });
    expect(result.ok).toBe(true);
    // Schmiede (1 Handwerker × Stufe 1) legt 1 magisches Erz auf die vorhandenen 2.
    const ore = result.inventory.find((stack) => stack.itemId === 'magic-ore');
    expect(ore?.quantity).toBe(3);
    // Wache (Wache + Späher = 3 Bewohner × Stufe 1 × 8) trägt 24 Gold bei.
    const watch = FACILITIES.find((f) => f.id === 'watch')!;
    const watchStaff = residentIdsForRole('Wache').length + residentIdsForRole('Späher').length;
    if (watch.output.kind === 'gold') {
      expect(result.gold).toBe(10 + watchStaff * watch.output.perStaffPerLevel);
    }
    // Eingabe bleibt unangetastet (reine Funktion).
    expect(inputInventory).toEqual([{ itemId: 'magic-ore', quantity: 2 }]);
  });

  it('höhere Wachstumsstufe erhöht die Gesamtausbeute', () => {
    const residents = RESIDENTS.map((r) => r.id);
    const camp = runProductionCycle({ residentIds: residents, flags: CAMP_FLAGS, inventory: [], gold: 0 });
    const city = runProductionCycle({
      residentIds: residents,
      flags: { 'story.kijin.named': true, 'faction.dwargon.allied': true },
      inventory: [],
      gold: 0
    });
    const total = (r: { gold: number; yields: readonly { amount: number }[] }) =>
      r.gold + r.yields.reduce((sum, y) => sum + y.amount, 0);
    expect(total(city)).toBeGreaterThan(total(camp));
  });

  it('meldet Fehlschlag in der Wildnis (keine Nation)', () => {
    const result = runProductionCycle({
      residentIds: RESIDENTS.map((r) => r.id),
      flags: {},
      inventory: [],
      gold: 5
    });
    expect(result.ok).toBe(false);
    expect(result.gold).toBe(5);
    expect(result.yields).toEqual([]);
  });

  it('meldet Fehlschlag, wenn keine Bewohner die Einrichtungen besetzen', () => {
    const result = runProductionCycle({ residentIds: [], flags: CAMP_FLAGS, inventory: [], gold: 5 });
    expect(result.ok).toBe(false);
    expect(result.gold).toBe(5);
  });
});

describe('Save-Migration: productionCycles', () => {
  it('startet für neue Spielstände bei 0', () => {
    expect(createNewSave().progression.productionCycles).toBe(0);
  });

  it('erhält den Zähler über einen Export/Import-Roundtrip', () => {
    const save = createNewSave();
    const advanced = {
      ...save,
      progression: { ...save.progression, productionCycles: 7 }
    };
    const round = importSave(exportSave(advanced));
    expect(round.progression.productionCycles).toBe(7);
  });

  it('migriert alte Stände ohne das Feld auf 0', () => {
    const migrated = migrate({ schemaVersion: 1, seed: 1 }, '2026-07-07T10:00:00.000Z');
    expect(migrated.progression.productionCycles).toBe(0);
  });
});

describe('Phase 93c — Produktion an der Tempest-Rast (restore-party)', () => {
  function saveWithResidents(flags: Record<string, boolean>) {
    const base = createNewSave({ seed: 5, now: '2026-07-08T00:00:00.000Z' });
    return {
      ...base,
      flags: { ...base.flags, ...flags },
      progression: { ...base.progression, residentIds: RESIDENTS.map((r) => r.id) }
    };
  }

  it('rechnet bei restore-party automatisch einen Produktions-Zyklus ab', () => {
    const save = saveWithResidents(CAMP_FLAGS);
    const rested = applyEffects(createWorldState(save), [{ type: 'restore-party' }]);

    expect(rested.productionCycles).toBe(1);
    const oreBefore = save.inventory.stacks.find((s) => s.itemId === 'magic-ore')?.quantity ?? 0;
    const oreAfter = rested.inventory.find((s) => s.itemId === 'magic-ore')?.quantity ?? 0;
    expect(oreAfter).toBeGreaterThan(oreBefore);

    const next = applyWorldState(save, rested);
    expect(next.progression.productionCycles).toBe(1);
    expect(next.inventory.stacks.find((s) => s.itemId === 'magic-ore')?.quantity ?? 0).toBe(oreAfter);
  });

  it('heilt nur, solange Tempest Wildnis ist (keine Produktion)', () => {
    const save = saveWithResidents({});
    const rested = applyEffects(createWorldState(save), [{ type: 'restore-party' }]);
    expect(rested.productionCycles).toBe(0);
    expect(applyWorldState(save, rested).progression.productionCycles).toBe(0);
  });

  it('heilt die Party und produziert im selben Rast-Schritt', () => {
    const base = saveWithResidents(CAMP_FLAGS);
    const wounded = {
      ...base,
      party: {
        ...base.party,
        active: base.party.active.map((member) => ({ ...member, currentHp: 1 }))
      }
    };
    const rested = applyEffects(createWorldState(wounded), [{ type: 'restore-party' }]);
    expect(rested.productionCycles).toBe(1);
    expect(rested.party?.every((member) => member.currentHp > 1)).toBe(true);
  });

  it('setzt bei besetzter Kueche einen Buff fuer den naechsten Kampf', () => {
    const save = saveWithResidents(CAMP_FLAGS);
    const rested = applyEffects(createWorldState(save), [{ type: 'restore-party' }]);
    expect(rested.flags[KITCHEN_REST_BUFF_FLAG]).toBe(true);
  });
});
