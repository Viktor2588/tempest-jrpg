import {
  HEROES,
  ITEMS,
  JOBS,
  SKILLS,
  type CharacterDefinition,
  type EquipmentSlot,
  type ItemDefinition,
  type JobDefinition,
  type SkillDefinition,
  type StatBlock
} from '../data';
import {
  addInventoryItem,
  getItemCount,
  normalizeInventoryStacks,
  removeInventoryItem,
  type InventoryStack
} from './inventory';
import type { PartyMemberState } from './party';
import { addStats, scaleStats } from './stats';

export const MENU_TOUCH_TARGET_PX = 44;
export const EQUIPMENT_SLOTS: readonly EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

export interface MenuGameState {
  readonly party: readonly PartyMemberState[];
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
}

export interface MenuResult<TState = MenuGameState> {
  readonly ok: boolean;
  readonly state: TState;
  readonly message: string;
}

export interface MemberSummary {
  readonly member: PartyMemberState;
  readonly character: CharacterDefinition;
  readonly job: JobDefinition;
  readonly stats: StatBlock;
  readonly skills: readonly SkillDefinition[];
  readonly equipmentItems: Partial<Record<EquipmentSlot, ItemDefinition>>;
}

export interface InventoryItemView {
  readonly item: ItemDefinition;
  readonly quantity: number;
  readonly usable: boolean;
  readonly equipSlot: EquipmentSlot | null;
}

export interface MenuView {
  readonly members: readonly MemberSummary[];
  readonly inventory: readonly InventoryItemView[];
  readonly gold: number;
}

const heroById = new Map<string, CharacterDefinition>(HEROES.map((hero) => [hero.id, hero]));
const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));
const skillById = new Map<string, SkillDefinition>(SKILLS.map((skill) => [skill.id, skill]));
const jobDefinitions: readonly JobDefinition[] = JOBS;
const jobById = new Map<string, JobDefinition>(jobDefinitions.map((job) => [job.id, job]));

export function createMenuState(
  party: readonly PartyMemberState[],
  inventory: readonly InventoryStack[],
  gold: number
): MenuGameState {
  return {
    party,
    inventory: normalizeInventoryStacks(inventory),
    gold: Math.max(0, Math.trunc(gold))
  };
}

export function buildMenuView(
  state: MenuGameState,
  jobAssignments: Readonly<Record<string, string>> = {}
): MenuView {
  return {
    members: state.party.flatMap((member) => {
      const summary = getMemberSummary(member, jobAssignments[member.characterId]);
      return summary ? [summary] : [];
    }),
    inventory: getSortedInventory(state.inventory),
    gold: state.gold
  };
}

export function getMemberSummary(
  member: PartyMemberState,
  jobId = getDefaultJobId(member.characterId)
): MemberSummary | null {
  const character = heroById.get(member.characterId);
  const job = getAvailableJobs(member.characterId).find((candidate) => candidate.id === jobId)
    ?? getAvailableJobs(member.characterId)[0];
  if (!character || !job) {
    return null;
  }

  return {
    member,
    character,
    job,
    stats: calculateMemberStats(member, job.id),
    skills: getMemberSkillDefinitions(member, job.id),
    equipmentItems: getEquipmentItems(member)
  };
}

export function getDefaultJobId(characterId: string): string {
  if (characterId === 'rimuru') return 'adaptive-hero';
  if (characterId === 'shuna') return 'support-priest';
  return 'vanguard';
}

export function getAvailableJobs(characterId: string): JobDefinition[] {
  return jobDefinitions.filter((job) =>
    !job.allowedCharacterIds || job.allowedCharacterIds.includes(characterId)
  );
}

export function calculateMemberStats(member: PartyMemberState, jobId = getDefaultJobId(member.characterId)): StatBlock {
  const character = requireCharacter(member.characterId);
  const baseStats = scaleStats(character.baseStats, character.growthPerLevel, member.level);
  const jobStats = applyJobMultipliers(baseStats, requireJob(jobId));
  return addStats(jobStats, calculateEquipmentBonus(member));
}

export function calculateEquipmentBonus(member: PartyMemberState): Partial<StatBlock> {
  return EQUIPMENT_SLOTS.reduce<Partial<StatBlock>>((bonus, slot) => {
    const itemId = member.equipment[slot];
    const item = itemId ? itemById.get(itemId) : undefined;
    return addStatsPartial(bonus, item?.statBonus ?? {});
  }, {});
}

export function getMemberSkillDefinitions(member: PartyMemberState, jobId = getDefaultJobId(member.characterId)): SkillDefinition[] {
  const job = requireJob(jobId);
  const skillIds = [...new Set([...member.learnedSkillIds, ...job.skillIds])];
  return skillIds.flatMap((skillId) => {
    const skill = skillById.get(skillId);
    return skill ? [skill] : [];
  });
}

export function getEquipmentItems(member: PartyMemberState): Partial<Record<EquipmentSlot, ItemDefinition>> {
  const equipmentItems: Partial<Record<EquipmentSlot, ItemDefinition>> = {};
  for (const slot of EQUIPMENT_SLOTS) {
    const itemId = member.equipment[slot];
    const item = itemId ? itemById.get(itemId) : undefined;
    if (item) equipmentItems[slot] = item;
  }
  return equipmentItems;
}

export function getSortedInventory(inventory: readonly InventoryStack[]): InventoryItemView[] {
  return normalizeInventoryStacks(inventory)
    .flatMap((stack): InventoryItemView[] => {
      const item = itemById.get(stack.itemId);
      if (!item) return [];
      return [{
        item,
        quantity: stack.quantity,
        usable: item.category === 'consumable' && !!item.effect,
        equipSlot: item.equipmentSlot ?? null
      }];
    })
    .sort((a, b) =>
      categoryRank(a.item) - categoryRank(b.item)
      || a.item.name.localeCompare(b.item.name)
    );
}

export function equipItem(
  state: MenuGameState,
  characterId: string,
  itemId: string
): MenuResult {
  const item = itemById.get(itemId);
  if (!item?.equipmentSlot) {
    return { ok: false, state, message: 'Item ist nicht ausrüstbar.' };
  }
  if (getItemCount(state.inventory, itemId) <= 0) {
    return { ok: false, state, message: 'Item ist nicht im Inventar.' };
  }

  const slot = item.equipmentSlot;
  const updatedParty = state.party.map((member) => {
    if (member.characterId !== characterId) return member;
    return {
      ...member,
      currentHp: clampResource(member.currentHp, calculateMemberStats(member).maxHp),
      currentMp: clampResource(member.currentMp, calculateMemberStats(member).maxMp),
      equipment: { ...member.equipment, [slot]: item.id }
    };
  });
  const originalMember = state.party.find((member) => member.characterId === characterId);
  if (!originalMember) {
    return { ok: false, state, message: 'Charakter nicht gefunden.' };
  }

  const previousItemId = originalMember.equipment[slot];
  const nextInventory = previousItemId
    ? addInventoryItem(removeInventoryItem(state.inventory, itemId), previousItemId)
    : removeInventoryItem(state.inventory, itemId);
  const nextState = { ...state, party: updatedParty, inventory: nextInventory };

  return { ok: true, state: normalizePartyResources(nextState), message: `${item.name} ausgerüstet.` };
}

export function unequipItem(
  state: MenuGameState,
  characterId: string,
  slot: EquipmentSlot
): MenuResult {
  const member = state.party.find((candidate) => candidate.characterId === characterId);
  if (!member) return { ok: false, state, message: 'Charakter nicht gefunden.' };

  const itemId = member.equipment[slot];
  if (!itemId) return { ok: false, state, message: 'Slot ist leer.' };

  const updatedParty = state.party.map((candidate) =>
    candidate.characterId === characterId
      ? { ...candidate, equipment: { ...candidate.equipment, [slot]: null } }
      : candidate
  );
  const nextState = {
    ...state,
    party: updatedParty,
    inventory: addInventoryItem(state.inventory, itemId)
  };
  return { ok: true, state: normalizePartyResources(nextState), message: 'Ausrüstung abgelegt.' };
}

export function useItem(
  state: MenuGameState,
  itemId: string,
  characterId: string
): MenuResult {
  const item = itemById.get(itemId);
  if (!item?.effect || item.category !== 'consumable') {
    return { ok: false, state, message: 'Item ist nicht nutzbar.' };
  }
  if (getItemCount(state.inventory, itemId) <= 0) {
    return { ok: false, state, message: 'Item ist nicht im Inventar.' };
  }

  let changed = false;
  const updatedParty = state.party.map((member) => {
    if (member.characterId !== characterId) return member;
    const stats = calculateMemberStats(member);
    changed = true;
    if (item.effect?.kind === 'heal-hp') {
      return { ...member, currentHp: Math.min(stats.maxHp, member.currentHp + (item.effect.amount ?? 0)) };
    }
    if (item.effect?.kind === 'restore-mp') {
      return { ...member, currentMp: Math.min(stats.maxMp, member.currentMp + (item.effect.amount ?? 0)) };
    }
    return member;
  });

  if (!changed) {
    return { ok: false, state, message: 'Charakter nicht gefunden.' };
  }
  if (item.effect.kind === 'revive' || item.effect.kind === 'grant-skill') {
    return { ok: false, state, message: 'Item-Effekt wird im Menü noch nicht unterstützt.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      party: updatedParty,
      inventory: removeInventoryItem(state.inventory, itemId)
    },
    message: `${item.name} benutzt.`
  };
}

export function selectJob(
  assignments: Readonly<Record<string, string>>,
  characterId: string,
  jobId: string
): MenuResult<Readonly<Record<string, string>>> {
  if (!getAvailableJobs(characterId).some((job) => job.id === jobId)) {
    return { ok: false, state: assignments, message: 'Rolle ist für diesen Charakter nicht verfügbar.' };
  }
  return {
    ok: true,
    state: { ...assignments, [characterId]: jobId },
    message: `${requireJob(jobId).name} ausgewählt.`
  };
}

function normalizePartyResources(state: MenuGameState): MenuGameState {
  return {
    ...state,
    party: state.party.map((member) => {
      const stats = calculateMemberStats(member);
      return {
        ...member,
        currentHp: clampResource(member.currentHp, stats.maxHp),
        currentMp: clampResource(member.currentMp, stats.maxMp)
      };
    })
  };
}

function applyJobMultipliers(stats: StatBlock, job: JobDefinition): StatBlock {
  return {
    maxHp: multiplyStat(stats.maxHp, job.statMultiplier.maxHp),
    maxMp: multiplyStat(stats.maxMp, job.statMultiplier.maxMp),
    attack: multiplyStat(stats.attack, job.statMultiplier.attack),
    defense: multiplyStat(stats.defense, job.statMultiplier.defense),
    magic: multiplyStat(stats.magic, job.statMultiplier.magic),
    spirit: multiplyStat(stats.spirit, job.statMultiplier.spirit),
    agility: multiplyStat(stats.agility, job.statMultiplier.agility)
  };
}

function multiplyStat(value: number, multiplier = 1): number {
  return Math.max(1, Math.round(value * multiplier));
}

function addStatsPartial(a: Partial<StatBlock>, b: Partial<StatBlock>): Partial<StatBlock> {
  return {
    maxHp: (a.maxHp ?? 0) + (b.maxHp ?? 0),
    maxMp: (a.maxMp ?? 0) + (b.maxMp ?? 0),
    attack: (a.attack ?? 0) + (b.attack ?? 0),
    defense: (a.defense ?? 0) + (b.defense ?? 0),
    magic: (a.magic ?? 0) + (b.magic ?? 0),
    spirit: (a.spirit ?? 0) + (b.spirit ?? 0),
    agility: (a.agility ?? 0) + (b.agility ?? 0)
  };
}

function categoryRank(item: ItemDefinition): number {
  if (item.category === 'consumable') return 0;
  if (item.category === 'weapon') return 1;
  if (item.category === 'armor') return 2;
  if (item.category === 'accessory') return 3;
  return 4;
}

function requireCharacter(characterId: string): CharacterDefinition {
  const character = heroById.get(characterId);
  if (!character) throw new Error(`Unknown character '${characterId}'.`);
  return character;
}

function requireJob(jobId: string): JobDefinition {
  const job = jobById.get(jobId);
  if (!job) throw new Error(`Unknown job '${jobId}'.`);
  return job;
}

function clampResource(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.trunc(value)));
}
