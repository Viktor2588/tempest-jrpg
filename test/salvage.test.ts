import { describe, expect, it } from 'vitest';
import { salvageEquipment, salvageYield, salvageYieldLabel, type CraftContext } from '../src/systems/crafting';
import { getItemCount } from '../src/systems/inventory';
import { encodeInstanceId } from '../src/systems/lootAffix';

function ctx(inventory: { itemId: string; quantity: number }[]): CraftContext {
  return { inventory, gold: 0, flags: {}, craftedRecipeIds: [] };
}

describe('Phase 159 — Loot zerlegen (Salvage)', () => {
  it('staffelt den Material-Ertrag nach Raritaet', () => {
    // orc-cleaver selten → magic-ore; warded-brigandine episch → magisteel;
    // ward-talisman legendaer → magisteel + spirit-ember.
    expect(salvageYield('orc-cleaver')).toEqual([{ itemId: 'magic-ore', quantity: 1 }]);
    expect(salvageYield('warded-brigandine')).toEqual([{ itemId: 'magisteel', quantity: 1 }]);
    expect(salvageYield('ward-talisman')).toEqual([
      { itemId: 'magisteel', quantity: 1 },
      { itemId: 'spirit-ember', quantity: 1 }
    ]);
    // gewoehnliche Startausruestung gibt nichts.
    expect(salvageYield('tempest-training-sword')).toEqual([]);
  });

  it('zerlegt ein Item: entfernt es und bankt die Materialien', () => {
    const before = ctx([{ itemId: 'orc-cleaver', quantity: 1 }, { itemId: 'magic-ore', quantity: 2 }]);
    const result = salvageEquipment(before, 'orc-cleaver');
    expect(result.ok).toBe(true);
    expect(getItemCount(result.inventory, 'orc-cleaver')).toBe(0);
    expect(getItemCount(result.inventory, 'magic-ore')).toBe(3); // 2 + 1
    expect(result.materials).toEqual([{ itemId: 'magic-ore', quantity: 1 }]);
  });

  it('zerlegt eine Loot-Instanz nach Basis-Raritaet', () => {
    const id = encodeInstanceId({ baseItemId: 'ward-talisman', affixIds: ['keen', 'vital'] });
    const result = salvageEquipment(ctx([{ itemId: id, quantity: 1 }]), id);
    expect(result.ok).toBe(true);
    expect(getItemCount(result.inventory, id)).toBe(0);
    expect(getItemCount(result.inventory, 'magisteel')).toBe(1);
    expect(getItemCount(result.inventory, 'spirit-ember')).toBe(1);
  });

  it('lehnt Nicht-Ausruestung und fehlende Items ab', () => {
    const noGear = salvageEquipment(ctx([{ itemId: 'healing-herb', quantity: 1 }]), 'healing-herb');
    expect(noGear.ok).toBe(false);
    expect(noGear.inventory).toHaveLength(1); // unveraendert
    const missing = salvageEquipment(ctx([]), 'orc-cleaver');
    expect(missing.ok).toBe(false);
  });

  it('liefert eine lesbare Ertrags-Vorschau', () => {
    expect(salvageYieldLabel('ward-talisman')).toContain('Magisteel');
    expect(salvageYieldLabel('tempest-training-sword')).toBe('nichts Verwertbares');
  });
});
