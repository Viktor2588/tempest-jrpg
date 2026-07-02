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
    initialSkillIds: ['predator', 'great-sage', 'slime-strike', 'water-blade', 'water-jet', 'storm-gust'],
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
    // Tritt erst über die Goblin-Bitte ("Goblindorf schützen") der Party bei (Canon-Prolog).
    startsInParty: false,
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
    id: 'rigurd',
    name: 'Rigurd',
    species: 'Hobgoblin',
    role: 'Verteidiger und Feldkommandant',
    startsInParty: false,
    initialLevel: 1,
    initialExperience: 0,
    baseStats: {
      maxHp: 108,
      maxMp: 18,
      attack: 14,
      defense: 18,
      magic: 7,
      spirit: 14,
      agility: 9
    },
    growthPerLevel: {
      maxHp: 13,
      maxMp: 2,
      attack: 3,
      defense: 5,
      magic: 1,
      spirit: 3,
      agility: 2
    },
    initialSkillIds: ['iron-guard', 'battle-cry'],
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
  },
  {
    id: 'ranga',
    name: 'Ranga',
    species: 'Direwolf',
    role: 'Sturmreiter und Späher',
    startsInParty: false,
    initialLevel: 1,
    initialExperience: 0,
    baseStats: {
      maxHp: 92,
      maxMp: 16,
      attack: 18,
      defense: 13,
      magic: 8,
      spirit: 10,
      agility: 18
    },
    growthPerLevel: {
      maxHp: 11,
      maxMp: 2,
      attack: 5,
      defense: 3,
      magic: 1,
      spirit: 2,
      agility: 5
    },
    initialSkillIds: ['direwolf-rush', 'predator-aura', 'quick-step'],
    startingEquipment: {
      weapon: null,
      armor: 'traveler-cloak',
      accessory: null
    }
  },
  // — Band 2: Kijin (Ex-Oger), über die Benennung rekrutierbar; startsInParty: false —
  {
    id: 'benimaru', name: 'Benimaru', species: 'Kijin', role: 'Samurai-General', startsInParty: false,
    initialLevel: 1, initialExperience: 0,
    baseStats: { maxHp: 88, maxMp: 30, attack: 18, defense: 13, magic: 18, spirit: 12, agility: 14 },
    growthPerLevel: { maxHp: 10, maxMp: 4, attack: 4, defense: 2, magic: 4, spirit: 2, agility: 3 },
    initialSkillIds: ['black-flame', 'slime-strike'],
    startingEquipment: { weapon: 'tempest-training-sword', armor: 'traveler-cloak', accessory: null }
  },
  {
    id: 'shion', name: 'Shion', species: 'Kijin', role: 'Leibwache', startsInParty: false,
    initialLevel: 1, initialExperience: 0,
    baseStats: { maxHp: 120, maxMp: 14, attack: 20, defense: 16, magic: 6, spirit: 8, agility: 10 },
    growthPerLevel: { maxHp: 14, maxMp: 2, attack: 5, defense: 4, magic: 1, spirit: 2, agility: 2 },
    initialSkillIds: ['ogre-smash', 'battle-cry'],
    startingEquipment: { weapon: 'tempest-training-sword', armor: 'traveler-cloak', accessory: null }
  },
  {
    id: 'hakurou', name: 'Hakurou', species: 'Kijin', role: 'Schwertmeister', startsInParty: false,
    initialLevel: 1, initialExperience: 0,
    baseStats: { maxHp: 84, maxMp: 18, attack: 19, defense: 12, magic: 8, spirit: 12, agility: 20 },
    growthPerLevel: { maxHp: 9, maxMp: 2, attack: 4, defense: 2, magic: 2, spirit: 3, agility: 5 },
    initialSkillIds: ['quick-step', 'goblin-feint'],
    startingEquipment: { weapon: 'tempest-training-sword', armor: 'traveler-cloak', accessory: null }
  },
  {
    id: 'souei', name: 'Souei', species: 'Kijin', role: 'Schattenklinge', startsInParty: false,
    initialLevel: 1, initialExperience: 0,
    baseStats: { maxHp: 80, maxMp: 22, attack: 17, defense: 11, magic: 12, spirit: 12, agility: 22 },
    growthPerLevel: { maxHp: 9, maxMp: 3, attack: 4, defense: 2, magic: 3, spirit: 2, agility: 5 },
    initialSkillIds: ['venom-spit', 'quick-step'],
    startingEquipment: { weapon: 'tempest-training-sword', armor: 'traveler-cloak', accessory: null }
  }
] as const satisfies readonly CharacterDefinition[];
