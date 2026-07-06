import { describe, expect, it } from 'vitest';
import { CRAFTING_RECIPES, ITEMS } from '../src/data';
import {
  buildForgeView,
  canCraftRecipe,
  craftRecipe,
  getRecipe,
  isRecipeUnlocked,
  type CraftContext
} from '../src/systems/crafting';
import { getItemCount } from '../src/systems/inventory';
import { createProgressionState } from '../src/systems/progression';
import { createNewSave, loadSave, writeSave, type StorageLike } from '../src/systems/save';

const itemIds = new Set(ITEMS.map((item) => item.id));
const SMITH_FLAG = { 'craft.smithing.unlocked': true } as const;

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function context(overrides: Partial<CraftContext> = {}): CraftContext {
  return {
    inventory: [],
    gold: 0,
    flags: SMITH_FLAG,
    craftedRecipeIds: [],
    ...overrides
  };
}

describe('crafting data', () => {
  it('verweist nur auf existierende Items und gatet über ein Flag', () => {
    for (const recipe of CRAFTING_RECIPES) {
      expect(itemIds.has(recipe.outputItemId), `${recipe.id} output`).toBe(true);
      expect(recipe.outputQuantity).toBeGreaterThan(0);
      expect(recipe.inputs.length).toBeGreaterThan(0);
      expect(recipe.requiresFlag).toBeTruthy();
      for (const input of recipe.inputs) {
        expect(itemIds.has(input.itemId), `${recipe.id} input ${input.itemId}`).toBe(true);
        expect(input.quantity).toBeGreaterThan(0);
      }
    }
  });
});

describe('craftRecipe', () => {
  it('verbraucht Inputs + Gold und legt den Output ins Inventar', () => {
    const recipe = getRecipe('refine-magisteel')!;
    const before = context({
      inventory: [{ itemId: 'magic-ore', quantity: 3 }],
      gold: 100
    });

    const result = craftRecipe(recipe, before);

    expect(result.ok).toBe(true);
    expect(result.gold).toBe(100 - recipe.goldCost);
    expect(getItemCount(result.inventory, 'magic-ore')).toBe(1);
    expect(getItemCount(result.inventory, 'magisteel')).toBe(1);
  });

  it('respektiert das Gating: gesperrt ohne Flag', () => {
    const recipe = getRecipe('refine-magisteel')!;
    const before = context({
      inventory: [{ itemId: 'magic-ore', quantity: 3 }],
      gold: 100,
      flags: {}
    });

    const result = craftRecipe(recipe, before);

    expect(result.ok).toBe(false);
    expect(getItemCount(result.inventory, 'magisteel')).toBe(0);
    expect(result.gold).toBe(100);
  });

  it('schlägt bei fehlendem Material oder Gold fehl, ohne etwas zu verbrauchen', () => {
    const recipe = getRecipe('refine-magisteel')!;

    const noMaterial = craftRecipe(recipe, context({ gold: 100 }));
    expect(noMaterial.ok).toBe(false);

    const noGold = craftRecipe(
      recipe,
      context({ inventory: [{ itemId: 'magic-ore', quantity: 2 }], gold: 0 })
    );
    expect(noGold.ok).toBe(false);
    expect(getItemCount(noGold.inventory, 'magic-ore')).toBe(2);
  });

  it('markiert einmalige Rezepte als geschmiedet und blendet sie danach aus', () => {
    const recipe = getRecipe('forge-famine-charm')!;
    expect(recipe.repeatable).toBe(false);
    const before = context({
      inventory: [
        { itemId: 'geld-core', quantity: 1 },
        { itemId: 'magisteel', quantity: 1 }
      ],
      gold: 500
    });

    const result = craftRecipe(recipe, before);
    expect(result.ok).toBe(true);
    expect(result.craftedRecipeIds).toContain('forge-famine-charm');
    expect(getItemCount(result.inventory, 'famine-charm')).toBe(1);

    // Nach dem Schmieden nicht mehr freigeschaltet / sichtbar.
    expect(isRecipeUnlocked(recipe, SMITH_FLAG, result.craftedRecipeIds)).toBe(false);
    const view = buildForgeView(context({ craftedRecipeIds: result.craftedRecipeIds }));
    expect(view.some((row) => row.recipe.id === 'forge-famine-charm')).toBe(false);
  });

  it('lässt wiederholbare Rezepte nach dem Schmieden bestehen', () => {
    const recipe = getRecipe('refine-magisteel')!;
    const result = craftRecipe(
      recipe,
      context({ inventory: [{ itemId: 'magic-ore', quantity: 2 }], gold: 100 })
    );
    expect(result.craftedRecipeIds).toHaveLength(0);
    expect(isRecipeUnlocked(recipe, SMITH_FLAG, result.craftedRecipeIds)).toBe(true);
  });
});

describe('buildForgeView', () => {
  it('zeigt Freischaltung, Bezahlbarkeit und Schmiedbarkeit korrekt an', () => {
    const view = buildForgeView(
      context({ inventory: [{ itemId: 'magic-ore', quantity: 2 }], gold: 60 })
    );
    const refine = view.find((row) => row.recipe.id === 'refine-magisteel')!;
    expect(refine.craftable).toBe(true);
    expect(refine.affordable).toBe(true);

    const blade = view.find((row) => row.recipe.id === 'forge-magisteel-blade')!;
    expect(blade.craftable).toBe(false); // kein Magisteel im Inventar
  });

  it('ist ohne Schmiede-Flag leer', () => {
    expect(buildForgeView(context({ flags: {} }))).toHaveLength(0);
  });
});

describe('canCraftRecipe', () => {
  it('nennt einen Grund, wenn Material fehlt', () => {
    const recipe = getRecipe('forge-magisteel-blade')!;
    const check = canCraftRecipe(recipe, context({ gold: 999 }));
    expect(check.ok).toBe(false);
    expect(check.reason).toContain('Magisteel');
  });
});

describe('Save-Persistenz der geschmiedeten Rezepte', () => {
  it('roundtript craftedRecipeIds über writeSave/loadSave', () => {
    const storage = new MemoryStorage();
    const save = createNewSave({ now: '2026-07-06T00:00:00.000Z', seed: 7 });
    writeSave(storage, {
      ...save,
      progression: createProgressionState({ craftedRecipeIds: ['forge-famine-charm'] })
    });

    const loaded = loadSave(storage)!;
    expect(loaded.progression.craftedRecipeIds).toEqual(['forge-famine-charm']);
  });

  it('migriert Altstände ohne craftedRecipeIds zu einer leeren Liste', () => {
    const migrated = createProgressionState({});
    expect(migrated.craftedRecipeIds).toEqual([]);
  });
});
