import { describe, expect, it } from 'vitest';
import {
  AFFIXES,
  affixCountFor,
  affixPoolFor,
  decodeInstanceId,
  encodeInstanceId,
  isEquipmentInstanceId,
  resolveInstanceDefinition,
  rollEquipmentInstance,
  rollLabyrinthLootItemId
} from '../src/systems/lootAffix';
import { calculateEquipmentBonus, equipItem, getSortedInventory } from '../src/systems/menu';
import { equipmentPerksForMember } from '../src/systems/progression';
import { createPartyMember } from '../src/systems/party';
import { HEROES } from '../src/data';
import type { ItemRarity } from '../src/data/types';

const RARITIES: readonly ItemRarity[] = ['gewoehnlich', 'selten', 'episch', 'legendaer', 'legendaer-set'];

describe('Phase 151 — Loot mit festen Affix-Pools', () => {
  it('haelt feste Affix-Anzahlen pro Raritaet, deren Pool die Anzahl deckt', () => {
    expect(affixCountFor('gewoehnlich')).toBe(0);
    expect(affixCountFor('selten')).toBe(1);
    expect(affixCountFor('episch')).toBe(2);
    expect(affixCountFor('legendaer')).toBe(2);
    for (const rarity of RARITIES) {
      expect(affixPoolFor(rarity).length).toBeGreaterThanOrEqual(affixCountFor(rarity));
    }
    // Der Legendaer-Pool enthaelt Perk-Bausteine (Signatur-Perk-Quelle).
    expect(affixPoolFor('legendaer').some((affix) => affix.perk)).toBe(true);
  });

  it('waehlt Affixe deterministisch aus dem Seed und ohne Wiederholung', () => {
    // ork-cleaver ist 'selten' → genau 1 Affix; ward-talisman 'legendaer' → 2.
    const a = rollEquipmentInstance(4242, 'orc-cleaver');
    const b = rollEquipmentInstance(4242, 'orc-cleaver');
    expect(a).toEqual(b); // deterministisch
    expect(a.affixIds.length).toBe(1);

    const epic = rollEquipmentInstance(99, 'ember-magicule-core'); // 'episch' → 2
    expect(epic.affixIds.length).toBe(2);
    expect(new Set(epic.affixIds).size).toBe(epic.affixIds.length); // keine Wiederholung
    for (const affixId of epic.affixIds) {
      expect(AFFIXES.some((affix) => affix.id === affixId)).toBe(true);
    }

    const other = rollEquipmentInstance(100, 'ember-magicule-core');
    expect(other.affixIds).not.toEqual(epic.affixIds); // anderer Seed → andere Wahl (i.d.R.)
  });

  it('kodiert und dekodiert Instanz-Ids verlustfrei', () => {
    const instance = { baseItemId: 'orc-cleaver', affixIds: ['keen', 'vital'] };
    const id = encodeInstanceId(instance);
    expect(isEquipmentInstanceId(id)).toBe(true);
    expect(decodeInstanceId(id)).toEqual(instance);
    // Statische Ids sind keine Instanzen.
    expect(isEquipmentInstanceId('orc-cleaver')).toBe(false);
    expect(decodeInstanceId('orc-cleaver')).toBeNull();
    // Instanz ohne Affixe (gewoehnlich).
    const bare = { baseItemId: 'traveler-cloak', affixIds: [] };
    expect(decodeInstanceId(encodeInstanceId(bare))).toEqual(bare);
  });

  it('synthetisiert die Instanz-Definition aus Basis + Affixen (Boni & Perks)', () => {
    // ward-talisman: statBonus {spirit:4,maxHp:8}, perk status-resist 35.
    const instance = { baseItemId: 'ward-talisman', affixIds: ['vital', 'warding'] };
    const def = resolveInstanceDefinition(instance)!;
    expect(def).toBeDefined();
    expect(def.equipmentSlot).toBe('accessory');
    expect(def.stackable).toBe(false);
    // maxHp = Basis 8 + Affix 'vital' 10 = 18; spirit bleibt 4.
    expect(def.statBonus?.maxHp).toBe(18);
    expect(def.statBonus?.spirit).toBe(4);
    // Perks: Basis status-resist(35) + Affix 'warding' status-resist(15) = 2 Perks.
    expect(def.perks?.length).toBe(2);
    // Instanzen gehoeren keinem Set an und tragen keine eigene Verzauberung.
    expect(def.equipmentSetId).toBeUndefined();
    expect(def.enchantment).toBeUndefined();
  });

  it('ruestet eine Loot-Instanz aus und wendet Boni + Perks an (Instanz-Ausruesten)', () => {
    const rimuru = HEROES.find((hero) => hero.id === 'rimuru')!;
    const base = createPartyMember(rimuru);
    // Startausruestung leeren, damit der Bonus isoliert die Instanz misst.
    const member = { ...base, equipment: { weapon: null, armor: null, accessory: null, core: null } };
    const instance = { baseItemId: 'ward-talisman', affixIds: ['keen', 'warding'] };
    const instanceId = encodeInstanceId(instance);

    // Instanz liegt als (nicht-stapelbares) Inventar-Item vor.
    const state = {
      party: [member],
      inventory: [{ itemId: instanceId, quantity: 1 }],
      gold: 0
    };
    // Inventar zeigt die Instanz als ausruestbares Accessoire.
    const invView = getSortedInventory(state.inventory);
    expect(invView).toHaveLength(1);
    expect(invView[0]!.equipSlot).toBe('accessory');

    const result = equipItem(state, 'rimuru', instanceId);
    expect(result.ok).toBe(true);
    const equipped = result.state.party[0]!;
    expect(equipped.equipment.accessory).toBe(instanceId);

    // Boni: ward-talisman spirit+4 + Affix 'keen' attack+4; maxHp Basis 8.
    const bonus = calculateEquipmentBonus(equipped);
    expect(bonus.attack).toBe(4);
    expect(bonus.spirit).toBe(4);
    expect(bonus.maxHp).toBe(8);

    // Perks: Basis status-resist + Affix 'warding' status-resist = 2 Perks.
    const perks = equipmentPerksForMember(equipped);
    expect(perks.filter((perk) => perk.kind === 'status-resist').length).toBe(2);
  });

  it('rollt einen deterministischen Labyrinth-Drop aus dem Run-Seed', () => {
    const table = ['orc-cleaver', 'ward-talisman', 'ember-magicule-core'];
    const dropA = rollLabyrinthLootItemId(777, table);
    const dropB = rollLabyrinthLootItemId(777, table);
    expect(dropA).toBe(dropB);
    expect(dropA).toBeTruthy();
    expect(isEquipmentInstanceId(dropA!)).toBe(true);
    const decoded = decodeInstanceId(dropA!)!;
    expect(table).toContain(decoded.baseItemId);
    // Die synthetisierte Definition ist gueltiges, ausruestbares Gear.
    expect(resolveInstanceDefinition(decoded)!.equipmentSlot).toBeTruthy();
    // Leerer Loot-Tisch → kein Drop.
    expect(rollLabyrinthLootItemId(1, [])).toBeNull();
  });
});
