import type { EnemyDefinition } from './types';

export const ENEMIES = [
  {
    id: 'forest-slime',
    name: 'Waldschleim',
    level: 1,
    element: 'water',
    stats: {
      maxHp: 38,
      maxMp: 8,
      attack: 8,
      defense: 6,
      magic: 6,
      spirit: 6,
      agility: 7
    },
    skillIds: ['slime-strike'],
    weaknesses: ['wind'],
    resistances: ['water'],
    experienceReward: 12,
    goldReward: 8,
    drops: [{ itemId: 'healing-herb', chance: 0.35 }]
  },
  {
    id: 'direwolf-pup',
    name: 'Jung-Direwolf',
    level: 2,
    element: 'neutral',
    stats: {
      maxHp: 54,
      maxMp: 6,
      attack: 13,
      defense: 8,
      magic: 5,
      spirit: 7,
      agility: 15
    },
    skillIds: ['goblin-feint'],
    weaknesses: ['earth'],
    resistances: [],
    experienceReward: 20,
    goldReward: 14,
    drops: [{ itemId: 'mana-drop', chance: 0.15 }]
  },
  {
    id: 'direwolf-alpha',
    name: 'Direwolf-Anführer',
    level: 3,
    element: 'neutral',
    stats: {
      maxHp: 88,
      maxMp: 12,
      attack: 19,
      defense: 12,
      magic: 7,
      spirit: 10,
      agility: 18
    },
    skillIds: ['direwolf-rush', 'quick-step'],
    weaknesses: ['earth'],
    resistances: [],
    experienceReward: 36,
    goldReward: 24,
    drops: [{ itemId: 'mana-drop', chance: 0.25 }]
  },
  {
    id: 'spore-moth',
    name: 'Sporenmotte',
    level: 2,
    element: 'shadow',
    stats: {
      maxHp: 46,
      maxMp: 14,
      attack: 9,
      defense: 7,
      magic: 12,
      spirit: 9,
      agility: 13
    },
    skillIds: ['venom-spit'],
    weaknesses: ['fire', 'wind'],
    resistances: ['shadow'],
    experienceReward: 22,
    goldReward: 16,
    drops: [{ itemId: 'healing-herb', chance: 0.25 }]
  },
  {
    id: 'orc-scout',
    name: 'Ork-Späher',
    level: 4,
    element: 'earth',
    stats: {
      maxHp: 86,
      maxMp: 10,
      attack: 20,
      defense: 15,
      magic: 8,
      spirit: 11,
      agility: 16
    },
    skillIds: ['goblin-feint'],
    weaknesses: ['wind', 'fire'],
    resistances: ['earth'],
    experienceReward: 42,
    goldReward: 30,
    drops: [{ itemId: 'tempest-training-sword', chance: 0.08 }]
  },
  {
    id: 'lizardman-acolyte',
    name: 'Echsen-Akolyth',
    level: 5,
    element: 'water',
    stats: {
      maxHp: 78,
      maxMp: 24,
      attack: 15,
      defense: 14,
      magic: 19,
      spirit: 18,
      agility: 13
    },
    skillIds: ['water-blade', 'soothing-prayer'],
    weaknesses: ['earth', 'shadow'],
    resistances: ['water', 'holy'],
    experienceReward: 55,
    goldReward: 42,
    drops: [{ itemId: 'mana-drop', chance: 0.22 }]
  },
  {
    // Canon-Hauptpfad: erscheint sichtbar als „Namenloses Echo"; interne ID bleibt stabil.
    id: 'mordrahn-echo',
    name: 'Namenloses Echo',
    level: 6,
    element: 'shadow',
    stats: {
      maxHp: 118,
      maxMp: 32,
      attack: 18,
      defense: 16,
      magic: 23,
      spirit: 19,
      agility: 14
    },
    skillIds: ['spirit-bind', 'venom-spit'],
    weaknesses: ['holy', 'wind'],
    resistances: ['shadow'],
    experienceReward: 90,
    goldReward: 75,
    drops: [{ itemId: 'mana-drop', chance: 0.35 }]
  },
  {
    id: 'human-lancer',
    name: 'Menschen-Lanzenträger',
    level: 6,
    element: 'neutral',
    stats: {
      maxHp: 96,
      maxMp: 8,
      attack: 22,
      defense: 17,
      magic: 7,
      spirit: 12,
      agility: 15
    },
    skillIds: ['goblin-feint', 'battle-cry'],
    weaknesses: ['shadow', 'fire'],
    resistances: [],
    experienceReward: 60,
    goldReward: 48,
    drops: [{ itemId: 'healing-herb', chance: 0.3 }]
  },
  {
    id: 'mordrahn-vanguard',
    name: 'Mordrahns Vorhut',
    level: 8,
    element: 'shadow',
    stats: {
      maxHp: 158,
      maxMp: 40,
      attack: 24,
      defense: 19,
      magic: 26,
      spirit: 21,
      agility: 17
    },
    skillIds: ['spirit-bind', 'venom-spit', 'water-blade'],
    weaknesses: ['holy', 'wind'],
    resistances: ['shadow'],
    experienceReward: 140,
    goldReward: 110,
    drops: [{ itemId: 'mana-drop', chance: 0.4 }]
  },
  {
    id: 'mordrahn',
    name: 'Mordrahn, Hüter der Bindung',
    level: 10,
    element: 'shadow',
    stats: {
      maxHp: 224,
      maxMp: 52,
      attack: 28,
      defense: 22,
      magic: 32,
      spirit: 24,
      agility: 18
    },
    skillIds: ['spirit-bind', 'venom-spit', 'water-blade', 'storm-gust'],
    weaknesses: ['holy', 'wind'],
    resistances: ['shadow'],
    experienceReward: 220,
    goldReward: 180,
    drops: [{ itemId: 'tempest-charm', chance: 0.5 }]
  },
  {
    id: 'bog-terror',
    name: 'Sumpfschrecken',
    level: 7,
    element: 'earth',
    stats: {
      maxHp: 168,
      maxMp: 16,
      attack: 25,
      defense: 22,
      magic: 9,
      spirit: 14,
      agility: 10
    },
    skillIds: ['venom-spit', 'goblin-feint'],
    weaknesses: ['wind', 'fire'],
    resistances: ['earth', 'water'],
    experienceReward: 120,
    goldReward: 95,
    drops: [{ itemId: 'healing-herb', chance: 0.5 }]
  },
  {
    id: 'stray-echo',
    name: 'Streunendes Echo',
    level: 6,
    element: 'shadow',
    stats: {
      maxHp: 104,
      maxMp: 36,
      attack: 13,
      defense: 12,
      magic: 24,
      spirit: 20,
      agility: 19
    },
    skillIds: ['spirit-bind', 'water-blade'],
    weaknesses: ['holy', 'wind'],
    resistances: ['shadow'],
    experienceReward: 90,
    goldReward: 70,
    drops: [{ itemId: 'mana-drop', chance: 0.45 }]
  },
  {
    id: 'human-deserter',
    name: 'Deserteur-Söldner',
    level: 6,
    element: 'neutral',
    stats: {
      maxHp: 102,
      maxMp: 10,
      attack: 23,
      defense: 16,
      magic: 8,
      spirit: 11,
      agility: 18
    },
    skillIds: ['goblin-feint', 'battle-cry'],
    weaknesses: ['shadow'],
    resistances: [],
    experienceReward: 70,
    goldReward: 58,
    drops: [{ itemId: 'tempest-training-sword', chance: 0.1 }]
  },
  {
    id: 'elder-direwolf',
    name: 'Urdirewolf',
    level: 12,
    element: 'neutral',
    stats: {
      maxHp: 320,
      maxMp: 30,
      attack: 36,
      defense: 26,
      magic: 14,
      spirit: 20,
      agility: 28
    },
    skillIds: ['direwolf-rush', 'goblin-feint', 'quick-step'],
    weaknesses: ['earth'],
    resistances: ['neutral'],
    experienceReward: 320,
    goldReward: 260,
    drops: [{ itemId: 'tempest-charm', chance: 0.6 }]
  }
] as const satisfies readonly EnemyDefinition[];
