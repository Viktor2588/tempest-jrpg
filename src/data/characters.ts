import type { CharacterDefinition } from './types';

export const HEROES = [
  {
    id: 'rimuru',
    name: 'Rimuru',
    species: 'Schleim',
    role: 'Adaptiver Magiekämpfer',
    startsInParty: true,
    initialLevel: 1,
    initialExperience: 0,
    baseStats: {
      maxHp: 72,
      maxMp: 28,
      attack: 13,
      defense: 10,
      magic: 16,
      spirit: 12,
      agility: 14
    },
    growthPerLevel: {
      maxHp: 9,
      maxMp: 5,
      attack: 3,
      defense: 2,
      magic: 4,
      spirit: 3,
      agility: 3
    },
    initialSkillIds: ['slime-strike', 'water-blade', 'storm-gust'],
    startingEquipment: {
      weapon: null,
      armor: 'traveler-cloak',
      accessory: 'tempest-charm'
    }
  },
  {
    id: 'gobta',
    name: 'Gobta',
    species: 'Goblin',
    role: 'Schneller Frontkämpfer',
    startsInParty: true,
    initialLevel: 1,
    initialExperience: 0,
    baseStats: {
      maxHp: 84,
      maxMp: 12,
      attack: 15,
      defense: 12,
      magic: 7,
      spirit: 9,
      agility: 17
    },
    growthPerLevel: {
      maxHp: 10,
      maxMp: 2,
      attack: 4,
      defense: 3,
      magic: 1,
      spirit: 2,
      agility: 4
    },
    initialSkillIds: ['slime-strike', 'goblin-feint'],
    startingEquipment: {
      weapon: 'tempest-training-sword',
      armor: 'traveler-cloak',
      accessory: null
    }
  },
  {
    id: 'shuna',
    name: 'Shuna',
    species: 'Ogerin',
    role: 'Heilerin und Unterstützerin',
    startsInParty: false,
    initialLevel: 1,
    initialExperience: 0,
    baseStats: {
      maxHp: 64,
      maxMp: 34,
      attack: 8,
      defense: 9,
      magic: 18,
      spirit: 17,
      agility: 11
    },
    growthPerLevel: {
      maxHp: 7,
      maxMp: 6,
      attack: 2,
      defense: 2,
      magic: 4,
      spirit: 4,
      agility: 2
    },
    initialSkillIds: ['soothing-prayer'],
    startingEquipment: {
      weapon: null,
      armor: 'traveler-cloak',
      accessory: 'tempest-charm'
    }
  }
] as const satisfies readonly CharacterDefinition[];
