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
  ['spore-moth', 'lizardman-acolyte', 'thorn-treant'],
  ['ogre-warrior', 'orc-soldier', 'marsh-hexer'],
  ['orc-general', 'lizardman-warrior', 'storm-shard'],
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

function rewardForDepth(depth: number): LabyrinthReward {
  if (depth >= 3) {
    return { gold: 120, items: [{ itemId: 'magisteel', quantity: 1 }, { itemId: 'spirit-ember', quantity: 1 }] };
  }
  if (depth === 2) {
    return { gold: 70, items: [{ itemId: 'magic-ore', quantity: 2 }] };
  }
  return { gold: 35, items: [{ itemId: 'healing-herb', quantity: 1 }] };
}
