import { describe, expect, it } from 'vitest';
import {
  allHudRects,
  analyzeHudLayout,
  layoutOverworldHud,
  MIN_TOUCH_TARGET_PX
} from '../src/systems/mobileLayout';
import {
  analyzeEncounterBalance,
  analyzeOverworldBudget,
  analyzePhase15Balance,
  estimateOverworldBudget,
  runHeadlessActOnePlaythrough
} from './qaGates';

describe('phase 15 QA gates', () => {
  it('hält das mobile Overworld-HUD innerhalb sicherer Touch- und Layout-Grenzen', () => {
    for (const viewport of [
      { width: 960, height: 540 },
      { width: 390, height: 844 }
    ]) {
      const layout = layoutOverworldHud(viewport);

      expect(analyzeHudLayout(layout, viewport)).toEqual([]);
      expect(allHudRects(layout).every((rect) =>
        rect.width >= MIN_TOUCH_TARGET_PX && rect.height >= MIN_TOUCH_TARGET_PX
      )).toBe(true);
    }
  });

  it('bleibt im mobilen Overworld-Renderbudget', () => {
    const budget = estimateOverworldBudget({ width: 390, height: 844 });

    expect(analyzeOverworldBudget(budget)).toEqual([]);
    expect(budget.estimatedDisplayObjects).toBeLessThanOrEqual(700);
    expect(budget.hudInteractiveTargets).toBe(7);
  });

  it('meldet keine erweiterten Balance-Probleme', () => {
    expect(analyzePhase15Balance()).toEqual([]);
  });

  it('hält Encounter-Referenzen gültig und die ambiente Regionsschwierigkeit monoton steigend', () => {
    expect(analyzeEncounterBalance()).toEqual([]);
  });

  it('spielt Act 1 headless inkl. Dialogen, Kämpfen, Rewards und Save-Roundtrip durch', () => {
    const result = runHeadlessActOnePlaythrough(1501);

    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.completedQuestIds).toEqual(['binding-of-ancestors', 'first-patrol']);
    expect(result.battles.map((battle) => battle.encounterId)).toEqual([
      'training-clearing',
      'whispering-grove-ambush',
      'shrine-approach'
    ]);
    expect(result.battles.every((battle) => battle.status === 'won')).toBe(true);
    expect(Math.max(...result.battles.map((battle) => battle.steps))).toBeLessThan(900);
    expect(result.exportedBytes).toBeGreaterThan(500);
  });
});
