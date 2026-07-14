import { describe, expect, it } from 'vitest';
import { startBattle } from '../src/systems/battle';

// Phase 123 — Bestiarium-Wissen im Kampf: bereits studierte Nicht-Boss-Gegner starten
// mit aufgedeckten Schwächen (analysisLevel 1); Bosse und nie studierte Arten bleiben
// unbekannt (analysisLevel 0).
describe('Phase 123 — Bestiarium-Wissen bootstrappt Analyse im Kampf', () => {
  const enemyOf = (state: ReturnType<typeof startBattle>, sourceId: string) =>
    state.combatants.find((combatant) => combatant.side === 'enemy' && combatant.sourceId === sourceId)!;

  it('deckt bekannte Nicht-Boss-Gegner auf und lässt unbekannte unberührt', () => {
    const state = startBattle({
      enemyIds: ['forest-slime', 'spore-moth'],
      analyzedEnemyIds: ['forest-slime'],
      seed: 11
    });
    const known = enemyOf(state, 'forest-slime');
    const unknown = enemyOf(state, 'spore-moth');

    expect(known.analysisLevel).toBe(1);
    expect(known.telegraphSkillId).not.toBeNull();
    expect(unknown.analysisLevel).toBe(0);
  });

  it('lässt Bosse trotz Studiums unbekannt (Entscheidungstiefe bleibt)', () => {
    const state = startBattle({
      enemyIds: ['ifrit'],
      analyzedEnemyIds: ['ifrit'],
      seed: 11
    });
    expect(enemyOf(state, 'ifrit').boss).toBe(true);
    expect(enemyOf(state, 'ifrit').analysisLevel).toBe(0);
  });

  it('ohne Vorwissen bleibt alles unbekannt (unverändertes Verhalten)', () => {
    const state = startBattle({ enemyIds: ['forest-slime'], seed: 11 });
    expect(enemyOf(state, 'forest-slime').analysisLevel).toBe(0);
  });
});
