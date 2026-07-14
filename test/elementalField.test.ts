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

// Phase 94 — Elementarfelder: Erzeugung, Verstärkung, Fusions-Reaktion und Abklingen.
// Aufbau: ein schneller Feld-Kämpfer (handelt zuerst) gegen einen langsamen, extrem
// zähen Dummy, damit die Kämpfe nicht enden und das Feld beobachtbar bleibt.

function fieldHero(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'field-hero',
    name: 'Feldkämpfer',
    side: 'party',
    level: 10,
    stats: { maxHp: 600, maxMp: 200, attack: 40, defense: 20, magic: 40, spirit: 20, agility: 60 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: ['ember-field', 'gale-field', 'tide-field', 'black-flame', 'storm-gust', 'water-jet'],
    ...overrides
  };
}

function dummyEnemy(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'dummy',
    name: 'Prügelpuppe',
    side: 'enemy',
    level: 1,
    stats: { maxHp: 99999, maxMp: 0, attack: 1, defense: 5, magic: 1, spirit: 5, agility: 1 },
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

function newBattle(hero: BattleUnitInput, enemy: BattleUnitInput, seed = 4242): BattleState {
  return startBattle({ party: [hero], enemies: [enemy], seed });
}

function enemyHp(state: BattleState): number {
  return renderView(state).enemies[0]!.hp;
}

describe('Phase 94 — Elementarfeld', () => {
  it('startet ohne Feld', () => {
    const state = newBattle(fieldHero(), dummyEnemy());
    expect(state.field).toBeNull();
    expect(renderView(state).field).toBeNull();
  });

  it('lädt das Schlachtfeld über eine chargesField-Fähigkeit auf und zeigt es im HUD', () => {
    const state = newBattle(fieldHero(), dummyEnemy());
    expect(isPlayerTurn(state)).toBe(true);
    const result = act(state, { type: 'skill', skillId: 'ember-field' });
    expect(result.ok).toBe(true);
    expect(state.field).not.toBeNull();
    expect(state.field?.element).toBe('fire');
    const view = renderView(state);
    expect(view.field?.element).toBe('fire');
    expect(view.field?.turns).toBeGreaterThan(0);
  });

  it('verstärkt gleichelementige Treffer auf dem geladenen Feld', () => {
    // Gleicher Seed → gleiche rng-Sequenz bis zum Treffer (das Aufladen selbst rollt nichts).
    const withField = newBattle(fieldHero(), dummyEnemy());
    act(withField, { type: 'skill', skillId: 'ember-field' });
    const enemyId = renderView(withField).enemies[0]!.id;
    act(withField, { type: 'skill', skillId: 'black-flame', targetId: enemyId });
    const amplified = 99999 - enemyHp(withField);

    const noField = newBattle(fieldHero(), dummyEnemy());
    const plainId = renderView(noField).enemies[0]!.id;
    act(noField, { type: 'skill', skillId: 'black-flame', targetId: plainId });
    const plain = 99999 - enemyHp(noField);

    expect(amplified).toBeGreaterThan(plain);
    expect(amplified).toBeGreaterThanOrEqual(Math.floor(plain * 1.2));
  });

  it('löst mit einem Fusions-Partner-Element eine Reaktion aus und verbraucht das Feld', () => {
    const state = newBattle(fieldHero(), dummyEnemy());
    // Feuerfeld laden …
    act(state, { type: 'skill', skillId: 'ember-field' });
    expect(state.field?.element).toBe('fire');
    // … dann mit Wind treffen (Feuer + Wind = Feuersturm → weaken).
    const enemyId = renderView(state).enemies[0]!.id;
    act(state, { type: 'skill', skillId: 'storm-gust', targetId: enemyId });
    const enemyView = renderView(state).enemies[0]!;
    expect(enemyView.statuses.map((s) => s.id)).toContain('weaken');
    // Die Reaktion verbraucht das Feld.
    expect(state.field).toBeNull();
  });

  it('löst bei gleichem Element eine Verstärkung statt einer Reaktion aus', () => {
    // Wasserfeld + Wassertreffer = Verstärkung (kein Fusions-Status). Ein Reaktions-
    // Verbrauch würde das Feld sofort auf null setzen und einen Status setzen; hier nicht.
    const state = newBattle(fieldHero(), dummyEnemy({ stats: { maxHp: 99999, maxMp: 0, attack: 1, defense: 5, magic: 1, spirit: 5, agility: 55 } }));
    act(state, { type: 'skill', skillId: 'tide-field' });
    expect(state.field?.element).toBe('water');
    const enemyId = renderView(state).enemies[0]!.id;
    act(state, { type: 'skill', skillId: 'water-jet', targetId: enemyId });
    // Kein Fusions-Status (Reaktion) — gleiches Element verstärkt nur.
    expect(renderView(state).enemies[0]!.statuses.map((s) => s.id)).not.toContain('weaken');
    // Falls das Feld noch steht, ist es unverändert Wasser (nicht durch eine Reaktion ersetzt).
    if (state.field) {
      expect(state.field.element).toBe('water');
    }
  });

  it('klingt über die Runden ab und verweht', () => {
    const state = newBattle(fieldHero(), dummyEnemy());
    act(state, { type: 'skill', skillId: 'gale-field' });
    const initialTurns = state.field!.turns;
    expect(initialTurns).toBeGreaterThan(0);

    const turnsByRound: number[] = [];
    let startRound = state.round;
    let guard = 0;
    // Beide Seiten handeln passiv (Guard/leichter Angriff), bis das Feld verweht ist.
    while (state.field !== null && guard++ < 2000) {
      if (isPlayerTurn(state)) {
        const actor = currentActor(state)!;
        act(state, { type: 'guard' });
        void actor;
      } else {
        enemyTurn(state);
      }
      if (state.round > startRound) {
        startRound = state.round;
        turnsByRound.push(state.field ? state.field.turns : 0);
      }
    }

    expect(state.field).toBeNull();
    // Monoton fallend über die Runden (nie ansteigend).
    for (let i = 1; i < turnsByRound.length; i += 1) {
      expect(turnsByRound[i]!).toBeLessThanOrEqual(turnsByRound[i - 1]!);
    }
  });
});

// Phase 207 — das Eröffnungsfeld ist im Kampf-Log lesbar (Uhr→Feld-Kausalität).
describe('Eröffnungsfeld: lesbare Log-Zeile', () => {
  it('ein geladenes Eröffnungsfeld schreibt genau eine Feld-Log-Zeile', () => {
    const state = startBattle({
      party: [fieldHero()],
      enemies: [dummyEnemy()],
      openingField: 'fire',
      seed: 7
    });
    const fieldLines = state.log.filter((line) => line.includes('liegt über dem Schlachtfeld'));
    expect(fieldLines).toHaveLength(1);
    expect(fieldLines[0]).toBe('Ein Feuerfeld liegt über dem Schlachtfeld.');
  });

  it('holy/shadow/water bekommen die passende Feld-Bezeichnung', () => {
    for (const [element, label] of [
      ['holy', 'Heilig'],
      ['shadow', 'Schatten'],
      ['water', 'Wasser']
    ] as const) {
      const state = startBattle({
        party: [fieldHero()],
        enemies: [dummyEnemy()],
        openingField: element,
        seed: 7
      });
      expect(state.log).toContain(`Ein ${label}feld liegt über dem Schlachtfeld.`);
    }
  });

  it('ohne Eröffnungsfeld (neutral/keins) erscheint keine Feld-Log-Zeile', () => {
    for (const opening of [undefined, null, 'neutral'] as const) {
      const state = startBattle({
        party: [fieldHero()],
        enemies: [dummyEnemy()],
        openingField: opening,
        seed: 7
      });
      expect(state.log.some((line) => line.includes('liegt über dem Schlachtfeld'))).toBe(false);
    }
  });
});
