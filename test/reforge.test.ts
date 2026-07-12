import { describe, expect, it } from 'vitest';
import { reforgeCost, reforgeEquipment, type CraftContext } from '../src/systems/crafting';
import {
  decodeInstanceId,
  encodeInstanceId,
  isEquipmentInstanceId,
  reforgeInstance
} from '../src/systems/lootAffix';
import { getItemCount } from '../src/systems/inventory';

function ctx(inventory: { itemId: string; quantity: number }[], gold = 500): CraftContext {
  return { inventory, gold, flags: {}, craftedRecipeIds: [] };
}

// ward-talisman ist legendaer → 2 Affixe.
const legendaryId = encodeInstanceId({ baseItemId: 'ward-talisman', affixIds: ['keen', 'vital'] });

describe('Phase 160 — Affix-Umschmieden (Reforge)', () => {
  it('rollt eine Instanz mit gleicher Basis/Raritaets-Regel neu (deterministisch je Seed)', () => {
    const a = reforgeInstance(1234, legendaryId)!;
    expect(reforgeInstance(1234, legendaryId)).toBe(a); // gleicher Seed → gleich
    expect(isEquipmentInstanceId(a)).toBe(true);
    const decoded = decodeInstanceId(a)!;
    // Basis bleibt, Anzahl folgt der Raritaets-Regel (legendaer → 2 Affixe).
    expect(decoded.baseItemId).toBe('ward-talisman');
    expect(decoded.affixIds.length).toBe(2);
    // Statische Items sind nicht umschmiedbar.
    expect(reforgeInstance(1, 'ward-talisman')).toBeNull();
  });

  it('findet mit verschiedenen Seeds andere Affix-Kombinationen', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 40; seed += 1) {
      seen.add(reforgeInstance(seed, legendaryId)!);
    }
    // Der legendaere Pool hat mehr als eine moegliche 2er-Kombination.
    expect(seen.size).toBeGreaterThan(1);
  });

  it('berechnet Materialkosten nur fuer echte Instanzen', () => {
    const cost = reforgeCost(legendaryId)!;
    expect(cost.materialId).toBe('magisteel');
    expect(cost.materialQty).toBe(1);
    expect(cost.gold).toBeGreaterThan(0);
    // Statisches Gear / Nicht-Gear → keine Reforge-Kosten.
    expect(reforgeCost('ward-talisman')).toBeNull();
    expect(reforgeCost('healing-herb')).toBeNull();
  });

  it('schmiedet um: verbraucht Material + Gold, ersetzt die Instanz', () => {
    const before = ctx([{ itemId: legendaryId, quantity: 1 }, { itemId: 'magisteel', quantity: 2 }], 500);
    const result = reforgeEquipment(before, 7, legendaryId);
    expect(result.ok).toBe(true);
    expect(result.newItemId).not.toBeNull();
    // Alte Instanz weg, neue da (sofern die Neuwahl abweicht — sonst dieselbe Id, aber vorhanden).
    expect(getItemCount(result.inventory, result.newItemId!)).toBe(1);
    expect(getItemCount(result.inventory, 'magisteel')).toBe(1); // 2 - 1
    expect(result.gold).toBe(500 - reforgeCost(legendaryId)!.gold);
  });

  it('lehnt ab, wenn Material oder Gold fehlt, und laesst statische Items unberuehrt', () => {
    const noMat = reforgeEquipment(ctx([{ itemId: legendaryId, quantity: 1 }], 500), 3, legendaryId);
    expect(noMat.ok).toBe(false);
    const noGold = reforgeEquipment(ctx([{ itemId: legendaryId, quantity: 1 }, { itemId: 'magisteel', quantity: 1 }], 0), 3, legendaryId);
    expect(noGold.ok).toBe(false);
    const staticItem = reforgeEquipment(ctx([{ itemId: 'ward-talisman', quantity: 1 }, { itemId: 'magisteel', quantity: 1 }]), 3, 'ward-talisman');
    expect(staticItem.ok).toBe(false);
  });
});
