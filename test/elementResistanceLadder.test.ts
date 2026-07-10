import { describe, expect, it } from 'vitest';
import {
  act,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';
import { chooseAutoAction } from '../src/systems/autoBattle';
import { buildBestiary } from '../src/systems/bestiary';
import { ENEMIES } from '../src/data/enemies';

// Phase 125 — Resistenz-Leiter (Resistenz -> Nullifizierung -> Absorption).

function hero(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'hero',
    name: 'Held',
    side: 'party',
    level: 12,
    stats: { maxHp: 600, maxMp: 200, attack: 60, defense: 20, magic: 60, spirit: 20, agility: 80 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: ['water-blade', 'black-flame'],
    ...overrides
  };
}

function foe(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'foe',
    name: 'Zielobjekt',
    side: 'enemy',
    level: 10,
    stats: { maxHp: 4000, maxMp: 0, attack: 1, defense: 5, magic: 1, spirit: 5, agility: 1 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: [],
    experienceReward: 0,
    goldReward: 0,
    drops: [],
    ...overrides
  };
}

function battle(foeOverrides: Partial<BattleUnitInput>, seed = 77): BattleState {
  return startBattle({ party: [hero()], enemies: [foe(foeOverrides)], seed });
}

function enemyHp(state: BattleState): number {
  return renderView(state).enemies[0]!.hp;
}

describe('Absorption', () => {
  it('heilt das Ziel statt zu schaden, wenn das Element absorbiert wird', () => {
    const state = battle({ absorbs: ['water'], currentHp: 3000 });
    const enemyId = renderView(state).enemies[0]!.id;
    const before = enemyHp(state);
    const result = act(state, { type: 'skill', skillId: 'water-blade', targetId: enemyId });
    expect(result.ok).toBe(true);
    expect(enemyHp(state)).toBeGreaterThan(before); // absorbiert → geheilt
  });

  it('deckelt die Absorption auf die maximalen LP', () => {
    const state = battle({ absorbs: ['water'], currentHp: 3999 });
    const enemyId = renderView(state).enemies[0]!.id;
    act(state, { type: 'skill', skillId: 'water-blade', targetId: enemyId });
    expect(enemyHp(state)).toBe(4000); // nicht über maxHp
  });

  it('absorbiert nur das genannte Element — andere Elemente schaden normal', () => {
    const state = battle({ absorbs: ['water'] });
    const enemyId = renderView(state).enemies[0]!.id;
    const before = enemyHp(state);
    act(state, { type: 'skill', skillId: 'black-flame', targetId: enemyId }); // Feuer, nicht absorbiert
    expect(enemyHp(state)).toBeLessThan(before);
  });
});

describe('Nullifizierung', () => {
  it('richtet 0 Schaden an, wenn das Element immun ist', () => {
    const state = battle({ nullifies: ['fire'] });
    const enemyId = renderView(state).enemies[0]!.id;
    const before = enemyHp(state);
    act(state, { type: 'skill', skillId: 'black-flame', targetId: enemyId });
    expect(enemyHp(state)).toBe(before); // kein Schaden (auch kein Mindest-1)
  });

  it('immun heilt NICHT (anders als Absorption)', () => {
    const state = battle({ nullifies: ['water'], currentHp: 2000 });
    const enemyId = renderView(state).enemies[0]!.id;
    act(state, { type: 'skill', skillId: 'water-blade', targetId: enemyId });
    expect(enemyHp(state)).toBe(2000);
  });
});

describe('Auto-Battle meidet absorbierte/immune Elemente', () => {
  it('wählt gegen einen Wasser-Absorber kein Wasser-Skill', () => {
    const state = startBattle({
      party: [hero({ skillIds: ['water-blade', 'black-flame'] })],
      enemies: [foe({ absorbs: ['water'] })],
      seed: 5
    });
    const action = chooseAutoAction(state);
    // Der Absorber darf nie mit dem absorbierten Element (water-blade) angegriffen werden.
    if (action && action.type === 'skill') {
      expect(action.skillId).not.toBe('water-blade');
    }
  });
});

describe('Daten & Bestiarium', () => {
  it('Ifrit absorbiert Feuer, der Magiekoloss ist immun gegen Erde', () => {
    const ifrit = ENEMIES.find((enemy) => enemy.id === 'ifrit')!;
    expect(ifrit.absorbs).toContain('fire');
    const colossus = ENEMIES.find((enemy) => enemy.id === 'magic-colossus')!;
    expect(colossus.nullifies).toContain('earth');
  });

  it('deckt die Resistenz-Leiter erst nach dem Studium auf', () => {
    const studied = buildBestiary({
      defeatedEnemyCountsByEnemyId: { ifrit: 1 },
      analyzedEnemyIds: ['ifrit']
    }).entries.find((entry) => entry.enemyId === 'ifrit')!;
    expect(studied.absorbs).toEqual(['fire']);

    const unstudied = buildBestiary({
      defeatedEnemyCountsByEnemyId: { ifrit: 1 },
      analyzedEnemyIds: []
    }).entries.find((entry) => entry.enemyId === 'ifrit')!;
    expect(unstudied.absorbs).toEqual([]); // ??? bis analysiert
  });
});
