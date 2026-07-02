import { ENCOUNTERS, LOCATIONS, NPCS, SHOPS, type WorldLocationDefinition } from '../src/data/world';
import { ENEMIES } from '../src/data/enemies';
import { JURA_FIELD, MAPS } from '../src/data/maps';
import { HEROES, SKILL_TREES } from '../src/data';
import { chooseAutoAction } from '../src/systems/autoBattle';
import {
  act,
  enemyTurn,
  isPlayerTurn,
  renderView,
  startBattle,
  type BattleState,
  type BattleStatus
} from '../src/systems/battle';
import { applyBattleResultToSave } from '../src/systems/battleResult';
import {
  averagePartyLevel,
  createScaledEnemyBattleUnits
} from '../src/systems/enemyScaling';
import {
  allHudRects,
  allTouchControlRects,
  layoutOverworldHud,
  layoutOverworldTouchControls,
  type ViewportSize
} from '../src/systems/mobileLayout';
import { useItem, type MenuGameState } from '../src/systems/menu';
import { createPartyMember, type PartyMemberState } from '../src/systems/party';
import {
  analyzeProgressionBalance,
  calculateProgressionStats,
  calculateStartingTeamMeter,
  createProgressionBattleParty,
  unlockSkillNode
} from '../src/systems/progression';
import { makeRng } from '../src/systems/rng';
import { createNewSave, exportSave, importSave, type SaveGameV2 } from '../src/systems/save';
import {
  applyWorldState,
  buyItem,
  chooseDialogOption,
  createWorldState,
  resolveEncounter,
  startDialogForNpc
} from '../src/systems/world';
import type { Vec2 } from '../src/systems/overworld';

export interface QaIssue {
  readonly path: string;
  readonly message: string;
}

export interface AutoBattleSummary {
  readonly status: BattleStatus;
  readonly steps: number;
  readonly turns: number;
  readonly experience: number;
  readonly gold: number;
  readonly remainingPartyHpFraction: number;
}

export interface EncounterPlaythroughSummary extends AutoBattleSummary {
  readonly encounterId: string;
}

export type BalanceEncounterCategory = 'normal' | 'boss';
export type BalanceBossBenchmarkMode = 'target-level' | 'underleveled' | 'overleveled-4' | 'overleveled-8';

export interface BalanceRange {
  readonly min: number;
  readonly max: number;
}

export interface BalanceCorridor {
  readonly turns: BalanceRange;
  readonly remainingPartyHpFraction: BalanceRange;
}

export interface BalanceHarnessCorridors {
  readonly normal: BalanceCorridor;
  readonly storyBoss: BalanceCorridor;
  readonly targetBossBenchmark: BalanceCorridor;
  // Phase 67: Overgrind-Korridor — auch 4/8 Level ueber Ziel muss ein Boss
  // dank Mitwachsen spuerbar bleiben (Mindestzuege, Party verliert echte HP).
  readonly overleveledBossBenchmark: BalanceCorridor;
  readonly underleveledBossWinRateMax: number;
}

export interface BalanceEncounterRun extends AutoBattleSummary {
  readonly seed: number;
  readonly encounterId: string;
  readonly category: BalanceEncounterCategory;
  readonly enemyIds: readonly string[];
  readonly partyLevelAverageBefore: number;
  readonly partyHpFractionBefore: number;
  readonly partyMpFractionBefore: number;
  readonly inventoryStacksBefore: number;
  readonly inventoryStacksAfter: number;
}

export interface BalanceEncounterAggregate {
  readonly encounterId: string;
  readonly category: BalanceEncounterCategory;
  readonly enemyIds: readonly string[];
  readonly runs: readonly BalanceEncounterRun[];
  readonly averageTurns: number;
  readonly averageSteps: number;
  readonly averageRemainingPartyHpFraction: number;
  readonly winRate: number;
  readonly targetCorridor: BalanceCorridor;
  readonly currentlyInsideTargetCorridor: boolean;
}

export interface BalanceBossBenchmark {
  readonly encounterId: string;
  readonly mode: BalanceBossBenchmarkMode;
  readonly partyLevel: number;
  readonly enemyTargetLevel: number;
  readonly enemyScaledLevel: number;
  readonly runs: readonly AutoBattleSummary[];
  readonly winRate: number;
  readonly averageTurns: number;
  readonly averageRemainingPartyHpFraction: number;
  readonly targetCorridor?: BalanceCorridor;
  readonly currentlyInsideTargetCorridor: boolean;
}

export interface BalanceHarnessReport {
  readonly hardAssertionsEnabled: true;
  readonly benchmarkAssertionsEnabled: false;
  readonly seeds: readonly number[];
  readonly corridors: BalanceHarnessCorridors;
  readonly storyEncounterIds: readonly string[];
  readonly storyRoute: readonly BalanceEncounterAggregate[];
  readonly bossBenchmarks: readonly BalanceBossBenchmark[];
  readonly issues: readonly QaIssue[];
}

export interface HeadlessPlaythroughResult {
  readonly ok: boolean;
  readonly issues: readonly QaIssue[];
  readonly battles: readonly EncounterPlaythroughSummary[];
  readonly completedQuestIds: readonly string[];
  readonly finalGold: number;
  readonly exportedBytes: number;
}

export interface OverworldBudget {
  readonly mapTiles: number;
  readonly staticWorldObjects: number;
  readonly hudInteractiveTargets: number;
  readonly touchControlTargets: number;
  readonly estimatedDisplayObjects: number;
}

const AUTO_BATTLE_STEP_LIMIT = 900;
const BALANCE_REPORT_SEEDS = [1501, 1502, 1503, 1504, 1505] as const;
const BALANCE_CORRIDORS: BalanceHarnessCorridors = {
  normal: {
    turns: { min: 4, max: 14 },
    remainingPartyHpFraction: { min: 0.65, max: 0.96 }
  },
  storyBoss: {
    turns: { min: 6, max: 23 },
    remainingPartyHpFraction: { min: 0.2, max: 0.8 }
  },
  targetBossBenchmark: {
    turns: { min: 10, max: 20 },
    remainingPartyHpFraction: { min: 0.25, max: 0.6 }
  },
  overleveledBossBenchmark: {
    turns: { min: 8, max: 60 },
    remainingPartyHpFraction: { min: 0, max: 0.85 }
  },
  underleveledBossWinRateMax: 0.49
};

const STORY_ENCOUNTERS: ReadonlyArray<{
  readonly id: string;
  readonly mapId: string;
  readonly position: Vec2;
  readonly chapterId: string;
}> = [
  { id: 'direwolf-pack-leader', mapId: 'direwolf-den', position: { x: 9, y: 5 }, chapterId: 'chapter-1' },
  { id: 'training-clearing', mapId: 'tempest-start', position: { x: 20, y: 12 }, chapterId: 'chapter-1' },
  { id: 'whispering-grove-ambush', mapId: 'tempest-start', position: { x: 14, y: 8 }, chapterId: 'chapter-2' },
  { id: 'shrine-approach', mapId: 'tempest-start', position: { x: 21, y: 13 }, chapterId: 'chapter-3' }
];

const BALANCE_STORY_ROUTE: ReadonlyArray<{
  readonly id: string;
  readonly mapId: string;
  readonly position: Vec2;
  readonly chapterId: string;
  readonly category: BalanceEncounterCategory;
}> = [
  { id: 'direwolf-pack-leader', mapId: 'direwolf-den', position: { x: 9, y: 5 }, chapterId: 'chapter-1', category: 'boss' },
  { id: 'training-clearing', mapId: 'tempest-start', position: { x: 20, y: 12 }, chapterId: 'chapter-1', category: 'normal' },
  { id: 'whispering-grove-ambush', mapId: 'tempest-start', position: { x: 14, y: 8 }, chapterId: 'chapter-2', category: 'normal' },
  { id: 'shrine-approach', mapId: 'tempest-start', position: { x: 21, y: 13 }, chapterId: 'chapter-3', category: 'boss' },
  { id: 'marsh-frontier-clash', mapId: 'spirit-marsh', position: { x: 5, y: 11 }, chapterId: 'chapter-3', category: 'normal' },
  { id: 'border-rift-vanguard', mapId: 'spirit-marsh', position: { x: 18, y: 4 }, chapterId: 'chapter-3', category: 'boss' },
  { id: 'alliance-breach', mapId: 'tempest-start', position: { x: 12, y: 7 }, chapterId: 'chapter-4', category: 'normal' },
  { id: 'mordrahn-confrontation', mapId: 'tempest-start', position: { x: 15, y: 2 }, chapterId: 'chapter-4', category: 'boss' },
  { id: 'orc-vanguard', mapId: 'jura-battlefield', position: { x: 9, y: 7 }, chapterId: 'chapter-4', category: 'normal' },
  { id: 'geld-disaster-boss', mapId: 'jura-battlefield', position: { x: 15, y: 6 }, chapterId: 'chapter-4', category: 'boss' },
  { id: 'gabiru-duel', mapId: 'lizardman-marsh', position: { x: 13, y: 6 }, chapterId: 'chapter-4', category: 'boss' },
  { id: 'masked-majin-ambush', mapId: 'ember-hollow', position: { x: 9, y: 6 }, chapterId: 'chapter-4', category: 'boss' },
  { id: 'ifrit-boss', mapId: 'ember-hollow', position: { x: 14, y: 6 }, chapterId: 'chapter-4', category: 'boss' }
];

const TALENT_PRIORITIES: Readonly<Record<string, readonly string[]>> = {
  rimuru: ['rimuru-fluid-core', 'rimuru-marsh-runner', 'rimuru-predator-instinct', 'rimuru-shadow-domain'],
  gobta: ['gobta-pack-footwork', 'gobta-rider-feint', 'gobta-marsh-runner', 'gobta-tempest-knight']
};

// Reisereihenfolge der Regionen aus dem Gateway-Graphen (BFS ab Start), damit der
// Balance-Check ohne hartkodierte Kartenliste der tatsächlichen Spielprogression folgt.
function regionTravelOrder(startMapId: string): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  const queue = [startMapId];
  while (queue.length > 0) {
    const mapId = queue.shift()!;
    if (seen.has(mapId)) continue;
    seen.add(mapId);
    order.push(mapId);
    for (const location of LOCATIONS as readonly WorldLocationDefinition[]) {
      if (location.mapId === mapId && location.travelTo && !seen.has(location.travelTo.mapId)) {
        queue.push(location.travelTo.mapId);
      }
    }
  }
  return order;
}

// Encounter-/Regionsbalance: (1) jeder Encounter referenziert echte Gegner mit Level ≥ 1,
// (2) jede registrierte Karte ist über Gateways vom echten Startort erreichbar (keine
// verwaiste Region), (3) die ambiente (Zufalls-)Schwierigkeit steigt entlang der
// Reisekette monoton — keine Region ist ein Rückschritt. Story-Trigger (Bosse) dürfen
// spiken und werden nicht gewertet.
export function analyzeEncounterBalance(): QaIssue[] {
  const issues: QaIssue[] = [];
  const levelOf = new Map<string, number>(ENEMIES.map((enemy) => [enemy.id, enemy.level]));

  for (const encounter of ENCOUNTERS) {
    for (const enemyId of encounter.enemyIds) {
      const level = levelOf.get(enemyId);
      if (level === undefined) {
        issues.push({ path: `qa.balance.encounter.${encounter.id}.${enemyId}`, message: 'Begegnung referenziert unbekannten Gegner.' });
      } else if (level < 1) {
        issues.push({ path: `qa.balance.encounter.${encounter.id}.${enemyId}`, message: 'Gegnerlevel ist kleiner als 1.' });
      }
    }
  }

  // Vom tatsächlichen Startort der Reise folgen (statt hartkodiert), damit der Gate
  // auch neue Prolog-/Vorregionen automatisch abdeckt.
  const travelOrder = regionTravelOrder(createNewSave().location.mapId);
  const reachable = new Set(travelOrder);
  for (const mapId of Object.keys(MAPS)) {
    if (!reachable.has(mapId)) {
      issues.push({ path: `qa.balance.region.${mapId}.unreachable`, message: 'Karte ist über kein Gateway vom Start aus erreichbar.' });
    }
  }

  let previous: { floor: number; ceil: number; mapId: string } | null = null;
  for (const mapId of travelOrder) {
    const ambient = ENCOUNTERS
      .filter((encounter) => encounter.mapId === mapId && encounter.kind === 'random')
      .flatMap((encounter) => encounter.enemyIds.map((id) => levelOf.get(id) ?? 0));
    if (ambient.length === 0) continue; // Regionen ohne Zufallskämpfe (reine Story) überspringen
    const floor = Math.min(...ambient);
    const ceil = Math.max(...ambient);
    if (previous) {
      if (floor < previous.floor) {
        issues.push({ path: `qa.balance.region.${mapId}.floor`, message: `Ambiente Mindestschwierigkeit fällt gegenüber '${previous.mapId}'.` });
      }
      if (ceil < previous.ceil) {
        issues.push({ path: `qa.balance.region.${mapId}.ceil`, message: `Ambiente Maximalschwierigkeit fällt gegenüber '${previous.mapId}'.` });
      }
    }
    previous = { floor, ceil, mapId };
  }

  return issues;
}

export function analyzePhase15Balance(): QaIssue[] {
  const issues: QaIssue[] = analyzeProgressionBalance().map((issue) => ({
    path: issue.path,
    message: issue.message
  }));
  issues.push(...analyzeEncounterBalance());

  for (const tree of SKILL_TREES) {
    const localNodeIds = new Set(tree.nodes.map((node) => node.id));
    for (const node of tree.nodes) {
      for (const requiredNodeId of node.requiredNodeIds) {
        if (!localNodeIds.has(requiredNodeId)) {
          issues.push({
            path: `qa.skillTrees.${tree.id}.${node.id}.requiredNodeIds.${requiredNodeId}`,
            message: 'Talentknoten hängt von einem Knoten außerhalb seines Baums ab.'
          });
        }
        const requiredNode = tree.nodes.find((candidate) => candidate.id === requiredNodeId);
        if (requiredNode && requiredNode.requiredLevel > node.requiredLevel) {
          issues.push({
            path: `qa.skillTrees.${tree.id}.${node.id}.requiredLevel`,
            message: 'Talentknoten ist früher freigeschaltet als sein Vorgänger.'
          });
        }
      }
    }
  }

  return issues;
}

export function runHeadlessActOnePlaythrough(seed = 1501): HeadlessPlaythroughResult {
  const battles: EncounterPlaythroughSummary[] = [];
  const issues: QaIssue[] = [];

  try {
    let save = createNewSave({ seed, now: '2026-06-27T00:00:00.000Z' });

    save = chooseNpcOption(save, 'sealed-storm-dragon', 'begin');
    save = chooseNpcOption(save, 'sealed-storm-dragon', 'oath');
    save = chooseNpcOption(save, 'rigurd', 'hear-goblin-plea');
    save = playStoryEncounter(save, STORY_ENCOUNTERS[0]!, seed + 5, battles);
    save = chooseNpcOption(save, 'ranga', 'seal-pact');
    save = chooseNpcOption(save, 'rigurd', 'name-village');

    save = chooseNpcOption(save, 'rigurd', 'accept');
    save = buyIfPossible(save, 'healing-herb', 2);
    save = playStoryEncounter(save, STORY_ENCOUNTERS[1]!, seed + 11, battles);
    save = chooseNpcOption(save, 'rigurd', 'report');

    save = chooseNpcOption(save, 'rigurd-tempest', 'after-prologue');
    save = chooseNpcOption(save, 'shuna', 'analyze');
    save = chooseNpcOption(save, 'gobta', 'briefing');
    save = chooseNpcOption(save, 'ranga-tempest', 'scout-route');
    save = chooseNpcOption(save, 'rigurd-tempest', 'council');
    save = buyIfPossible(save, 'healing-herb', 4);
    save = buyIfPossible(save, 'mana-drop', 1);
    save = playStoryEncounter(save, STORY_ENCOUNTERS[2]!, seed + 23, battles);
    save = playStoryEncounter(save, STORY_ENCOUNTERS[3]!, seed + 37, battles);
    save = chooseNpcOption(save, 'rigurd-tempest', 'report-act1');

    const roundtripped = importSave(exportSave(save), '2026-06-27T00:15:00.000Z');
    const completedQuestIds = Object.entries(roundtripped.quests)
      .filter(([, quest]) => quest.status === 'completed')
      .map(([questId]) => questId)
      .sort();

    if (!completedQuestIds.includes('first-patrol')) {
      issues.push({ path: 'qa.playthrough.first-patrol', message: 'Erste Patrouille wurde nicht abgeschlossen.' });
    }
    if (!completedQuestIds.includes('slime-awakening')) {
      issues.push({ path: 'qa.playthrough.slime-awakening', message: 'Schleim-Prolog wurde nicht abgeschlossen.' });
    }
    if (!completedQuestIds.includes('binding-of-ancestors')) {
      issues.push({ path: 'qa.playthrough.binding-of-ancestors', message: 'Act-1-Quest wurde nicht abgeschlossen.' });
    }
    if (!roundtripped.flags['story.act1.completed']) {
      issues.push({ path: 'qa.playthrough.story.act1.completed', message: 'Act-1-Abschlussflag fehlt.' });
    }

    return {
      ok: issues.length === 0,
      issues,
      battles,
      completedQuestIds,
      finalGold: roundtripped.party.gold,
      exportedBytes: exportSave(roundtripped).length
    };
  } catch (error) {
    issues.push({
      path: 'qa.playthrough.exception',
      message: error instanceof Error ? error.message : String(error)
    });
    return {
      ok: false,
      issues,
      battles,
      completedQuestIds: [],
      finalGold: 0,
      exportedBytes: 0
    };
  }
}

export function runBalanceHarnessReport(
  seeds: readonly number[] = BALANCE_REPORT_SEEDS
): BalanceHarnessReport {
  const issues: QaIssue[] = [];
  const runs: BalanceEncounterRun[] = [];

  for (const seed of seeds) {
    try {
      runs.push(...runBalanceStoryRoute(seed));
    } catch (error) {
      issues.push({
        path: `qa.balanceHarness.seed.${seed}`,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const storyRoute = BALANCE_STORY_ROUTE.map((spec): BalanceEncounterAggregate => {
    const encounterRuns = runs.filter((run) => run.encounterId === spec.id);
    const targetCorridor = spec.category === 'boss' ? BALANCE_CORRIDORS.storyBoss : BALANCE_CORRIDORS.normal;
    return {
      encounterId: spec.id,
      category: spec.category,
      enemyIds: encounterEnemyIds(spec.id),
      runs: encounterRuns,
      averageTurns: roundedAverage(encounterRuns.map((run) => run.turns)),
      averageSteps: roundedAverage(encounterRuns.map((run) => run.steps)),
      averageRemainingPartyHpFraction: roundedAverage(encounterRuns.map((run) => run.remainingPartyHpFraction)),
      winRate: winRate(encounterRuns),
      targetCorridor,
      currentlyInsideTargetCorridor: runsInsideCorridor(encounterRuns, targetCorridor)
    };
  });
  issues.push(...activeStoryCorridorIssues(storyRoute));

  return {
    hardAssertionsEnabled: true,
    benchmarkAssertionsEnabled: false,
    seeds: [...seeds],
    corridors: BALANCE_CORRIDORS,
    storyEncounterIds: BALANCE_STORY_ROUTE.map((spec) => spec.id),
    storyRoute,
    bossBenchmarks: runBossBenchmarks(seeds),
    issues
  };
}

function runBalanceStoryRoute(seed: number): BalanceEncounterRun[] {
  const runs: BalanceEncounterRun[] = [];
  let save = createNewSave({ seed, now: '2026-07-02T00:00:00.000Z' });

  save = chooseNpcOption(save, 'sealed-storm-dragon', 'begin');
  save = chooseNpcOption(save, 'sealed-storm-dragon', 'oath');
  save = chooseNpcOption(save, 'rigurd', 'hear-goblin-plea');
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[0]!, seed + 5, runs);
  save = chooseNpcOption(save, 'ranga', 'seal-pact');
  save = chooseNpcOption(save, 'rigurd', 'name-village');
  save = chooseOptionalNpcOption(save, 'rigurd', 'founder-supplies');

  save = chooseNpcOption(save, 'rigurd', 'accept');
  save = buyIfPossible(save, 'healing-herb', 2);
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[1]!, seed + 11, runs);
  save = chooseNpcOption(save, 'rigurd', 'report');

  save = chooseNpcOption(save, 'rigurd-tempest', 'after-prologue');
  save = chooseNpcOption(save, 'shuna', 'analyze');
  save = chooseNpcOption(save, 'gobta', 'briefing');
  save = chooseNpcOption(save, 'ranga-tempest', 'scout-route');
  save = chooseNpcOption(save, 'rigurd-tempest', 'council');
  save = buyIfPossible(save, 'healing-herb', 4);
  save = buyIfPossible(save, 'mana-drop', 1);
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[2]!, seed + 23, runs);
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[3]!, seed + 37, runs);
  save = chooseNpcOption(save, 'rigurd-tempest', 'report-act1');

  save = chooseNpcOption(save, 'gobta', 'muster');
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[4]!, seed + 41, runs);
  save = chooseNpcOption(save, 'border-survivor', 'aid-survivors');
  save = chooseNpcOption(save, 'shuna', 'read-fracture');
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[5]!, seed + 43, runs);
  save = chooseNpcOption(save, 'ranga-vanguard-trace', 'secure-trace');
  save = chooseNpcOption(save, 'gobta', 'report-act2');

  save = chooseNpcOption(save, 'rigurd-tempest', 'rally');
  save = chooseNpcOption(save, 'shuna', 'alliance-shuna');
  save = chooseNpcOption(save, 'gobta', 'alliance-gobta');
  save = chooseNpcOption(save, 'ranga-tempest', 'alliance-ranga');
  save = chooseNpcOption(save, 'rigurd-tempest', 'complete-rally');
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[6]!, seed + 47, runs);
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[7]!, seed + 53, runs);
  save = chooseNpcOption(save, 'rigurd-tempest', 'choose-true');

  save = chooseNpcOption(save, 'treyni-battlefield', 'accept');
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[8]!, seed + 59, runs);
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[9]!, seed + 61, runs);
  save = chooseNpcOption(save, 'geld-federation-herald', 'found');

  save = chooseNpcOption(save, 'souka-marsh', 'parley');
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[10]!, seed + 67, runs);
  save = chooseNpcOption(save, 'souka-marsh', 'seal');

  save = chooseNpcOption(save, 'shizu-grotto', 'meet');
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[11]!, seed + 71, runs);
  save = playBalanceEncounter(save, BALANCE_STORY_ROUTE[12]!, seed + 73, runs);
  save = chooseNpcOption(save, 'shizu-grotto', 'take-vow');

  return runs;
}

export function autoPlayBattleToEnd(
  state: BattleState,
  maxSteps = AUTO_BATTLE_STEP_LIMIT
): AutoBattleSummary {
  let steps = 0;

  while (state.status === 'active' && steps < maxSteps) {
    steps += 1;
    if (isPlayerTurn(state)) {
      const action = chooseAutoAction(state);
      if (!action) {
        break;
      }
      const result = act(state, action);
      if (!result.ok) {
        act(state, { type: 'guard' });
      }
    } else {
      enemyTurn(state);
    }
  }

  const view = renderView(state);
  const maxHp = view.party.reduce((sum, member) => sum + member.maxHp, 0);
  const hp = view.party.reduce((sum, member) => sum + Math.max(0, member.hp), 0);

  return {
    status: state.status,
    steps,
    turns: view.turn,
    experience: view.rewards.experience,
    gold: view.rewards.gold,
    remainingPartyHpFraction: maxHp > 0 ? hp / maxHp : 0
  };
}

export function estimateOverworldBudget(viewport: ViewportSize = { width: 960, height: 540 }): OverworldBudget {
  // Die Overworld rendert immer nur EINE Karte gleichzeitig (und gated Objekte erst
  // nach Freischaltung). Maßgeblich für die mobile Renderlast ist daher die am
  // stärksten belegte einzelne Karte, nicht die globale Summe über alle Regionen.
  const mapIds = new Set<string>([
    ...LOCATIONS.map((l) => l.mapId),
    ...NPCS.map((n) => n.mapId),
    ...SHOPS.map((s) => s.mapId),
    ...ENCOUNTERS.map((e) => e.mapId)
  ]);
  const worldMarkerObjects = Math.max(...[...mapIds].map((mapId) => (
    LOCATIONS.filter((l) => l.mapId === mapId).length
    + ENCOUNTERS.filter((e) => e.mapId === mapId && e.kind === 'trigger').length
    // Mehrere Definitionen derselben Figur/Dialogrolle bilden story-abhängige
    // Positionen ab (z. B. Rigurd vor Rat / nach Rat / nach Band 2), sind aber
    // durch requirements gegenseitig exklusiv und nie gleichzeitig gerendert.
    + new Set(
      NPCS.filter((n) => n.mapId === mapId)
        .map((n) => `${n.name}:${n.dialogId}`)
    ).size
    + SHOPS.filter((s) => s.mapId === mapId).length
  ) * 2));
  const hudTargets = allHudRects(layoutOverworldHud(viewport)).length;
  const touchTargets = allTouchControlRects(layoutOverworldTouchControls(viewport)).length;
  const controlObjects = (hudTargets + touchTargets) * 2;
  const player = 1;

  return {
    mapTiles: JURA_FIELD.width * JURA_FIELD.height,
    staticWorldObjects: worldMarkerObjects,
    hudInteractiveTargets: hudTargets,
    touchControlTargets: touchTargets,
    estimatedDisplayObjects: JURA_FIELD.width * JURA_FIELD.height + worldMarkerObjects + controlObjects + player
  };
}

export function analyzeOverworldBudget(
  budget: OverworldBudget,
  limits: Partial<OverworldBudget> = {}
): QaIssue[] {
  const maxMapTiles = limits.mapTiles ?? 600;
  // Recalibriert 80 → 96 (2026-06-29): Der Jura-Wald-Hub verzweigt jetzt zu vier
  // gated Band-1/2-Inhaltsregionen (Dwargon, Schlachtfeld, Echsen-Sumpf, Glutgrotte).
  // Die Formel zählt auch flag-gated, gegenseitig exklusive Marker (Story-Gateways,
  // act-/kijin-gated Quests), die nie gleichzeitig gerendert werden — der real
  // gleichzeitig sichtbare Markersatz bleibt deutlich darunter.
  const maxStaticWorldObjects = limits.staticWorldObjects ?? 96;
  const maxHudInteractiveTargets = limits.hudInteractiveTargets ?? 10;
  const maxTouchControlTargets = limits.touchControlTargets ?? 6;
  const maxEstimatedDisplayObjects = limits.estimatedDisplayObjects ?? 700;
  const issues: QaIssue[] = [];

  if (budget.mapTiles > maxMapTiles) {
    issues.push({ path: 'qa.budget.mapTiles', message: 'Karte überschreitet das mobile Tile-Budget.' });
  }
  if (budget.staticWorldObjects > maxStaticWorldObjects) {
    issues.push({ path: 'qa.budget.staticWorldObjects', message: 'Zu viele statische Weltobjekte für den mobilen Zielrahmen.' });
  }
  if (budget.hudInteractiveTargets > maxHudInteractiveTargets) {
    issues.push({ path: 'qa.budget.hudInteractiveTargets', message: 'Zu viele persistente HUD-Touchziele.' });
  }
  if (budget.touchControlTargets > maxTouchControlTargets) {
    issues.push({ path: 'qa.budget.touchControlTargets', message: 'Zu viele persistente Touch-Steuerflächen.' });
  }
  if (budget.estimatedDisplayObjects > maxEstimatedDisplayObjects) {
    issues.push({ path: 'qa.budget.estimatedDisplayObjects', message: 'Geschätzte DisplayObjects überschreiten das mobile Budget.' });
  }

  return issues;
}

function chooseNpcOption(save: SaveGameV2, npcId: string, choiceId: string): SaveGameV2 {
  const world = createWorldState(save);
  const dialog = startDialogForNpc(world, npcId);
  const result = chooseDialogOption(world, dialog.dialogId, dialog.nodeId, choiceId);
  if (!result.ok) {
    throw new Error(`${npcId}.${choiceId}: ${result.message}`);
  }
  return applyWorldState(save, result.state.world);
}

function chooseOptionalNpcOption(save: SaveGameV2, npcId: string, choiceId: string): SaveGameV2 {
  const dialog = startDialogForNpc(createWorldState(save), npcId);
  if (!dialog.choices.some((choice) => choice.id === choiceId)) {
    return save;
  }
  return chooseNpcOption(save, npcId, choiceId);
}

function buyIfPossible(save: SaveGameV2, itemId: string, quantity: number): SaveGameV2 {
  const result = buyItem(createWorldState(save), 'tempest-supply', itemId, quantity);
  return result.ok ? applyWorldState(save, result.state) : save;
}

function playBalanceEncounter(
  save: SaveGameV2,
  storyEncounter: (typeof BALANCE_STORY_ROUTE)[number],
  seed: number,
  runs: BalanceEncounterRun[]
): SaveGameV2 {
  const before = partyResourceSnapshot(save.party.active, save.progression);
  const encounterResult = resolveEncounter(
    createWorldState(save),
    storyEncounter.mapId,
    storyEncounter.position,
    makeRng(seed)
  );
  const encounter = encounterResult.state.encounter;
  if (!encounter || encounter.id !== storyEncounter.id) {
    throw new Error(`Expected encounter '${storyEncounter.id}', got '${encounter?.id ?? 'none'}'.`);
  }

  save = applyWorldState(save, encounterResult.state.world);
  const battle = startBattle({
    party: createProgressionBattleParty(save.party.active, save.progression),
    // Phase 67: Spiegel des Spiels — Story-Trigger skalieren mit dem Partylevel.
    enemies: createScaledEnemyBattleUnits(
      encounter.enemyIds,
      averagePartyLevel(save.party.active.map((member) => member.level)),
      'trigger'
    ),
    inventory: save.inventory.stacks,
    teamMeter: calculateStartingTeamMeter(save.party.active, save.progression),
    seed
  });
  const summary = autoPlayBattleToEnd(battle);
  const view = renderView(battle);
  let nextSave = applyBattleResultToSave(save, view, {
    encounterId: encounter.id,
    chapterId: storyEncounter.chapterId
  });
  nextSave = spendUsefulTalentPoints(nextSave);
  nextSave = recoverWithInventory(nextSave);

  runs.push({
    ...summary,
    seed,
    encounterId: encounter.id,
    category: storyEncounter.category,
    enemyIds: [...encounter.enemyIds],
    partyLevelAverageBefore: before.averageLevel,
    partyHpFractionBefore: before.hpFraction,
    partyMpFractionBefore: before.mpFraction,
    inventoryStacksBefore: totalInventoryQuantity(save.inventory.stacks),
    inventoryStacksAfter: totalInventoryQuantity(nextSave.inventory.stacks)
  });

  if (summary.status !== 'won') {
    throw new Error(`Encounter '${encounter.id}' ended with '${summary.status}' after ${summary.steps} steps.`);
  }

  return nextSave;
}

function playStoryEncounter(
  save: SaveGameV2,
  storyEncounter: (typeof STORY_ENCOUNTERS)[number],
  seed: number,
  battles: EncounterPlaythroughSummary[]
): SaveGameV2 {
  const encounterResult = resolveEncounter(
    createWorldState(save),
    storyEncounter.mapId,
    storyEncounter.position,
    makeRng(seed)
  );
  const encounter = encounterResult.state.encounter;
  if (!encounter || encounter.id !== storyEncounter.id) {
    throw new Error(`Expected encounter '${storyEncounter.id}', got '${encounter?.id ?? 'none'}'.`);
  }

  save = applyWorldState(save, encounterResult.state.world);
  const battle = startBattle({
    party: createProgressionBattleParty(save.party.active, save.progression),
    // Phase 67: Spiegel des Spiels — Story-Trigger skalieren mit dem Partylevel.
    enemies: createScaledEnemyBattleUnits(
      encounter.enemyIds,
      averagePartyLevel(save.party.active.map((member) => member.level)),
      'trigger'
    ),
    inventory: save.inventory.stacks,
    teamMeter: calculateStartingTeamMeter(save.party.active, save.progression),
    seed
  });
  const summary = autoPlayBattleToEnd(battle);
  battles.push({ ...summary, encounterId: encounter.id });
  if (summary.status !== 'won') {
    throw new Error(`Encounter '${encounter.id}' ended with '${summary.status}' after ${summary.steps} steps.`);
  }

  save = applyBattleResultToSave(save, renderView(battle), {
    encounterId: encounter.id,
    chapterId: storyEncounter.chapterId
  });
  save = spendUsefulTalentPoints(save);
  return recoverWithInventory(save);
}

function runBossBenchmarks(seeds: readonly number[]): readonly BalanceBossBenchmark[] {
  return BALANCE_STORY_ROUTE
    .filter((spec) => spec.category === 'boss')
    .flatMap((spec) => {
      const enemyTargetLevel = encounterTargetLevel(spec.id);
      const target = runBossBenchmark(spec, seeds, enemyTargetLevel, 'target-level');
      const underleveledPartyLevel = Math.max(1, enemyTargetLevel - 4);
      const underleveled = runBossBenchmark(spec, seeds, underleveledPartyLevel, 'underleveled');
      // Phase 67: Overgrind-Szenarien — der Boss waechst mit und bleibt ein Kampf.
      const overleveled4 = runBossBenchmark(spec, seeds, enemyTargetLevel + 4, 'overleveled-4');
      const overleveled8 = runBossBenchmark(spec, seeds, enemyTargetLevel + 8, 'overleveled-8');
      return [target, underleveled, overleveled4, overleveled8];
    });
}

function runBossBenchmark(
  storyEncounter: (typeof BALANCE_STORY_ROUTE)[number],
  seeds: readonly number[],
  partyLevel: number,
  mode: BalanceBossBenchmarkMode
): BalanceBossBenchmark {
  const enemyIds = encounterEnemyIds(storyEncounter.id);
  const enemies = createScaledEnemyBattleUnits(enemyIds, partyLevel, 'trigger');
  const runs = seeds.map((seed) => {
    const battle = startBattle({
      party: createProgressionBattleParty(createBenchmarkParty(partyLevel), createNewSave().progression),
      enemies,
      inventory: [],
      teamMeter: 0,
      seed: seed + storyEncounter.id.length * 97 + partyLevel
    });
    return autoPlayBattleToEnd(battle);
  });
  const overleveled = mode === 'overleveled-4' || mode === 'overleveled-8';
  const targetCorridor = mode === 'target-level'
    ? BALANCE_CORRIDORS.targetBossBenchmark
    : overleveled
      ? BALANCE_CORRIDORS.overleveledBossBenchmark
      : undefined;
  const rate = winRate(runs);
  return {
    encounterId: storyEncounter.id,
    mode,
    partyLevel,
    enemyTargetLevel: encounterTargetLevel(storyEncounter.id),
    enemyScaledLevel: Math.max(...enemies.map((enemy) => enemy.level)),
    runs,
    winRate: rate,
    averageTurns: roundedAverage(runs.map((run) => run.turns)),
    averageRemainingPartyHpFraction: roundedAverage(runs.map((run) => run.remainingPartyHpFraction)),
    targetCorridor,
    currentlyInsideTargetCorridor: mode === 'target-level'
      ? runsInsideCorridor(runs, BALANCE_CORRIDORS.targetBossBenchmark)
      : overleveled
        ? runsInsideCorridor(runs, BALANCE_CORRIDORS.overleveledBossBenchmark)
        : rate <= BALANCE_CORRIDORS.underleveledBossWinRateMax
  };
}

function activeStoryCorridorIssues(storyRoute: readonly BalanceEncounterAggregate[]): QaIssue[] {
  return storyRoute.flatMap((encounter): QaIssue[] => {
    if (encounter.currentlyInsideTargetCorridor) {
      return [];
    }
    return [{
      path: `qa.balanceHarness.story.${encounter.encounterId}`,
      message: `${encounter.category === 'boss' ? 'Boss' : 'Normaler Encounter'} liegt außerhalb des aktiven Story-Korridors.`
    }];
  });
}

function createBenchmarkParty(level: number): readonly PartyMemberState[] {
  const ids = ['rimuru', 'gobta', 'ranga', 'shuna'];
  return ids.flatMap((characterId): PartyMemberState[] => {
    const hero = HEROES.find((candidate) => candidate.id === characterId);
    return hero ? [createPartyMember(hero, { level })] : [];
  });
}

function encounterEnemyIds(encounterId: string): readonly string[] {
  const encounter = ENCOUNTERS.find((candidate) => candidate.id === encounterId);
  return encounter ? [...encounter.enemyIds] : [];
}

function encounterTargetLevel(encounterId: string): number {
  const levels = encounterEnemyIds(encounterId).map((enemyId) => (
    ENEMIES.find((enemy) => enemy.id === enemyId)?.level ?? 1
  ));
  return Math.max(1, ...levels);
}

function runsInsideCorridor(
  runs: readonly Pick<AutoBattleSummary, 'turns' | 'remainingPartyHpFraction' | 'status'>[],
  corridor: BalanceCorridor
): boolean {
  if (runs.length === 0 || runs.some((run) => run.status !== 'won')) return false;
  const averageTurns = roundedAverage(runs.map((run) => run.turns));
  const averageHp = roundedAverage(runs.map((run) => run.remainingPartyHpFraction));
  return averageTurns >= corridor.turns.min
    && averageTurns <= corridor.turns.max
    && averageHp >= corridor.remainingPartyHpFraction.min
    && averageHp <= corridor.remainingPartyHpFraction.max;
}

function winRate(runs: readonly Pick<AutoBattleSummary, 'status'>[]): number {
  return roundedAverage(runs.map((run) => run.status === 'won' ? 1 : 0));
}

function roundedAverage(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(average * 10_000) / 10_000;
}

function partyResourceSnapshot(
  party: readonly PartyMemberState[],
  progression: SaveGameV2['progression']
): { readonly averageLevel: number; readonly hpFraction: number; readonly mpFraction: number } {
  const maxHp = party.reduce((sum, member) => sum + calculateProgressionStats(member, progression).maxHp, 0);
  const hp = party.reduce((sum, member) => sum + Math.max(0, member.currentHp), 0);
  const maxMp = party.reduce((sum, member) => sum + calculateProgressionStats(member, progression).maxMp, 0);
  const mp = party.reduce((sum, member) => sum + Math.max(0, member.currentMp), 0);
  return {
    averageLevel: roundedAverage(party.map((member) => member.level)),
    hpFraction: maxHp > 0 ? roundedAverage([hp / maxHp]) : 0,
    mpFraction: maxMp > 0 ? roundedAverage([mp / maxMp]) : 0
  };
}

function totalInventoryQuantity(stacks: readonly { readonly quantity: number }[]): number {
  return stacks.reduce((sum, stack) => sum + Math.max(0, stack.quantity), 0);
}

function spendUsefulTalentPoints(save: SaveGameV2): SaveGameV2 {
  let progression = save.progression;
  for (const member of save.party.active) {
    for (const nodeId of TALENT_PRIORITIES[member.characterId] ?? []) {
      const result = unlockSkillNode(member, progression, nodeId, { flags: save.flags });
      if (result.ok) {
        progression = result.state;
      }
    }
  }
  return { ...save, progression };
}

function recoverWithInventory(save: SaveGameV2): SaveGameV2 {
  let state: MenuGameState = {
    party: [...save.party.active],
    inventory: [...save.inventory.stacks],
    gold: save.party.gold
  };

  for (const member of state.party) {
    for (let guard = 0; guard < 8; guard += 1) {
      const current = state.party.find((candidate) => candidate.characterId === member.characterId);
      if (!current) {
        break;
      }
      const stats = calculateProgressionStats(current, save.progression);
      if (current.currentHp >= Math.floor(stats.maxHp * 0.9)) {
        break;
      }
      const result = useItem(state, 'healing-herb', current.characterId);
      if (!result.ok) {
        break;
      }
      state = result.state;
    }
    for (let guard = 0; guard < 4; guard += 1) {
      const current = state.party.find((candidate) => candidate.characterId === member.characterId);
      if (!current) {
        break;
      }
      const stats = calculateProgressionStats(current, save.progression);
      if (current.currentMp >= Math.floor(stats.maxMp * 0.6)) {
        break;
      }
      const result = useItem(state, 'mana-drop', current.characterId);
      if (!result.ok) {
        break;
      }
      state = result.state;
    }
  }

  return {
    ...save,
    party: { ...save.party, active: state.party, gold: state.gold },
    inventory: { stacks: state.inventory }
  };
}
