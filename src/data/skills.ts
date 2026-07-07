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
    tags: ['physical'],
    tier: 'skill'
  },
  {
    id: 'water-blade',
    name: 'Wasserklinge',
    description: 'Formt eine scharfe Wasserwelle gegen einen Gegner.',
    element: 'water',
    target: 'single-enemy',
    costMp: 4,
    power: 22,
    tags: ['magical'],
    tier: 'extra-skill'
  },
  {
    id: 'water-jet',
    name: 'Wasserstrahl',
    description: 'Verdichtet Wasser zu einem präzisen Hochdruckstoß mit moderatem Magicule-Verbrauch.',
    element: 'water',
    target: 'single-enemy',
    costMp: 6,
    power: 28,
    tags: ['magical'],
    tier: 'extra-skill'
  },
  {
    id: 'storm-gust',
    name: 'Sturmböe',
    description: 'Trifft alle Gegner mit einer schnellen Windwelle.',
    element: 'wind',
    target: 'all-enemies',
    costMp: 7,
    power: 15,
    tags: ['magical'],
    tier: 'extra-skill'
  },
  {
    id: 'goblin-feint',
    name: 'Goblin-Finte',
    description: 'Ein trickreicher Hieb, der Gegner verwirrt und zuverlässig Schaden setzt.',
    element: 'neutral',
    target: 'single-enemy',
    costMp: 2,
    power: 16,
    tags: ['physical', 'debuff'],
    tier: 'skill'
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
    tier: 'skill',
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
    tier: 'skill',
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
    tier: 'skill',
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
    tier: 'skill',
    statusEffect: { id: 'spirit-down', chance: 1, turns: 3 }
  },
  {
    id: 'soothing-prayer',
    name: 'Beruhigendes Gebet',
    description: 'Stellt Lebenspunkte eines Verbündeten wieder her.',
    element: 'holy',
    target: 'single-ally',
    costMp: 8,
    power: 20,
    tags: ['heal', 'magical'],
    tier: 'extra-skill'
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
    tier: 'extra-skill',
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
    tags: ['magical'],
    tier: 'extra-skill'
  },
  {
    id: 'direwolf-rush',
    name: 'Direwolf-Ansturm',
    description: 'Ein schneller physischer Vorstoß, der aus tiefer Bindung zur Direwolf-Linie entsteht.',
    element: 'neutral',
    target: 'single-enemy',
    costMp: 5,
    power: 24,
    tags: ['physical'],
    tier: 'skill'
  },
  {
    id: 'sacred-weave',
    name: 'Sakralgewebe',
    description: 'Stärkt die Heilkunst mit feinen Barrierefäden der Oger-Priesterinnen.',
    element: 'holy',
    target: 'single-ally',
    costMp: 14,
    power: 32,
    tags: ['heal', 'magical'],
    tier: 'extra-skill'
  },
  { id: 'spirit-flame', name: 'Geistflamme', description: 'Shunas geweihte Geistflamme versengt ein Ziel mit heiligem Feuer.', element: 'holy', target: 'single-enemy', costMp: 9, power: 34, tags: ['magical'], tier: 'extra-skill' },
  { id: 'black-flame', name: 'Schwarzflamme', description: 'Benimarus konzentrierte Schwarzflamme verbrennt ein Ziel.', element: 'fire', target: 'single-enemy', costMp: 9, power: 38, tags: ['magical'], tier: 'extra-skill', heavy: true },
  { id: 'ifrit-inferno', name: 'Ifrits Inferno', description: 'Eine Feuerwand erfasst alle Gegner.', element: 'fire', target: 'all-enemies', costMp: 14, power: 30, tags: ['magical'], tier: 'extra-skill', heavy: true },
  { id: 'orc-cleave', name: 'Ork-Spalter', description: 'Brutaler Hieb mit grobem Schlachtbeil.', element: 'neutral', target: 'single-enemy', costMp: 5, power: 26, tags: ['physical'], tier: 'skill' },
  { id: 'war-cry', name: 'Kriegsschrei', description: 'Anstachelnder Ruf — eigener Angriff steigt.', element: 'neutral', target: 'self', costMp: 6, power: 0, tags: ['buff'], tier: 'skill', statusEffect: { id: 'attack-up', chance: 1, turns: 3 } },
  { id: 'rally-cry', name: 'Sammelruf', description: 'Feuert einen Verbündeten an — dessen Angriff steigt.', element: 'neutral', target: 'single-ally', costMp: 6, power: 0, tags: ['buff'], tier: 'skill', statusEffect: { id: 'attack-up', chance: 1, turns: 3 } },
  { id: 'iron-guard', name: 'Eisenwall', description: 'Verschanzt sich — eigene Verteidigung steigt.', element: 'neutral', target: 'self', costMp: 5, power: 0, tags: ['buff'], tier: 'skill', statusEffect: { id: 'defense-up', chance: 1, turns: 3 } },
  { id: 'famished-bite', name: 'Hungerbiss', description: 'Der Hunger der „Ausgehungerten" reißt Fleisch und Kraft heraus.', element: 'shadow', target: 'single-enemy', costMp: 8, power: 34, tags: ['physical'], tier: 'extra-skill', heavy: true },
  { id: 'calamity-roar', name: 'Katastrophenbrüllen', description: 'Ein Brüllen bricht die Deckung aller Gegner.', element: 'shadow', target: 'all-enemies', costMp: 12, power: 0, tags: ['debuff'], tier: 'extra-skill', statusEffect: { id: 'guard-break', chance: 0.9, turns: 3 } },
  { id: 'ogre-smash', name: 'Oger-Wucht', description: 'Erderschütternder Hieb roher Ogerkraft.', element: 'earth', target: 'single-enemy', costMp: 7, power: 32, tags: ['physical'], tier: 'extra-skill', heavy: true },
  // Phase 56 — verlaesslicher Flaechendruck fuer Schatten-Bosse (kein Guard-Break-Stapeln).
  { id: 'umbral-burst', name: 'Schattenwoge', description: 'Eine Woge aus Schattenmagie erfasst alle Gegner.', element: 'shadow', target: 'all-enemies', costMp: 12, power: 18, tags: ['magical'], tier: 'extra-skill' },
  { id: 'spear-charge', name: 'Speersturm', description: 'Schneller Vorstoß mit der Wasserklinge.', element: 'wind', target: 'single-enemy', costMp: 5, power: 24, tags: ['physical'], tier: 'skill' },
  { id: 'tide-lance', name: 'Flutlanze', description: 'Ein Wasserdruckstoß durchbohrt das Ziel.', element: 'water', target: 'single-enemy', costMp: 7, power: 26, tags: ['magical'], tier: 'extra-skill' },
  { id: 'drago-nova', name: 'Drago Nova', description: 'Milims überwältigende Drachenenergie — ein Schlag wie ein Sternenfall.', element: 'fire', target: 'all-enemies', costMp: 20, power: 60, tags: ['magical'], tier: 'ultimate-skill', heavy: true },
  // Phase 40 — Zeitkontrolle (Zeitleiste-Rewrite)
  { id: 'temporal-snare', name: 'Zeitfalle', description: 'Verzerrt den Zeitfluss und wirft das Ziel auf der Zeitleiste zurück.', element: 'shadow', target: 'single-enemy', costMp: 6, power: 8, tags: ['magical', 'debuff'], tier: 'extra-skill', ctDelta: -55 },
  { id: 'quicken', name: 'Beschleunigung', description: 'Verdichtet Magie zu Tempo und zieht einen Verbündeten auf der Zeitleiste vor.', element: 'wind', target: 'single-ally', costMp: 5, power: 0, tags: ['buff', 'magical'], tier: 'extra-skill', ctDelta: 60 },
  // Phase 41 — Rimurus Unique-Skills: aktivieren die Verben Analysieren/Verschlingen (nicht direkt wirkbar).
  { id: 'great-sage', name: 'Großer Weiser', description: 'Rimurus einzigartige Fähigkeit: analysiert Gegner, deckt Schwächen auf und liest ihre nächsten Züge.', element: 'neutral', target: 'self', costMp: 0, power: 0, tags: ['buff'], tier: 'unique-skill' },
  { id: 'predator', name: 'Verschlinger', description: 'Rimurus einzigartige Fähigkeit: verschlingt gebrochene, geschwächte Gegner und eignet sich ihre Kraft an.', element: 'shadow', target: 'self', costMp: 0, power: 0, tags: ['buff'], tier: 'unique-skill' }
] as const satisfies readonly SkillDefinition[];
