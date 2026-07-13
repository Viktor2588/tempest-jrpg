import { describe, expect, it } from 'vitest';
import {
  act,
  currentActor,
  enemyTurn,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';
import { SKILLS } from '../src/data/skills';
import { ENEMIES } from '../src/data/enemies';

// Phase 181 — Feindliche Elementarfelder: der Magiekoloss beherrscht den Boden.
// Weckt die zuvor rein spielerseitige Feld-/Fusions-Maschinerie auch fuer Gegner.

function hero(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'hero',
    name: 'Held',
    side: 'party',
    level: 12,
    stats: { maxHp: 5000, maxMp: 200, attack: 60, defense: 20, magic: 60, spirit: 20, agility: 80 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: ['tide-lance'],
    ...overrides
  };
}

function foe(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'foe',
    name: 'Koloss',
    side: 'enemy',
    level: 18,
    stats: { maxHp: 4000, maxMp: 80, attack: 60, defense: 10, magic: 30, spirit: 10, agility: 1 },
    element: 'earth',
    weaknesses: ['water'],
    resistances: [],
    skillIds: ['terrastorm-field', 'ogre-smash'],
    experienceReward: 0,
    goldReward: 0,
    drops: [],
    ...overrides
  };
}

function enemyHp(state: BattleState): number {
  return renderView(state).enemies[0]!.hp;
}

// Treibt echte Zuege (Held blockt, Gegner handelt per KI), bis der Gegner selbst ein
// Feld geladen hat — beweist, dass ein Gegner die Feld-Maschinerie im normalen Spiel weckt.
function driveUntilEnemyChargesField(state: BattleState, maxSteps = 40): boolean {
  for (let i = 0; i < maxSteps; i += 1) {
    if (state.status !== 'active') {
      break;
    }
    const actor = currentActor(state);
    if (!actor) {
      break;
    }
    if (actor.side === 'party') {
      act(state, { type: 'guard' });
    } else {
      enemyTurn(state);
    }
    if (state.field) {
      return true;
    }
  }
  return state.field !== null;
}

describe('Phase 181 — Daten', () => {
  it('Erdwall-Feld ist ein erd-elementiger chargesField-Skill', () => {
    const skill = SKILLS.find((candidate) => candidate.id === 'terrastorm-field')!;
    expect(skill).toBeDefined();
    expect(skill.chargesField).toBe(true);
    expect(skill.element).toBe('earth');
    expect(skill.power).toBe(0);
  });

  it('der Magiekoloss traegt das Feld in seiner Phase-2-Rotation', () => {
    const colossus = ENEMIES.find((enemy) => enemy.id === 'magic-colossus')!;
    expect(colossus.phase2SkillIds).toContain('terrastorm-field');
  });
});

describe('Phase 181 — ein Gegner kann ein Elementarfeld laden', () => {
  it('laedt im normalen Spiel per KI ein Erdfeld (Erdwall-Feld)', () => {
    // Gegner-Kit ausschliesslich das Feld-Skill → die KI weckt die zuvor rein
    // spielerseitige chargeField-Maschinerie auch fuer Gegner.
    const state = startBattle({
      party: [hero()],
      enemies: [foe({
        stats: { maxHp: 9000, maxMp: 400, attack: 30, defense: 40, magic: 20, spirit: 30, agility: 60 },
        skillIds: ['terrastorm-field']
      })],
      seed: 7
    });
    expect(state.field).toBeNull();
    expect(driveUntilEnemyChargesField(state)).toBe(true);
    expect(state.field?.element).toBe('earth');
  });
});

describe('Phase 181 — der Spieler kontert das feindliche Feld', () => {
  it('ein Fremd-Element-Treffer entlaedt eine Reaktion auf den Gegner und raeumt das Feld', () => {
    const state = startBattle({ party: [hero()], enemies: [foe()], seed: 4 });
    const enemyId = renderView(state).enemies[0]!.id;
    expect(state.activeId).toBe(renderView(state).party[0]!.id); // Held (hohe Agilitaet) zuerst
    // Simuliert ein bereits vom Gegner geladenes Erdfeld.
    state.field = { element: 'earth', turns: 3 };
    const before = enemyHp(state);
    const result = act(state, { type: 'skill', skillId: 'tide-lance', targetId: enemyId });
    expect(result.ok).toBe(true);
    expect(enemyHp(state)).toBeLessThan(before); // Wasser trifft die Schwaeche + Reaktion
    expect(state.field).toBeNull(); // die Fusions-Reaktion verbraucht das Feld
  });
});
