import { describe, expect, it } from 'vitest';
import { ENEMIES, RESIDENTS, type EnemyDefinition } from '../src/data';
import {
  act,
  createBattlePartyFromMembers,
  renderView,
  startBattle
} from '../src/systems/battle';
import { applyBattleResultToSave } from '../src/systems/battleResult';
import {
  buildResidentRoster,
  officerPerksForResidents,
  promoteResident,
  recruitResidentsFromDevour,
  RESIDENT_PROMOTION_MAGICULE_COST,
  residentForEnemy
} from '../src/systems/residents';
import { createNewSave, exportSave, importSave, migrate } from '../src/systems/save';

const enemyById = new Map<string, EnemyDefinition>(ENEMIES.map((enemy) => [enemy.id, enemy]));

describe('Bewohner-Daten', () => {
  it('koppelt jeden Bewohner an eine echte, verschlingbare Nicht-Boss-Gegner-Art', () => {
    const ids = new Set<string>();
    for (const resident of RESIDENTS) {
      expect(ids.has(resident.id), `doppelte Bewohner-ID '${resident.id}'`).toBe(false);
      ids.add(resident.id);
      const enemy = enemyById.get(resident.originEnemyId);
      expect(enemy, `Bewohner '${resident.id}' verweist auf unbekannten Gegner`).toBeDefined();
      expect(enemy?.devourable, `Bewohner '${resident.id}' braucht verschlingbaren Gegner`).toBe(true);
      expect(enemy?.boss ?? false, `Bewohner '${resident.id}' darf nicht an einen Boss koppeln`).toBe(false);
    }
  });

  it('bildet jede Herkunfts-Gegner-Art höchstens auf einen Bewohner ab', () => {
    const origins = RESIDENTS.map((resident) => resident.originEnemyId);
    expect(new Set(origins).size).toBe(origins.length);
  });
});

describe('recruitResidentsFromDevour', () => {
  it('rekrutiert einen Bewohner, wenn seine Gegner-Art verschlungen wurde', () => {
    const target = RESIDENTS[0]!;
    const result = recruitResidentsFromDevour([], [target.originEnemyId]);
    expect(result.residentIds).toContain(target.id);
    expect(result.newlyRecruited.map((resident) => resident.id)).toEqual([target.id]);
  });

  it('ist idempotent und nimmt bereits vorhandene Bewohner nicht doppelt auf', () => {
    const target = RESIDENTS[0]!;
    const once = recruitResidentsFromDevour([], [target.originEnemyId]);
    const twice = recruitResidentsFromDevour(once.residentIds, [target.originEnemyId]);
    expect(twice.residentIds).toEqual(once.residentIds);
    expect(twice.newlyRecruited).toEqual([]);
  });

  it('ignoriert Gegner-Arten ohne Bewohner-Zuordnung', () => {
    const result = recruitResidentsFromDevour([], ['forest-slime', 'human-lancer']);
    expect(result.newlyRecruited).toEqual([]);
    expect(result.residentIds).toEqual([]);
  });

  it('hält eine stabile Reihenfolge über mehrere Rekrutierungen', () => {
    const [first, second] = RESIDENTS;
    const a = recruitResidentsFromDevour([], [second!.originEnemyId]);
    const b = recruitResidentsFromDevour(a.residentIds, [first!.originEnemyId]);
    const definitionOrder = RESIDENTS.filter((resident) => b.residentIds.includes(resident.id)).map(
      (resident) => resident.id
    );
    expect(b.residentIds).toEqual(definitionOrder);
  });
});

describe('buildResidentRoster', () => {
  it('zählt rekrutierte Bewohner und ihre Rollen', () => {
    const target = RESIDENTS[0]!;
    const roster = buildResidentRoster([target.id]);
    expect(roster.totalCount).toBe(RESIDENTS.length);
    expect(roster.recruitedCount).toBe(1);
    expect(roster.countsByRole[target.role]).toBeGreaterThanOrEqual(1);
    const entry = roster.entries.find((candidate) => candidate.resident.id === target.id)!;
    expect(entry.recruited).toBe(true);
    expect(entry.promoted).toBe(false);
    expect(entry.originEnemyName).toBe(enemyById.get(target.originEnemyId)?.name);
  });

  it('markiert unbekannte Bewohner-IDs nicht als rekrutiert', () => {
    const roster = buildResidentRoster(['nicht-existent']);
    expect(roster.recruitedCount).toBe(0);
    expect(roster.entries.every((entry) => !entry.recruited)).toBe(true);
  });
});

describe('promoteResident', () => {
  it('kostet Magicules, persistiert stabil und liefert einen Kampf-Perk', () => {
    const target = RESIDENTS[0]!;
    const result = promoteResident([target.id], [], RESIDENT_PROMOTION_MAGICULE_COST + 5, target.id);
    expect(result.ok).toBe(true);
    expect(result.promotedResidentIds).toEqual([target.id]);
    expect(result.magicules).toBe(5);
    expect(buildResidentRoster([target.id], result.promotedResidentIds).entries
      .find((entry) => entry.resident.id === target.id)?.promoted).toBe(true);
    expect(officerPerksForResidents(result.promotedResidentIds)).toEqual([
      { kind: 'max-hp', percent: 3 }
    ]);
  });

  it('lehnt unbekannte, unbenannte, bereits beförderte oder zu teure Beförderungen ab', () => {
    const target = RESIDENTS[0]!;
    expect(promoteResident([], [], 100, target.id).ok).toBe(false);
    expect(promoteResident([target.id], [target.id], 100, target.id).ok).toBe(false);
    expect(promoteResident([target.id], [], RESIDENT_PROMOTION_MAGICULE_COST - 1, target.id).ok).toBe(false);
  });
});

describe('residentForEnemy', () => {
  it('findet den Bewohner zu einer Herkunfts-Gegner-Art', () => {
    const target = RESIDENTS[0]!;
    expect(residentForEnemy(target.originEnemyId)?.id).toBe(target.id);
    expect(residentForEnemy('forest-slime')).toBeUndefined();
  });
});

describe('Bewohner-Persistenz', () => {
  it('überlebt Export/Import-Runden im Spielstand', () => {
    const target = RESIDENTS[0]!;
    const save = createNewSave({ seed: 1, now: '2026-07-06T10:00:00.000Z' });
    const withResident = {
      ...save,
      progression: { ...save.progression, residentIds: [target.id] }
    };
    const round = importSave(exportSave(withResident));
    expect(round.progression.residentIds).toEqual([target.id]);
  });

  it('migriert alte Spielstände ohne Bewohner-Feld zu leerem Roster', () => {
    const migrated = migrate({ schemaVersion: 1, seed: 1 }, '2026-07-06T10:00:00.000Z');
    expect(migrated.progression.residentIds).toEqual([]);
  });

  it('speichert und migriert beförderte Offiziere', () => {
    const target = RESIDENTS[0]!;
    const save = createNewSave({ seed: 1, now: '2026-07-07T10:00:00.000Z' });
    const round = importSave(exportSave({
      ...save,
      progression: { ...save.progression, residentIds: [target.id], promotedResidentIds: [target.id] }
    }));
    expect(round.progression.promotedResidentIds).toEqual([target.id]);
    expect(migrate({ schemaVersion: 1, seed: 1 }, '2026-07-07T10:00:00.000Z').progression.promotedResidentIds)
      .toEqual([]);
  });
});

describe('Bewohner-Rekrutierung im Kampfergebnis', () => {
  function devourEnemy(enemyId: string): ReturnType<typeof renderView> {
    const save = createNewSave({ seed: 4, now: '2026-07-06T10:00:00.000Z' });
    const battle = startBattle({
      party: createBattlePartyFromMembers(save.party.active),
      enemyIds: [enemyId],
      inventory: save.inventory.stacks,
      seed: 4
    });
    const rimuru = battle.combatants.find((combatant) => combatant.side === 'party')!;
    const foe = battle.combatants.find((combatant) => combatant.side === 'enemy')!;
    battle.activeId = rimuru.id;
    rimuru.ct = 100;
    foe.hp = Math.floor(foe.maxHp * 0.25);
    foe.analysisLevel = 1;
    foe.statuses.push({ id: 'guard-break', turns: 2 }, { id: 'poison', turns: 3 });
    expect(act(battle, { type: 'devour', targetId: foe.id }).ok).toBe(true);
    expect(battle.status).toBe('won');
    return renderView(battle);
  }

  it('nimmt eine verschlungene Gegner-Art als Bewohner in den Spielstand auf', () => {
    const resident = residentForEnemy('spore-moth')!;
    const save = createNewSave({ seed: 4, now: '2026-07-06T10:00:00.000Z' });
    const view = devourEnemy('spore-moth');
    expect(view.devouredSourceIds).toContain('spore-moth');

    const result = applyBattleResultToSave(save, view);
    expect(result.progression.residentIds).toContain(resident.id);

    // Idempotent: erneutes Anwenden desselben Sieges fügt keinen zweiten Eintrag hinzu.
    const again = applyBattleResultToSave(result, view);
    expect(again.progression.residentIds.filter((id) => id === resident.id)).toHaveLength(1);
  });

  it('rekrutiert keine Bewohner aus einem verlorenen Kampf', () => {
    const save = createNewSave({ seed: 4, now: '2026-07-06T10:00:00.000Z' });
    const view = devourEnemy('spore-moth');
    const lostView = { ...view, status: 'lost' as const };
    const result = applyBattleResultToSave(save, lostView);
    expect(result.progression.residentIds).toEqual([]);
  });
});
