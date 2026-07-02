import type { Vec2 } from '../systems/overworld';

export type WorldLocationKind = 'city' | 'outpost' | 'dungeon' | 'shrine' | 'gateway';

export type WorldEffect =
  | { readonly type: 'set-flag'; readonly flag: string; readonly value: boolean }
  | { readonly type: 'start-quest'; readonly questId: string }
  | { readonly type: 'complete-quest-step'; readonly questId: string; readonly stepId: string }
  | { readonly type: 'complete-quest'; readonly questId: string }
  | { readonly type: 'add-item'; readonly itemId: string; readonly quantity: number }
  | { readonly type: 'add-gold'; readonly amount: number }
  // Heilt die aktive Party vollständig; wird für sichere Ruhepunkte genutzt.
  | { readonly type: 'restore-party' }
  // Nimmt eine Figur idempotent in die aktive Party auf (Story-Rekrutierung).
  | { readonly type: 'recruit-character'; readonly characterId: string };

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
  readonly bounds?: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly description: string;
  readonly identity: string;
  readonly unlockFlag?: string;
  // Scout-/Vorahnungsmarker: Ort darf bereits auf Karte/Minimap erscheinen,
  // bleibt aber für Begegnungen/Gateways weiter über unlockFlag/Requirements gesperrt.
  readonly revealFlag?: string;
  // Gateway in eine andere Region: Interaktion versetzt den Spieler dorthin.
  readonly travelTo?: { readonly mapId: string; readonly x: number; readonly y: number };
}

export interface LoreEntryDefinition {
  readonly id: string;
  readonly title: string;
  readonly lockedTitle?: string;
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
  // Optionale Story-Sichtbarkeit: Der NPC erscheint (und ist ansprechbar) erst, wenn
  // alle Anforderungen erfüllt sind. Fehlt das Feld, ist der NPC immer sichtbar.
  readonly requirements?: readonly WorldRequirement[];
}

export interface ShopDefinition {
  readonly id: string;
  readonly name: string;
  readonly mapId: string;
  readonly position: Vec2;
  readonly itemIds: readonly string[];
  readonly itemRequirements?: readonly {
    readonly itemId: string;
    readonly requirements: readonly WorldRequirement[];
  }[];
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
    id: 'slime-awakening',
    title: 'Schleim-Prolog',
    description: 'Erlebe Rimurus erste Schritte: Höhlenerwachen, Schwur, Goblindorf, Direwolf-Bedrohung und die erste Gründungsidee.',
    actId: 'prologue',
    steps: [
      {
        id: 'cave-awakening',
        title: 'In der Höhle erwachen',
        description: 'Ordne Rimurus neue Schleimform in der versiegelten Höhle.',
        locationId: 'sealed-cave'
      },
      {
        id: 'storm-dragon-oath',
        title: 'Den Sturmschwur schließen',
        description: 'Sprich mit Veldora und nimm den ersten Schwur mit nach draußen.',
        locationId: 'sealed-cave'
      },
      {
        id: 'goblin-plea',
        title: 'Die Bitte der Goblins hören',
        description: 'Rigurd sucht Schutz vor einem Direwolf-Rudel, das das Dorf bedrängt.',
        locationId: 'goblin-village'
      },
      {
        id: 'direwolf-pack',
        title: 'Das Rudel stoppen',
        description: 'Stell den Direwolf-Anführer an der östlichen Lichtung und zwinge das Rudel zum Rückzug.',
        locationId: 'direwolf-den'
      },
      {
        id: 'name-the-village',
        title: 'Die Siedlung benennen',
        description: 'Kehre zu Rigurd zurück und mach aus verstreuten Hütten den ersten Kern von Tempest.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 100, itemIds: ['wolf-fang-token'] }
  },
  {
    id: 'first-patrol',
    title: 'Erste Patrouille',
    description: 'Hilf Rigurd, den Rand des Jura-Walds zu sichern.',
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
    description: 'Führe Rigurd, Gobta, Ranga und Shuna durch den ersten Riss der alten Versiegelung.',
    actId: 'act-1',
    steps: [
      {
        id: 'awakening',
        title: 'Erwachen ohne Namen',
        description: 'Rigurd sammelt Tempest nach der Benennung und macht Rimurus Schwur zum ersten Stadtziel.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'gather-council',
        title: 'Rat versammeln',
        description: 'Hole Shunas Siegeldeutung, Gobtas Späherplan und Rangas Scoutbericht ein.',
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
        description: 'Stelle dich dem namenlosen Echo, bevor es das Siegel erneut verdreht.',
        locationId: 'ancestor-seal'
      },
      {
        id: 'report-sora',
        title: 'Gründung besiegeln',
        description: 'Kehre mit dem Siegelbruch zu Rigurd zurück.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 180, itemIds: ['tempest-charm'] }
  },
  {
    id: 'border-escalation',
    title: 'Grenzfeuer',
    description: 'Folge Rangas sicherer Spur ins Geistmoor, entschärfe den Grenzkonflikt und stoppe eine anonyme Siegelvorhut.',
    actId: 'act-2',
    steps: [
      {
        id: 'muster',
        title: 'Freiwillig ins Geistmoor',
        description: 'Nimm Gobtas freiwilligen Grenzauftrag an und nutze den Westpfad ins Geistmoor.',
        locationId: 'border-camp'
      },
      {
        id: 'border-clash',
        title: 'Sumpfgrenze deeskalieren',
        description: 'Stoppe die Patrouille und versorge danach ihre Verwundeten, statt den Konflikt eskalieren zu lassen.',
        locationId: 'marsh-frontier'
      },
      {
        id: 'read-fracture',
        title: 'Den zweiten Riss lesen',
        description: 'Kehre über den Westpfad zu Shuna zurück und lass die fremden Siegelspuren auswerten.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'break-vanguard',
        title: 'Vorhut der alten Ordnung brechen',
        description: 'Kehre ins Geistmoor zurück, stoppe die Vorhut und lass Ranga ihre anonyme Rückzugsspur sichern.',
        locationId: 'border-rift'
      },
      {
        id: 'report-act2',
        title: 'Bericht: Die Bindung bröckelt',
        description: 'Nutze den Rückweg nach Tempest und berichte Gobta von Deeskalation und Siegelspur.',
        locationId: 'border-camp'
      }
    ],
    reward: { gold: 240, itemIds: ['mana-drop'] }
  },
  {
    id: 'ancestors-choice',
    title: 'Die Wahl der Ahnen',
    description: 'Schmiede Tempests Bündnis, brich die Linie der alten Ordnung und entscheide über das Schicksal des Siegels.',
    actId: 'act-3',
    steps: [
      {
        id: 'rally',
        title: 'Den Bündnisrat versammeln',
        description: 'Starte den freiwilligen Schlusszug nach Band 3 und hole Shunas Ritualplan, Gobtas Grenzroute und Rangas Spur ein.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'breach',
        title: 'Die Linie der alten Ordnung brechen',
        description: 'Führe das Bündnis aus Monstern und gemäßigten Menschen gemeinsam zum Bindungsherz.',
        locationId: 'alliance-march'
      },
      {
        id: 'confront',
        title: 'Den Hüter stellen',
        description: 'Stell dich dem Hüter der alten Ordnung — kein Echo, kein Stellvertreter mehr.',
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
  },
  {
    id: 'bounty-bog',
    title: 'Kopfgeld: Sumpfschrecken',
    description: 'Rigurds Kopfgeld auf das Vieh, das die Wege am Westsumpf unsicher macht.',
    steps: [
      {
        id: 'accept-bog',
        title: 'Kopfgeld annehmen',
        description: 'Nimm Rigurds Auftrag an, den Sumpfschrecken zu erlegen.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'hunt-bog',
        title: 'Sumpfschrecken erlegen',
        description: 'Stell und erlege das Vieh am Westsumpf.',
        locationId: 'west-bog'
      },
      {
        id: 'report-bog',
        title: 'Kopfgeld kassieren',
        description: 'Bring Rigurd den Beweis und kassiere das Kopfgeld.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 120, itemIds: ['mana-drop'] }
  },
  {
    id: 'relic-echoes',
    title: 'Streunende Echos',
    description: 'Shuna bittet, die umherirrenden Geist-Echos an der alten Bruchkante zu bannen, bevor sie die Bindung weiter stören.',
    steps: [
      {
        id: 'accept-echo',
        title: 'Auftrag annehmen',
        description: 'Hör dir Shunas Bitte an und mach dich zur Bruchkante auf.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'clear-echo',
        title: 'Echo bannen',
        description: 'Bann das streunende Echo an der nördlichen Bruchkante.',
        locationId: 'north-rift'
      },
      {
        id: 'report-echo',
        title: 'Shuna berichten',
        description: 'Bring Shuna die Messdaten des gebannten Echos.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 90, itemIds: ['healing-herb'] }
  },
  {
    id: 'border-runner',
    title: 'Grenzgänger',
    description: 'Gobta bittet, einen Deserteurstrupp an der Osthandelsroute abzufangen — möglichst ohne neue Feindschaft zu säen.',
    steps: [
      {
        id: 'accept-deserter',
        title: 'Auftrag annehmen',
        description: 'Hör dir Gobtas Bitte an und zieh zur Osthandelsroute.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'stop-deserter',
        title: 'Deserteure stellen',
        description: 'Fang den Deserteurstrupp an der Osthandelsroute ab.',
        locationId: 'east-route'
      },
      {
        id: 'report-deserter',
        title: 'Gobta berichten',
        description: 'Bring Gobta Nachricht, dass die Route wieder sicher ist.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 110, itemIds: ['mana-drop'] }
  },
  {
    id: 'apex-bounty',
    title: 'Apex: Urdirewolf',
    description: 'Ein uralter Urdirewolf ist erwacht — Rigurds gefährlichstes Kopfgeld, nur für gestählte Helden.',
    steps: [
      {
        id: 'accept-apex',
        title: 'Apex-Kopfgeld annehmen',
        description: 'Nimm Rigurds gefährlichstes Kopfgeld an.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'hunt-apex',
        title: 'Urdirewolf erlegen',
        description: 'Stell und erlege den Urdirewolf in der Südsenke.',
        locationId: 'south-hollow'
      },
      {
        id: 'report-apex',
        title: 'Apex-Kopfgeld kassieren',
        description: 'Bring Rigurd den Beweis des Apex-Jagderfolgs.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 300, itemIds: ['tempest-charm'] }
  },
  {
    id: 'marsh-cleansing',
    title: 'Fäulnis im Moor',
    description: 'Moorhüterin Eir bittet, eine schwärende Blüte in der Nebelmoor-Tiefe zu tilgen, die das Geistmoor vergiftet.',
    steps: [
      {
        id: 'accept-cleanse',
        title: 'Eirs Bitte annehmen',
        description: 'Hör dir die Moorhüterin an und mach dich in die Nebelmoor-Tiefe auf.',
        locationId: 'marsh-mire'
      },
      {
        id: 'cleanse-blight',
        title: 'Die Fäulnis tilgen',
        description: 'Zerstör die schwärende Blüte und ihre Wächter in der Nebelmoor-Tiefe.',
        locationId: 'marsh-mire'
      },
      {
        id: 'report-cleanse',
        title: 'Eir berichten',
        description: 'Kehr zur Moorhüterin zurück und melde, dass das Moor wieder atmet.',
        locationId: 'marsh-mire'
      }
    ],
    reward: { gold: 130, itemIds: ['tempest-charm'] }
  },
  {
    id: 'shrine-vigil',
    title: 'Wache am Schrein',
    description: 'Schreinwächter Kael bittet, ein tobendes Sturmecho zu bannen, das von den Schreinterrassen Besitz ergriffen hat.',
    steps: [
      {
        id: 'accept-vigil',
        title: 'Kaels Wache übernehmen',
        description: 'Hör dem Schreinwächter zu und steig zu den Terrassen auf.',
        locationId: 'shrine-summit'
      },
      {
        id: 'banish-echo',
        title: 'Das Sturmecho bannen',
        description: 'Stell dich dem tobenden Sturmecho auf der Westterrasse und löse seine Bindung.',
        locationId: 'shrine-summit'
      },
      {
        id: 'report-vigil',
        title: 'Kael berichten',
        description: 'Kehr zum Schreinwächter zurück und melde, dass der Wind wieder still steht.',
        locationId: 'shrine-summit'
      }
    ],
    reward: { gold: 160, itemIds: ['tempest-charm'] }
  },
  {
    id: 'dwargon-craft',
    title: 'Handwerk aus Dwargon',
    description: 'Reise ins Bewaffnete Königreich Dwargon, schlichte den Zwischenfall um Kaijin und gewinne Tempest die Schmiedekunst der Zwerge.',
    steps: [
      {
        id: 'enter',
        title: 'Dwargon betreten',
        description: 'Folge dem Bergpfad aus dem Jura-Wald in die Schmiedestadt Dwargon.',
        locationId: 'dwargon-market'
      },
      {
        id: 'judgment',
        title: 'Gazels Urteil hören',
        description: 'Tritt im Thronsaal vor König Gazel Dwargo und vertritt Kaijins Sache.',
        locationId: 'dwargon-throne'
      },
      {
        id: 'smiths',
        title: 'Kaijin gewinnen',
        description: 'Lade Kaijin und seine Brüder ein, Tempests Schmiede aufzubauen.',
        locationId: 'dwargon-market'
      }
    ],
    reward: { gold: 120, itemIds: ['magisteel'] }
  },
  {
    id: 'blumund-guild',
    title: 'Tempest tritt vor die Welt',
    description: 'Stell Tempest der Freien Gilde von Blumund vor, gewinne Fuzes Vertrauen und eröffne einen verlässlichen Handelsweg zu den Menschen.',
    steps: [
      {
        id: 'register',
        title: 'Bei Fuze vorsprechen',
        description: 'Melde Tempests Gesandtschaft im Gildenhaus von Blumund an.',
        locationId: 'blumund-guildhall'
      },
      {
        id: 'route-report',
        title: 'Den Jura-Bericht abgleichen',
        description: 'Sprich mit Kaval, Eren und Gido über die sicheren Routen durch den Jura-Wald.',
        locationId: 'blumund-market'
      },
      {
        id: 'trade-seal',
        title: 'Das Handelsabkommen besiegeln',
        description: 'Kehr zu Fuze zurück und öffne Blumunds Markt für Tempests Waren.',
        locationId: 'blumund-guildhall'
      }
    ],
    reward: { gold: 180, itemIds: ['full-potion'] }
  },
  {
    id: 'geld-disaster',
    title: 'Der hungernde Heerzug',
    description: 'Die Dryade Treyni warnt vor einer Ork-Armee, die der Hunger in den Jura-Wald treibt. Stellt euch dem Orc-Disaster „Geld" und schmiedet aus dem Sieg ein Bündnis.',
    steps: [
      {
        id: 'plea',
        title: 'Treynis Warnung hören',
        description: 'Triff die Waldhüterin Treyni am Rand des Schlachtfelds und höre von Gelmuds Namensschema.',
        locationId: 'battlefield-front'
      },
      {
        id: 'march',
        title: 'Die Ork-Vorhut brechen',
        description: 'Halte die anstürmende Ork-Vorhut auf dem Jura-Schlachtfeld auf.',
        locationId: 'battlefield-front'
      },
      {
        id: 'geld',
        title: 'Den Orc-Disaster stellen',
        description: 'Stelle dich „Geld", dem hungernden Katastrophen-Ork, im Herzen der Schlacht.',
        locationId: 'battlefield-heart'
      },
      {
        id: 'federation',
        title: 'Die Föderation gründen',
        description: 'Vereine die Waldvölker zur Jura-Tempest-Föderation.',
        locationId: 'battlefield-heart'
      }
    ],
    reward: { gold: 320, itemIds: ['famine-charm'] }
  },
  {
    id: 'lizard-alliance',
    title: 'Das Bündnis der Echsenmenschen',
    description: 'Im Echsen-Sumpf warnt Kommandantin Souka vor der Ork-Armee. Doch erst muss der überhebliche Gabiru gedemütigt werden, ehe die Echsenmenschen ein Bündnis schließen.',
    steps: [
      {
        id: 'parley',
        title: 'Souka anhören',
        description: 'Triff Kommandantin Souka am Rand des Echsen-Sumpfs.',
        locationId: 'lizard-marsh-camp'
      },
      {
        id: 'humble',
        title: 'Gabirus Hochmut brechen',
        description: 'Stell den ruhmsüchtigen Gabiru und seine Wache im Herzen des Sumpfs.',
        locationId: 'lizard-marsh-heart'
      },
      {
        id: 'ally',
        title: 'Das Bündnis besiegeln',
        description: 'Kehre zu Souka zurück und schließe das Bündnis gegen die Orks.',
        locationId: 'lizard-marsh-camp'
      }
    ],
    reward: { gold: 200, itemIds: ['tempest-charm'] }
  },
  {
    id: 'shizu-vow',
    title: 'Shizus Schwur',
    description: 'In der Glutgrotte ringt die Andersweltlerin Shizu mit dem Flammengeist Ifrit — angestachelt von einem maskierten Majin. Befreie sie und trage ihren letzten Schwur weiter.',
    steps: [
      {
        id: 'meet-shizu',
        title: 'Shizu treffen',
        description: 'Triff die maskierte Andersweltlerin Shizu am Eingang der Glutgrotte.',
        locationId: 'ember-hollow-entrance'
      },
      {
        id: 'masked-majin',
        title: 'Den maskierten Majin vertreiben',
        description: 'Stell den maskierten Majin, der Ifrit gegen Shizu aufstachelt.',
        locationId: 'ember-hollow-core'
      },
      {
        id: 'ifrit',
        title: 'Ifrit bezwingen',
        description: 'Bezwinge den entfesselten Flammengeist Ifrit und befreie Shizu.',
        locationId: 'ember-hollow-core'
      },
      {
        id: 'vow',
        title: 'Shizus Schwur tragen',
        description: 'Nimm Shizu auf ihren Wunsch in dich auf und schwöre, ihre Schüler zu schützen.',
        locationId: 'ember-hollow-entrance'
      }
    ],
    reward: { gold: 260, itemIds: ['spirit-ember'] }
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
    identity: 'Sicherer Hub: Dialoge, Shops, Bindungen und Questentscheidungen.',
    unlockFlag: 'story.tempest.named'
  },
  {
    id: 'tempest-council-plaza',
    name: 'Ratsplatz von Tempest',
    kind: 'outpost',
    mapId: 'tempest-start',
    position: { x: 4, y: 5 },
    description: 'Ein befestigter Feuerkreis, an dem Rigurd die ersten Aufgaben der jungen Stadt sammelt.',
    identity: 'Post-Prolog-Hubmarker: macht den Rat von Tempest als Zentrum der Band-2-Route sichtbar.',
    unlockFlag: 'story.slime-prologue.completed'
  },
  {
    id: 'tempest-name-stone',
    name: 'Namensstein',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 5, y: 6 },
    description: 'Ein einfacher Stein mit dem neuen Stadtnamen — noch roh, aber für alle sichtbar.',
    identity: 'Post-Prolog-Hubmarker: zeigt, dass aus dem Notlager eine benannte Siedlung geworden ist.',
    unlockFlag: 'story.tempest.named'
  },
  {
    id: 'tempest-palisade',
    name: 'Tempest-Palisade',
    kind: 'outpost',
    mapId: 'tempest-start',
    position: { x: 6, y: 5 },
    description: 'Frisch gesetzte Holzpfähle und Wachtücher markieren den Übergang von Lager zu Stadt.',
    identity: 'Post-Prolog-Hubmarker: weniger Notlager, mehr sichtbare Siedlungsstruktur.',
    unlockFlag: 'story.slime-prologue.completed'
  },
  {
    id: 'tempest-rest-camp',
    name: 'Tempest-Lager',
    kind: 'outpost',
    mapId: 'tempest-start',
    position: { x: 7, y: 7 },
    description: 'Ein geschützter Lagerkreis mit Wasser, Decken und genug Ruhe für kurze Absprachen.',
    identity: 'Ruhepunkt: Heilen, Speichern und kurze optionale Partygespräche zwischen den Hauptbeats.',
    unlockFlag: 'story.slime-prologue.completed'
  },
  {
    id: 'tempest-council-board',
    name: 'Tafel des Rates',
    kind: 'city',
    mapId: 'tempest-start',
    position: { x: 4, y: 6 },
    description: 'Auf der ersten Ratstafel stehen Versorgung, Hainroute und Shunas Siegelzeichen nebeneinander.',
    identity: 'Band-2-Hubmarker: Der Rat verändert Tempest sichtbar von einer Ansammlung Hütten zu einer organisierten Stadt.',
    unlockFlag: 'story.council.ready'
  },
  {
    id: 'tempest-echo-ward',
    name: 'Siegelwacht',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 5, y: 7 },
    description: 'Ein kleiner Schutzstein erinnert an das gebrochene Echo und markiert Tempests erste gemeinsam bestandene Krise.',
    identity: 'Band-2-Abschlussmarker: Das Ahnensiegel wird Teil von Tempests sichtbarer Geschichte.',
    unlockFlag: 'story.act1.completed'
  },
  {
    id: 'tempest-kijin-quarter',
    name: 'Kijin-Viertel',
    kind: 'city',
    mapId: 'tempest-start',
    position: { x: 12, y: 5 },
    description: 'Geschwungene Dächer, Übungsplätze und Shunas Webzeichen geben den Kijin erstmals einen eigenen Stadtteil.',
    identity: 'Jungstadt-Marker: Die benannten Oger prägen Tempests Architektur und Alltag sichtbar.',
    unlockFlag: 'story.kijin.named'
  },
  {
    id: 'tempest-dwargon-quarter',
    name: 'Dwargon-Werkviertel',
    kind: 'city',
    mapId: 'tempest-start',
    position: { x: 15, y: 5 },
    description: 'Kaijins kompakte Magisteel-Essen und steinerne Werkhallen verbinden Dwargons Handwerk mit Tempests Holzbau.',
    identity: 'Jungstadt-Marker: Das Bündnis mit Kaijins Schmieden verändert Tempests Silhouette und Versorgung.',
    unlockFlag: 'faction.dwargon.allied'
  },
  {
    id: 'sealed-cave',
    name: 'Versiegelte Höhle',
    kind: 'dungeon',
    mapId: 'sealed-cave',
    position: { x: 7, y: 2 },
    description: 'Eine stille Höhle voller Kristalle, Wasseradern und einer gewaltigen versiegelten Präsenz.',
    identity: 'Prolog-Ort: Schleim-Erwachen, erster Schwur und Tutorial für Storyflags.'
  },
  {
    id: 'goblin-village',
    name: 'Goblindorf',
    kind: 'outpost',
    mapId: 'goblin-village',
    position: { x: 8, y: 6 },
    description: 'Ein verletzliches Dorf aus einfachen Hütten, das Schutz vor einem Direwolf-Rudel sucht.',
    identity: 'Prolog-Hub: Bitte der Goblins und Übergang vom Überleben zur Gemeinschaft.',
    unlockFlag: 'story.storm-dragon.oath'
  },
  {
    id: 'direwolf-den',
    name: 'Direwolf-Lichtung',
    kind: 'dungeon',
    mapId: 'direwolf-den',
    position: { x: 9, y: 4 },
    description: 'Eine windige Lichtung, auf der das Rudel seine Angriffe sammelt.',
    identity: 'Prolog-Bossort: Direwolf-Anführer plus Rudeldruck als erster echter Prüfstein.',
    unlockFlag: 'story.goblin.plea'
  },
  {
    id: 'cave-gate-goblin',
    name: 'Höhlenausgang zum Goblindorf',
    kind: 'gateway',
    mapId: 'sealed-cave',
    position: { x: 14, y: 7 },
    description: 'Ein heller Spalt am Ende des Kristallpfads. Nach dem Sturmschwur weist er sichtbar zur Oberfläche.',
    identity: 'Prolog-Reisepunkt: führt nach dem Schwur direkt zum Goblindorf.',
    unlockFlag: 'story.storm-dragon.oath',
    travelTo: { mapId: 'goblin-village', x: 2, y: 6 }
  },
  {
    id: 'goblin-gate-cave',
    name: 'Pfad zurück zur Höhle',
    kind: 'gateway',
    mapId: 'goblin-village',
    position: { x: 1, y: 6 },
    description: 'Der kurze Rückweg zur versiegelten Höhle.',
    identity: 'Prolog-Reisepunkt: zurück zu Veldoras Dialoganker.',
    travelTo: { mapId: 'sealed-cave', x: 13, y: 7 }
  },
  {
    id: 'goblin-gate-direwolf',
    name: 'Ostpfad zur Direwolf-Lichtung',
    kind: 'gateway',
    mapId: 'goblin-village',
    position: { x: 16, y: 6 },
    description: 'Ein zertrampelter Ostpfad mit frischen Wolfsspuren.',
    identity: 'Prolog-Reisepunkt: leitet nach Rigurds Bitte klar zur Bossarena.',
    unlockFlag: 'story.goblin.plea',
    travelTo: { mapId: 'direwolf-den', x: 2, y: 6 }
  },
  {
    id: 'direwolf-gate-goblin',
    name: 'Rückweg zum Goblindorf',
    kind: 'gateway',
    mapId: 'direwolf-den',
    position: { x: 1, y: 6 },
    description: 'Der Rückweg aus der Lichtung, mit dem Rudel im Nacken oder im Pakt.',
    identity: 'Prolog-Reisepunkt: zurück zu Rigurd und zur Benennung.',
    travelTo: { mapId: 'goblin-village', x: 15, y: 6 }
  },
  {
    id: 'goblin-gate-tempest',
    name: 'Pfad nach Tempest',
    kind: 'gateway',
    mapId: 'goblin-village',
    position: { x: 8, y: 10 },
    description: 'Der neue Hauptpfad von der benannten Siedlung in den Tempest-Hain.',
    identity: 'Post-Prolog-Reisepunkt: öffnet den Übergang in die bestehende Hauptregion.',
    unlockFlag: 'story.slime-prologue.completed',
    travelTo: { mapId: 'tempest-start', x: 3, y: 5 }
  },
  {
    id: 'gate-to-goblin-village',
    name: 'Pfad zum Goblindorf',
    kind: 'gateway',
    mapId: 'tempest-start',
    position: { x: 3, y: 6 },
    description: 'Der Rückweg zum ersten Dorfkern, aus dem Tempest gewachsen ist.',
    identity: 'Post-Prolog-Reisepunkt: zurück zu Rigurd, Dorfhilfe und frühen Paktfolgen.',
    unlockFlag: 'story.slime-prologue.completed',
    travelTo: { mapId: 'goblin-village', x: 8, y: 9 }
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
    bounds: { x: 13, y: 7, width: 4, height: 3 },
    description: 'Ein dichter Hain, dessen Sporen auf Namen und magische Signaturen reagieren.',
    identity: 'Dungeon-Identität: Gift, Sichtlinien, Abkürzungen und Pflanzen, die auf Storyflags reagieren.',
    unlockFlag: 'story.council.ready',
    revealFlag: 'scout.whispering-grove'
  },
  {
    id: 'ancestor-seal',
    name: 'Ahnensiegel',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 21, y: 13 },
    description: 'Ein gebrochener Schrein, an dem die Bindung der Ahnen hörbar knirscht.',
    identity: 'Boss-Ort: klare Arena, Siegelmechanik und ein namenloser Gegenzug der alten Ordnung.',
    unlockFlag: 'story.grove.cleared'
  },
  {
    id: 'marsh-frontier',
    name: 'Sumpfgrenze',
    kind: 'dungeon',
    mapId: 'spirit-marsh',
    position: { x: 5, y: 11 },
    description: 'Rangas markierter Grenzpfad im Geistmoor, an dem Tempest eine Menschenpatrouille ohne weitere Opfer stoppt.',
    identity: 'Band-3-Deeskalation: Kampf beenden, Waffen senken und Verwundete versorgen.',
    unlockFlag: 'story.act2.started',
    revealFlag: 'scout.border-route'
  },
  {
    id: 'border-rift',
    name: 'Grenzriss',
    kind: 'shrine',
    mapId: 'spirit-marsh',
    position: { x: 18, y: 4 },
    description: 'Ein neuer Spalt im Geistmoor, an dem eine namenlose Siegelvorhut die Bindung weiter aufbricht.',
    identity: 'Band-3-Bosskampf: anonyme Vorhut, indirekte Gegenspielerspur und Rangas Auswertung.',
    unlockFlag: 'story.fracture.read'
  },
  {
    id: 'alliance-march',
    name: 'Bündnismarsch',
    kind: 'dungeon',
    mapId: 'tempest-start',
    position: { x: 12, y: 7 },
    description: 'Der Vormarsch des Bündnisses aus Monstern und gemäßigten Menschen gegen die Linie der alten Ordnung.',
    identity: 'Band-4-Durchbruch: gemeinsame Front, in der Tempests Bündnis zum ersten Mal Seite an Seite kämpft.',
    unlockFlag: 'story.alliance.council-ready'
  },
  {
    id: 'ancestor-heart',
    name: 'Bindungsherz',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 15, y: 2 },
    description: 'Die tiefe Kammer, in der die Bindung der Ahnen pulst — und an der der Hüter der alten Ordnung die letzte Entscheidung erzwingen will.',
    identity: 'Band-4-Finale: der Hüter selbst und die Wahl, die Bindung zu zerstören, neu zu schmieden oder die Last zu teilen.',
    unlockFlag: 'story.breach.cleared'
  },
  {
    id: 'west-bog',
    name: 'Westsumpf',
    kind: 'dungeon',
    mapId: 'tempest-start',
    position: { x: 2, y: 8 },
    description: 'Ein zäher Morast westlich der Stadt, in dem ein Sumpfschrecken die Handelspfade unsicher macht.',
    identity: 'Optionaler Jagdort: Kopfgeld-Begegnung mit dem Sumpfschrecken.',
    unlockFlag: 'sidequest.bog.started'
  },
  {
    id: 'north-rift',
    name: 'Nördliche Bruchkante',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 8, y: 2 },
    description: 'Eine alte Bruchkante im Norden, an der streunende Geist-Echos der Bindung umherirren.',
    identity: 'Optionaler Bannort: ein streunendes Echo, das Shunas Deutung stört.',
    unlockFlag: 'sidequest.echo.started'
  },
  {
    id: 'east-route',
    name: 'Osthandelsroute',
    kind: 'outpost',
    mapId: 'tempest-start',
    position: { x: 20, y: 5 },
    description: 'Die östliche Handelsroute, auf der ein Deserteurstrupp Reisende schikaniert.',
    identity: 'Optionaler Abfangort: Deserteur-Söldner an der Grenze.',
    unlockFlag: 'sidequest.deserter.started'
  },
  {
    id: 'south-hollow',
    name: 'Südsenke',
    kind: 'dungeon',
    mapId: 'tempest-start',
    position: { x: 13, y: 13 },
    description: 'Eine tiefe Senke im Süden, in der ein uralter Urdirewolf sein Revier hält.',
    identity: 'Optionaler Apex-Bosskampf (Postgame): der Urdirewolf.',
    unlockFlag: 'sidequest.apex.started'
  },
  {
    id: 'gate-to-marsh',
    name: 'Pfad ins Geistmoor',
    kind: 'gateway',
    mapId: 'tempest-start',
    position: { x: 1, y: 7 },
    description: 'Rangas Geruchsmarken führen vom westlichen Hainrand sicher ins Geistmoor.',
    identity: 'Band-3-Hinweg: öffnet erst nach freiwilliger Annahme von Grenzfeuer.',
    unlockFlag: 'story.act2.started',
    travelTo: { mapId: 'spirit-marsh', x: 2, y: 2 }
  },
  {
    id: 'gate-to-tempest',
    name: 'Pfad nach Tempest',
    kind: 'gateway',
    mapId: 'spirit-marsh',
    position: { x: 1, y: 2 },
    description: 'Rangas doppelte Kerben markieren den jederzeit offenen Rückweg nach Tempest.',
    identity: 'Band-3-Rückweg: für Shunas Analyse und Gobtas Abschlussbericht.',
    travelTo: { mapId: 'tempest-start', x: 2, y: 7 }
  },
  {
    id: 'marsh-mire',
    name: 'Nebelmoor-Tiefe',
    kind: 'dungeon',
    mapId: 'spirit-marsh',
    position: { x: 10, y: 2 },
    description: 'Das Herz des Geistmoors, in dem Sporen und alte Echos dichter werden.',
    identity: 'Erkundungszone des Geistmoors: zähe Begegnungen und Stimmung.'
  },
  {
    id: 'gate-to-highlands',
    name: 'Aufstieg zum Schrein',
    kind: 'gateway',
    mapId: 'spirit-marsh',
    position: { x: 20, y: 7 },
    description: 'Ein steiler Pfad am Ostrand des Moors, der ins Geisterschrein-Hochland führt.',
    identity: 'Reisepunkt: Übergang in die dritte Region (Geisterschrein).',
    travelTo: { mapId: 'spirit-highlands', x: 2, y: 7 }
  },
  {
    id: 'gate-to-marsh-back',
    name: 'Abstieg ins Moor',
    kind: 'gateway',
    mapId: 'spirit-highlands',
    position: { x: 1, y: 7 },
    description: 'Der Rückweg vom Hochland hinab ins Geistmoor.',
    identity: 'Reisepunkt: zurück ins Geistmoor.',
    travelTo: { mapId: 'spirit-marsh', x: 19, y: 7 }
  },
  {
    id: 'shrine-summit',
    name: 'Schreingipfel',
    kind: 'shrine',
    mapId: 'spirit-highlands',
    position: { x: 12, y: 3 },
    description: 'Die windumtoste Spitze des Geisterschreins, an der die ältesten Echos der Bindung nachhallen.',
    identity: 'Erkundungs-/Bossort des Hochlands: stärkste optionale Begegnungen.'
  },
  {
    id: 'gate-to-dwargon',
    name: 'Bergpfad nach Dwargon',
    kind: 'gateway',
    mapId: 'tempest-start',
    position: { x: 22, y: 8 },
    description: 'Ein befestigter Handelspfad, der vom Ostrand des Jura-Walds zum Bewaffneten Königreich Dwargon führt.',
    identity: 'Reisepunkt: Übergang in die Band-2-Nebenregion Dwargon (Handel & Schmiedekunst).',
    // Öffnet, sobald die Kijin benannt sind — Kurobes Schmiedekunst weckt das
    // Interesse an Dwargons Esse.
    unlockFlag: 'story.kijin.named',
    travelTo: { mapId: 'dwargon', x: 2, y: 7 }
  },
  {
    id: 'dwargon-gate-tempest',
    name: 'Tor zurück zum Jura-Wald',
    kind: 'gateway',
    mapId: 'dwargon',
    position: { x: 1, y: 7 },
    description: 'Das große Steintor Dwargons, durch das der Pfad zurück in den Jura-Wald führt.',
    identity: 'Reisepunkt: zurück in den Jura-Wald.',
    travelTo: { mapId: 'tempest-start', x: 22, y: 8 }
  },
  {
    id: 'dwargon-market',
    name: 'Dwargon-Werkstattviertel',
    kind: 'city',
    mapId: 'dwargon',
    position: { x: 9, y: 7 },
    bounds: { x: 5, y: 3, width: 12, height: 8 },
    description: 'Ambosse hämmern, Essen glühen: das Handwerksherz Dwargons mit Schmiede, Apotheke und Handelskontor.',
    identity: 'Sicherer Stadt-Hub: Zwergenschmiede, Magisteel-Handel und Kaijins Werkstatt.'
  },
  {
    id: 'dwargon-throne',
    name: 'Dwargon-Thronsaal',
    kind: 'city',
    mapId: 'dwargon',
    position: { x: 12, y: 4 },
    description: 'Eine wuchtige Halle aus Stein und Magisteel, in der König Gazel Dwargo Recht spricht.',
    identity: 'Gerichts-/Story-Ort: Gazels Urteil im Zwischenfall um Kaijin.'
  },
  {
    id: 'gate-to-blumund',
    name: 'Handelsstraße nach Blumund',
    kind: 'gateway',
    mapId: 'tempest-start',
    position: { x: 1, y: 2 },
    description: 'Eine bewachte Straße führt aus dem Jura-Wald in das kleine Menschenkönigreich Blumund.',
    identity: 'Reisepunkt: erster geordneter Menschenkontakt über die Freie Gilde.',
    // Erst eine gegründete Föderation kann als politischer Handelspartner auftreten.
    unlockFlag: 'faction.orcs.joined',
    travelTo: { mapId: 'blumund', x: 2, y: 7 }
  },
  {
    id: 'blumund-gate-tempest',
    name: 'Straße zurück zum Jura-Wald',
    kind: 'gateway',
    mapId: 'blumund',
    position: { x: 1, y: 7 },
    description: 'Die westliche Handelsstraße führt zurück zur Jura-Tempest-Föderation.',
    identity: 'Reisepunkt: zurück in den Jura-Wald.',
    travelTo: { mapId: 'tempest-start', x: 1, y: 2 }
  },
  {
    id: 'blumund-guildhall',
    name: 'Freie Gilde von Blumund',
    kind: 'city',
    mapId: 'blumund',
    position: { x: 9, y: 3 },
    description: 'Im nüchternen Gildenhaus laufen Aufträge, Routenberichte und Nachrichten der Menschenreiche zusammen.',
    identity: 'Diplomatie-Ort: Fuzes Prüfung und das erste offizielle Abkommen mit Tempest.'
  },
  {
    id: 'blumund-market',
    name: 'Blumunder Markt',
    kind: 'city',
    mapId: 'blumund',
    position: { x: 10, y: 7 },
    bounds: { x: 7, y: 5, width: 8, height: 4 },
    description: 'Händler, Reisende und Abenteurer tauschen Heilmittel, Reisebedarf und Nachrichten aus.',
    identity: 'Sicherer Handels-Hub und Treffpunkt der drei Jura-Abenteurer.'
  },
  {
    id: 'gate-to-battlefield',
    name: 'Marschpfad zum Heerfeld',
    kind: 'gateway',
    mapId: 'tempest-start',
    position: { x: 22, y: 2 },
    description: 'Ein breitgetretener Heerpfad, der nach Norden zum offenen Jura-Schlachtfeld führt.',
    identity: 'Reisepunkt: Übergang zum Orc-Disaster-Set-Piece (Jura-Schlachtfeld).',
    unlockFlag: 'faction.kijin.sworn',
    travelTo: { mapId: 'jura-battlefield', x: 2, y: 7 }
  },
  {
    id: 'battlefield-gate-tempest',
    name: 'Rückweg in den Jura-Wald',
    kind: 'gateway',
    mapId: 'jura-battlefield',
    position: { x: 1, y: 7 },
    description: 'Der Pfad vom Heerfeld zurück in den geschützten Jura-Wald.',
    identity: 'Reisepunkt: zurück in den Jura-Wald.',
    travelTo: { mapId: 'tempest-start', x: 22, y: 2 }
  },
  {
    id: 'battlefield-front',
    name: 'Heerfeld-Vorhut',
    kind: 'outpost',
    mapId: 'jura-battlefield',
    position: { x: 6, y: 7 },
    bounds: { x: 3, y: 5, width: 8, height: 5 },
    description: 'Der westliche Rand des Schlachtfelds, an dem Treyni warnt und die Ork-Vorhut anbrandet.',
    identity: 'Story-Frontlinie: Treynis Warnung und der erste Zusammenstoß mit der Ork-Armee.'
  },
  {
    id: 'battlefield-heart',
    name: 'Auge der Schlacht',
    kind: 'dungeon',
    mapId: 'jura-battlefield',
    position: { x: 15, y: 6 },
    bounds: { x: 13, y: 4, width: 6, height: 5 },
    description: 'Das Herz des Heerzugs, in dem „Geld" die Gefallenen verschlingt — und in dem später die Föderation entsteht.',
    identity: 'Bossort: der Orc-Disaster „Geld" und der Gründungsbeat der Jura-Tempest-Föderation.'
  },
  {
    id: 'gate-to-lizard-marsh',
    name: 'Sumpfpfad zum Echsenvolk',
    kind: 'gateway',
    mapId: 'tempest-start',
    position: { x: 22, y: 13 },
    description: 'Ein feuchter Pfad, der südöstlich aus dem Jura-Wald in den Echsen-Sumpf führt.',
    identity: 'Reisepunkt: Übergang zur Band-2-Allianzregion (Echsen-Sumpf).',
    unlockFlag: 'faction.kijin.sworn',
    travelTo: { mapId: 'lizardman-marsh', x: 2, y: 7 }
  },
  {
    id: 'lizard-marsh-gate-tempest',
    name: 'Rückweg in den Jura-Wald',
    kind: 'gateway',
    mapId: 'lizardman-marsh',
    position: { x: 1, y: 7 },
    description: 'Der Pfad aus dem Echsen-Sumpf zurück in den Jura-Wald.',
    identity: 'Reisepunkt: zurück in den Jura-Wald.',
    travelTo: { mapId: 'tempest-start', x: 22, y: 13 }
  },
  {
    id: 'lizard-marsh-camp',
    name: 'Echsenlager am Schilf',
    kind: 'outpost',
    mapId: 'lizardman-marsh',
    position: { x: 5, y: 7 },
    bounds: { x: 3, y: 5, width: 6, height: 5 },
    description: 'Ein bewachtes Lager der Echsenmenschen, in dem Kommandantin Souka die Stellung hält.',
    identity: 'Story-Treffpunkt: Soukas Warnung und der Bündnis-Beat.'
  },
  {
    id: 'lizard-marsh-heart',
    name: 'Schilfkessel',
    kind: 'dungeon',
    mapId: 'lizardman-marsh',
    position: { x: 13, y: 6 },
    bounds: { x: 11, y: 4, width: 6, height: 5 },
    description: 'Ein offener Wasserkessel, in dem Gabiru mit „Gabirus Hundert" prahlt — und auf die Probe gestellt wird.',
    identity: 'Bossort: das Duell gegen den überheblichen Gabiru.'
  },
  {
    id: 'gate-to-ember-hollow',
    name: 'Pfad zur Glutgrotte',
    kind: 'gateway',
    mapId: 'tempest-start',
    position: { x: 22, y: 5 },
    description: 'Ein heißer Spalt im Fels am Ostrand des Jura-Walds, aus dem Rauch und ein fernes Lodern dringen.',
    identity: 'Reisepunkt: Übergang zur Band-1-Story-Region (Glutgrotte / Shizus Episode).',
    unlockFlag: 'story.kijin.named',
    travelTo: { mapId: 'ember-hollow', x: 2, y: 6 }
  },
  {
    id: 'ember-hollow-gate-tempest',
    name: 'Rückweg in den Jura-Wald',
    kind: 'gateway',
    mapId: 'ember-hollow',
    position: { x: 1, y: 6 },
    description: 'Der Weg aus der schwülen Grotte zurück in den kühlen Jura-Wald.',
    identity: 'Reisepunkt: zurück in den Jura-Wald.',
    travelTo: { mapId: 'tempest-start', x: 22, y: 5 }
  },
  {
    id: 'ember-hollow-entrance',
    name: 'Glutgrotten-Vorhalle',
    kind: 'outpost',
    mapId: 'ember-hollow',
    position: { x: 5, y: 6 },
    bounds: { x: 3, y: 4, width: 6, height: 5 },
    description: 'Die rauchige Vorhalle der Grotte, in der Shizu mit ihrer Maske gegen Ifrits Drang ankämpft.',
    identity: 'Story-Treffpunkt: Shizus erste Begegnung und ihr letzter Schwur.'
  },
  {
    id: 'ember-hollow-core',
    name: 'Lavakammer',
    kind: 'dungeon',
    mapId: 'ember-hollow',
    position: { x: 14, y: 6 },
    bounds: { x: 12, y: 4, width: 6, height: 5 },
    description: 'Das glühende Herz der Grotte, in dem ein maskierter Majin den Flammengeist Ifrit entfesselt.',
    identity: 'Bossort: maskierter Majin und der Greater Spirit Ifrit.'
  }
] as const satisfies readonly WorldLocationDefinition[];

export const LORE_ENTRIES = [
  {
    id: 'slime-awakening',
    title: 'Prolog: Schleim-Erwachen',
    category: 'history',
    body: 'Rimurus erster spielbarer Zustand ist kein verlorener Menschentext, sondern ein klares Systemziel: neue Form prüfen, Welt lesen, Schwur tragen.',
    unlockFlag: 'story.slime.awakened'
  },
  {
    id: 'tutorial-movement-questlog',
    title: 'Tutorial: Bewegen, Reden, Questlog',
    category: 'systems',
    body: 'Der Prolog beginnt bewusst in einem kleinen Raum: bewegen, mit Veldora interagieren und danach im Menü das Questlog prüfen. Jede neue Markierung folgt aus einem Flag oder Quest-Schritt.',
    unlockFlag: 'story.slime.awakened'
  },
  {
    id: 'sealed-storm-dragon',
    title: 'Veldora, der Sturmdrache',
    category: 'people',
    body: 'Eine gewaltige, versiegelte Präsenz in der Höhle, die sich Rimuru als Veldora zu erkennen gibt. Der Prolog nutzt ihn als sicheren Dialoganker: kein Bosskampf, sondern ein Schwur, der spätere Bindungen vorbereitet.',
    unlockFlag: 'story.storm-dragon.oath'
  },
  {
    id: 'tutorial-codex-oath',
    title: 'Tutorial: Codex und Schwüre',
    category: 'systems',
    body: 'Der Sturmschwur zeigt, wie der Codex funktioniert: wichtige Weltbegriffe werden nicht in langen Erklärblöcken versteckt, sondern beim Erleben freigeschaltet.',
    unlockFlag: 'story.storm-dragon.oath'
  },
  {
    id: 'tutorial-grove-combat',
    title: 'Tutorial: Analyse, Status und Teamleiste',
    category: 'systems',
    body: 'Analysiere Gegner mit dem Großen Weisen: Das HUD deckt Schwächen und den nächsten telegraphierten Zug auf. Status-Effekte und Schwächentreffer senken die Break-Leiste. Ein gebrochenes oder geschwächtes Ziel öffnet ein berechenbares Devour-Fenster. Signaturen laden sich durch Aktionen; zwei verbundene Elementresonanzen verwandeln eine volle Teamleiste in eine Fusionskombo.',
    unlockFlag: 'codex.tutorial-grove-combat'
  },
  {
    id: 'tutorial-echo-boss',
    title: 'Tutorial: Boss-Telegraph und Antwortfenster',
    category: 'systems',
    body: 'Analysierte Bosse kündigen ihre nächste Fähigkeit im HUD an. Nutze Verteidigung, Reaktionen oder Statuskontrolle gegen den Telegraphen, prüfe Magieeffekte und erzeuge Break mit aufgedeckten Schwächen. Spare Signaturen und fusionierte Teamzüge für das anschließende Schadensfenster.',
    unlockFlag: 'codex.tutorial-echo-boss'
  },
  {
    id: 'goblin-village',
    title: 'Das erste Goblindorf',
    category: 'places',
    body: 'Die Goblins sind der erste soziale Prüfstein: Rimurus Kraft zählt erst, wenn sie Schutz, Vertrauen und gemeinsame Regeln erzeugt.',
    unlockFlag: 'story.goblin.plea'
  },
  {
    id: 'tutorial-direwolf-boss',
    title: 'Tutorial: Bosskampf und Teamleiste',
    category: 'systems',
    body: 'Der Direwolf-Anführer ist der erste Boss-Prüfstein: Verteidigen, Items, Schwächefenster und Teamleiste sind hier wichtiger als blindes Angreifen. Der Sieg endet als Pakt, nicht als Auslöschung.',
    unlockFlag: 'story.goblin.plea'
  },
  {
    id: 'direwolf-pact',
    title: 'Der Direwolf-Pakt',
    category: 'history',
    body: 'Der Sieg über den Rudelführer beendet die Jagd nicht durch Auslöschung, sondern durch Dominanz und Verhandlung. Das macht aus Feinden künftige Nachbarn.',
    unlockFlag: 'story.direwolf.defeated'
  },
  {
    id: 'direwolf-faction',
    title: 'Direwolf-Rudel: Fraktion',
    category: 'people',
    body: 'Das Rudel akzeptiert Tempest nicht als Besitzer, sondern als stärkeren Vertragspartner. Spätere Reaktionen können auf Respekt, Paktstatus und gemeinsame Grenzverteidigung aufbauen.',
    unlockFlag: 'faction.direwolves.respected'
  },
  {
    id: 'direwolf-mount-seed',
    title: 'Direwolf-Rudel: Reittiere',
    category: 'systems',
    body: 'Der Pakt legt den Systemhaken für Rangas Reisehilfe: sichere, bereits entdeckte Orte können später als Schnellreiseziele dienen; unsichere Dungeons bleiben nur Scout-Hinweise.',
    unlockFlag: 'mount.direwolf.seed'
  },
  {
    id: 'ranga-scout-travel',
    title: 'Ranga-Scout und Schnellreise',
    category: 'systems',
    body: 'Ranga unterscheidet zwischen sicheren Reisepunkten und gefährlichen Spuren. Tempest kann nur zu Orten schnellreisen, die real besucht, im Save markiert und aktuell sicher sind; Hain und Grenzroute werden zuerst nur gescoutet.',
    unlockFlag: 'story.direwolf.pact'
  },
  {
    id: 'tutorial-ranga-fast-travel',
    title: 'Tutorial: Sichere Ranga-Schnellreise',
    category: 'systems',
    body: 'Schnellreise wird erst praktisch, wenn Ranga einen Ort wirklich gerochen und als sicheren Reisepunkt gespeichert hat. Unbesuchte oder unsichere Orte bleiben Scout-Hinweise, keine Teleports.',
    unlockFlag: 'travel.ranga.discovered.tempest-hollow'
  },
  {
    id: 'gobta-rider-path',
    title: 'Gobtas Reiterpfad',
    category: 'systems',
    body: 'Das Wolfsfang-Abzeichen markiert Gobtas spätere Direwolf-Progression. Reiter-Talente sollen erst sinnvoll werden, wenn Tempest den Rudelpakt wirklich geschlossen hat.',
    unlockFlag: 'progression.gobta.wolf-fang-token'
  },
  {
    id: 'first-tempest-naming',
    title: 'Die erste Benennung',
    category: 'history',
    body: 'Nach Höhle, Goblins und Direwolf-Rudel wird die Siedlung benannt. Technisch markiert dieses Flag den Abschluss des spielbaren Prologs.',
    unlockFlag: 'story.slime-prologue.completed'
  },
  {
    id: 'storm-dragon-future-ally',
    title: 'Vormerkung: Veldora als späterer Gefährte',
    category: 'systems',
    body: 'Im frühen Spiel bleibt Veldora Dialog- und Codex-Anker. Seine spielbare Rückkehr ist als späterer Arc-Haken vorgemerkt, nicht als Prolog-Partyrolle.',
    unlockFlag: 'story.slime-prologue.completed'
  },
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
    body: 'Rigurd hält die junge Stadt zusammen, Shuna liest die Siegelspur, Gobta plant den Grenzweg und Ranga liefert die erste Scout-Route. Zusammen bilden sie den ersten belastbaren Quest-Knoten.',
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
    id: 'ancestor-seal-warning',
    title: 'Warnung am Ahnensiegel',
    category: 'systems',
    body: 'Das Fragment aus dem Flüsterhain klingt wie gefrorener Donner. Shunas Warnung ist klar: Am Schrein wartet kein gewöhnliches Monster, sondern ein Echo der alten Ordnung.',
    unlockFlag: 'codex.ancestor-seal-warning'
  },
  {
    id: 'mordrahn',
    title: 'Namenloses Echo',
    category: 'people',
    body: 'Ein Echo aus der zerfallenden Bindung. Es spricht nicht wie ein Eroberer, sondern wie eine alte Ordnung, die eine Katastrophe um jeden Preis verhindern will.',
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
    id: 'border-deescalation',
    title: 'Deeskalation an der Sumpfgrenze',
    category: 'history',
    body: 'Tempest gewann den Grenzkampf, ließ die Waffen aber sinken und versorgte die verletzte Menschenpatrouille. Deren Bericht trennt Monsterangriff von fremder Siegelmagie und hält einen Gesprächskanal offen.',
    unlockFlag: 'story.border.deescalated'
  },
  {
    id: 'second-fracture',
    title: 'Der zweite Riss',
    category: 'history',
    body: 'Shunas Deutung ist eindeutig: Die Bindung zerfällt schneller, als sie sollte. Fremde Siegelspuren lenken Patrouillen und Vorhut an dieselbe Bruchkante, doch der Auftraggeber hinterlässt weder Namen noch Lager.',
    unlockFlag: 'story.fracture.read'
  },
  {
    id: 'mordrahn-vanguard',
    title: 'Feindliche Vorhut',
    category: 'people',
    body: 'Keine Projektion mehr, sondern eine reale Vorhut: gefesselte Geister und gebrochene Söldner reißen den Riss für eine unbekannte Stimme weiter auf. Rangas Spur endet an kaltem Siegelstaub — der Auftraggeber bleibt indirekt.',
    unlockFlag: 'story.vanguard.broken'
  },
  {
    id: 'mordrahn-keeper',
    title: 'Der Hüter der alten Ordnung',
    lockedTitle: 'Unbekannter Hüter',
    category: 'people',
    body: 'Der Hüter war der letzte Wächter der Bindung. Um den ewigen Zerfall aufzuhalten, wollte er sie mit einem Massenopfer neu schmieden — keine Bosheit, sondern eine Verzweiflung, die jeden Preis zahlt. Besiegt, aber nicht widerlegt: die Frage, was mit der Bindung geschehen soll, bleibt.',
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
    body: 'Weil die Bindungen zwischen Rigurd, Gobta, Shuna, Ranga und Rimuru hielten, fand Tempest einen dritten Weg: die alte Magie nicht zu zerstören und nicht zu erzwingen, sondern auf viele Schultern zu verteilen. Kein Opfer, keine Schutzlosigkeit — nur geteilte Verantwortung.',
    unlockFlag: 'ending.true'
  },
  {
    id: 'bestiary-bog-terror',
    title: 'Bestiarium: Sumpfschrecken',
    category: 'people',
    body: 'Ein gepanzerter Morastkoloss, der sich von Schlamm und Aas nährt. Träge, aber zäh und überraschend stark — Wind und Feuer setzen seiner feuchten Panzerung am meisten zu.',
    unlockFlag: 'sidequest.bog.cleared'
  },
  {
    id: 'bestiary-stray-echo',
    title: 'Bestiarium: Streunendes Echo',
    category: 'people',
    body: 'Ein losgerissenes Bruchstück der Bindung, das als Geist umherirrt. Körperlich kaum greifbar, aber magisch gefährlich; heilige und windgebundene Magie zerstreut es.',
    unlockFlag: 'sidequest.echo.cleared'
  },
  {
    id: 'bestiary-human-deserter',
    title: 'Bestiarium: Deserteur-Söldner',
    category: 'people',
    body: 'Fahnenflüchtige Söldner, die zwischen den Fronten plündern. Diszipliniert und schnell, aber ohne Magie — Schattenmagie bricht ihre Moral am ehesten.',
    unlockFlag: 'sidequest.deserter.cleared'
  },
  {
    id: 'bestiary-elder-direwolf',
    title: 'Bestiarium: Urdirewolf',
    category: 'people',
    body: 'Der Stammvater aller Direwölfe — ein Apex-Räuber von gewaltiger Kraft und Geschwindigkeit. Nur erdgebundene Magie bringt den Koloss ins Wanken. Ein Sieg über ihn ist ein Prüfstein.',
    unlockFlag: 'sidequest.apex.cleared'
  },
  {
    id: 'geistmoor',
    title: 'Das Geistmoor',
    category: 'places',
    body: 'Westlich von Tempest dehnt sich ein nebliges Moor, in dem Sporen, Echsenmenschen und losgerissene Echos der Bindung hausen. Wer die Nebelmoor-Tiefe bezwingt, beweist, dass Tempests Reichweite über den Hain hinauswächst.',
    unlockFlag: 'marsh.guardian.cleared'
  },
  {
    id: 'geisterschrein',
    title: 'Das Geisterschrein-Hochland',
    category: 'places',
    body: 'Jenseits des Moors steigt das Land zu windumtosten Schreinterrassen an, wo die ältesten Echos der Bindung nachhallen. Der Schreingipfel gilt als härteste Prüfung außerhalb der Hauptgeschichte — und als Ort, an dem Tempests Späher die nächste Grenze erahnen.',
    unlockFlag: 'highlands.guardian.cleared'
  },
  {
    id: 'marsh-keeper',
    title: 'Die Moorhüterin',
    category: 'people',
    body: 'Eir wacht über das Geistmoor, lange bevor Tempest entstand. Sie misstraut Städten, doch wer dem Moor hilft, gewinnt eine zähe Verbündete — und einen ersten Faden zwischen Tempest und den alten Hütern.',
    unlockFlag: 'sidequest.cleanse.cleared'
  },
  {
    id: 'shrine-watcher',
    title: 'Der Schreinwächter',
    category: 'people',
    body: 'Kael hält allein Wache auf den Schreinterrassen und liest in den Echos die nächste Grenze. Wer ihm hilft, ein Sturmecho zu bannen, erhält von Tempests fernstem Außenposten ein offenes Ohr — und eine Warnung vor dem, was jenseits des Hochlands lauert.',
    unlockFlag: 'sidequest.vigil.cleared'
  },
  {
    id: 'kijin-ascension',
    title: 'Die Namensgebung der Oger',
    lockedTitle: 'Geflüchtete Krieger',
    category: 'history',
    body: 'Sechs Oger überlebten den Untergang ihres Dorfes. Als Rimuru ihnen Namen gab, loderte die Magie auf und hob sie zu Kijin empor — Benimaru, Shion, Hakurou, Kurobe und Souei. Ein Name ist kein Wort, sondern ein Anteil an Macht; wer ihn schenkt, bindet Schicksale aneinander.',
    unlockFlag: 'story.kijin.named'
  },
  {
    id: 'veldora-bond',
    title: 'Freund im Sturm',
    lockedTitle: 'Der versiegelte Drache',
    category: 'people',
    body: 'Veldora, der Sturmdrache, lag Jahrhunderte in einem Siegel — bis ein Slime in seinem Inneren Geschichten mit ihm teilte. Aus Langeweile wurde Freundschaft, aus Freundschaft ein Bund: Ihre geteilte Magie lässt Rimurus Sturm noch heftiger toben.',
    unlockFlag: 'story.storm-dragon.oath'
  },
  {
    id: 'orc-disaster',
    title: 'Der hungernde Heerzug',
    lockedTitle: 'Gerüchte aus dem Süden',
    category: 'history',
    body: 'Hunger trieb die Orks zu einer einzigen, verzweifelten Schlacht. In ihrer Mitte erwachte „Geld" — der Orc-Disaster, der die Gefallenen verschlang und mit jeder Mahlzeit wuchs. Die geflüchteten Oger sahen ihr Dorf in diesem Heerzug untergehen.',
    unlockFlag: 'faction.kijin.sworn'
  },
  {
    id: 'dwargon',
    title: 'Dwargon, das Bewaffnete Königreich',
    lockedTitle: 'Gerüchte aus den Bergen',
    category: 'places',
    body: 'Eine Bergfeste aus Stein und Magisteel: Dwargons Werkstätten gelten als die besten der bekannten Welt. Hinter Markt und Esse liegt eine strenge Ordnung — und ein Königshof, an dem Recht über Handwerk und Ehre wacht.',
    unlockFlag: 'story.dwargon.entered'
  },
  {
    id: 'gazel-dwargo',
    title: 'König Gazel Dwargo',
    lockedTitle: 'Der Heldenkönig',
    category: 'people',
    body: 'Der Schwertheld auf Dwargons Thron. Hart, aber gerecht: Sein Urteil im Zwischenfall um Kaijin öffnet Tempest den Weg zur Schmiedekunst der Zwerge — und legt den Grundstein einer späteren Freundschaft.',
    unlockFlag: 'craft.smithing.unlocked'
  },
  {
    id: 'blumund-free-guild',
    title: 'Blumund und die Freie Gilde',
    lockedTitle: 'Ein Menschenreich im Westen',
    category: 'places',
    body: 'Das kleine Königreich Blumund behauptet sich durch Handel, Informationen und die Freie Gilde. Gildenmeister Fuze erkennt in Tempest keinen namenlosen Monsterhort, sondern einen möglichen Nachbarn — sofern beide Seiten verlässliche Wege schaffen.',
    unlockFlag: 'story.blumund.entered'
  },
  {
    id: 'fuze-adventurers',
    title: 'Fuze und die Jura-Abenteurer',
    lockedTitle: 'Stimmen aus der Freien Gilde',
    category: 'people',
    body: 'Fuze führt Blumunds Gilde mit nüchterner Vorsicht. Kaval, Eren und Gido kennen den Jura-Wald aus eigener Erfahrung; ihr Routenbericht macht aus Gerüchten erstmals überprüfbare Nachrichten über Tempest.',
    unlockFlag: 'story.blumund.guild-tested'
  },
  {
    id: 'treyni',
    title: 'Treyni, Hüterin des Jura-Walds',
    lockedTitle: 'Eine Stimme aus dem Wald',
    category: 'people',
    body: 'Die Dryade Treyni wacht über den Großen Jura-Wald. Sie durchschaut Gelmuds Spiel — der einem Ork-Lord einen Namen gibt, um eine Katastrophe (und damit einen neuen Dämonenlord) zu erzwingen. Ihre Warnung bringt Tempest und die Waldvölker zusammen.',
    unlockFlag: 'story.treyni.met'
  },
  {
    id: 'jura-federation',
    title: 'Die Jura-Tempest-Föderation',
    lockedTitle: 'Ein Bündnis der Waldvölker',
    category: 'places',
    body: 'Nach dem Fall des Orc-Disasters vereinen sich Hobgoblins, Kijin, Tempest-Wölfe, Echsenmenschen und die verschonten Orks zur Jura-Tempest-Föderation. Aus geretteten Feinden werden unermüdliche Aufbauhelfer — Tempest tritt aus der Isolation.',
    unlockFlag: 'faction.orcs.joined'
  },
  {
    id: 'demon-lords',
    title: 'Dämonenlords & das Benennen',
    lockedTitle: 'Mächte jenseits der Katastrophenklasse',
    category: 'systems',
    body: 'Genug Macht — etwa durch Predation — kann eine „Saat" zum Dämonenlord legen. Gelmuds Namensschema zielte genau darauf. Milim Nava, eine der ältesten Dämonenlords, prüft Rimuru: kein klassischer Sieg, sondern ein Test, der über Honig zur Freundschaft wird.',
    unlockFlag: 'story.milim.met'
  },
  {
    id: 'predator-devour',
    title: 'Verschlinger: Skill-Aneignung',
    lockedTitle: 'Rimurus Hunger',
    category: 'systems',
    body: 'Rimurus Verschlinger ist kein bloßer Finisher: erst gebrochene, geschwächte oder fast besiegte Gegner lassen eine Essenz zurück, die als dauerhafte Fähigkeit in Rimurus Repertoire übergeht. Jede Essenz ist an einen konkreten Gegnerkern gebunden und wird im Kampf durch ein begrenztes Loadout gebändigt.',
    unlockFlag: 'codex.predator-devour'
  },
  {
    id: 'lizardfolk',
    title: 'Die Echsenmenschen des Sumpfs',
    lockedTitle: 'Stimmen aus dem Schilf',
    category: 'people',
    body: 'Ein stolzes Sumpfvolk: der besonnene Häuptling, seine loyale und fähige Kommandantin Souka — und sein ruhmsüchtiger Sohn Gabiru, der sich mit „Gabirus Hundert" gern selbst überschätzt. Gegen die Ork-Armee zählt nur, ob sie zusammenstehen.',
    unlockFlag: 'story.lizard.met'
  },
  {
    id: 'lizard-pact',
    title: 'Das Sumpf-Bündnis',
    lockedTitle: 'Ein unfertiges Bündnis',
    category: 'places',
    body: 'Erst Gabirus Niederlage öffnet den Echsenmenschen die Augen: Souka und der Häuptling schließen ein Bündnis mit Tempest gegen den Heerzug. Gabiru zieht sich beschämt zurück — seine Läuterung und sein späterer Beitritt als Tempest-Offizier zeichnen sich erst ab.',
    unlockFlag: 'story.lizard.allied'
  },
  {
    id: 'shizu',
    title: 'Shizu, die Andersweltlerin',
    lockedTitle: 'Eine maskierte Fremde',
    category: 'people',
    body: 'Shizue Izawa — als Kind in diese Welt gerufen und zur Wirtin des Flammengeists Ifrit gemacht. Ihre Maske bändigt das Feuer in ihr. A-Rang-Abenteurerin, von Güte erfüllt: ihr letzter Wunsch gilt nicht Rache, sondern dem Schutz der Kinder, die ihr Schicksal teilen.',
    unlockFlag: 'story.shizu.met'
  },
  {
    id: 'ifrit-spirit',
    title: 'Ifrit, der Flammengeist',
    lockedTitle: 'Ein Lodern in der Tiefe',
    category: 'people',
    body: 'Ein Greater Spirit des Feuers, der in Shizu gebunden war. Von einem maskierten Majin aufgestachelt, bricht er los. Bezwungen wird seine Flamme zu einer Affinität, die Rimuru in sich aufnimmt — die Geistglut.',
    unlockFlag: 'story.ifrit.subdued'
  },
  {
    id: 'otherworlders',
    title: 'Andersweltler & menschliche Gestalt',
    lockedTitle: 'Rufe aus einer anderen Welt',
    category: 'systems',
    body: 'Magie ruft Menschen aus einer anderen Welt; sie tragen besondere Gaben und einen Hunger nach Magie. Indem Rimuru Shizu auf ihren Wunsch in sich aufnimmt, gewinnt er ihre menschliche Gestalt und Ifrits Flamme — und den Schwur, ihre fünf Schüler zu schützen (ein ferner Faden bis zu Leon Cromwell).',
    unlockFlag: 'story.shizu.vow'
  }
] as const satisfies readonly LoreEntryDefinition[];

export const DIALOGS = [
  {
    id: 'sealed-storm-dragon',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Veldora',
        text: 'Ein Schleim, der sprechen lernt, bevor er versteht, was er ist. Beweg dich, sprich mit mir, und prüfe danach dein Questlog — so ordnest du zuerst deine Form; danach reden wir über Schwüre.',
        choices: [
          {
            id: 'begin',
            label: 'Schleimform ordnen',
            nextNodeId: 'awakened',
            requirements: [{ questStatus: { questId: 'slime-awakening', status: 'inactive' } }],
            effects: [
              { type: 'start-quest', questId: 'slime-awakening' },
              { type: 'complete-quest-step', questId: 'slime-awakening', stepId: 'cave-awakening' },
              { type: 'set-flag', flag: 'story.slime.awakened', value: true }
            ]
          },
          {
            id: 'oath',
            label: 'Sturmschwur schließen',
            nextNodeId: 'oath',
            requirements: [
              { questStatus: { questId: 'slime-awakening', status: 'active' } },
              { questStep: { questId: 'slime-awakening', stepId: 'cave-awakening' } },
              { missingQuestStep: { questId: 'slime-awakening', stepId: 'storm-dragon-oath' } }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'slime-awakening', stepId: 'storm-dragon-oath' },
              { type: 'set-flag', flag: 'story.storm-dragon.oath', value: true },
              { type: 'add-item', itemId: 'sealed-cave-crystal', quantity: 1 }
            ]
          },
          {
            id: 'after-oath',
            label: 'Den Schwur erinnern',
            nextNodeId: 'after-oath',
            requirements: [
              { flag: 'story.storm-dragon.oath' },
              { notFlag: 'story.slime-prologue.completed' }
            ]
          },
          {
            id: 'clear-sky',
            label: 'Über Tempest sprechen',
            nextNodeId: 'clear-sky',
            requirements: [{ flag: 'story.slime-prologue.completed' }]
          },
          {
            id: 'end',
            label: 'Später'
          }
        ]
      },
      {
        id: 'awakened',
        speaker: 'Veldora',
        text: 'Gut. Du kannst dich bewegen, aufnehmen, widerstehen. Dein Codex hält solche Schwüre fest, sobald du sie erlebst. Nimm nun einen mit: Kraft ohne Gemeinschaft bleibt nur Hunger.',
        choices: [
          {
            id: 'oath',
            label: 'Schwur annehmen',
            nextNodeId: 'oath',
            requirements: [
              { questStatus: { questId: 'slime-awakening', status: 'active' } },
              { missingQuestStep: { questId: 'slime-awakening', stepId: 'storm-dragon-oath' } }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'slime-awakening', stepId: 'storm-dragon-oath' },
              { type: 'set-flag', flag: 'story.storm-dragon.oath', value: true },
              { type: 'add-item', itemId: 'sealed-cave-crystal', quantity: 1 }
            ]
          }
        ]
      },
      {
        id: 'oath',
        speaker: 'Veldora',
        text: 'Draußen wartet ein kleines Dorf. Der Höhlenausgang ist jetzt offen. Wenn du dort nur ein Monster bist, endet alles in Angst. Wenn du ein Name wirst, beginnt eine Stadt.',
        choices: [{ id: 'end', label: 'Zur Oberfläche' }]
      },
      {
        id: 'after-oath',
        speaker: 'Veldora',
        text: 'Der Schwur ist einfach: Beschütze, was kleiner ist als du — und lerne von dem, was sich trotzdem vor dich stellt.',
        choices: [{ id: 'end', label: 'Ich gehe weiter' }]
      },
      {
        id: 'clear-sky',
        speaker: 'Veldora',
        text: 'Die erste Siedlung steht. Merk dir das Gefühl: Eine Stadt beginnt nicht mit Mauern, sondern mit Leuten, die bleiben wollen.',
        choices: [{ id: 'end', label: 'Tempest wächst' }]
      }
    ]
  },
  {
    id: 'rigurd-intro',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Rigurd',
        text: 'Willkommen am Rand des Jura-Walds. Wir brauchen eine kurze Patrouille, bevor die Händler öffnen.',
        choices: [
          {
            id: 'accept',
            label: 'Patrouille übernehmen',
            nextNodeId: 'accepted',
            requirements: [
              { flag: 'story.slime-prologue.completed' },
              { questStatus: { questId: 'first-patrol', status: 'inactive' } }
            ],
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
            id: 'hear-goblin-plea',
            label: 'Goblindorf schützen',
            nextNodeId: 'slime-plea',
            requirements: [
              { questStatus: { questId: 'slime-awakening', status: 'active' } },
              { flag: 'story.storm-dragon.oath' },
              { missingQuestStep: { questId: 'slime-awakening', stepId: 'goblin-plea' } }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'slime-awakening', stepId: 'goblin-plea' },
              { type: 'set-flag', flag: 'story.goblin.plea', value: true },
              { type: 'set-flag', flag: 'bond.rigurd.met', value: true },
              { type: 'recruit-character', characterId: 'gobta' }
            ]
          },
          {
            id: 'name-village',
            label: 'Siedlung benennen',
            nextNodeId: 'slime-completed',
            requirements: [
              { questStatus: { questId: 'slime-awakening', status: 'active' } },
              { flag: 'story.direwolf.defeated' },
              { flag: 'story.direwolf.pact' },
              { missingQuestStep: { questId: 'slime-awakening', stepId: 'name-the-village' } }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'slime-awakening', stepId: 'name-the-village' },
              { type: 'complete-quest', questId: 'slime-awakening' },
              { type: 'set-flag', flag: 'story.slime-prologue.completed', value: true },
              { type: 'set-flag', flag: 'story.tempest.named', value: true },
              { type: 'set-flag', flag: 'story.act1.started', value: true },
              // Fraktions-/Mount-/Gobta-Flags stammen jetzt aus Rangas Pakt-Dialog
              // (Benennung ist hinter `story.direwolf.pact` gegated → bereits gesetzt).
              { type: 'set-flag', flag: 'bond.rigurd.trust-prologue', value: true },
              { type: 'start-quest', questId: 'binding-of-ancestors' },
              { type: 'add-gold', amount: 100 },
              { type: 'add-item', itemId: 'wolf-fang-token', quantity: 1 }
            ]
          },
          {
            id: 'founder-supplies',
            label: 'Gründerhilfe abholen',
            nextNodeId: 'founder-supplies',
            requirements: [
              { flag: 'bond.rigurd.trust-prologue' },
              { notFlag: 'bond.rigurd.founder-supplies' }
            ],
            effects: [
              { type: 'set-flag', flag: 'bond.rigurd.founder-supplies', value: true },
              { type: 'add-item', itemId: 'healing-herb', quantity: 2 },
              { type: 'add-item', itemId: 'mana-drop', quantity: 1 }
            ]
          },
          {
            id: 'accept-bog',
            label: 'Kopfgeld: Sumpfschrecken',
            nextNodeId: 'bog-accepted',
            requirements: [
              { questStatus: { questId: 'first-patrol', status: 'completed' } },
              { questStatus: { questId: 'bounty-bog', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'bounty-bog' },
              { type: 'complete-quest-step', questId: 'bounty-bog', stepId: 'accept-bog' },
              { type: 'set-flag', flag: 'sidequest.bog.started', value: true }
            ]
          },
          {
            id: 'report-bog',
            label: 'Kopfgeld kassieren',
            nextNodeId: 'bog-paid',
            requirements: [
              { questStatus: { questId: 'bounty-bog', status: 'active' } },
              { flag: 'sidequest.bog.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'bounty-bog', stepId: 'report-bog' },
              { type: 'complete-quest', questId: 'bounty-bog' },
              { type: 'add-gold', amount: 120 },
              { type: 'add-item', itemId: 'mana-drop', quantity: 1 }
            ]
          },
          {
            id: 'accept-apex',
            label: 'Apex-Kopfgeld: Urdirewolf',
            nextNodeId: 'apex-accepted',
            requirements: [
              { flag: 'story.act3.completed' },
              { questStatus: { questId: 'apex-bounty', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'apex-bounty' },
              { type: 'complete-quest-step', questId: 'apex-bounty', stepId: 'accept-apex' },
              { type: 'set-flag', flag: 'sidequest.apex.started', value: true }
            ]
          },
          {
            id: 'report-apex',
            label: 'Apex-Kopfgeld kassieren',
            nextNodeId: 'apex-paid',
            requirements: [
              { questStatus: { questId: 'apex-bounty', status: 'active' } },
              { flag: 'sidequest.apex.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'apex-bounty', stepId: 'report-apex' },
              { type: 'complete-quest', questId: 'apex-bounty' },
              { type: 'add-gold', amount: 300 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
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
        id: 'apex-accepted',
        speaker: 'Rigurd',
        text: 'Du willst den Urdirewolf? Mutig. Er hält die Südsenke seit Generationen. Nur wer den Hüter der alten Ordnung bezwungen hat, sollte das überhaupt erwägen. Viel Glück — du wirst es brauchen.',
        choices: [{ id: 'end', label: 'Zur Südsenke' }]
      },
      {
        id: 'apex-paid',
        speaker: 'Rigurd',
        text: 'Beim Sturm — du hast ihn wirklich erlegt. Das ist eine Legende wert. Hier, das volle Apex-Kopfgeld. Tempest verneigt sich.',
        choices: [{ id: 'end', label: 'Erledigt' }]
      },
      {
        id: 'completed',
        speaker: 'Rigurd',
        text: 'Sehr gut. Tempest merkt sich zuverlässige Hilfe. Nimm diese kleine Belohnung.',
        choices: [{ id: 'end', label: 'Danke' }]
      },
      {
        id: 'slime-plea',
        speaker: 'Rigurd',
        text: 'Unser Dorf ist klein und das Rudel schnell. Der Ostpfad führt zur Lichtung. Nimm Kräuter mit, verteidige dich, wenn das Rudel Druck macht, und stopp den Anführer — dann können wir zum ersten Mal bleiben statt fliehen.',
        choices: [{ id: 'end', label: 'Zur Direwolf-Lichtung' }]
      },
      {
        id: 'slime-completed',
        speaker: 'Rigurd',
        text: 'Das Rudel weicht zurück, und die Goblins haben wieder eine Zukunft. Gib diesem Ort einen Namen — etwas, an dem wir festhalten können. Danach sammle ich den Rat: Die alten Siegel reagieren bereits auf Tempests ersten Schwur.',
        choices: [{ id: 'end', label: 'Tempest soll es sein' }]
      },
      {
        id: 'founder-supplies',
        speaker: 'Rigurd',
        text: 'Du hast uns nicht nur gerettet, du hast uns einen Anfang gegeben. Nimm diese Vorräte. Solange Tempest klein ist, zählt jede Handreichung doppelt.',
        choices: [{ id: 'end', label: 'Danke, Rigurd' }]
      },
      {
        id: 'bog-accepted',
        speaker: 'Rigurd',
        text: 'Der Sumpfschrecken haust im Westsumpf und reißt Handelstiere. Erleg ihn — das Kopfgeld ist es wert.',
        choices: [{ id: 'end', label: 'Zum Westsumpf' }]
      },
      {
        id: 'bog-paid',
        speaker: 'Rigurd',
        text: 'Sauber erlegt. Die Pfade sind wieder offen — hier, dein Kopfgeld. Tempest dankt dir.',
        choices: [{ id: 'end', label: 'Gern geschehen' }]
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
    id: 'rigurd-act1',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Rigurd',
        text: 'Tempest hat jetzt einen Namen. Ein Name ist aber erst stark, wenn die Leute darunter zusammenstehen. Sammeln wir Rat, Späher und Ritualwissen, bevor der Hain auf unsere Magie antwortet.',
        choices: [
          {
            id: 'begin',
            label: 'Erinnerung ordnen',
            nextNodeId: 'begin',
            requirements: [
              { flag: 'story.slime-prologue.completed' },
              { questStatus: { questId: 'binding-of-ancestors', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'binding-of-ancestors' },
              { type: 'complete-quest-step', questId: 'binding-of-ancestors', stepId: 'awakening' },
              { type: 'set-flag', flag: 'story.intro.seen', value: true },
              { type: 'set-flag', flag: 'bond.rigurd.act1-met', value: true },
              { type: 'set-flag', flag: 'bond.sora.met', value: true }
            ]
          },
          {
            id: 'after-prologue',
            label: 'Ahnenspur aufnehmen',
            nextNodeId: 'begin',
            requirements: [
              { questStatus: { questId: 'binding-of-ancestors', status: 'active' } },
              { flag: 'story.slime-prologue.completed' },
              { missingQuestStep: { questId: 'binding-of-ancestors', stepId: 'awakening' } }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'binding-of-ancestors', stepId: 'awakening' },
              { type: 'set-flag', flag: 'story.intro.seen', value: true },
              { type: 'set-flag', flag: 'bond.rigurd.act1-met', value: true },
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
              { type: 'set-flag', flag: 'codex.tutorial-grove-combat', value: true },
              { type: 'complete-quest-step', questId: 'binding-of-ancestors', stepId: 'gather-council' },
              { type: 'recruit-character', characterId: 'rigurd' }
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
              { type: 'set-flag', flag: 'bond.rigurd.trust-act1', value: true },
              { type: 'set-flag', flag: 'bond.sora.trust-1', value: true },
              { type: 'add-gold', amount: 180 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          {
            id: 'founder-supplies',
            label: 'Gründerhilfe organisieren',
            nextNodeId: 'founder-supplies',
            requirements: [
              { flag: 'bond.rigurd.trust-prologue' },
              { notFlag: 'bond.rigurd.founder-supplies' }
            ],
            effects: [
              { type: 'set-flag', flag: 'bond.rigurd.founder-supplies', value: true },
              { type: 'add-item', itemId: 'healing-herb', quantity: 2 },
              { type: 'add-item', itemId: 'mana-drop', quantity: 1 }
            ]
          },
          {
            id: 'rally',
            label: 'Band 4: Bündnisrat einberufen',
            nextNodeId: 'rally-node',
            requirements: [
              { flag: 'story.act2.completed' },
              { questStatus: { questId: 'ancestors-choice', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'ancestors-choice' },
              { type: 'set-flag', flag: 'story.act3.started', value: true }
            ]
          },
          {
            id: 'complete-rally',
            label: 'Bündnisrat schließen',
            nextNodeId: 'alliance-council',
            requirements: [
              { questStatus: { questId: 'ancestors-choice', status: 'active' } },
              { missingQuestStep: { questId: 'ancestors-choice', stepId: 'rally' } },
              { flag: 'story.alliance.shuna-ready' },
              { flag: 'story.alliance.gobta-ready' },
              { flag: 'story.alliance.ranga-ready' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'ancestors-choice', stepId: 'rally' },
              { type: 'set-flag', flag: 'story.alliance.council-ready', value: true },
              { type: 'recruit-character', characterId: 'ranga' }
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
            label: 'Die Last teilen (nur mit belegten Bindungen)',
            nextNodeId: 'end-true',
            requirements: [
              { questStatus: { questId: 'ancestors-choice', status: 'active' } },
              { flag: 'story.mordrahn.defeated' },
              { notFlag: 'story.act3.completed' },
              { flag: 'story.direwolf.pact' },
              { flag: 'story.border.deescalated' },
              { flag: 'story.vanguard.trace-read' },
              { flag: 'story.alliance.council-ready' },
              { flag: 'story.alliance.shuna-ready' },
              { flag: 'story.alliance.gobta-ready' },
              { flag: 'story.alliance.ranga-ready' }
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
            nextNodeId: 'state',
            requirements: [{ notFlag: 'story.council.ready' }]
          },
          {
            id: 'state-council',
            label: 'Wie verändert der Rat Tempest?',
            nextNodeId: 'state-council',
            requirements: [
              { flag: 'story.council.ready' },
              { notFlag: 'story.act1.completed' }
            ]
          },
          {
            id: 'state-established',
            label: 'Was bleibt nach dem Echo?',
            nextNodeId: 'state-established',
            requirements: [{ flag: 'story.act1.completed' }]
          }
        ]
      },
      {
        id: 'begin',
        speaker: 'Rigurd',
        text: 'Shuna kann die Siegelspur lesen. Gobta kennt die Pfade, und Ranga findet, was wir übersehen. Sprich mit ihnen, dann öffnen wir den Weg in den Flüsterhain.',
        choices: [{ id: 'end', label: 'Ich sammle den Rat' }]
      },
      {
        id: 'council',
        speaker: 'Rigurd',
        text: 'Gut. Der Hain ist kein leerer Wald: Sporen reagieren auf Namen. Bleibt zusammen, brecht die Quelle und kehrt zurück, bevor das Echo sie findet.',
        choices: [{ id: 'end', label: 'Zum Flüsterhain' }]
      },
      {
        id: 'completed',
        speaker: 'Rigurd',
        text: 'Dann ist Tempest mehr als ein Lager. Wir haben eine erste Geschichte, einen ersten Schwur — und eine Warnung, dass alte Ordnung nicht immer Schutz bedeutet.',
        choices: [{ id: 'end', label: 'Tempest steht' }]
      },
      {
        id: 'founder-supplies',
        speaker: 'Rigurd',
        text: 'Wir haben die Vorräte ins neue Tempest-Zelt gebracht. Nimm Kräuter und Manatropfen mit, bevor ihr zum Hain geht — Shunas Warnung reicht mir.',
        choices: [{ id: 'end', label: 'Vorräte gesichert' }]
      },
      {
        id: 'state',
        speaker: 'Rigurd',
        text: 'Tempest ist noch klein: Ratsplatz, Namensstein, Vorratszelt und Palisade. Aber jeder sichtbare Pfahl sagt dasselbe: Der Name ist ein Versprechen, nicht nur ein Etikett.',
        choices: [{ id: 'end', label: 'Verstanden' }]
      },
      {
        id: 'state-council',
        speaker: 'Rigurd',
        text: 'Seit dem ersten Rat laufen Vorräte, Patrouillen und Shunas Ritualzeichen nicht mehr nebeneinander her. Die neue Tafel zeigt jedem, wer Verantwortung trägt.',
        choices: [{ id: 'end', label: 'Der Rat gibt Tempest Form' }]
      },
      {
        id: 'state-established',
        speaker: 'Rigurd',
        text: 'Die Siegelwacht erinnert uns an das Echo. Händler führen bessere Vorräte, Späher melden sichere Wege, und kein Beschluss gehört nur noch einer Person.',
        choices: [{ id: 'end', label: 'Tempest wächst weiter' }]
      },
      {
        id: 'rally-node',
        speaker: 'Rigurd',
        text: 'Dann ist es Zeit — aber wir gehen nicht als Horde. Hole Shunas Ritualplan, Gobtas Grenzroute und Rangas Spur ein. Erst wenn der Bündnisrat steht, marschieren Monster und gemäßigte Menschen unter einem Banner.',
        choices: [{ id: 'end', label: 'Den Bündnisrat sammeln' }]
      },
      {
        id: 'alliance-council',
        speaker: 'Rigurd',
        text: 'Shuna hält das Ritual, Gobta die Menschenroute und Ranga die Rückzugsspur. Das Bündnis steht. Brich die Linie der alten Ordnung und führe alle zum Bindungsherz.',
        choices: [{ id: 'end', label: 'Zum Bündnismarsch' }]
      },
      {
        id: 'end-freedom',
        speaker: 'Rigurd',
        text: 'Die Bindung ist zerschlagen. Wir sind frei — und schutzlos. Tempest beginnt ohne Netz, aber als unsere eigene Wahl. Das tragen wir gemeinsam.',
        choices: [{ id: 'end', label: 'Frei und verantwortlich' }]
      },
      {
        id: 'end-order',
        speaker: 'Rigurd',
        text: 'Wir haben sie neu geschmiedet — ohne Opfer, aber zu einem Preis, den wir selbst zahlen. Sicherheit, die uns ein Stück der Freiheit kostet. Auch das ist eine Gründung.',
        choices: [{ id: 'end', label: 'Geordnet, aber wachsam' }]
      },
      {
        id: 'end-true',
        speaker: 'Rigurd',
        text: 'Weil unsere Bindungen hielten, mussten wir nicht wählen zwischen Opfer und Schutzlosigkeit. Wir verteilen die alte Last auf viele Schultern — kein Held trägt sie allein. So bleibt Tempest.',
        choices: [{ id: 'end', label: 'Geteilte Last' }]
      }
    ]
  },
  {
    id: 'shuna-ritual',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Shuna',
        text: 'Die Fäden der Magie zittern vom Flüsterhain bis zum alten Schrein. Jemand oder etwas spannt die Bindung, als wolle es Tempests neuen Namen prüfen.',
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
              { type: 'set-flag', flag: 'story.shuna.ready', value: true },
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
              { flag: 'story.border.deescalated' },
              { notFlag: 'story.fracture.read' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.fracture.read', value: true },
              { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'read-fracture' }
            ]
          },
          {
            id: 'alliance-shuna',
            label: 'Ritualplan für den Bündnisrat',
            nextNodeId: 'alliance-shuna',
            requirements: [
              { questStatus: { questId: 'ancestors-choice', status: 'active' } },
              { missingQuestStep: { questId: 'ancestors-choice', stepId: 'rally' } },
              { notFlag: 'story.alliance.shuna-ready' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.alliance.shuna-ready', value: true },
              { type: 'set-flag', flag: 'bond.shuna.trust-act3', value: true }
            ]
          },
          {
            id: 'accept-echo',
            label: 'Streunende Echos bannen',
            nextNodeId: 'echo-accepted',
            requirements: [
              { flag: 'story.act1.completed' },
              { questStatus: { questId: 'relic-echoes', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'relic-echoes' },
              { type: 'complete-quest-step', questId: 'relic-echoes', stepId: 'accept-echo' },
              { type: 'set-flag', flag: 'sidequest.echo.started', value: true }
            ]
          },
          {
            id: 'report-echo',
            label: 'Echo-Messdaten bringen',
            nextNodeId: 'echo-done',
            requirements: [
              { questStatus: { questId: 'relic-echoes', status: 'active' } },
              { flag: 'sidequest.echo.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'relic-echoes', stepId: 'report-echo' },
              { type: 'complete-quest', questId: 'relic-echoes' },
              { type: 'add-gold', amount: 90 },
              { type: 'add-item', itemId: 'healing-herb', quantity: 1 }
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
        speaker: 'Shuna',
        text: 'Nimm diese Deutung zu Rigurd. Wenn der Hain reagiert, suche nach einem Fragment: Es sollte wie gefrorener Donner klingen.',
        choices: [{ id: 'end', label: 'Zum Rat' }]
      },
      {
        id: 'after',
        speaker: 'Shuna',
        text: 'Die Signatur ist nicht wild. Jemand lenkt sie. Das macht mir mehr Angst als jede Bestie im Hain.',
        choices: [{ id: 'end', label: 'Ich passe auf' }]
      },
      {
        id: 'fracture',
        speaker: 'Shuna',
        text: 'Die Fäden an den Waffen der Patrouille stammen nicht aus Tempest. Eine fremde Hand lenkt Angst und Siegelmagie gegeneinander, ohne sich zu zeigen. Kehre ins Geistmoor zurück und stoppe die Vorhut am Grenzriss.',
        choices: [{ id: 'end', label: 'Über den Westpfad zurück' }]
      },
      {
        id: 'alliance-shuna',
        speaker: 'Shuna',
        text: 'Ich binde den Siegelspan der Grenzspäherin in das Ritual. Wenn der Hüter die Bindung als Kette benutzt, machen wir daraus ein Netz — aber nur, wenn alle freiwillig tragen.',
        choices: [{ id: 'end', label: 'Shunas Ritual steht' }]
      },
      {
        id: 'echo-accepted',
        speaker: 'Shuna',
        text: 'An der nördlichen Bruchkante irrt ein streunendes Echo umher und verzerrt meine Messungen. Bann es — vorsichtig, es ist magisch, nicht körperlich.',
        choices: [{ id: 'end', label: 'Zur Bruchkante' }]
      },
      {
        id: 'echo-done',
        speaker: 'Shuna',
        text: 'Die Messdaten sind jetzt sauber — und beunruhigend klar. Danke. Nimm das hier; du hast es dir verdient.',
        choices: [{ id: 'end', label: 'Bis bald' }]
      }
    ]
  },
  {
    id: 'gobta-border',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Gobta',
        text: 'Die Pfade um Tempest sind unruhig. Ranga wittert alte Magie im Hain und ich kenne die kurzen Wege. Wenn wir klug laufen, sieht uns niemand als Horde.',
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
              { type: 'set-flag', flag: 'story.gobta.ready', value: true },
              { type: 'set-flag', flag: 'bond.gobta.met', value: true }
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
              { flag: 'story.direwolf.pact' },
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
              { flag: 'story.vanguard.trace-read' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'report-act2' },
              { type: 'complete-quest', questId: 'border-escalation' },
              { type: 'set-flag', flag: 'story.act2.completed', value: true },
              { type: 'set-flag', flag: 'bond.gobta.trust-act2', value: true },
              { type: 'set-flag', flag: 'bond.lyrre.trust-1', value: true },
              { type: 'add-gold', amount: 240 },
              { type: 'add-item', itemId: 'mana-drop', quantity: 1 }
            ]
          },
          {
            id: 'alliance-gobta',
            label: 'Menschenroute für den Bündnisrat',
            nextNodeId: 'alliance-gobta',
            requirements: [
              { questStatus: { questId: 'ancestors-choice', status: 'active' } },
              { missingQuestStep: { questId: 'ancestors-choice', stepId: 'rally' } },
              { notFlag: 'story.alliance.gobta-ready' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.alliance.gobta-ready', value: true },
              { type: 'set-flag', flag: 'bond.gobta.trust-act3', value: true }
            ]
          },
          {
            id: 'accept-deserter',
            label: 'Grenzgänger abfangen',
            nextNodeId: 'deserter-accepted',
            requirements: [
              { flag: 'story.act1.completed' },
              { questStatus: { questId: 'border-runner', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'border-runner' },
              { type: 'complete-quest-step', questId: 'border-runner', stepId: 'accept-deserter' },
              { type: 'set-flag', flag: 'sidequest.deserter.started', value: true }
            ]
          },
          {
            id: 'report-deserter',
            label: 'Route gesichert melden',
            nextNodeId: 'deserter-done',
            requirements: [
              { questStatus: { questId: 'border-runner', status: 'active' } },
              { flag: 'sidequest.deserter.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'border-runner', stepId: 'report-deserter' },
              { type: 'complete-quest', questId: 'border-runner' },
              { type: 'set-flag', flag: 'bond.lyrre.trust-2', value: true },
              { type: 'add-gold', amount: 110 },
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
        speaker: 'Gobta',
        text: 'Ich markiere den Pfad bis zum Hainrand. Ranga soll danach die Spur prüfen — der findet, was ich übersehe.',
        choices: [{ id: 'end', label: 'Ranga folgt der Spur' }]
      },
      {
        id: 'deserter-accepted',
        speaker: 'Gobta',
        text: 'An der Osthandelsroute plündert ein Deserteurstrupp. Stell sie — aber lass Überlebende laufen, wenn du kannst. Tempest braucht Beispiele, keine Leichen.',
        choices: [{ id: 'end', label: 'Zur Osthandelsroute' }]
      },
      {
        id: 'deserter-done',
        speaker: 'Gobta',
        text: 'Die Route ist wieder offen, und du hast nicht mehr Blut vergossen als nötig. Genau so gewinnt Tempest Vertrauen. Danke.',
        choices: [{ id: 'end', label: 'Verstanden' }]
      },
      {
        id: 'after',
        speaker: 'Gobta',
        text: 'Noch greift niemand an. Aber Misstrauen riecht Ranga schon, bevor jemand eine Waffe zieht.',
        choices: [{ id: 'end', label: 'Verstanden' }]
      },
      {
        id: 'muster',
        speaker: 'Gobta',
        text: 'Menschenpatrouillen zählen unsere Feuer. Noch ist es Misstrauen, kein Krieg. Wenn du freiwillig gehst, führt Rangas Markierung am westlichen Hainrand ins Geistmoor. Stoppe den Kampf — und bring alle lebend zurück.',
        choices: [{ id: 'end', label: 'Westpfad ins Geistmoor' }]
      },
      {
        id: 'act2-done',
        speaker: 'Gobta',
        text: 'Die Grenze hält, und die gerettete Patrouille erzählt jetzt eine andere Geschichte über Tempest. Rangas kalte Siegelspur beweist nur: Hinter der Vorhut steht jemand, der Misstrauen als Waffe benutzt. Noch kennen wir keinen Namen.',
        choices: [{ id: 'end', label: 'Wir bereiten uns vor' }]
      },
      {
        id: 'alliance-gobta',
        speaker: 'Gobta',
        text: 'Die Patrouille, die wir gerettet haben, schickt zwei Fackelzeichen. Keine Armee — nur ein sicherer Korridor. Wenn wir dort marschieren, sieht die Grenze ein Bündnis und keinen Überfall.',
        choices: [{ id: 'end', label: 'Gobtas Route steht' }]
      }
    ]
  },
  {
    id: 'eir-marsh',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Moorhüterin Eir',
        text: 'Ein Wanderer aus dem Hain? Sei vorsichtig — das Moor faulte nicht von selbst. Eine schwärende Blüte vergiftet die Nebelmoor-Tiefe und lockt die Echos an.',
        choices: [
          {
            id: 'accept-cleanse',
            label: 'Die Fäulnis tilgen',
            nextNodeId: 'cleanse-accepted',
            requirements: [
              { flag: 'story.act1.completed' },
              { questStatus: { questId: 'marsh-cleansing', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'marsh-cleansing' },
              { type: 'complete-quest-step', questId: 'marsh-cleansing', stepId: 'accept-cleanse' },
              { type: 'set-flag', flag: 'sidequest.cleanse.started', value: true }
            ]
          },
          {
            id: 'report-cleanse',
            label: 'Fäulnis getilgt melden',
            nextNodeId: 'cleanse-done',
            requirements: [
              { questStatus: { questId: 'marsh-cleansing', status: 'active' } },
              { flag: 'sidequest.cleanse.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'marsh-cleansing', stepId: 'report-cleanse' },
              { type: 'complete-quest', questId: 'marsh-cleansing' },
              { type: 'add-gold', amount: 130 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          {
            id: 'end',
            label: 'Später'
          }
        ]
      },
      {
        id: 'cleanse-accepted',
        speaker: 'Moorhüterin Eir',
        text: 'Die Blüte wuchert in der Nebelmoor-Tiefe im Osten. Brich sie und das, was sie beschützt — dann atmet das Moor wieder.',
        choices: [{ id: 'end', label: 'Zur Nebelmoor-Tiefe' }]
      },
      {
        id: 'cleanse-done',
        speaker: 'Moorhüterin Eir',
        text: 'Der Nebel klart schon auf. Du hast dem Moor etwas zurückgegeben — und Tempest einen Verbündeten im Hüterkreis. Nimm das als Dank.',
        choices: [{ id: 'end', label: 'Gern geschehen' }]
      }
    ]
  },
  {
    id: 'kael-shrine',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Schreinwächter Kael',
        text: 'Du hast es bis hier herauf geschafft? Dann hör zu: Ein Sturmecho hat die Westterrasse erfasst und zerrt an der Bindung. Bann es, bevor es die anderen Echos mitreißt.',
        choices: [
          {
            id: 'accept-vigil',
            label: 'Das Sturmecho bannen',
            nextNodeId: 'vigil-accepted',
            requirements: [
              { flag: 'story.act1.completed' },
              { questStatus: { questId: 'shrine-vigil', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'shrine-vigil' },
              { type: 'complete-quest-step', questId: 'shrine-vigil', stepId: 'accept-vigil' },
              { type: 'set-flag', flag: 'sidequest.vigil.started', value: true }
            ]
          },
          {
            id: 'report-vigil',
            label: 'Sturmecho gebannt melden',
            nextNodeId: 'vigil-done',
            requirements: [
              { questStatus: { questId: 'shrine-vigil', status: 'active' } },
              { flag: 'sidequest.vigil.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'shrine-vigil', stepId: 'report-vigil' },
              { type: 'complete-quest', questId: 'shrine-vigil' },
              { type: 'add-gold', amount: 160 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          {
            id: 'end',
            label: 'Später'
          }
        ]
      },
      {
        id: 'vigil-accepted',
        speaker: 'Schreinwächter Kael',
        text: 'Die Westterrasse liegt unter dem Schreingipfel. Folge dem Heulen — und brich das Echo, das es ausspeit.',
        choices: [{ id: 'end', label: 'Zur Westterrasse' }]
      },
      {
        id: 'vigil-done',
        speaker: 'Schreinwächter Kael',
        text: 'Der Wind steht still. Zum ersten Mal seit langem höre ich den Schrein wieder atmen. Tempest hat sich einen Späher am Rand der Welt verdient — nimm das.',
        choices: [{ id: 'end', label: 'Gern geschehen' }]
      }
    ]
  },
  {
    id: 'ranga-pact',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Ranga',
        text: 'Der große Wolf des Rudels senkt den Kopf. Seit du das Rudel bezwungen hast, mustert er dich mit ruhigen Augen — bereit, einen Pakt einzugehen.',
        choices: [
          {
            id: 'seal-pact',
            label: 'Den Pakt mit Ranga schließen',
            nextNodeId: 'pact-sealed',
            requirements: [
              { flag: 'story.direwolf.defeated' },
              { notFlag: 'story.direwolf.pact' }
            ],
            effects: [
              { type: 'recruit-character', characterId: 'ranga' },
              { type: 'set-flag', flag: 'story.direwolf.pact', value: true },
              { type: 'set-flag', flag: 'faction.direwolves.respected', value: true },
              { type: 'set-flag', flag: 'mount.direwolf.seed', value: true },
              { type: 'set-flag', flag: 'progression.gobta.wolf-fang-token', value: true }
            ]
          },
          { id: 'end', label: 'Noch nicht' }
        ]
      },
      {
        id: 'pact-sealed',
        speaker: 'Ranga',
        text: 'Der Wolf — Ranga — tritt an deine Seite. Von nun an jagt er mit Tempest und trägt dich, wohin der Sturm auch zieht.',
        choices: [{ id: 'end', label: 'Willkommen, Ranga' }]
      }
    ]
  },
  {
    id: 'ranga-scout',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Ranga',
        text: 'Ranga hebt den Kopf. Gobtas Markierungen liegen auf dem Pfad, aber der Geruch darunter ist alt — Erde, Sporen und ein fremdes Echo.',
        choices: [
          {
            id: 'scout-route',
            label: 'Scoutbericht annehmen',
            nextNodeId: 'scouted',
            requirements: [
              { questStatus: { questId: 'binding-of-ancestors', status: 'active' } },
              { flag: 'story.gobta.ready' },
              { notFlag: 'story.ranga.ready' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.ranga.ready', value: true },
              { type: 'set-flag', flag: 'story.lyrre.ready', value: true },
              { type: 'set-flag', flag: 'scout.whispering-grove', value: true },
              { type: 'set-flag', flag: 'scout.border-route', value: true },
              { type: 'set-flag', flag: 'scout.ambush.whispering-grove', value: true }
            ]
          },
          {
            id: 'after',
            label: 'Scoutbericht wiederholen',
            nextNodeId: 'after',
            requirements: [{ flag: 'story.ranga.ready' }]
          },
          {
            id: 'alliance-ranga',
            label: 'Rückzugsspur für den Bündnisrat',
            nextNodeId: 'alliance-ranga',
            requirements: [
              { questStatus: { questId: 'ancestors-choice', status: 'active' } },
              { missingQuestStep: { questId: 'ancestors-choice', stepId: 'rally' } },
              { flag: 'story.direwolf.pact' },
              { notFlag: 'story.alliance.ranga-ready' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.alliance.ranga-ready', value: true },
              { type: 'set-flag', flag: 'bond.ranga.trust-act3', value: true },
              { type: 'recruit-character', characterId: 'ranga' }
            ]
          },
          { id: 'end', label: 'Später' }
        ]
      },
      {
        id: 'scouted',
        speaker: 'Ranga',
        text: 'Rangas Spur ist klar: Der Hain reagiert nicht auf Hunger, sondern auf Namen. Er markiert den Hainrand, die spätere Grenzroute und einen möglichen Hinterhalt im Unterholz.',
        choices: [{ id: 'end', label: 'Zum Rat zurück' }]
      },
      {
        id: 'after',
        speaker: 'Ranga',
        text: 'Der sichere Pfad bleibt markiert. Ranga trägt euch nur zu Orten, die Tempest wirklich kennt und die gerade nicht unter Feinddruck stehen.',
        choices: [{ id: 'end', label: 'Guter Junge' }]
      },
      {
        id: 'alliance-ranga',
        speaker: 'Ranga',
        text: 'Ranga legt die Ohren an den kalten Siegelstaub. „Der Hüter hetzt andere vor. Ich halte die Rückzugsspur offen und beiße zu, wenn er wieder jemanden als Schild benutzt.“',
        choices: [{ id: 'end', label: 'Rangas Spur steht' }]
      }
    ]
  },
  {
    id: 'border-survivor',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Grenzspäherin',
        text: 'Die Patrouillenführerin hält ihre verletzte Seite und erwartet den letzten Schlag. Hinter ihr flackern silberne Fäden an weggeworfenen Waffen — fremde Siegelmagie, nicht Tempests Spur.',
        choices: [
          {
            id: 'aid-survivors',
            label: 'Waffen senken und Verwundete versorgen',
            nextNodeId: 'deescalated',
            requirements: [
              { questStatus: { questId: 'border-escalation', status: 'active' } },
              { flag: 'story.border.cleared' },
              { notFlag: 'story.border.deescalated' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.border.deescalated', value: true },
              { type: 'set-flag', flag: 'codex.border-deescalation', value: true },
              { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'border-clash' }
            ]
          }
        ]
      },
      {
        id: 'deescalated',
        speaker: 'Grenzspäherin',
        text: '„Wir melden, dass Tempest uns besiegt und gerettet hat.“ Sie übergibt Shuna einen kalten Siegelspan. „Die Stimme, die uns hierhertrieb, nannte keinen Namen.“',
        choices: [{ id: 'end', label: 'Mit dem Siegelspan zurück nach Tempest' }]
      }
    ]
  },
  {
    id: 'ranga-vanguard-trace',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Ranga',
        text: 'Ranga kreist um den gebrochenen Siegelanker. Die Spur riecht nach kaltem Metall und geliehener Magie; sie führt aus dem Moor, verliert sich aber absichtlich vor jedem Lager.',
        choices: [
          {
            id: 'secure-trace',
            label: 'Rückzugsspur sichern',
            nextNodeId: 'secured',
            requirements: [
              { questStatus: { questId: 'border-escalation', status: 'active' } },
              { flag: 'story.vanguard.broken' },
              { notFlag: 'story.vanguard.trace-read' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.vanguard.trace-read', value: true },
              { type: 'complete-quest-step', questId: 'border-escalation', stepId: 'break-vanguard' }
            ]
          }
        ]
      },
      {
        id: 'secured',
        speaker: 'Ranga',
        text: '„Kein Name. Kein Lager. Nur ein Befehl, der andere vorschickt.“ Ranga markiert den Rückweg. Gobta wartet in Tempest auf den Bericht.',
        choices: [{ id: 'end', label: 'Über den Westpfad nach Tempest' }]
      }
    ]
  },
  {
    id: 'kijin-naming',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Hakurou',
        text: 'Sechs Oger haben ihr Dorf an die Orks verloren und in Tempest Zuflucht gefunden. Der alte Schwertmeister verneigt sich: „Slime-Herr, gib uns Namen — und wir folgen dir als Kijin, bis der Sturm sich legt.“',
        choices: [
          {
            id: 'name-them',
            label: 'Die Oger benennen (Benimaru, Shion, Hakurou, Kurobe, Souei)',
            nextNodeId: 'named',
            requirements: [
              { flag: 'story.slime-prologue.completed' },
              { notFlag: 'story.kijin.named' }
            ],
            effects: [
              { type: 'recruit-character', characterId: 'benimaru' },
              { type: 'recruit-character', characterId: 'shion' },
              { type: 'recruit-character', characterId: 'hakurou' },
              // Kurobe wird benannt, bleibt aber Schmied — kein Kampfroster-Beitritt.
              { type: 'recruit-character', characterId: 'souei' },
              { type: 'set-flag', flag: 'story.kijin.named', value: true },
              { type: 'set-flag', flag: 'faction.kijin.sworn', value: true }
            ]
          },
          { id: 'end', label: 'Noch nicht' }
        ]
      },
      {
        id: 'named',
        speaker: 'Hakurou',
        text: 'Mit jedem Namen lodert die Magie auf — die Oger steigen zu Kijin auf. Benimaru, Shion, Hakurou, Kurobe und Souei knien nieder und schwören Tempest ewige Gefolgschaft.',
        choices: [{ id: 'end', label: 'Willkommen bei Tempest' }]
      }
    ]
  },
  {
    id: 'tempest-rest',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Tempest-Lager',
        text: 'Das Lagerfeuer brennt niedrig. Hier kann die Gruppe verschnaufen, Wunden schließen und kurz besprechen, was gerade geschehen ist.',
        choices: [
          {
            id: 'rest',
            label: 'Rasten und Kräfte sammeln',
            nextNodeId: 'rested',
            requirements: [{ flag: 'story.slime-prologue.completed' }],
            effects: [
              { type: 'restore-party' },
              { type: 'set-flag', flag: 'rest.tempest.used', value: true }
            ]
          },
          {
            id: 'save',
            label: 'Spielstand am Lager sichern',
            nextNodeId: 'saved',
            requirements: [{ flag: 'story.slime-prologue.completed' }],
            effects: [
              { type: 'set-flag', flag: 'rest.tempest.saved', value: true }
            ]
          },
          {
            id: 'talk-ranga-pact',
            label: 'Gespräch: Gobta und Ranga',
            nextNodeId: 'talk-ranga-pact',
            requirements: [
              { flag: 'story.direwolf.pact' },
              { notFlag: 'partytalk.ranga-pact' }
            ],
            effects: [
              { type: 'set-flag', flag: 'partytalk.ranga-pact', value: true },
              { type: 'set-flag', flag: 'bond.gobta.ranga-camp', value: true }
            ]
          },
          {
            id: 'talk-council',
            label: 'Gespräch: Erster Rat',
            nextNodeId: 'talk-council',
            requirements: [
              { flag: 'story.council.ready' },
              { notFlag: 'partytalk.first-council' }
            ],
            effects: [
              { type: 'set-flag', flag: 'partytalk.first-council', value: true },
              { type: 'set-flag', flag: 'bond.shuna.council-camp', value: true }
            ]
          },
          {
            id: 'talk-grove',
            label: 'Gespräch: Nach dem Flüsterhain',
            nextNodeId: 'talk-grove',
            requirements: [
              { flag: 'story.grove.cleared' },
              { notFlag: 'partytalk.after-grove' }
            ],
            effects: [
              { type: 'set-flag', flag: 'partytalk.after-grove', value: true },
              { type: 'set-flag', flag: 'bond.ranga.grove-camp', value: true }
            ]
          },
          {
            id: 'talk-echo',
            label: 'Gespräch: Nach dem Echo',
            nextNodeId: 'talk-echo',
            requirements: [
              { flag: 'story.boss.echo-defeated' },
              { notFlag: 'partytalk.after-echo' }
            ],
            effects: [
              { type: 'set-flag', flag: 'partytalk.after-echo', value: true },
              { type: 'set-flag', flag: 'bond.rigurd.echo-camp', value: true }
            ]
          },
          { id: 'end', label: 'Weiterziehen' }
        ]
      },
      {
        id: 'rested',
        speaker: 'Tempest-Lager',
        text: 'Kräuterduft, warmes Wasser und ein paar ruhige Atemzüge reichen. Die aktive Gruppe ist wieder einsatzbereit.',
        choices: [{ id: 'end', label: 'Zurück nach Tempest' }]
      },
      {
        id: 'saved',
        speaker: 'Tempest-Lager',
        text: 'Der aktuelle Stand ist gesichert. Party, Inventar, Quests und Position bleiben erhalten.',
        choices: [{ id: 'end', label: 'Weiter' }]
      },
      {
        id: 'talk-ranga-pact',
        speaker: 'Gobta',
        text: 'Gobta grinst, während Ranga sich ans Feuer legt: „Wenn ich auf ihm reiten darf, komme ich nie wieder zu spät.“ Ranga antwortet nur mit einem zufriedenen Knurren.',
        choices: [{ id: 'end', label: 'Die beiden verstehen sich' }]
      },
      {
        id: 'talk-council',
        speaker: 'Shuna',
        text: 'Shuna legt die Siegelzeichen ins Feuerlicht. „Ein Rat ist kein Ritual, Rimuru. Aber wenn alle ihren Platz kennen, wird aus Angst eine Form.“',
        choices: [{ id: 'end', label: 'Tempest nimmt Form an' }]
      },
      {
        id: 'talk-grove',
        speaker: 'Ranga',
        text: 'Ranga hebt die Schnauze. „Der Hain roch nach Namen, nicht nach Beute.“ Gobta nickt sofort: „Also beim nächsten Mal erst Shuna fragen, dann kämpfen.“',
        choices: [{ id: 'end', label: 'Gute Lektion' }]
      },
      {
        id: 'talk-echo',
        speaker: 'Rigurd',
        text: 'Rigurd betrachtet den Namensstein. „Das Echo wollte Ordnung ohne Menschen darin. Tempest muss das Gegenteil beweisen: Ordnung, weil Leute bleiben wollen.“',
        choices: [{ id: 'end', label: 'Das ist Tempests Aufgabe' }]
      }
    ]
  },
  {
    id: 'gazel-dwargo',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'König Gazel Dwargo',
        text: 'Der Heldenkönig mustert den Schleim. „Ein Zwischenfall in der Werkstatt — Minister Vestas Faktion bezichtigt meinen Meisteringenieur Kaijin. Du sprichst für ihn? Dann höre mein Urteil.“',
        choices: [
          {
            id: 'plead',
            label: 'Für Kaijin sprechen',
            nextNodeId: 'verdict',
            requirements: [{ notFlag: 'craft.smithing.unlocked' }],
            effects: [
              { type: 'start-quest', questId: 'dwargon-craft' },
              { type: 'complete-quest-step', questId: 'dwargon-craft', stepId: 'enter' },
              { type: 'complete-quest-step', questId: 'dwargon-craft', stepId: 'judgment' },
              { type: 'set-flag', flag: 'story.dwargon.entered', value: true },
              { type: 'set-flag', flag: 'craft.smithing.unlocked', value: true }
            ]
          },
          { id: 'leave', label: 'Später wiederkommen' }
        ]
      },
      {
        id: 'verdict',
        speaker: 'König Gazel Dwargo',
        text: 'Gazel nickt langsam. „Kaijin und seine Brüder verlassen Dwargon ehrenhaft — kein Exil, sondern ein Auftrag. Geh zu ihm an der Schmiede; baut etwas, das diese Welt noch nicht gesehen hat.“',
        choices: [{ id: 'end', label: 'Danke, Heldenkönig' }]
      }
    ]
  },
  {
    id: 'kaijin-forge',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Kaijin',
        text: 'Der Meisteringenieur wischt sich Ruß von den Händen. „Der König hat gesprochen — und du bist für mich eingestanden. Garm, Dord und Myrd sind bereit. Sag das Wort, und wir bauen Tempest eine echte Schmiede.“',
        choices: [
          {
            id: 'recruit',
            label: 'Komm mit nach Tempest',
            nextNodeId: 'joined',
            requirements: [{ flag: 'craft.smithing.unlocked' }, { notFlag: 'faction.dwargon.allied' }],
            effects: [
              // Kaijin zieht als Schmiede-NPC nach Tempest, nicht als Kaempfer.
              { type: 'set-flag', flag: 'faction.dwargon.allied', value: true },
              { type: 'complete-quest-step', questId: 'dwargon-craft', stepId: 'smiths' },
              { type: 'complete-quest', questId: 'dwargon-craft' },
              { type: 'add-gold', amount: 120 },
              { type: 'add-item', itemId: 'magisteel', quantity: 1 }
            ]
          },
          { id: 'end', label: 'Bald — haltet euch bereit' }
        ]
      },
      {
        id: 'joined',
        speaker: 'Kaijin',
        text: 'Kaijin lacht dröhnend. „Dann ist es beschlossen! Magisteel, Magiewerkzeug, eine Esse, die nie erlischt — Dwargons Handwerk gehört nun auch Tempest.“',
        choices: [{ id: 'end', label: 'Willkommen bei Tempest' }]
      }
    ]
  },
  {
    id: 'fuze-blumund',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Gildenmeister Fuze',
        text: 'Fuze legt die Feder beiseite. „Eine Föderation von Monstern, die Handel statt Beute sucht? Blumund lebt von verlässlichen Berichten. Meldet euch offiziell an und gleicht eure Jura-Route mit meinen Abenteurern ab.“',
        choices: [
          {
            id: 'register',
            label: 'Tempest offiziell anmelden',
            nextNodeId: 'registered',
            requirements: [{ notFlag: 'story.blumund.entered' }],
            effects: [
              { type: 'start-quest', questId: 'blumund-guild' },
              { type: 'complete-quest-step', questId: 'blumund-guild', stepId: 'register' },
              { type: 'set-flag', flag: 'story.blumund.entered', value: true }
            ]
          },
          {
            id: 'seal-trade',
            label: 'Den geprüften Bericht vorlegen',
            nextNodeId: 'allied',
            requirements: [
              { flag: 'story.blumund.guild-tested' },
              { notFlag: 'faction.blumund.allied' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'blumund-guild', stepId: 'trade-seal' },
              { type: 'complete-quest', questId: 'blumund-guild' },
              { type: 'set-flag', flag: 'faction.blumund.allied', value: true },
              { type: 'set-flag', flag: 'trade.blumund.unlocked', value: true },
              { type: 'add-gold', amount: 180 },
              { type: 'add-item', itemId: 'full-potion', quantity: 1 }
            ]
          },
          { id: 'leave', label: 'Die Gilde später aufsuchen' }
        ]
      },
      {
        id: 'registered',
        speaker: 'Gildenmeister Fuze',
        text: '„Kaval, Eren und Gido warten am Markt. Wenn ihre Karte und euer Bericht übereinstimmen, haben wir eine Grundlage — keine bloße Hoffnung.“',
        choices: [{ id: 'end', label: 'Wir sprechen mit ihnen' }]
      },
      {
        id: 'allied',
        speaker: 'Gildenmeister Fuze',
        text: 'Fuze setzt sein Siegel unter den Bericht. „Dann gilt Tempest in Blumund als verlässlicher Handelspartner. Eure Tränke, unser Markt und offene Augen auf beiden Seiten.“',
        choices: [{ id: 'end', label: 'Auf gute Nachbarschaft' }]
      }
    ]
  },
  {
    id: 'blumund-adventurers',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Kaval, Eren & Gido',
        text: 'Eren breitet eine Karte aus, während Kaval die Waldpfade und Gido die gefährlichen Furten markiert. Tempests sichere Route deckt sich mit ihren Aufzeichnungen — einschließlich der Stellen, an denen Reisende besser umkehren.',
        choices: [
          {
            id: 'compare',
            label: 'Den Jura-Bericht abgleichen',
            nextNodeId: 'verified',
            requirements: [
              { questStatus: { questId: 'blumund-guild', status: 'active' } },
              { missingQuestStep: { questId: 'blumund-guild', stepId: 'route-report' } }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'blumund-guild', stepId: 'route-report' },
              { type: 'set-flag', flag: 'story.blumund.guild-tested', value: true }
            ]
          },
          { id: 'end', label: 'Später weiterreden' }
        ]
      },
      {
        id: 'verified',
        speaker: 'Eren',
        text: '„Das genügt Fuze. Und ehrlich? Ein sicherer Rastplatz im Jura-Wald wäre uns lieber als noch ein Heldengrab. Bringt ihm den Bericht.“',
        choices: [{ id: 'end', label: 'Zurück ins Gildenhaus' }]
      }
    ]
  },
  {
    id: 'treyni-plea',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Treyni',
        text: 'Die Dryade tritt aus dem Schatten der Bäume. „Slime-Herr von Tempest — der Hunger treibt eine Ork-Armee in meinen Wald. Ein gewisser Gelmud hat ihrem Lord einen Namen geschenkt, um eine Katastrophe zu erzwingen. Stell dich ihm, und die Waldvölker stehen an deiner Seite.“',
        choices: [
          {
            id: 'accept',
            label: 'Tempest stellt sich dem Heerzug',
            nextNodeId: 'rally',
            requirements: [{ notFlag: 'story.orc.engaged' }],
            effects: [
              { type: 'start-quest', questId: 'geld-disaster' },
              { type: 'complete-quest-step', questId: 'geld-disaster', stepId: 'plea' },
              { type: 'set-flag', flag: 'story.treyni.met', value: true }
            ]
          },
          { id: 'leave', label: 'Noch nicht bereit' }
        ]
      },
      {
        id: 'rally',
        speaker: 'Treyni',
        text: 'Treyni nickt ernst. „Dann beginnt es. Die Vorhut bricht bereits durch das Unterholz — halte sie auf, ehe sie das Lager erreicht.“',
        choices: [{ id: 'end', label: 'In die Schlacht' }]
      }
    ]
  },
  {
    id: 'geld-federation',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Rigurd',
        text: 'Über dem stillgewordenen Heerfeld hebt Rigurd die Stimme. „Geld ist gefallen — und du hast seinen Hunger genommen, nicht nur sein Leben. Die verschonten Orks, die Echsenmenschen, die Waldgeister … sie alle blicken auf Tempest. Schmieden wir daraus ein Bündnis?“',
        choices: [
          {
            id: 'found',
            label: 'Die Jura-Tempest-Föderation gründen',
            nextNodeId: 'founded',
            requirements: [{ notFlag: 'faction.orcs.joined' }],
            effects: [
              { type: 'set-flag', flag: 'faction.orcs.joined', value: true },
              { type: 'complete-quest-step', questId: 'geld-disaster', stepId: 'federation' },
              { type: 'complete-quest', questId: 'geld-disaster' },
              { type: 'add-gold', amount: 320 },
              { type: 'add-item', itemId: 'famine-charm', quantity: 1 }
            ]
          },
          { id: 'wait', label: 'Den Völkern noch Zeit geben' }
        ]
      },
      {
        id: 'founded',
        speaker: 'Rigurd',
        text: 'Jubel brandet auf. „So sei es — die Jura-Tempest-Föderation steht! Ein überlebender Hoch-Ork trägt nun den Namen Geld und führt die Orks als Aufbauhelfer. Tempest ist keine Insel mehr.“',
        choices: [{ id: 'end', label: 'Ein neuer Anfang' }]
      }
    ]
  },
  {
    id: 'milim-honey',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Milim Nava',
        text: 'Ein kleines Mädchen mit uralten Augen landet vor Rimuru. „Du hast einen Disaster verschlungen! Bist du stark? Bist du interessant? Kämpf mit mir — oder …“ Ihr Blick fällt auf das Honiggefäß in Rimurus Hand.',
        choices: [
          {
            id: 'honey',
            label: 'Ihr den Honig anbieten',
            nextNodeId: 'friends',
            requirements: [{ notFlag: 'story.milim.met' }],
            effects: [
              { type: 'set-flag', flag: 'story.milim.met', value: true }
            ]
          },
          { id: 'later', label: 'Vorsichtig ausweichen' }
        ]
      },
      {
        id: 'friends',
        speaker: 'Milim Nava',
        text: 'Milims Augen leuchten. „DAS ist ja köstlich! Gut — wir sind jetzt Freunde! Wenn du jemals eine Dämonenlordin an deiner Seite brauchst, ruf nach Milim!“ Aus dem Test wurde ein Bündnis.',
        choices: [{ id: 'end', label: 'Willkommen, Milim' }]
      }
    ]
  },
  {
    id: 'souka-alliance',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Souka',
        text: 'Die Kommandantin der Echsenmenschen misst Rimuru kühl. „Die Orks marschieren — und mein Häuptling sucht Verbündete. Doch sein Sohn Gabiru glaubt, sein Speer allein genüge. Beweist Tempest seine Stärke, ehe wir uns binden.“',
        choices: [
          {
            id: 'parley',
            label: 'Soukas Warnung annehmen',
            nextNodeId: 'await-duel',
            requirements: [{ notFlag: 'story.lizard.met' }],
            effects: [
              { type: 'start-quest', questId: 'lizard-alliance' },
              { type: 'complete-quest-step', questId: 'lizard-alliance', stepId: 'parley' },
              { type: 'set-flag', flag: 'story.lizard.met', value: true }
            ]
          },
          {
            id: 'seal',
            label: 'Das Bündnis besiegeln',
            nextNodeId: 'allied',
            requirements: [
              { flag: 'story.gabiru.humbled' },
              { notFlag: 'story.lizard.allied' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.lizard.allied', value: true },
              { type: 'complete-quest-step', questId: 'lizard-alliance', stepId: 'ally' },
              { type: 'complete-quest', questId: 'lizard-alliance' },
              { type: 'add-gold', amount: 200 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          { id: 'leave', label: 'Später wiederkommen' }
        ]
      },
      {
        id: 'await-duel',
        speaker: 'Souka',
        text: 'Souka deutet zum Schilfkessel. „Gabiru wartet dort mit seiner Garde. Brich seinen Hochmut — danach hört auch er auf Vernunft.“',
        choices: [{ id: 'end', label: 'Zum Schilfkessel' }]
      },
      {
        id: 'allied',
        speaker: 'Souka',
        text: 'Souka verneigt sich knapp. „Gabiru kniet — sein Stolz ist gebrochen, nicht sein Mut. Die Echsenmenschen stehen nun an Tempests Seite. Den Rest seiner Läuterung trägt Gabiru selbst.“',
        choices: [{ id: 'end', label: 'Für das Bündnis' }]
      }
    ]
  },
  {
    id: 'shizu-vow',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Shizu',
        text: 'Hinter einer feinen Maske mustert dich eine müde Frau. „Ein maskierter Majin hat das Feuer in mir geweckt — Ifrit will heraus. Ich halte ihn, so lange ich kann. Bitte … nimm dem Majin die Schnur, ehe die Flamme alles verschlingt.“',
        choices: [
          {
            id: 'meet',
            label: 'Shizu beistehen',
            nextNodeId: 'await',
            requirements: [{ notFlag: 'story.shizu.met' }],
            effects: [
              { type: 'start-quest', questId: 'shizu-vow' },
              { type: 'complete-quest-step', questId: 'shizu-vow', stepId: 'meet-shizu' },
              { type: 'set-flag', flag: 'story.shizu.met', value: true }
            ]
          },
          {
            id: 'take-vow',
            label: 'Shizus letzten Schwur annehmen',
            nextNodeId: 'vowed',
            requirements: [
              { flag: 'story.ifrit.subdued' },
              { notFlag: 'story.shizu.vow' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.shizu.vow', value: true },
              { type: 'complete-quest-step', questId: 'shizu-vow', stepId: 'vow' },
              { type: 'complete-quest', questId: 'shizu-vow' },
              { type: 'add-gold', amount: 260 },
              { type: 'add-item', itemId: 'spirit-ember', quantity: 1 }
            ]
          },
          { id: 'leave', label: 'Noch einen Moment' }
        ]
      },
      {
        id: 'await',
        speaker: 'Shizu',
        text: 'Shizu presst die Maske fester an. „Der Majin treibt sich tiefer in der Lavakammer herum. Brich seine Kontrolle — dann stelle dich Ifrit selbst.“',
        choices: [{ id: 'end', label: 'In die Lavakammer' }]
      },
      {
        id: 'vowed',
        speaker: 'Shizu',
        text: 'Ihre Maske fällt. „Danke … beschütze die Kinder, die wie ich gerufen wurden.“ Mit ihrem letzten Wunsch nimmt Rimuru sie in sich auf — und gewinnt eine menschliche Gestalt und Ifrits Flamme. Ein Schwur, der weit über diesen Tag hinausreicht.',
        choices: [{ id: 'end', label: 'Ich schwöre es' }]
      }
    ]
  },
  {
    id: 'tempest-builders',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Kurobe & Kaijin',
        text: 'Zwischen Kurobes feinen Klingen und Kaijins schweren Magisteel-Essen wächst ein Werkviertel, das weder Ogerdorf noch Zwergenfeste kopiert. „Tempest braucht seinen eigenen Baustil“, sagt Kurobe. Kaijin nickt: „Und genug Platz für die nächste Esse.“',
        choices: [{ id: 'end', label: 'Tempest wächst zusammen' }]
      }
    ]
  }
] as const satisfies readonly DialogDefinition[];

export const NPCS = [
  {
    id: 'sealed-storm-dragon',
    name: 'Veldora',
    mapId: 'sealed-cave',
    position: { x: 7, y: 3 },
    dialogId: 'sealed-storm-dragon',
    color: 0x6ec6ff
  },
  {
    id: 'ranga',
    name: 'Ranga',
    mapId: 'direwolf-den',
    position: { x: 10, y: 5 },
    dialogId: 'ranga-pact',
    color: 0x9fb6d6,
    // Erscheint erst, wenn das Rudel unterworfen ist — nicht vor dem Kampf.
    requirements: [{ flag: 'story.direwolf.defeated' }]
  },
  {
    id: 'rigurd',
    name: 'Rigurd',
    mapId: 'goblin-village',
    position: { x: 8, y: 5 },
    dialogId: 'rigurd-intro',
    color: 0xe9c56c
  },
  {
    id: 'rigurd-tempest',
    name: 'Rigurd',
    mapId: 'tempest-start',
    position: { x: 2, y: 4 },
    dialogId: 'rigurd-act1',
    color: 0xe9c56c,
    requirements: [
      { flag: 'story.slime-prologue.completed' },
      { notFlag: 'story.council.ready' }
    ]
  },
  {
    id: 'rigurd-council',
    name: 'Rigurd',
    mapId: 'tempest-start',
    position: { x: 3, y: 6 },
    dialogId: 'rigurd-act1',
    color: 0xe9c56c,
    requirements: [
      { flag: 'story.council.ready' },
      { notFlag: 'story.act1.completed' }
    ]
  },
  {
    id: 'rigurd-established',
    name: 'Rigurd',
    mapId: 'tempest-start',
    position: { x: 4, y: 7 },
    dialogId: 'rigurd-act1',
    color: 0xe9c56c,
    requirements: [{ flag: 'story.act1.completed' }]
  },
  {
    id: 'shuna',
    name: 'Shuna',
    mapId: 'tempest-start',
    position: { x: 7, y: 3 },
    dialogId: 'shuna-ritual',
    color: 0xf0b7ff,
    requirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'gobta',
    name: 'Gobta',
    mapId: 'tempest-start',
    position: { x: 8, y: 5 },
    dialogId: 'gobta-border',
    color: 0x9ff0a4,
    requirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'ranga-tempest',
    name: 'Ranga',
    mapId: 'tempest-start',
    position: { x: 9, y: 5 },
    dialogId: 'ranga-scout',
    color: 0x9fb6d6,
    requirements: [{ flag: 'story.direwolf.pact' }]
  },
  {
    id: 'border-survivor',
    name: 'Verwundete Grenzspäherin',
    mapId: 'spirit-marsh',
    position: { x: 6, y: 11 },
    dialogId: 'border-survivor',
    color: 0xd7c3a5,
    requirements: [
      { flag: 'story.border.cleared' },
      { notFlag: 'story.border.deescalated' }
    ]
  },
  {
    id: 'ranga-vanguard-trace',
    name: 'Ranga',
    mapId: 'spirit-marsh',
    position: { x: 18, y: 5 },
    dialogId: 'ranga-vanguard-trace',
    color: 0x9fb6d6,
    requirements: [
      { flag: 'story.direwolf.pact' },
      { flag: 'story.vanguard.broken' },
      { notFlag: 'story.vanguard.trace-read' }
    ]
  },
  {
    id: 'eir',
    name: 'Moorhüterin Eir',
    mapId: 'spirit-marsh',
    position: { x: 4, y: 8 },
    dialogId: 'eir-marsh',
    color: 0x6fd0b0
  },
  {
    id: 'kael',
    name: 'Schreinwächter Kael',
    mapId: 'spirit-highlands',
    position: { x: 3, y: 9 },
    dialogId: 'kael-shrine',
    color: 0xbcd2ff
  },
  {
    id: 'hakurou-camp',
    name: 'Hakurou',
    mapId: 'tempest-start',
    position: { x: 6, y: 5 },
    dialogId: 'kijin-naming',
    color: 0xd66c6c,
    // Die geflüchteten Oger erscheinen im Dorf, sobald das Slime-Prolog-Kapitel steht.
    requirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'tempest-camp',
    name: 'Tempest-Lager',
    mapId: 'tempest-start',
    position: { x: 7, y: 7 },
    dialogId: 'tempest-rest',
    color: 0xf0d078,
    requirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'kurobe-tempest',
    name: 'Kurobe',
    mapId: 'tempest-start',
    position: { x: 12, y: 6 },
    dialogId: 'tempest-builders',
    color: 0x9d6c4a,
    requirements: [{ flag: 'story.kijin.named' }, { flag: 'faction.dwargon.allied' }]
  },
  {
    id: 'kaijin-tempest',
    name: 'Kaijin',
    mapId: 'tempest-start',
    position: { x: 15, y: 6 },
    dialogId: 'tempest-builders',
    color: 0xd2a679,
    requirements: [{ flag: 'story.kijin.named' }, { flag: 'faction.dwargon.allied' }]
  },
  {
    id: 'gazel-dwargo',
    name: 'König Gazel Dwargo',
    mapId: 'dwargon',
    position: { x: 12, y: 3 },
    dialogId: 'gazel-dwargo',
    color: 0xc9d4e0
  },
  {
    id: 'kaijin-dwargon',
    name: 'Kaijin',
    mapId: 'dwargon',
    position: { x: 6, y: 9 },
    dialogId: 'kaijin-forge',
    color: 0xd2a679,
    // Erscheint erst nach Gazels Urteil (Schmiedekunst freigeschaltet).
    requirements: [{ flag: 'craft.smithing.unlocked' }]
  },
  {
    id: 'fuze-blumund',
    name: 'Gildenmeister Fuze',
    mapId: 'blumund',
    position: { x: 9, y: 4 },
    dialogId: 'fuze-blumund',
    color: 0xc6b58a
  },
  {
    id: 'blumund-adventurers',
    name: 'Kaval, Eren & Gido',
    mapId: 'blumund',
    position: { x: 14, y: 7 },
    dialogId: 'blumund-adventurers',
    color: 0x7ba9c4
  },
  {
    id: 'treyni-battlefield',
    name: 'Treyni',
    mapId: 'jura-battlefield',
    position: { x: 4, y: 7 },
    dialogId: 'treyni-plea',
    color: 0x9fe6a0,
    // Verschwindet, sobald die Schlacht eröffnet ist (ihre Warnung ist getan).
    requirements: [{ notFlag: 'story.orc.engaged' }]
  },
  {
    id: 'geld-federation-herald',
    name: 'Rigurd',
    mapId: 'jura-battlefield',
    position: { x: 12, y: 4 },
    dialogId: 'geld-federation',
    color: 0xe9c56c,
    // Tritt erst nach dem Sieg über Geld auf, um die Föderation zu gründen.
    requirements: [{ flag: 'story.geld.devoured' }]
  },
  {
    id: 'milim-battlefield',
    name: 'Milim Nava',
    mapId: 'jura-battlefield',
    position: { x: 18, y: 6 },
    dialogId: 'milim-honey',
    color: 0xff7fbf,
    // Erscheint, sobald die Föderation steht — als Test, der zur Freundschaft wird.
    requirements: [{ flag: 'faction.orcs.joined' }]
  },
  {
    id: 'souka-marsh',
    name: 'Souka',
    mapId: 'lizardman-marsh',
    position: { x: 4, y: 6 },
    dialogId: 'souka-alliance',
    color: 0x6fc7a8
  },
  {
    id: 'shizu-grotto',
    name: 'Shizu',
    mapId: 'ember-hollow',
    position: { x: 4, y: 5 },
    dialogId: 'shizu-vow',
    color: 0xe8a04a
  }
] as const satisfies readonly NpcDefinition[];

export const SHOPS = [
  {
    id: 'goblin-hearth',
    name: 'Goblin-Heilstelle',
    mapId: 'goblin-village',
    position: { x: 10, y: 6 },
    itemIds: ['healing-herb', 'mana-drop'],
    buyMultiplier: 0.9,
    sellMultiplier: 0.45
  },
  {
    id: 'tempest-supply',
    name: 'Tempest-Vorrat',
    mapId: 'tempest-start',
    position: { x: 5, y: 3 },
    itemIds: ['healing-herb', 'mana-drop', 'traveler-cloak', 'tempest-charm', 'hipokte-herb', 'kurobe-katana', 'kijin-haori', 'oni-mask'],
    itemRequirements: [
      {
        itemId: 'tempest-charm',
        requirements: [{ flag: 'story.council.ready' }]
      },
      {
        itemId: 'hipokte-herb',
        requirements: [{ flag: 'story.council.ready' }]
      },
      {
        itemId: 'kurobe-katana',
        requirements: [{ flag: 'story.kijin.named' }]
      },
      {
        itemId: 'kijin-haori',
        requirements: [{ flag: 'story.kijin.named' }]
      },
      {
        itemId: 'oni-mask',
        requirements: [{ flag: 'story.kijin.named' }]
      }
    ],
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
  },
  {
    id: 'marsh-trader',
    name: 'Moorhändlerin',
    mapId: 'spirit-marsh',
    position: { x: 3, y: 5 },
    itemIds: ['healing-herb', 'mana-drop', 'tempest-charm', 'hipokte-herb', 'full-potion'],
    buyMultiplier: 1.15,
    sellMultiplier: 0.5
  },
  {
    id: 'shrine-rest',
    name: 'Schreinrast',
    mapId: 'spirit-highlands',
    position: { x: 4, y: 4 },
    itemIds: ['healing-herb', 'mana-drop', 'traveler-cloak', 'tempest-charm', 'hipokte-herb', 'full-potion', 'magisteel-blade', 'dwarf-plate', 'forge-band'],
    buyMultiplier: 1.2,
    sellMultiplier: 0.5
  },
  {
    id: 'dwargon-smithy',
    name: 'Dwargon-Schmiede',
    mapId: 'dwargon',
    position: { x: 6, y: 4 },
    itemIds: ['magisteel-blade', 'dwarf-plate', 'forge-band', 'magisteel'],
    itemRequirements: [
      { itemId: 'magisteel-blade', requirements: [{ flag: 'craft.smithing.unlocked' }] },
      { itemId: 'dwarf-plate', requirements: [{ flag: 'craft.smithing.unlocked' }] },
      { itemId: 'forge-band', requirements: [{ flag: 'craft.smithing.unlocked' }] }
    ],
    buyMultiplier: 1.1,
    sellMultiplier: 0.5
  },
  {
    id: 'dwargon-apothecary',
    name: 'Dwargon-Apotheke',
    mapId: 'dwargon',
    position: { x: 11, y: 4 },
    itemIds: ['healing-herb', 'mana-drop', 'hipokte-herb', 'full-potion'],
    buyMultiplier: 1,
    sellMultiplier: 0.5
  },
  {
    id: 'dwargon-trader',
    name: 'Dwargon-Handelskontor',
    mapId: 'dwargon',
    position: { x: 8, y: 9 },
    itemIds: ['magic-ore', 'magisteel', 'tempest-charm'],
    buyMultiplier: 1,
    sellMultiplier: 0.55
  },
  {
    id: 'blumund-guild-supply',
    name: 'Blumunder Gildenbedarf',
    mapId: 'blumund',
    position: { x: 8, y: 9 },
    itemIds: ['healing-herb', 'mana-drop', 'traveler-cloak', 'hipokte-herb', 'full-potion', 'tempest-charm'],
    itemRequirements: [
      { itemId: 'full-potion', requirements: [{ flag: 'trade.blumund.unlocked' }] },
      { itemId: 'tempest-charm', requirements: [{ flag: 'trade.blumund.unlocked' }] }
    ],
    buyMultiplier: 1.05,
    sellMultiplier: 0.55
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
    id: 'direwolf-pack-leader',
    mapId: 'direwolf-den',
    kind: 'trigger',
    position: { x: 9, y: 5 },
    enemyIds: ['direwolf-alpha', 'direwolf-pup'],
    chance: 1,
    requirements: [
      { flag: 'story.goblin.plea' },
      { notFlag: 'story.direwolf.defeated' }
    ],
    victoryEffects: [
      // Sieg = Unterwerfung. Pakt + Rekrutierung folgen im anschließenden Ranga-Dialog.
      { type: 'set-flag', flag: 'story.direwolf.defeated', value: true },
      { type: 'complete-quest-step', questId: 'slime-awakening', stepId: 'direwolf-pack' },
      { type: 'add-item', itemId: 'healing-herb', quantity: 1 }
    ]
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
      { type: 'set-flag', flag: 'codex.ancestor-seal-warning', value: true },
      { type: 'set-flag', flag: 'codex.tutorial-echo-boss', value: true },
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
    mapId: 'spirit-marsh',
    kind: 'trigger',
    position: { x: 5, y: 11 },
    enemyIds: ['human-lancer', 'spore-moth'],
    chance: 1,
    requirements: [
      { flag: 'story.act2.started' },
      { notFlag: 'story.border.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.border.cleared', value: true },
      { type: 'add-item', itemId: 'healing-herb', quantity: 2 }
    ]
  },
  {
    id: 'border-rift-vanguard',
    mapId: 'spirit-marsh',
    kind: 'trigger',
    position: { x: 18, y: 4 },
    enemyIds: ['mordrahn-vanguard', 'human-lancer'],
    chance: 1,
    requirements: [
      { flag: 'story.fracture.read' },
      { notFlag: 'story.vanguard.broken' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.vanguard.broken', value: true }
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
      { questStatus: { questId: 'ancestors-choice', status: 'active' } },
      { flag: 'story.alliance.council-ready' },
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
      { questStatus: { questId: 'ancestors-choice', status: 'active' } },
      { flag: 'story.breach.cleared' },
      { notFlag: 'story.mordrahn.defeated' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.mordrahn.defeated', value: true },
      { type: 'set-flag', flag: 'codex.mordrahn-keeper', value: true },
      { type: 'complete-quest-step', questId: 'ancestors-choice', stepId: 'confront' }
    ]
  },
  {
    id: 'west-bog-hunt',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 2, y: 8 },
    enemyIds: ['bog-terror'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.bog.started' },
      { notFlag: 'sidequest.bog.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.bog.cleared', value: true },
      { type: 'complete-quest-step', questId: 'bounty-bog', stepId: 'hunt-bog' }
    ]
  },
  {
    id: 'north-rift-echo',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 8, y: 2 },
    enemyIds: ['stray-echo'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.echo.started' },
      { notFlag: 'sidequest.echo.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.echo.cleared', value: true },
      { type: 'complete-quest-step', questId: 'relic-echoes', stepId: 'clear-echo' }
    ]
  },
  {
    id: 'east-route-deserter',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 20, y: 5 },
    enemyIds: ['human-deserter', 'human-lancer'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.deserter.started' },
      { notFlag: 'sidequest.deserter.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.deserter.cleared', value: true },
      { type: 'complete-quest-step', questId: 'border-runner', stepId: 'stop-deserter' }
    ]
  },
  {
    id: 'south-hollow-apex',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 13, y: 13 },
    enemyIds: ['elder-direwolf'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.apex.started' },
      { notFlag: 'sidequest.apex.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.apex.cleared', value: true },
      { type: 'complete-quest-step', questId: 'apex-bounty', stepId: 'hunt-apex' }
    ]
  },
  {
    id: 'marsh-wilds',
    mapId: 'spirit-marsh',
    kind: 'random',
    bounds: { x: 4, y: 3, width: 14, height: 9 },
    enemyIds: ['spore-moth', 'lizardman-acolyte'],
    chance: 0.14
  },
  {
    id: 'marsh-mire-guardian',
    mapId: 'spirit-marsh',
    kind: 'trigger',
    position: { x: 16, y: 10 },
    enemyIds: ['lizardman-acolyte', 'stray-echo'],
    chance: 1,
    victoryEffects: [
      { type: 'set-flag', flag: 'marsh.guardian.cleared', value: true },
      { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
    ]
  },
  {
    id: 'highlands-wilds',
    mapId: 'spirit-highlands',
    kind: 'random',
    bounds: { x: 3, y: 2, width: 18, height: 10 },
    enemyIds: ['lizardman-acolyte', 'mordrahn-vanguard'],
    chance: 0.13
  },
  {
    id: 'shrine-summit-guardian',
    mapId: 'spirit-highlands',
    kind: 'trigger',
    position: { x: 18, y: 5 },
    enemyIds: ['mordrahn-vanguard', 'stray-echo'],
    chance: 1,
    victoryEffects: [
      { type: 'set-flag', flag: 'highlands.guardian.cleared', value: true },
      { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
    ]
  },
  {
    id: 'marsh-blight',
    mapId: 'spirit-marsh',
    kind: 'trigger',
    position: { x: 12, y: 12 },
    enemyIds: ['spore-moth', 'stray-echo'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.cleanse.started' },
      { notFlag: 'sidequest.cleanse.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.cleanse.cleared', value: true },
      { type: 'complete-quest-step', questId: 'marsh-cleansing', stepId: 'cleanse-blight' }
    ]
  },
  {
    id: 'shrine-windecho',
    mapId: 'spirit-highlands',
    kind: 'trigger',
    position: { x: 8, y: 4 },
    enemyIds: ['elder-direwolf', 'stray-echo'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.vigil.started' },
      { notFlag: 'sidequest.vigil.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.vigil.cleared', value: true },
      { type: 'complete-quest-step', questId: 'shrine-vigil', stepId: 'banish-echo' }
    ]
  },
  {
    id: 'orc-vanguard',
    mapId: 'jura-battlefield',
    kind: 'trigger',
    position: { x: 9, y: 7 },
    enemyIds: ['orc-general', 'orc-soldier'],
    chance: 1,
    requirements: [
      { flag: 'story.treyni.met' },
      { notFlag: 'story.orc.engaged' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.orc.engaged', value: true },
      { type: 'complete-quest-step', questId: 'geld-disaster', stepId: 'march' },
      { type: 'add-item', itemId: 'orc-tusk', quantity: 1 }
    ]
  },
  {
    id: 'geld-disaster-boss',
    mapId: 'jura-battlefield',
    kind: 'trigger',
    position: { x: 15, y: 6 },
    enemyIds: ['orc-disaster'],
    chance: 1,
    requirements: [
      { flag: 'story.orc.engaged' },
      { notFlag: 'story.geld.devoured' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.geld.devoured', value: true },
      { type: 'complete-quest-step', questId: 'geld-disaster', stepId: 'geld' },
      { type: 'add-item', itemId: 'geld-core', quantity: 1 }
    ]
  },
  {
    id: 'gabiru-duel',
    mapId: 'lizardman-marsh',
    kind: 'trigger',
    position: { x: 13, y: 6 },
    enemyIds: ['gabiru', 'lizardman-warrior'],
    chance: 1,
    requirements: [
      { flag: 'story.lizard.met' },
      { notFlag: 'story.gabiru.humbled' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.gabiru.humbled', value: true },
      { type: 'complete-quest-step', questId: 'lizard-alliance', stepId: 'humble' },
      { type: 'add-item', itemId: 'wolf-fang-token', quantity: 1 }
    ]
  },
  {
    id: 'masked-majin-ambush',
    mapId: 'ember-hollow',
    kind: 'trigger',
    position: { x: 9, y: 6 },
    enemyIds: ['masked-majin'],
    chance: 1,
    requirements: [
      { flag: 'story.shizu.met' },
      { notFlag: 'story.majin.repelled' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.majin.repelled', value: true },
      { type: 'complete-quest-step', questId: 'shizu-vow', stepId: 'masked-majin' },
      { type: 'add-item', itemId: 'magic-ore', quantity: 1 }
    ]
  },
  {
    id: 'ifrit-boss',
    mapId: 'ember-hollow',
    kind: 'trigger',
    position: { x: 14, y: 6 },
    enemyIds: ['ifrit'],
    chance: 1,
    requirements: [
      { flag: 'story.majin.repelled' },
      { notFlag: 'story.ifrit.subdued' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.ifrit.subdued', value: true },
      { type: 'complete-quest-step', questId: 'shizu-vow', stepId: 'ifrit' },
      { type: 'add-item', itemId: 'magisteel', quantity: 1 }
    ]
  }
] as const satisfies readonly EncounterDefinition[];
