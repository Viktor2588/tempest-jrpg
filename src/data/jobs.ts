import type { JobDefinition } from './types';

export const JOBS = [
  {
    id: 'adaptive-hero',
    name: 'Adaptiver Held',
    description: 'Ausgewogene Rolle für sichere Erkundung und flexible Skill-Nutzung.',
    statMultiplier: {
      maxHp: 1.05,
      maxMp: 1.05,
      attack: 1.05,
      defense: 1.05,
      magic: 1.05,
      spirit: 1.05,
      agility: 1.05
    },
    skillIds: ['slime-strike'],
    allowedCharacterIds: ['rimuru']
  },
  {
    id: 'vanguard',
    name: 'Vorhut',
    description: 'Frontrolle mit mehr LP, Angriff und Verteidigung.',
    statMultiplier: {
      maxHp: 1.18,
      attack: 1.15,
      defense: 1.18,
      magic: 0.9,
      agility: 0.95
    },
    skillIds: ['goblin-feint']
  },
  {
    id: 'mystic',
    name: 'Mystiker',
    description: 'Magische Rolle mit mehr MP, Magie und Geist.',
    statMultiplier: {
      maxMp: 1.25,
      attack: 0.9,
      defense: 0.95,
      magic: 1.2,
      spirit: 1.18
    },
    skillIds: ['water-blade', 'soothing-prayer']
  },
  {
    id: 'scout',
    name: 'Späher',
    description: 'Schnelle Rolle für Initiative und sichere Item-Nutzung.',
    statMultiplier: {
      maxHp: 0.95,
      defense: 0.95,
      agility: 1.25
    },
    skillIds: ['storm-gust']
  },
  {
    id: 'support-priest',
    name: 'Tempest-Priesterin',
    description: 'Unterstützungsrolle mit Heilfokus und stabiler Geist-Wertung.',
    statMultiplier: {
      maxMp: 1.2,
      attack: 0.85,
      magic: 1.12,
      spirit: 1.25
    },
    skillIds: ['soothing-prayer'],
    allowedCharacterIds: ['shuna']
  }
] as const satisfies readonly JobDefinition[];
