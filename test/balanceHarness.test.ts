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
  it('simuliert die Story-Trigger mit Carryover und reportet Korridore ohne harte Balance-Assertions', () => {
    const report = runBalanceHarnessReport(SEEDS);

    expect(report.hardAssertionsEnabled).toBe(false);
    expect(report.seeds).toEqual([...SEEDS]);
    expect(report.storyEncounterIds).toEqual([...STORY_ENCOUNTER_IDS]);
    expect(report.issues).toEqual([]);
    expect(report.storyRoute).toHaveLength(STORY_ENCOUNTER_IDS.length);
    expect(report.storyRoute.every((encounter) => encounter.runs.length === SEEDS.length)).toBe(true);
    expect(report.storyRoute.every((encounter) => encounter.runs.every((run) => run.status === 'won'))).toBe(true);
    expect(report.storyRoute.find((encounter) => encounter.encounterId === 'geld-disaster-boss')?.category).toBe('boss');
    expect(report.storyRoute.find((encounter) => encounter.encounterId === 'training-clearing')?.targetCorridor.turns).toEqual({ min: 4, max: 7 });

    const bossIds = STORY_ENCOUNTER_IDS.filter((encounterId) => (
      report.storyRoute.find((encounter) => encounter.encounterId === encounterId)?.category === 'boss'
    ));
    expect(report.bossBenchmarks).toHaveLength(bossIds.length * 2);
    expect(report.bossBenchmarks.every((benchmark) => benchmark.runs.length === SEEDS.length)).toBe(true);
    expect(report.bossBenchmarks.some((benchmark) =>
      benchmark.encounterId === 'mordrahn-confrontation' && benchmark.mode === 'underleveled'
    )).toBe(true);

    expect(runBalanceHarnessReport(SEEDS)).toEqual(report);
  });
});
