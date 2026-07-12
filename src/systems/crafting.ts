import { CRAFTING_RECIPES, ITEMS } from '../data';
import type { CraftingRecipe, ItemDefinition, ItemRarity } from '../data';
import { addInventoryItem, getItemCount, removeInventoryItem } from './inventory';
import type { InventoryStack } from './inventory';
import { isEquipmentInstanceId, resolveInstanceItem } from './lootAffix';
import { rarityOf } from './itemRarity';

// Phase 91 — Die Schmiede (Crafting): reine Regeln über Inventar + Gold + Flags.
// Keine Scene-/WorldState-Abhängigkeit, damit sich alles headless testen lässt.

const recipeById = new Map<string, CraftingRecipe>(
  CRAFTING_RECIPES.map((recipe) => [recipe.id, recipe])
);
const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));

export interface CraftContext {
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly craftedRecipeIds: readonly string[];
}

export interface CraftResult {
  readonly ok: boolean;
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
  readonly craftedRecipeIds: readonly string[];
  readonly message: string;
}

export interface RecipeInputView {
  readonly itemId: string;
  readonly name: string;
  readonly required: number;
  readonly owned: number;
  readonly enough: boolean;
}

export interface ForgeRecipeView {
  readonly recipe: CraftingRecipe;
  readonly outputName: string;
  readonly inputs: readonly RecipeInputView[];
  readonly goldCost: number;
  readonly affordable: boolean;
  readonly craftable: boolean;
  readonly reason: string;
}

export function getRecipe(recipeId: string): CraftingRecipe | undefined {
  return recipeById.get(recipeId);
}

function itemName(itemId: string): string {
  return itemById.get(itemId)?.name ?? itemId;
}

// Ist das Rezept überhaupt sichtbar/freigeschaltet? Flag-Gate plus: einmalige
// Rezepte verschwinden, sobald sie geschmiedet wurden.
export function isRecipeUnlocked(
  recipe: CraftingRecipe,
  flags: Readonly<Record<string, boolean>>,
  craftedRecipeIds: readonly string[]
): boolean {
  if (recipe.requiresFlag && flags[recipe.requiresFlag] !== true) {
    return false;
  }
  if (!recipe.repeatable && craftedRecipeIds.includes(recipe.id)) {
    return false;
  }
  return true;
}

// Prüft Materialien + Gold für ein bereits freigeschaltetes Rezept.
export function canCraftRecipe(
  recipe: CraftingRecipe,
  context: CraftContext
): { readonly ok: boolean; readonly reason: string } {
  if (!isRecipeUnlocked(recipe, context.flags, context.craftedRecipeIds)) {
    return { ok: false, reason: 'Nicht freigeschaltet.' };
  }
  if (context.gold < recipe.goldCost) {
    return { ok: false, reason: `${recipe.goldCost} Gold erforderlich.` };
  }
  const missing = recipe.inputs.find(
    (input) => getItemCount(context.inventory, input.itemId) < input.quantity
  );
  if (missing) {
    return { ok: false, reason: `Material fehlt: ${itemName(missing.itemId)}.` };
  }
  return { ok: true, reason: '' };
}

export function craftRecipe(recipe: CraftingRecipe, context: CraftContext): CraftResult {
  const check = canCraftRecipe(recipe, context);
  if (!check.ok) {
    return {
      ok: false,
      inventory: context.inventory,
      gold: context.gold,
      craftedRecipeIds: context.craftedRecipeIds,
      message: check.reason
    };
  }

  let inventory: readonly InventoryStack[] = context.inventory;
  for (const input of recipe.inputs) {
    inventory = removeInventoryItem(inventory, input.itemId, input.quantity);
  }
  inventory = addInventoryItem(inventory, recipe.outputItemId, recipe.outputQuantity);

  const craftedRecipeIds = recipe.repeatable
    ? context.craftedRecipeIds
    : [...context.craftedRecipeIds, recipe.id];

  return {
    ok: true,
    inventory,
    gold: context.gold - recipe.goldCost,
    craftedRecipeIds,
    message: `${itemName(recipe.outputItemId)} geschmiedet.`
  };
}

// Phase 159 — Loot zerlegen (Salvage): ein Ausruestungs-Item deterministisch in
// Materialien zerlegen, gestaffelt nach Raritaet. Schliesst den Entsorgungs-Kreis fuer
// die unverkaeuflichen Loot-Instanzen UND speist die (teils toten) Crafting-Materialien.
// Rein/funktional ueber Inventar; nur Ausruestung im Inventar (getragene Teile liegen
// nicht im Inventar → automatisch geschuetzt).
const SALVAGE_YIELD: Readonly<Record<ItemRarity, readonly { itemId: string; quantity: number }[]>> = {
  gewoehnlich: [],
  selten: [{ itemId: 'magic-ore', quantity: 1 }],
  episch: [{ itemId: 'magisteel', quantity: 1 }],
  legendaer: [{ itemId: 'magisteel', quantity: 1 }, { itemId: 'spirit-ember', quantity: 1 }],
  'legendaer-set': [{ itemId: 'magisteel', quantity: 1 }, { itemId: 'spirit-ember', quantity: 1 }]
};

export interface SalvageResult {
  readonly ok: boolean;
  readonly inventory: readonly InventoryStack[];
  readonly materials: readonly { readonly itemId: string; readonly quantity: number }[];
  readonly message: string;
}

function resolveGear(itemId: string): ItemDefinition | undefined {
  return isEquipmentInstanceId(itemId) ? resolveInstanceItem(itemId) : itemById.get(itemId);
}

// Vorschau des Material-Ertrags (fuer die UI, ohne Zustandsaenderung).
export function salvageYield(itemId: string): readonly { readonly itemId: string; readonly quantity: number }[] {
  const item = resolveGear(itemId);
  return item?.equipmentSlot ? SALVAGE_YIELD[rarityOf(item)] : [];
}

// Lesbare Ertrags-Vorschau (Namen), damit die UI keine Item-Aufloesung braucht.
export function salvageYieldLabel(itemId: string): string {
  const materials = salvageYield(itemId);
  return materials.length > 0
    ? materials.map((mat) => `${itemName(mat.itemId)} ×${mat.quantity}`).join(', ')
    : 'nichts Verwertbares';
}

export function salvageEquipment(context: CraftContext, itemId: string): SalvageResult {
  const item = resolveGear(itemId);
  if (!item?.equipmentSlot) {
    return { ok: false, inventory: context.inventory, materials: [], message: 'Nur Ausruestung laesst sich zerlegen.' };
  }
  if (getItemCount(context.inventory, itemId) <= 0) {
    return { ok: false, inventory: context.inventory, materials: [], message: 'Item ist nicht im Inventar.' };
  }
  const materials = SALVAGE_YIELD[rarityOf(item)];
  let inventory = removeInventoryItem(context.inventory, itemId, 1);
  for (const mat of materials) {
    inventory = addInventoryItem(inventory, mat.itemId, mat.quantity);
  }
  const gain = materials.length > 0
    ? materials.map((mat) => `${itemName(mat.itemId)} ×${mat.quantity}`).join(', ')
    : 'nichts Verwertbares';
  return { ok: true, inventory, materials, message: `${item.name} zerlegt → ${gain}.` };
}

// Menü-/Schmiede-Ansicht: alle aktuell freigeschalteten Rezepte mit
// Material-/Gold-Status. Die Scene rendert daraus nur noch Text + Buttons.
export function buildForgeView(context: CraftContext): ForgeRecipeView[] {
  return CRAFTING_RECIPES.filter((recipe) =>
    isRecipeUnlocked(recipe, context.flags, context.craftedRecipeIds)
  ).map((recipe) => {
    const inputs = recipe.inputs.map<RecipeInputView>((input) => {
      const owned = getItemCount(context.inventory, input.itemId);
      return {
        itemId: input.itemId,
        name: itemName(input.itemId),
        required: input.quantity,
        owned,
        enough: owned >= input.quantity
      };
    });
    const check = canCraftRecipe(recipe, context);
    return {
      recipe,
      outputName: itemName(recipe.outputItemId),
      inputs,
      goldCost: recipe.goldCost,
      affordable: context.gold >= recipe.goldCost,
      craftable: check.ok,
      reason: check.reason
    };
  });
}
