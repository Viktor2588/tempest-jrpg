import { ENEMIES } from '../data';
import type { EnemyDefinition } from '../data';
import { experienceFalloffMultiplier, scaleEnemyStatsToLevel } from './enemyScaling';
import { createEnemyBattleUnit, type BattleUnitInput } from './battle';
import { clampLevel } from './stats';
import { addInventoryItem, type InventoryStack } from './inventory';
import { makeRng } from './rng';

export type LabyrinthModifier = 'crystal-fog' | 'hungry-corridor' | 'spirit-updraft';

export interface LabyrinthReward {
  readonly gold: number;
  readonly items: readonly { readonly itemId: string; readonly quantity: number }[];
}

export interface LabyrinthFloor {
  readonly depth: number;
  readonly enemyIds: readonly string[];
  readonly modifier: LabyrinthModifier;
  readonly reward: LabyrinthReward;
}

export interface LabyrinthRun {
  readonly seed: number;
  readonly floors: readonly LabyrinthFloor[];
  readonly carryRule: 'hp-mp-carry-no-rest';
}

const ENEMY_POOLS: readonly (readonly string[])[] = [
  ['spore-moth', 'lizardman-acolyte'],
  ['ogre-warrior', 'orc-soldier'],
  ['orc-general', 'lizardman-warrior'],
  ['magic-colossus']
];

const MODIFIERS: readonly LabyrinthModifier[] = ['crystal-fog', 'hungry-corridor', 'spirit-updraft'];

export function createLabyrinthRun(seed: number, floorCount = 3): LabyrinthRun {
  const rng = makeRng(seed);
  const floors = Array.from({ length: floorCount }, (_, index): LabyrinthFloor => {
    const depth = index + 1;
    const pool = ENEMY_POOLS[Math.min(index, ENEMY_POOLS.length - 1)]!;
    const rotate = Math.floor(rng() * pool.length);
    const enemyIds = [...pool.slice(rotate), ...pool.slice(0, rotate)];
    return {
      depth,
      enemyIds,
      modifier: MODIFIERS[Math.floor(rng() * MODIFIERS.length)]!,
      reward: rewardForDepth(depth)
    };
  });
  return { seed, floors, carryRule: 'hp-mp-carry-no-rest' };
}

export function collectLabyrinthReward(
  inventory: readonly InventoryStack[],
  gold: number,
  reward: LabyrinthReward
): { readonly inventory: readonly InventoryStack[]; readonly gold: number } {
  return {
    gold: Math.max(0, gold + reward.gold),
    inventory: reward.items.reduce(
      (stacks, item) => addInventoryItem(stacks, item.itemId, item.quantity),
      [...inventory]
    )
  };
}

// Phase 147 — Labyrinth skaliert party-relativ: tiefere Etagen führen die Party
// um einen kleinen Level-Vorsprung an (Floor 1 < 2 < 3), damit tiefer = härter.
// Die Party-relative Grundskalierung liefert bereits `effectiveEnemyLevel`
// (`kind: 'trigger'`, nie unter Basis); der Tiefen-Lead legt nur noch etwas drauf.
const LABYRINTH_ENCOUNTER_DEPTH: Readonly<Record<string, number>> = {
  'labyrinth-floor-1': 1,
  'labyrinth-floor-2': 2,
  'labyrinth-floor-3': 3
};

export function labyrinthEncounterDepth(encounterId: string | null | undefined): number | null {
  return (encounterId && LABYRINTH_ENCOUNTER_DEPTH[encounterId]) || null;
}

export function labyrinthFloorLevelLead(depth: number): number {
  return Math.max(0, Math.floor(depth) - 1);
}

const enemyById = new Map<string, EnemyDefinition>(ENEMIES.map((enemy) => [enemy.id, enemy]));

// Anders als reguläre Trigger-Encounter (gedeckelt auf Basis + 6) verfolgt das
// Labyrinth das VOLLE Party-Level (plus Tiefen-Lead), damit ein Lauf auch nach
// vielen Leveln fordernd bleibt — nie unter Basis (`Math.max`). Der XP-Falloff
// aus `enemyScaling` greift weiter → Overgrind bringt nichts.
export function labyrinthFloorEnemyLevel(baseLevel: number, partyLevel: number, depth: number): number {
  const target = clampLevel(partyLevel) + labyrinthFloorLevelLead(depth);
  return clampLevel(Math.max(clampLevel(baseLevel), target));
}

// Party-relative, tiefenskalierte Kampfeinheiten für eine Labyrinth-Etage.
export function createScaledLabyrinthFloorUnits(
  enemyIds: readonly string[],
  partyLevel: number,
  depth: number
): BattleUnitInput[] {
  return enemyIds.flatMap((enemyId): BattleUnitInput[] => {
    const enemy = enemyById.get(enemyId);
    if (!enemy) {
      return [];
    }
    const level = labyrinthFloorEnemyLevel(enemy.level, partyLevel, depth);
    return [{
      ...createEnemyBattleUnit(enemy),
      level,
      stats: scaleEnemyStatsToLevel(enemy.stats, enemy.level, level),
      experienceReward: Math.round(
        enemy.experienceReward * experienceFalloffMultiplier(enemy.level, partyLevel)
      )
    }];
  });
}

function rewardForDepth(depth: number): LabyrinthReward {
  if (depth >= 3) {
    return { gold: 120, items: [{ itemId: 'magisteel', quantity: 1 }, { itemId: 'spirit-ember', quantity: 1 }] };
  }
  if (depth === 2) {
    return { gold: 70, items: [{ itemId: 'magic-ore', quantity: 2 }] };
  }
  return { gold: 35, items: [{ itemId: 'healing-herb', quantity: 1 }] };
}
