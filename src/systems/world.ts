import { DIALOGS, ENCOUNTERS, LOCATIONS, LORE_ENTRIES, NPCS, QUESTS, SHOPS, type DialogChoiceDefinition, type DialogDefinition, type DialogNodeDefinition, type EncounterDefinition, type LoreEntryDefinition, type NpcDefinition, type ShopDefinition, type WorldEffect, type WorldLocationDefinition, type WorldRequirement } from '../data/world';
import { ENEMIES } from '../data/enemies';
import { HEROES, ITEMS, type ItemDefinition } from '../data';
import { addInventoryItem, getItemCount, removeInventoryItem } from './inventory';
import type { InventoryStack } from './inventory';
import { createPartyMember, type PartyMemberState } from './party';
import { MAX_ACTIVE_PARTY_SIZE } from './partyFormation';
import { type Rng } from './rng';
import type { QuestState, SaveGameV2 } from './save';
import type { Vec2 } from './overworld';

export interface WorldState {
  readonly flags: Readonly<Record<string, boolean>>;
  readonly quests: Readonly<Record<string, QuestState>>;
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
  // Höchstes Level der aktiven Party. Optional, damit bestehende WorldState-Literale
  // (Tests, Smokes) gültig bleiben; fehlt es, greift der Überlevel-Schutz nicht.
  readonly partyLevel?: number;
  // Charakter-IDs der aktiven Party und Reserve. Story-Effekte (`recruit-character`)
  // hängen hier idempotent an; applyWorldState gleicht das auf den Save-Roster ab. Optional, damit
  // bestehende WorldState-Literale gültig bleiben.
  readonly roster?: readonly string[];
  // Aktive Party-Ressourcen für Welt-Effekte wie Ruhepunkte. Optional, damit
  // bestehende WorldState-Literale gültig bleiben.
  readonly party?: readonly PartyMemberState[];
}

export interface DialogView {
  readonly dialogId: string;
  readonly nodeId: string;
  readonly speaker: string;
  readonly text: string;
  readonly choices: readonly DialogChoiceDefinition[];
}

export interface QuestStepView {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly locationId: string | null;
  readonly completed: boolean;
  readonly current: boolean;
}

export interface QuestLogEntryView {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: 'inactive' | 'active' | 'completed';
  readonly steps: readonly QuestStepView[];
  readonly rewardGold: number;
  readonly rewardItemIds: readonly string[];
}

export interface TrackedQuestObjectiveView {
  readonly questId: string;
  readonly questTitle: string;
  readonly stepId: string;
  readonly stepTitle: string;
  readonly stepDescription: string;
  readonly locationId: string | null;
  readonly locationName: string | null;
  readonly mapId: string | null;
  readonly position: Vec2 | null;
  readonly status: 'visible' | 'locked' | 'missing-location';
  readonly hint: string;
}

export interface LoreEntryView {
  readonly id: string;
  readonly title: string;
  readonly category: LoreEntryDefinition['category'];
  readonly unlocked: boolean;
  readonly newlyUnlocked: boolean;
  readonly body: string | null;
}

export interface ShopItemView {
  readonly itemId: string;
  readonly name: string;
  readonly quantity: number;
  readonly buyPrice: number;
  readonly sellPrice: number;
}

export interface ShopView {
  readonly id: string;
  readonly name: string;
  readonly gold: number;
  readonly items: readonly ShopItemView[];
}

export interface WorldResult<T = WorldState> {
  readonly ok: boolean;
  readonly state: T;
  readonly message: string;
}

const dialogsById = new Map<string, DialogDefinition>(DIALOGS.map((dialog) => [dialog.id, dialog]));
const encounterById = new Map<string, EncounterDefinition>(ENCOUNTERS.map((encounter) => [encounter.id, encounter]));
const npcById = new Map<string, NpcDefinition>(NPCS.map((npc) => [npc.id, npc]));
const shopById = new Map<string, ShopDefinition>(SHOPS.map((shop) => [shop.id, shop]));
const itemById: ReadonlyMap<string, ItemDefinition> = new Map(ITEMS.map((item) => [item.id, item]));
const allLocations: readonly WorldLocationDefinition[] = LOCATIONS;
const allLoreEntries: readonly LoreEntryDefinition[] = LORE_ENTRIES;
const allNpcs: readonly NpcDefinition[] = NPCS;

export function createWorldState(save: SaveGameV2): WorldState {
  return {
    flags: save.flags,
    quests: save.quests,
    inventory: save.inventory.stacks,
    gold: save.party.gold,
    partyLevel: save.party.active.reduce((max, member) => Math.max(max, member.level), 0),
    roster: [...save.party.active, ...save.party.reserve].map((member) => member.characterId),
    party: save.party.active
  };
}

export function applyWorldState(save: SaveGameV2, world: WorldState): SaveGameV2 {
  // Rekrutierte Figuren in den Save-Roster übernehmen. Vorhandene Mitglieder
  // (aktiv ODER Reserve) bleiben unangetastet. Freie Plätze der aktiven Dreiergruppe
  // werden zuerst gefüllt; weitere Rekruten landen voll geheilt in der Reserve.
  const roster = world.roster ?? save.party.active.map((member) => member.characterId);
  const knownIds = new Set([...save.party.active, ...save.party.reserve].map((member) => member.characterId));
  const recruits = roster.flatMap((characterId) => {
    if (knownIds.has(characterId)) return [];
    const hero = HEROES.find((candidate) => candidate.id === characterId);
    return hero ? [createPartyMember(hero)] : [];
  });
  const worldMembersById = new Map((world.party ?? []).map((member) => [member.characterId, member]));
  const active = save.party.active.map((member) => worldMembersById.get(member.characterId) ?? member);
  const openSlots = Math.max(0, MAX_ACTIVE_PARTY_SIZE - active.length);
  const activeRecruits = recruits.slice(0, openSlots);
  const reserveRecruits = recruits.slice(openSlots);

  return {
    ...save,
    flags: world.flags,
    quests: world.quests,
    inventory: { stacks: world.inventory },
    party: {
      ...save.party,
      active: [...active, ...activeRecruits],
      reserve: [...save.party.reserve, ...reserveRecruits],
      gold: world.gold
    }
  };
}

// Mit `state` werden NPCs nach ihren Story-Anforderungen gefiltert (datengetriebene
// Sichtbarkeit). Ohne `state` werden alle NPCs der Karte zurückgegeben (z. B. für
// Reachability-Prüfungen, die jede potenzielle Position abdecken sollen).
export function getMapNpcs(mapId: string, state?: WorldState): NpcDefinition[] {
  return allNpcs.filter((npc) =>
    npc.mapId === mapId
    && (!state || requirementsMet(state, npc.requirements ?? []))
  );
}

export function getMapShops(mapId: string): ShopDefinition[] {
  return SHOPS.filter((shop) => shop.mapId === mapId);
}

export function getMapEncounters(mapId: string): EncounterDefinition[] {
  return ENCOUNTERS.filter((encounter) => encounter.mapId === mapId);
}

export function getVisibleMapEncounters(mapId: string, state: WorldState): EncounterDefinition[] {
  return getMapEncounters(mapId).filter((encounter) =>
    encounter.kind !== 'trigger'
    || (
      !state.flags[`encounter.${encounter.id}.cleared`]
      && requirementsMet(state, encounter.requirements ?? [])
    )
  );
}

export function getMapLocations(mapId: string, state?: WorldState): WorldLocationDefinition[] {
  return allLocations.filter((location) =>
    location.mapId === mapId
    && (!state
      || !location.unlockFlag
      || state.flags[location.unlockFlag] === true
      || (location.revealFlag !== undefined && state.flags[location.revealFlag] === true))
  );
}

export function getAdjacentNpc(mapId: string, position: Vec2, state?: WorldState): NpcDefinition | undefined {
  return getMapNpcs(mapId, state).find((npc) => isAdjacentOrSame(npc.position, position));
}

export function getAdjacentShop(mapId: string, position: Vec2): ShopDefinition | undefined {
  return getMapShops(mapId).find((shop) => isAdjacentOrSame(shop.position, position));
}

// Gateway-Location (mit travelTo) in Reichweite → für den Regionswechsel.
// Mit `state` wird derselbe unlockFlag-Filter wie in getMapLocations angewandt,
// damit gesperrte Reisepunkte (z. B. Geistmoor erst nach „Grenzfeuer") nicht reisen.
export function getAdjacentTravel(mapId: string, position: Vec2, state?: WorldState): WorldLocationDefinition | undefined {
  return allLocations.find((location) =>
    location.mapId === mapId
    && !!location.travelTo
    && (!state || !location.unlockFlag || state.flags[location.unlockFlag] === true)
    && isAdjacentOrSame(location.position, position)
  );
}

// Gateway-Location exakt UNTER dem Spieler (nicht nur benachbart): der Regionswechsel
// löst erst aus, wenn man auf der Übergangskachel steht — nicht schon ein Feld davor.
export function getTravelAtTile(mapId: string, position: Vec2, state?: WorldState): WorldLocationDefinition | undefined {
  return allLocations.find((location) =>
    location.mapId === mapId
    && !!location.travelTo
    && (!state || !location.unlockFlag || state.flags[location.unlockFlag] === true)
    && location.position.x === position.x
    && location.position.y === position.y
  );
}

// Überlevel-Schutz: Höchstlevel der Gegner einer Begegnung; ist die Party
// OVERLEVEL_AVOIDANCE_GAP Stufen darüber, weichen Zufallsmonster aus.
const enemyLevelById = new Map<string, number>(ENEMIES.map((enemy) => [enemy.id, enemy.level]));
const OVERLEVEL_AVOIDANCE_GAP = 5;

function partyOutlevels(state: WorldState, encounter: EncounterDefinition): boolean {
  if (state.partyLevel === undefined) return false;
  const enemyLevel = Math.max(0, ...encounter.enemyIds.map((id) => enemyLevelById.get(id) ?? 0));
  return state.partyLevel - enemyLevel >= OVERLEVEL_AVOIDANCE_GAP;
}

export function startDialogForNpc(state: WorldState, npcId: string): DialogView {
  const npc = requireNpc(npcId);
  return getDialogView(state, npc.dialogId, requireDialog(npc.dialogId).startNodeId);
}

const QUEST_PROGRESS_EFFECTS: ReadonlySet<WorldEffect['type']> = new Set([
  'start-quest', 'complete-quest-step', 'complete-quest'
]);

// Ein NPC verdient JETZT einen Quest-Marker, wenn ein Gespräch die Story/Quest
// voranbringt: eine sichtbare (requirement-gefilterte) Dialogoption mit Quest-
// Effekt oder gesetztem `story.*`-Flag. Datengetrieben → leuchtet automatisch
// Rigurd→Shuna/Gobta→Ranga→Rigurd zur richtigen Zeit und erlischt, wenn dort nichts zu tun ist.
export function npcHasQuestMarker(state: WorldState, npcId: string): boolean {
  if (!npcById.has(npcId)) return false;
  return startDialogForNpc(state, npcId).choices.some((choice) =>
    (choice.effects ?? []).some((effect) =>
      QUEST_PROGRESS_EFFECTS.has(effect.type)
      || (effect.type === 'set-flag' && effect.flag.startsWith('story.') && effect.value)
    )
  );
}

// Quest-Log-Priorität: aktive Quests (aktuelle Ziele) zuerst, dann abgeschlossene
// als Archiv, unentdeckte/„offene" zuletzt. Aktive Hauptquests stehen zusätzlich
// vor aktiven Nebenquests, damit der nächste Storyanker nicht unter optionalen
// Aufgaben verschwindet. Innerhalb einer Gruppe bleibt die QUESTS-Reihenfolge.
const QUEST_STATUS_ORDER: Record<QuestLogEntryView['status'], number> = {
  active: 0,
  completed: 1,
  inactive: 2
};
// `ancestors-choice` bleibt technisch erhalten, wird aber nicht mehr als Canon-
// Hauptquest priorisiert; sie ist der optionale Original-/Legacy-Arc.
const MAIN_QUEST_IDS = new Set(['slime-awakening', 'binding-of-ancestors', 'border-escalation']);

export function buildQuestLog(state: WorldState): QuestLogEntryView[] {
  const entries = QUESTS.map((quest) => {
    const questState = state.quests[quest.id];
    const status = questState?.status ?? 'inactive';
    const completedStepIds = new Set(questState?.completedStepIds ?? []);
    const currentStepId = status === 'active'
      ? quest.steps.find((step) => !completedStepIds.has(step.id))?.id ?? null
      : null;

    return {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      status,
      steps: quest.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        locationId: step.locationId ?? null,
        completed: completedStepIds.has(step.id),
        current: currentStepId === step.id
      })),
      rewardGold: quest.reward?.gold ?? 0,
      rewardItemIds: quest.reward?.itemIds ?? []
    };
  });
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const statusOrder = QUEST_STATUS_ORDER[a.entry.status] - QUEST_STATUS_ORDER[b.entry.status];
      if (statusOrder !== 0) return statusOrder;
      if (a.entry.status === 'active') {
        const mainOrder = Number(!MAIN_QUEST_IDS.has(a.entry.id)) - Number(!MAIN_QUEST_IDS.has(b.entry.id));
        if (mainOrder !== 0) return mainOrder;
      }
      return a.index - b.index;
    })
    .map(({ entry }) => entry);
}

export function getTrackedQuestObjective(state: WorldState): TrackedQuestObjectiveView | null {
  const quest = buildQuestLog(state).find((entry) => entry.status === 'active');
  const step = quest?.steps.find((entry) => entry.current);
  if (!quest || !step) return null;

  if (!step.locationId) {
    return {
      questId: quest.id,
      questTitle: quest.title,
      stepId: step.id,
      stepTitle: step.title,
      stepDescription: step.description,
      locationId: null,
      locationName: null,
      mapId: null,
      position: null,
      status: 'missing-location',
      hint: 'Aktuelles Ziel hat noch keinen Kartenanker.'
    };
  }

  const location = allLocations.find((entry) => entry.id === step.locationId);
  if (!location) {
    return {
      questId: quest.id,
      questTitle: quest.title,
      stepId: step.id,
      stepTitle: step.title,
      stepDescription: step.description,
      locationId: step.locationId,
      locationName: null,
      mapId: null,
      position: null,
      status: 'missing-location',
      hint: `Zielort '${step.locationId}' ist nicht in den Weltdaten definiert.`
    };
  }

  const visible = getMapLocations(location.mapId, state).some((entry) => entry.id === location.id);
  return {
    questId: quest.id,
    questTitle: quest.title,
    stepId: step.id,
    stepTitle: step.title,
    stepDescription: step.description,
    locationId: location.id,
    locationName: location.name,
    mapId: location.mapId,
    position: location.position,
    status: visible ? 'visible' : 'locked',
    hint: visible
      ? `Zielmarker: ${location.name}`
      : `Zielort bekannt, aber noch nicht markiert: ${location.name}`
  };
}

export function buildCodexView(state: WorldState): LoreEntryView[] {
  return allLoreEntries.map((entry) => {
    const unlocked = !entry.unlockFlag || state.flags[entry.unlockFlag] === true;
    return {
      id: entry.id,
      title: unlocked ? entry.title : (entry.lockedTitle ?? entry.title),
      category: entry.category,
      unlocked,
      newlyUnlocked: unlocked && entry.unlockFlag?.startsWith('codex.') === true,
      body: unlocked ? entry.body : null
    };
  });
}

export type EndingKind = 'freedom' | 'order' | 'true';

export interface EndingView {
  readonly kind: EndingKind;
  readonly flag: string;
  readonly title: string;
  readonly body: string;
}

// Reihenfolge = Priorität (True > Ordnung > Freiheit), falls je mehrere Flags
// gesetzt wären. Titel/Text kommen aus den Codex-Einträgen, damit Ende-Bildschirm
// und Codex dieselbe Quelle nutzen.
const ENDINGS: ReadonlyArray<{ readonly kind: EndingKind; readonly flag: string; readonly loreId: string }> = [
  { kind: 'true', flag: 'ending.true', loreId: 'ending-true' },
  { kind: 'order', flag: 'ending.order', loreId: 'ending-order' },
  { kind: 'freedom', flag: 'ending.freedom', loreId: 'ending-freedom' }
];

export interface EndingGalleryEntry {
  readonly kind: EndingKind;
  readonly title: string;
  readonly body: string | null; // null, solange das Ende noch nicht erreicht wurde
  readonly seen: boolean;
}

// Ende-Galerie für den Abschlussbildschirm: zeigt alle drei Enden, deckt Titel/Text
// aber nur für bereits gesehene auf (aus dem persistenten Profil). So lassen sich über
// New Game+ die übrigen Enden nachholen, ohne sie vorab zu spoilern.
export function buildEndingGallery(seenKinds: readonly string[]): EndingGalleryEntry[] {
  const seen = new Set(seenKinds);
  return ENDINGS.map((ending) => {
    const lore = allLoreEntries.find((entry) => entry.id === ending.loreId);
    const isSeen = seen.has(ending.kind);
    return {
      kind: ending.kind,
      title: isSeen ? (lore?.title ?? ending.kind) : '??? — noch nicht erreicht',
      body: isSeen ? (lore?.body ?? null) : null,
      seen: isSeen
    };
  });
}

/** Das aktive Story-Ende (oder `null`), abgeleitet aus den `ending.*`-Flags. */
export function getActiveEnding(state: WorldState): EndingView | null {
  for (const ending of ENDINGS) {
    if (state.flags[ending.flag] !== true) continue;
    const lore = allLoreEntries.find((entry) => entry.id === ending.loreId);
    if (lore) {
      return { kind: ending.kind, flag: ending.flag, title: lore.title, body: lore.body };
    }
  }
  return null;
}

export function getDialogView(state: WorldState, dialogId: string, nodeId: string): DialogView {
  const dialog = requireDialog(dialogId);
  const node = requireDialogNode(dialog, nodeId);
  return {
    dialogId,
    nodeId,
    speaker: node.speaker,
    text: node.text,
    choices: node.choices.filter((choice) => requirementsMet(state, choice.requirements ?? []))
  };
}

export function chooseDialogOption(
  state: WorldState,
  dialogId: string,
  nodeId: string,
  choiceId: string
): WorldResult<{ readonly world: WorldState; readonly next: DialogView | null }> {
  const view = getDialogView(state, dialogId, nodeId);
  const choice = view.choices.find((candidate) => candidate.id === choiceId);
  if (!choice) {
    return { ok: false, state: { world: state, next: view }, message: 'Dialogauswahl ist nicht verfügbar.' };
  }

  const nextWorld = applyEffects(state, choice.effects ?? []);
  const next = choice.nextNodeId ? getDialogView(nextWorld, dialogId, choice.nextNodeId) : null;
  return { ok: true, state: { world: nextWorld, next }, message: choice.label };
}

export function buildShopView(state: WorldState, shopId: string): ShopView {
  const shop = requireShop(shopId);
  const itemRequirements = new Map(
    (shop.itemRequirements ?? []).map((entry) => [entry.itemId, entry.requirements])
  );
  return {
    id: shop.id,
    name: shop.name,
    gold: state.gold,
    items: shop.itemIds.flatMap((itemId): ShopItemView[] => {
      if (!requirementsMet(state, itemRequirements.get(itemId) ?? [])) return [];
      const item = itemById.get(itemId);
      if (!item) return [];
      return [{
        itemId,
        name: item.name,
        quantity: getItemCount(state.inventory, itemId),
        buyPrice: Math.round(item.price * shop.buyMultiplier),
        sellPrice: Math.max(1, Math.floor(item.price * shop.sellMultiplier))
      }];
    })
  };
}

export function buyItem(state: WorldState, shopId: string, itemId: string, quantity = 1): WorldResult {
  const shopItem = buildShopView(state, shopId).items.find((item) => item.itemId === itemId);
  if (!shopItem) {
    return { ok: false, state, message: 'Item wird hier nicht verkauft.' };
  }

  const total = shopItem.buyPrice * quantity;
  if (state.gold < total) {
    return { ok: false, state, message: 'Nicht genug Gold.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - total,
      inventory: addInventoryItem(state.inventory, itemId, quantity)
    },
    message: `${shopItem.name} gekauft.`
  };
}

export function sellItem(state: WorldState, shopId: string, itemId: string, quantity = 1): WorldResult {
  const shopItem = buildShopView(state, shopId).items.find((item) => item.itemId === itemId);
  if (!shopItem) {
    return { ok: false, state, message: 'Item kann hier nicht verkauft werden.' };
  }
  if (getItemCount(state.inventory, itemId) < quantity) {
    return { ok: false, state, message: 'Item nicht im Inventar.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold + shopItem.sellPrice * quantity,
      inventory: removeInventoryItem(state.inventory, itemId, quantity)
    },
    message: `${shopItem.name} verkauft.`
  };
}

export function resolveEncounter(
  state: WorldState,
  mapId: string,
  position: Vec2,
  rng: Rng
): WorldResult<{ readonly world: WorldState; readonly encounter: EncounterDefinition | null }> {
  const trigger = getMapEncounters(mapId).find((encounter) =>
    encounter.kind === 'trigger'
    && encounter.position
    && encounter.position.x === position.x
    && encounter.position.y === position.y
    && !state.flags[`encounter.${encounter.id}.cleared`]
    && requirementsMet(state, encounter.requirements ?? [])
  );
  if (trigger) {
    return {
      ok: true,
      state: {
        world: applyEffects(state, trigger.startEffects ?? []),
        encounter: trigger
      },
      message: 'Begegnung ausgelöst.'
    };
  }

  const random = getMapEncounters(mapId).find((encounter) =>
    encounter.kind === 'random'
    && encounter.bounds
    && inBounds(position, encounter.bounds)
    && requirementsMet(state, encounter.requirements ?? [])
    // Zu starke Party → Zufallsmonster greifen nicht mehr an (rng bleibt unverbraucht).
    && !partyOutlevels(state, encounter)
    && rng() < encounter.chance
  );

  return {
    ok: true,
    state: { world: state, encounter: random ?? null },
    message: random ? 'Zufallsbegegnung.' : 'Keine Begegnung.'
  };
}

export function completeEncounter(state: WorldState, encounterId: string): WorldResult {
  const encounter = requireEncounter(encounterId);
  const clearedFlag = `encounter.${encounter.id}.cleared`;
  if (encounter.kind === 'trigger' && state.flags[clearedFlag]) {
    return { ok: true, state, message: 'Begegnung war bereits abgeschlossen.' };
  }

  const effects: WorldEffect[] = [
    ...(encounter.kind === 'trigger'
      ? [{ type: 'set-flag' as const, flag: clearedFlag, value: true }]
      : []),
    ...(encounter.victoryEffects ?? [])
  ];

  return {
    ok: true,
    state: applyEffects(state, effects),
    message: 'Begegnung abgeschlossen.'
  };
}

// Wendet eine Liste von Welteffekten auf den WorldState an (rein/funktional). Öffentlich,
// damit Story-Effekte – inkl. `recruit-character` – auch ohne Dialog-/Encounter-Umweg
// testbar und programmatisch nutzbar sind.
export function applyEffects(state: WorldState, effects: readonly WorldEffect[]): WorldState {
  return effects.reduce((current, effect) => applyEffect(current, effect), state);
}

function applyEffect(state: WorldState, effect: WorldEffect): WorldState {
  switch (effect.type) {
    case 'set-flag':
      return { ...state, flags: { ...state.flags, [effect.flag]: effect.value } };
    case 'start-quest': {
      const currentQuest = state.quests[effect.questId];
      const nextQuest = !currentQuest || currentQuest.status === 'inactive'
        ? { status: 'active' as const, completedStepIds: currentQuest?.completedStepIds ?? [] }
        : currentQuest;
      return {
        ...state,
        quests: {
          ...state.quests,
          [effect.questId]: nextQuest
        }
      };
    }
    case 'complete-quest-step': {
      const quest = state.quests[effect.questId] ?? { status: 'active', completedStepIds: [] };
      return {
        ...state,
        quests: {
          ...state.quests,
          [effect.questId]: {
            ...quest,
            status: quest.status === 'inactive' ? 'active' : quest.status,
            completedStepIds: [...new Set([...quest.completedStepIds, effect.stepId])]
          }
        }
      };
    }
    case 'complete-quest': {
      const quest = state.quests[effect.questId] ?? { status: 'active', completedStepIds: [] };
      return {
        ...state,
        quests: {
          ...state.quests,
          [effect.questId]: { ...quest, status: 'completed' }
        }
      };
    }
    case 'add-item':
      return { ...state, inventory: addInventoryItem(state.inventory, effect.itemId, effect.quantity) };
    case 'add-gold':
      return { ...state, gold: Math.max(0, state.gold + effect.amount) };
    case 'restore-party':
      return state.party
        ? { ...state, party: state.party.map(restorePartyMember) }
        : state;
    case 'recruit-character': {
      // Idempotent: schon im Roster → unverändert. So bleibt ein wiederholt ausgelöster
      // Dialog/Encounter belohnungs- und mitgliederneutral.
      const roster = state.roster ?? [];
      if (roster.includes(effect.characterId)) return state;
      return { ...state, roster: [...roster, effect.characterId] };
    }
  }
}

function restorePartyMember(member: PartyMemberState): PartyMemberState {
  const hero = HEROES.find((candidate) => candidate.id === member.characterId);
  if (!hero) return member;
  const restored = createPartyMember(hero, {
    level: member.level,
    experience: member.experience,
    learnedSkillIds: member.learnedSkillIds
  });
  return {
    ...member,
    currentHp: restored.currentHp,
    currentMp: restored.currentMp
  };
}

function requirementsMet(state: WorldState, requirements: readonly WorldRequirement[]): boolean {
  return requirements.every((requirement) => {
    if (requirement.flag && state.flags[requirement.flag] !== true) return false;
    if (requirement.notFlag && state.flags[requirement.notFlag] === true) return false;
    if (requirement.questStatus) {
      const current = state.quests[requirement.questStatus.questId]?.status ?? 'inactive';
      if (current !== requirement.questStatus.status) return false;
    }
    if (requirement.questStep) {
      const completed = state.quests[requirement.questStep.questId]?.completedStepIds ?? [];
      if (!completed.includes(requirement.questStep.stepId)) return false;
    }
    if (requirement.missingQuestStep) {
      const completed = state.quests[requirement.missingQuestStep.questId]?.completedStepIds ?? [];
      if (completed.includes(requirement.missingQuestStep.stepId)) return false;
    }
    return true;
  });
}

function requireNpc(npcId: string): NpcDefinition {
  const npc = npcById.get(npcId);
  if (!npc) throw new Error(`Unknown NPC '${npcId}'.`);
  return npc;
}

function requireShop(shopId: string): ShopDefinition {
  const shop = shopById.get(shopId);
  if (!shop) throw new Error(`Unknown shop '${shopId}'.`);
  return shop;
}

function requireDialog(dialogId: string): DialogDefinition {
  const dialog = dialogsById.get(dialogId);
  if (!dialog) throw new Error(`Unknown dialog '${dialogId}'.`);
  return dialog;
}

function requireEncounter(encounterId: string): EncounterDefinition {
  const encounter = encounterById.get(encounterId);
  if (!encounter) throw new Error(`Unknown encounter '${encounterId}'.`);
  return encounter;
}

function requireDialogNode(dialog: DialogDefinition, nodeId: string): DialogNodeDefinition {
  const node = dialog.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) throw new Error(`Unknown dialog node '${dialog.id}.${nodeId}'.`);
  return node;
}

function isAdjacentOrSame(a: Vec2, b: Vec2): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1;
}

function inBounds(position: Vec2, bounds: { readonly x: number; readonly y: number; readonly width: number; readonly height: number }): boolean {
  return position.x >= bounds.x
    && position.y >= bounds.y
    && position.x < bounds.x + bounds.width
    && position.y < bounds.y + bounds.height;
}
