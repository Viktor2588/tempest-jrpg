import { HEROES } from './characters';
import { ENEMIES } from './enemies';
import { ITEMS } from './items';
import { JOBS } from './jobs';
import {
  CATCH_UP_CONFIG,
  EVOLUTIONS,
  JOB_UNLOCKS,
  PROGRESSION_LINES,
  PROGRESSION_REGIONS,
  RELATIONSHIPS
} from './progression';
import { SKILLS } from './skills';
import { DIALOGS, ENCOUNTERS, NPCS, QUESTS, SHOPS } from './world';
import type { DialogChoiceDefinition } from './world';
import type {
  CatchUpConfig,
  EvolutionDefinition,
  JobUnlockDefinition,
  ProgressionLineDefinition,
  RegionProgressionDefinition,
  RelationshipDefinition
} from './progression';
import type {
  CharacterDefinition,
  EnemyDefinition,
  EquipmentSlot,
  ItemDefinition,
  JobDefinition,
  SkillDefinition,
  StatBlock
} from './types';

export { HEROES } from './characters';
export { ENEMIES } from './enemies';
export { ITEMS } from './items';
export { JOBS } from './jobs';
export {
  CATCH_UP_CONFIG,
  EVOLUTIONS,
  JOB_UNLOCKS,
  PROGRESSION_LINES,
  PROGRESSION_REGIONS,
  RELATIONSHIPS
} from './progression';
export { SKILLS } from './skills';
export { DIALOGS, ENCOUNTERS, NPCS, QUESTS, SHOPS } from './world';
export type {
  CatchUpConfig,
  EvolutionDefinition,
  JobUnlockDefinition,
  ProgressionLineDefinition,
  ProgressionUnlockSource,
  RegionProgressionDefinition,
  RelationshipDefinition,
  RelationshipLevelDefinition,
  RelationshipSceneDefinition
} from './progression';
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
  progression: {
    regions: PROGRESSION_REGIONS,
    lines: PROGRESSION_LINES,
    evolutions: EVOLUTIONS,
    relationships: RELATIONSHIPS,
    jobUnlocks: JOB_UNLOCKS,
    catchUp: CATCH_UP_CONFIG
  },
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
  readonly progression: {
    readonly regions: readonly RegionProgressionDefinition[];
    readonly lines: readonly ProgressionLineDefinition[];
    readonly evolutions: readonly EvolutionDefinition[];
    readonly relationships: readonly RelationshipDefinition[];
    readonly jobUnlocks: readonly JobUnlockDefinition[];
    readonly catchUp: CatchUpConfig;
  };
  readonly world: typeof GAME_DATA.world;
}

export function validateGameData(data: DataSet = GAME_DATA): DataValidationIssue[] {
  const issues: DataValidationIssue[] = [];
  const skillIds = new Set<string>(data.skills.map((skill) => skill.id));
  const itemIds = new Set<string>(data.items.map((item) => item.id));
  const heroIds = new Set<string>(data.heroes.map((hero) => hero.id));
  const enemyIds = new Set<string>(data.enemies.map((enemy) => enemy.id));
  const jobIds = new Set<string>(data.jobs.map((job) => job.id));
  const dialogIds = new Set<string>(data.world.dialogs.map((dialog) => dialog.id));
  const encounterIds = new Set<string>(data.world.encounters.map((encounter) => encounter.id));
  const npcIds = new Set<string>(data.world.npcs.map((npc) => npc.id));
  const questIds = new Set<string>(data.world.quests.map((quest) => quest.id));
  const regionIds = new Set<string>(data.progression.regions.map((region) => region.id));
  const lineIds = new Set<string>(data.progression.lines.map((line) => line.id));
  const evolutionIds = new Set<string>(data.progression.evolutions.map((evolution) => evolution.id));
  const relationshipIds = new Set<string>(data.progression.relationships.map((relationship) => relationship.id));

  validateUniqueIds('skills', data.skills, issues);
  validateUniqueIds('items', data.items, issues);
  validateUniqueIds('jobs', data.jobs, issues);
  validateUniqueIds('progression.regions', data.progression.regions, issues);
  validateUniqueIds('progression.lines', data.progression.lines, issues);
  validateUniqueIds('progression.evolutions', data.progression.evolutions, issues);
  validateUniqueIds('progression.relationships', data.progression.relationships, issues);
  validateUniqueIds('progression.jobUnlocks', data.progression.jobUnlocks, issues);
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

  for (const region of data.progression.regions) {
    validatePositiveInteger(`progression.regions.${region.id}.baselineLevel`, region.baselineLevel, issues);
    if (region.chapterId.trim().length === 0) {
      issues.push({
        path: `progression.regions.${region.id}.chapterId`,
        message: 'Kapitel-ID darf nicht leer sein.'
      });
    }
    for (const encounterId of region.encounterIds) {
      if (!encounterIds.has(encounterId)) {
        issues.push({
          path: `progression.regions.${region.id}.encounterIds.${encounterId}`,
          message: `Region verweist auf unbekannten Encounter '${encounterId}'.`
        });
      }
    }
    for (const enemyId of region.enemyIds) {
      if (!enemyIds.has(enemyId)) {
        issues.push({
          path: `progression.regions.${region.id}.enemyIds.${enemyId}`,
          message: `Region verweist auf unbekannten Gegner '${enemyId}'.`
        });
      }
    }
  }

  for (const line of data.progression.lines) {
    if (!heroIds.has(line.characterId)) {
      issues.push({
        path: `progression.lines.${line.id}.characterId`,
        message: `Progressionslinie verweist auf unbekannten Charakter '${line.characterId}'.`
      });
    }
    if (!regionIds.has(line.regionId)) {
      issues.push({
        path: `progression.lines.${line.id}.regionId`,
        message: `Progressionslinie verweist auf unbekannte Region '${line.regionId}'.`
      });
    }
    for (const enemyId of line.rivalEnemyIds) {
      if (!enemyIds.has(enemyId)) {
        issues.push({
          path: `progression.lines.${line.id}.rivalEnemyIds.${enemyId}`,
          message: `Progressionslinie verweist auf unbekannten Rivalen '${enemyId}'.`
        });
      }
    }
  }

  for (const evolution of data.progression.evolutions) {
    const line = data.progression.lines.find((candidate) => candidate.id === evolution.lineId);
    if (!lineIds.has(evolution.lineId)) {
      issues.push({
        path: `progression.evolutions.${evolution.id}.lineId`,
        message: `Entwicklung verweist auf unbekannte Linie '${evolution.lineId}'.`
      });
    }
    if (!heroIds.has(evolution.characterId)) {
      issues.push({
        path: `progression.evolutions.${evolution.id}.characterId`,
        message: `Entwicklung verweist auf unbekannten Charakter '${evolution.characterId}'.`
      });
    }
    if (line && line.characterId !== evolution.characterId) {
      issues.push({
        path: `progression.evolutions.${evolution.id}.characterId`,
        message: `Entwicklung passt nicht zur Linie '${evolution.lineId}'.`
      });
    }
    validatePositiveInteger(`progression.evolutions.${evolution.id}.requiredLevel`, evolution.requiredLevel, issues);
    validatePositiveInteger(`progression.evolutions.${evolution.id}.rank`, evolution.rank, issues);
    validateStatBonus(`progression.evolutions.${evolution.id}.statBonus`, evolution.statBonus, issues);
    validateSkillReferences(`progression.evolutions.${evolution.id}.skillIds`, evolution.skillIds, skillIds, issues);
    validateJobReferences(`progression.evolutions.${evolution.id}.unlockedJobIds`, evolution.unlockedJobIds, jobIds, issues);
  }

  for (const relationship of data.progression.relationships) {
    if (!heroIds.has(relationship.characterId)) {
      issues.push({
        path: `progression.relationships.${relationship.id}.characterId`,
        message: `Beziehung verweist auf unbekannten Charakter '${relationship.characterId}'.`
      });
    }
    if (relationship.partnerKind === 'npc' && !npcIds.has(relationship.partnerId)) {
      issues.push({
        path: `progression.relationships.${relationship.id}.partnerId`,
        message: `NPC-Beziehung verweist auf unbekannten NPC '${relationship.partnerId}'.`
      });
    }
    let previousLevel = 0;
    let previousPoints = -1;
    for (const level of relationship.levels) {
      validatePositiveInteger(`progression.relationships.${relationship.id}.levels.${level.level}.level`, level.level, issues);
      validateNonNegativeInteger(
        `progression.relationships.${relationship.id}.levels.${level.level}.requiredPoints`,
        level.requiredPoints,
        issues
      );
      if (level.level <= previousLevel || level.requiredPoints <= previousPoints) {
        issues.push({
          path: `progression.relationships.${relationship.id}.levels.${level.level}`,
          message: 'Beziehungsstufen müssen streng aufsteigend sortiert sein.'
        });
      }
      validateStatBonus(
        `progression.relationships.${relationship.id}.levels.${level.level}.passiveBonus`,
        level.passiveBonus,
        issues
      );
      validateSkillReferences(
        `progression.relationships.${relationship.id}.levels.${level.level}.skillIds`,
        level.skillIds ?? [],
        skillIds,
        issues
      );
      validateJobReferences(
        `progression.relationships.${relationship.id}.levels.${level.level}.unlockedJobIds`,
        level.unlockedJobIds ?? [],
        jobIds,
        issues
      );
      previousLevel = level.level;
      previousPoints = level.requiredPoints;
    }
    for (const scene of relationship.scenes) {
      validatePositiveInteger(
        `progression.relationships.${relationship.id}.scenes.${scene.id}.requiredLevel`,
        scene.requiredLevel,
        issues
      );
      if (!relationship.levels.some((level) => level.level >= scene.requiredLevel)) {
        issues.push({
          path: `progression.relationships.${relationship.id}.scenes.${scene.id}.requiredLevel`,
          message: 'Beziehungsszene verlangt eine nicht erreichbare Stufe.'
        });
      }
    }
  }

  for (const unlock of data.progression.jobUnlocks) {
    if (!jobIds.has(unlock.jobId)) {
      issues.push({
        path: `progression.jobUnlocks.${unlock.id}.jobId`,
        message: `Job-Freischaltung verweist auf unbekannten Job '${unlock.jobId}'.`
      });
    }
    if (unlock.characterId && !heroIds.has(unlock.characterId)) {
      issues.push({
        path: `progression.jobUnlocks.${unlock.id}.characterId`,
        message: `Job-Freischaltung verweist auf unbekannten Charakter '${unlock.characterId}'.`
      });
    }
    if (unlock.requiredEvolutionId && !evolutionIds.has(unlock.requiredEvolutionId)) {
      issues.push({
        path: `progression.jobUnlocks.${unlock.id}.requiredEvolutionId`,
        message: `Job-Freischaltung verweist auf unbekannte Entwicklung '${unlock.requiredEvolutionId}'.`
      });
    }
    if (unlock.requiredRegionId && !regionIds.has(unlock.requiredRegionId)) {
      issues.push({
        path: `progression.jobUnlocks.${unlock.id}.requiredRegionId`,
        message: `Job-Freischaltung verweist auf unbekannte Region '${unlock.requiredRegionId}'.`
      });
    }
    const requiredRelationship = unlock.requiredRelationshipLevel;
    if (requiredRelationship && !relationshipIds.has(requiredRelationship.relationshipId)) {
      issues.push({
        path: `progression.jobUnlocks.${unlock.id}.requiredRelationshipLevel.relationshipId`,
        message: `Job-Freischaltung verweist auf unbekannte Beziehung '${requiredRelationship.relationshipId}'.`
      });
    }
  }

  validateNonNegativeInteger('progression.catchUp.maxLevelGap', data.progression.catchUp.maxLevelGap, issues);
  if (data.progression.catchUp.reserveExperienceRate < 0 || data.progression.catchUp.reserveExperienceRate > 1) {
    issues.push({
      path: 'progression.catchUp.reserveExperienceRate',
      message: 'Reserve-EP-Rate muss zwischen 0 und 1 liegen.'
    });
  }
  for (const [chapterId, baseline] of Object.entries(data.progression.catchUp.chapterBaselines)) {
    validatePositiveInteger(`progression.catchUp.chapterBaselines.${chapterId}`, baseline, issues);
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

function validateJobReferences(
  path: string,
  jobIds: readonly string[],
  knownJobIds: ReadonlySet<string>,
  issues: DataValidationIssue[]
): void {
  for (const jobId of jobIds) {
    if (!knownJobIds.has(jobId)) {
      issues.push({
        path: `${path}.${jobId}`,
        message: `Unbekannter Job '${jobId}'.`
      });
    }
  }
}

function validateStatBonus(
  path: string,
  bonus: Partial<Record<keyof StatBlock, number>>,
  issues: DataValidationIssue[]
): void {
  for (const [stat, value] of Object.entries(bonus)) {
    if (!Number.isInteger(value) || value < 0) {
      issues.push({
        path: `${path}.${stat}`,
        message: 'Stat-Bonus muss eine nicht-negative ganze Zahl sein.'
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
