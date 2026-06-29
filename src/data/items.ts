import type { ItemDefinition } from './types';

export const ITEMS = [
  {
    id: 'healing-herb',
    name: 'Heilkraut',
    description: 'Ein einfaches Kraut aus Tempest. Stellt 40 LP wieder her.',
    category: 'consumable',
    price: 20,
    stackable: true,
    startingQuantity: 5,
    effect: { kind: 'heal-hp', amount: 40 }
  },
  {
    id: 'mana-drop',
    name: 'Manatropfen',
    description: 'Kristallisierte Magie. Stellt 15 MP wieder her.',
    category: 'consumable',
    price: 35,
    stackable: true,
    startingQuantity: 2,
    effect: { kind: 'restore-mp', amount: 15 }
  },
  {
    id: 'tempest-training-sword',
    name: 'Tempest-Übungsschwert',
    description: 'Ein robustes Holzschwert für frühe Gefechte.',
    category: 'weapon',
    price: 80,
    stackable: false,
    equipmentSlot: 'weapon',
    equipmentSetId: 'tempest-initiate',
    enchantment: {
      maxLevel: 3,
      goldCostPerLevel: 60,
      statBonusPerLevel: { attack: 1 }
    },
    statBonus: { attack: 4 }
  },
  {
    id: 'traveler-cloak',
    name: 'Reisemantel',
    description: 'Leichte Schutzkleidung für Reisen zwischen Stadt und Wald.',
    category: 'armor',
    price: 65,
    stackable: false,
    equipmentSlot: 'armor',
    equipmentSetId: 'tempest-initiate',
    enchantment: {
      maxLevel: 3,
      goldCostPerLevel: 55,
      statBonusPerLevel: { defense: 1, spirit: 1 }
    },
    statBonus: { defense: 3, spirit: 1 }
  },
  {
    id: 'tempest-charm',
    name: 'Tempest-Talisman',
    description: 'Ein einfacher Glücksbringer, der den Geist stärkt.',
    category: 'accessory',
    price: 120,
    stackable: false,
    equipmentSlot: 'accessory',
    equipmentSetId: 'tempest-initiate',
    enchantment: {
      maxLevel: 3,
      goldCostPerLevel: 70,
      statBonusPerLevel: { maxMp: 2, spirit: 1 }
    },
    statBonus: { maxMp: 5, spirit: 2 }
  },
  {
    id: 'guild-letter',
    name: 'Gildenbrief',
    description: 'Ein versiegelter Brief für den ersten Quest-Knoten.',
    category: 'key',
    price: 0,
    stackable: false,
    startingQuantity: 1
  },
  {
    id: 'sealed-cave-crystal',
    name: 'Höhlenkristall',
    description: 'Ein stumm schwingender Kristall aus der versiegelten Höhle. Er markiert Rimurus ersten Schwur.',
    category: 'key',
    price: 0,
    stackable: false
  },
  {
    id: 'wolf-fang-token',
    name: 'Wolfsfang-Abzeichen',
    description: 'Ein Zeichen, dass das Direwolf-Rudel die junge Siedlung nicht länger als Beute betrachtet.',
    category: 'key',
    price: 0,
    stackable: false
  },
  {
    id: 'ancestor-seal-fragment',
    name: 'Ahnensiegel-Fragment',
    description: 'Ein singendes Bruchstück der Bindung der Ahnen. Shuna beschreibt es als gefrorenen Donner.',
    category: 'key',
    price: 0,
    stackable: false
  },
  // — Band 1 & 2: Verbrauch & Material —
  { id: 'hipokte-herb', name: 'Hipokte-Kraut', description: 'Heilkraut aus der versiegelten Höhle; Grundlage für stärkere Tränke.', category: 'consumable', price: 30, stackable: true, effect: { kind: 'heal-hp', amount: 80 } },
  { id: 'full-potion', name: 'Vollheiltrank', description: 'Tempests Spitzenheilung aus destilliertem Hipokte-Kraut — stellt alle LP wieder her.', category: 'consumable', price: 220, stackable: true, effect: { kind: 'heal-hp', amount: 999 } },
  { id: 'magic-ore', name: 'Magisches Erz', description: 'Magicule-getränktes Roherz; Rohstoff für Magisteel und Magiewerkzeuge.', category: 'key', price: 45, stackable: true },
  { id: 'magisteel', name: 'Magisteel', description: 'Aus magischem Erz und Magicules veredelt; überlegener Schmiedewerkstoff.', category: 'key', price: 140, stackable: true },
  { id: 'geld-core', name: 'Geld-Kern', description: 'Verdichteter Kern des Orc-Disasters — Beweis und Evolutionsmaterial.', category: 'key', price: 0, stackable: false },
  { id: 'spirit-ember', name: 'Geistglut', description: 'Ifrits gebändigte Flamme; entzündet eine Feuer-Affinität.', category: 'key', price: 0, stackable: false },
  { id: 'orc-tusk', name: 'Ork-Hauer', description: 'Trophäe der Ork-Horde; bei Händlern begehrt.', category: 'key', price: 25, stackable: true },
  // — Kijin-Ausrüstung (Set: kijin-regalia) —
  { id: 'kurobe-katana', name: 'Kurobes Katana', description: 'Von Meister Kurobe aus Magisteel geschmiedet — scharf wie ein Schwur.', category: 'weapon', price: 0, stackable: false, equipmentSlot: 'weapon', equipmentSetId: 'kijin-regalia', enchantment: { maxLevel: 5, goldCostPerLevel: 120, statBonusPerLevel: { attack: 2 } }, statBonus: { attack: 14, agility: 3 } },
  { id: 'kijin-haori', name: 'Kijin-Haori', description: 'Von Shuna gewebte Kampfrobe der Kijin — leicht und widerstandsfähig.', category: 'armor', price: 260, stackable: false, equipmentSlot: 'armor', equipmentSetId: 'kijin-regalia', statBonus: { defense: 8, spirit: 4, magic: 2 } },
  { id: 'oni-mask', name: 'Oni-Maske', description: 'Eine Maske im Erbe Shizus — schärft den Geist im Kampf.', category: 'accessory', price: 300, stackable: false, equipmentSlot: 'accessory', equipmentSetId: 'kijin-regalia', statBonus: { magic: 4, spirit: 4, maxMp: 8 } },
  // — Dwargon-Ausrüstung (Set: dwargon-forged) —
  { id: 'magisteel-blade', name: 'Magisteel-Klinge', description: 'Eine in Dwargon aus Magisteel geschmiedete Klinge.', category: 'weapon', price: 360, stackable: false, equipmentSlot: 'weapon', equipmentSetId: 'dwargon-forged', enchantment: { maxLevel: 5, goldCostPerLevel: 100, statBonusPerLevel: { attack: 2 } }, statBonus: { attack: 12 } },
  { id: 'dwarf-plate', name: 'Zwergenplatte', description: 'Schwere, perfekt gefügte Magisteel-Rüstung.', category: 'armor', price: 320, stackable: false, equipmentSlot: 'armor', equipmentSetId: 'dwargon-forged', statBonus: { defense: 12, maxHp: 10 } },
  { id: 'forge-band', name: 'Schmiedereif', description: 'Ein zwergischer Ring, der Hieb und Deckung schärft.', category: 'accessory', price: 280, stackable: false, equipmentSlot: 'accessory', equipmentSetId: 'dwargon-forged', statBonus: { attack: 3, defense: 3 } },
  // — Ork-Ausrüstung —
  { id: 'orc-cleaver', name: 'Ork-Schlachtbeil', description: 'Grobes, schweres Beil — viel Wucht, wenig Finesse.', category: 'weapon', price: 150, stackable: false, equipmentSlot: 'weapon', enchantment: { maxLevel: 3, goldCostPerLevel: 70, statBonusPerLevel: { attack: 2 } }, statBonus: { attack: 11 } },
  { id: 'famine-charm', name: 'Hungeramulett', description: 'Aus dem Geld-Kern gefertigt; nährt Zähigkeit aus dem Hunger.', category: 'accessory', price: 0, stackable: false, equipmentSlot: 'accessory', statBonus: { maxHp: 16, attack: 2 } }
] as const satisfies readonly ItemDefinition[];
