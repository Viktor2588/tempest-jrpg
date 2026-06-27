import type { CharacterDefinition } from './types';

// ponytail: die früheren Standard-Rollen-Multiplikatoren sind hier in Basiswerte + Wachstum
// eingefaltet (gerundet → ganze Zahlen), seit Rollen durch Talentbäume ersetzt wurden.
// Klassen-Skills sind in initialSkillIds übernommen. Rollen/JobDefinition existieren nicht mehr.
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
      maxHp: 76,
      maxMp: 29,
      attack: 14,
      defense: 11,
      magic: 17,
      spirit: 13,
      agility: 15
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
      maxHp: 99,
      maxMp: 12,
      attack: 17,
      defense: 14,
      magic: 6,
      spirit: 9,
      agility: 16
    },
    growthPerLevel: {
      maxHp: 12,
      maxMp: 2,
      attack: 5,
      defense: 4,
      magic: 1,
      spirit: 2,
      agility: 4
    },
    initialSkillIds: ['slime-strike', 'goblin-feint', 'battle-cry'],
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
      maxMp: 41,
      attack: 7,
      defense: 9,
      magic: 20,
      spirit: 21,
      agility: 11
    },
    growthPerLevel: {
      maxHp: 7,
      maxMp: 7,
      attack: 2,
      defense: 2,
      magic: 4,
      spirit: 5,
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
