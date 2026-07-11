import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/data/items';
import type { ItemDefinition, ItemRarity } from '../src/data/types';
import {
  DEFAULT_ITEM_RARITY,
  ITEM_RARITIES,
  isLegendaryUnique,
  legendaryHasSignaturePerk,
  rarityColor,
  rarityEnchantCap,
  rarityLabel,
  rarityMeta,
  rarityOf,
  rarityOrder,
  rarityStatMultiplier
} from '../src/systems/itemRarity';

const allItems = ITEMS as unknown as readonly ItemDefinition[];
const item = (id: string): ItemDefinition => allItems.find((entry) => entry.id === id)!;
const equipment = allItems.filter((entry) => entry.equipmentSlot);

describe('Item-Raritaet (Phase 149)', () => {
  it('kennt die fünf Raritaeten in aufsteigender Leiter mit eindeutigen Farben', () => {
    expect(ITEM_RARITIES.map((meta) => meta.id)).toEqual([
      'gewoehnlich', 'selten', 'episch', 'legendaer', 'legendaer-set'
    ]);
    // Order strikt aufsteigend über die Kern-Leiter (Set liegt am oberen Ende).
    const coreOrder = ['gewoehnlich', 'selten', 'episch', 'legendaer'] as const;
    for (let i = 1; i < coreOrder.length; i += 1) {
      expect(rarityOrder(coreOrder[i]!)).toBeGreaterThan(rarityOrder(coreOrder[i - 1]!));
    }
    const colors = new Set(ITEM_RARITIES.map((meta) => meta.color));
    expect(colors.size).toBe(ITEM_RARITIES.length);
  });

  it('Stat-Multiplikator und Enchant-Cap steigen mit der Kern-Leiter', () => {
    expect(rarityStatMultiplier('gewoehnlich')).toBe(1);
    expect(rarityStatMultiplier('episch')).toBeGreaterThan(rarityStatMultiplier('selten'));
    expect(rarityStatMultiplier('legendaer')).toBeGreaterThan(rarityStatMultiplier('episch'));
    expect(rarityEnchantCap('legendaer')).toBeGreaterThan(rarityEnchantCap('gewoehnlich'));
    expect(rarityMeta('legendaer').label).toBe(rarityLabel('legendaer'));
    expect(rarityColor('legendaer-set')).toBe(rarityMeta('legendaer-set').color);
  });

  it('rarityOf fällt ohne Feld auf gewoehnlich zurück', () => {
    expect(rarityOf({ rarity: undefined })).toBe(DEFAULT_ITEM_RARITY);
    expect(rarityOf(item('healing-herb'))).toBe('gewoehnlich');
    expect(rarityOf(item('ward-talisman'))).toBe('legendaer');
  });

  it('isLegendaryUnique erkennt nur legendaer (nicht legendaer-set)', () => {
    expect(isLegendaryUnique('legendaer')).toBe(true);
    expect(isLegendaryUnique('legendaer-set')).toBe(false);
    expect(isLegendaryUnique('episch')).toBe(false);
  });

  it('alle Ausruestungsteile sind einer Raritaet zugeordnet', () => {
    expect(equipment.length).toBeGreaterThanOrEqual(14);
    for (const entry of equipment) {
      expect(entry.rarity, `${entry.id} ohne rarity`).toBeDefined();
      expect(ITEM_RARITIES.map((meta) => meta.id)).toContain(entry.rarity as ItemRarity);
    }
  });

  it('legendaer = einzigartig mit genau einem Signatur-Perk', () => {
    for (const entry of allItems) {
      expect(legendaryHasSignaturePerk(entry), `${entry.id} verletzt die Signatur-Perk-Regel`).toBe(true);
    }
    // ward-talisman ist das legendaere Einzelstück und trägt genau einen Perk.
    expect(rarityOf(item('ward-talisman'))).toBe('legendaer');
    expect(item('ward-talisman').perks).toHaveLength(1);
  });

  it('jedes legendaer-set-Teil gehört zu einem EQUIPMENT_SETS-Set', () => {
    const setItems = equipment.filter((entry) => rarityOf(entry) === 'legendaer-set');
    expect(setItems.length).toBeGreaterThan(0);
    for (const entry of setItems) {
      expect(entry.equipmentSetId, `${entry.id} ist legendaer-set ohne equipmentSetId`).toBeDefined();
    }
  });
});
