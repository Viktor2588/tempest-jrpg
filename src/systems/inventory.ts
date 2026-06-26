import { ITEMS } from '../data';
import type { ItemDefinition } from '../data';

export interface InventoryStack {
  readonly itemId: string;
  readonly quantity: number;
}

export function createInitialInventory(itemDefinitions: readonly ItemDefinition[] = ITEMS): InventoryStack[] {
  return normalizeInventoryStacks(
    itemDefinitions.flatMap((item) =>
      item.startingQuantity && item.startingQuantity > 0
        ? [{ itemId: item.id, quantity: item.startingQuantity }]
        : []
    )
  );
}

export function normalizeInventoryStacks(stacks: readonly InventoryStack[]): InventoryStack[] {
  const quantities = new Map<string, number>();

  for (const stack of stacks) {
    if (stack.itemId.trim().length === 0 || !Number.isFinite(stack.quantity)) {
      continue;
    }

    const quantity = Math.trunc(stack.quantity);
    if (quantity <= 0) {
      continue;
    }

    quantities.set(stack.itemId, (quantities.get(stack.itemId) ?? 0) + quantity);
  }

  return [...quantities.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([itemId, quantity]) => ({ itemId, quantity }));
}

export function getItemCount(stacks: readonly InventoryStack[], itemId: string): number {
  return stacks.find((stack) => stack.itemId === itemId)?.quantity ?? 0;
}

export function addInventoryItem(
  stacks: readonly InventoryStack[],
  itemId: string,
  quantity = 1
): InventoryStack[] {
  return normalizeInventoryStacks([...stacks, { itemId, quantity }]);
}

export function removeInventoryItem(
  stacks: readonly InventoryStack[],
  itemId: string,
  quantity = 1
): InventoryStack[] {
  return normalizeInventoryStacks(
    stacks.map((stack) =>
      stack.itemId === itemId ? { ...stack, quantity: stack.quantity - quantity } : stack
    )
  );
}
