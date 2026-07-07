import {
  CATCH_UP_CONFIG,
  ENEMIES,
  EQUIPMENT_SETS,
  EVOLUTIONS,
  HEROES,
  ITEMS,
  PROGRESSION_REGIONS,
  RELATIONSHIPS,
  SKILL_TREES,
  SKILLS,
  type CatchUpConfig,
  type CharacterDefinition,
  type EquipmentSetDefinition,
  type EquipmentSlot,
  type EvolutionDefinition,
  type ItemDefinition,
  type RegionProgressionDefinition,
  type RelationshipDefinition,
  type RelationshipLevelDefinition,
  type SkillDefinition,
  type SkillTreeDefinition,
  type SkillTreeNodeDefinition,
  type StatusEffectId,
  type StatBlock,
  type TalentPerk
} from '../data';
import { battleLoadoutSkillIds, createHeroBattleUnit, type BattleUnitInput } from './battle';
import { committedBranch, talentPerksForNodes } from './talentPerk';
import { calculateMemberBaseStats } from './menu';
import type { PartyMemberState } from './party';
import { uniqueStrings } from './party';
import { officerPerksForResidents } from './residents';
import {
  addPartialStats,
  addStats,
  clampLevel,
  clampNonNegativeInteger,
  experienceForLevel,
  levelForExperience,
  multiplyPartialStats,
  scaleStats
} from './stats';

export interface ProgressionState {
  readonly evolutionIdsByCharacterId: Readonly<Record<string, string>>;
  readonly relationshipPoints: Readonly<Record<string, number>>;
  readonly discoveredRegionIds: readonly string[];
  readonly skillPointsByCharacterId: Readonly<Record<string, number>>;
  readonly unlockedSkillNodeIdsByCharacterId: Readonly<Record<string, readonly string[]>>;
  readonly enchantmentLevelsByEquipmentKey: Readonly<Record<string, number>>;
  // Phase 91 — Die Schmiede: IDs bereits geschmiedeter, einmaliger Rezepte
  // (einzigartige Boss-Kern-Ausrüstung), damit sie nicht erneut angeboten werden.
  readonly craftedRecipeIds: readonly string[];
  // Phase 92 — Bewohner: IDs der als Bewohner in Tempest aufgenommenen (per Naming
  // verschlungenen) Gegner-Arten. Reiner Bestand; Phase 93 setzt Produktion darauf.
  readonly residentIds: readonly string[];
  // Phase 93 — Einrichtungen & Produktion: Anzahl bereits abgerechneter Rast-/
  // Produktions-Zyklen. Reiner Zaehler fuer Anzeige/Statistik (die Ausbeute selbst
  // fliesst direkt in Inventar/Gold), stellt aber eine klare Save-Migration bereit.
  readonly productionCycles: number;
  // Phase 102 — Magicule-/Seelen-Oekonomie: Meta-Ressource fuer spaeteres Benennen,
  // Evolution und Erwachen. Diese Phase verdient/zeigt nur an; Ausgaben folgen.
  readonly magicules: number;
  // Phase 103 — benannte Offiziere: Bewohner, die mit Magicules befoerdert wurden.
  readonly promotedResidentIds: readonly string[];
  // Phase 104 — Erntefest: einmaliges Massen-Erwachen, das Offiziere dauerhaft
  // verstaerkt und im NG+ ueber Progression erhalten bleibt.
  readonly awakeningCompleted: boolean;
  readonly awakenedResidentIds: readonly string[];
}

export interface CreateProgressionStateOptions {
  readonly evolutionIdsByCharacterId?: Readonly<Record<string, string>>;
  readonly relationshipPoints?: Readonly<Record<string, number>>;
  readonly discoveredRegionIds?: readonly string[];
  readonly skillPointsByCharacterId?: Readonly<Record<string, number>>;
  readonly unlockedSkillNodeIdsByCharacterId?: Readonly<Record<string, readonly string[]>>;
  readonly enchantmentLevelsByEquipmentKey?: Readonly<Record<string, number>>;
  readonly craftedRecipeIds?: readonly string[];
  readonly residentIds?: readonly string[];
  readonly productionCycles?: number;
  readonly magicules?: number;
  readonly promotedResidentIds?: readonly string[];
  readonly awakeningCompleted?: boolean;
  readonly awakenedResidentIds?: readonly string[];
}

export interface MemberActionResult {
  readonly ok: boolean;
  readonly member: PartyMemberState;
  readonly state: ProgressionState;
  readonly message: string;
}

export interface ProgressionActionResult {
  readonly ok: boolean;
  readonly state: ProgressionState;
  readonly message: string;
}

export interface SkillTreeUnlockContext {
  readonly flags?: Readonly<Record<string, boolean>>;
}

export interface CatchUpResult {
  readonly reserve: readonly PartyMemberState[];
  readonly targetLevel: number;
  readonly grantedExperience: number;
}

export interface EnchantmentResult {
  readonly ok: boolean;
  readonly state: ProgressionState;
  readonly gold: number;
  readonly message: string;
}

export interface BattleProgressionResult {
  readonly active: readonly PartyMemberState[];
  readonly reserve: readonly PartyMemberState[];
  readonly state: ProgressionState;
  readonly grantedSkillPoints: number;
}

export interface BalanceIssue {
  readonly path: string;
  readonly message: string;
}

const heroById = new Map<string, CharacterDefinition>(HEROES.map((hero) => [hero.id, hero]));
const skillById = new Map<string, SkillDefinition>(SKILLS.map((skill) => [skill.id, skill]));
const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));
const regionById = new Map<string, RegionProgressionDefinition>(
  PROGRESSION_REGIONS.map((region) => [region.id, region])
);
const relationshipById = new Map<string, RelationshipDefinition>(
  RELATIONSHIPS.map((relationship) => [relationship.id, relationship])
);
const evolutionById = new Map<string, EvolutionDefinition>(
  EVOLUTIONS.map((evolution) => [evolution.id, evolution])
);
const skillTreeByCharacterId = new Map<string, SkillTreeDefinition>(
  SKILL_TREES.map((tree) => [tree.characterId, tree])
);
const skillTreeNodeById = new Map<string, SkillTreeNodeDefinition>(
  SKILL_TREES.flatMap((tree) => tree.nodes.map((node) => [node.id, node] as const))
);
export const AWAKENING_MAGICULE_COST = 160;
export const AWAKENING_REQUIRED_FLAG = 'story.geld.devoured';
export const AWAKENING_SCENE_FLAG = 'story.harvest-festival.awakened';
const AWAKENED_RIMURU_PERKS: readonly TalentPerk[] = [
  { kind: 'max-hp', percent: 10 },
  { kind: 'damage-dealt', percent: 10 }
];

export function createProgressionState(options: CreateProgressionStateOptions = {}): ProgressionState {
  return {
    evolutionIdsByCharacterId: normalizeStringRecord(options.evolutionIdsByCharacterId ?? {}),
    relationshipPoints: normalizePointRecord(options.relationshipPoints ?? {}),
    discoveredRegionIds: uniqueStrings(options.discoveredRegionIds ?? []),
    skillPointsByCharacterId: normalizePointRecord(options.skillPointsByCharacterId ?? {}),
    unlockedSkillNodeIdsByCharacterId: normalizeStringArrayRecord(
      options.unlockedSkillNodeIdsByCharacterId ?? {}
    ),
    enchantmentLevelsByEquipmentKey: normalizePointRecord(
      options.enchantmentLevelsByEquipmentKey ?? {}
    ),
    craftedRecipeIds: uniqueStrings(options.craftedRecipeIds ?? []),
    residentIds: uniqueStrings(options.residentIds ?? []),
    productionCycles: clampNonNegativeInteger(options.productionCycles ?? 0),
    magicules: clampNonNegativeInteger(options.magicules ?? 0),
    promotedResidentIds: uniqueStrings(options.promotedResidentIds ?? []),
    awakeningCompleted: options.awakeningCompleted === true,
    awakenedResidentIds: uniqueStrings(options.awakenedResidentIds ?? [])
  };
}

export function normalizeProgressionState(state: CreateProgressionStateOptions): ProgressionState {
  return createProgressionState(state);
}

export function renameMember(
  member: PartyMemberState,
  givenName: string,
  state = createProgressionState()
): MemberActionResult {
  const normalized = normalizeGivenName(givenName);
  if (normalized.length < 2 || normalized.length > 20) {
    return {
      ok: false,
      member,
      state,
      message: 'Name muss zwischen 2 und 20 Zeichen lang sein.'
    };
  }

  return {
    ok: true,
    member: { ...member, name: normalized },
    state,
    message: `${member.name} trägt jetzt den Namen ${normalized}.`
  };
}

export function hasCustomName(member: PartyMemberState): boolean {
  const hero = heroById.get(member.characterId);
  return !!hero && member.name.trim().length > 0 && member.name.trim() !== hero.name;
}

export function getAvailableEvolutions(
  member: PartyMemberState,
  state: ProgressionState
): EvolutionDefinition[] {
  return EVOLUTIONS.filter((evolution) => canEvolve(member, state, evolution.id).ok);
}

export function getActiveEvolution(
  state: ProgressionState,
  characterId: string
): EvolutionDefinition | undefined {
  const evolutionId = state.evolutionIdsByCharacterId[characterId];
  return evolutionId ? evolutionById.get(evolutionId) : undefined;
}

export function canEvolve(
  member: PartyMemberState,
  state: ProgressionState,
  evolutionId: string
): ProgressionActionResult {
  const evolution = evolutionById.get(evolutionId);
  if (!evolution) {
    return { ok: false, state, message: 'Entwicklung nicht gefunden.' };
  }
  if (evolution.characterId !== member.characterId) {
    return { ok: false, state, message: 'Entwicklung passt nicht zu diesem Charakter.' };
  }
  if (state.evolutionIdsByCharacterId[member.characterId]) {
    return { ok: false, state, message: 'Charakter ist bereits entwickelt.' };
  }
  if (member.level < evolution.requiredLevel) {
    return { ok: false, state, message: `Level ${evolution.requiredLevel} erforderlich.` };
  }
  if (evolution.requiresCustomName && !hasCustomName(member)) {
    return { ok: false, state, message: 'Eine eigene Namensgebung ist erforderlich.' };
  }

  return { ok: true, state, message: `${member.name} kann sich zu ${evolution.formName} entwickeln.` };
}

export function evolveMember(
  member: PartyMemberState,
  state: ProgressionState,
  evolutionId: string
): MemberActionResult {
  const check = canEvolve(member, state, evolutionId);
  const evolution = evolutionById.get(evolutionId);
  if (!check.ok || !evolution) {
    return { ok: false, member, state, message: check.message };
  }

  const nextState = {
    ...state,
    evolutionIdsByCharacterId: {
      ...state.evolutionIdsByCharacterId,
      [member.characterId]: evolution.id
    },
    skillPointsByCharacterId: {
      ...state.skillPointsByCharacterId,
      [member.characterId]:
        (state.skillPointsByCharacterId[member.characterId] ?? 0) + evolution.skillPointReward
    }
  };
  const evolvedMember = {
    ...member,
    currentHp: member.currentHp + (evolution.statBonus.maxHp ?? 0),
    currentMp: member.currentMp + (evolution.statBonus.maxMp ?? 0),
    learnedSkillIds: uniqueStrings([...member.learnedSkillIds, ...evolution.skillIds])
  };

  return {
    ok: true,
    member: evolvedMember,
    state: nextState,
    message: `${member.name} entwickelt sich zu ${evolution.formName}.`
  };
}

export function discoverRegion(state: ProgressionState, regionId: string): ProgressionActionResult {
  if (!regionById.has(regionId)) {
    return { ok: false, state, message: 'Region nicht gefunden.' };
  }
  if (state.discoveredRegionIds.includes(regionId)) {
    return { ok: true, state, message: 'Region war bereits erkundet.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      discoveredRegionIds: [...state.discoveredRegionIds, regionId]
    },
    message: `Region ${regionById.get(regionId)!.name} erkundet.`
  };
}

export function grantRelationshipPoints(
  state: ProgressionState,
  relationshipId: string,
  points: number
): ProgressionActionResult {
  if (!relationshipById.has(relationshipId)) {
    return { ok: false, state, message: 'Beziehung nicht gefunden.' };
  }
  const grantedPoints = clampNonNegativeInteger(points);
  const nextPoints = (state.relationshipPoints[relationshipId] ?? 0) + grantedPoints;

  return {
    ok: true,
    state: {
      ...state,
      relationshipPoints: {
        ...state.relationshipPoints,
        [relationshipId]: nextPoints
      }
    },
    message: `Beziehung erhält ${grantedPoints} Punkte.`
  };
}

export function getRelationshipLevel(
  state: ProgressionState,
  relationshipId: string
): RelationshipLevelDefinition | null {
  const relationship = relationshipById.get(relationshipId);
  if (!relationship) {
    return null;
  }
  const points = state.relationshipPoints[relationshipId] ?? 0;
  return relationship.levels
    .filter((level) => points >= level.requiredPoints)
    .sort((a, b) => b.level - a.level)[0] ?? null;
}

export function getRelationshipLevelNumber(state: ProgressionState, relationshipId: string): number {
  return getRelationshipLevel(state, relationshipId)?.level ?? 0;
}

export function getSkillTree(characterId: string): SkillTreeDefinition | undefined {
  return skillTreeByCharacterId.get(characterId);
}

export function grantSkillPoints(
  state: ProgressionState,
  characterId: string,
  points: number
): ProgressionActionResult {
  if (!heroById.has(characterId)) {
    return { ok: false, state, message: 'Charakter nicht gefunden.' };
  }
  const granted = clampNonNegativeInteger(points);
  return {
    ok: true,
    state: {
      ...state,
      skillPointsByCharacterId: {
        ...state.skillPointsByCharacterId,
        [characterId]: (state.skillPointsByCharacterId[characterId] ?? 0) + granted
      }
    },
    message: `${granted} Skill-Punkte erhalten.`
  };
}

export function grantMagicules(state: ProgressionState, amount: number): ProgressionActionResult {
  const granted = clampNonNegativeInteger(amount);
  return {
    ok: true,
    state: {
      ...state,
      magicules: state.magicules + granted
    },
    message: `${granted} Magicules erhalten.`
  };
}

export function canAwakenTempest(
  state: ProgressionState,
  flags: Readonly<Record<string, boolean>> = {}
): ProgressionActionResult {
  if (state.awakeningCompleted) {
    return { ok: false, state, message: 'Das Erntefest wurde bereits vollzogen.' };
  }
  if (!flags[AWAKENING_REQUIRED_FLAG]) {
    return { ok: false, state, message: 'Sieg ueber Geld erforderlich.' };
  }
  if (state.promotedResidentIds.length === 0) {
    return { ok: false, state, message: 'Mindestens ein Offizier ist erforderlich.' };
  }
  if (state.magicules < AWAKENING_MAGICULE_COST) {
    return { ok: false, state, message: `${AWAKENING_MAGICULE_COST} Magicules erforderlich.` };
  }
  return { ok: true, state, message: 'Das Erntefest kann beginnen.' };
}

export function awakenTempest(
  state: ProgressionState,
  flags: Readonly<Record<string, boolean>> = {}
): ProgressionActionResult {
  const check = canAwakenTempest(state, flags);
  if (!check.ok) return check;
  return {
    ok: true,
    state: {
      ...state,
      magicules: state.magicules - AWAKENING_MAGICULE_COST,
      awakeningCompleted: true,
      awakenedResidentIds: uniqueStrings(state.promotedResidentIds)
    },
    message: 'Das Erntefest erweckt Tempests Offiziere.'
  };
}

export function canUnlockSkillNode(
  member: PartyMemberState,
  state: ProgressionState,
  nodeId: string,
  context: SkillTreeUnlockContext = {}
): ProgressionActionResult {
  const tree = getSkillTree(member.characterId);
  const node = skillTreeNodeById.get(nodeId);
  if (!tree || !node || !tree.nodes.some((candidate) => candidate.id === nodeId)) {
    return { ok: false, state, message: 'Skill-Knoten gehört nicht zu diesem Charakter.' };
  }
  const unlocked = state.unlockedSkillNodeIdsByCharacterId[member.characterId] ?? [];
  if (unlocked.includes(node.id)) {
    return { ok: false, state, message: 'Skill-Knoten ist bereits freigeschaltet.' };
  }
  if (member.level < node.requiredLevel) {
    return { ok: false, state, message: `Level ${node.requiredLevel} erforderlich.` };
  }
  if (node.requiredEvolutionId
    && state.evolutionIdsByCharacterId[member.characterId] !== node.requiredEvolutionId) {
    return { ok: false, state, message: 'Passende Entwicklung erforderlich.' };
  }
  if (node.requiredRelationshipLevel
    && getRelationshipLevelNumber(state, node.requiredRelationshipLevel.relationshipId)
      < node.requiredRelationshipLevel.level) {
    return { ok: false, state, message: 'Passende Bindungsstufe erforderlich.' };
  }
  if (node.requiredRegionId && !state.discoveredRegionIds.includes(node.requiredRegionId)) {
    return { ok: false, state, message: 'Passende Regionserkundung erforderlich.' };
  }
  if (node.requiredFlag && !context.flags?.[node.requiredFlag]) {
    return { ok: false, state, message: 'Passender Story-Fortschritt erforderlich.' };
  }
  if (!node.requiredNodeIds.every((requiredId) => unlocked.includes(requiredId))) {
    return { ok: false, state, message: 'Vorgänger-Knoten fehlen.' };
  }
  // Branch-Lock: hat die Figur bereits einen Spezialisierungsstrang gewählt,
  // bleiben Knoten anderer Stränge gesperrt (Qual der Wahl).
  if (node.branch !== undefined) {
    const committed = committedBranch(unlocked);
    if (committed !== null && committed !== node.branch) {
      return { ok: false, state, message: 'Anderer Spezialisierungsstrang bereits gewählt.' };
    }
  }
  if ((state.skillPointsByCharacterId[member.characterId] ?? 0) < node.cost) {
    return { ok: false, state, message: 'Nicht genug Skill-Punkte.' };
  }
  return { ok: true, state, message: `${node.name} kann freigeschaltet werden.` };
}

export function unlockSkillNode(
  member: PartyMemberState,
  state: ProgressionState,
  nodeId: string,
  context: SkillTreeUnlockContext = {}
): ProgressionActionResult {
  const check = canUnlockSkillNode(member, state, nodeId, context);
  const node = skillTreeNodeById.get(nodeId);
  if (!check.ok || !node) {
    return check;
  }
  const currentNodes = state.unlockedSkillNodeIdsByCharacterId[member.characterId] ?? [];
  return {
    ok: true,
    state: {
      ...state,
      skillPointsByCharacterId: {
        ...state.skillPointsByCharacterId,
        [member.characterId]: (state.skillPointsByCharacterId[member.characterId] ?? 0) - node.cost
      },
      unlockedSkillNodeIdsByCharacterId: {
        ...state.unlockedSkillNodeIdsByCharacterId,
        [member.characterId]: uniqueStrings([...currentNodes, node.id])
      }
    },
    message: `${node.name} freigeschaltet.`
  };
}

export function equipmentEnhancementKey(
  characterId: string,
  slot: EquipmentSlot,
  itemId: string
): string {
  return `${characterId}:${slot}:${itemId}`;
}

export function getEnchantmentLevel(
  member: PartyMemberState,
  state: ProgressionState,
  slot: EquipmentSlot
): number {
  const itemId = member.equipment[slot];
  if (!itemId) {
    return 0;
  }
  return state.enchantmentLevelsByEquipmentKey[
    equipmentEnhancementKey(member.characterId, slot, itemId)
  ] ?? 0;
}

export function enchantEquipment(
  member: PartyMemberState,
  state: ProgressionState,
  slot: EquipmentSlot,
  gold: number
): EnchantmentResult {
  const itemId = member.equipment[slot];
  const item = itemId ? itemById.get(itemId) : undefined;
  if (!item?.enchantment || !itemId) {
    return { ok: false, state, gold, message: 'Diese Ausrüstung kann nicht verzaubert werden.' };
  }
  const currentLevel = getEnchantmentLevel(member, state, slot);
  if (currentLevel >= item.enchantment.maxLevel) {
    return { ok: false, state, gold, message: 'Maximale Verzauberung erreicht.' };
  }
  const cost = item.enchantment.goldCostPerLevel * (currentLevel + 1);
  if (gold < cost) {
    return { ok: false, state, gold, message: `${cost} Gold erforderlich.` };
  }
  const nextLevel = currentLevel + 1;
  return {
    ok: true,
    state: {
      ...state,
      enchantmentLevelsByEquipmentKey: {
        ...state.enchantmentLevelsByEquipmentKey,
        [equipmentEnhancementKey(member.characterId, slot, itemId)]: nextLevel
      }
    },
    gold: gold - cost,
    message: `${item.name} ist jetzt Verzauberung +${nextLevel}.`
  };
}

export function getActiveEquipmentSetTiers(
  member: PartyMemberState
): readonly { readonly set: EquipmentSetDefinition; readonly pieces: number }[] {
  const equippedItemIds = new Set(Object.values(member.equipment).filter((itemId): itemId is string => !!itemId));
  return EQUIPMENT_SETS.flatMap((set) => {
    const pieces = set.itemIds.filter((itemId) => equippedItemIds.has(itemId)).length;
    return pieces > 0 ? [{ set, pieces }] : [];
  });
}

export function calculateProgressionStats(
  member: PartyMemberState,
  state: ProgressionState
): StatBlock {
  const baseStats = calculateMemberBaseStats(member);
  const evolutionStats = addStats(baseStats, getActiveEvolution(state, member.characterId)?.statBonus);
  const relationshipStats = addStats(
    evolutionStats,
    calculateRelationshipBonus(member.characterId, state)
  );
  const skillTreeStats = addStats(
    relationshipStats,
    calculateSkillTreeBonus(member.characterId, state)
  );
  const setStats = addStats(skillTreeStats, calculateEquipmentSetBonus(member));
  return addStats(setStats, calculateEnchantmentBonus(member, state));
}

export function calculateProgressionBaseStats(
  member: PartyMemberState,
  state: ProgressionState
): StatBlock {
  const baseStats = calculateMemberBaseStats(member);
  return addStats(
    addStats(
      addStats(
        addStats(
          addStats(baseStats, getActiveEvolution(state, member.characterId)?.statBonus),
          calculateRelationshipBonus(member.characterId, state)
        ),
        calculateSkillTreeBonus(member.characterId, state)
      ),
      calculateEquipmentSetBonus(member)
    ),
    calculateEnchantmentBonus(member, state)
  );
}

export function calculateRelationshipBonus(
  characterId: string,
  state: ProgressionState
): Partial<StatBlock> {
  return RELATIONSHIPS
    .filter((relationship) =>
      relationship.characterId === characterId || relationship.partnerId === characterId
    )
    .reduce<Partial<StatBlock>>((bonus, relationship) => {
      const activeLevel = getRelationshipLevel(state, relationship.id);
      if (!activeLevel) {
        return bonus;
      }
      const activeBonus = relationship.characterId === characterId
        ? activeLevel.passiveBonus
        : activeLevel.partnerPassiveBonus ?? {};
      return addPartialStats(bonus, activeBonus);
    }, {});
}

export function calculateSkillTreeBonus(
  characterId: string,
  state: ProgressionState
): Partial<StatBlock> {
  const unlocked = new Set(state.unlockedSkillNodeIdsByCharacterId[characterId] ?? []);
  return (getSkillTree(characterId)?.nodes ?? [])
    .filter((node) => unlocked.has(node.id))
    .reduce<Partial<StatBlock>>(
      (bonus, node) => addPartialStats(bonus, node.statBonus ?? {}),
      {}
    );
}

export function calculateEquipmentSetBonus(member: PartyMemberState): Partial<StatBlock> {
  return getActiveEquipmentSetTiers(member).reduce<Partial<StatBlock>>((bonus, activeSet) => {
    const setBonus = activeSet.set.tiers
      .filter((tier) => activeSet.pieces >= tier.pieces)
      .reduce<Partial<StatBlock>>(
        (tierBonus, tier) => addPartialStats(tierBonus, tier.statBonus),
        {}
      );
    return addPartialStats(bonus, setBonus);
  }, {});
}

export function calculateEnchantmentBonus(
  member: PartyMemberState,
  state: ProgressionState
): Partial<StatBlock> {
  return (['weapon', 'armor', 'accessory'] as const).reduce<Partial<StatBlock>>((bonus, slot) => {
    const itemId = member.equipment[slot];
    const item = itemId ? itemById.get(itemId) : undefined;
    const level = getEnchantmentLevel(member, state, slot);
    if (!item?.enchantment || level <= 0) {
      return bonus;
    }
    return addPartialStats(
      bonus,
      multiplyPartialStats(item.enchantment.statBonusPerLevel, level)
    );
  }, {});
}

export function getProgressionSkillIds(
  member: PartyMemberState,
  state: ProgressionState
): readonly string[] {
  return getProgressionCoreSkillIds(member, state);
}

export function getProgressionCoreSkillIds(
  member: PartyMemberState,
  state: ProgressionState
): readonly string[] {
  const evolution = getActiveEvolution(state, member.characterId);
  const relationshipSkillIds = RELATIONSHIPS
    .filter((relationship) =>
      relationship.characterId === member.characterId
      || relationship.partnerId === member.characterId
    )
    .flatMap((relationship) => getRelationshipLevel(state, relationship.id)?.skillIds ?? []);
  const skillTreeSkillIds = (getSkillTree(member.characterId)?.nodes ?? [])
    .filter((node) =>
      (state.unlockedSkillNodeIdsByCharacterId[member.characterId] ?? []).includes(node.id)
    )
    .flatMap((node) => node.skillId ? [node.skillId] : []);

  return uniqueStrings([
    ...member.learnedSkillIds,
    ...(evolution?.skillIds ?? []),
    ...relationshipSkillIds,
    ...skillTreeSkillIds
  ]);
}

export function getProgressionSkills(
  member: PartyMemberState,
  state: ProgressionState
): readonly SkillDefinition[] {
  return getProgressionSkillIds(member, state).flatMap((skillId) => {
    const skill = skillById.get(skillId);
    return skill ? [skill] : [];
  });
}

export function getCombatSynergyPartnerIds(
  characterId: string,
  state: ProgressionState
): readonly string[] {
  return uniqueStrings(RELATIONSHIPS.flatMap((relationship) => {
    const level = getRelationshipLevel(state, relationship.id);
    if (!heroById.has(relationship.characterId)
      || !heroById.has(relationship.partnerId)
      || !level?.combatBonus?.teamAttack) {
      return [];
    }
    if (relationship.characterId === characterId) {
      return [relationship.partnerId];
    }
    if (relationship.partnerId === characterId) {
      return [relationship.characterId];
    }
    return [];
  }));
}

export function getOpeningStatusIds(
  characterId: string,
  state: ProgressionState
): readonly StatusEffectId[] {
  return uniqueStrings(RELATIONSHIPS.flatMap((relationship) => {
    if (relationship.characterId !== characterId && relationship.partnerId !== characterId) {
      return [];
    }
    const statusId = getRelationshipLevel(state, relationship.id)?.combatBonus?.openingStatusId;
    return statusId ? [statusId] : [];
  })) as StatusEffectId[];
}

export function calculateStartingTeamMeter(
  members: readonly PartyMemberState[],
  state: ProgressionState
): number {
  const activeCharacterIds = new Set(members.map((member) => member.characterId));
  const meter = RELATIONSHIPS.reduce((total, relationship) => {
    if (!activeCharacterIds.has(relationship.characterId)
      || !activeCharacterIds.has(relationship.partnerId)) {
      return total;
    }
    return total + (getRelationshipLevel(state, relationship.id)?.combatBonus?.startingTeamMeter ?? 0);
  }, 0);
  return Math.min(100, meter);
}

export function createProgressionBattleParty(
  members: readonly PartyMemberState[],
  state: ProgressionState
): BattleUnitInput[] {
  return members.flatMap((member): BattleUnitInput[] => {
    const hero = heroById.get(member.characterId);
    if (!hero) {
      return [];
    }
    const unit = createHeroBattleUnit(hero, {
      name: member.name,
      level: member.level,
      currentHp: member.currentHp,
      currentMp: member.currentMp,
      skillIds: battleLoadoutSkillIds({ ...member, learnedSkillIds: getProgressionCoreSkillIds(member, state) }),
      synergyPartnerIds: getCombatSynergyPartnerIds(member.characterId, state),
      formName: progressionBattleFormName(member.characterId, state),
      openingStatusIds: getOpeningStatusIds(member.characterId, state),
      // Phase 70: Perks aus den freigeschalteten Spec-Knoten fließen in den Kampf ein.
      perks: [
        ...talentPerksForNodes(state.unlockedSkillNodeIdsByCharacterId[member.characterId] ?? []),
        ...awakenedPerksForMember(member.characterId, state),
        ...officerPerksForResidents(state.promotedResidentIds, state.awakenedResidentIds)
      ]
    });
    return [{ ...unit, stats: calculateProgressionBaseStats(member, state) }];
  });
}

function progressionBattleFormName(characterId: string, state: ProgressionState): string | undefined {
  const formName = getActiveEvolution(state, characterId)?.formName;
  if (characterId !== 'rimuru' || !state.awakeningCompleted) return formName;
  return formName ? `${formName} · Erwacht` : 'Erwachter Schleim';
}

function awakenedPerksForMember(
  characterId: string,
  state: ProgressionState
): readonly TalentPerk[] {
  return characterId === 'rimuru' && state.awakeningCompleted ? AWAKENED_RIMURU_PERKS : [];
}

export function applyBattleProgressionRewards(
  activeMembers: readonly PartyMemberState[],
  reserveMembers: readonly PartyMemberState[],
  state: ProgressionState,
  battleExperience: number,
  chapterId = 'chapter-1'
): BattleProgressionResult {
  const experience = clampNonNegativeInteger(battleExperience);
  let nextState = state;
  let grantedSkillPoints = 0;
  const active = activeMembers.map((member) => {
    const advanced = addMemberExperience(member, experience);
    const points = skillPointsForLevelGain(member.level, advanced.level);
    if (points > 0) {
      nextState = grantSkillPoints(nextState, member.characterId, points).state;
      grantedSkillPoints += points;
    }
    return advanced;
  });
  const reserveExperience = calculateReserveExperienceReward(experience);
  const rewardedReserve = reserveMembers.map((member) => addMemberExperience(member, reserveExperience));
  const caughtUp = catchUpReserveMembers(active, rewardedReserve, chapterId);
  // Reserve-Mitglieder bekommen Skillpunkte für ihren gesamten Levelzuwachs (Kampf-XP
  // + Catch-up), gemessen am Vor-Kampf-Level. Sonst verlieren gebenkte Figuren die
  // Punkte für Level, die sie auf der Bank erreicht haben — Punkte bleiben so eine
  // reine Funktion des erreichten Levels, egal ob aktiv oder Reserve.
  caughtUp.reserve.forEach((member, index) => {
    const points = skillPointsForLevelGain(reserveMembers[index]!.level, member.level);
    if (points > 0) {
      nextState = grantSkillPoints(nextState, member.characterId, points).state;
      grantedSkillPoints += points;
    }
  });
  const activeCharacterIds = new Set(active.map((member) => member.characterId));
  for (const relationship of RELATIONSHIPS as readonly RelationshipDefinition[]) {
    if (activeCharacterIds.has(relationship.characterId)
      && activeCharacterIds.has(relationship.partnerId)) {
      nextState = grantRelationshipPoints(nextState, relationship.id, 5).state;
    }
  }

  return {
    active,
    reserve: caughtUp.reserve,
    state: nextState,
    grantedSkillPoints
  };
}

export function catchUpReserveMembers(
  activeMembers: readonly PartyMemberState[],
  reserveMembers: readonly PartyMemberState[],
  chapterId: string,
  config: CatchUpConfig = CATCH_UP_CONFIG
): CatchUpResult {
  const targetLevel = calculateCatchUpTargetLevel(activeMembers, chapterId, config);
  const targetExperience = experienceForLevel(targetLevel);
  let grantedExperience = 0;

  const reserve = reserveMembers.map((member) => {
    if (member.experience >= targetExperience) {
      return member;
    }
    grantedExperience += targetExperience - member.experience;
    return setMemberExperienceFloor(member, targetExperience);
  });

  return { reserve, targetLevel, grantedExperience };
}

export function calculateCatchUpTargetLevel(
  activeMembers: readonly PartyMemberState[],
  chapterId: string,
  config: CatchUpConfig = CATCH_UP_CONFIG
): number {
  const baseline = config.chapterBaselines[chapterId] ?? 1;
  if (activeMembers.length === 0) {
    return clampLevel(baseline);
  }

  const activeAverageLevel = Math.floor(
    activeMembers.reduce((sum, member) => sum + member.level, 0) / activeMembers.length
  );
  const floorFromParty = Math.max(1, activeAverageLevel - config.maxLevelGap);
  return clampLevel(Math.min(activeAverageLevel, Math.max(baseline, floorFromParty)));
}

export function calculateReserveExperienceReward(
  battleExperience: number,
  config: CatchUpConfig = CATCH_UP_CONFIG
): number {
  return Math.floor(clampNonNegativeInteger(battleExperience) * config.reserveExperienceRate);
}

export function analyzeProgressionBalance(sampleLevels: readonly number[] = [1, 3, 4, 5, 7, 10]): BalanceIssue[] {
  const issues: BalanceIssue[] = [];
  const levels = uniqueStrings(sampleLevels.map((level) => String(clampLevel(level))))
    .map((level) => Number.parseInt(level, 10))
    .sort((a, b) => a - b);

  for (const hero of HEROES) {
    let previousScore = 0;
    for (const level of levels) {
      const score = powerScore(scaleStats(hero.baseStats, hero.growthPerLevel, level));
      if (score < previousScore) {
        issues.push({
          path: `balance.heroes.${hero.id}.level.${level}`,
          message: 'Kraftkurve fällt über Level hinweg.'
        });
      }
      previousScore = score;
    }
  }

  for (const evolution of EVOLUTIONS) {
    const hero = heroById.get(evolution.characterId);
    if (!hero) {
      continue;
    }
    const base = scaleStats(hero.baseStats, hero.growthPerLevel, evolution.requiredLevel);
    const evolved = addStats(base, evolution.statBonus);
    if (powerScore(evolved) <= powerScore(base)) {
      issues.push({
        path: `balance.evolutions.${evolution.id}`,
        message: 'Entwicklung verbessert die Kraftkurve nicht.'
      });
    }
  }

  for (const relationship of RELATIONSHIPS as readonly RelationshipDefinition[]) {
    let previousScore = 0;
    let previousPartnerScore = 0;
    let previousTeamMeter = 0;
    for (const level of relationship.levels) {
      const score = partialPowerScore(level.passiveBonus);
      if (score < previousScore) {
        issues.push({
          path: `balance.relationships.${relationship.id}.levels.${level.level}`,
          message: 'Beziehungsbonus fällt in späterer Stufe ab.'
        });
      }
      previousScore = score;
      const partnerScore = partialPowerScore(level.partnerPassiveBonus ?? {});
      if (partnerScore < previousPartnerScore) {
        issues.push({
          path: `balance.relationships.${relationship.id}.levels.${level.level}.partner`,
          message: 'Partnerbonus fällt in späterer Stufe ab.'
        });
      }
      previousPartnerScore = partnerScore;
      const teamMeter = level.combatBonus?.startingTeamMeter ?? previousTeamMeter;
      if (teamMeter < previousTeamMeter) {
        issues.push({
          path: `balance.relationships.${relationship.id}.levels.${level.level}.teamMeter`,
          message: 'Kampfbonus fällt in späterer Stufe ab.'
        });
      }
      previousTeamMeter = teamMeter;
    }
  }

  for (const tree of SKILL_TREES as readonly SkillTreeDefinition[]) {
    let cumulativeScore = 0;
    for (const node of tree.nodes) {
      const nextScore = cumulativeScore + partialPowerScore(node.statBonus ?? {});
      if (nextScore < cumulativeScore) {
        issues.push({
          path: `balance.skillTrees.${tree.id}.${node.id}`,
          message: 'Skill-Baum verliert Kraft durch einen Knoten.'
        });
      }
      cumulativeScore = nextScore;
    }
  }

  for (const set of EQUIPMENT_SETS) {
    let previousScore = 0;
    for (const tier of set.tiers) {
      const score = previousScore + partialPowerScore(tier.statBonus);
      if (score <= previousScore) {
        issues.push({
          path: `balance.equipmentSets.${set.id}.${tier.pieces}`,
          message: 'Set-Stufe erhöht die Kraftkurve nicht.'
        });
      }
      previousScore = score;
    }
  }

  for (const region of PROGRESSION_REGIONS) {
    const enemyLevels = region.enemyIds
      .map((enemyId) => GAME_ENEMY_LEVELS.get(enemyId))
      .filter((level): level is number => typeof level === 'number');
    const averageEnemyLevel = enemyLevels.length > 0
      ? enemyLevels.reduce((sum, level) => sum + level, 0) / enemyLevels.length
      : 0;
    if (averageEnemyLevel > region.baselineLevel + 1.5) {
      issues.push({
        path: `balance.regions.${region.id}.baselineLevel`,
        message: 'Region-Baseline liegt deutlich unter dem Gegnerdurchschnitt.'
      });
    }
  }

  return issues;
}

export function getProgressionRelationships(characterId: string): readonly RelationshipDefinition[] {
  return RELATIONSHIPS.filter((relationship) =>
    relationship.characterId === characterId || relationship.partnerId === characterId
  );
}

function setMemberExperienceFloor(member: PartyMemberState, experience: number): PartyMemberState {
  const nextExperience = Math.max(member.experience, clampNonNegativeInteger(experience));
  const nextLevel = Math.max(member.level, levelForExperience(nextExperience));
  const hero = heroById.get(member.characterId);
  if (!hero) {
    return { ...member, experience: nextExperience, level: nextLevel };
  }

  const stats = scaleStats(hero.baseStats, hero.growthPerLevel, nextLevel);
  return {
    ...member,
    experience: nextExperience,
    level: nextLevel,
    currentHp: Math.max(member.currentHp, stats.maxHp),
    currentMp: Math.max(member.currentMp, stats.maxMp)
  };
}

function addMemberExperience(member: PartyMemberState, experience: number): PartyMemberState {
  const nextExperience = member.experience + clampNonNegativeInteger(experience);
  const nextLevel = Math.max(member.level, levelForExperience(nextExperience));
  const hero = heroById.get(member.characterId);
  if (!hero || nextLevel === member.level) {
    return { ...member, experience: nextExperience, level: nextLevel };
  }
  const previousStats = scaleStats(hero.baseStats, hero.growthPerLevel, member.level);
  const nextStats = scaleStats(hero.baseStats, hero.growthPerLevel, nextLevel);
  return {
    ...member,
    experience: nextExperience,
    level: nextLevel,
    currentHp: member.currentHp + (nextStats.maxHp - previousStats.maxHp),
    currentMp: member.currentMp + (nextStats.maxMp - previousStats.maxMp)
  };
}

function skillPointsForLevelGain(previousLevel: number, nextLevel: number): number {
  return Math.max(0, Math.floor(nextLevel / 2) - Math.floor(previousLevel / 2));
}

function normalizeGivenName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function normalizeStringRecord(record: Readonly<Record<string, string>>): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([key, value]) => key.trim().length > 0 && value.trim().length > 0)
  );
}

function normalizePointRecord(record: Readonly<Record<string, number>>): Readonly<Record<string, number>> {
  return Object.fromEntries(
    Object.entries(record)
      .map(([key, value]) => [key, clampNonNegativeInteger(value)] as const)
      .filter(([key]) => key.trim().length > 0)
  );
}

function normalizeStringArrayRecord(
  record: Readonly<Record<string, readonly string[]>>
): Readonly<Record<string, readonly string[]>> {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([key, values]) => key.trim().length > 0 && Array.isArray(values))
      .map(([key, values]) => [key, uniqueStrings(values.filter((value) => value.trim().length > 0))])
  );
}

function powerScore(stats: StatBlock): number {
  return Math.round(
    stats.maxHp * 0.18
    + stats.maxMp * 0.2
    + stats.attack * 1.4
    + stats.defense * 1.2
    + stats.magic * 1.4
    + stats.spirit * 1.2
    + stats.agility * 1.1
  );
}

function partialPowerScore(stats: Partial<StatBlock>): number {
  return powerScore({
    maxHp: stats.maxHp ?? 0,
    maxMp: stats.maxMp ?? 0,
    attack: stats.attack ?? 0,
    defense: stats.defense ?? 0,
    magic: stats.magic ?? 0,
    spirit: stats.spirit ?? 0,
    agility: stats.agility ?? 0
  });
}

const GAME_ENEMY_LEVELS = new Map<string, number>(
  ENEMIES.map((enemy) => [enemy.id, enemy.level] as const)
);
