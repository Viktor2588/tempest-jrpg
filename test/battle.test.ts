import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import { createInitialInventory, getItemCount } from '../src/systems/inventory';
import {
  BATTLE_BALANCE,
  act,
  battleLoadoutSkillIds,
  createDefaultBattleParty,
  createHeroBattleUnit,
  currentActor,
  enemyTurn,
  escalationBonus,
  isPlayerTurn,
  queueReaction,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';
import { createPartyMember } from '../src/systems/party';

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
    devourable: true,
    devourSkillId: 'venom-spit',
    experienceReward: 80,
    goldReward: 50,
    drops: [],
    ...overrides
  };
}

function rowProbeHero(sourceId: string, formationRow: 'front' | 'back'): BattleUnitInput {
  return {
    sourceId,
    name: sourceId,
    side: 'party',
    formationRow,
    level: 4,
    stats: {
      maxHp: 120,
      maxMp: 0,
      attack: 24,
      defense: 10,
      magic: 8,
      spirit: 10,
      agility: 12
    },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: []
  };
}

function rowProbeEnemy(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'row-probe-enemy',
    name: 'Reihenprüfer',
    side: 'enemy',
    level: 4,
    stats: {
      maxHp: 300,
      maxMp: 0,
      attack: 24,
      defense: 10,
      magic: 8,
      spirit: 10,
      agility: 30
    },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: [],
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

  it('übernimmt Front- und Hinterreihe aus der Battle-Party', () => {
    const state = startBattle({
      party: [rowProbeHero('front-probe', 'front'), rowProbeHero('back-probe', 'back')],
      enemies: [rowProbeEnemy()],
      seed: 12
    });

    expect(renderView(state).party.map((member) => member.formationRow))
      .toEqual(['front', 'back']);
  });

  it('priorisiert die Frontreihe als einfaches Gegnerziel', () => {
    const state = startBattle({
      party: [rowProbeHero('front-probe', 'front'), rowProbeHero('back-probe', 'back')],
      enemies: [rowProbeEnemy()],
      seed: 13
    });
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    state.activeId = enemy.id;

    enemyTurn(state);

    const view = renderView(state);
    expect(view.party.find((member) => member.sourceId === 'front-probe')!.hp).toBeLessThan(120);
    expect(view.party.find((member) => member.sourceId === 'back-probe')!.hp).toBe(120);
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

  it('Phase 128 — Wiederbelebungselixier weckt einen kampfunfähigen Verbündeten', () => {
    const [rimuru] = createDefaultBattleParty();
    const state = startBattle({
      party: [
        { ...rimuru!, stats: { ...rimuru!.stats, agility: 99 } },
        { ...createHeroBattleUnit(GOBTA), stats: { ...createHeroBattleUnit(GOBTA).stats, agility: 1 } }
      ],
      enemyIds: ['forest-slime'],
      inventory: [{ itemId: 'revival-elixir', quantity: 2 }],
      seed: 11
    });
    const partyUnits = state.combatants.filter((combatant) => combatant.side === 'party');
    const reviver = partyUnits[0]!;
    const fallen = partyUnits[1]!;
    fallen.dead = true;
    fallen.hp = 0;
    state.activeId = reviver.id;

    // Wiederbelebung auf einen Lebenden schlägt fehl und verbraucht nichts.
    const onLiving = act(state, { type: 'item', itemId: 'revival-elixir', targetId: reviver.id });
    expect(onLiving.ok).toBe(false);
    expect(getItemCount(renderView(state).inventory, 'revival-elixir')).toBe(2);

    state.activeId = reviver.id;
    const revived = act(state, { type: 'item', itemId: 'revival-elixir', targetId: fallen.id });
    expect(revived.ok).toBe(true);
    expect(fallen.dead).toBe(false);
    expect(fallen.hp).toBe(80);
    expect(getItemCount(renderView(state).inventory, 'revival-elixir')).toBe(1);
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

  it('erweitert das Skillset eines Bosses beim Wechsel in Phase 2', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru')],
      enemies: [phaseEnemy({
        boss: true,
        phase2SkillIds: ['calamity-roar', 'temporal-snare']
      })],
      seed: 42
    });
    const hero = state.combatants.find((combatant) => combatant.side === 'party')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    enemy.hp = Math.ceil(enemy.maxHp * 0.51);
    state.activeId = hero.id;

    act(state, { type: 'skill', skillId: 'water-blade', targetId: enemy.id });

    expect(enemy.phaseIndex).toBe(1);
    expect(enemy.skillIds).toEqual(expect.arrayContaining(['calamity-roar', 'temporal-snare']));
    expect(enemy.ct).toBeGreaterThanOrEqual(BATTLE_BALANCE.bossPhaseCtSurge);
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

// Phase 40 — Zeitleiste-Rewrite: Analyse (Großer Weiser), Zeitkontrolle (delay/hasten) und Aussetz-Status.
describe('battle: Zeitleiste (Phase 40)', () => {
  it('Analyse deckt Schwächen auf und liest den nächsten Zug (Telegraph)', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru', { skillIds: ['great-sage', 'water-blade'] })],
      enemies: [phaseEnemy()],
      seed: 7
    });
    const hero = state.combatants.find((c) => c.side === 'party')!;
    const foe = state.combatants.find((c) => c.side === 'enemy')!;

    // Vor der Analyse sind Schwächen für die Anzeige verborgen.
    expect(renderView(state).enemies[0]!.revealedWeaknesses).toHaveLength(0);

    state.activeId = hero.id;
    const result = act(state, { type: 'analyze', targetId: foe.id });

    expect(result.ok).toBe(true);
    expect(foe.analysisLevel).toBe(1);
    expect(foe.telegraphSkillId).not.toBeNull();
    expect(renderView(state).enemies[0]!.revealedWeaknesses).toContain('water');
  });

  it('analysierte Schwächen erhöhen den Break-Druck', () => {
    const breakAfterWaterBlade = (analysisLevel: number): number => {
      const state = startBattle({
        party: [depthHero('rimuru', 'Rimuru')],
        enemies: [phaseEnemy({ stats: { ...phaseEnemy().stats, maxHp: 500 } })],
        seed: 21
      });
      const hero = state.combatants.find((c) => c.side === 'party')!;
      const foe = state.combatants.find((c) => c.side === 'enemy')!;
      foe.analysisLevel = analysisLevel;
      state.activeId = hero.id;
      act(state, { type: 'skill', skillId: 'water-blade', targetId: foe.id });
      return foe.breakGauge;
    };

    expect(breakAfterWaterBlade(1)).toBeLessThan(breakAfterWaterBlade(0));
  });

  it('Zeitkontrolle: Zeitfalle wirft einen Gegner auf der CT-Leiste zurück', () => {
    // Anker-Verbündeter mit hoher CT wird nach dem Zug sofort aktiv → keine CT-Akkumulation,
    // die Gegner-CT bleibt exakt am Wert nach dem Skill ablesbar.
    const enemyCtAfter = (skillId: string): number => {
      const state = startBattle({
        party: [
          depthHero('rimuru', 'Rimuru', { skillIds: ['temporal-snare', 'water-blade'] }),
          depthHero('gobta', 'Gobta')
        ],
        enemies: [phaseEnemy()],
        seed: 4
      });
      const heroes = state.combatants.filter((c) => c.side === 'party');
      const foe = state.combatants.find((c) => c.side === 'enemy')!;
      heroes[1]!.ct = 150;
      foe.ct = 90;
      state.activeId = heroes[0]!.id;
      act(state, { type: 'skill', skillId, targetId: foe.id });
      return foe.ct;
    };

    expect(enemyCtAfter('temporal-snare')).toBeLessThan(enemyCtAfter('water-blade'));
  });

  it('Zeitkontrolle: Beschleunigung zieht einen Verbündeten auf der CT-Leiste vor', () => {
    const state = startBattle({
      party: [
        depthHero('rimuru', 'Rimuru', { skillIds: ['quicken', 'water-blade'] }),
        depthHero('gobta', 'Gobta'),
        depthHero('ranga', 'Ranga')
      ],
      enemies: [phaseEnemy()],
      seed: 6
    });
    const [caster, target, anchor] = state.combatants.filter((c) => c.side === 'party');
    anchor!.ct = 150;
    target!.ct = 20;
    caster!.ct = 50;
    state.activeId = caster!.id;

    act(state, { type: 'skill', skillId: 'quicken', targetId: target!.id });

    expect(target!.ct).toBe(80);
  });

  it('Betäubung lässt den Zug eines Gegners aus (Gegner greift nie an)', () => {
    const state = startBattle({ party: [fastTank()[0]!], enemies: [phaseEnemy()], seed: 8 });
    const hero = state.combatants.find((c) => c.side === 'party')!;
    const foe = state.combatants.find((c) => c.side === 'enemy')!;
    foe.statuses.length = 0;
    foe.statuses.push({ id: 'stun', turns: 999 });
    const hpBefore = hero.hp;

    let guard = 0;
    while (state.status === 'active' && guard++ < 40) {
      if (isPlayerTurn(state)) {
        act(state, { type: 'attack', targetId: foe.id });
      } else {
        enemyTurn(state);
      }
    }

    expect(hero.hp).toBe(hpBefore);
  });

  it('Schlaf wird durch Schaden gebrochen', () => {
    const state = startBattle({ party: [fastTank()[0]!], enemies: [phaseEnemy()], seed: 2 });
    const hero = state.combatants.find((c) => c.side === 'party')!;
    const foe = state.combatants.find((c) => c.side === 'enemy')!;
    foe.statuses.push({ id: 'sleep', turns: 5 });
    state.activeId = hero.id;

    expect(foe.statuses.some((s) => s.id === 'sleep')).toBe(true);
    act(state, { type: 'attack', targetId: foe.id });

    expect(foe.statuses.some((s) => s.id === 'sleep')).toBe(false);
  });

  it('Verstummen verhindert Fähigkeiten, der Angriff bleibt möglich', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru', { skillIds: ['water-blade'] })],
      enemies: [phaseEnemy()],
      seed: 3
    });
    const hero = state.combatants.find((c) => c.side === 'party')!;
    const foe = state.combatants.find((c) => c.side === 'enemy')!;
    hero.statuses.push({ id: 'silence', turns: 3 });
    state.activeId = hero.id;

    const blocked = act(state, { type: 'skill', skillId: 'water-blade', targetId: foe.id });
    expect(blocked.ok).toBe(false);

    const attacked = act(state, { type: 'attack', targetId: foe.id });
    expect(attacked.ok).toBe(true);
  });
});

// Phase 45 — Gegner-KI, Telegraph-Nutzung und Tempo-Politur.
describe('battle: KI und Telegraph (Phase 45)', () => {
  it('analysierte Gegner halten ihren telegraphierten CT-Kontrollskill ein', () => {
    const state = startBattle({
      party: [
        depthHero('rimuru', 'Rimuru', { skillIds: ['great-sage', 'water-blade'] }),
        depthHero('gobta', 'Gobta')
      ],
      enemies: [phaseEnemy({ skillIds: ['temporal-snare', 'slime-strike'] })],
      seed: 45
    });
    const [rimuru, gobta] = state.combatants.filter((c) => c.side === 'party');
    const foe = state.combatants.find((c) => c.side === 'enemy')!;
    gobta!.ct = 180;
    rimuru!.ct = 10;

    state.activeId = rimuru!.id;
    const analyzed = act(state, { type: 'analyze', targetId: foe.id });

    expect(analyzed.ok).toBe(true);
    expect(foe.telegraphSkillId).toBe('temporal-snare');

    state.activeId = foe.id;
    const beforeCt = gobta!.ct;
    const result = enemyTurn(state);

    expect(result.ok).toBe(true);
    expect(gobta!.ct).toBe(beforeCt - 55);
    expect(state.log.some((line) => line.includes('Zeitfalle'))).toBe(true);
  });

  it('telegraphiert Statusdruck und fokussiert danach gebrochene Ziele', () => {
    const state = startBattle({
      party: [
        depthHero('rimuru', 'Rimuru', { skillIds: ['great-sage'] }),
        depthHero('gobta', 'Gobta')
      ],
      enemies: [phaseEnemy({ skillIds: ['calamity-roar', 'orc-cleave'] })],
      seed: 46
    });
    const [rimuru, gobta] = state.combatants.filter((c) => c.side === 'party');
    const foe = state.combatants.find((c) => c.side === 'enemy')!;

    state.activeId = rimuru!.id;
    act(state, { type: 'analyze', targetId: foe.id });

    expect(foe.telegraphSkillId).toBe('calamity-roar');

    gobta!.statuses.push({ id: 'guard-break', turns: 2 });
    state.activeId = foe.id;
    foe.skillIds = [];
    const brokenBefore = gobta!.hp;
    const rimuruBefore = rimuru!.hp;
    enemyTurn(state);

    expect(gobta!.hp).toBeLessThan(brokenBefore);
    expect(rimuru!.hp).toBe(rimuruBefore);
  });
});

// Phase 41 — Verschlinger und Momentum.
describe('battle: Verschlinger und Momentum (Phase 41)', () => {
  function predatorHero(
    skillIds: readonly string[] = ['predator', 'great-sage', 'water-jet'],
    perks?: BattleUnitInput['perks']
  ): BattleUnitInput {
    return depthHero('rimuru', 'Rimuru', { skillIds, perks });
  }

  function devourSetup(seed: number): {
    state: BattleState;
    hero: NonNullable<BattleState['combatants'][number]>;
    foe: NonNullable<BattleState['combatants'][number]>;
  } {
    const state = startBattle({
      party: [predatorHero()],
      enemies: [phaseEnemy({ stats: { ...phaseEnemy().stats, maxHp: 500 } })],
      seed
    });
    const hero = state.combatants.find((c) => c.side === 'party')!;
    const foe = state.combatants.find((c) => c.side === 'enemy')!;
    state.activeId = hero.id;
    return { state, hero, foe };
  }

  it('Rimuru startet mit Predator und Großem Weisen als Unique-Verben, nicht als direkt wirkbare Skills', () => {
    const rimuru = HEROES.find((hero) => hero.id === 'rimuru')!;
    expect(rimuru.initialSkillIds).toEqual(expect.arrayContaining(['predator', 'great-sage']));

    const { state, hero, foe } = devourSetup(10);
    state.activeId = hero.id;

    expect(act(state, { type: 'skill', skillId: 'predator', targetId: hero.id }).ok).toBe(false);
    expect(act(state, { type: 'skill', skillId: 'great-sage', targetId: hero.id }).ok).toBe(false);
    expect(act(state, { type: 'analyze', targetId: foe.id }).ok).toBe(true);
  });

  it('der Weiser-Strang vertieft die Analyse in einem Zug', () => {
    const state = startBattle({
      party: [predatorHero(undefined, [{ kind: 'analysis-power', levels: 2 }])],
      enemies: [phaseEnemy()],
      seed: 10
    });
    const hero = state.combatants.find((c) => c.side === 'party')!;
    const foe = state.combatants.find((c) => c.side === 'enemy')!;
    state.activeId = hero.id;

    expect(act(state, { type: 'analyze', targetId: foe.id }).ok).toBe(true);
    expect(foe.analysisLevel).toBe(BATTLE_BALANCE.analysisMax);
  });

  it('der Verschlinger-Strang erhöht die im HUD sichtbare Aneignungschance', () => {
    const chance = (perks?: BattleUnitInput['perks']): number => {
      const state = startBattle({
        party: [predatorHero(undefined, perks)],
        enemies: [phaseEnemy()],
        seed: 10
      });
      const foe = state.combatants.find((c) => c.side === 'enemy')!;
      foe.hp = Math.floor(foe.maxHp * 0.25);
      return renderView(state).enemies[0]!.devourSuccessChance ?? 0;
    };

    expect(chance([{ kind: 'devour-chance', percent: 25 }])).toBeGreaterThan(chance());
  });

  it('gated Analyse und Verschlingen über die passenden Unique-Skills', () => {
    const state = startBattle({
      party: [predatorHero(['water-blade'])],
      enemies: [phaseEnemy()],
      seed: 11
    });
    const hero = state.combatants.find((c) => c.side === 'party')!;
    const foe = state.combatants.find((c) => c.side === 'enemy')!;
    state.activeId = hero.id;

    expect(act(state, { type: 'analyze', targetId: foe.id }).ok).toBe(false);
    foe.statuses.push({ id: 'guard-break', turns: 2 });
    expect(act(state, { type: 'devour', targetId: foe.id }).ok).toBe(false);
  });

  it('lehnt Verschlingen ab, solange Bruch, niedrige LP und Debuffs fehlen', () => {
    const { state, foe } = devourSetup(12);

    const result = act(state, { type: 'devour', targetId: foe.id });

    expect(result.ok).toBe(false);
    expect(foe.dead).toBe(false);
  });

  it('verschlingt verwundbare Gegner und eignet sich exakt deren definierten Skill an', () => {
    const run = (seed: number): readonly string[] => {
      const { state, hero, foe } = devourSetup(seed);
      foe.hp = Math.floor(foe.maxHp * 0.25);
      foe.analysisLevel = 1;
      foe.statuses.push({ id: 'guard-break', turns: 2 }, { id: 'poison', turns: 3 });
      hero.ct = 100;

      const result = act(state, { type: 'devour', targetId: foe.id });

      expect(result.ok).toBe(true);
      expect(foe.dead).toBe(true);
      expect(state.status).toBe('won');
      expect(hero.ct).toBe(35);
      expect(hero.mimicSkillIds.length).toBe(1);
      expect(hero.skillIds).toContain(hero.mimicSkillIds[0]);
      return hero.mimicSkillIds;
    };

    expect(run(2)).toEqual(['venom-spit']);
  });

  it('setzt Bosse außerhalb des Phase-2-Break-Fensters nur mit Prozentdruck unter Druck', () => {
    const { state, foe } = devourSetup(54);
    Object.assign(foe, { boss: true, phase2SkillIds: ['temporal-snare'] });
    foe.hp = Math.ceil(foe.maxHp * 0.52);
    const beforeHp = foe.hp;

    const result = act(state, { type: 'devour', targetId: foe.id });

    expect(result.ok).toBe(true);
    expect(foe.hp).toBe(beforeHp - Math.round(foe.maxHp * BATTLE_BALANCE.bossDevourDamageFraction));
    expect(foe.dead).toBe(false);
    expect(foe.phaseIndex).toBe(1);
    expect(foe.skillIds).toContain('temporal-snare');
    expect(state.log[0]).toContain('kein Finisher');
  });

  it('kann einen Boss mit Prozentdruck nicht besiegen', () => {
    const { state, foe } = devourSetup(55);
    Object.assign(foe, { boss: true });
    foe.hp = 10;

    const result = act(state, { type: 'devour', targetId: foe.id });

    expect(result.ok).toBe(true);
    expect(foe.hp).toBe(1);
    expect(foe.dead).toBe(false);
    expect(state.status).toBe('active');
  });

  it('kann einen Boss erst in Phase 2 bei aktivem Break vollständig verschlingen', () => {
    const { state, foe } = devourSetup(2);
    Object.assign(foe, { boss: true, phaseIndex: 1 });
    foe.hp = Math.floor(foe.maxHp * 0.25);
    foe.analysisLevel = 1;
    foe.statuses.push({ id: 'guard-break', turns: 2 }, { id: 'poison', turns: 3 });

    const result = act(state, { type: 'devour', targetId: foe.id });

    expect(result.ok).toBe(true);
    expect(foe.dead).toBe(true);
    expect(state.status).toBe('won');
  });

  it('lehnt Gegner ohne Devour-Freigabe trotz vollständiger Verwundbarkeit ab', () => {
    const { state, foe } = devourSetup(2);
    Object.assign(foe, { devourable: false });
    foe.hp = Math.floor(foe.maxHp * 0.25);
    foe.analysisLevel = 1;
    foe.statuses.push({ id: 'guard-break', turns: 2 }, { id: 'poison', turns: 3 });

    const result = act(state, { type: 'devour', targetId: foe.id });

    expect(result).toEqual({ ok: false, reason: 'Ziel kann nicht verschlungen werden.' });
    expect(foe.dead).toBe(false);
  });

  it('begrenzt Rimurus Kampf-Loadout auf Kernskills und die neuesten optionalen Skills', () => {
    const rimuru = createPartyMember(HEROES.find((hero) => hero.id === 'rimuru')!, {
      learnedSkillIds: [
        'predator-aura',
        'venom-spit',
        'spirit-bind',
        'quick-step',
        'direwolf-rush'
      ]
    });

    expect(battleLoadoutSkillIds(rimuru)).toEqual([
      'predator',
      'great-sage',
      'slime-strike',
      'water-jet',
      'predator-aura',
      'spirit-bind',
      'quick-step',
      'direwolf-rush'
    ]);
  });

  it('gewährt begrenztes Momentum bei Schwächentreffern', () => {
    const state = startBattle({
      party: [predatorHero(['water-blade']), depthHero('gobta', 'Gobta')],
      enemies: [phaseEnemy()],
      seed: 13
    });
    const [hero, anchor] = state.combatants.filter((c) => c.side === 'party');
    const foe = state.combatants.find((c) => c.side === 'enemy')!;
    hero!.ct = 100;
    anchor!.ct = 150;
    state.activeId = hero!.id;

    const result = act(state, { type: 'skill', skillId: 'water-blade', targetId: foe.id });

    expect(result.ok).toBe(true);
    expect(hero!.ct).toBe(35);
    expect(state.activeId).toBe(anchor!.id);
  });
});

describe('Phase 80 — Anti-Aussitzen / Eskalation', () => {
  // Sehr zäher Punching-Bag, der beide Vergleichsläufe überlebt (kein Tod → HP-Delta
  // misst nur die Eskalation, nicht ein Cappen durch Ableben).
  const tank = (): BattleUnitInput => depthHero('rimuru', 'Rimuru', {
    stats: { maxHp: 60000, maxMp: 200, attack: 26, defense: 18, magic: 24, spirit: 18, agility: 22 }
  });

  it('Eskalations-Bonus: 0 in der Gnadenfrist, lineare Rampe danach, Deckel bei 200 %', () => {
    const state = startBattle({ party: [tank()], enemies: [phaseEnemy({ escalationPercentPerTurn: 12 })], seed: 1 });
    const boss = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    boss.escalationStacks = 0;
    expect(escalationBonus(boss)).toBe(0);
    boss.escalationStacks = 5; // Gnadenfrist: noch kein Zuschlag.
    expect(escalationBonus(boss)).toBe(0);
    boss.escalationStacks = 6;
    expect(escalationBonus(boss)).toBeCloseTo(0.12);
    boss.escalationStacks = 10;
    expect(escalationBonus(boss)).toBeCloseTo(0.6);
    boss.escalationStacks = 1000; // Deckel.
    expect(escalationBonus(boss)).toBe(2);

    // Nicht eskalierender Gegner bleibt unabhängig von der Zugzahl bei 0.
    const calm = startBattle({ party: [tank()], enemies: [phaseEnemy()], seed: 1 })
      .combatants.find((combatant) => combatant.side === 'enemy')!;
    calm.escalationStacks = 1000;
    expect(escalationBonus(calm)).toBe(0);
  });

  it('bestraft Aussitzen: ein eskalierender Boss teilt über die Zeit spürbar mehr Schaden aus', () => {
    // Party sitzt nur aus (verteidigt) — misst den Boss-Schaden über 24 Gegnerzüge.
    const stallDamage = (escalationPercentPerTurn: number): number => {
      const state = startBattle({
        party: [tank()],
        // Nur Basisangriffe (keine DoT-Skills), damit der Vergleich allein die
        // Eskalation misst — Gift-Ticks laufen nicht durch den Eskalations-Multiplikator.
        enemies: [phaseEnemy({ escalationPercentPerTurn, skillIds: [] })],
        seed: 7
      });
      let enemyActions = 0;
      let guard = 0;
      while (state.status === 'active' && enemyActions < 24 && guard++ < 5000) {
        if (isPlayerTurn(state)) {
          act(state, { type: 'guard' });
        } else {
          enemyTurn(state);
          enemyActions += 1;
        }
      }
      const hero = state.combatants.find((combatant) => combatant.side === 'party')!;
      return hero.maxHp - hero.hp;
    };

    const escalated = stallDamage(12);
    const flat = stallDamage(0);
    // Gleicher Seed, gleiche Party/Boss — nur die Eskalation unterscheidet sich.
    // Aussitzen gegen den eskalierenden Boss kostet spürbar mehr HP.
    expect(flat).toBeGreaterThan(0);
    expect(escalated).toBeGreaterThan(flat * 1.25);
  });

  it('kündigt die Eskalation sichtbar an, sobald die Gnadenfrist überschritten ist', () => {
    const state = startBattle({
      party: [tank()],
      enemies: [phaseEnemy({ escalationPercentPerTurn: 12 })],
      seed: 7
    });
    let guard = 0;
    while (state.status === 'active' && guard++ < 5000) {
      if (isPlayerTurn(state)) {
        act(state, { type: 'guard' });
      } else {
        enemyTurn(state);
      }
      if (state.log.some((entry) => entry.includes('wird rasend'))) break;
    }
    expect(state.log.some((entry) => entry.includes('wird rasend'))).toBe(true);
  });
});

describe('Phase 81 — Telegraph → Konter-Entscheidung', () => {
  const hero = (): BattleUnitInput => depthHero('rimuru', 'Rimuru', {
    stats: { maxHp: 400, maxMp: 60, attack: 26, defense: 18, magic: 24, spirit: 18, agility: 22 }
  });
  // black-flame ist als Big-Hit (heavy) geflaggt.
  const heavyBoss = (): BattleUnitInput => phaseEnemy({ skillIds: ['black-flame'], element: 'shadow' });

  const heavyHitDamage = (braced: boolean): number => {
    const state = startBattle({ party: [hero()], enemies: [heavyBoss()], seed: 3 });
    const target = state.combatants.find((combatant) => combatant.side === 'party')!;
    const boss = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    boss.telegraphSkillId = 'black-flame'; // Big-Hit ist telegraphiert.
    if (braced) target.reaction = { kind: 'timing-block', timing: 'success' };
    state.activeId = boss.id;
    const before = target.hp;
    enemyTurn(state);
    return before - target.hp;
  };

  it('ungedeckter Big-Hit trifft deutlich härter als ein rechtzeitig geblockter', () => {
    const unbraced = heavyHitDamage(false);
    const braced = heavyHitDamage(true);
    expect(braced).toBeGreaterThan(0);
    expect(unbraced).toBeGreaterThan(braced * 1.5);
  });

  it('kündigt Big-Hits auch ohne Analyse an (fair lesbar)', () => {
    const state = startBattle({ party: [hero()], enemies: [heavyBoss()], seed: 2 });
    let guard = 0;
    while (currentActor(state)?.side !== 'enemy' && guard++ < 50) {
      if (isPlayerTurn(state)) act(state, { type: 'guard' });
    }
    enemyTurn(state); // nach der Aktion sagt refreshEnemyTelegraph den nächsten Zug voraus
    const boss = renderView(state).enemies[0]!;
    expect(boss.analysisLevel).toBe(0); // nicht analysiert …
    expect(boss.telegraphSkillId).toBe('black-flame'); // … und trotzdem telegraphiert
    expect(boss.telegraphHeavy).toBe(true);
  });

  it('Deckung (brace) stellt der ganzen lebenden Party einen Block bereit', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru'), depthHero('gobta', 'Gobta')],
      enemies: [heavyBoss()],
      seed: 1
    });
    let guard = 0;
    while (!isPlayerTurn(state) && guard++ < 50) {
      enemyTurn(state);
    }
    const result = act(state, { type: 'brace' });
    expect(result.ok).toBe(true);
    for (const ally of state.combatants.filter((combatant) => combatant.side === 'party' && !combatant.dead)) {
      expect(ally.reaction).toEqual({ kind: 'timing-block', timing: 'success' });
    }
  });

  it('Phase 85 — Deckung übernimmt das im HUD erspielte Timing (perfect/miss)', () => {
    for (const timing of ['perfect', 'miss'] as const) {
      const state = startBattle({
        party: [depthHero('rimuru', 'Rimuru'), depthHero('gobta', 'Gobta')],
        enemies: [heavyBoss()],
        seed: 1
      });
      let guard = 0;
      while (!isPlayerTurn(state) && guard++ < 50) enemyTurn(state);
      expect(act(state, { type: 'brace', timing }).ok).toBe(true);
      for (const ally of state.combatants.filter((c) => c.side === 'party' && !c.dead)) {
        expect(ally.reaction).toEqual({ kind: 'timing-block', timing });
      }
    }
  });
});

describe('Phase 82 — Gegner-Archetypen', () => {
  const striker = (overrides = {}): BattleUnitInput => depthHero('rimuru', 'Rimuru', {
    stats: { maxHp: 800, maxMp: 120, attack: 40, defense: 18, magic: 40, spirit: 18, agility: 22 },
    skillIds: ['black-flame', 'water-blade', 'soothing-prayer'],
    ...overrides
  });

  it('gepanzert bis Break: gebrochen (guard-break) nimmt der Gegner deutlich mehr Schaden als ungebrochen', () => {
    const hit = (broken: boolean): number => {
      const state = startBattle({ party: [striker()], enemies: [phaseEnemy({ armoredUntilBreak: true })], seed: 5 });
      const attacker = state.combatants.find((c) => c.side === 'party')!;
      const enemy = state.combatants.find((c) => c.side === 'enemy')!;
      if (broken) enemy.statuses.push({ id: 'guard-break', turns: 2 });
      state.activeId = attacker.id; // deterministisch: direkt der Party-Zug, gleiche RNG-Position
      const before = enemy.hp;
      act(state, { type: 'attack', targetId: enemy.id });
      return before - enemy.hp;
    };
    const unbroken = hit(false);
    const broken = hit(true);
    expect(unbroken).toBeGreaterThan(0);
    expect(broken).toBeGreaterThan(unbroken * 1.3);
  });

  it('Element-Reflektor: das reflektierte Element prallt auf den Angreifer zurück, ein anderes nicht', () => {
    const selfDamageFrom = (skillId: string): number => {
      const state = startBattle({ party: [striker()], enemies: [phaseEnemy({ reflectsElement: 'fire' })], seed: 4 });
      const attacker = state.combatants.find((c) => c.side === 'party')!;
      const enemy = state.combatants.find((c) => c.side === 'enemy')!;
      state.activeId = attacker.id;
      const before = attacker.hp;
      act(state, { type: 'skill', skillId, targetId: enemy.id });
      return before - attacker.hp;
    };
    expect(selfDamageFrom('black-flame')).toBeGreaterThan(0); // Feuer wird reflektiert
    expect(selfDamageFrom('water-blade')).toBe(0); // Wasser nicht
  });

  it('Heiler-Bestrafer: heilt die Party, schlägt der Gegner gegen den Heiler zurück', () => {
    const state = startBattle({
      party: [striker(), depthHero('gobta', 'Gobta')],
      enemies: [phaseEnemy({ punishesHealing: true })],
      seed: 1
    });
    const healer = state.combatants.find((c) => c.sourceId === 'rimuru')!;
    const ally = state.combatants.find((c) => c.sourceId === 'gobta')!;
    ally.hp = Math.floor(ally.maxHp * 0.4); // verwundeter Verbündeter zum Heilen
    state.activeId = healer.id;
    const before = healer.hp;
    act(state, { type: 'skill', skillId: 'soothing-prayer', targetId: ally.id });
    expect(ally.hp).toBeGreaterThan(Math.floor(ally.maxHp * 0.4)); // Heilung wirkte
    expect(healer.hp).toBeLessThan(before); // aber der Heiler wurde bestraft
  });
});

describe('Phase 87 — Normalgegner-Archetypen', () => {
  it('Mender: heilt einen verwundeten Verbündeten, statt nur anzugreifen', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru', {
        stats: { maxHp: 500, maxMp: 20, attack: 8, defense: 40, magic: 8, spirit: 40, agility: 1 }
      })],
      enemies: [
        phaseEnemy({
          sourceId: 'mender', name: 'Heiler', healsAllies: true, skillIds: ['soothing-prayer'],
          stats: { maxHp: 120, maxMp: 80, attack: 10, defense: 12, magic: 24, spirit: 14, agility: 20 }
        }),
        phaseEnemy({ sourceId: 'ward', name: 'Schützling', skillIds: ['slime-strike'] })
      ],
      seed: 3
    });
    const mender = state.combatants.find((c) => c.sourceId === 'mender')!;
    const ward = state.combatants.find((c) => c.sourceId === 'ward')!;
    const wounded = Math.floor(ward.maxHp * 0.3);
    ward.hp = wounded;

    let healed = false;
    for (let i = 0; i < 30 && !healed; i++) {
      state.activeId = mender.id; // deterministisch: der Mender ist am Zug
      enemyTurn(state);
      if (ward.hp > wounded) healed = true;
    }
    expect(healed).toBe(true); // der Mender wählt aktiv die Heilung des Verwundeten
  });

  it('nicht-Mender heilen nie, auch wenn sie einen Heil-Skill kennen', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru', {
        stats: { maxHp: 500, maxMp: 20, attack: 8, defense: 40, magic: 8, spirit: 40, agility: 1 }
      })],
      enemies: [
        phaseEnemy({ sourceId: 'cleric', name: 'Kleriker', skillIds: ['soothing-prayer'] }),
        phaseEnemy({ sourceId: 'ward', name: 'Schützling', skillIds: ['slime-strike'] })
      ],
      seed: 3
    });
    const cleric = state.combatants.find((c) => c.sourceId === 'cleric')!;
    const ward = state.combatants.find((c) => c.sourceId === 'ward')!;
    const wounded = Math.floor(ward.maxHp * 0.3);
    ward.hp = wounded;

    for (let i = 0; i < 30; i++) {
      state.activeId = cleric.id;
      enemyTurn(state);
    }
    expect(ward.hp).toBe(wounded); // ohne healsAllies bleibt die Heilung gefiltert
  });

  it('Rudel-Raserei: fällt ein Verbündeter, gerät der Überlebende in Raserei (attack-up)', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru', {
        stats: { maxHp: 400, maxMp: 60, attack: 220, defense: 20, magic: 40, spirit: 20, agility: 30 }
      })],
      enemies: [
        phaseEnemy({
          sourceId: 'packA', name: 'Rudeltier A', enrageOnAllyDeath: true,
          stats: { maxHp: 200, maxMp: 10, attack: 20, defense: 12, magic: 8, spirit: 10, agility: 16 }
        }),
        phaseEnemy({
          sourceId: 'packB', name: 'Rudeltier B',
          stats: { maxHp: 1, maxMp: 10, attack: 20, defense: 12, magic: 8, spirit: 10, agility: 16 }
        })
      ],
      seed: 2
    });
    const attacker = state.combatants.find((c) => c.side === 'party')!;
    const packA = state.combatants.find((c) => c.sourceId === 'packA')!;
    const packB = state.combatants.find((c) => c.sourceId === 'packB')!;

    expect(packA.enraged).toBe(false);
    packB.hp = 1;
    state.activeId = attacker.id;
    act(state, { type: 'attack', targetId: packB.id });

    expect(packB.dead).toBe(true);
    expect(packA.enraged).toBe(true);
    expect(packA.statuses.some((s) => s.id === 'attack-up')).toBe(true);
  });

  it('Raserei feuert nur einmal, nicht bei jedem weiteren Verbündeten-Tod', () => {
    const state = startBattle({
      party: [depthHero('rimuru', 'Rimuru', {
        stats: { maxHp: 400, maxMp: 60, attack: 220, defense: 20, magic: 40, spirit: 20, agility: 30 }
      })],
      enemies: [
        phaseEnemy({ sourceId: 'packA', name: 'A', enrageOnAllyDeath: true,
          stats: { maxHp: 200, maxMp: 10, attack: 20, defense: 12, magic: 8, spirit: 10, agility: 16 } }),
        phaseEnemy({ sourceId: 'packB', name: 'B', stats: { maxHp: 1, maxMp: 10, attack: 20, defense: 12, magic: 8, spirit: 10, agility: 16 } }),
        phaseEnemy({ sourceId: 'packC', name: 'C', stats: { maxHp: 1, maxMp: 10, attack: 20, defense: 12, magic: 8, spirit: 10, agility: 16 } })
      ],
      seed: 2
    });
    const attacker = state.combatants.find((c) => c.side === 'party')!;
    const packA = state.combatants.find((c) => c.sourceId === 'packA')!;
    const packB = state.combatants.find((c) => c.sourceId === 'packB')!;
    const packC = state.combatants.find((c) => c.sourceId === 'packC')!;

    packB.hp = 1;
    state.activeId = attacker.id;
    act(state, { type: 'attack', targetId: packB.id });
    packC.hp = 1;
    state.activeId = attacker.id;
    act(state, { type: 'attack', targetId: packC.id });

    expect(packA.statuses.filter((s) => s.id === 'attack-up')).toHaveLength(1); // kein Stapeln
  });
});

describe('Phase 88 — build-relevante Encounter (Kategorie-Resistenz)', () => {
  const striker = (): BattleUnitInput => depthHero('rimuru', 'Rimuru', {
    stats: { maxHp: 800, maxMp: 120, attack: 60, defense: 18, magic: 60, spirit: 18, agility: 22 },
    skillIds: ['slime-strike', 'water-blade']
  });

  // Ein Treffer gegen einen (optional kategorie-resistenten) neutralen Gegner; gleicher Seed +
  // erzwungener Party-Zug -> identische Varianz, sodass nur die Resistenz den Unterschied macht.
  const damageFrom = (skillId: string | null, enemyOverrides: Partial<BattleUnitInput>): number => {
    const state = startBattle({
      party: [striker()],
      enemies: [phaseEnemy({ element: 'neutral', weaknesses: [], resistances: [], ...enemyOverrides })],
      seed: 5
    });
    const attacker = state.combatants.find((c) => c.side === 'party')!;
    const enemy = state.combatants.find((c) => c.side === 'enemy')!;
    state.activeId = attacker.id;
    const before = enemy.hp;
    act(state, skillId ? { type: 'skill', skillId, targetId: enemy.id } : { type: 'attack', targetId: enemy.id });
    return before - enemy.hp;
  };

  it('physisch-resistent: weniger physischer Schaden, magischer bleibt voll', () => {
    const physNormal = damageFrom(null, {});
    const physResisted = damageFrom(null, { resistsCategory: 'physical' });
    expect(physNormal).toBeGreaterThan(0);
    expect(physResisted).toBeLessThan(physNormal); // physisch wird abgewehrt

    const magNormal = damageFrom('water-blade', {});
    const magResisted = damageFrom('water-blade', { resistsCategory: 'physical' });
    expect(magResisted).toBe(magNormal); // physische Resistenz mindert Magie NICHT
  });

  it('magie-resistent: weniger magischer Schaden, physischer bleibt voll', () => {
    const magNormal = damageFrom('water-blade', {});
    const magResisted = damageFrom('water-blade', { resistsCategory: 'magical' });
    expect(magNormal).toBeGreaterThan(0);
    expect(magResisted).toBeLessThan(magNormal); // magisch wird abgewehrt

    const physNormal = damageFrom(null, {});
    const physResisted = damageFrom(null, { resistsCategory: 'magical' });
    expect(physResisted).toBe(physNormal); // magische Resistenz mindert Physisch NICHT
  });
});

describe('Phase 88b — Kategorie-Reflektor + Support-Rallyer', () => {
  const striker = (): BattleUnitInput => depthHero('rimuru', 'Rimuru', {
    stats: { maxHp: 800, maxMp: 120, attack: 60, defense: 18, magic: 60, spirit: 18, agility: 22 },
    skillIds: ['slime-strike', 'water-blade']
  });

  it('Kategorie-Reflektor: der falsche Damage-Typ prallt zurück, der richtige nicht', () => {
    const selfDamageFrom = (skillId: string | null): number => {
      const state = startBattle({
        party: [striker()],
        enemies: [phaseEnemy({ reflectsCategory: 'physical', element: 'neutral', weaknesses: [], resistances: [] })],
        seed: 4
      });
      const attacker = state.combatants.find((c) => c.side === 'party')!;
      const enemy = state.combatants.find((c) => c.side === 'enemy')!;
      state.activeId = attacker.id;
      const before = attacker.hp;
      act(state, skillId ? { type: 'skill', skillId, targetId: enemy.id } : { type: 'attack', targetId: enemy.id });
      return before - attacker.hp;
    };
    expect(selfDamageFrom(null)).toBeGreaterThan(0); // physischer Angriff wird reflektiert
    expect(selfDamageFrom('water-blade')).toBe(0); // magischer nicht
  });

  const rallyerFight = () => startBattle({
    party: [depthHero('rimuru', 'Rimuru', {
      stats: { maxHp: 600, maxMp: 20, attack: 8, defense: 40, magic: 8, spirit: 40, agility: 1 }
    })],
    enemies: [
      phaseEnemy({ sourceId: 'rallyer', name: 'Sergeant', skillIds: ['rally-cry'],
        stats: { maxHp: 120, maxMp: 40, attack: 12, defense: 12, magic: 8, spirit: 10, agility: 20 } }),
      phaseEnemy({ sourceId: 'ally', name: 'Verbündeter', skillIds: ['slime-strike'] })
    ],
    seed: 3
  });
  const enemySideHasAttackUp = (state: BattleState): boolean =>
    state.combatants.some((c) => c.side === 'enemy' && c.statuses.some((s) => s.id === 'attack-up'));

  it('Support-Rallyer: bufft mit rally-cry den Angriff eines Verbündeten (attack-up)', () => {
    const state = rallyerFight();
    const rallyer = state.combatants.find((c) => c.sourceId === 'rallyer')!;
    let buffed = false;
    for (let i = 0; i < 30 && !buffed; i++) {
      state.activeId = rallyer.id;
      enemyTurn(state);
      if (enemySideHasAttackUp(state)) buffed = true;
    }
    expect(buffed).toBe(true);
  });

  it('per Silence kontrollierbar: ein verstummter Rallyer bufft niemanden (Support-Check konterbar)', () => {
    const state = rallyerFight();
    const rallyer = state.combatants.find((c) => c.sourceId === 'rallyer')!;
    rallyer.statuses.push({ id: 'silence', turns: 9 });
    for (let i = 0; i < 12; i++) {
      state.activeId = rallyer.id;
      enemyTurn(state);
    }
    expect(enemySideHasAttackUp(state)).toBe(false);
  });
});
