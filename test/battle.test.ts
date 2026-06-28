import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import { createInitialInventory, getItemCount } from '../src/systems/inventory';
import {
  act,
  createDefaultBattleParty,
  createHeroBattleUnit,
  currentActor,
  enemyTurn,
  isPlayerTurn,
  queueReaction,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';

// Seit dem story-gesteuerten Party-Aufbau startet ein Spiel nur mit Rimuru. Für Tests, die
// eine Mehr-Personen-Party brauchen, Gobta explizit ergänzen.
const GOBTA = HEROES.find((hero) => hero.id === 'gobta')!;

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

function depthHero(
  sourceId: string,
  name: string,
  overrides: Partial<BattleUnitInput> = {}
): BattleUnitInput {
  return {
    sourceId,
    name,
    side: 'party',
    level: 6,
    stats: {
      maxHp: 150,
      maxMp: 60,
      attack: 26,
      defense: 18,
      magic: 24,
      spirit: 18,
      agility: 22
    },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: ['slime-strike', 'water-blade', 'storm-gust', 'spirit-bind'],
    ...overrides
  };
}

function phaseEnemy(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'phase-beast',
    name: 'Phasenbestie',
    side: 'enemy',
    level: 6,
    stats: {
      maxHp: 230,
      maxMp: 50,
      attack: 22,
      defense: 16,
      magic: 20,
      spirit: 14,
      agility: 18
    },
    element: 'fire',
    weaknesses: ['water', 'shadow'],
    resistances: ['fire'],
    skillIds: ['slime-strike', 'venom-spit', 'spirit-bind'],
    experienceReward: 80,
    goldReward: 50,
    drops: [],
    ...overrides
  };
}

function autoPlayDepth(state: BattleState): { status: string; steps: number } {
  let guard = 0;

  while (state.status === 'active' && guard++ < 5000) {
    if (isPlayerTurn(state)) {
      const actor = currentActor(state)!;
      const enemy = renderView(state).enemies.find((candidate) => !candidate.dead);
      if (!enemy) break;

      const partner = renderView(state).party.find((candidate) => !candidate.dead && candidate.id !== actor.id);
      if (partner && renderView(state).teamMeter >= 100) {
        act(state, { type: 'team-attack', partnerId: partner.id, targetId: enemy.id });
        continue;
      }

      const skillId = actor.skillIds.find((id) => id === 'water-blade' && actor.mp >= 4)
        ?? actor.skillIds.find((id) => id === 'storm-gust' && actor.mp >= 7)
        ?? actor.skillIds.find((id) => id === 'spirit-bind' && actor.mp >= 5);
      if (skillId) {
        act(state, { type: 'skill', skillId, targetId: enemy.id });
      } else {
        act(state, { type: 'attack', targetId: enemy.id });
      }
    } else {
      const target = renderView(state).party.find((member) => !member.dead);
      if (target) queueReaction(state, target.id, { kind: 'timing-block', timing: 'success' });
      enemyTurn(state);
    }
  }

  return { status: state.status, steps: guard };
}

describe('battle engine', () => {
  it('startet deterministisch mit Party, Gegnern, Inventar und aktiver Einheit', () => {
    const state = startBattle({
      party: [...createDefaultBattleParty(), createHeroBattleUnit(GOBTA)],
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

  it('zeigt das Siegel-Echo im Kampf als „Namenloses Echo" (Canon-Hauptpfad)', () => {
    const state = startBattle({ party: createDefaultBattleParty(), enemyIds: ['mordrahn-echo'], seed: 5 });
    const enemy = renderView(state).enemies.find((unit) => !unit.dead);
    expect(enemy?.name).toBe('Namenloses Echo');
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

  it('wendet Schadensmultiplikatoren getrennt für Party und Gegner an', () => {
    const party: BattleUnitInput[] = [{
      sourceId: 'damage-probe-hero',
      name: 'Prüfer',
      side: 'party',
      level: 4,
      stats: {
        maxHp: 220,
        maxMp: 0,
        attack: 28,
        defense: 14,
        magic: 8,
        spirit: 12,
        agility: 20
      },
      element: 'neutral',
      weaknesses: [],
      resistances: [],
      skillIds: []
    }];
    const enemies: BattleUnitInput[] = [{
      sourceId: 'damage-probe-enemy',
      name: 'Prüfbestie',
      side: 'enemy',
      level: 4,
      stats: {
        maxHp: 420,
        maxMp: 0,
        attack: 26,
        defense: 8,
        magic: 8,
        spirit: 8,
        agility: 1
      },
      element: 'neutral',
      weaknesses: [],
      resistances: [],
      skillIds: []
    }];

    const partyDamage = (multiplier: number): number => {
      const state = startBattle({
        party,
        enemies,
        damageMultipliers: { party: multiplier, enemy: 1 },
        seed: 515
      });
      const actor = state.combatants.find((combatant) => combatant.side === 'party')!;
      const target = state.combatants.find((combatant) => combatant.side === 'enemy')!;
      state.activeId = actor.id;
      const before = target.hp;
      act(state, { type: 'attack', targetId: target.id });
      return before - target.hp;
    };

    const enemyDamage = (multiplier: number): number => {
      const state = startBattle({
        party,
        enemies,
        damageMultipliers: { party: 1, enemy: multiplier },
        seed: 515
      });
      const actor = state.combatants.find((combatant) => combatant.side === 'enemy')!;
      const target = state.combatants.find((combatant) => combatant.side === 'party')!;
      state.activeId = actor.id;
      const before = target.hp;
      enemyTurn(state);
      return before - target.hp;
    };

    expect(partyDamage(1.25)).toBeGreaterThan(partyDamage(1));
    expect(partyDamage(0.75)).toBeLessThan(partyDamage(1));
    expect(enemyDamage(1.4)).toBeGreaterThan(enemyDamage(1));
    expect(enemyDamage(0.7)).toBeLessThan(enemyDamage(1));
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

  it('Reaktionsfenster reduzieren Schaden und erlauben Konter ohne eigenen Zugverbrauch', () => {
    const blocked = startBattle({ party: fastTank(), enemyIds: ['direwolf-pup'], seed: 3 });
    const blockedHero = blocked.combatants.find((combatant) => combatant.side === 'party')!;
    const blockedEnemy = blocked.combatants.find((combatant) => combatant.side === 'enemy')!;
    blocked.activeId = blockedEnemy.id;
    queueReaction(blocked, blockedHero.id, { kind: 'timing-block', timing: 'perfect' });
    const blockedBefore = blockedHero.hp;
    enemyTurn(blocked);
    const blockedDamage = blockedBefore - blockedHero.hp;

    const countered = startBattle({ party: fastTank(), enemyIds: ['direwolf-pup'], seed: 3 });
    const counterHero = countered.combatants.find((combatant) => combatant.side === 'party')!;
    const counterEnemy = countered.combatants.find((combatant) => combatant.side === 'enemy')!;
    countered.activeId = counterEnemy.id;
    queueReaction(countered, counterHero.id, { kind: 'counter', timing: 'perfect' });
    const enemyBefore = counterEnemy.hp;
    enemyTurn(countered);

    expect(blockedDamage).toBeLessThan(8);
    expect(counterEnemy.hp).toBeLessThan(enemyBefore);
    expect(renderView(countered).party[0]!.reaction).toBeNull();
  });

  it('übernimmt Werte und Skills der Einheit direkt (keine Klassen-Multiplikatoren mehr)', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru')],
      enemies: [phaseEnemy()],
      seed: 12
    });
    const hero = state.combatants.find((combatant) => combatant.side === 'party')!;

    expect(hero.maxHp).toBe(150);
    expect(hero.skillIds).toContain('spirit-bind');
    expect(hero.skillIds).toContain('water-blade');
  });

  it('setzt Schwächen unter Break-Druck und macht gebrochene Gegner verwundbarer', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru')],
      enemies: [phaseEnemy({ stats: { ...phaseEnemy().stats, maxHp: 500 } })],
      seed: 21
    });
    const hero = state.combatants.find((combatant) => combatant.side === 'party')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    state.activeId = hero.id;

    act(state, { type: 'skill', skillId: 'water-blade', targetId: enemy.id });
    state.activeId = hero.id;
    act(state, { type: 'skill', skillId: 'water-blade', targetId: enemy.id });

    expect(enemy.statuses.map((status) => status.id)).toContain('guard-break');
    expect(enemy.breakGauge).toBe(enemy.breakGaugeMax);
    expect(renderView(state).teamMeter).toBeGreaterThan(0);
  });

  it('nutzt Team-Angriffe nur über aktive Synergiepartner und verbraucht Team-Meter', () => {
    const state = startBattle({
      party: [
        depthHero('rimuru', 'Rimuru', { synergyPartnerIds: ['gobta'] }),
        depthHero('gobta', 'Gobta', { synergyPartnerIds: ['rimuru'] })
      ],
      enemies: [phaseEnemy()],
      teamMeter: 100,
      seed: 31
    });
    const [rimuru, gobta] = state.combatants.filter((combatant) => combatant.side === 'party');
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    state.activeId = rimuru!.id;
    const beforeHp = enemy.hp;

    const result = act(state, { type: 'team-attack', partnerId: gobta!.id, targetId: enemy.id });

    expect(result.ok).toBe(true);
    expect(enemy.hp).toBeLessThan(beforeHp);
    expect(renderView(state).teamMeter).toBe(0);
    expect(enemy.breakGauge).toBeLessThan(enemy.breakGaugeMax);
  });

  it('Gegner wechseln unter 50 Prozent LP in eine zweite Phase mit lesbarem View-State', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru')],
      enemies: [phaseEnemy()],
      seed: 41
    });
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    enemy.hp = Math.floor(enemy.maxHp * 0.45);
    state.activeId = enemy.id;

    enemyTurn(state);

    expect(enemy.phaseIndex).toBe(1);
    expect(renderView(state).enemies[0]!.phaseIndex).toBe(1);
  });

  it('terminiert deterministisch über Talent-Loadouts × Gegnerphasen × Seeds', () => {
    const loadouts = [
      {
        rimuruSkillIds: ['slime-strike', 'water-blade', 'storm-gust'],
        gobtaSkillIds: ['goblin-feint', 'battle-cry']
      },
      {
        rimuruSkillIds: ['slime-strike', 'water-blade', 'spirit-bind', 'venom-spit'],
        gobtaSkillIds: ['goblin-feint', 'quick-step']
      },
      {
        rimuruSkillIds: ['slime-strike', 'predator-aura', 'spirit-bind'],
        gobtaSkillIds: ['goblin-feint', 'direwolf-rush', 'storm-gust']
      }
    ];
    const phaseHpFractions = [1, 0.45];
    const seeds = [101, 202, 303];

    for (const loadout of loadouts) {
      for (const phaseHpFraction of phaseHpFractions) {
        for (const seed of seeds) {
          const state = startBattle({
            party: [
              depthHero('rimuru', 'Rimuru', {
                skillIds: loadout.rimuruSkillIds,
                synergyPartnerIds: ['gobta']
              }),
              depthHero('gobta', 'Gobta', {
                skillIds: loadout.gobtaSkillIds,
                synergyPartnerIds: ['rimuru']
              })
            ],
            enemies: [phaseEnemy()],
            teamMeter: 100,
            seed
          });
          const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
          enemy.hp = Math.floor(enemy.maxHp * phaseHpFraction);

          const outcome = autoPlayDepth(state);

          expect(['won', 'lost', 'fled']).toContain(outcome.status);
          expect(outcome.steps).toBeLessThan(5000);
        }
      }
    }
  });
});
