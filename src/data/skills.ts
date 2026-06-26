import type { SkillDefinition } from './types';

export const SKILLS = [
  {
    id: 'slime-strike',
    name: 'Schleimschlag',
    description: 'Ein schneller körperlicher Angriff mit guter Trefferkontrolle.',
    element: 'neutral',
    target: 'single-enemy',
    costMp: 0,
    power: 12,
    tags: ['physical']
  },
  {
    id: 'water-blade',
    name: 'Wasserklinge',
    description: 'Formt eine scharfe Wasserwelle gegen einen Gegner.',
    element: 'water',
    target: 'single-enemy',
    costMp: 4,
    power: 22,
    tags: ['magical']
  },
  {
    id: 'goblin-feint',
    name: 'Goblin-Finte',
    description: 'Ein trickreicher Hieb, der später als Tempo-/Debuff-Aktion genutzt wird.',
    element: 'neutral',
    target: 'single-enemy',
    costMp: 2,
    power: 16,
    tags: ['physical', 'debuff']
  },
  {
    id: 'soothing-prayer',
    name: 'Beruhigendes Gebet',
    description: 'Stellt Lebenspunkte eines Verbündeten wieder her.',
    element: 'holy',
    target: 'single-ally',
    costMp: 5,
    power: 24,
    tags: ['heal', 'magical']
  }
] as const satisfies readonly SkillDefinition[];
