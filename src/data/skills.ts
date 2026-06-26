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
    id: 'storm-gust',
    name: 'Sturmböe',
    description: 'Trifft alle Gegner mit einer schnellen Windwelle.',
    element: 'wind',
    target: 'all-enemies',
    costMp: 7,
    power: 15,
    tags: ['magical']
  },
  {
    id: 'goblin-feint',
    name: 'Goblin-Finte',
    description: 'Ein trickreicher Hieb, der Gegner verwirrt und zuverlässig Schaden setzt.',
    element: 'neutral',
    target: 'single-enemy',
    costMp: 2,
    power: 16,
    tags: ['physical', 'debuff']
  },
  {
    id: 'venom-spit',
    name: 'Giftdorn',
    description: 'Ein dunkler Treffer mit Chance auf Gift.',
    element: 'shadow',
    target: 'single-enemy',
    costMp: 3,
    power: 14,
    tags: ['magical', 'debuff'],
    statusEffect: { id: 'poison', chance: 0.8, turns: 3 }
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
