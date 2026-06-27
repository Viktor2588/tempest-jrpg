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
  },
  {
    id: 'predator-sage',
    name: 'Raubtier-Weiser',
    description: 'Rimurus benannte Entwicklungsrolle mit hohem MP-/Magiefokus und Schattenzugriff.',
    statMultiplier: {
      maxMp: 1.32,
      attack: 0.95,
      defense: 1.02,
      magic: 1.28,
      spirit: 1.18,
      agility: 1.08
    },
    skillIds: ['predator-aura', 'water-blade'],
    allowedCharacterIds: ['rimuru'],
    unlock: {
      kind: 'evolution',
      label: 'Rimurus benannte Schleim-Entwicklung'
    }
  },
  {
    id: 'tempest-knight',
    name: 'Tempest-Ritter',
    description: 'Gobtas Bindungsrolle für robuste Front und Direwolf-Initiative.',
    statMultiplier: {
      maxHp: 1.25,
      attack: 1.2,
      defense: 1.16,
      magic: 0.82,
      spirit: 1.02,
      agility: 1.12
    },
    skillIds: ['direwolf-rush', 'goblin-feint'],
    allowedCharacterIds: ['gobta'],
    unlock: {
      kind: 'bond',
      label: 'Ranga-Bindung Stufe 2'
    }
  },
  {
    id: 'spirit-weaver',
    name: 'Geistweberin',
    description: 'Shunas fortgeschrittene Unterstützungsrolle mit stärkeren Heil- und Barrierewerten.',
    statMultiplier: {
      maxHp: 1.02,
      maxMp: 1.3,
      attack: 0.78,
      defense: 1.02,
      magic: 1.18,
      spirit: 1.35
    },
    skillIds: ['sacred-weave', 'soothing-prayer'],
    allowedCharacterIds: ['shuna'],
    unlock: {
      kind: 'story',
      label: 'Tempest-Vertrauen nach erster Patrouille'
    }
  },
  {
    id: 'marsh-runner',
    name: 'Marschenläufer',
    description: 'Erkundungsrolle für schnelle Züge und sichere Kämpfe in Sumpfregionen.',
    statMultiplier: {
      maxHp: 1.02,
      maxMp: 0.95,
      attack: 1.08,
      defense: 0.96,
      magic: 0.95,
      spirit: 1.02,
      agility: 1.34
    },
    skillIds: ['storm-gust', 'direwolf-rush'],
    allowedCharacterIds: ['rimuru', 'gobta'],
    unlock: {
      kind: 'exploration',
      label: 'Sumpfrand erkundet'
    }
  }
] as const satisfies readonly JobDefinition[];
