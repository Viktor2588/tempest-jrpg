import { HEROES } from '../data';
import { createInitialInventory, normalizeInventoryStacks } from './inventory';
import type { InventoryStack } from './inventory';
import { createInitialParty, createPartyMember } from './party';
import type { PartyMemberState } from './party';
import { MAX_ACTIVE_PARTY_SIZE } from './partyFormation';
import {
  createProgressionState,
  normalizeProgressionState,
  type ProgressionState
} from './progression';
import { clampNonNegativeInteger } from './stats';

export const CURRENT_SAVE_VERSION = 3;
export const SAVE_STORAGE_KEY = 'tempest-chronik.save.v3';
export const LEGACY_SAVE_STORAGE_KEYS = ['tempest-chronik.save.v2'] as const;

// Phase 90 — Mehrere Speicher-Slots. Slot 1 nutzt den bestehenden Basis-Key (so
// wird ein vorhandener Einzel-Save nahtlos zu Slot 1, ohne Migration); weitere
// Slots hängen ein Suffix an. Der aktive Slot steht in einem eigenen Key; die
// Save-Funktionen defaulten darauf, damit die Spielszenen unverändert bleiben.
export const SAVE_SLOT_COUNT = 3;
export const ACTIVE_SLOT_STORAGE_KEY = 'tempest-chronik.activeSlot';

export function slotSaveKey(slot: number): string {
  return slot <= 1 ? SAVE_STORAGE_KEY : `${SAVE_STORAGE_KEY}.slot${slot}`;
}

export function getActiveSlot(storage: StorageLike): number {
  const raw = Number.parseInt(storage.getItem(ACTIVE_SLOT_STORAGE_KEY) ?? '', 10);
  return Number.isInteger(raw) && raw >= 1 && raw <= SAVE_SLOT_COUNT ? raw : 1;
}

export function setActiveSlot(storage: StorageLike, slot: number): void {
  const clamped = Math.min(SAVE_SLOT_COUNT, Math.max(1, Math.trunc(slot)));
  storage.setItem(ACTIVE_SLOT_STORAGE_KEY, String(clamped));
}

export function activeSaveKey(storage: StorageLike): string {
  return slotSaveKey(getActiveSlot(storage));
}

export interface SaveSlotInfo {
  readonly slot: number;
  readonly save: SaveGameV3 | null;
}

// Übersicht aller Slots für die Auswahl-UI — pro Slot der geladene Save (oder null).
export function listSaveSlots(storage: StorageLike): SaveSlotInfo[] {
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => {
    const slot = index + 1;
    return { slot, save: loadSave(storage, slotSaveKey(slot)) };
  });
}

export type Direction = 'down' | 'left' | 'right' | 'up';
export type QuestStatus = 'inactive' | 'active' | 'completed';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SaveLocation {
  readonly mapId: string;
  readonly x: number;
  readonly y: number;
  readonly facing: Direction;
}

export interface QuestState {
  readonly status: QuestStatus;
  readonly completedStepIds: readonly string[];
}

export interface SaveGameV3 {
  readonly schemaVersion: typeof CURRENT_SAVE_VERSION;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly seed: number;
  readonly playtimeSeconds: number;
  // Phase 101 — Welt-Uhr: fortlaufender Schrittzähler, aus dem systems/worldClock
  // deterministisch Tageszeit + Wetter ableitet. Optional/rückwärtskompatibel
  // (fehlt er in Altständen, startet die Uhr bei 0 = Morgen).
  readonly clockStep: number;
  readonly location: SaveLocation;
  readonly party: {
    readonly active: readonly PartyMemberState[];
    readonly reserve: readonly PartyMemberState[];
    readonly gold: number;
  };
  readonly inventory: {
    readonly stacks: readonly InventoryStack[];
  };
  readonly flags: Readonly<Record<string, boolean>>;
  readonly quests: Readonly<Record<string, QuestState>>;
  readonly progression: ProgressionState;
}

export type SaveGameV2 = SaveGameV3;

export interface CreateSaveOptions {
  readonly now?: string;
  readonly seed?: number;
}

export function createNewSave(options: CreateSaveOptions = {}): SaveGameV3 {
  const now = options.now ?? new Date().toISOString();

  return {
    schemaVersion: CURRENT_SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    seed: options.seed ?? 1,
    playtimeSeconds: 0,
    clockStep: 0,
    location: DEFAULT_LOCATION,
    party: {
      active: createInitialParty(),
      reserve: [],
      gold: 120
    },
    inventory: {
      stacks: createInitialInventory()
    },
    flags: {},
    quests: {},
    progression: createProgressionState()
  };
}

// New Game+: startet eine frische Story (Flags/Quests/Ort zurückgesetzt), trägt aber
// Party-Level/-Skills, Ausrüstung, Inventar, Gold und Progression mit. Die Party wird
// dabei voll geheilt, damit der neue Durchgang nicht mit angeschlagenem Team beginnt.
export function startNewGamePlus(save: SaveGameV3, now = new Date().toISOString()): SaveGameV3 {
  const fresh = createNewSave({ now, seed: save.seed });
  return normalize(
    {
      ...fresh,
      createdAt: save.createdAt,
      party: {
        active: save.party.active.map(carryOverMember),
        reserve: save.party.reserve.map(carryOverMember),
        gold: save.party.gold
      },
      inventory: save.inventory,
      progression: save.progression
    },
    now
  );
}

function carryOverMember(member: PartyMemberState): PartyMemberState {
  const definition = HEROES.find((hero) => hero.id === member.characterId);
  if (!definition) return member;
  // Über createPartyMember neu aufbauen → currentHp/MP = Maximum (volle Heilung),
  // Level/Erfahrung/erlernte Skills bleiben erhalten; Name/Ausrüstung übernehmen.
  const restored = createPartyMember(definition, {
    level: member.level,
    experience: member.experience,
    formationRow: member.formationRow,
    learnedSkillIds: member.learnedSkillIds
  });
  return { ...restored, name: member.name, equipment: member.equipment };
}

export function normalize(save: SaveGameV3, updatedAt = save.updatedAt): SaveGameV3 {
  const active = normalizePartyMembers(save.party.active);
  const reserve = normalizePartyMembers(save.party.reserve);
  const quests = normalizeQuestRecord(save.quests);
  const flags = normalizeLegacyArcFlags(normalizeBooleanRecord(save.flags), quests);
  const baseParty = active.length > 0 ? active : createInitialParty();
  const fallbackParty = backfillStoryRecruits(baseParty, reserve, flags);

  return {
    schemaVersion: CURRENT_SAVE_VERSION,
    createdAt: safeString(save.createdAt, updatedAt),
    updatedAt,
    seed: clampNonNegativeInteger(save.seed),
    playtimeSeconds: clampNonNegativeInteger(save.playtimeSeconds),
    clockStep: clampNonNegativeInteger(save.clockStep),
    location: normalizeLocation(save.location),
    party: {
      active: fallbackParty.active,
      reserve: fallbackParty.reserve,
      gold: clampNonNegativeInteger(save.party.gold)
    },
    inventory: {
      stacks: normalizeInventoryStacks(save.inventory.stacks)
    },
    flags,
    quests,
    progression: normalizeProgressionState(save.progression)
  };
}

// Rückwärtskompatibilität für den story-gesteuerten Party-Aufbau: Trägt Story-Rekruten
// anhand gesetzter Flags nach, falls ein älterer Stand sie noch nicht als Mitglieder führt
// (z. B. vor Einführung des Rekrutierungssystems). Vorhandene Mitglieder (aktiv ODER
// Reserve) bleiben unangetastet. Freie aktive Plätze werden zuerst belegt, weitere
// nachgetragene Figuren landen in der Reserve.
function backfillStoryRecruits(
  active: PartyMemberState[],
  reserve: PartyMemberState[],
  flags: Readonly<Record<string, boolean>>
): { active: PartyMemberState[]; reserve: PartyMemberState[] } {
  const present = new Set([...active, ...reserve].map((member) => member.characterId));
  const resultActive = [...active];
  const resultReserve = [...reserve];
  const ensure = (flag: string, characterId: string): void => {
    if (!flags[flag] || present.has(characterId)) return;
    const definition = HEROES.find((hero) => hero.id === characterId);
    if (definition) {
      const member = createPartyMember(definition);
      if (resultActive.length < MAX_ACTIVE_PARTY_SIZE) {
        resultActive.push(member);
      } else {
        resultReserve.push(member);
      }
      present.add(characterId);
    }
  };
  ensure('story.goblin.plea', 'gobta');
  ensure('story.direwolf.pact', 'ranga');
  ensure('story.council.ready', 'rigurd');
  return { active: resultActive, reserve: resultReserve };
}

export function migrate(raw: unknown, now = new Date().toISOString()): SaveGameV3 {
  if (!isRecord(raw)) {
    throw new Error('Savegame muss ein JSON-Objekt sein.');
  }

  if (raw.schemaVersion === CURRENT_SAVE_VERSION) {
    return normalize(readCurrentSave(raw, now));
  }

  if (raw.schemaVersion === 2) {
    return normalize(readCurrentSave(raw, now));
  }

  if (raw.schemaVersion === 1 || raw.schemaVersion === undefined) {
    return migrateV1(raw, now);
  }

  throw new Error(`Savegame-Version '${String(raw.schemaVersion)}' wird nicht unterstützt.`);
}

export function exportSave(save: SaveGameV3): string {
  return JSON.stringify(normalize(save), null, 2);
}

export function importSave(json: string, now = new Date().toISOString()): SaveGameV3 {
  return migrate(JSON.parse(json) as unknown, now);
}

// Ein beschädigter/nicht unterstützter localStorage-Eintrag (unterbrochener Write,
// Browser-Eviction, künftige Save-Version) darf das Booten NICHT crashen — sonst
// haengt der Titelbildschirm und der Spieler kommt nicht mal zu „neues Spiel".
// Auto-Load faellt still auf null zurueck; jeder Aufrufer behandelt null bereits
// (?? createNewSave()). importSave bleibt strikt fuer explizite Importe.
function tryImport(json: string): SaveGameV3 | null {
  try {
    return importSave(json);
  } catch {
    return null;
  }
}

export function loadSave(storage: StorageLike, key = activeSaveKey(storage)): SaveGameV3 | null {
  const stored = storage.getItem(key);
  if (stored !== null) {
    return tryImport(stored);
  }
  if (key !== SAVE_STORAGE_KEY) {
    return null;
  }
  for (const legacyKey of LEGACY_SAVE_STORAGE_KEYS) {
    const legacy = storage.getItem(legacyKey);
    if (legacy !== null) {
      const migrated = tryImport(legacy);
      if (migrated === null) {
        continue;
      }
      storage.setItem(SAVE_STORAGE_KEY, exportSave(migrated));
      return migrated;
    }
  }
  return null;
}

export function writeSave(
  storage: StorageLike,
  save: SaveGameV3,
  key = activeSaveKey(storage)
): SaveGameV3 {
  const normalized = normalize(save);
  storage.setItem(key, exportSave(normalized));
  return normalized;
}

export function autoSave(
  storage: StorageLike,
  save: SaveGameV3,
  now = new Date().toISOString(),
  key = activeSaveKey(storage)
): SaveGameV3 {
  const normalized = normalize({ ...save, updatedAt: now }, now);
  storage.setItem(key, exportSave(normalized));
  return normalized;
}

export function resetSave(storage: StorageLike, key = activeSaveKey(storage)): void {
  storage.removeItem(key);
  if (key === SAVE_STORAGE_KEY) {
    for (const legacyKey of LEGACY_SAVE_STORAGE_KEYS) {
      storage.removeItem(legacyKey);
    }
  }
}

const DEFAULT_LOCATION: SaveLocation = {
  mapId: 'sealed-cave',
  x: 7,
  y: 6,
  facing: 'up'
};

function migrateV1(raw: Record<string, unknown>, now: string): SaveGameV3 {
  const activeParty = Array.isArray(raw.activeParty) ? raw.activeParty : [];
  const inventory = isRecord(raw.inventory) ? raw.inventory : {};

  return normalize(
    {
      schemaVersion: CURRENT_SAVE_VERSION,
      createdAt: safeString(raw.createdAt, now),
      updatedAt: now,
      seed: safeNumber(raw.seed, 1),
      playtimeSeconds: safeNumber(raw.playtimeSeconds, 0),
      clockStep: safeNumber(raw.clockStep, 0),
      location: {
        mapId: safeString(raw.mapId, DEFAULT_LOCATION.mapId),
        x: safeNumber(raw.x, DEFAULT_LOCATION.x),
        y: safeNumber(raw.y, DEFAULT_LOCATION.y),
        facing: readDirection(raw.facing)
      },
      party: {
        active: activeParty.flatMap(readLegacyPartyMember),
        reserve: [],
        gold: safeNumber(raw.gold, 0)
      },
      inventory: {
        stacks: Object.entries(inventory).map(([itemId, quantity]) => ({
          itemId,
          quantity: safeNumber(quantity, 0)
        }))
      },
      flags: isRecord(raw.flags) ? normalizeBooleanRecord(raw.flags) : {},
      quests: {},
      progression: createProgressionState()
    },
    now
  );
}

function readCurrentSave(raw: Record<string, unknown>, now: string): SaveGameV3 {
  const party = isRecord(raw.party) ? raw.party : {};
  const inventory = isRecord(raw.inventory) ? raw.inventory : {};

  return {
    schemaVersion: CURRENT_SAVE_VERSION,
    createdAt: safeString(raw.createdAt, now),
    updatedAt: safeString(raw.updatedAt, now),
    seed: safeNumber(raw.seed, 1),
    playtimeSeconds: safeNumber(raw.playtimeSeconds, 0),
    clockStep: safeNumber(raw.clockStep, 0),
    location: isRecord(raw.location) ? readLocation(raw.location) : DEFAULT_LOCATION,
    party: {
      active: readPartyMemberArray(party.active),
      reserve: readPartyMemberArray(party.reserve),
      gold: safeNumber(party.gold, 0)
    },
    inventory: {
      stacks: readInventoryStacks(inventory.stacks)
    },
    flags: isRecord(raw.flags) ? normalizeBooleanRecord(raw.flags) : {},
    quests: isRecord(raw.quests) ? normalizeQuestRecord(raw.quests) : {},
    progression: readProgressionState(raw.progression)
  };
}

function readLegacyPartyMember(raw: unknown): PartyMemberState[] {
  if (!isRecord(raw)) {
    return [];
  }

  const characterId = safeString(raw.characterId ?? raw.id, '');
  const definition = HEROES.find((hero) => hero.id === characterId);
  if (!definition) {
    return [];
  }

  return [
    createPartyMember(definition, {
      level: safeNumber(raw.level, definition.initialLevel),
      experience: safeNumber(raw.experience ?? raw.xp, definition.initialExperience),
      learnedSkillIds: Array.isArray(raw.learnedSkillIds)
        ? raw.learnedSkillIds.filter((skillId): skillId is string => typeof skillId === 'string')
        : []
    })
  ];
}

function readPartyMemberArray(raw: unknown): PartyMemberState[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap(readPartyMember);
}

function readPartyMember(raw: unknown): PartyMemberState[] {
  if (!isRecord(raw)) {
    return [];
  }

  const characterId = safeString(raw.characterId, '');
  const definition = HEROES.find((hero) => hero.id === characterId);
  if (!definition) {
    return [];
  }

  const member = createPartyMember(definition, {
    level: safeNumber(raw.level, definition.initialLevel),
    experience: safeNumber(raw.experience, definition.initialExperience),
    formationRow: safeFormationRow(raw.formationRow),
    learnedSkillIds: Array.isArray(raw.learnedSkillIds)
      ? raw.learnedSkillIds.filter((skillId): skillId is string => typeof skillId === 'string')
      : []
  });

  return [
    {
      ...member,
      name: safeString(raw.name, member.name),
      currentHp: clampNonNegativeInteger(safeNumber(raw.currentHp, member.currentHp)),
      currentMp: clampNonNegativeInteger(safeNumber(raw.currentMp, member.currentMp)),
      equipment: isRecord(raw.equipment)
        ? {
            weapon: safeNullableString(raw.equipment.weapon),
            armor: safeNullableString(raw.equipment.armor),
            accessory: safeNullableString(raw.equipment.accessory),
            // Phase 150 — Kern-Slot: alte Stände ohne `core` → null (keine Bruchgefahr).
            core: safeNullableString(raw.equipment.core)
          }
        : member.equipment
    }
  ];
}

function normalizePartyMembers(members: readonly PartyMemberState[]): PartyMemberState[] {
  return readPartyMemberArray(members);
}

function safeFormationRow(value: unknown): PartyMemberState['formationRow'] {
  return value === 'back' ? 'back' : 'front';
}

function readInventoryStacks(raw: unknown): InventoryStack[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((stack): InventoryStack[] => {
    if (!isRecord(stack)) {
      return [];
    }

    return [
      {
        itemId: safeString(stack.itemId, ''),
        quantity: safeNumber(stack.quantity, 0)
      }
    ];
  });
}

function readProgressionState(raw: unknown): ProgressionState {
  if (!isRecord(raw)) {
    return createProgressionState();
  }
  return createProgressionState({
    evolutionIdsByCharacterId: readStringRecord(raw.evolutionIdsByCharacterId),
    relationshipPoints: readNumberRecord(raw.relationshipPoints),
    discoveredRegionIds: readStringArray(raw.discoveredRegionIds),
    skillPointsByCharacterId: readNumberRecord(raw.skillPointsByCharacterId),
    unlockedSkillNodeIdsByCharacterId: readStringArrayRecord(
      raw.unlockedSkillNodeIdsByCharacterId
    ),
    enchantmentLevelsByEquipmentKey: readNumberRecord(raw.enchantmentLevelsByEquipmentKey),
    // Phase 91 — Die Schmiede: alte Spielstände ohne dieses Feld erhalten []
    // (noch nichts geschmiedet), einmalige Rezepte bleiben verfügbar.
    craftedRecipeIds: readStringArray(raw.craftedRecipeIds),
    // Phase 92 — Bewohner: alte Stände ohne dieses Feld starten mit leerem Roster.
    residentIds: readStringArray(raw.residentIds),
    // Phase 93 — Einrichtungen: alte Stände ohne Zähler starten bei 0 Produktionszyklen.
    productionCycles: readNonNegativeInteger(raw.productionCycles),
    // Phase 102 — Magicules: alte Stände starten ohne angesparten Pool.
    magicules: readNonNegativeInteger(raw.magicules),
    // Phase 127 — Seelen: alte Stände starten ohne geerntete Seelen (0).
    souls: readNonNegativeInteger(raw.souls),
    // Phase 103 — Offiziere: alte Stände haben noch keine befoerderten Bewohner.
    promotedResidentIds: readStringArray(raw.promotedResidentIds),
    // Phase 104 — Erntefest: alte Stände haben das einmalige Erwachen noch offen.
    awakeningCompleted: raw.awakeningCompleted === true,
    awakenedResidentIds: readStringArray(raw.awakenedResidentIds),
    // Phase 96 — Kopfgeldbrett: alte Stände ohne diese Zähler starten ohne
    // Erlegungen/Einlösungen (createProgressionState normalisiert auf {}).
    defeatedEnemyCountsByEnemyId: readNumberRecord(raw.defeatedEnemyCountsByEnemyId),
    claimedBountyCountsByBountyId: readNumberRecord(raw.claimedBountyCountsByBountyId),
    // Phase 100 — Diplomatie: alte Stände ohne Reputationskarte starten neutral
    // (createProgressionState normalisiert auf {}).
    factionReputationByFactionId: readNumberRecord(raw.factionReputationByFactionId),
    // Phase 122 — Lebendiges Bestiarium: alte Stände ohne dieses Feld starten mit
    // leerem Analyse-Wissen (nichts studiert), Codex zeigt Kampfdaten als „???".
    analyzedEnemyIds: readStringArray(raw.analyzedEnemyIds),
    // Phase 148 — Boss-Echos: alte Stände ohne dieses Feld starten mit leerer
    // Verschlingungs-Historie (nichts verschlungen → alle besiegten Bosse echo-fähig).
    devouredSourceIds: readStringArray(raw.devouredSourceIds)
  });
}

function readNonNegativeInteger(raw: unknown): number {
  return typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
}

function readStringRecord(raw: unknown): Record<string, string> {
  if (!isRecord(raw)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(raw).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  );
}

function readNumberRecord(raw: unknown): Record<string, number> {
  if (!isRecord(raw)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(raw).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === 'number' && Number.isFinite(entry[1])
    )
  );
}

function readStringArray(raw: unknown): string[] {
  return Array.isArray(raw)
    ? raw.filter((value): value is string => typeof value === 'string')
    : [];
}

function readStringArrayRecord(raw: unknown): Record<string, readonly string[]> {
  if (!isRecord(raw)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(raw)
      .filter((entry): entry is [string, unknown[]] => Array.isArray(entry[1]))
      .map(([key, values]) => [
        key,
        values.filter((value): value is string => typeof value === 'string')
      ])
  );
}

function readLocation(raw: Record<string, unknown>): SaveLocation {
  return {
    mapId: safeString(raw.mapId, DEFAULT_LOCATION.mapId),
    x: safeNumber(raw.x, DEFAULT_LOCATION.x),
    y: safeNumber(raw.y, DEFAULT_LOCATION.y),
    facing: readDirection(raw.facing)
  };
}

function normalizeLocation(location: SaveLocation): SaveLocation {
  return {
    mapId: safeString(location.mapId, DEFAULT_LOCATION.mapId),
    x: safeNumber(location.x, DEFAULT_LOCATION.x),
    y: safeNumber(location.y, DEFAULT_LOCATION.y),
    facing: readDirection(location.facing)
  };
}

function normalizeBooleanRecord(raw: Readonly<Record<string, unknown>>): Record<string, boolean> {
  const normalized: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'boolean') {
      normalized[key] = value;
    }
  }

  return normalized;
}

function normalizeLegacyArcFlags(
  flags: Record<string, boolean>,
  quests: Readonly<Record<string, QuestState>>
): Record<string, boolean> {
  if (flags['compat.legacyArc.visible']) {
    return flags['story.original-arc.optional'] ? flags : { ...flags, 'story.original-arc.optional': true };
  }
  const ancestorsChoiceStatus = quests['ancestors-choice']?.status ?? 'inactive';
  const hasOriginalArcProgress = ancestorsChoiceStatus !== 'inactive'
    || flags['story.act3.started'] === true
    || flags['story.act3.completed'] === true
    || flags['story.mordrahn.defeated'] === true
    || flags['ending.freedom'] === true
    || flags['ending.order'] === true
    || flags['ending.true'] === true;
  const isCanonBandFourProgress = flags['story.act2.completed'] === true
    || flags['story.border.deescalated'] === true
    || flags['story.vanguard.trace-read'] === true
    || flags['story.alliance.council-ready'] === true;
  return hasOriginalArcProgress && !isCanonBandFourProgress
    ? { ...flags, 'compat.legacyArc.visible': true, 'story.original-arc.optional': true }
    : flags;
}

function normalizeQuestRecord(raw: Readonly<Record<string, unknown>>): Record<string, QuestState> {
  const normalized: Record<string, QuestState> = {};

  for (const [questId, value] of Object.entries(raw)) {
    if (!isRecord(value)) {
      continue;
    }

    const status = readQuestStatus(value.status);
    const completedStepIds = Array.isArray(value.completedStepIds)
      ? value.completedStepIds.filter((stepId): stepId is string => typeof stepId === 'string')
      : [];

    normalized[questId] = { status, completedStepIds };
  }

  return normalized;
}

function readQuestStatus(raw: unknown): QuestStatus {
  return raw === 'active' || raw === 'completed' ? raw : 'inactive';
}

function readDirection(raw: unknown): Direction {
  return raw === 'left' || raw === 'right' || raw === 'up' || raw === 'down' ? raw : 'down';
}

function safeString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function safeNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
