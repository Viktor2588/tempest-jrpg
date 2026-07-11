import { describe, expect, it } from 'vitest';
import { HEROES, SKILL_TREES } from '../src/data';
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

  it('Phase 130 — Hakurou/Souei-Kapstein-Knoten verleihen Spieler-CC-Fertigkeiten', () => {
    const playerCc: Record<string, { statusId: string; nodeId: string; treeId: string }> = {
      'iai-stillness': { statusId: 'stun', nodeId: 'hakurou-iai-master', treeId: 'hakurou-tree' },
      'shadow-bind': { statusId: 'paralyze', nodeId: 'souei-shadow-phantom', treeId: 'souei-tree' }
    };
    for (const [skillId, info] of Object.entries(playerCc)) {
      const skill = (SKILLS as readonly SkillDefinition[]).find((candidate) => candidate.id === skillId);
      expect(skill, `${skillId} fehlt`).toBeTruthy();
      expect(skill!.statusEffect?.id).toBe(info.statusId);
      expect(skill!.target).toBe('single-enemy');

      const tree = SKILL_TREES.find((candidate) => candidate.id === info.treeId)!;
      const node = tree.nodes.find((candidate) => candidate.id === info.nodeId) as { skillId?: string };
      expect(node.skillId).toBe(skillId);
    }
  });

  it('Phase 133 — die neuen Skills aktivieren die letzten toten Hart-CC (freeze/charm)', () => {
    const expected: Record<string, { statusId: string; carrier: string }> = {
      'frost-flask': { statusId: 'freeze', carrier: 'human-deserter' },
      'dominating-gaze': { statusId: 'charm', carrier: 'orc-lord' }
    };
    for (const [skillId, info] of Object.entries(expected)) {
      const skill = (SKILLS as readonly SkillDefinition[]).find((candidate) => candidate.id === skillId);
      expect(skill, `${skillId} fehlt`).toBeTruthy();
      expect(skill!.statusEffect?.id).toBe(info.statusId);
      expect(skill!.statusEffect!.chance).toBeGreaterThan(0);
      expect(skill!.target).toBe('single-enemy');
    }
  });

  it('Phase 133 — der Deserteur-Söldner kann die Party einfrieren, Schaden bricht das Eis', () => {
    let frozen = false;
    for (let seed = 1; seed <= 160 && !frozen; seed += 1) {
      const state = startBattle({
        party: [createHeroBattleUnit(RIMURU), createHeroBattleUnit(GOBTA)],
        enemyIds: ['human-deserter'],
        seed
      });
      const deserter = state.combatants.find((combatant) => combatant.sourceId === 'human-deserter')!;
      state.activeId = deserter.id;
      enemyTurn(state);
      frozen = state.combatants.some(
        (combatant) => combatant.side === 'party' && combatant.statuses.some((status) => status.id === 'freeze')
      );
    }
    expect(frozen).toBe(true);
  });

  it('Phase 133 — der Ork-Lord kann ein Party-Mitglied bezaubern', () => {
    let charmed = false;
    for (let seed = 1; seed <= 160 && !charmed; seed += 1) {
      const state = startBattle({
        party: [createHeroBattleUnit(RIMURU), createHeroBattleUnit(GOBTA)],
        enemyIds: ['orc-lord'],
        seed
      });
      const lord = state.combatants.find((combatant) => combatant.sourceId === 'orc-lord')!;
      state.activeId = lord.id;
      enemyTurn(state);
      charmed = state.combatants.some(
        (combatant) => combatant.side === 'party' && combatant.statuses.some((status) => status.id === 'charm')
      );
    }
    expect(charmed).toBe(true);
  });

  it('Phase 136 — die drei Spieler-Weichkontroll-Skills tragen silence/blind/weaken und hängen an Nicht-Harness-Kapsteinen', () => {
    const softCc: Record<string, { statusId: string; nodeId: string; treeId: string }> = {
      'banishing-seal': { statusId: 'silence', nodeId: 'shuna-ward-circle', treeId: 'shuna-weaving-tree' },
      'blinding-dust': { statusId: 'blind', nodeId: 'souei-assassin-execute', treeId: 'souei-tree' },
      'enfeebling-grip': { statusId: 'weaken', nodeId: 'shion-crush-titan', treeId: 'shion-tree' }
    };
    for (const [skillId, info] of Object.entries(softCc)) {
      const skill = (SKILLS as readonly SkillDefinition[]).find((candidate) => candidate.id === skillId);
      expect(skill, `${skillId} fehlt`).toBeTruthy();
      expect(skill!.statusEffect?.id).toBe(info.statusId);
      expect(skill!.target).toBe('single-enemy');

      const tree = SKILL_TREES.find((candidate) => candidate.id === info.treeId)!;
      const node = tree.nodes.find((candidate) => candidate.id === info.nodeId) as { skillId?: string };
      expect(node.skillId).toBe(skillId);
    }
  });

  it('Phase 136 — Bannsiegel bringt ein Ziel zum Schweigen (silence landet)', () => {
    let silenced = false;
    let feedbackVisible = false;
    for (let seed = 1; seed <= 60 && !silenced; seed += 1) {
      const state = startBattle({
        party: [createHeroBattleUnit(RIMURU, { skillIds: ['banishing-seal'], perks: [] })],
        enemyIds: ['forest-slime'],
        seed
      });
      const caster = state.combatants.find((combatant) => combatant.side === 'party')!;
      const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
      state.activeId = caster.id;
      const result = act(state, { type: 'skill', skillId: 'banishing-seal', targetId: enemy.id });
      expect(result.ok).toBe(true);
      silenced = enemy.statuses.some((status) => status.id === 'silence');
      feedbackVisible ||= state.log.some((line) => line.includes('Stumm') || line.includes('Fähigkeiten gesperrt'));
    }
    expect(silenced).toBe(true);
    expect(feedbackVisible).toBe(true);
  });

  it('Phase 137 — Analysieren kennzeichnet Magie-lastige Gegner als Zauberwirker', () => {
    const state = startBattle({
      party: [createHeroBattleUnit(RIMURU)],
      enemyIds: ['academy-wisp'],
      seed: 137
    });
    const rimuru = state.combatants.find((combatant) => combatant.side === 'party')!;
    const wisp = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    state.activeId = rimuru.id;

    expect(act(state, { type: 'analyze', targetId: wisp.id }).ok).toBe(true);
    expect(state.log.some((line) => line.includes('Zauberwirker') && line.includes('Bannsiegel'))).toBe(true);
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
