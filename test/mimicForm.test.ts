import { describe, expect, it } from 'vitest';
import {
  act,
  availableMimicElements,
  currentActor,
  enemyTurn,
  isPlayerTurn,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';

// Phase 105 — Mimikry als aktive Kampf-Form: Rimuru nimmt on-demand das Element einer
// in diesem Kampf verschlungenen Gegner-Art an (Grundangriff/Resonanz wechseln), die Form
// klingt über die eigenen Züge ab.

function rimuruLike(skillIds: readonly string[] = ['predator', 'slime-strike']): BattleUnitInput {
  return {
    sourceId: 'rimuru',
    name: 'Rimuru',
    side: 'party',
    level: 10,
    stats: { maxHp: 600, maxMp: 200, attack: 60, defense: 20, magic: 40, spirit: 20, agility: 60 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: [...skillIds]
  };
}

function fireWeakDummy(): BattleUnitInput {
  return {
    sourceId: 'dummy',
    name: 'Prügelpuppe',
    side: 'enemy',
    level: 1,
    stats: { maxHp: 99999, maxMp: 0, attack: 1, defense: 5, magic: 1, spirit: 5, agility: 1 },
    element: 'earth',
    weaknesses: ['fire'],
    resistances: [],
    skillIds: [],
    experienceReward: 0,
    goldReward: 0,
    drops: []
  };
}

function battle(hero: BattleUnitInput, seed = 909): BattleState {
  return startBattle({ party: [hero], enemies: [fireWeakDummy()], seed });
}

// Phase 126 — ein Feuer-Gegner (auch sein Grundangriff trägt sein Element).
function fireAttacker(): BattleUnitInput {
  return {
    sourceId: 'flamer',
    name: 'Flammer',
    side: 'enemy',
    level: 10,
    stats: { maxHp: 500, maxMp: 200, attack: 60, defense: 5, magic: 40, spirit: 5, agility: 40 },
    element: 'fire',
    weaknesses: [],
    resistances: [],
    skillIds: [],
    experienceReward: 0,
    goldReward: 0,
    drops: []
  };
}

function enemyDamageTaken(state: BattleState): number {
  return 99999 - renderView(state).enemies[0]!.hp;
}

describe('Phase 105 — Mimikry', () => {
  it('bietet ohne verschlungene Form keine Mimik-Elemente an', () => {
    const state = battle(rimuruLike());
    expect(availableMimicElements(state)).toEqual([]);
    const result = act(state, { type: 'mimic', element: 'fire' });
    expect(result.ok).toBe(false);
  });

  it('listet das Element einer verschlungenen Gegner-Art als Form', () => {
    const state = battle(rimuruLike());
    // Eine echte Feuer-Gegner-Art (ifrit) als verschlungen markieren.
    state.devouredSourceIds = ['ifrit'];
    expect(availableMimicElements(state)).toContain('fire');
  });

  it('lehnt Mimikry ohne Verschlinger ab', () => {
    const state = battle(rimuruLike(['slime-strike']));
    state.devouredSourceIds = ['ifrit'];
    const result = act(state, { type: 'mimic', element: 'fire' });
    expect(result.ok).toBe(false);
  });

  it('nimmt die Form an und zeigt sie im HUD', () => {
    const state = battle(rimuruLike());
    state.devouredSourceIds = ['ifrit'];
    expect(isPlayerTurn(state)).toBe(true);
    const result = act(state, { type: 'mimic', element: 'fire' });
    expect(result.ok).toBe(true);
    const view = renderView(state).party[0]!;
    expect(view.mimicElement).toBe('fire');
    expect(view.mimicTurns).toBeGreaterThan(0);
  });

  it('lässt den Grundangriff das angenommene Element treffen (Schwäche ausnutzen)', () => {
    // Ohne Form: neutraler Grundangriff (×1) …
    const plain = battle(rimuruLike());
    const plainEnemy = renderView(plain).enemies[0]!.id;
    act(plain, { type: 'attack', targetId: plainEnemy });
    const plainDamage = enemyDamageTaken(plain);

    // … mit Feuer-Form: Grundangriff trifft die Feuer-Schwäche (×1.75).
    const formed = battle(rimuruLike());
    formed.devouredSourceIds = ['ifrit'];
    act(formed, { type: 'mimic', element: 'fire' });
    const formedEnemy = renderView(formed).enemies[0]!.id;
    act(formed, { type: 'attack', targetId: formedEnemy });
    const formedDamage = enemyDamageTaken(formed);

    expect(formedDamage).toBeGreaterThan(plainDamage);
  });

  it('erbt defensiv das Resistenz-Profil der Form (Ifrit → Feuer-Absorption)', () => {
    const state = startBattle({ party: [rimuruLike()], enemies: [fireAttacker()], seed: 42 });
    state.devouredSourceIds = ['ifrit'];
    const rimuru = state.combatants.find((combatant) => combatant.side === 'party')!;
    const result = act(state, { type: 'mimic', element: 'fire' });
    expect(result.ok).toBe(true);
    // Ifrit absorbiert Feuer → die Form erbt genau das.
    expect(rimuru.mimicAbsorbs).toContain('fire');
    expect(rimuru.mimicNullifies).toEqual([]);
  });

  it('absorbiert in der Ifrit-Form gegnerisches Feuer statt Schaden zu nehmen', () => {
    const state = startBattle({ party: [rimuruLike()], enemies: [fireAttacker()], seed: 42 });
    state.devouredSourceIds = ['ifrit'];
    const rimuru = state.combatants.find((combatant) => combatant.side === 'party')!;
    rimuru.hp = 300;
    act(state, { type: 'mimic', element: 'fire' });
    const startHp = rimuru.hp;

    // Bis der Gegner (Feuer) zuschlägt — die Form ist dabei noch aktiv.
    let guard = 0;
    let enemyActed = false;
    while (!enemyActed && guard++ < 20) {
      if (isPlayerTurn(state)) {
        act(state, { type: 'guard' });
      } else {
        enemyTurn(state);
        enemyActed = true;
      }
    }
    expect(rimuru.mimicElement).toBe('fire'); // Form noch aktiv
    expect(rimuru.hp).toBeGreaterThanOrEqual(startHp); // Feuer absorbiert (heilt/kein Schaden)
  });

  it('entzieht das geerbte Profil, sobald die Form endet', () => {
    const state = startBattle({ party: [rimuruLike()], enemies: [fireAttacker()], seed: 42 });
    state.devouredSourceIds = ['ifrit'];
    const rimuru = state.combatants.find((combatant) => combatant.side === 'party')!;
    act(state, { type: 'mimic', element: 'fire' });
    let guard = 0;
    while (rimuru.mimicElement !== null && guard++ < 2000) {
      if (isPlayerTurn(state)) act(state, { type: 'guard' });
      else enemyTurn(state);
    }
    expect(rimuru.mimicAbsorbs).toEqual([]);
    expect(rimuru.mimicResistances).toEqual([]);
  });

  it('kehrt nach einigen eigenen Zügen in die Grundform zurück', () => {
    const state = battle(rimuruLike());
    state.devouredSourceIds = ['ifrit'];
    act(state, { type: 'mimic', element: 'fire' });
    expect(renderView(state).party[0]!.mimicElement).toBe('fire');

    let guard = 0;
    while (renderView(state).party[0]!.mimicElement !== null && guard++ < 2000) {
      if (isPlayerTurn(state)) {
        const actor = currentActor(state)!;
        act(state, { type: 'guard' });
        void actor;
      } else {
        enemyTurn(state);
      }
    }
    expect(renderView(state).party[0]!.mimicElement).toBeNull();
  });
});
