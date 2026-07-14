import { describe, expect, it } from 'vitest';
import {
  act,
  currentActor,
  isPlayerTurn,
  isStealableSkillId,
  renderView,
  startBattle,
  stealableSkillFrom,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';

// Phase 112 — Praedator-Perversion: Rimuru reißt einem analysierten, nicht-seelen-
// gebundenen Gegner (kein Boss) EINE Fertigkeit heraus, ohne ihn zu töten. Temporär im
// Kampf, dauerhaft bei Sieg (über die bestehende mimicSkillIds-Bankung).

function rimuru(skillIds: readonly string[] = ['predator', 'great-sage', 'slime-strike']): BattleUnitInput {
  return {
    sourceId: 'rimuru',
    name: 'Rimuru',
    side: 'party',
    level: 12,
    stats: { maxHp: 600, maxMp: 200, attack: 60, defense: 20, magic: 40, spirit: 20, agility: 80 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: [...skillIds]
  };
}

function foe(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'venom-lizard',
    name: 'Giftechse',
    side: 'enemy',
    level: 3,
    stats: { maxHp: 99999, maxMp: 30, attack: 1, defense: 5, magic: 1, spirit: 5, agility: 1 },
    element: 'earth',
    weaknesses: [],
    resistances: [],
    skillIds: ['venom-spit'],
    devourable: true,
    devourSkillId: 'venom-spit',
    experienceReward: 0,
    goldReward: 0,
    drops: [],
    ...overrides
  };
}

function battle(
  hero: BattleUnitInput,
  enemy: BattleUnitInput = foe(),
  flags: Readonly<Record<string, boolean>> = { 'story.shizu.vow': true }
): BattleState {
  return startBattle({ party: [hero], enemies: [enemy], flags, seed: 4242 });
}

function enemyId(state: BattleState): string {
  return renderView(state).enemies[0]!.id;
}

// Analysiert markieren, ohne den Analyse-Zug choreografieren zu müssen (analog dazu, wie
// die Mimik-Tests devouredSourceIds direkt setzen).
function markAnalyzed(state: BattleState): void {
  const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
  enemy.analysisLevel = 1;
}

describe('Phase 112 — Raub-Regeln (rein)', () => {
  it('nicht-Ultimate-Fertigkeiten sind raubbar, Ultimate nicht', () => {
    expect(isStealableSkillId('venom-spit')).toBe(true); // tier: skill
    expect(isStealableSkillId('great-sage')).toBe(false); // Unique-Verb, nicht raubbar
    expect(isStealableSkillId('drago-nova')).toBe(false); // tier: ultimate-skill
    expect(isStealableSkillId('gibt-es-nicht')).toBe(false);
  });

  it('wählt die erste unbekannte raubbare Fertigkeit', () => {
    expect(stealableSkillFrom({
      boss: false,
      devourable: true,
      devourSkillId: 'venom-spit',
      predatorStealSkillId: null,
      soulboundSkillIds: []
    }, [])).toBe('venom-spit');
    // Bereits bekannt → übersprungen.
    expect(stealableSkillFrom({
      boss: false,
      devourable: true,
      devourSkillId: 'venom-spit',
      predatorStealSkillId: null,
      soulboundSkillIds: []
    }, ['venom-spit'])).toBeNull();
    // Nur Ultimate → nichts raubbar.
    expect(stealableSkillFrom({
      boss: false,
      devourable: true,
      devourSkillId: 'drago-nova',
      predatorStealSkillId: null,
      soulboundSkillIds: []
    }, [])).toBeNull();
  });

  it('von Bossen (seelengebunden) lässt sich nichts rauben', () => {
    expect(stealableSkillFrom({
      boss: true,
      devourable: true,
      devourSkillId: 'venom-spit',
      predatorStealSkillId: null,
      soulboundSkillIds: []
    }, [])).toBeNull();
  });
});

describe('Phase 112 — Rauben im Kampf', () => {
  it('raubt eine Fertigkeit, ohne das Ziel zu töten', () => {
    const state = battle(rimuru());
    expect(isPlayerTurn(state)).toBe(true);
    markAnalyzed(state);

    const result = act(state, { type: 'steal', targetId: enemyId(state) });
    expect(result.ok).toBe(true);

    const actor = state.combatants.find((c) => c.sourceId === 'rimuru')!;
    expect(actor.skillIds).toContain('venom-spit');
    expect(actor.mimicSkillIds).toContain('venom-spit'); // wird bei Sieg gebankt
    const enemy = state.combatants.find((c) => c.side === 'enemy')!;
    expect(enemy.dead).toBe(false);
  });

  it('lehnt Rauben ohne vorherige Analyse ab', () => {
    const state = battle(rimuru());
    const result = act(state, { type: 'steal', targetId: enemyId(state) });
    expect(result.ok).toBe(false);
  });

  it('lehnt Rauben ohne Verschlinger ab', () => {
    const state = battle(rimuru(['slime-strike']));
    markAnalyzed(state);
    const result = act(state, { type: 'steal', targetId: enemyId(state) });
    expect(result.ok).toBe(false);
  });

  it('lehnt Rauben ohne Großen Weisen ab', () => {
    const state = battle(rimuru(['predator', 'slime-strike']));
    markAnalyzed(state);
    const result = act(state, { type: 'steal', targetId: enemyId(state) });
    expect(result.ok).toBe(false);
  });

  it('lehnt Rauben vor Shizus Schwur ab', () => {
    const state = battle(rimuru(), foe(), {});
    markAnalyzed(state);
    const result = act(state, { type: 'steal', targetId: enemyId(state) });
    expect(result.ok).toBe(false);
  });

  it('lehnt Rauben von einem Boss ab', () => {
    const state = battle(rimuru(), foe({ boss: true }));
    markAnalyzed(state);
    const result = act(state, { type: 'steal', targetId: enemyId(state) });
    expect(result.ok).toBe(false);
  });

  it('lässt sich ein Ziel nicht zweimal berauben', () => {
    const state = battle(rimuru(), foe({ skillIds: ['venom-spit', 'battle-cry'] }));
    markAnalyzed(state);
    expect(act(state, { type: 'steal', targetId: enemyId(state) }).ok).toBe(true);

    // zurück zum Spielerzug bringen: der Gegner ist extrem langsam.
    let guard = 0;
    while (!isPlayerTurn(state) && guard++ < 50) {
      const actor = currentActor(state);
      if (actor && actor.side === 'enemy') act(state, { type: 'guard' });
      else break;
    }
    const second = act(state, { type: 'steal', targetId: enemyId(state) });
    expect(second.ok).toBe(false);
  });
});
