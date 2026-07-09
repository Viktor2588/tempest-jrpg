import { describe, expect, it } from 'vitest';
import {
  act,
  createBattlePartyFromMembers,
  type BattleView,
  renderView,
  startBattle
} from '../src/systems/battle';
import {
  applyBattleResultToSave,
  calculateBattleMagicules,
  summarizeBattleLevelUps
} from '../src/systems/battleResult';
import { KITCHEN_REST_BUFF_FLAG } from '../src/systems/facilities';
import { createNewSave, exportSave, importSave, migrate } from '../src/systems/save';

describe('battle result: dauerhafte Skill-Aneignung', () => {
  it('persistiert einen verschlungenen Skill einmalig und schaltet den Codex frei', () => {
    const save = createNewSave({ seed: 2, now: '2026-06-30T10:00:00.000Z' });
    const battle = startBattle({
      party: createBattlePartyFromMembers(save.party.active),
      enemyIds: ['spore-moth'],
      inventory: save.inventory.stacks,
      seed: 2
    });
    const rimuru = battle.combatants.find((combatant) => combatant.side === 'party')!;
    const foe = battle.combatants.find((combatant) => combatant.side === 'enemy')!;
    battle.activeId = rimuru.id;
    rimuru.ct = 100;
    foe.hp = Math.floor(foe.maxHp * 0.25);
    foe.analysisLevel = 1;
    foe.statuses.push(
      { id: 'guard-break', turns: 2 },
      { id: 'poison', turns: 3 }
    );

    expect(act(battle, { type: 'devour', targetId: foe.id }).ok).toBe(true);
    expect(battle.status).toBe('won');

    const view = renderView(battle);
    const result = applyBattleResultToSave(save, view);
    const repeated = applyBattleResultToSave(result, view);
    const learned = repeated.party.active[0]!.learnedSkillIds;

    expect(result.progression.magicules).toBe(13);
    expect(learned.filter((skillId) => skillId === 'venom-spit')).toHaveLength(1);
    expect(repeated.flags['codex.predator-devour']).toBe(true);
  });
});

describe('battle result: Magicules', () => {
  it('wertet Verschlingen und Bosse deutlich hoeher als Trash', () => {
    const battle = {
      status: 'won',
      enemies: [{ boss: false }, { boss: true }],
      devouredSourceIds: ['spore-moth', 'spore-moth']
    } as unknown as BattleView;

    expect(calculateBattleMagicules(battle)).toBe(44);
  });

  it('migriert und speichert den Magicule-Pool', () => {
    const save = createNewSave();
    expect(save.progression.magicules).toBe(0);

    const round = importSave(exportSave({
      ...save,
      progression: { ...save.progression, magicules: 77 }
    }));
    expect(round.progression.magicules).toBe(77);
    expect(migrate({ schemaVersion: 1, seed: 1 }, '2026-07-07T10:00:00.000Z').progression.magicules)
      .toBe(0);
  });
});

describe('battle result: Facility-Buffs', () => {
  it('verbraucht den Kuechen-Rastbuff nach dem naechsten Kampf', () => {
    const save = createNewSave({
      seed: 4,
      now: '2026-07-09T09:00:00.000Z'
    });
    const flagged = { ...save, flags: { ...save.flags, [KITCHEN_REST_BUFF_FLAG]: true } };
    const battle = startBattle({
      party: createBattlePartyFromMembers(flagged.party.active),
      enemyIds: ['forest-slime'],
      inventory: flagged.inventory.stacks,
      seed: 4
    });
    battle.status = 'fled';

    expect(applyBattleResultToSave(flagged, renderView(battle)).flags[KITCHEN_REST_BUFF_FLAG])
      .toBe(false);
  });
});

describe('battle result: Stufenaufstieg-Zusammenfassung', () => {
  it('meldet aufgestiegene aktive Mitglieder mit Vorher-/Nachher-Level', () => {
    const before = createNewSave({ seed: 3, now: '2026-06-30T10:00:00.000Z' });
    const hero = before.party.active[0]!;
    const after = {
      ...before,
      party: {
        ...before.party,
        active: before.party.active.map((member, index) =>
          index === 0 ? { ...member, level: member.level + 2 } : member
        )
      }
    };

    expect(summarizeBattleLevelUps(before, after)).toEqual([
      { characterId: hero.characterId, name: hero.name, fromLevel: hero.level, toLevel: hero.level + 2 }
    ]);
  });

  it('meldet keinen Aufstieg ohne Levelwechsel', () => {
    const save = createNewSave({ seed: 3, now: '2026-06-30T10:00:00.000Z' });
    expect(summarizeBattleLevelUps(save, save)).toEqual([]);
  });
});
