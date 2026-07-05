import { describe, expect, it } from 'vitest';
import {
  act,
  currentActor,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';
import {
  analysisBonusLevels,
  buffBonusTurns,
  counterProc,
  damageDealtMultiplier,
  damageTakenMultiplierFromPerks,
  devourChanceBonus,
  dodgeChance,
  maxHpMultiplier,
  skillChainFor,
  type TalentPerk
} from '../src/systems/talentPerk';

// --- reine Aggregations-Helfer (deterministisch, jeder Perk-Typ) ---
describe('TalentPerk-Aggregation', () => {
  it('damage-dealt filtert nach Kategorie/Element und multipliziert', () => {
    const perks: TalentPerk[] = [
      { kind: 'damage-dealt', percent: 25, category: 'physical' },
      { kind: 'damage-dealt', percent: 10, element: 'fire' }
    ];
    expect(damageDealtMultiplier(perks, 'physical', 'wind')).toBeCloseTo(1.25);
    expect(damageDealtMultiplier(perks, 'magical', 'fire')).toBeCloseTo(1.1);
    expect(damageDealtMultiplier(perks, 'magical', 'wind')).toBeCloseTo(1);
  });

  it('damage-taken reduziert und ist auf 0.1 begrenzt', () => {
    expect(damageTakenMultiplierFromPerks([{ kind: 'damage-taken', percent: 30 }])).toBeCloseTo(0.7);
    expect(damageTakenMultiplierFromPerks([{ kind: 'damage-taken', percent: 200 }])).toBe(0.1);
  });

  it('max-hp/dodge/counter/buff aggregieren additiv (mit Deckeln)', () => {
    expect(maxHpMultiplier([{ kind: 'max-hp', percent: 20 }, { kind: 'max-hp', percent: 5 }])).toBeCloseTo(1.25);
    expect(dodgeChance([{ kind: 'dodge', percent: 100 }])).toBe(0.9);
    expect(counterProc([{ kind: 'counter', percent: 40, scale: 1.5 }])).toEqual({ chance: 0.4, scale: 1.5 });
    expect(buffBonusTurns([{ kind: 'buff-power', percent: 100 }])).toBe(1);
  });

  it('skill-chain findet den Folgeskill zum passenden Trigger', () => {
    const perks: TalentPerk[] = [{ kind: 'skill-chain', triggerSkillId: 'slime-strike', followUpSkillId: 'orc-cleave', percent: 100 }];
    expect(skillChainFor(perks, 'slime-strike')).toEqual({ followUpSkillId: 'orc-cleave', chance: 1 });
    expect(skillChainFor(perks, 'water-blade')).toBeNull();
  });

  it('Verschlingen- und Analyse-Perks aggregieren mit sicheren Grenzen', () => {
    expect(devourChanceBonus([
      { kind: 'devour-chance', percent: 20 },
      { kind: 'devour-chance', percent: 40 }
    ])).toBe(0.5);
    expect(analysisBonusLevels([
      { kind: 'analysis-power', levels: 1 },
      { kind: 'analysis-power', levels: 2 }
    ])).toBe(3);
  });
});

// --- Kampf-Integration (deterministisch: Perks auf 0/100 % oder ohne RNG) ---
function attacker(perks?: TalentPerk[]): BattleUnitInput {
  return {
    sourceId: 'atk', name: 'Angreifer', side: 'party', level: 5,
    stats: { maxHp: 100, maxMp: 30, attack: 40, defense: 10, magic: 40, spirit: 10, agility: 50 },
    element: 'neutral', weaknesses: [], resistances: [], skillIds: ['slime-strike', 'war-cry'], perks
  };
}

function dummy(perks?: TalentPerk[]): BattleUnitInput {
  return {
    sourceId: 'dummy', name: 'Ziel', side: 'enemy', level: 5,
    stats: { maxHp: 800, maxMp: 0, attack: 20, defense: 8, magic: 8, spirit: 8, agility: 1 },
    element: 'neutral', weaknesses: [], resistances: [], skillIds: [],
    experienceReward: 0, goldReward: 0, perks
  };
}

function partyAttackOnce(atkPerks: TalentPerk[] | undefined, enemyPerks: TalentPerk[] | undefined, seed = 3): BattleState {
  const state = startBattle({ party: [attacker(atkPerks)], enemies: [dummy(enemyPerks)], seed });
  const target = state.combatants.find((c) => c.side === 'enemy')!;
  act(state, { type: 'attack', targetId: target.id });
  return state;
}

const enemyHp = (state: BattleState): number => state.combatants.find((c) => c.side === 'enemy')!.hp;
const partyUnit = (state: BattleState) => state.combatants.find((c) => c.side === 'party')!;

describe('TalentPerk-Kampfwirkung', () => {
  it('max-hp erhöht die maximalen LP zur Build-Zeit', () => {
    const state = startBattle({ party: [attacker([{ kind: 'max-hp', percent: 20 }])], enemies: [dummy()], seed: 1 });
    expect(partyUnit(state).maxHp).toBe(120);
  });

  it('damage-dealt erhöht ausgeteilten Schaden (gleicher Seed)', () => {
    const base = enemyHp(partyAttackOnce(undefined, undefined));
    const buffed = enemyHp(partyAttackOnce([{ kind: 'damage-dealt', percent: 50, category: 'physical' }], undefined));
    expect(buffed).toBeLessThan(base);
  });

  it('damage-taken senkt erlittenen Schaden (gleicher Seed)', () => {
    const base = enemyHp(partyAttackOnce(undefined, undefined));
    const shielded = enemyHp(partyAttackOnce(undefined, [{ kind: 'damage-taken', percent: 50, category: 'physical' }]));
    expect(shielded).toBeGreaterThan(base);
  });

  it('dodge negiert den Treffer (100 % → gedeckelt 0.9, hier gewürfelt)', () => {
    // 90 % Ausweichchance: über mehrere Seeds muss mindestens einer ausweichen.
    const dodgedSomewhere = [1, 2, 3, 4, 5].some((seed) =>
      enemyHp(partyAttackOnce(undefined, [{ kind: 'dodge', percent: 100 }], seed)) === 800
    );
    expect(dodgedSomewhere).toBe(true);
  });

  it('counter fügt dem Angreifer bei 100 % Chance Schaden zu', () => {
    const state = partyAttackOnce(undefined, [{ kind: 'counter', percent: 100, scale: 1 }]);
    expect(partyUnit(state).hp).toBeLessThan(partyUnit(state).maxHp);
  });

  it('skill-chain löst einen Zusatztreffer aus (gleicher Seed, mehr Schaden)', () => {
    const withoutChain = startBattle({ party: [attacker()], enemies: [dummy()], seed: 3 });
    act(withoutChain, { type: 'skill', skillId: 'slime-strike', targetId: withoutChain.combatants.find((c) => c.side === 'enemy')!.id });
    const withChain = startBattle({
      party: [attacker([{ kind: 'skill-chain', triggerSkillId: 'slime-strike', followUpSkillId: 'orc-cleave', percent: 100 }])],
      enemies: [dummy()], seed: 3
    });
    act(withChain, { type: 'skill', skillId: 'slime-strike', targetId: withChain.combatants.find((c) => c.side === 'enemy')!.id });
    expect(enemyHp(withChain)).toBeLessThan(enemyHp(withoutChain));
  });

  it('buff-power verlängert die Dauer selbst gewirkter Buffs (+1 ggü. ohne Perk)', () => {
    const buffTurns = (perks?: TalentPerk[]): number => {
      const state = startBattle({ party: [attacker(perks)], enemies: [dummy()], seed: 1 });
      const actor = currentActor(state)!;
      act(state, { type: 'skill', skillId: 'war-cry', targetId: actor.id });
      return partyUnit(state).statuses.find((status) => status.id === 'attack-up')?.turns ?? 0;
    };
    // Beide Werte sind bereits um den End-of-Turn-Tick reduziert; die Differenz zeigt den Perk.
    expect(buffTurns([{ kind: 'buff-power', percent: 100 }])).toBe(buffTurns(undefined) + 1);
  });
});
