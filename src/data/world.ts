import type { Vec2 } from '../systems/overworld';

export type WorldLocationKind = 'city' | 'outpost' | 'dungeon' | 'shrine';

export type WorldEffect =
  | { readonly type: 'set-flag'; readonly flag: string; readonly value: boolean }
  | { readonly type: 'start-quest'; readonly questId: string }
  | { readonly type: 'complete-quest-step'; readonly questId: string; readonly stepId: string }
  | { readonly type: 'complete-quest'; readonly questId: string }
  | { readonly type: 'add-item'; readonly itemId: string; readonly quantity: number }
  | { readonly type: 'add-gold'; readonly amount: number };

export interface WorldRequirement {
  readonly flag?: string;
  readonly notFlag?: string;
  readonly questStatus?: {
    readonly questId: string;
    readonly status: 'inactive' | 'active' | 'completed';
  };
  readonly questStep?: {
    readonly questId: string;
    readonly stepId: string;
  };
  readonly missingQuestStep?: {
    readonly questId: string;
    readonly stepId: string;
  };
}

export interface QuestStepDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly locationId?: string;
}

export interface QuestDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly actId?: string;
  readonly steps: readonly QuestStepDefinition[];
  readonly reward?: {
    readonly gold?: number;
    readonly itemIds?: readonly string[];
  };
}

export interface WorldLocationDefinition {
  readonly id: string;
  readonly name: string;
  readonly kind: WorldLocationKind;
  readonly mapId: string;
  readonly position: Vec2;
  readonly description: string;
  readonly identity: string;
  readonly unlockFlag?: string;
}

export interface LoreEntryDefinition {
  readonly id: string;
  readonly title: string;
  readonly category: 'people' | 'places' | 'history' | 'systems';
  readonly body: string;
  readonly unlockFlag?: string;
}

export interface DialogChoiceDefinition {
  readonly id: string;
  readonly label: string;
  readonly nextNodeId?: string;
  readonly requirements?: readonly WorldRequirement[];
  readonly effects?: readonly WorldEffect[];
}

export interface DialogNodeDefinition {
  readonly id: string;
  readonly speaker: string;
  readonly text: string;
  readonly choices: readonly DialogChoiceDefinition[];
}

export interface DialogDefinition {
  readonly id: string;
  readonly startNodeId: string;
  readonly nodes: readonly DialogNodeDefinition[];
}

export interface NpcDefinition {
  readonly id: string;
  readonly name: string;
  readonly mapId: string;
  readonly position: Vec2;
  readonly dialogId: string;
  readonly color: number;
}

export interface ShopDefinition {
  readonly id: string;
  readonly name: string;
  readonly mapId: string;
  readonly position: Vec2;
  readonly itemIds: readonly string[];
  readonly buyMultiplier: number;
  readonly sellMultiplier: number;
}

export interface EncounterDefinition {
  readonly id: string;
  readonly mapId: string;
  readonly kind: 'trigger' | 'random';
  readonly position?: Vec2;
  readonly bounds?: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly enemyIds: readonly string[];
  readonly chance: number;
  readonly requirements?: readonly WorldRequirement[];
  readonly startEffects?: readonly WorldEffect[];
  readonly victoryEffects?: readonly WorldEffect[];
}

export const QUESTS = [
  {
    id: 'first-patrol',
    title: 'Erste Patrouille',
    description: 'Hilf Rigurd, den Rand von Tempest zu sichern.',
    actId: 'act-1',
    steps: [
      {
        id: 'accepted',
        title: 'Patrouille annehmen',
        description: 'Sprich mit Rigurd am Rand der jungen Stadt Tempest.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'training-cleared',
        title: 'Trainingspfad sichern',
        description: 'Prüfe die Lichtung im Osten und vertreibe die wilden Kreaturen.',
        locationId: 'border-camp'
      },
      {
        id: 'reported',
        title: 'Rigurd Bericht erstatten',
        description: 'Kehre zu Rigurd zurück, damit die Händler den Weg freigeben können.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 60, itemIds: ['mana-drop'] }
  },
  {
    id: 'binding-of-ancestors',
    title: 'Bindung der Ahnen',
    description: 'Führe Sora, Vael und Lyrre durch den ersten Riss der alten Versiegelung.',
    actId: 'act-1',
    steps: [
      {
        id: 'awakening',
        title: 'Erwachen ohne Namen',
        description: 'Sora findet den Schleimkern und bindet ihn in Tempests Schutzkreis ein.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'gather-council',
        title: 'Rat versammeln',
        description: 'Hole Vaels Analyse und Lyrres Grenzbericht ein.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'clear-grove',
        title: 'Flüsterhain sichern',
        description: 'Durchquere den Hain, dessen Pflanzen auf fremde Magie reagieren.',
        locationId: 'whispering-grove'
      },
      {
        id: 'defeat-mordrahn-echo',
        title: 'Echo am Ahnensiegel brechen',
        description: 'Stelle dich Mordrahns Projektion, bevor sie das Siegel erneut verdreht.',
        locationId: 'ancestor-seal'
      },
      {
        id: 'report-sora',
        title: 'Gründung besiegeln',
        description: 'Kehre mit dem Siegelbruch zu Sora zurück.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 180, itemIds: ['tempest-charm'] }
  }
] as const satisfies readonly QuestDefinition[];

export const LOCATIONS = [
  {
    id: 'tempest-hollow',
    name: 'Tempest-Hainstadt',
    kind: 'city',
    mapId: 'tempest-start',
    position: { x: 3, y: 5 },
    description: 'Eine junge Monsterstadt aus Palisaden, Werkbänken und improvisierten Versammlungsplätzen.',
    identity: 'Sicherer Hub: Dialoge, Shops, Bindungen und Questentscheidungen.'
  },
  {
    id: 'border-camp',
    name: 'Grenzlager Ost',
    kind: 'outpost',
    mapId: 'tempest-start',
    position: { x: 2, y: 12 },
    description: 'Ein schmaler Wachposten zwischen Stadt und Handelsweg.',
    identity: 'Kurze Vorbereitung, einfache Begegnungen und erste Hinweise auf Menschen/Monster-Spannung.'
  },
  {
    id: 'whispering-grove',
    name: 'Flüsterhain',
    kind: 'dungeon',
    mapId: 'tempest-start',
    position: { x: 14, y: 8 },
    description: 'Ein dichter Hain, dessen Sporen auf Namen und magische Signaturen reagieren.',
    identity: 'Dungeon-Identität: Gift, Sichtlinien, Abkürzungen und Pflanzen, die auf Storyflags reagieren.',
    unlockFlag: 'story.council.ready'
  },
  {
    id: 'ancestor-seal',
    name: 'Ahnensiegel',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 21, y: 13 },
    description: 'Ein gebrochener Schrein, an dem die Bindung der Ahnen hörbar knirscht.',
    identity: 'Boss-Ort: klare Arena, Siegelmechanik und Mordrahns moralischer Konflikt.',
    unlockFlag: 'story.grove.cleared'
  }
] as const satisfies readonly WorldLocationDefinition[];

export const LORE_ENTRIES = [
  {
    id: 'nameless-core',
    title: 'Der Namenlose',
    category: 'people',
    body: 'Ein Schleimkern ohne Erinnerung. Seine Kraft verschlingt Spuren der Welt und formt daraus Analyse, Namen und Entwicklung.',
    unlockFlag: 'story.intro.seen'
  },
  {
    id: 'tempest-council',
    title: 'Erster Rat von Tempest',
    category: 'places',
    body: 'Sora hält die Verteidigung, Vael liest die Magiestruktur, Lyrre beobachtet die Grenze. Zusammen bilden sie den ersten belastbaren Quest-Knoten.',
    unlockFlag: 'story.council.ready'
  },
  {
    id: 'binding-of-ancestors',
    title: 'Bindung der Ahnen',
    category: 'history',
    body: 'Eine alte Ordnungsmagie, die Monsterstämme vor Auslöschung bewahrte, aber Namen, Freiheit und Opfer miteinander verknotet.',
    unlockFlag: 'story.grove.cleared'
  },
  {
    id: 'mordrahn',
    title: 'Mordrahn',
    category: 'people',
    body: 'Der Hüter der zerfallenden Bindung. Sein Echo spricht nicht wie ein Eroberer, sondern wie jemand, der eine Katastrophe um jeden Preis verhindern will.',
    unlockFlag: 'story.boss.echo-defeated'
  }
] as const satisfies readonly LoreEntryDefinition[];

export const DIALOGS = [
  {
    id: 'rigurd-intro',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Rigurd',
        text: 'Willkommen am Rand von Tempest. Wir brauchen eine kurze Patrouille, bevor die Händler öffnen.',
        choices: [
          {
            id: 'accept',
            label: 'Patrouille übernehmen',
            nextNodeId: 'accepted',
            requirements: [{ questStatus: { questId: 'first-patrol', status: 'inactive' } }],
            effects: [
              { type: 'start-quest', questId: 'first-patrol' },
              { type: 'complete-quest-step', questId: 'first-patrol', stepId: 'accepted' },
              { type: 'set-flag', flag: 'bond.rigurd.met', value: true }
            ]
          },
          {
            id: 'report',
            label: 'Patrouille abschließen',
            nextNodeId: 'completed',
            requirements: [
              { questStatus: { questId: 'first-patrol', status: 'active' } },
              { flag: 'encounter.training-cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'first-patrol', stepId: 'training-cleared' },
              { type: 'complete-quest-step', questId: 'first-patrol', stepId: 'reported' },
              { type: 'complete-quest', questId: 'first-patrol' },
              { type: 'set-flag', flag: 'bond.rigurd.trust-1', value: true },
              { type: 'add-gold', amount: 60 },
              { type: 'add-item', itemId: 'mana-drop', quantity: 1 }
            ]
          },
          {
            id: 'bye',
            label: 'Später',
            nextNodeId: 'bye'
          }
        ]
      },
      {
        id: 'accepted',
        speaker: 'Rigurd',
        text: 'Gut. Der Trainingspfad im Osten ist sicher genug, aber bleib wachsam.',
        choices: [{ id: 'end', label: 'Los geht’s' }]
      },
      {
        id: 'completed',
        speaker: 'Rigurd',
        text: 'Sehr gut. Tempest merkt sich zuverlässige Hilfe. Nimm diese kleine Belohnung.',
        choices: [{ id: 'end', label: 'Danke' }]
      },
      {
        id: 'bye',
        speaker: 'Rigurd',
        text: 'Sprich mich an, wenn du bereit bist.',
        choices: [{ id: 'end', label: 'Verstanden' }]
      }
    ]
  },
  {
    id: 'sora-act1',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Sora',
        text: 'Du bist aus dem Schutzkreis gefallen wie ein Stern ohne Himmel. Wenn du Tempest helfen willst, beginnen wir mit einem Namen — und mit Verantwortung.',
        choices: [
          {
            id: 'begin',
            label: 'Erinnerung ordnen',
            nextNodeId: 'begin',
            requirements: [{ questStatus: { questId: 'binding-of-ancestors', status: 'inactive' } }],
            effects: [
              { type: 'start-quest', questId: 'binding-of-ancestors' },
              { type: 'complete-quest-step', questId: 'binding-of-ancestors', stepId: 'awakening' },
              { type: 'set-flag', flag: 'story.intro.seen', value: true },
              { type: 'set-flag', flag: 'bond.sora.met', value: true }
            ]
          },
          {
            id: 'council',
            label: 'Rat versammeln',
            nextNodeId: 'council',
            requirements: [
              { questStatus: { questId: 'binding-of-ancestors', status: 'active' } },
              { flag: 'story.vael.ready' },
              { flag: 'story.lyrre.ready' },
              { notFlag: 'story.council.ready' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.council.ready', value: true },
              { type: 'complete-quest-step', questId: 'binding-of-ancestors', stepId: 'gather-council' }
            ]
          },
          {
            id: 'report-act1',
            label: 'Siegelbruch berichten',
            nextNodeId: 'completed',
            requirements: [
              { questStatus: { questId: 'binding-of-ancestors', status: 'active' } },
              { flag: 'story.boss.echo-defeated' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'binding-of-ancestors', stepId: 'report-sora' },
              { type: 'complete-quest', questId: 'binding-of-ancestors' },
              { type: 'set-flag', flag: 'story.act1.completed', value: true },
              { type: 'set-flag', flag: 'bond.sora.trust-1', value: true },
              { type: 'add-gold', amount: 180 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          {
            id: 'state',
            label: 'Was ist Tempest?',
            nextNodeId: 'state'
          }
        ]
      },
      {
        id: 'begin',
        speaker: 'Sora',
        text: 'Vael kann die Siegelspur lesen. Lyrre kennt die Grenze. Sprich mit beiden, dann öffnen wir den Weg in den Flüsterhain.',
        choices: [{ id: 'end', label: 'Ich sammle den Rat' }]
      },
      {
        id: 'council',
        speaker: 'Sora',
        text: 'Gut. Der Hain ist kein leerer Wald: Sporen reagieren auf Namen. Bleib zusammen, brich die Quelle und kehre zurück, bevor Mordrahn sie findet.',
        choices: [{ id: 'end', label: 'Zum Flüsterhain' }]
      },
      {
        id: 'completed',
        speaker: 'Sora',
        text: 'Dann ist Tempest mehr als ein Lager. Wir haben eine erste Geschichte, einen ersten Schwur — und einen Feind, der glaubt, Opfer seien Ordnung.',
        choices: [{ id: 'end', label: 'Tempest steht' }]
      },
      {
        id: 'state',
        speaker: 'Sora',
        text: 'Tempest ist noch klein: ein Feuerkreis, ein Vorratszelt, ein paar Mauern. Aber jeder Name hier ist ein Versprechen, nicht nur ein Etikett.',
        choices: [{ id: 'end', label: 'Verstanden' }]
      }
    ]
  },
  {
    id: 'vael-council',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Vael',
        text: 'Ich habe die Risse kartiert. Sie ziehen vom Flüsterhain bis zum alten Schrein — als hätte jemand die Bindung absichtlich unter Spannung gesetzt.',
        choices: [
          {
            id: 'analyze',
            label: 'Siegelspur analysieren',
            nextNodeId: 'ready',
            requirements: [
              { questStatus: { questId: 'binding-of-ancestors', status: 'active' } },
              { notFlag: 'story.vael.ready' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.vael.ready', value: true },
              { type: 'set-flag', flag: 'codex.seal-theory', value: true }
            ]
          },
          {
            id: 'after',
            label: 'Analyse wiederholen',
            nextNodeId: 'after',
            requirements: [{ flag: 'story.vael.ready' }]
          },
          {
            id: 'end',
            label: 'Später'
          }
        ]
      },
      {
        id: 'ready',
        speaker: 'Vael',
        text: 'Nimm diesen Befund zu Sora. Wenn der Hain reagiert, suche nach einem Fragment: Es sollte wie gefrorener Donner klingen.',
        choices: [{ id: 'end', label: 'Zum Rat' }]
      },
      {
        id: 'after',
        speaker: 'Vael',
        text: 'Die Signatur ist nicht wild. Jemand lenkt sie. Das macht mir mehr Angst als jede Bestie im Hain.',
        choices: [{ id: 'end', label: 'Ich passe auf' }]
      }
    ]
  },
  {
    id: 'lyrre-border',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Lyrre',
        text: 'Die Menschenpatrouillen bleiben auf Abstand, aber ihre Späher zählen unsere Feuer. Wenn Tempest wachsen will, muss es sichtbar stark und sichtbar fair sein.',
        choices: [
          {
            id: 'briefing',
            label: 'Grenzbericht hören',
            nextNodeId: 'ready',
            requirements: [
              { questStatus: { questId: 'binding-of-ancestors', status: 'active' } },
              { notFlag: 'story.lyrre.ready' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.lyrre.ready', value: true },
              { type: 'set-flag', flag: 'bond.lyrre.met', value: true }
            ]
          },
          {
            id: 'after',
            label: 'Grenze einschätzen',
            nextNodeId: 'after',
            requirements: [{ flag: 'story.lyrre.ready' }]
          },
          {
            id: 'end',
            label: 'Später'
          }
        ]
      },
      {
        id: 'ready',
        speaker: 'Lyrre',
        text: 'Ich begleite euch bis zum Hainrand. Wenn ein Mensch Monster nur als Horde sieht, muss Tempest das Gegenbeispiel werden.',
        choices: [{ id: 'end', label: 'Zum Rat' }]
      },
      {
        id: 'after',
        speaker: 'Lyrre',
        text: 'Noch greifen sie nicht an. Aber Misstrauen ist auch eine Waffe — sie braucht nur länger, bis man die Wunde sieht.',
        choices: [{ id: 'end', label: 'Verstanden' }]
      }
    ]
  }
] as const satisfies readonly DialogDefinition[];

export const NPCS = [
  {
    id: 'rigurd',
    name: 'Rigurd',
    mapId: 'tempest-start',
    position: { x: 3, y: 3 },
    dialogId: 'rigurd-intro',
    color: 0xe9c56c
  },
  {
    id: 'sora',
    name: 'Sora',
    mapId: 'tempest-start',
    position: { x: 2, y: 4 },
    dialogId: 'sora-act1',
    color: 0xff8a6b
  },
  {
    id: 'vael',
    name: 'Vael',
    mapId: 'tempest-start',
    position: { x: 7, y: 3 },
    dialogId: 'vael-council',
    color: 0x8fd7ff
  },
  {
    id: 'lyrre',
    name: 'Lyrre',
    mapId: 'tempest-start',
    position: { x: 8, y: 5 },
    dialogId: 'lyrre-border',
    color: 0x9ff0a4
  }
] as const satisfies readonly NpcDefinition[];

export const SHOPS = [
  {
    id: 'tempest-supply',
    name: 'Tempest-Vorrat',
    mapId: 'tempest-start',
    position: { x: 5, y: 3 },
    itemIds: ['healing-herb', 'mana-drop', 'traveler-cloak', 'tempest-charm'],
    buyMultiplier: 1,
    sellMultiplier: 0.5
  },
  {
    id: 'border-field-medic',
    name: 'Grenzsanitäter',
    mapId: 'tempest-start',
    position: { x: 2, y: 12 },
    itemIds: ['healing-herb', 'mana-drop'],
    buyMultiplier: 1.1,
    sellMultiplier: 0.45
  }
] as const satisfies readonly ShopDefinition[];

export const ENCOUNTERS = [
  {
    id: 'training-clearing',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 20, y: 12 },
    enemyIds: ['forest-slime', 'direwolf-pup'],
    chance: 1,
    victoryEffects: [
      { type: 'set-flag', flag: 'encounter.training-cleared', value: true },
      { type: 'complete-quest-step', questId: 'first-patrol', stepId: 'training-cleared' }
    ]
  },
  {
    id: 'east-grass',
    mapId: 'tempest-start',
    kind: 'random',
    bounds: { x: 14, y: 6, width: 8, height: 8 },
    enemyIds: ['forest-slime'],
    chance: 0.12
  },
  {
    id: 'marsh-border-watch',
    mapId: 'tempest-start',
    kind: 'random',
    bounds: { x: 2, y: 11, width: 6, height: 3 },
    enemyIds: ['spore-moth', 'orc-scout'],
    chance: 0.08
  },
  {
    id: 'whispering-grove-ambush',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 14, y: 8 },
    enemyIds: ['spore-moth', 'orc-scout'],
    chance: 1,
    requirements: [
      { flag: 'story.council.ready' },
      { notFlag: 'story.grove.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.grove.cleared', value: true },
      { type: 'set-flag', flag: 'codex.binding-of-ancestors', value: true },
      { type: 'complete-quest-step', questId: 'binding-of-ancestors', stepId: 'clear-grove' },
      { type: 'add-item', itemId: 'ancestor-seal-fragment', quantity: 1 }
    ]
  },
  {
    id: 'shrine-approach',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 21, y: 13 },
    enemyIds: ['lizardman-acolyte', 'mordrahn-echo'],
    chance: 1,
    requirements: [
      { flag: 'story.grove.cleared' },
      { notFlag: 'story.boss.echo-defeated' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.boss.echo-defeated', value: true },
      { type: 'set-flag', flag: 'codex.mordrahn', value: true },
      { type: 'complete-quest-step', questId: 'binding-of-ancestors', stepId: 'defeat-mordrahn-echo' }
    ]
  }
] as const satisfies readonly EncounterDefinition[];
