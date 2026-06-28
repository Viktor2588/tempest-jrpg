import { HEROES } from './characters';
import { ENEMIES } from './enemies';
import { ITEMS } from './items';
import {
  CATCH_UP_CONFIG,
  EQUIPMENT_SETS,
  EVOLUTIONS,
  PROGRESSION_LINES,
  PROGRESSION_REGIONS,
  RELATIONSHIPS,
  SKILL_TREES
} from './progression';
import { SKILLS } from './skills';
import { DIALOGS, ENCOUNTERS, LOCATIONS, LORE_ENTRIES, NPCS, QUESTS, SHOPS } from './world';

export { HEROES } from './characters';
export { ENEMIES } from './enemies';
export { ITEMS } from './items';
export {
  CATCH_UP_CONFIG,
  EQUIPMENT_SETS,
  EVOLUTIONS,
  PROGRESSION_LINES,
  PROGRESSION_REGIONS,
  RELATIONSHIPS,
  SKILL_TREES
} from './progression';
export { SKILLS } from './skills';
export { DIALOGS, ENCOUNTERS, LOCATIONS, LORE_ENTRIES, NPCS, QUESTS, SHOPS } from './world';
export type {
  CatchUpConfig,
  EquipmentSetDefinition,
  EquipmentSetTierDefinition,
  EvolutionDefinition,
  ProgressionLineDefinition,
  ProgressionUnlockSource,
  RegionProgressionDefinition,
  RelationshipCombatBonus,
  RelationshipDefinition,
  RelationshipLevelDefinition,
  RelationshipSceneDefinition,
  SkillTreeDefinition,
  SkillTreeNodeDefinition
} from './progression';
export type {
  DialogChoiceDefinition,
  DialogDefinition,
  DialogNodeDefinition,
  EncounterDefinition,
  LoreEntryDefinition,
  NpcDefinition,
  QuestDefinition,
  QuestStepDefinition,
  ShopDefinition,
  WorldEffect,
  WorldLocationDefinition,
  WorldLocationKind,
  WorldRequirement
} from './world';
export type {
  CharacterDefinition,
  ElementType,
  EnemyDefinition,
  EnemyDrop,
  EquipmentSlot,
  ItemDefinition,
  ItemEffect,
  SkillDefinition,
  SkillStatusEffect,
  SkillTag,
  SkillTarget,
  StatusEffectId,
  StatBlock
} from './types';

export const GAME_DATA = {
  heroes: HEROES,
  enemies: ENEMIES,
  items: ITEMS,
  skills: SKILLS,
  progression: {
    regions: PROGRESSION_REGIONS,
    lines: PROGRESSION_LINES,
    evolutions: EVOLUTIONS,
    relationships: RELATIONSHIPS,
    skillTrees: SKILL_TREES,
    equipmentSets: EQUIPMENT_SETS,
    catchUp: CATCH_UP_CONFIG
  },
  world: {
    dialogs: DIALOGS,
    encounters: ENCOUNTERS,
    locations: LOCATIONS,
    lore: LORE_ENTRIES,
    npcs: NPCS,
    quests: QUESTS,
    shops: SHOPS
  }
} as const;
