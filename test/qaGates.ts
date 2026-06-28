import { ENCOUNTERS, LOCATIONS, NPCS, SHOPS, type WorldLocationDefinition } from '../src/data/world';
import { ENEMIES } from '../src/data/enemies';
import { JURA_FIELD, MAPS } from '../src/data/maps';
import { SKILL_TREES } from '../src/data';
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
import { layoutOverworldHud, allHudRects, type ViewportSize } from '../src/systems/mobileLayout';
import { useItem, type MenuGameState } from '../src/systems/menu';
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
  readonly estimatedDisplayObjects: number;
}

const AUTO_BATTLE_STEP_LIMIT = 900;
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
    save = chooseNpcOption(save, 'rigurd', 'name-village');

    save = chooseNpcOption(save, 'rigurd', 'accept');
    save = buyIfPossible(save, 'healing-herb', 2);
    save = playStoryEncounter(save, STORY_ENCOUNTERS[1]!, seed + 11, battles);
    save = chooseNpcOption(save, 'rigurd', 'report');

    save = chooseNpcOption(save, 'sora', 'after-prologue');
    save = chooseNpcOption(save, 'vael', 'analyze');
    save = chooseNpcOption(save, 'lyrre', 'briefing');
    save = chooseNpcOption(save, 'sora', 'council');
    save = buyIfPossible(save, 'healing-herb', 4);
    save = buyIfPossible(save, 'mana-drop', 1);
    save = playStoryEncounter(save, STORY_ENCOUNTERS[2]!, seed + 23, battles);
    save = playStoryEncounter(save, STORY_ENCOUNTERS[3]!, seed + 37, battles);
    save = chooseNpcOption(save, 'sora', 'report-act1');

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
    + NPCS.filter((n) => n.mapId === mapId).length
    + SHOPS.filter((s) => s.mapId === mapId).length
  ) * 2));
  const hudTargets = allHudRects(layoutOverworldHud(viewport)).length;
  const hudObjects = hudTargets * 2;
  const player = 1;

  return {
    mapTiles: JURA_FIELD.width * JURA_FIELD.height,
    staticWorldObjects: worldMarkerObjects,
    hudInteractiveTargets: hudTargets,
    estimatedDisplayObjects: JURA_FIELD.width * JURA_FIELD.height + worldMarkerObjects + hudObjects + player
  };
}

export function analyzeOverworldBudget(
  budget: OverworldBudget,
  limits: Partial<OverworldBudget> = {}
): QaIssue[] {
  const maxMapTiles = limits.mapTiles ?? 600;
  const maxStaticWorldObjects = limits.staticWorldObjects ?? 80;
  const maxHudInteractiveTargets = limits.hudInteractiveTargets ?? 10;
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

function buyIfPossible(save: SaveGameV2, itemId: string, quantity: number): SaveGameV2 {
  const result = buyItem(createWorldState(save), 'tempest-supply', itemId, quantity);
  return result.ok ? applyWorldState(save, result.state) : save;
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
    enemyIds: [...encounter.enemyIds],
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
