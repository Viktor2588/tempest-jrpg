import { HEROES } from './characters';
import { ENEMIES } from './enemies';
import { ITEMS } from './items';
import { SKILLS } from './skills';
import type {
  CharacterDefinition,
  EnemyDefinition,
  EquipmentSlot,
  ItemDefinition,
  SkillDefinition
} from './types';

export { HEROES } from './characters';
export { ENEMIES } from './enemies';
export { ITEMS } from './items';
export { SKILLS } from './skills';
export type {
  CharacterDefinition,
  ElementType,
  EnemyDefinition,
  EnemyDrop,
  EquipmentSlot,
  ItemDefinition,
  ItemEffect,
  SkillDefinition,
  SkillTag,
  SkillTarget,
  StatBlock
} from './types';

export const GAME_DATA = {
  heroes: HEROES,
  enemies: ENEMIES,
  items: ITEMS,
  skills: SKILLS
} as const;

export interface DataValidationIssue {
  readonly path: string;
  readonly message: string;
}

interface DataSet {
  readonly heroes: readonly CharacterDefinition[];
  readonly enemies: readonly EnemyDefinition[];
  readonly items: readonly ItemDefinition[];
  readonly skills: readonly SkillDefinition[];
}

export function validateGameData(data: DataSet = GAME_DATA): DataValidationIssue[] {
  const issues: DataValidationIssue[] = [];
  const skillIds = new Set(data.skills.map((skill) => skill.id));
  const itemIds = new Set(data.items.map((item) => item.id));

  validateUniqueIds('skills', data.skills, issues);
  validateUniqueIds('items', data.items, issues);
  validateUniqueIds('heroes', data.heroes, issues);
  validateUniqueIds('enemies', data.enemies, issues);

  for (const hero of data.heroes) {
    validatePositiveInteger(`heroes.${hero.id}.initialLevel`, hero.initialLevel, issues);
    validateNonNegativeInteger(`heroes.${hero.id}.initialExperience`, hero.initialExperience, issues);
    validateSkillReferences(`heroes.${hero.id}.initialSkillIds`, hero.initialSkillIds, skillIds, issues);
    validateEquipmentLoadout(
      `heroes.${hero.id}.startingEquipment`,
      hero.startingEquipment,
      data.items,
      issues
    );
  }

  for (const enemy of data.enemies) {
    validatePositiveInteger(`enemies.${enemy.id}.level`, enemy.level, issues);
    validateNonNegativeInteger(`enemies.${enemy.id}.experienceReward`, enemy.experienceReward, issues);
    validateNonNegativeInteger(`enemies.${enemy.id}.goldReward`, enemy.goldReward, issues);
    validateSkillReferences(`enemies.${enemy.id}.skillIds`, enemy.skillIds, skillIds, issues);

    for (const drop of enemy.drops) {
      if (!itemIds.has(drop.itemId)) {
        issues.push({
          path: `enemies.${enemy.id}.drops.${drop.itemId}`,
          message: `Drop verweist auf unbekanntes Item '${drop.itemId}'.`
        });
      }
      if (drop.chance < 0 || drop.chance > 1) {
        issues.push({
          path: `enemies.${enemy.id}.drops.${drop.itemId}.chance`,
          message: 'Drop-Chance muss zwischen 0 und 1 liegen.'
        });
      }
    }
  }

  for (const item of data.items) {
    validateNonNegativeInteger(`items.${item.id}.price`, item.price, issues);
    if (item.effect?.kind === 'grant-skill' && !skillIds.has(item.effect.skillId ?? '')) {
      issues.push({
        path: `items.${item.id}.effect.skillId`,
        message: `Item verweist auf unbekannten Skill '${item.effect.skillId ?? 'undefined'}'.`
      });
    }
    validateEquipmentItem(item, issues);
  }

  return issues;
}

function validateUniqueIds(
  collectionName: string,
  entries: readonly { readonly id: string }[],
  issues: DataValidationIssue[]
): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    if (entry.id.trim().length === 0) {
      issues.push({ path: `${collectionName}.id`, message: 'ID darf nicht leer sein.' });
    }
    if (seen.has(entry.id)) {
      issues.push({
        path: `${collectionName}.${entry.id}`,
        message: `Doppelte ID '${entry.id}'.`
      });
    }
    seen.add(entry.id);
  }
}

function validateSkillReferences(
  path: string,
  skillIds: readonly string[],
  knownSkillIds: ReadonlySet<string>,
  issues: DataValidationIssue[]
): void {
  for (const skillId of skillIds) {
    if (!knownSkillIds.has(skillId)) {
      issues.push({
        path: `${path}.${skillId}`,
        message: `Unbekannter Skill '${skillId}'.`
      });
    }
  }
}

function validateEquipmentLoadout(
  path: string,
  loadout: Partial<Record<EquipmentSlot, string | null>>,
  items: readonly ItemDefinition[],
  issues: DataValidationIssue[]
): void {
  const itemById = new Map(items.map((item) => [item.id, item]));

  for (const [slot, itemId] of Object.entries(loadout) as [EquipmentSlot, string | null][]) {
    if (itemId === null) {
      continue;
    }

    const item = itemById.get(itemId);
    if (!item) {
      issues.push({
        path: `${path}.${slot}`,
        message: `Ausrüstung verweist auf unbekanntes Item '${itemId}'.`
      });
      continue;
    }

    if (item.equipmentSlot !== slot) {
      issues.push({
        path: `${path}.${slot}`,
        message: `Item '${itemId}' passt nicht in Slot '${slot}'.`
      });
    }
  }
}

function validateEquipmentItem(item: ItemDefinition, issues: DataValidationIssue[]): void {
  const equipmentCategories = new Set(['weapon', 'armor', 'accessory']);
  if (equipmentCategories.has(item.category) && item.equipmentSlot !== item.category) {
    issues.push({
      path: `items.${item.id}.equipmentSlot`,
      message: `Ausrüstungs-Item der Kategorie '${item.category}' braucht denselben Equipment-Slot.`
    });
  }
}

function validatePositiveInteger(path: string, value: number, issues: DataValidationIssue[]): void {
  if (!Number.isInteger(value) || value < 1) {
    issues.push({ path, message: 'Wert muss eine positive ganze Zahl sein.' });
  }
}

function validateNonNegativeInteger(path: string, value: number, issues: DataValidationIssue[]): void {
  if (!Number.isInteger(value) || value < 0) {
    issues.push({ path, message: 'Wert muss eine nicht-negative ganze Zahl sein.' });
  }
}
