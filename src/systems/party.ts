import { HEROES } from '../data';
import type { CharacterDefinition, EquipmentSlot } from '../data';
import { clampLevel, clampNonNegativeInteger, experienceForLevel, scaleStats } from './stats';

export interface PartyMemberState {
  readonly characterId: string;
  readonly name: string;
  readonly level: number;
  readonly experience: number;
  readonly currentHp: number;
  readonly currentMp: number;
  readonly learnedSkillIds: readonly string[];
  readonly equipment: Record<EquipmentSlot, string | null>;
}

export interface CreatePartyMemberOptions {
  readonly level?: number;
  readonly experience?: number;
  readonly learnedSkillIds?: readonly string[];
}

export function createInitialParty(): PartyMemberState[] {
  return HEROES.filter((hero) => hero.startsInParty).map((hero) => createPartyMember(hero));
}

export function createPartyMember(
  definition: CharacterDefinition,
  options: CreatePartyMemberOptions = {}
): PartyMemberState {
  const level = clampLevel(options.level ?? definition.initialLevel);
  const experience = clampNonNegativeInteger(options.experience ?? experienceForLevel(level));
  const stats = scaleStats(definition.baseStats, definition.growthPerLevel, level);
  const learnedSkillIds = uniqueStrings([
    ...definition.initialSkillIds,
    ...(options.learnedSkillIds ?? [])
  ]);

  return {
    characterId: definition.id,
    name: definition.name,
    level,
    experience,
    currentHp: stats.maxHp,
    currentMp: stats.maxMp,
    learnedSkillIds,
    equipment: {
      weapon: definition.startingEquipment.weapon ?? null,
      armor: definition.startingEquipment.armor ?? null,
      accessory: definition.startingEquipment.accessory ?? null
    }
  };
}

export function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}
