import { describe, expect, it } from 'vitest';
import { startBattle, act, type BattleUnitInput } from '../src/systems/battle';
import { fieldReactionElements, renderView } from '../src/systems/battleView';
import type { ElementType } from '../src/data';

// Phase 182 — Feld-Reaktion lesbar: die Fusions-Reaktions-Hinweise werden aus der
// Fusionstabelle abgeleitet und in die Battle-View gefaltet.

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
    skillIds: ['ember-field'],
    ...overrides
  };
}

function foe(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'foe',
    name: 'Ziel',
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

describe('Phase 182 — fieldReactionElements', () => {
  it('leitet fuer ein Erdfeld die reagierenden Fremd-Elemente ab (ohne sich selbst)', () => {
    const reactions = fieldReactionElements('earth');
    expect(reactions).not.toContain('earth'); // gleiches Element = Verstaerkung, keine Reaktion
    expect(reactions).not.toContain('neutral');
    expect(reactions).toContain('water');
    expect(reactions).toContain('wind');
  });

  it('gibt fuer ein neutrales Feld keine Reaktionen zurueck', () => {
    expect(fieldReactionElements('neutral')).toEqual([]);
  });

  it('schliesst immer das Feld-Element selbst aus', () => {
    const elements: readonly ElementType[] = ['water', 'wind', 'fire', 'earth', 'shadow', 'holy'];
    for (const element of elements) {
      expect(fieldReactionElements(element)).not.toContain(element);
    }
  });
});

describe('Phase 182 — Battle-View traegt den Reaktions-Hinweis', () => {
  it('ist leer, solange kein Feld geladen ist', () => {
    const state = startBattle({ party: [hero()], enemies: [foe()], seed: 3 });
    expect(state.field).toBeNull();
    expect(renderView(state).fieldReactions).toEqual([]);
  });

  it('spiegelt die Reaktionen des geladenen Feldes wider', () => {
    const state = startBattle({ party: [hero()], enemies: [foe()], seed: 3 });
    // Der Held laedt per Glutfeld ein Feuerfeld (chargesField, target self).
    act(state, { type: 'skill', skillId: 'ember-field' });
    expect(state.field?.element).toBe('fire');
    const view = renderView(state);
    expect(view.fieldReactions).toEqual(fieldReactionElements('fire'));
    expect(view.fieldReactions).not.toContain('fire');
    expect(view.fieldReactions.length).toBeGreaterThan(0);
  });
});
