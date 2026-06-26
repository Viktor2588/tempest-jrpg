import { describe, expect, it } from 'vitest';
import { createInitialInventory, getItemCount } from '../src/systems/inventory';
import {
  act,
  createDefaultBattleParty,
  currentActor,
  enemyTurn,
  isPlayerTurn,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';

function autoPlay(state: BattleState): { status: string; steps: number } {
  let guard = 0;

  while (state.status === 'active' && guard++ < 5000) {
    if (isPlayerTurn(state)) {
      const actor = currentActor(state)!;
      const enemy = renderView(state).enemies.find((candidate) => !candidate.dead);
      if (!enemy) break;

      const affordableSkill = actor.skillIds
        .find((skillId) => skillId === 'storm-gust' && actor.mp >= 7)
        ?? actor.skillIds.find((skillId) => skillId === 'water-blade' && actor.mp >= 4);

      if (affordableSkill) {
        act(state, { type: 'skill', skillId: affordableSkill, targetId: enemy.id });
      } else {
        act(state, { type: 'attack', targetId: enemy.id });
      }
    } else {
      enemyTurn(state);
    }
  }

  return { status: state.status, steps: guard };
}

function weakParty(): BattleUnitInput[] {
  return [
    {
      sourceId: 'test-weakling',
      name: 'Testling',
      side: 'party',
      level: 1,
      stats: {
        maxHp: 18,
        maxMp: 0,
        attack: 3,
        defense: 2,
        magic: 1,
        spirit: 2,
        agility: 4
      },
      element: 'neutral',
      weaknesses: ['shadow'],
      resistances: [],
      skillIds: []
    }
  ];
}

function fastTank(): BattleUnitInput[] {
  const [rimuru] = createDefaultBattleParty();
  return [
    {
      ...rimuru!,
      stats: {
        ...rimuru!.stats,
        maxHp: 160,
        defense: 10,
        spirit: 10,
        agility: 99
      }
    }
  ];
}

function lootEnemy(): BattleUnitInput[] {
  return [
    {
      sourceId: 'loot-slime',
      name: 'Beuteschleim',
      side: 'enemy',
      level: 1,
      stats: {
        maxHp: 20,
        maxMp: 0,
        attack: 1,
        defense: 1,
        magic: 1,
        spirit: 1,
        agility: 1
      },
      element: 'water',
      weaknesses: ['wind'],
      resistances: [],
      skillIds: [],
      experienceReward: 10,
      goldReward: 5,
      drops: [{ itemId: 'healing-herb', chance: 1 }]
    }
  ];
}

describe('battle engine', () => {
  it('startet deterministisch mit Party, Gegnern, Inventar und aktiver Einheit', () => {
    const state = startBattle({
      party: createDefaultBattleParty(),
      enemyIds: ['forest-slime', 'direwolf-pup'],
      inventory: createInitialInventory(),
      seed: 123
    });
    const view = renderView(state);

    expect(view.status).toBe('active');
    expect(view.party).toHaveLength(2);
    expect(view.enemies).toHaveLength(2);
    expect(view.inventory.length).toBeGreaterThan(0);
    expect(currentActor(state)).toBeTruthy();
  });

  it('ist bei gleichem Seed reproduzierbar', () => {
    const a = startBattle({ party: createDefaultBattleParty(), enemyIds: ['forest-slime', 'spore-moth'], seed: 777 });
    const b = startBattle({ party: createDefaultBattleParty(), enemyIds: ['forest-slime', 'spore-moth'], seed: 777 });

    const resultA = autoPlay(a);
    const resultB = autoPlay(b);

    expect(resultA).toEqual(resultB);
    expect(renderView(a).party).toEqual(renderView(b).party);
    expect(renderView(a).rewards).toEqual(renderView(b).rewards);
    expect(renderView(a).log).toEqual(renderView(b).log);
  });

  it('vergibt EP, Gold und deterministische Drops beim Sieg', () => {
    const strongParty = createDefaultBattleParty().map((member) => ({
      ...member,
      stats: {
        ...member.stats,
        attack: member.stats.attack + 40,
        magic: member.stats.magic + 40,
        agility: member.stats.agility + 20
      }
    }));
    const state = startBattle({
      party: strongParty,
      enemies: lootEnemy(),
      seed: 1
    });

    const outcome = autoPlay(state);
    const rewards = renderView(state).rewards;

    expect(outcome.status).toBe('won');
    expect(rewards.experience).toBeGreaterThan(0);
    expect(rewards.gold).toBeGreaterThan(0);
    expect(rewards.items.reduce((sum, stack) => sum + stack.quantity, 0)).toBeGreaterThan(0);
  });

  it('terminiert sicher auch bei klarer Niederlage', () => {
    const state = startBattle({
      party: weakParty(),
      enemyIds: ['direwolf-pup', 'spore-moth', 'spore-moth'],
      seed: 9
    });

    const outcome = autoPlay(state);

    expect(outcome.status).toBe('lost');
    expect(outcome.steps).toBeLessThan(5000);
  });

  it('terminiert über mehrere Gegner/Seeds ohne Endlosschleife', () => {
    const enemySets = [
      ['forest-slime'],
      ['direwolf-pup'],
      ['spore-moth'],
      ['forest-slime', 'direwolf-pup'],
      ['forest-slime', 'spore-moth']
    ];

    for (let index = 0; index < 15; index += 1) {
      const state = startBattle({
        party: createDefaultBattleParty(),
        enemyIds: enemySets[index % enemySets.length]!,
        seed: 31 + index * 17
      });
      const outcome = autoPlay(state);
      expect(['won', 'lost', 'fled']).toContain(outcome.status);
      expect(outcome.steps).toBeLessThan(5000);
    }
  });

  it('Verteidigen reduziert eingehenden Schaden sichtbar', () => {
    const guarded = startBattle({ party: fastTank(), enemyIds: ['direwolf-pup'], seed: 3 });
    const guardedHero = guarded.combatants.find((combatant) => combatant.side === 'party')!;
    const guardedEnemy = guarded.combatants.find((combatant) => combatant.side === 'enemy')!;
    guardedHero.guarding = true;
    guarded.activeId = guardedEnemy.id;
    const guardedBefore = guardedHero.hp;
    enemyTurn(guarded);
    const guardedDamage = guardedBefore - guardedHero.hp;

    const open = startBattle({ party: fastTank(), enemyIds: ['direwolf-pup'], seed: 3 });
    const openHero = open.combatants.find((combatant) => combatant.side === 'party')!;
    const openEnemy = open.combatants.find((combatant) => combatant.side === 'enemy')!;
    open.activeId = openEnemy.id;
    const openBefore = openHero.hp;
    enemyTurn(open);
    const openDamage = openBefore - openHero.hp;

    expect(guardedDamage).toBeGreaterThanOrEqual(0);
    expect(guardedDamage).toBeLessThan(openDamage);
  });

  it('Items werden im Kampf verbraucht und heilen Verbündete', () => {
    const state = startBattle({
      party: fastTank(),
      enemyIds: ['forest-slime'],
      inventory: createInitialInventory(),
      seed: 11
    });
    const hero = currentActor(state)!;
    hero.hp = 30;

    const before = getItemCount(renderView(state).inventory, 'healing-herb');
    act(state, { type: 'item', itemId: 'healing-herb', targetId: hero.id });
    const afterView = renderView(state);

    expect(afterView.party[0]!.hp).toBeGreaterThan(30);
    expect(getItemCount(afterView.inventory, 'healing-herb')).toBe(before - 1);
  });

  it('Giftstatus kann angewendet werden', () => {
    let poisoned = false;

    for (let seed = 1; seed <= 50 && !poisoned; seed += 1) {
      const state = startBattle({
        party: createDefaultBattleParty(),
        enemyIds: ['spore-moth'],
        seed
      });
      const moth = state.combatants.find((combatant) => combatant.sourceId === 'spore-moth')!;
      const hero = state.combatants.find((combatant) => combatant.side === 'party')!;
      state.activeId = moth.id;

      const result = enemyTurn(state);
      expect(result.ok).toBe(true);
      poisoned = hero.statuses.some((status) => status.id === 'poison');
    }

    expect(poisoned).toBe(true);
  });

  it('Flucht kann den Kampf beenden', () => {
    let fled = false;
    for (let seed = 1; seed <= 30 && !fled; seed += 1) {
      const state = startBattle({ party: fastTank(), enemyIds: ['forest-slime'], seed });
      if (isPlayerTurn(state)) {
        act(state, { type: 'flee' });
        fled = state.status === 'fled';
      }
    }

    expect(fled).toBe(true);
  });
});
