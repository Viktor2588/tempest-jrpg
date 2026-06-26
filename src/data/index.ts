import { HEROES } from './characters';
import { ENEMIES } from './enemies';
import { ITEMS } from './items';
import { JOBS } from './jobs';
import { SKILLS } from './skills';
import { DIALOGS, ENCOUNTERS, NPCS, QUESTS, SHOPS } from './world';
import type { DialogChoiceDefinition } from './world';
import type {
  CharacterDefinition,
  EnemyDefinition,
  EquipmentSlot,
  ItemDefinition,
  JobDefinition,
  SkillDefinition
} from './types';

export { HEROES } from './characters';
export { ENEMIES } from './enemies';
export { ITEMS } from './items';
export { JOBS } from './jobs';
export { SKILLS } from './skills';
export { DIALOGS, ENCOUNTERS, NPCS, QUESTS, SHOPS } from './world';
export type {
  DialogChoiceDefinition,
  DialogDefinition,
  DialogNodeDefinition,
  EncounterDefinition,
  NpcDefinition,
  ShopDefinition,
  WorldEffect,
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
  JobDefinition,
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
  jobs: JOBS,
  skills: SKILLS,
  world: {
    dialogs: DIALOGS,
    encounters: ENCOUNTERS,
    npcs: NPCS,
    quests: QUESTS,
    shops: SHOPS
  }
} as const;

export interface DataValidationIssue {
  readonly path: string;
  readonly message: string;
}

interface DataSet {
  readonly heroes: readonly CharacterDefinition[];
  readonly enemies: readonly EnemyDefinition[];
  readonly items: readonly ItemDefinition[];
  readonly jobs: readonly JobDefinition[];
  readonly skills: readonly SkillDefinition[];
  readonly world: typeof GAME_DATA.world;
}

export function validateGameData(data: DataSet = GAME_DATA): DataValidationIssue[] {
  const issues: DataValidationIssue[] = [];
  const skillIds = new Set(data.skills.map((skill) => skill.id));
  const itemIds = new Set(data.items.map((item) => item.id));
  const heroIds = new Set(data.heroes.map((hero) => hero.id));
  const enemyIds = new Set(data.enemies.map((enemy) => enemy.id));
  const dialogIds = new Set(data.world.dialogs.map((dialog) => dialog.id));
  const questIds = new Set<string>(data.world.quests.map((quest) => quest.id));

  validateUniqueIds('skills', data.skills, issues);
  validateUniqueIds('items', data.items, issues);
  validateUniqueIds('jobs', data.jobs, issues);
  validateUniqueIds('world.dialogs', data.world.dialogs, issues);
  validateUniqueIds('world.encounters', data.world.encounters, issues);
  validateUniqueIds('world.npcs', data.world.npcs, issues);
  validateUniqueIds('world.quests', data.world.quests, issues);
  validateUniqueIds('world.shops', data.world.shops, issues);
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

  for (const skill of data.skills) {
    validateNonNegativeInteger(`skills.${skill.id}.costMp`, skill.costMp, issues);
    validateNonNegativeInteger(`skills.${skill.id}.power`, skill.power, issues);
    if (skill.statusEffect && (skill.statusEffect.chance < 0 || skill.statusEffect.chance > 1)) {
      issues.push({
        path: `skills.${skill.id}.statusEffect.chance`,
        message: 'Status-Chance muss zwischen 0 und 1 liegen.'
      });
    }
  }

  for (const job of data.jobs) {
    validateSkillReferences(`jobs.${job.id}.skillIds`, job.skillIds, skillIds, issues);
    for (const characterId of job.allowedCharacterIds ?? []) {
      if (!heroIds.has(characterId)) {
        issues.push({
          path: `jobs.${job.id}.allowedCharacterIds.${characterId}`,
          message: `Job verweist auf unbekannten Charakter '${characterId}'.`
        });
      }
    }
    validateJobMultipliers(job, issues);
  }

  for (const npc of data.world.npcs) {
    if (!dialogIds.has(npc.dialogId)) {
      issues.push({
        path: `world.npcs.${npc.id}.dialogId`,
        message: `NPC verweist auf unbekannten Dialog '${npc.dialogId}'.`
      });
    }
  }

  for (const shop of data.world.shops) {
    for (const itemId of shop.itemIds) {
      if (!itemIds.has(itemId)) {
        issues.push({
          path: `world.shops.${shop.id}.itemIds.${itemId}`,
          message: `Shop verweist auf unbekanntes Item '${itemId}'.`
        });
      }
    }
  }

  for (const encounter of data.world.encounters) {
    for (const enemyId of encounter.enemyIds) {
      if (!enemyIds.has(enemyId)) {
        issues.push({
          path: `world.encounters.${encounter.id}.enemyIds.${enemyId}`,
          message: `Encounter verweist auf unbekannten Gegner '${enemyId}'.`
        });
      }
    }
    if (encounter.chance < 0 || encounter.chance > 1) {
      issues.push({
        path: `world.encounters.${encounter.id}.chance`,
        message: 'Encounter-Chance muss zwischen 0 und 1 liegen.'
      });
    }
  }

  for (const dialog of data.world.dialogs) {
    const nodeIds = new Set<string>(dialog.nodes.map((node) => node.id));
    if (!nodeIds.has(dialog.startNodeId)) {
      issues.push({
        path: `world.dialogs.${dialog.id}.startNodeId`,
        message: `Dialog-Startknoten '${dialog.startNodeId}' fehlt.`
      });
    }
    for (const node of dialog.nodes) {
      for (const choice of node.choices as readonly DialogChoiceDefinition[]) {
        if (choice.nextNodeId && !nodeIds.has(choice.nextNodeId)) {
          issues.push({
            path: `world.dialogs.${dialog.id}.${node.id}.${choice.id}.nextNodeId`,
            message: `Dialogauswahl verweist auf unbekannten Knoten '${choice.nextNodeId}'.`
          });
        }
        for (const effect of choice.effects ?? []) {
          if ('itemId' in effect && !itemIds.has(effect.itemId)) {
            issues.push({
              path: `world.dialogs.${dialog.id}.${node.id}.${choice.id}.effects.${effect.itemId}`,
              message: `Dialogeffekt verweist auf unbekanntes Item '${effect.itemId}'.`
            });
          }
          if ('questId' in effect && !questIds.has(effect.questId)) {
            issues.push({
              path: `world.dialogs.${dialog.id}.${node.id}.${choice.id}.effects.${effect.questId}`,
              message: `Dialogeffekt verweist auf unbekannte Quest '${effect.questId}'.`
            });
          }
        }
        for (const requirement of choice.requirements ?? []) {
          if (requirement.questStatus && !questIds.has(requirement.questStatus.questId)) {
            issues.push({
              path: `world.dialogs.${dialog.id}.${node.id}.${choice.id}.requirements.${requirement.questStatus.questId}`,
              message: `Dialoganforderung verweist auf unbekannte Quest '${requirement.questStatus.questId}'.`
            });
          }
        }
      }
    }
  }

  return issues;
}

function validateJobMultipliers(job: JobDefinition, issues: DataValidationIssue[]): void {
  for (const [stat, multiplier] of Object.entries(job.statMultiplier)) {
    if (typeof multiplier !== 'number' || !Number.isFinite(multiplier) || multiplier <= 0) {
      issues.push({
        path: `jobs.${job.id}.statMultiplier.${stat}`,
        message: 'Job-Multiplikator muss eine positive Zahl sein.'
      });
    }
  }
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
