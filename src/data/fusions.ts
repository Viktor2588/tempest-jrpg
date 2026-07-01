import type { ElementType, StatusEffectId } from './types';

export type FusionElementId =
  | 'abyss-tide'
  | 'deluge'
  | 'cyclone'
  | 'divine-storm'
  | 'eclipse'
  | 'hellfire'
  | 'holy-tide'
  | 'inferno'
  | 'magma'
  | 'mire'
  | 'night-tempest'
  | 'quake'
  | 'radiance'
  | 'sanctuary'
  | 'sandstorm'
  | 'sepulcher'
  | 'steam'
  | 'storm'
  | 'sunfire'
  | 'void'
  | 'wildfire';

export interface ElementFusionDefinition {
  readonly id: string;
  readonly name: string;
  readonly elements: readonly [ElementType, ElementType];
  readonly resultElement: FusionElementId;
  readonly damageElement: ElementType;
  readonly powerMultiplier: number;
  readonly breakPressure: number;
  readonly statusEffect?: {
    readonly id: StatusEffectId;
    readonly turns: number;
  };
}

export const ELEMENT_FUSIONS = [
  {
    id: 'water-water-deluge',
    name: 'Springflut',
    elements: ['water', 'water'],
    resultElement: 'deluge',
    damageElement: 'water',
    powerMultiplier: 1.7,
    breakPressure: 3,
    statusEffect: { id: 'spirit-down', turns: 2 }
  },
  {
    id: 'water-wind-storm',
    name: 'Sturmflut',
    elements: ['water', 'wind'],
    resultElement: 'storm',
    damageElement: 'wind',
    powerMultiplier: 1.85,
    breakPressure: 3,
    statusEffect: { id: 'weaken', turns: 2 }
  },
  {
    id: 'water-fire-steam',
    name: 'Dampfexplosion',
    elements: ['water', 'fire'],
    resultElement: 'steam',
    damageElement: 'water',
    powerMultiplier: 1.8,
    breakPressure: 3,
    statusEffect: { id: 'blind', turns: 2 }
  },
  {
    id: 'water-earth-mire',
    name: 'Moorgriff',
    elements: ['water', 'earth'],
    resultElement: 'mire',
    damageElement: 'earth',
    powerMultiplier: 1.75,
    breakPressure: 3,
    statusEffect: { id: 'weaken', turns: 2 }
  },
  {
    id: 'water-holy-tide',
    name: 'Reinigende Flut',
    elements: ['water', 'holy'],
    resultElement: 'holy-tide',
    damageElement: 'holy',
    powerMultiplier: 1.75,
    breakPressure: 4
  },
  {
    id: 'wind-wind-cyclone',
    name: 'Doppelzyklon',
    elements: ['wind', 'wind'],
    resultElement: 'cyclone',
    damageElement: 'wind',
    powerMultiplier: 1.75,
    breakPressure: 3
  },
  {
    id: 'fire-wind-wildfire',
    name: 'Feuersturm',
    elements: ['fire', 'wind'],
    resultElement: 'wildfire',
    damageElement: 'fire',
    powerMultiplier: 1.85,
    breakPressure: 3,
    statusEffect: { id: 'weaken', turns: 2 }
  },
  {
    id: 'fire-earth-magma',
    name: 'Magmaspalter',
    elements: ['fire', 'earth'],
    resultElement: 'magma',
    damageElement: 'fire',
    powerMultiplier: 1.9,
    breakPressure: 4
  },
  {
    id: 'wind-shadow-night-tempest',
    name: 'Nachtsturm',
    elements: ['wind', 'shadow'],
    resultElement: 'night-tempest',
    damageElement: 'shadow',
    powerMultiplier: 1.8,
    breakPressure: 3,
    statusEffect: { id: 'silence', turns: 2 }
  },
  {
    id: 'wind-holy-divine-storm',
    name: 'Himmelssturm',
    elements: ['wind', 'holy'],
    resultElement: 'divine-storm',
    damageElement: 'holy',
    powerMultiplier: 1.8,
    breakPressure: 3,
    statusEffect: { id: 'blind', turns: 2 }
  },
  {
    id: 'fire-fire-inferno',
    name: 'Doppelinferno',
    elements: ['fire', 'fire'],
    resultElement: 'inferno',
    damageElement: 'fire',
    powerMultiplier: 1.8,
    breakPressure: 3,
    statusEffect: { id: 'weaken', turns: 2 }
  },
  {
    id: 'wind-earth-sandstorm',
    name: 'Sandsturm',
    elements: ['wind', 'earth'],
    resultElement: 'sandstorm',
    damageElement: 'earth',
    powerMultiplier: 1.75,
    breakPressure: 3,
    statusEffect: { id: 'blind', turns: 3 }
  },
  {
    id: 'earth-earth-quake',
    name: 'Weltenbeben',
    elements: ['earth', 'earth'],
    resultElement: 'quake',
    damageElement: 'earth',
    powerMultiplier: 1.8,
    breakPressure: 4
  },
  {
    id: 'water-shadow-abyss-tide',
    name: 'Abgrundflut',
    elements: ['water', 'shadow'],
    resultElement: 'abyss-tide',
    damageElement: 'shadow',
    powerMultiplier: 1.8,
    breakPressure: 3,
    statusEffect: { id: 'poison', turns: 3 }
  },
  {
    id: 'fire-shadow-hellfire',
    name: 'Höllenflamme',
    elements: ['fire', 'shadow'],
    resultElement: 'hellfire',
    damageElement: 'fire',
    powerMultiplier: 1.9,
    breakPressure: 3,
    statusEffect: { id: 'weaken', turns: 2 }
  },
  {
    id: 'fire-holy-sunfire',
    name: 'Sonnenfeuer',
    elements: ['fire', 'holy'],
    resultElement: 'sunfire',
    damageElement: 'holy',
    powerMultiplier: 1.85,
    breakPressure: 3
  },
  {
    id: 'earth-holy-sanctuary',
    name: 'Heiliger Bastionstoß',
    elements: ['earth', 'holy'],
    resultElement: 'sanctuary',
    damageElement: 'holy',
    powerMultiplier: 1.7,
    breakPressure: 4
  },
  {
    id: 'earth-shadow-sepulcher',
    name: 'Grabessiegel',
    elements: ['earth', 'shadow'],
    resultElement: 'sepulcher',
    damageElement: 'earth',
    powerMultiplier: 1.85,
    breakPressure: 4,
    statusEffect: { id: 'guard-break', turns: 2 }
  },
  {
    id: 'holy-shadow-eclipse',
    name: 'Eklipsenschlag',
    elements: ['holy', 'shadow'],
    resultElement: 'eclipse',
    damageElement: 'shadow',
    powerMultiplier: 1.9,
    breakPressure: 3,
    statusEffect: { id: 'silence', turns: 2 }
  },
  {
    id: 'shadow-shadow-void',
    name: 'Leerenbruch',
    elements: ['shadow', 'shadow'],
    resultElement: 'void',
    damageElement: 'shadow',
    powerMultiplier: 1.8,
    breakPressure: 3,
    statusEffect: { id: 'spirit-down', turns: 3 }
  },
  {
    id: 'holy-holy-radiance',
    name: 'Doppelglanz',
    elements: ['holy', 'holy'],
    resultElement: 'radiance',
    damageElement: 'holy',
    powerMultiplier: 1.8,
    breakPressure: 4
  }
] as const satisfies readonly ElementFusionDefinition[];
