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
  }
] as const satisfies readonly ItemDefinition[];
