import {
  CATCH_UP_CONFIG,
  ENEMIES,
  EVOLUTIONS,
  HEROES,
  JOBS,
  JOB_UNLOCKS,
  PROGRESSION_LINES,
  PROGRESSION_REGIONS,
  RELATIONSHIPS,
  SKILLS,
  type CatchUpConfig,
  type CharacterDefinition,
  type EvolutionDefinition,
  type JobDefinition,
  type JobUnlockDefinition,
  type ProgressionLineDefinition,
  type RegionProgressionDefinition,
  type RelationshipDefinition,
  type RelationshipLevelDefinition,
  type SkillDefinition,
  type StatBlock
} from '../data';
import { calculateMemberStats, getDefaultJobId } from './menu';
import type { PartyMemberState } from './party';
import { uniqueStrings } from './party';
import {
  addStats,
  clampLevel,
  clampNonNegativeInteger,
  experienceForLevel,
  levelForExperience,
  scaleStats
} from './stats';

export interface ProgressionState {
  readonly evolutionIdsByCharacterId: Readonly<Record<string, string>>;
  readonly relationshipPoints: Readonly<Record<string, number>>;
  readonly discoveredRegionIds: readonly string[];
}

export interface CreateProgressionStateOptions {
  readonly evolutionIdsByCharacterId?: Readonly<Record<string, string>>;
  readonly relationshipPoints?: Readonly<Record<string, number>>;
  readonly discoveredRegionIds?: readonly string[];
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

export interface CatchUpResult {
  readonly reserve: readonly PartyMemberState[];
  readonly targetLevel: number;
  readonly grantedExperience: number;
}

export interface BalanceIssue {
  readonly path: string;
  readonly message: string;
}

const heroById = new Map<string, CharacterDefinition>(HEROES.map((hero) => [hero.id, hero]));
const skillById = new Map<string, SkillDefinition>(SKILLS.map((skill) => [skill.id, skill]));
const jobById = new Map<string, JobDefinition>(JOBS.map((job) => [job.id, job]));
const regionById = new Map<string, RegionProgressionDefinition>(
  PROGRESSION_REGIONS.map((region) => [region.id, region])
);
const relationshipById = new Map<string, RelationshipDefinition>(
  RELATIONSHIPS.map((relationship) => [relationship.id, relationship])
);
const evolutionById = new Map<string, EvolutionDefinition>(
  EVOLUTIONS.map((evolution) => [evolution.id, evolution])
);

export function createProgressionState(options: CreateProgressionStateOptions = {}): ProgressionState {
  return {
    evolutionIdsByCharacterId: normalizeStringRecord(options.evolutionIdsByCharacterId ?? {}),
    relationshipPoints: normalizePointRecord(options.relationshipPoints ?? {}),
    discoveredRegionIds: uniqueStrings(options.discoveredRegionIds ?? [])
  };
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

export function getProgressionLine(characterId: string): ProgressionLineDefinition | undefined {
  return PROGRESSION_LINES.find((line) => line.characterId === characterId);
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

export function getUnlockedRelationshipScenes(
  state: ProgressionState,
  relationshipId: string,
  flags: Readonly<Record<string, boolean>> = {}
): readonly string[] {
  const relationship = relationshipById.get(relationshipId);
  if (!relationship) {
    return [];
  }
  const level = getRelationshipLevelNumber(state, relationshipId);
  return relationship.scenes
    .filter((scene) => level >= scene.requiredLevel)
    .filter((scene) => !scene.flagId || flags[scene.flagId])
    .map((scene) => scene.id);
}

export function calculateProgressionStats(
  member: PartyMemberState,
  state: ProgressionState,
  jobId = getDefaultJobId(member.characterId)
): StatBlock {
  const baseStats = calculateMemberStats(member, jobId);
  const evolutionStats = addStats(baseStats, getActiveEvolution(state, member.characterId)?.statBonus);
  return addStats(evolutionStats, calculateRelationshipBonus(member.characterId, state));
}

export function calculateRelationshipBonus(
  characterId: string,
  state: ProgressionState
): Partial<StatBlock> {
  return RELATIONSHIPS
    .filter((relationship) => relationship.characterId === characterId)
    .reduce<Partial<StatBlock>>((bonus, relationship) => {
      const activeLevel = getRelationshipLevel(state, relationship.id);
      return activeLevel ? addPartialStats(bonus, activeLevel.passiveBonus) : bonus;
    }, {});
}

export function getProgressionSkillIds(
  member: PartyMemberState,
  state: ProgressionState,
  jobId = getDefaultJobId(member.characterId)
): readonly string[] {
  const evolution = getActiveEvolution(state, member.characterId);
  const job = jobById.get(jobId);
  const relationshipSkillIds = RELATIONSHIPS
    .filter((relationship) => relationship.characterId === member.characterId)
    .flatMap((relationship) => getRelationshipLevel(state, relationship.id)?.skillIds ?? []);

  return uniqueStrings([
    ...member.learnedSkillIds,
    ...(evolution?.skillIds ?? []),
    ...relationshipSkillIds,
    ...(job?.skillIds ?? [])
  ]);
}

export function getProgressionSkills(
  member: PartyMemberState,
  state: ProgressionState,
  jobId = getDefaultJobId(member.characterId)
): readonly SkillDefinition[] {
  return getProgressionSkillIds(member, state, jobId).flatMap((skillId) => {
    const skill = skillById.get(skillId);
    return skill ? [skill] : [];
  });
}

export function getUnlockedJobIds(
  characterId: string,
  state: ProgressionState,
  flags: Readonly<Record<string, boolean>> = {}
): readonly string[] {
  const unlocked = new Set<string>();
  const activeEvolution = getActiveEvolution(state, characterId);

  for (const jobId of activeEvolution?.unlockedJobIds ?? []) {
    unlocked.add(jobId);
  }

  for (const relationship of RELATIONSHIPS.filter((entry) => entry.characterId === characterId)) {
    const level = getRelationshipLevel(state, relationship.id);
    for (const jobId of level?.unlockedJobIds ?? []) {
      unlocked.add(jobId);
    }
  }

  for (const unlock of JOB_UNLOCK_DEFINITIONS) {
    if (unlock.characterId && unlock.characterId !== characterId) {
      continue;
    }
    if (isJobUnlockSatisfied(unlock, characterId, state, flags)) {
      unlocked.add(unlock.jobId);
    }
  }

  return [...unlocked].sort();
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

  for (const relationship of RELATIONSHIPS) {
    let previousScore = 0;
    for (const level of relationship.levels) {
      const score = partialPowerScore(level.passiveBonus);
      if (score < previousScore) {
        issues.push({
          path: `balance.relationships.${relationship.id}.levels.${level.level}`,
          message: 'Beziehungsbonus fällt in späterer Stufe ab.'
        });
      }
      previousScore = score;
    }
  }

  for (const job of JOBS) {
    for (const [stat, multiplier] of Object.entries(job.statMultiplier)) {
      if (typeof multiplier === 'number' && (multiplier < 0.75 || multiplier > 1.4)) {
        issues.push({
          path: `balance.jobs.${job.id}.statMultiplier.${stat}`,
          message: 'Job-Multiplikator liegt außerhalb des Balancing-Bands 0.75–1.40.'
        });
      }
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

export function getProgressionRegions(): readonly RegionProgressionDefinition[] {
  return PROGRESSION_REGIONS;
}

export function getProgressionRelationships(characterId: string): readonly RelationshipDefinition[] {
  return RELATIONSHIPS.filter((relationship) => relationship.characterId === characterId);
}

function isJobUnlockSatisfied(
  unlock: JobUnlockDefinition,
  characterId: string,
  state: ProgressionState,
  flags: Readonly<Record<string, boolean>>
): boolean {
  const job = jobById.get(unlock.jobId);
  const allowedCharacterIds: readonly string[] = job?.allowedCharacterIds ?? [];
  if (!job || (allowedCharacterIds.length > 0 && !allowedCharacterIds.includes(characterId))) {
    return false;
  }
  if (unlock.requiredEvolutionId) {
    const activeEvolution = getActiveEvolution(state, characterId);
    if (activeEvolution?.id !== unlock.requiredEvolutionId) {
      return false;
    }
  }
  if (unlock.requiredRelationshipLevel) {
    const level = getRelationshipLevelNumber(state, unlock.requiredRelationshipLevel.relationshipId);
    if (level < unlock.requiredRelationshipLevel.level) {
      return false;
    }
  }
  if (unlock.requiredFlag && !flags[unlock.requiredFlag]) {
    return false;
  }
  if (unlock.requiredRegionId && !state.discoveredRegionIds.includes(unlock.requiredRegionId)) {
    return false;
  }
  return true;
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

function addPartialStats(a: Partial<StatBlock>, b: Partial<StatBlock>): Partial<StatBlock> {
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

const JOB_UNLOCK_DEFINITIONS: readonly JobUnlockDefinition[] = JOB_UNLOCKS;

const GAME_ENEMY_LEVELS = new Map<string, number>(
  ENEMIES.map((enemy) => [enemy.id, enemy.level] as const)
);
