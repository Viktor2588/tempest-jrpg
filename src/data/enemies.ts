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
  }
] as const satisfies readonly EnemyDefinition[];
