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
  },
  {
    id: 'border-escalation',
    title: 'Grenzfeuer',
    description: 'Halte die Sumpfgrenze, während Misstrauen und Mordrahns Vorhut die zerfallende Bindung ausnutzen.',
    actId: 'act-2',
    steps: [
      {
        id: 'muster',
        title: 'Zum Grenzlager',
        description: 'Lyrre meldet, dass Menschenpatrouillen an der Sumpfgrenze auflaufen.',
        locationId: 'border-camp'
      },
      {
        id: 'border-clash',
        title: 'Sumpfgrenze halten',
        description: 'Wirf die erste Patrouille an der Sumpfgrenze zurück.',
        locationId: 'marsh-frontier'
      },
      {
        id: 'read-fracture',
        title: 'Den zweiten Riss lesen',
        description: 'Bring Vael die Grenzfunde — die Bindung zerfällt schneller, und jemand aus Tempest hat geredet.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'break-vanguard',
        title: 'Mordrahns Vorhut brechen',
        description: 'Stell dich der Vorhut am Grenzriss, bevor sie ihn weiter aufreißt.',
        locationId: 'border-rift'
      },
      {
        id: 'report-act2',
        title: 'Bericht: Die Bindung bröckelt',
        description: 'Kehr zu Lyrre zurück und sichere die Grenze für den nächsten Schlag.',
        locationId: 'border-camp'
      }
    ],
    reward: { gold: 240, itemIds: ['mana-drop'] }
  },
  {
    id: 'ancestors-choice',
    title: 'Die Wahl der Ahnen',
    description: 'Schmiede ein Bündnis, stelle dich Mordrahn an der Bindung und entscheide über das Schicksal des Siegels.',
    actId: 'act-3',
    steps: [
      {
        id: 'rally',
        title: 'Das Bündnis schmieden',
        description: 'Vereine Tempests Monster und gemäßigte Menschen unter Soras Banner.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'breach',
        title: 'Mordrahns Linie durchbrechen',
        description: 'Schlag dich zur tiefen Bindung durch, bevor Mordrahn das Siegel neu schmiedet.',
        locationId: 'alliance-march'
      },
      {
        id: 'confront',
        title: 'Mordrahn stellen',
        description: 'Stell dich dem Hüter der Bindung — kein Echo, kein Stellvertreter mehr.',
        locationId: 'ancestor-heart'
      },
      {
        id: 'choose',
        title: 'Über die Bindung entscheiden',
        description: 'Zerstöre die Bindung (Freiheit) oder schmiede sie neu (Ordnung) — oder finde mit erfüllten Bindungen einen dritten Weg.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 400, itemIds: ['tempest-charm'] }
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
  },
  {
    id: 'marsh-frontier',
    name: 'Sumpfgrenze',
    kind: 'dungeon',
    mapId: 'tempest-start',
    position: { x: 5, y: 13 },
    description: 'Ein schlammiger Streifen zwischen Tempest und den Menschenwegen, wo Patrouillen aufeinandertreffen.',
    identity: 'Act-2-Schlachtfeld: enge Sichtlinien, Menschen-Monster-Spannung, erste echte Grenzgefechte.',
    unlockFlag: 'story.act2.started'
  },
  {
    id: 'border-rift',
    name: 'Grenzriss',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 22, y: 7 },
    description: 'Ein neuer Spalt in der Bindung, an dem Mordrahns Vorhut die Versiegelung weiter aufbricht.',
    identity: 'Act-2-Bosskampf: Mordrahns Vorhut und der sichtbare Beweis, dass die Bindung schneller zerfällt.',
    unlockFlag: 'story.fracture.read'
  },
  {
    id: 'alliance-march',
    name: 'Bündnismarsch',
    kind: 'dungeon',
    mapId: 'tempest-start',
    position: { x: 12, y: 7 },
    description: 'Der Vormarsch des Bündnisses aus Monstern und gemäßigten Menschen gegen Mordrahns Linie.',
    identity: 'Act-3-Durchbruch: gemeinsame Front, in der Tempests Bündnis zum ersten Mal Seite an Seite kämpft.',
    unlockFlag: 'story.act3.started'
  },
  {
    id: 'ancestor-heart',
    name: 'Herz der Bindung',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 15, y: 2 },
    description: 'Die tiefe Kammer, in der die Bindung der Ahnen pulst — und an der Mordrahn seine letzte Entscheidung erzwingen will.',
    identity: 'Act-3-Finale: Mordrahn selbst und die Wahl, die Bindung zu zerstören oder neu zu schmieden.',
    unlockFlag: 'story.breach.cleared'
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
  },
  {
    id: 'border-fires',
    title: 'Grenzfeuer',
    category: 'history',
    body: 'Mit Tempests Wachstum zählen Menschenspäher die Feuer der Monsterstadt. Aus Vorsicht wird Misstrauen, aus Misstrauen die erste Patrouillenlinie am Sumpf.',
    unlockFlag: 'story.act2.started'
  },
  {
    id: 'second-fracture',
    title: 'Der zweite Riss',
    category: 'history',
    body: 'Vaels Messungen sind eindeutig: die Bindung zerfällt schneller, als sie sollte — entlang der Grenze, als zöge jemand gezielt an den Fäden. Und jemand aus Tempest hat den Weg verraten.',
    unlockFlag: 'story.fracture.read'
  },
  {
    id: 'mordrahn-vanguard',
    title: 'Mordrahns Vorhut',
    category: 'people',
    body: 'Keine Projektion mehr, sondern eine reale Vorhut: gefesselte Geister und gebrochene Söldner, die den Riss weiter aufreißen, damit ihr Hüter „die Welt retten" kann.',
    unlockFlag: 'story.vanguard.broken'
  },
  {
    id: 'mordrahn-keeper',
    title: 'Der Hüter und sein Opfer',
    category: 'people',
    body: 'Mordrahn war der letzte Wächter der Bindung. Um den ewigen Zerfall aufzuhalten, wollte er sie mit einem Massenopfer neu schmieden — keine Bosheit, sondern eine Verzweiflung, die jeden Preis zahlt. Besiegt, aber nicht widerlegt: die Frage, was mit der Bindung geschehen soll, bleibt.',
    unlockFlag: 'story.mordrahn.defeated'
  },
  {
    id: 'ending-freedom',
    title: 'Ende: Freiheit',
    category: 'history',
    body: 'Die Bindung wurde zerschlagen. Monster und Menschen sind frei von der alten Ordnungsmagie — und von ihrem Schutz. Tempest beginnt ohne Netz: gefährlicher, aber selbstbestimmt.',
    unlockFlag: 'ending.freedom'
  },
  {
    id: 'ending-order',
    title: 'Ende: Ordnung',
    category: 'history',
    body: 'Die Bindung wurde neu geschmiedet — ohne Massenopfer, aber mit einem Preis, den Tempest selbst trägt. Sicherheit auf Kosten eines Teils der Freiheit, die man gerade erst gewonnen hatte.',
    unlockFlag: 'ending.order'
  },
  {
    id: 'ending-true',
    title: 'Wahres Ende: Geteilte Last',
    category: 'history',
    body: 'Weil die Bindungen zwischen Sora, Lyrre und dem Namenlosen hielten, fand Tempest einen dritten Weg: die alte Magie nicht zu zerstören und nicht zu erzwingen, sondern auf viele Schultern zu verteilen. Kein Opfer, keine Schutzlosigkeit — nur geteilte Verantwortung.',
    unlockFlag: 'ending.true'
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
            id: 'rally',
            label: 'Das Bündnis schmieden',
            nextNodeId: 'rally-node',
            requirements: [
              { flag: 'story.act2.completed' },
              { questStatus: { questId: 'ancestors-choice', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'ancestors-choice' },
              { type: 'complete-quest-step', questId: 'ancestors-choice', stepId: 'rally' },
              { type: 'set-flag', flag: 'story.act3.started', value: true }
            ]
          },
          {
            id: 'choose-destroy',
            label: 'Bindung zerstören (Freiheit)',
            nextNodeId: 'end-freedom',
            requirements: [
              { questStatus: { questId: 'ancestors-choice', status: 'active' } },
              { flag: 'story.mordrahn.defeated' },
              { notFlag: 'story.act3.completed' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'ancestors-choice', stepId: 'choose' },
              { type: 'complete-quest', questId: 'ancestors-choice' },
              { type: 'set-flag', flag: 'story.act3.completed', value: true },
              { type: 'set-flag', flag: 'ending.freedom', value: true },
              { type: 'add-gold', amount: 400 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          {
            id: 'choose-reforge',
            label: 'Bindung neu schmieden (Ordnung)',
            nextNodeId: 'end-order',
            requirements: [
              { questStatus: { questId: 'ancestors-choice', status: 'active' } },
              { flag: 'story.mordrahn.defeated' },
              { notFlag: 'story.act3.completed' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'ancestors-choice', stepId: 'choose' },
              { type: 'complete-quest', questId: 'ancestors-choice' },
              { type: 'set-flag', flag: 'story.act3.completed', value: true },
              { type: 'set-flag', flag: 'ending.order', value: true },
              { type: 'add-gold', amount: 400 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          {
            id: 'choose-true',
            label: 'Die Last teilen (nur mit starken Bindungen)',
            nextNodeId: 'end-true',
            requirements: [
              { questStatus: { questId: 'ancestors-choice', status: 'active' } },
              { flag: 'story.mordrahn.defeated' },
              { notFlag: 'story.act3.completed' },
              { flag: 'bond.sora.trust-1' },
              { flag: 'bond.lyrre.trust-1' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'ancestors-choice', stepId: 'choose' },
              { type: 'complete-quest', questId: 'ancestors-choice' },
              { type: 'set-flag', flag: 'story.act3.completed', value: true },
              { type: 'set-flag', flag: 'ending.true', value: true },
              { type: 'add-gold', amount: 600 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 2 }
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
      },
      {
        id: 'rally-node',
        speaker: 'Sora',
        text: 'Dann ist es Zeit. Monster und gemäßigte Menschen unter einem Banner — Mordrahn rechnet nicht damit. Brich seine Linie und stell ihn am Herz der Bindung.',
        choices: [{ id: 'end', label: 'Zum Bündnismarsch' }]
      },
      {
        id: 'end-freedom',
        speaker: 'Sora',
        text: 'Die Bindung ist zerschlagen. Wir sind frei — und schutzlos. Tempest beginnt ohne Netz, aber als unsere eigene Wahl. Das tragen wir gemeinsam.',
        choices: [{ id: 'end', label: 'Frei und verantwortlich' }]
      },
      {
        id: 'end-order',
        speaker: 'Sora',
        text: 'Wir haben sie neu geschmiedet — ohne Opfer, aber zu einem Preis, den wir selbst zahlen. Sicherheit, die uns ein Stück der Freiheit kostet. Auch das ist eine Gründung.',
        choices: [{ id: 'end', label: 'Geordnet, aber wachsam' }]
      },
      {
        id: 'end-true',
        speaker: 'Sora',
        text: 'Weil unsere Bindungen hielten, mussten wir nicht wählen zwischen Opfer und Schutzlosigkeit. Wir verteilen die alte Last auf viele Schultern — kein Held trägt sie allein. So bleibt Tempest.',
        choices: [{ id: 'end', label: 'Geteilte Last' }]
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
            id: 'read-fracture',
            label: 'Grenzfunde deuten',
            nextNodeId: 'fracture',
            requirements: [
              { questStatus: { questId: 'border-escalation', status: 'active' } },
              { flag: 'story.border.cleared' },
              { notFlag: 'story.fracture.read' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.fracture.read', value: true },
              { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'read-fracture' }
            ]
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
      },
      {
        id: 'fracture',
        speaker: 'Vael',
        text: 'Die Grenzfunde bestätigen es: die Bindung zerfällt schneller als natürlich — entlang genau der Route, die ihr genommen habt. Jemand aus Tempest hat geredet. Brich die Vorhut am Grenzriss, bevor sie ihn ganz aufreißt.',
        choices: [{ id: 'end', label: 'Zum Grenzriss' }]
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
            id: 'muster',
            label: 'Grenzlage hören',
            nextNodeId: 'muster',
            requirements: [
              { flag: 'story.act1.completed' },
              { questStatus: { questId: 'border-escalation', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'border-escalation' },
              { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'muster' },
              { type: 'set-flag', flag: 'story.act2.started', value: true }
            ]
          },
          {
            id: 'report-act2',
            label: 'Grenze sichern',
            nextNodeId: 'act2-done',
            requirements: [
              { questStatus: { questId: 'border-escalation', status: 'active' } },
              { flag: 'story.vanguard.broken' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'report-act2' },
              { type: 'complete-quest', questId: 'border-escalation' },
              { type: 'set-flag', flag: 'story.act2.completed', value: true },
              { type: 'set-flag', flag: 'bond.lyrre.trust-1', value: true },
              { type: 'add-gold', amount: 240 },
              { type: 'add-item', itemId: 'mana-drop', quantity: 1 }
            ]
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
      },
      {
        id: 'muster',
        speaker: 'Lyrre',
        text: 'Es ist soweit: Patrouillen sammeln sich an der Sumpfgrenze. Halt sie zurück, ohne ein Massaker zu provozieren — wir wollen eine Grenze, kein Feuer.',
        choices: [{ id: 'end', label: 'Zur Sumpfgrenze' }]
      },
      {
        id: 'act2-done',
        speaker: 'Lyrre',
        text: 'Die Vorhut ist gebrochen, die Grenze hält — fürs Erste. Aber wir wissen jetzt: jemand zieht an der Bindung, und jemand aus Tempest hat ihm den Weg gezeigt.',
        choices: [{ id: 'end', label: 'Tempest hält' }]
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
  },
  {
    id: 'marsh-frontier-clash',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 5, y: 13 },
    enemyIds: ['human-lancer', 'spore-moth'],
    chance: 1,
    requirements: [
      { flag: 'story.act2.started' },
      { notFlag: 'story.border.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.border.cleared', value: true },
      { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'border-clash' },
      { type: 'add-item', itemId: 'healing-herb', quantity: 2 }
    ]
  },
  {
    id: 'border-rift-vanguard',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 22, y: 7 },
    enemyIds: ['mordrahn-vanguard', 'human-lancer'],
    chance: 1,
    requirements: [
      { flag: 'story.fracture.read' },
      { notFlag: 'story.vanguard.broken' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.vanguard.broken', value: true },
      { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'break-vanguard' }
    ]
  },
  {
    id: 'alliance-breach',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 12, y: 7 },
    enemyIds: ['mordrahn-vanguard', 'human-lancer'],
    chance: 1,
    requirements: [
      { flag: 'story.act3.started' },
      { notFlag: 'story.breach.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.breach.cleared', value: true },
      { type: 'complete-quest-step', questId: 'ancestors-choice', stepId: 'breach' }
    ]
  },
  {
    id: 'mordrahn-confrontation',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 15, y: 2 },
    enemyIds: ['mordrahn'],
    chance: 1,
    requirements: [
      { flag: 'story.breach.cleared' },
      { notFlag: 'story.mordrahn.defeated' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.mordrahn.defeated', value: true },
      { type: 'set-flag', flag: 'codex.mordrahn-keeper', value: true },
      { type: 'complete-quest-step', questId: 'ancestors-choice', stepId: 'confront' }
    ]
  }
] as const satisfies readonly EncounterDefinition[];
