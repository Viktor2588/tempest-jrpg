import { describe, expect, it } from 'vitest';
import { runBalanceHarnessReport } from './qaGates';

const SEEDS = [1501, 1502, 1503, 1504, 1505] as const;
const STORY_ENCOUNTER_IDS = [
  'direwolf-pack-leader',
  'training-clearing',
  'whispering-grove-ambush',
  'shrine-approach',
  'marsh-frontier-clash',
  'border-rift-vanguard',
  'alliance-breach',
  'mordrahn-confrontation',
  'orc-vanguard',
  'geld-disaster-boss',
  'gabiru-duel',
  'masked-majin-ambush',
  'ifrit-boss'
] as const;

describe('Balance-Harness Report', () => {
  it('simuliert die Story-Trigger mit Carryover und erzwingt aktive Story-Korridore', () => {
    const report = runBalanceHarnessReport(SEEDS);

    expect(report.hardAssertionsEnabled).toBe(true);
    expect(report.benchmarkAssertionsEnabled).toBe(false);
    expect(report.seeds).toEqual([...SEEDS]);
    expect(report.storyEncounterIds).toEqual([...STORY_ENCOUNTER_IDS]);
    expect(report.issues).toEqual([]);
    expect(report.storyRoute).toHaveLength(STORY_ENCOUNTER_IDS.length);
    expect(report.storyRoute.every((encounter) => encounter.runs.length === SEEDS.length)).toBe(true);
    expect(report.storyRoute.every((encounter) => encounter.runs.every((run) => run.status === 'won'))).toBe(true);
    expect(report.storyRoute.every((encounter) => encounter.currentlyInsideTargetCorridor)).toBe(true);

    // Phase 55 — Anti-Grind: der grindfreie Hauptpfad (nur Pflichtkaempfe, kein
    // optionales Farmen) erreicht die Ziellevel — ≈L9–10 vor Mordrahn, ≈L13 vor
    // Geld/Ifrit. Damit ist Leveln spuerbar und Grind nicht mehr noetig.
    const levelBefore = (encounterId: string): number =>
      report.storyRoute.find((encounter) => encounter.encounterId === encounterId)?.averagePartyLevelBefore ?? 0;
    expect(levelBefore('mordrahn-confrontation')).toBeGreaterThanOrEqual(8.5);
    expect(levelBefore('geld-disaster-boss')).toBeGreaterThanOrEqual(11);
    expect(levelBefore('ifrit-boss')).toBeGreaterThanOrEqual(12.5);

    expect(report.storyRoute.find((encounter) => encounter.encounterId === 'geld-disaster-boss')?.category).toBe('boss');
    expect(report.storyRoute.find((encounter) => encounter.encounterId === 'training-clearing')?.targetCorridor.turns).toEqual({ min: 4, max: 15 });
    expect(report.storyRoute.find((encounter) => encounter.encounterId === 'geld-disaster-boss')?.targetCorridor.turns).toEqual({ min: 6, max: 23 });

    const bossIds = STORY_ENCOUNTER_IDS.filter((encounterId) => (
      report.storyRoute.find((encounter) => encounter.encounterId === encounterId)?.category === 'boss'
    ));
    expect(report.bossBenchmarks).toHaveLength(bossIds.length * 4);
    expect(report.bossBenchmarks.every((benchmark) => benchmark.runs.length === SEEDS.length)).toBe(true);

    // Phase 67 — Overgrind-Szenarien: Party 4/8 Level über Ziel, Gegner wachsen mit.
    const overleveled = report.bossBenchmarks.filter((benchmark) =>
      benchmark.mode === 'overleveled-4' || benchmark.mode === 'overleveled-8'
    );
    expect(overleveled).toHaveLength(bossIds.length * 2);
    expect(overleveled.every((benchmark) => benchmark.partyLevel > benchmark.enemyTargetLevel)).toBe(true);
    expect(overleveled.every((benchmark) => benchmark.enemyScaledLevel > benchmark.enemyTargetLevel)).toBe(true);
    expect(overleveled.every((benchmark) => benchmark.targetCorridor !== undefined)).toBe(true);
    // Ziellevel-/Unterlevel-Benchmarks bleiben auf Basiswerten (kein Downscaling).
    expect(report.bossBenchmarks
      .filter((benchmark) => benchmark.mode === 'target-level' || benchmark.mode === 'underleveled')
      .every((benchmark) => benchmark.enemyScaledLevel >= benchmark.enemyTargetLevel)
    ).toBe(true);
    expect(report.bossBenchmarks.some((benchmark) =>
      benchmark.encounterId === 'geld-disaster-boss'
      && benchmark.mode === 'target-level'
      && !benchmark.currentlyInsideTargetCorridor
    )).toBe(true);
    expect(report.bossBenchmarks.some((benchmark) =>
      benchmark.encounterId === 'mordrahn-confrontation' && benchmark.mode === 'underleveled'
    )).toBe(true);

    expect(runBalanceHarnessReport(SEEDS)).toEqual(report);
  });
});
