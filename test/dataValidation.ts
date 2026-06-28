import {
  GAME_DATA,
  type CatchUpConfig,
  type CharacterDefinition,
  type DialogChoiceDefinition,
  type DialogDefinition,
  type EncounterDefinition,
  type EnemyDefinition,
  type EquipmentSetDefinition,
  type EvolutionDefinition,
  type EquipmentSlot,
  type ItemDefinition,
  type LoreEntryDefinition,
  type NpcDefinition,
  type ProgressionLineDefinition,
  type QuestDefinition,
  type RegionProgressionDefinition,
  type RelationshipDefinition,
  type ShopDefinition,
  type SkillDefinition,
  type SkillTreeDefinition,
  type StatBlock,
  type WorldEffect,
  type WorldLocationDefinition,
  type WorldRequirement
} from '../src/data';

export interface DataValidationIssue {
  readonly path: string;
  readonly message: string;
}

interface DataSet {
  readonly heroes: readonly CharacterDefinition[];
  readonly enemies: readonly EnemyDefinition[];
  readonly items: readonly ItemDefinition[];
  readonly skills: readonly SkillDefinition[];
  readonly progression: {
    readonly regions: readonly RegionProgressionDefinition[];
    readonly lines: readonly ProgressionLineDefinition[];
    readonly evolutions: readonly EvolutionDefinition[];
    readonly relationships: readonly RelationshipDefinition[];
    readonly skillTrees: readonly SkillTreeDefinition[];
    readonly equipmentSets: readonly EquipmentSetDefinition[];
    readonly catchUp: CatchUpConfig;
  };
  readonly world: {
    readonly dialogs: readonly DialogDefinition[];
    readonly encounters: readonly EncounterDefinition[];
    readonly locations: readonly WorldLocationDefinition[];
    readonly lore: readonly LoreEntryDefinition[];
    readonly npcs: readonly NpcDefinition[];
    readonly quests: readonly QuestDefinition[];
    readonly shops: readonly ShopDefinition[];
  };
}

export function validateGameData(data: DataSet = GAME_DATA): DataValidationIssue[] {
  const issues: DataValidationIssue[] = [];
  const skillIds = new Set<string>(data.skills.map((skill) => skill.id));
  const itemIds = new Set<string>(data.items.map((item) => item.id));
  const heroIds = new Set<string>(data.heroes.map((hero) => hero.id));
  const enemyIds = new Set<string>(data.enemies.map((enemy) => enemy.id));
  const dialogIds = new Set<string>(data.world.dialogs.map((dialog) => dialog.id));
  const encounterIds = new Set<string>(data.world.encounters.map((encounter) => encounter.id));
  const locationIds = new Set<string>(data.world.locations.map((location) => location.id));
  const npcIds = new Set<string>(data.world.npcs.map((npc) => npc.id));
  const questIds = new Set<string>(data.world.quests.map((quest) => quest.id));
  const questStepIdsByQuestId = new Map<string, Set<string>>(
    data.world.quests.map((quest) => [quest.id, new Set(quest.steps.map((step) => step.id))])
  );
  const regionIds = new Set<string>(data.progression.regions.map((region) => region.id));
  const lineIds = new Set<string>(data.progression.lines.map((line) => line.id));
  const evolutionIds = new Set<string>(data.progression.evolutions.map((evolution) => evolution.id));
  const relationshipIds = new Set<string>(data.progression.relationships.map((relationship) => relationship.id));
  const equipmentSetIds = new Set<string>(data.progression.equipmentSets.map((set) => set.id));
  const skillTreeNodeIds = new Set<string>(
    data.progression.skillTrees.flatMap((tree) => tree.nodes.map((node) => node.id))
  );

  validateUniqueIds('skills', data.skills, issues);
  validateUniqueIds('items', data.items, issues);
  validateUniqueIds('progression.regions', data.progression.regions, issues);
  validateUniqueIds('progression.lines', data.progression.lines, issues);
  validateUniqueIds('progression.evolutions', data.progression.evolutions, issues);
  validateUniqueIds('progression.relationships', data.progression.relationships, issues);
  validateUniqueIds('progression.skillTrees', data.progression.skillTrees, issues);
  validateUniqueIds(
    'progression.skillTreeNodes',
    data.progression.skillTrees.flatMap((tree) => tree.nodes),
    issues
  );
  validateUniqueIds('progression.equipmentSets', data.progression.equipmentSets, issues);
  validateUniqueIds('world.dialogs', data.world.dialogs, issues);
  validateUniqueIds('world.encounters', data.world.encounters, issues);
  validateUniqueIds('world.locations', data.world.locations, issues);
  validateUniqueIds('world.lore', data.world.lore, issues);
  validateUniqueIds('world.npcs', data.world.npcs, issues);
  validateUniqueIds('world.quests', data.world.quests, issues);
  validateUniqueIds(
    'world.questSteps',
    data.world.quests.flatMap((quest) => quest.steps.map((step) => ({ id: `${quest.id}.${step.id}` }))),
    issues
  );
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
    if (item.equipmentSetId && !equipmentSetIds.has(item.equipmentSetId)) {
      issues.push({
        path: `items.${item.id}.equipmentSetId`,
        message: `Item verweist auf unbekanntes Set '${item.equipmentSetId}'.`
      });
    }
    if (item.enchantment) {
      validatePositiveInteger(`items.${item.id}.enchantment.maxLevel`, item.enchantment.maxLevel, issues);
      validatePositiveInteger(
        `items.${item.id}.enchantment.goldCostPerLevel`,
        item.enchantment.goldCostPerLevel,
        issues
      );
      validateStatBonus(
        `items.${item.id}.enchantment.statBonusPerLevel`,
        item.enchantment.statBonusPerLevel,
        issues
      );
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
    validatePositiveInteger(
      `progression.evolutions.${evolution.id}.skillPointReward`,
      evolution.skillPointReward,
      issues
    );
    validateStatBonus(`progression.evolutions.${evolution.id}.statBonus`, evolution.statBonus, issues);
    validateSkillReferences(`progression.evolutions.${evolution.id}.skillIds`, evolution.skillIds, skillIds, issues);
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
    if (relationship.partnerKind === 'party' && !heroIds.has(relationship.partnerId)) {
      issues.push({
        path: `progression.relationships.${relationship.id}.partnerId`,
        message: `Party-Beziehung verweist auf unbekannten Charakter '${relationship.partnerId}'.`
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
      validateStatBonus(
        `progression.relationships.${relationship.id}.levels.${level.level}.partnerPassiveBonus`,
        level.partnerPassiveBonus ?? {},
        issues
      );
      if ((level.combatBonus?.startingTeamMeter ?? 0) < 0
        || (level.combatBonus?.startingTeamMeter ?? 0) > 100) {
        issues.push({
          path: `progression.relationships.${relationship.id}.levels.${level.level}.combatBonus.startingTeamMeter`,
          message: 'Start-Teamleiste muss zwischen 0 und 100 liegen.'
        });
      }
      validateSkillReferences(
        `progression.relationships.${relationship.id}.levels.${level.level}.skillIds`,
        level.skillIds ?? [],
        skillIds,
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

  for (const tree of data.progression.skillTrees) {
    if (!heroIds.has(tree.characterId)) {
      issues.push({
        path: `progression.skillTrees.${tree.id}.characterId`,
        message: `Skill-Baum verweist auf unbekannten Charakter '${tree.characterId}'.`
      });
    }
    for (const node of tree.nodes) {
      validatePositiveInteger(`progression.skillTrees.${tree.id}.${node.id}.cost`, node.cost, issues);
      validatePositiveInteger(
        `progression.skillTrees.${tree.id}.${node.id}.requiredLevel`,
        node.requiredLevel,
        issues
      );
      validateSkillReferences(
        `progression.skillTrees.${tree.id}.${node.id}.skillId`,
        node.skillId ? [node.skillId] : [],
        skillIds,
        issues
      );
      validateStatBonus(
        `progression.skillTrees.${tree.id}.${node.id}.statBonus`,
        node.statBonus ?? {},
        issues
      );
      if (node.requiredEvolutionId && !evolutionIds.has(node.requiredEvolutionId)) {
        issues.push({
          path: `progression.skillTrees.${tree.id}.${node.id}.requiredEvolutionId`,
          message: `Skill-Knoten verweist auf unbekannte Entwicklung '${node.requiredEvolutionId}'.`
        });
      }
      if (node.requiredRelationshipLevel) {
        const relationship = data.progression.relationships.find(
          (candidate) => candidate.id === node.requiredRelationshipLevel?.relationshipId
        );
        if (!relationshipIds.has(node.requiredRelationshipLevel.relationshipId)) {
          issues.push({
            path: `progression.skillTrees.${tree.id}.${node.id}.requiredRelationshipLevel.relationshipId`,
            message: `Skill-Knoten verweist auf unbekannte Beziehung '${node.requiredRelationshipLevel.relationshipId}'.`
          });
        } else if (!relationship?.levels.some((level) =>
          level.level >= (node.requiredRelationshipLevel?.level ?? Number.POSITIVE_INFINITY)
        )) {
          issues.push({
            path: `progression.skillTrees.${tree.id}.${node.id}.requiredRelationshipLevel.level`,
            message: 'Skill-Knoten verlangt eine nicht erreichbare Beziehungsstufe.'
          });
        }
      }
      if (node.requiredFlag !== undefined && node.requiredFlag.trim().length === 0) {
        issues.push({
          path: `progression.skillTrees.${tree.id}.${node.id}.requiredFlag`,
          message: 'Skill-Knoten darf keine leere Story-Flag verlangen.'
        });
      }
      if (node.requiredRegionId && !regionIds.has(node.requiredRegionId)) {
        issues.push({
          path: `progression.skillTrees.${tree.id}.${node.id}.requiredRegionId`,
          message: `Skill-Knoten verweist auf unbekannte Region '${node.requiredRegionId}'.`
        });
      }
      for (const requiredNodeId of node.requiredNodeIds) {
        if (!skillTreeNodeIds.has(requiredNodeId)) {
          issues.push({
            path: `progression.skillTrees.${tree.id}.${node.id}.requiredNodeIds.${requiredNodeId}`,
            message: `Skill-Knoten verweist auf unbekannten Vorgänger '${requiredNodeId}'.`
          });
        }
      }
    }
  }

  for (const set of data.progression.equipmentSets) {
    for (const itemId of set.itemIds) {
      const item = data.items.find((candidate) => candidate.id === itemId);
      if (!item) {
        issues.push({
          path: `progression.equipmentSets.${set.id}.itemIds.${itemId}`,
          message: `Ausrüstungsset verweist auf unbekanntes Item '${itemId}'.`
        });
      } else if (item.equipmentSetId !== set.id) {
        issues.push({
          path: `progression.equipmentSets.${set.id}.itemIds.${itemId}`,
          message: `Item '${itemId}' ist nicht dem Set '${set.id}' zugeordnet.`
        });
      }
    }
    let previousPieces = 0;
    for (const tier of set.tiers) {
      validatePositiveInteger(
        `progression.equipmentSets.${set.id}.tiers.${tier.pieces}.pieces`,
        tier.pieces,
        issues
      );
      validateStatBonus(
        `progression.equipmentSets.${set.id}.tiers.${tier.pieces}.statBonus`,
        tier.statBonus,
        issues
      );
      if (tier.pieces <= previousPieces || tier.pieces > set.itemIds.length) {
        issues.push({
          path: `progression.equipmentSets.${set.id}.tiers.${tier.pieces}`,
          message: 'Set-Stufen müssen streng steigen und erreichbar sein.'
        });
      }
      previousPieces = tier.pieces;
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

  for (const quest of data.world.quests) {
    if (quest.steps.length === 0) {
      issues.push({
        path: `world.quests.${quest.id}.steps`,
        message: 'Quest braucht mindestens einen Schritt.'
      });
    }
    for (const step of quest.steps) {
      if (step.locationId && !locationIds.has(step.locationId)) {
        issues.push({
          path: `world.quests.${quest.id}.steps.${step.id}.locationId`,
          message: `Quest-Schritt verweist auf unbekannten Ort '${step.locationId}'.`
        });
      }
    }
    for (const itemId of quest.reward?.itemIds ?? []) {
      if (!itemIds.has(itemId)) {
        issues.push({
          path: `world.quests.${quest.id}.reward.itemIds.${itemId}`,
          message: `Quest-Belohnung verweist auf unbekanntes Item '${itemId}'.`
        });
      }
    }
  }

  for (const location of data.world.locations) {
    if (location.name.trim().length === 0 || location.identity.trim().length === 0) {
      issues.push({
        path: `world.locations.${location.id}`,
        message: 'Ort braucht Namen und spielerische Identität.'
      });
    }
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
    validateWorldRequirements(
      `world.encounters.${encounter.id}.requirements`,
      encounter.requirements ?? [],
      questIds,
      questStepIdsByQuestId,
      issues
    );
    validateWorldEffects(
      `world.encounters.${encounter.id}.startEffects`,
      encounter.startEffects ?? [],
      itemIds,
      questIds,
      questStepIdsByQuestId,
      issues
    );
    validateWorldEffects(
      `world.encounters.${encounter.id}.victoryEffects`,
      encounter.victoryEffects ?? [],
      itemIds,
      questIds,
      questStepIdsByQuestId,
      issues
    );
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
        validateWorldEffects(
          `world.dialogs.${dialog.id}.${node.id}.${choice.id}.effects`,
          choice.effects ?? [],
          itemIds,
          questIds,
          questStepIdsByQuestId,
          issues
        );
        validateWorldRequirements(
          `world.dialogs.${dialog.id}.${node.id}.${choice.id}.requirements`,
          choice.requirements ?? [],
          questIds,
          questStepIdsByQuestId,
          issues
        );
      }
    }
  }

  return issues;
}

function validateWorldEffects(
  path: string,
  effects: readonly WorldEffect[],
  itemIds: ReadonlySet<string>,
  questIds: ReadonlySet<string>,
  questStepIdsByQuestId: ReadonlyMap<string, ReadonlySet<string>>,
  issues: DataValidationIssue[]
): void {
  for (const effect of effects) {
    if ('itemId' in effect && !itemIds.has(effect.itemId)) {
      issues.push({
        path: `${path}.${effect.itemId}`,
        message: `Welteffekt verweist auf unbekanntes Item '${effect.itemId}'.`
      });
    }
    if ('questId' in effect) {
      validateQuestReference(`${path}.${effect.questId}`, effect.questId, questIds, issues, 'Welteffekt');
      if ('stepId' in effect) {
        validateQuestStepReference(
          `${path}.${effect.questId}.${effect.stepId}`,
          effect.questId,
          effect.stepId,
          questStepIdsByQuestId,
          issues,
          'Welteffekt'
        );
      }
    }
  }
}

function validateWorldRequirements(
  path: string,
  requirements: readonly WorldRequirement[],
  questIds: ReadonlySet<string>,
  questStepIdsByQuestId: ReadonlyMap<string, ReadonlySet<string>>,
  issues: DataValidationIssue[]
): void {
  for (const requirement of requirements) {
    if (requirement.questStatus) {
      validateQuestReference(
        `${path}.${requirement.questStatus.questId}`,
        requirement.questStatus.questId,
        questIds,
        issues,
        'Weltanforderung'
      );
    }
    for (const stepRequirement of [requirement.questStep, requirement.missingQuestStep]) {
      if (!stepRequirement) continue;
      validateQuestReference(
        `${path}.${stepRequirement.questId}`,
        stepRequirement.questId,
        questIds,
        issues,
        'Weltanforderung'
      );
      validateQuestStepReference(
        `${path}.${stepRequirement.questId}.${stepRequirement.stepId}`,
        stepRequirement.questId,
        stepRequirement.stepId,
        questStepIdsByQuestId,
        issues,
        'Weltanforderung'
      );
    }
  }
}

function validateQuestReference(
  path: string,
  questId: string,
  questIds: ReadonlySet<string>,
  issues: DataValidationIssue[],
  label: string
): void {
  if (!questIds.has(questId)) {
    issues.push({
      path,
      message: `${label} verweist auf unbekannte Quest '${questId}'.`
    });
  }
}

function validateQuestStepReference(
  path: string,
  questId: string,
  stepId: string,
  questStepIdsByQuestId: ReadonlyMap<string, ReadonlySet<string>>,
  issues: DataValidationIssue[],
  label: string
): void {
  if (!questStepIdsByQuestId.get(questId)?.has(stepId)) {
    issues.push({
      path,
      message: `${label} verweist auf unbekannten Quest-Schritt '${questId}.${stepId}'.`
    });
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
