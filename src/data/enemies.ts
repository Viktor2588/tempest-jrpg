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
  }
] as const satisfies readonly EnemyDefinition[];
