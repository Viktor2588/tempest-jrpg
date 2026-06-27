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
    id: 'battle-cry',
    name: 'Kampfruf',
    description: 'Erhöht kurzzeitig den Angriff des Anwenders.',
    element: 'neutral',
    target: 'self',
    costMp: 3,
    power: 0,
    tags: ['buff'],
    statusEffect: { id: 'attack-up', chance: 1, turns: 3 }
  },
  {
    id: 'quick-step',
    name: 'Schneller Schritt',
    description: 'Erhöht kurzzeitig die Initiative des Anwenders.',
    element: 'wind',
    target: 'self',
    costMp: 3,
    power: 0,
    tags: ['buff'],
    statusEffect: { id: 'haste', chance: 1, turns: 3 }
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
    id: 'spirit-bind',
    name: 'Geistfessel',
    description: 'Ein schwacher Schattenzauber, der den Geist des Ziels senkt.',
    element: 'shadow',
    target: 'single-enemy',
    costMp: 5,
    power: 10,
    tags: ['magical', 'debuff'],
    statusEffect: { id: 'spirit-down', chance: 1, turns: 3 }
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
  },
  {
    id: 'barrier-prayer',
    name: 'Barrieregebet',
    description: 'Legt einen schützenden Gebetsfaden um einen Verbündeten.',
    element: 'holy',
    target: 'single-ally',
    costMp: 6,
    power: 0,
    tags: ['buff', 'magical'],
    statusEffect: { id: 'defense-up', chance: 1, turns: 3 }
  },
  {
    id: 'predator-aura',
    name: 'Raubtier-Aura',
    description: 'Ein konzentrierter Schattenstoß, der aus einer benannten Schleimform erwacht.',
    element: 'shadow',
    target: 'single-enemy',
    costMp: 8,
    power: 30,
    tags: ['magical']
  },
  {
    id: 'direwolf-rush',
    name: 'Direwolf-Ansturm',
    description: 'Ein schneller physischer Vorstoß, der aus tiefer Bindung zur Direwolf-Linie entsteht.',
    element: 'neutral',
    target: 'single-enemy',
    costMp: 5,
    power: 24,
    tags: ['physical']
  },
  {
    id: 'sacred-weave',
    name: 'Sakralgewebe',
    description: 'Stärkt die Heilkunst mit feinen Barrierefäden der Oger-Priesterinnen.',
    element: 'holy',
    target: 'single-ally',
    costMp: 9,
    power: 38,
    tags: ['heal', 'magical']
  }
] as const satisfies readonly SkillDefinition[];
