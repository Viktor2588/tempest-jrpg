import { describe, expect, it } from 'vitest';
import { HEROES, SKILL_TREES } from '../src/data';
import type { TalentPerk } from '../src/data/types';
import { statusResistChance } from '../src/systems/talentPerk';
import {
  act,
  createHeroBattleUnit,
  enemyTurn,
  startBattle
} from '../src/systems/battle';

// Phase 132 — Widerstands-Schicht: ein status-resist-Perk kann einen negativen Status
// abwehren, wenn er zugefügt würde. Buffs und nicht-gelistete Status passieren ungehindert.

const RIMURU = HEROES.find((hero) => hero.id === 'rimuru')!;
const GOBTA = HEROES.find((hero) => hero.id === 'gobta')!;

const FULL_RESIST: TalentPerk = { kind: 'status-resist', percent: 100 };

describe('Phase 132 — statusResistChance-Helfer', () => {
  it('gibt 0 ohne passenden Perk', () => {
    expect(statusResistChance([], 'poison')).toBe(0);
    expect(statusResistChance([{ kind: 'max-hp', percent: 10 }], 'poison')).toBe(0);
  });

  it('unspezifischer Widerstand gilt für jeden Negativ-Status', () => {
    const perks: TalentPerk[] = [{ kind: 'status-resist', percent: 30 }];
    expect(statusResistChance(perks, 'poison')).toBeCloseTo(0.3);
    expect(statusResistChance(perks, 'stun')).toBeCloseTo(0.3);
  });

  it('gefilterter Widerstand gilt nur für die genannten Status', () => {
    const perks: TalentPerk[] = [{ kind: 'status-resist', percent: 50, statuses: ['poison'] }];
    expect(statusResistChance(perks, 'poison')).toBeCloseTo(0.5);
    expect(statusResistChance(perks, 'stun')).toBe(0);
  });

  it('nimmt den stärksten passenden Perk und deckelt auf 1', () => {
    const perks: TalentPerk[] = [
      { kind: 'status-resist', percent: 30 },
      { kind: 'status-resist', percent: 70, statuses: ['poison'] }
    ];
    expect(statusResistChance(perks, 'poison')).toBeCloseTo(0.7);
    expect(statusResistChance(perks, 'stun')).toBeCloseTo(0.3);
    expect(statusResistChance([{ kind: 'status-resist', percent: 250 }], 'poison')).toBe(1);
  });
});

describe('Phase 132 — Widerstand im Kampf', () => {
  it('voller Widerstand wehrt Gegner-CC (Schlaf) über viele Seeds zuverlässig ab', () => {
    for (let seed = 1; seed <= 120; seed += 1) {
      const state = startBattle({
        party: [
          createHeroBattleUnit(RIMURU, { perks: [FULL_RESIST] }),
          createHeroBattleUnit(GOBTA, { perks: [FULL_RESIST] })
        ],
        enemyIds: ['academy-wisp'],
        seed
      });
      const wisp = state.combatants.find((combatant) => combatant.sourceId === 'academy-wisp')!;
      state.activeId = wisp.id;
      enemyTurn(state);
      const slept = state.combatants.some(
        (combatant) => combatant.side === 'party' && combatant.statuses.some((status) => status.id === 'sleep')
      );
      expect(slept, `Seed ${seed}: Widerstand hätte Schlaf abwehren müssen`).toBe(false);
    }
  });

  it('gefilterter Widerstand (nur Gift) lässt Schlaf durch', () => {
    let slept = false;
    for (let seed = 1; seed <= 120 && !slept; seed += 1) {
      const state = startBattle({
        party: [
          createHeroBattleUnit(RIMURU),
          createHeroBattleUnit(GOBTA, { perks: [{ kind: 'status-resist', percent: 100, statuses: ['poison'] }] })
        ],
        enemyIds: ['academy-wisp'],
        seed
      });
      const wisp = state.combatants.find((combatant) => combatant.sourceId === 'academy-wisp')!;
      state.activeId = wisp.id;
      enemyTurn(state);
      slept = state.combatants.some(
        (combatant) => combatant.side === 'party' && combatant.statuses.some((status) => status.id === 'sleep')
      );
    }
    expect(slept, 'ein auf Gift begrenzter Widerstand darf Schlaf nicht abwehren').toBe(true);
  });

  it('Widerstand wehrt eigene Buffs NICHT ab (attack-up passiert)', () => {
    const state = startBattle({
      party: [createHeroBattleUnit(GOBTA, { skillIds: ['war-cry'], perks: [FULL_RESIST] })],
      enemyIds: ['forest-slime'],
      seed: 7
    });
    const caster = state.combatants.find((combatant) => combatant.side === 'party')!;
    state.activeId = caster.id;
    const result = act(state, { type: 'skill', skillId: 'war-cry', targetId: caster.id });
    expect(result.ok).toBe(true);
    expect(caster.statuses.some((status) => status.id === 'attack-up')).toBe(true);
  });
});

describe('Phase 132 — Spec-Knoten-Träger', () => {
  it('Shunas Segensschleier trägt einen status-resist-Perk', () => {
    const tree = SKILL_TREES.find((candidate) => candidate.nodes.some((node) => node.id === 'shuna-ward-veil'))!;
    const node = tree.nodes.find((candidate) => candidate.id === 'shuna-ward-veil')!;
    const resist = (node.perks ?? []).find((perk) => perk.kind === 'status-resist');
    expect(resist).toBeTruthy();
    expect(resist!.kind === 'status-resist' && resist!.percent).toBeGreaterThan(0);
  });
});
