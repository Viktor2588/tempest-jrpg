// Phase 67 — Mitwachsende Gegner (Anti-Overgrind): Gegner skalieren nur NACH OBEN,
// nie unter ihr Basislevel. Kein Voll-Level-Sync — auf dem normalen Pfad bleibt
// Leveln spürbar, aber Overgrinding kauft keine Trivialisierung mehr:
// XP/Gold skalieren nicht mit, und deutlich schwächere Basislevel geben
// abgeschwächte XP, damit Grinden von Low-Content nichts einbringt.
import { ENEMIES } from '../data';
import type { EnemyDefinition, StatBlock } from '../data';
import { ENCOUNTERS } from '../data/world';
import { createEnemyBattleUnit, type BattleUnitInput } from './battle';
import { clampLevel } from './stats';

export type EncounterScalingKind = 'random' | 'trigger';

export const ENEMY_SCALING = {
  // Prozentuales Wachstum je Level über Basis, relativ zu den Basiswerten.
  growthPerLevel: {
    maxHp: 0.07,
    maxMp: 0.05,
    attack: 0.05,
    defense: 0.04,
    magic: 0.05,
    spirit: 0.04,
    agility: 0.02
  },
  // Zufalls-/Trash-Encounter bleiben knapp unter der Party.
  random: { partyLevelRelief: 1, maxLevelRise: 8 },
  // Story-/Boss-Trigger ziehen leicht über die Party.
  trigger: { partyLevelLead: 1, maxLevelRise: 6 },
  // XP-Abschwächung nach Basislevel-Abstand (absteigend nach Gap geordnet).
  experienceFalloff: [
    { minLevelGap: 8, multiplier: 0.25 },
    { minLevelGap: 5, multiplier: 0.5 }
  ]
} as const;

const enemyById = new Map<string, EnemyDefinition>(ENEMIES.map((enemy) => [enemy.id, enemy]));
const encounterKindById = new Map<string, EncounterScalingKind>(
  ENCOUNTERS.map((encounter) => [encounter.id, encounter.kind])
);

export function averagePartyLevel(levels: readonly number[]): number {
  if (levels.length === 0) {
    return 1;
  }
  const sum = levels.reduce((total, level) => total + level, 0);
  return clampLevel(Math.floor(sum / levels.length));
}

export function scalingKindForEncounter(encounterId: string | null | undefined): EncounterScalingKind {
  return (encounterId && encounterKindById.get(encounterId)) || 'random';
}

export function effectiveEnemyLevel(
  baseLevel: number,
  partyLevel: number,
  kind: EncounterScalingKind
): number {
  const base = clampLevel(baseLevel);
  const party = clampLevel(partyLevel);
  const desired = kind === 'trigger'
    ? party + ENEMY_SCALING.trigger.partyLevelLead
    : party - ENEMY_SCALING.random.partyLevelRelief;
  const cap = base + (kind === 'trigger'
    ? ENEMY_SCALING.trigger.maxLevelRise
    : ENEMY_SCALING.random.maxLevelRise);
  return clampLevel(Math.max(base, Math.min(desired, cap)));
}

export function scaleEnemyStatsToLevel(
  stats: StatBlock,
  baseLevel: number,
  effectiveLevel: number
): StatBlock {
  const steps = Math.max(0, clampLevel(effectiveLevel) - clampLevel(baseLevel));
  if (steps === 0) {
    return stats;
  }
  const grow = (value: number, rate: number): number =>
    Math.max(1, Math.round(value * (1 + rate * steps)));
  const rates = ENEMY_SCALING.growthPerLevel;
  return {
    maxHp: grow(stats.maxHp, rates.maxHp),
    maxMp: grow(stats.maxMp, rates.maxMp),
    attack: grow(stats.attack, rates.attack),
    defense: grow(stats.defense, rates.defense),
    magic: grow(stats.magic, rates.magic),
    spirit: grow(stats.spirit, rates.spirit),
    agility: grow(stats.agility, rates.agility)
  };
}

export function experienceFalloffMultiplier(baseLevel: number, partyLevel: number): number {
  const gap = clampLevel(partyLevel) - clampLevel(baseLevel);
  for (const tier of ENEMY_SCALING.experienceFalloff) {
    if (gap >= tier.minLevelGap) {
      return tier.multiplier;
    }
  }
  return 1;
}

export function createScaledEnemyBattleUnit(
  enemy: EnemyDefinition,
  partyLevel: number,
  kind: EncounterScalingKind
): BattleUnitInput {
  const level = effectiveEnemyLevel(enemy.level, partyLevel, kind);
  return {
    ...createEnemyBattleUnit(enemy),
    level,
    stats: scaleEnemyStatsToLevel(enemy.stats, enemy.level, level),
    experienceReward: Math.round(
      enemy.experienceReward * experienceFalloffMultiplier(enemy.level, partyLevel)
    )
  };
}

export function createScaledEnemyBattleUnits(
  enemyIds: readonly string[],
  partyLevel: number,
  kind: EncounterScalingKind
): BattleUnitInput[] {
  return enemyIds.flatMap((enemyId): BattleUnitInput[] => {
    const enemy = enemyById.get(enemyId);
    return enemy ? [createScaledEnemyBattleUnit(enemy, partyLevel, kind)] : [];
  });
}
