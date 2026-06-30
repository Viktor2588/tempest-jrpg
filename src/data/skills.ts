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
  },
  { id: 'black-flame', name: 'Schwarzflamme', description: 'Benimarus konzentrierte Schwarzflamme verbrennt ein Ziel.', element: 'fire', target: 'single-enemy', costMp: 9, power: 38, tags: ['magical'] },
  { id: 'ifrit-inferno', name: 'Ifrits Inferno', description: 'Eine Feuerwand erfasst alle Gegner.', element: 'fire', target: 'all-enemies', costMp: 14, power: 30, tags: ['magical'] },
  { id: 'orc-cleave', name: 'Ork-Spalter', description: 'Brutaler Hieb mit grobem Schlachtbeil.', element: 'neutral', target: 'single-enemy', costMp: 5, power: 26, tags: ['physical'] },
  { id: 'war-cry', name: 'Kriegsschrei', description: 'Anstachelnder Ruf — eigener Angriff steigt.', element: 'neutral', target: 'self', costMp: 6, power: 0, tags: ['buff'], statusEffect: { id: 'attack-up', chance: 1, turns: 3 } },
  { id: 'iron-guard', name: 'Eisenwall', description: 'Verschanzt sich — eigene Verteidigung steigt.', element: 'neutral', target: 'self', costMp: 5, power: 0, tags: ['buff'], statusEffect: { id: 'defense-up', chance: 1, turns: 3 } },
  { id: 'famished-bite', name: 'Hungerbiss', description: 'Der Hunger der „Ausgehungerten" reißt Fleisch und Kraft heraus.', element: 'shadow', target: 'single-enemy', costMp: 8, power: 34, tags: ['physical'] },
  { id: 'calamity-roar', name: 'Katastrophenbrüllen', description: 'Ein Brüllen bricht die Deckung aller Gegner.', element: 'shadow', target: 'all-enemies', costMp: 12, power: 0, tags: ['debuff'], statusEffect: { id: 'guard-break', chance: 0.9, turns: 3 } },
  { id: 'ogre-smash', name: 'Oger-Wucht', description: 'Erderschütternder Hieb roher Ogerkraft.', element: 'earth', target: 'single-enemy', costMp: 7, power: 32, tags: ['physical'] },
  { id: 'spear-charge', name: 'Speersturm', description: 'Schneller Vorstoß mit der Wasserklinge.', element: 'wind', target: 'single-enemy', costMp: 5, power: 24, tags: ['physical'] },
  { id: 'tide-lance', name: 'Flutlanze', description: 'Ein Wasserdruckstoß durchbohrt das Ziel.', element: 'water', target: 'single-enemy', costMp: 7, power: 26, tags: ['magical'] },
  { id: 'drago-nova', name: 'Drago Nova', description: 'Milims überwältigende Drachenenergie — ein Schlag wie ein Sternenfall.', element: 'fire', target: 'all-enemies', costMp: 20, power: 60, tags: ['magical'] },
  // Phase 40 — Zeitkontrolle (Zeitleiste-Rewrite)
  { id: 'temporal-snare', name: 'Zeitfalle', description: 'Verzerrt den Zeitfluss und wirft das Ziel auf der Zeitleiste zurück.', element: 'shadow', target: 'single-enemy', costMp: 6, power: 8, tags: ['magical', 'debuff'], ctDelta: -55 },
  { id: 'quicken', name: 'Beschleunigung', description: 'Verdichtet Magie zu Tempo und zieht einen Verbündeten auf der Zeitleiste vor.', element: 'wind', target: 'single-ally', costMp: 5, power: 0, tags: ['buff', 'magical'], ctDelta: 60 },
  // Phase 41 — Rimurus Unique-Skills: aktivieren die Verben Analysieren/Verschlingen (nicht direkt wirkbar).
  { id: 'great-sage', name: 'Großer Weiser', description: 'Rimurus einzigartige Fähigkeit: analysiert Gegner, deckt Schwächen auf und liest ihre nächsten Züge.', element: 'neutral', target: 'self', costMp: 0, power: 0, tags: ['buff'] },
  { id: 'predator', name: 'Verschlinger', description: 'Rimurus einzigartige Fähigkeit: verschlingt gebrochene, geschwächte Gegner und eignet sich ihre Kraft an.', element: 'shadow', target: 'self', costMp: 0, power: 0, tags: ['buff'] }
] as const satisfies readonly SkillDefinition[];
