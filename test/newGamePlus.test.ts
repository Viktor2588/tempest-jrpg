import { describe, expect, it } from 'vitest';
import {
  createNewSave,
  exportSave,
  importSave,
  migrate,
  startNewGamePlus,
  type SaveGameV3
} from '../src/systems/save';
import { effectiveEnemyLevel, createScaledEnemyBattleUnits } from '../src/systems/enemyScaling';

// Phase 283 — Post-Game / New Game+: der Save trägt jetzt einen NG+-Zyklus, der die
// Gegner-Skalierung eskaliert, damit ein hochstufiges Team im Replay nicht trivialisiert.
describe('Phase 283 — NG+-Zyklus (Save-Feld + Migration)', () => {
  it('Erstdurchgang startet bei Zyklus 0', () => {
    expect(createNewSave().progression.newGamePlusCycle).toBe(0);
  });

  it('erhält den Zyklus über einen Export/Import-Roundtrip', () => {
    const save: SaveGameV3 = {
      ...createNewSave(),
      progression: { ...createNewSave().progression, newGamePlusCycle: 3 }
    };
    expect(importSave(exportSave(save)).progression.newGamePlusCycle).toBe(3);
  });

  it('migriert alte Stände ohne das Feld auf 0', () => {
    const migrated = migrate({ schemaVersion: 1, seed: 1 }, '2026-07-23T10:00:00.000Z');
    expect(migrated.progression.newGamePlusCycle).toBe(0);
  });

  it('startNewGamePlus erhöht den Zyklus bei jedem Durchgang', () => {
    const first = startNewGamePlus(createNewSave(), '2026-07-23T00:00:00.000Z');
    expect(first.progression.newGamePlusCycle).toBe(1);
    const second = startNewGamePlus(first, '2026-07-23T01:00:00.000Z');
    expect(second.progression.newGamePlusCycle).toBe(2);
  });
});

describe('Phase 283 — NG+-Zyklus eskaliert die Gegner-Skalierung', () => {
  it('hebt Ziel und Deckel je Zyklus, ohne Zyklus 0 zu verändern', () => {
    // Zyklus 0 = unverändertes Verhalten (Regression gegen bestehende Balance).
    expect(effectiveEnemyLevel(10, 40, 'random')).toBe(effectiveEnemyLevel(10, 40, 'random', 0));
    // Der Deckel base+8 (random) steigt je Zyklus um 5.
    expect(effectiveEnemyLevel(10, 40, 'random', 0)).toBe(18);
    expect(effectiveEnemyLevel(10, 40, 'random', 1)).toBe(23);
    expect(effectiveEnemyLevel(10, 40, 'random', 2)).toBe(28);
  });

  it('bleibt nie unter dem Basislevel und skaliert die Gegner-Stats hoch', () => {
    const base = createScaledEnemyBattleUnits(['forest-slime'], 6, 'random', 0)[0];
    const ngPlus = createScaledEnemyBattleUnits(['forest-slime'], 6, 'random', 2)[0];
    expect(ngPlus.level).toBeGreaterThanOrEqual(base.level);
    expect(ngPlus.stats.maxHp).toBeGreaterThan(base.stats.maxHp);
    expect(ngPlus.stats.attack).toBeGreaterThan(base.stats.attack);
  });
});
