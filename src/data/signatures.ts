import type { ElementType, StatusEffectId } from './types';

export type SignatureTarget =
  | 'self'
  | 'single-ally'
  | 'all-allies'
  | 'single-enemy'
  | 'all-enemies';

export type SignatureEffectScope = 'targets' | 'self' | 'allies' | 'enemies';

export type SignatureEffect =
  | {
      readonly kind: 'damage';
      readonly power: number;
      readonly scaling: 'attack' | 'magic' | 'hybrid';
      readonly element: ElementType;
      readonly scope?: SignatureEffectScope;
    }
  | {
      readonly kind: 'heal';
      readonly maxHpFraction: number;
      readonly scope?: SignatureEffectScope;
    }
  | {
      readonly kind: 'status';
      readonly statusId: StatusEffectId;
      readonly turns: number;
      readonly scope?: SignatureEffectScope;
    }
  | {
      readonly kind: 'ct';
      readonly delta: number;
      readonly scope?: SignatureEffectScope;
    }
  | {
      readonly kind: 'break';
      readonly pressure: number;
      readonly scope?: SignatureEffectScope;
    }
  | {
      readonly kind: 'analyze';
      readonly levels: number;
      readonly scope?: SignatureEffectScope;
    }
  | {
      readonly kind: 'reaction';
      readonly reaction: 'timing-block' | 'counter';
      readonly timing: 'perfect' | 'success';
      readonly scope?: SignatureEffectScope;
    }
  | {
      readonly kind: 'team-meter';
      readonly amount: number;
      readonly scope?: SignatureEffectScope;
    };

export interface SignatureDefinition {
  readonly id: string;
  readonly characterId: string;
  readonly name: string;
  readonly description: string;
  readonly target: SignatureTarget;
  readonly chargePerAction: number;
  readonly effects: readonly SignatureEffect[];
}

export const SIGNATURES = [
  {
    id: 'rimuru-great-sage',
    characterId: 'rimuru',
    name: 'Weiser Horizont',
    description: 'Analysiert alle Gegner vollständig und setzt ihre Deckung unter Druck.',
    target: 'all-enemies',
    chargePerAction: 25,
    effects: [
      { kind: 'analyze', levels: 2 },
      { kind: 'break', pressure: 1 }
    ]
  },
  {
    id: 'ranga-tempest-hunt',
    characterId: 'ranga',
    name: 'Sturmjagd',
    description: 'Ranga überrennt ein Ziel, wirft es auf der Zeitleiste zurück und beschleunigt sich.',
    target: 'single-enemy',
    chargePerAction: 30,
    effects: [
      { kind: 'damage', power: 34, scaling: 'attack', element: 'wind' },
      { kind: 'ct', delta: -70 },
      { kind: 'status', statusId: 'haste', turns: 3, scope: 'self' }
    ]
  },
  {
    id: 'shuna-sacred-barrier',
    characterId: 'shuna',
    name: 'Heilige Barriere',
    description: 'Heilt die Gruppe und webt schützende, magieverstärkende Fäden.',
    target: 'all-allies',
    chargePerAction: 25,
    effects: [
      { kind: 'heal', maxHpFraction: 0.3 },
      { kind: 'status', statusId: 'defense-up', turns: 3 },
      { kind: 'status', statusId: 'magic-up', turns: 3 }
    ]
  },
  {
    id: 'benimaru-black-flame-command',
    characterId: 'benimaru',
    name: 'Schwarzflammen-Befehl',
    description: 'Ein Flammenfeld trifft alle Gegner und bricht ihre Formation.',
    target: 'all-enemies',
    chargePerAction: 25,
    effects: [
      { kind: 'damage', power: 42, scaling: 'magic', element: 'fire' },
      { kind: 'break', pressure: 2 }
    ]
  },
  {
    id: 'shion-certain-outcome',
    characterId: 'shion',
    name: 'Sicheres Ergebnis',
    description: 'Shions entschlossener Hieb verursacht massiven Schaden und erzwingt einen Break.',
    target: 'single-enemy',
    chargePerAction: 25,
    effects: [
      { kind: 'damage', power: 72, scaling: 'attack', element: 'earth' },
      { kind: 'break', pressure: 4 }
    ]
  },
  {
    id: 'hakurou-flowing-counter',
    characterId: 'hakurou',
    name: 'Fließender Konter',
    description: 'Hakurou liest den nächsten Angriff und nimmt die perfekte Konterhaltung ein.',
    target: 'self',
    chargePerAction: 35,
    effects: [
      { kind: 'reaction', reaction: 'counter', timing: 'perfect' },
      { kind: 'status', statusId: 'haste', turns: 2 }
    ]
  },
  {
    id: 'souei-shadow-bind',
    characterId: 'souei',
    name: 'Schattenfessel',
    description: 'Giftfäden verstummen das Ziel und ziehen es auf der Zeitleiste zurück.',
    target: 'single-enemy',
    chargePerAction: 30,
    effects: [
      { kind: 'status', statusId: 'poison', turns: 3 },
      { kind: 'status', statusId: 'silence', turns: 2 },
      { kind: 'ct', delta: -55 }
    ]
  },
  {
    id: 'gobta-lucky-feint',
    characterId: 'gobta',
    name: 'Genialer Zufall',
    description: 'Gobtas unmögliche Finte blendet das Ziel und katapultiert ihn nach vorn.',
    target: 'single-enemy',
    chargePerAction: 35,
    effects: [
      { kind: 'damage', power: 40, scaling: 'attack', element: 'neutral' },
      { kind: 'status', statusId: 'blind', turns: 3 },
      { kind: 'ct', delta: 70, scope: 'self' }
    ]
  },
  {
    id: 'rigurd-tempest-command',
    characterId: 'rigurd',
    name: 'Tempest steht zusammen',
    description: 'Rigurd festigt die Gruppe und füllt die Team-Leiste.',
    target: 'all-allies',
    chargePerAction: 25,
    effects: [
      { kind: 'status', statusId: 'defense-up', turns: 3 },
      { kind: 'team-meter', amount: 50 }
    ]
  },
  {
    id: 'kurobe-masterwork',
    characterId: 'kurobe',
    name: 'Meisterwerk',
    description: 'Kurobe härtet Waffen und Rüstung eines Verbündeten für den laufenden Kampf.',
    target: 'single-ally',
    chargePerAction: 30,
    effects: [
      { kind: 'status', statusId: 'attack-up', turns: 3 },
      { kind: 'status', statusId: 'defense-up', turns: 3 }
    ]
  }
] as const satisfies readonly SignatureDefinition[];
