import { describe, expect, it } from 'vitest';
import { runBalanceHarnessReport, type RimuruSpecBranch } from './qaGates';
import { ENCOUNTERS } from '../src/data/world';
import { ENEMIES } from '../src/data/enemies';
import type { EnemyDefinition } from '../src/data/types';

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
    expect(report.benchmarkAssertionsEnabled).toBe(true);
    expect(report.seeds).toEqual([...SEEDS]);
    expect(report.rimuruSpecBranch).toBe('predator');
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
    expect(report.storyRoute.find((encounter) => encounter.encounterId === 'training-clearing')?.targetCorridor.turns).toEqual({ min: 2, max: 15 });
    expect(report.storyRoute.find((encounter) => encounter.encounterId === 'geld-disaster-boss')?.targetCorridor.turns).toEqual({ min: 6, max: 23 });

    const bossIds = STORY_ENCOUNTER_IDS.filter((encounterId) => (
      report.storyRoute.find((encounter) => encounter.encounterId === encounterId)?.category === 'boss'
    ));
    expect(report.bossBenchmarks).toHaveLength(bossIds.length * 4);
    expect(report.bossBenchmarks.every((benchmark) => benchmark.runs.length === SEEDS.length)).toBe(true);
    expect(report.benchmarkGuards).toHaveLength(6);
    for (const guard of report.benchmarkGuards) {
      const benchmark = report.bossBenchmarks.find((candidate) =>
        candidate.encounterId === guard.encounterId && candidate.mode === guard.mode
      );
      expect(benchmark?.averageTurns).toBeGreaterThanOrEqual(guard.minimumAverageTurns);
    }

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

  it('hält jeden Rimuru-Spec-Pfad in allen Story-Korridoren und unterscheidet die Profile', () => {
    const branches: readonly RimuruSpecBranch[] = ['predator', 'sage', 'mimic'];
    const entryNode: Readonly<Record<RimuruSpecBranch, string>> = {
      predator: 'rimuru-fluid-core',
      sage: 'rimuru-ancestor-binding',
      mimic: 'rimuru-marsh-runner'
    };
    const reports = branches.map((branch) => runBalanceHarnessReport(SEEDS, branch));

    for (const report of reports) {
      expect(report.issues, report.rimuruSpecBranch).toEqual([]);
      expect(report.storyRoute.every((encounter) => encounter.currentlyInsideTargetCorridor)).toBe(true);
      expect(report.storyRoute.at(-1)!.runs.every((run) =>
        run.unlockedRimuruNodeIdsAfter.includes(entryNode[report.rimuruSpecBranch])
      )).toBe(true);
    }

    // Phase 274 — Die drei tragenden Story-Bosse müssen mit realem Carryover spürbar
    // bleiben, ohne den grindfreien Pfad aus seinem Gewinn-Korridor zu drücken.
    const marqueeGuardrails = {
      'mordrahn-confrontation': { minimumTurns: 10, maximumRemainingHp: 0.5 },
      'geld-disaster-boss': { minimumTurns: 16, maximumRemainingHp: 0.7 },
      'ifrit-boss': { minimumTurns: 8, maximumRemainingHp: 0.4 }
    } as const;
    for (const report of reports) {
      for (const [encounterId, guardrail] of Object.entries(marqueeGuardrails)) {
        const encounter = report.storyRoute.find((candidate) => candidate.encounterId === encounterId);
        expect(encounter?.averageTurns).toBeGreaterThanOrEqual(guardrail.minimumTurns);
        expect(encounter?.averageRemainingPartyHpFraction).toBeLessThanOrEqual(guardrail.maximumRemainingHp);
      }
    }

    const profiles = reports.map((report) => report.storyRoute.slice(-5).map((encounter) => [
      encounter.averageTurns,
      encounter.averageRemainingPartyHpFraction
    ]));
    expect(new Set(profiles.map((profile) => JSON.stringify(profile))).size).toBe(3);
  });

  it('Phase 88c — build-relevante Kategorie-Mechanik liegt auf dem Pflichtpfad (Korridor-Risiko)', () => {
    // Bis Phase 88c standen resistsCategory/reflectsCategory/rally-cry nur off-route
    // (Nebenquests/optionale Trigger) — der Hauptpfad ließ sich ohne Kategorie-Wahl
    // durchspielen. Mindestens ein Pflichtkampf muss die Mechanik jetzt erzwingen.
    const categoryEnemyIds = new Set(
      (ENEMIES as readonly EnemyDefinition[])
        .filter((enemy) => enemy.resistsCategory || enemy.reflectsCategory)
        .map((enemy) => enemy.id)
    );
    const onRouteCategoryEncounters = STORY_ENCOUNTER_IDS.filter((encounterId) => {
      const encounter = ENCOUNTERS.find((candidate) => candidate.id === encounterId);
      return encounter?.enemyIds.some((enemyId) => categoryEnemyIds.has(enemyId)) ?? false;
    });
    expect(onRouteCategoryEncounters.length).toBeGreaterThan(0);

    // Konkret verankert: das Streunende Echo (resistsCategory 'magical') steht im
    // Pflichtkampf 'marsh-frontier-clash' und zwingt so zu physischem Schaden.
    const marsh = ENCOUNTERS.find((candidate) => candidate.id === 'marsh-frontier-clash');
    expect(marsh?.enemyIds).toContain('stray-echo');
  });

  it('Phase 88d — der Physisch-Resistenz-Zweig liegt jetzt ebenfalls ON-ROUTE (zwingt Magie)', () => {
    // Gegenstück zum Streunenden Echo: der Sumpfschrecken (resistsCategory 'physical')
    // steht im Pflichtkampf 'border-rift-vanguard' und zwingt so magischen Schaden.
    const bogTerror = (ENEMIES as readonly EnemyDefinition[]).find((enemy) => enemy.id === 'bog-terror');
    expect(bogTerror?.resistsCategory).toBe('physical');
    const borderRift = ENCOUNTERS.find((candidate) => candidate.id === 'border-rift-vanguard');
    expect(borderRift?.enemyIds).toContain('bog-terror');

    // Beide Schadenskategorien werden nun auf dem Pflichtpfad erzwungen (magical ⇒ physisch,
    // physical ⇒ magisch) — kein reiner Ein-Kategorie-Build trägt mehr durch die Story.
    const routeResists = new Set<string>();
    for (const encounterId of STORY_ENCOUNTER_IDS) {
      const encounter = ENCOUNTERS.find((candidate) => candidate.id === encounterId);
      for (const enemyId of encounter?.enemyIds ?? []) {
        const enemy = (ENEMIES as readonly EnemyDefinition[]).find((candidate) => candidate.id === enemyId);
        if (enemy?.resistsCategory) routeResists.add(enemy.resistsCategory);
      }
    }
    expect(routeResists).toEqual(new Set(['magical', 'physical']));
  });

  it('Phase 88d — der rally-cry-Support-Check liegt auf einer eigenen Pflichtplatzierung', () => {
    // Nicht auf dem Border-/Alliance-Paar: der Ork-Soldat im Ork-Vorhutkampf zwingt
    // Kontrolle/Fokus, ohne zusätzliche Gegner oder XP in die kritischen Grenzkämpfe zu legen.
    const orcSoldier = (ENEMIES as readonly EnemyDefinition[]).find((enemy) => enemy.id === 'orc-soldier');
    expect(orcSoldier?.skillIds).toContain('rally-cry');

    const orcVanguard = ENCOUNTERS.find((candidate) => candidate.id === 'orc-vanguard');
    expect(orcVanguard?.enemyIds).toContain('orc-soldier');
    expect(STORY_ENCOUNTER_IDS).toContain('orc-vanguard');
  });

  it('Phase 83 — Ressourcen-Bogen: MP sinkt über die Story-Route (Attrition, kein Gratis-Voll-Restore)', () => {
    const report = runBalanceHarnessReport(SEEDS);
    const mpBefore = report.storyRoute.map((encounter) => encounter.averagePartyMpFractionBefore);
    const avg = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;
    const early = avg(mpBefore.slice(0, 3));
    const late = avg(mpBefore.slice(-3));
    // Späte Kämpfe werden mit deutlich weniger MP betreten als frühe → echter Bogen.
    expect(late).toBeLessThan(early - 0.15);
    // Kein Kampf wird durchgängig mit vollem MP betreten (sonst wäre MP als Ressource bedeutungslos).
    expect(Math.min(...mpBefore)).toBeLessThanOrEqual(0.6);
  });

  it('Phase 139 — der erste bindende Hebel: Heilbestrafung, die den Rote-Sustain-Pfad bricht', () => {
    // No-Counter-Lauf (stur heilen) fällt bei Ifrit aus dem Korridor, Counter-Lauf (Heilung gegen Punisher zurückstellen) bleibt drin.
    // Beweis, dass der Hebel notwendig ist.
    const ifrit = (ENEMIES as readonly EnemyDefinition[]).find((e) => e.id === 'ifrit')!;
    expect(ifrit.punishesHealing).toBe(true);
    // Die AI-Änderung sorgt für die Gegenentscheidung; der Harness bleibt grün mit dem aktualisierten Agenten.
  });
});
