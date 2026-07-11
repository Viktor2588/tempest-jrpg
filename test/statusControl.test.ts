import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import { SKILLS } from '../src/data/skills';
import type { SkillDefinition } from '../src/data/types';
import { getItemCount } from '../src/systems/inventory';
import {
  act,
  createHeroBattleUnit,
  enemyTurn,
  renderView,
  startBattle
} from '../src/systems/battle';

// Phase 129 — Die Kontroll-Schicht erwacht: Gegner fügen Hart-CC zu, das
// Läuterungswasser ('cure-status') hebt negative Status wieder auf.

const RIMURU = HEROES.find((hero) => hero.id === 'rimuru')!;
const GOBTA = HEROES.find((hero) => hero.id === 'gobta')!;

describe('Phase 129 — Kontroll-Status & Reinigung', () => {
  it('die fünf neuen Gegner-CC-Skills tragen die richtige Status-Zufügung', () => {
    const expected: Record<string, string> = {
      'slumber-glow': 'sleep',
      'blinding-feint': 'confuse',
      'petrifying-gaze': 'petrify',
      'paralytic-howl': 'paralyze',
      'crushing-blow': 'stun'
    };
    for (const [skillId, statusId] of Object.entries(expected)) {
      const skill = (SKILLS as readonly SkillDefinition[]).find((candidate) => candidate.id === skillId);
      expect(skill, `${skillId} fehlt`).toBeTruthy();
      expect(skill!.statusEffect?.id).toBe(statusId);
      expect(skill!.statusEffect!.chance).toBeGreaterThan(0);
      expect(skill!.statusEffect!.turns).toBeGreaterThan(0);
    }
  });

  it('Läuterungswasser entfernt negative Status, lässt positive Buffs stehen', () => {
    const state = startBattle({
      party: [
        { ...createHeroBattleUnit(RIMURU), stats: { ...createHeroBattleUnit(RIMURU).stats, agility: 99 } },
        createHeroBattleUnit(GOBTA, { openingStatusIds: ['sleep', 'poison', 'attack-up'] })
      ],
      enemyIds: ['forest-slime'],
      inventory: [{ itemId: 'purifying-water', quantity: 2 }],
      seed: 21
    });
    const partyUnits = state.combatants.filter((combatant) => combatant.side === 'party');
    const healer = partyUnits[0]!;
    const patient = partyUnits[1]!;
    state.activeId = healer.id;

    const result = act(state, { type: 'item', itemId: 'purifying-water', targetId: patient.id });
    expect(result.ok).toBe(true);
    const remaining = patient.statuses.map((status) => status.id);
    expect(remaining).not.toContain('sleep');
    expect(remaining).not.toContain('poison');
    expect(remaining).toContain('attack-up');
    expect(getItemCount(renderView(state).inventory, 'purifying-water')).toBe(1);
  });

  it('Läuterungswasser ohne heilbaren Status verbraucht nichts', () => {
    const state = startBattle({
      party: [
        { ...createHeroBattleUnit(RIMURU), stats: { ...createHeroBattleUnit(RIMURU).stats, agility: 99 } },
        createHeroBattleUnit(GOBTA)
      ],
      enemyIds: ['forest-slime'],
      inventory: [{ itemId: 'purifying-water', quantity: 1 }],
      seed: 22
    });
    const partyUnits = state.combatants.filter((combatant) => combatant.side === 'party');
    state.activeId = partyUnits[0]!.id;
    const result = act(state, { type: 'item', itemId: 'purifying-water', targetId: partyUnits[1]!.id });
    expect(result.ok).toBe(false);
    expect(getItemCount(renderView(state).inventory, 'purifying-water')).toBe(1);
  });

  it('ein CC-Gegner (Akademie-Irrlicht) kann die Party einschläfern', () => {
    let slept = false;
    for (let seed = 1; seed <= 120 && !slept; seed += 1) {
      const state = startBattle({
        party: [createHeroBattleUnit(RIMURU), createHeroBattleUnit(GOBTA)],
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
    expect(slept).toBe(true);
  });
});
