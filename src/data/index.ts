import { HEROES } from './characters';
import { CRAFTING_RECIPES } from './crafting';
import { ENEMIES } from './enemies';
import { FACILITIES } from './facilities';
import { ELEMENT_FUSIONS } from './fusions';
import { ITEMS } from './items';
import { RESIDENTS } from './residents';
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
import { SIGNATURES } from './signatures';
import { DIALOGS, ENCOUNTERS, LOCATIONS, LORE_ENTRIES, NPCS, QUESTS, SHOPS } from './world';

export { HEROES } from './characters';
export { CRAFTING_RECIPES } from './crafting';
export { ENEMIES } from './enemies';
export { FACILITIES } from './facilities';
export { ELEMENT_FUSIONS } from './fusions';
export { ITEMS } from './items';
export { RESIDENTS } from './residents';
export { RESEARCH_PROJECTS } from './research';
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
export { SKILL_TIER_META, skillTierRank, skillTierBadge } from './skillRank';
export type { SkillTierMeta } from './skillRank';
export { SIGNATURES } from './signatures';
export { DIALOGS, ENCOUNTERS, LOCATIONS, LORE_ENTRIES, NPCS, QUESTS, SHOPS } from './world';
export type {
  ElementFusionDefinition,
  FusionElementId
} from './fusions';
export type {
  SignatureDefinition,
  SignatureEffect,
  SignatureEffectScope,
  SignatureTarget
} from './signatures';
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
  CraftingRecipe,
  CraftingRecipeInput,
  DamageCategory,
  ElementType,
  EnemyDefinition,
  EnemyDrop,
  EquipmentSlot,
  FacilityDefinition,
  FacilityOutput,
  ItemDefinition,
  ItemEffect,
  ResidentDefinition,
  ResidentRole,
  ResearchProject,
  SkillDefinition,
  SkillStatusEffect,
  SkillTag,
  SkillTarget,
  SkillTier,
  StatusEffectId,
  StatBlock,
  TalentPerk
} from './types';

export const GAME_DATA = {
  heroes: HEROES,
  enemies: ENEMIES,
  elementFusions: ELEMENT_FUSIONS,
  items: ITEMS,
  residents: RESIDENTS,
  facilities: FACILITIES,
  craftingRecipes: CRAFTING_RECIPES,
  skills: SKILLS,
  signatures: SIGNATURES,
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
