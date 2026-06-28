import type { StatBlock } from '../data';

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 99;

export function clampLevel(level: number): number {
  if (!Number.isFinite(level)) {
    return MIN_LEVEL;
  }
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.trunc(level)));
}

export function clampNonNegativeInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.trunc(value));
}

export function experienceForLevel(level: number): number {
  const clampedLevel = clampLevel(level);
  if (clampedLevel <= 1) {
    return 0;
  }

  const previousLevels = clampedLevel - 1;
  return previousLevels * previousLevels * 50;
}

export function levelForExperience(experience: number): number {
  const safeExperience = clampNonNegativeInteger(experience);
  let level = MIN_LEVEL;

  while (level < MAX_LEVEL && experienceForLevel(level + 1) <= safeExperience) {
    level += 1;
  }

  return level;
}

export function addStats(base: StatBlock, bonus: Partial<StatBlock> = {}): StatBlock {
  return {
    maxHp: base.maxHp + (bonus.maxHp ?? 0),
    maxMp: base.maxMp + (bonus.maxMp ?? 0),
    attack: base.attack + (bonus.attack ?? 0),
    defense: base.defense + (bonus.defense ?? 0),
    magic: base.magic + (bonus.magic ?? 0),
    spirit: base.spirit + (bonus.spirit ?? 0),
    agility: base.agility + (bonus.agility ?? 0)
  };
}

export function addPartialStats(a: Partial<StatBlock>, b: Partial<StatBlock>): Partial<StatBlock> {
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

export function multiplyPartialStats(
  stats: Partial<StatBlock>,
  multiplier: number
): Partial<StatBlock> {
  return {
    maxHp: (stats.maxHp ?? 0) * multiplier,
    maxMp: (stats.maxMp ?? 0) * multiplier,
    attack: (stats.attack ?? 0) * multiplier,
    defense: (stats.defense ?? 0) * multiplier,
    magic: (stats.magic ?? 0) * multiplier,
    spirit: (stats.spirit ?? 0) * multiplier,
    agility: (stats.agility ?? 0) * multiplier
  };
}

export function scaleStats(base: StatBlock, growthPerLevel: StatBlock, level: number): StatBlock {
  const steps = clampLevel(level) - 1;
  return {
    maxHp: base.maxHp + growthPerLevel.maxHp * steps,
    maxMp: base.maxMp + growthPerLevel.maxMp * steps,
    attack: base.attack + growthPerLevel.attack * steps,
    defense: base.defense + growthPerLevel.defense * steps,
    magic: base.magic + growthPerLevel.magic * steps,
    spirit: base.spirit + growthPerLevel.spirit * steps,
    agility: base.agility + growthPerLevel.agility * steps
  };
}
