import { describe, expect, it } from 'vitest';
import {
  act,
  currentActor,
  enemyTurn,
  isPlayerTurn,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';

// Phase 109 — Skript-Bosse & Adds: ein Boss beschwört beim Wechsel in Phase 2 einmalig
// zusätzliche Combatants. Hard-Termination: einmalig + endliche Zahl (kein Soft-Lock).

function tank(): BattleUnitInput {
  return {
    sourceId: 'tank',
    name: 'Tank',
    side: 'party',
    level: 20,
    stats: { maxHp: 5000, maxMp: 200, attack: 30, defense: 40, magic: 30, spirit: 40, agility: 12 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: ['slime-strike']
  };
}

function bruiser(): BattleUnitInput {
  return {
    sourceId: 'bruiser',
    name: 'Bruiser',
    side: 'party',
    level: 20,
    stats: { maxHp: 5000, maxMp: 200, attack: 220, defense: 40, magic: 200, spirit: 40, agility: 40 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: ['slime-strike', 'storm-gust']
  };
}

function summonBoss(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'summon-boss',
    name: 'Beschwörer',
    side: 'enemy',
    level: 18,
    stats: { maxHp: 400, maxMp: 40, attack: 20, defense: 10, magic: 20, spirit: 10, agility: 18 },
    element: 'earth',
    weaknesses: [],
    resistances: [],
    skillIds: ['ogre-smash'],
    boss: true,
    phase2SkillIds: [],
    summonEnemyId: 'stray-echo',
    summonCount: 2,
    devourable: false,
    experienceReward: 100,
    goldReward: 50,
    drops: [],
    ...overrides
  };
}

function enemyCount(state: BattleState): number {
  return renderView(state).enemies.filter((enemy) => !enemy.dead).length;
}

describe('Phase 109 — Skript-Bosse & Adds', () => {
  it('beschwört beim Phasenwechsel Adds in den Kampf', () => {
    const state = startBattle({ party: [tank()], enemies: [summonBoss()], seed: 77 });
    const boss = state.combatants.find((c) => c.side === 'enemy')!;
    // Boss knapp unter die Phasen-Schwelle (50 %) setzen, ohne ihn zu töten.
    boss.hp = Math.floor(boss.maxHp * 0.4);

    let guard = 0;
    // Party verteidigt nur (tötet den Boss nicht), bis der Boss handelt und in Phase 2 wechselt.
    while (state.status === 'active' && enemyCount(state) === 1 && guard++ < 1000) {
      if (isPlayerTurn(state)) {
        act(state, { type: 'guard' });
      } else {
        enemyTurn(state);
      }
    }

    expect(boss.summonsUsed).toBe(true);
    expect(enemyCount(state)).toBe(3); // Boss + 2 Adds
    expect(renderView(state).enemies.filter((e) => e.name === 'Streunendes Echo')).toHaveLength(2);
  });

  it('beschwört nur ein einziges Mal (kein endloses Nachspawnen)', () => {
    const state = startBattle({ party: [tank()], enemies: [summonBoss()], seed: 123 });
    const boss = state.combatants.find((c) => c.side === 'enemy')!;
    boss.hp = Math.floor(boss.maxHp * 0.4);

    let guard = 0;
    while (state.status === 'active' && guard++ < 400) {
      if (isPlayerTurn(state)) {
        act(state, { type: 'guard' });
        // Boss nach dem ersten Spawn dauerhaft knapp unter der Schwelle halten,
        // um weitere Phasen-Checks zu provozieren — es darf nie erneut spawnen.
        if (boss.summonsUsed) boss.hp = Math.floor(boss.maxHp * 0.4);
      } else {
        enemyTurn(state);
      }
      if (boss.summonsUsed && guard > 200) break;
    }

    expect(boss.summonsUsed).toBe(true);
    // Genau 2 Adds, kein Nachspawnen.
    expect(renderView(state).enemies.filter((e) => e.name === 'Streunendes Echo').length).toBe(2);
  });

  it('terminiert unter Auto-Battle trotz Adds (Party besiegt Boss + Adds)', () => {
    const state = startBattle({ party: [bruiser()], enemies: [summonBoss()], seed: 55 });

    let guard = 0;
    while (state.status === 'active' && guard++ < 4000) {
      if (isPlayerTurn(state)) {
        const actor = currentActor(state)!;
        const target = renderView(state).enemies.find((e) => !e.dead);
        if (!target) break;
        act(state, { type: 'skill', skillId: 'storm-gust' });
        void actor;
      } else {
        enemyTurn(state);
      }
    }

    expect(state.status).toBe('won');
    expect(enemyCount(state)).toBe(0);
  });
});
