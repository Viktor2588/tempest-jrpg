import { describe, expect, it } from 'vitest';
import { BOUNTIES, ENEMIES, ITEMS } from '../src/data';
import {
  buildBountyBoardView,
  bountyProgress,
  canClaimBounty,
  claimBounty,
  getBounty,
  isBountyUnlocked,
  tallyDefeatedEnemies,
  type BountyContext
} from '../src/systems/bounties';
import {
  act,
  createBattlePartyFromMembers,
  renderView,
  startBattle
} from '../src/systems/battle';
import { applyBattleResultToSave } from '../src/systems/battleResult';
import { getItemCount } from '../src/systems/inventory';
import { createProgressionState } from '../src/systems/progression';
import { createNewSave, exportSave, importSave, migrate } from '../src/systems/save';

const itemIds = new Set(ITEMS.map((item) => item.id));
const enemyIds = new Set(ENEMIES.map((enemy) => enemy.id));
const GUILD_FLAG = { 'story.blumund.guild-tested': true } as const;

function context(overrides: Partial<BountyContext> = {}): BountyContext {
  return {
    defeatedEnemyCounts: {},
    claimedBountyCounts: {},
    inventory: [],
    gold: 0,
    flags: GUILD_FLAG,
    ...overrides
  };
}

describe('bounty data', () => {
  it('verweist nur auf existierende Gegner + Items und gatet über ein Flag', () => {
    expect(BOUNTIES.length).toBeGreaterThan(0);
    for (const bounty of BOUNTIES) {
      expect(enemyIds.has(bounty.targetEnemyId), `${bounty.id} target`).toBe(true);
      expect(bounty.requiredCount).toBeGreaterThan(0);
      expect(bounty.requiresFlag).toBeTruthy();
      const hasReward = bounty.reward.gold > 0 || bounty.reward.items.length > 0;
      expect(hasReward, `${bounty.id} reward`).toBe(true);
      for (const reward of bounty.reward.items) {
        expect(itemIds.has(reward.itemId), `${bounty.id} reward ${reward.itemId}`).toBe(true);
        expect(reward.quantity).toBeGreaterThan(0);
      }
    }
  });

  it('hat eindeutige IDs', () => {
    const ids = BOUNTIES.map((bounty) => bounty.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('bountyProgress + canClaimBounty', () => {
  it('zählt Erlegungen seit dem letzten Einlösen und wird bei Erreichen einlösbar', () => {
    const bounty = getBounty('bounty-forest-slime')!;
    expect(bountyProgress(bounty, context({ defeatedEnemyCounts: { 'forest-slime': 2 } }))).toBe(2);
    expect(canClaimBounty(bounty, context({ defeatedEnemyCounts: { 'forest-slime': 2 } })).ok).toBe(false);
    expect(canClaimBounty(bounty, context({ defeatedEnemyCounts: { 'forest-slime': 3 } })).ok).toBe(true);
  });

  it('bleibt gesperrt ohne das Gilden-Flag', () => {
    const bounty = getBounty('bounty-forest-slime')!;
    const check = canClaimBounty(
      bounty,
      context({ defeatedEnemyCounts: { 'forest-slime': 9 }, flags: {} })
    );
    expect(check.ok).toBe(false);
  });
});

describe('claimBounty', () => {
  it('zahlt Gold + Material aus und hebt die Schwelle für den nächsten Einlöse-Zyklus', () => {
    const bounty = getBounty('bounty-spore-moth')!; // 3 Motten -> magic-ore x2 + 30 Gold
    const before = context({ defeatedEnemyCounts: { 'spore-moth': 3 }, gold: 10 });

    const result = claimBounty(bounty, before);
    expect(result.ok).toBe(true);
    expect(result.gold).toBe(40);
    expect(getItemCount(result.inventory, 'magic-ore')).toBe(2);
    expect(result.claimedBountyCounts['bounty-spore-moth']).toBe(1);

    // Mit demselben Erlegungs-Stand ist der wiederholbare Auftrag erneut gesperrt.
    const after = context({
      defeatedEnemyCounts: { 'spore-moth': 3 },
      claimedBountyCounts: result.claimedBountyCounts
    });
    expect(bountyProgress(bounty, after)).toBe(0);
    expect(canClaimBounty(bounty, after).ok).toBe(false);

    // Nach drei weiteren Erlegungen wieder einlösbar.
    const refilled = context({
      defeatedEnemyCounts: { 'spore-moth': 6 },
      claimedBountyCounts: result.claimedBountyCounts
    });
    expect(canClaimBounty(bounty, refilled).ok).toBe(true);
  });

  it('verweigert das Einlösen ohne genügend Erlegungen, ohne etwas zu verändern', () => {
    const bounty = getBounty('bounty-spore-moth')!;
    const before = context({ defeatedEnemyCounts: { 'spore-moth': 1 }, gold: 10 });
    const result = claimBounty(bounty, before);
    expect(result.ok).toBe(false);
    expect(result.gold).toBe(10);
    expect(getItemCount(result.inventory, 'magic-ore')).toBe(0);
    expect(result.claimedBountyCounts).toEqual({});
  });

  it('blendet einmalige Kopfgelder nach dem Einlösen aus', () => {
    const bounty = getBounty('bounty-elder-direwolf')!;
    expect(bounty.repeatable).toBe(false);
    const flags = { 'story.act2.completed': true };
    const before = context({ defeatedEnemyCounts: { 'elder-direwolf': 1 }, flags });

    const result = claimBounty(bounty, before);
    expect(result.ok).toBe(true);
    expect(isBountyUnlocked(bounty, flags, result.claimedBountyCounts)).toBe(false);

    const board = buildBountyBoardView(context({
      defeatedEnemyCounts: { 'elder-direwolf': 3 },
      claimedBountyCounts: result.claimedBountyCounts,
      flags
    }));
    expect(board.some((view) => view.bounty.id === 'bounty-elder-direwolf')).toBe(false);
  });
});

describe('buildBountyBoardView', () => {
  it('zeigt nur freigeschaltete Aufträge mit gedeckeltem Fortschritt', () => {
    const board = buildBountyBoardView(context({ defeatedEnemyCounts: { 'forest-slime': 5 } }));
    const slime = board.find((view) => view.bounty.id === 'bounty-forest-slime')!;
    expect(slime.progress).toBe(slime.required); // auf required gedeckelt (5 -> 3)
    expect(slime.claimable).toBe(true);
    // Der spätere Grenz-Auftrag ist ohne sein Flag nicht sichtbar.
    expect(board.some((view) => view.bounty.id === 'bounty-bog-terror')).toBe(false);
  });

  it('ist ohne Gilden-Flag leer', () => {
    expect(buildBountyBoardView(context({ flags: {} }))).toHaveLength(0);
  });
});

describe('tallyDefeatedEnemies', () => {
  it('addiert Erlegungen und ignoriert leere IDs', () => {
    const first = tallyDefeatedEnemies({}, ['forest-slime', 'forest-slime', 'spore-moth']);
    expect(first).toEqual({ 'forest-slime': 2, 'spore-moth': 1 });
    const second = tallyDefeatedEnemies(first, ['forest-slime', '']);
    expect(second['forest-slime']).toBe(3);
    expect(second['spore-moth']).toBe(1);
  });

  it('gibt bei leerer Liste dieselbe Referenz zurück', () => {
    const counts = { 'forest-slime': 1 };
    expect(tallyDefeatedEnemies(counts, [])).toBe(counts);
  });
});

describe('battle result: Kopfgeld-Zähler', () => {
  it('bucht erlegte Gegner-Arten eines Siegs in die Zähler ein', () => {
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
    foe.statuses.push({ id: 'guard-break', turns: 2 }, { id: 'poison', turns: 3 });

    expect(act(battle, { type: 'devour', targetId: foe.id }).ok).toBe(true);
    expect(battle.status).toBe('won');

    const result = applyBattleResultToSave(save, renderView(battle));
    expect(result.progression.defeatedEnemyCountsByEnemyId['spore-moth']).toBe(1);
  });
});

describe('Save-Persistenz der Kopfgeld-Zähler', () => {
  it('roundtript die Zähler über export/import', () => {
    const save = createNewSave();
    const round = importSave(exportSave({
      ...save,
      progression: createProgressionState({
        defeatedEnemyCountsByEnemyId: { 'forest-slime': 4 },
        claimedBountyCountsByBountyId: { 'bounty-forest-slime': 1 }
      })
    }));
    expect(round.progression.defeatedEnemyCountsByEnemyId['forest-slime']).toBe(4);
    expect(round.progression.claimedBountyCountsByBountyId['bounty-forest-slime']).toBe(1);
  });

  it('migriert Altstände ohne Kopfgeld-Zähler zu leeren Records', () => {
    const migrated = migrate({ schemaVersion: 1, seed: 1 }, '2026-07-08T10:00:00.000Z');
    expect(migrated.progression.defeatedEnemyCountsByEnemyId).toEqual({});
    expect(migrated.progression.claimedBountyCountsByBountyId).toEqual({});
  });
});
