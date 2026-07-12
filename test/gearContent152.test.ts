import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { validateGameData } from './dataValidation';
import { ITEMS, CRAFTING_RECIPES } from '../src/data';
import { EQUIPMENT_SETS } from '../src/data/progression';
import { SHOPS } from '../src/data/world';
import { legendaryHasSignaturePerk, rarityOf } from '../src/systems/itemRarity';
import type { ItemDefinition } from '../src/data';

const ALL_ITEMS = ITEMS as readonly ItemDefinition[];
const itemById = new Map(ALL_ITEMS.map((i) => [i.id, i]));

// Phase 152 — Mehr Gear & Sets (Content auf dem Raritaets-System 149/150).
const NEW_SET_PIECES = ['galewind-edge', 'stormweave-garb', 'zephyr-band'] as const;
const NEW_LEGENDARY_UNIQUES = ['stormfang-blade', 'veldora-scale-ward'] as const;
const NEW_MID_RARITY = ['spirit-oak-staff', 'warded-brigandine', 'swiftwind-boots', 'resonant-core'] as const;
const ALL_NEW = [...NEW_SET_PIECES, ...NEW_LEGENDARY_UNIQUES, ...NEW_MID_RARITY];

describe('Phase 152 — mehr Gear & Sets', () => {
  it('bricht die Spieldaten-Integritaet nicht (Item-/Set-/Shop-Referenzen gueltig)', () => {
    expect(validateGameData(GAME_DATA)).toEqual([]);
  });

  it('definiert jedes neue Teil als ausruestbares Gear mit gesetzter Raritaet', () => {
    for (const id of ALL_NEW) {
      const item = itemById.get(id);
      expect(item, id).toBeDefined();
      expect(item!.equipmentSlot, id).toBeTruthy();
      expect(rarityOf(item!), id).not.toBe('gewoehnlich');
      expect(item!.stackable).toBe(false);
    }
  });

  it('haelt die Legendaer-einzigartig-Regel (genau ein Signatur-Perk) ein', () => {
    for (const id of NEW_LEGENDARY_UNIQUES) {
      const item = itemById.get(id)!;
      expect(rarityOf(item), id).toBe('legendaer');
      expect(item.perks?.length ?? 0, id).toBe(1);
      expect(legendaryHasSignaturePerk(item), id).toBe(true);
    }
  });

  it('registriert das neue Sturmgeist-Set mit drei zugeordneten Teilen', () => {
    const set = (EQUIPMENT_SETS as readonly { id: string; itemIds: readonly string[]; tiers: readonly { pieces: number }[] }[])
      .find((s) => s.id === 'stormspirit-regalia');
    expect(set).toBeDefined();
    expect([...set!.itemIds].sort()).toEqual([...NEW_SET_PIECES].sort());
    for (const pieceId of NEW_SET_PIECES) {
      const item = itemById.get(pieceId)!;
      expect(rarityOf(item), pieceId).toBe('legendaer-set');
      expect(item.equipmentSetId, pieceId).toBe('stormspirit-regalia');
    }
    // Stufen streng steigend und erreichbar (<= Teilezahl).
    expect(set!.tiers.map((t) => t.pieces)).toEqual([2, 3]);
  });

  it('macht jedes neue Teil erspielbar (Schmiede-Rezept oder Shop)', () => {
    const craftedOutputs = new Set<string>(CRAFTING_RECIPES.map((r) => r.outputItemId));
    const shopItemIds = new Set<string>(SHOPS.flatMap((shop) => shop.itemIds as readonly string[]));
    for (const id of ALL_NEW) {
      expect(craftedOutputs.has(id) || shopItemIds.has(id), `${id} unobtainable`).toBe(true);
    }
    // Set-Teile + Legendaer-einzigartig kommen aus der Schmiede.
    for (const id of [...NEW_SET_PIECES, ...NEW_LEGENDARY_UNIQUES]) {
      expect(craftedOutputs.has(id), `${id} not craftable`).toBe(true);
    }
    // Mittlere Raritaeten sind im Shop kaufbar.
    for (const id of NEW_MID_RARITY) {
      expect(shopItemIds.has(id), `${id} not in shop`).toBe(true);
    }
  });
});
