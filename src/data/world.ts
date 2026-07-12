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
  | { readonly type: 'recruit-character'; readonly characterId: string }
  // Phase 100 — Diplomatie: verschiebt die Reputation einer Faktion (kann negativ
  // sein). Überschrittene Schwellen setzen deterministisch ihre Unlock-Flags.
  | { readonly type: 'adjust-reputation'; readonly factionId: string; readonly amount: number };

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
  // Hauptpfad-Quest: wird im Log/Zielmarker bevorzugt, damit die Story eine sichtbare
  // Richtung von Gebiet zu Gebiet hat. Nebenquests lassen das Feld weg.
  readonly main?: boolean;
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
  // Ortsdienst: Ein 'smith'-NPC erlaubt Verzaubern, solange man auf seiner Karte ist.
  readonly service?: 'smith';
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
  readonly buyMultiplierByFlag?: readonly {
    readonly flag: string;
    readonly multiplier: number;
  }[];
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
    main: true,
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
    main: true,
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
        description: 'Beginne mit Shunas Siegeldeutung und sammle danach Gobtas Späherplan und Rangas Scoutbericht.',
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
    main: true,
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
    main: true,
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
    main: true,
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
  // Phase 106 — Haupthandlungsstrang: die regionalen Hauptquests stehen in der
  // Reihenfolge, in der ihre Gateways aufgehen (Dwargon → Echsen → Geld → Blumund
  // → Shizu/Ifrit). getTrackedQuestObjective bewahrt die QUESTS-Reihenfolge, also
  // zeigt der Zielmarker so stets die naechste TATSAECHLICH erreichbare Region.
  {
    id: 'lizard-alliance',
    main: true,
    title: 'Das Bündnis der Echsenmenschen',
    description: 'Im Echsen-Sumpf warnt Kommandantin Souka vor der Ork-Armee. Doch erst muss der überhebliche Gabiru besiegt werden, ehe die Echsenmenschen ein Bündnis schließen.',
    steps: [
      {
        id: 'parley',
        title: 'Souka anhören',
        description: 'Triff Kommandantin Souka am Rand des Echsen-Sumpfs.',
        locationId: 'lizard-marsh-camp'
      },
      {
        id: 'humble',
        title: 'Gabirus Hochmut prüfen',
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
    id: 'geld-disaster',
    main: true,
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
    id: 'blumund-guild',
    main: true,
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
    id: 'shizu-vow',
    main: true,
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
  },
  {
    id: 'shizu-legacy',
    main: true,
    title: 'Shizus Vermächtnis',
    description: 'Folge Shizus letztem Schwur zur Freiheitsakademie, triff ihre fünf Schüler und stabilisiere ihren ersten Geist-Kern, bis Tempests Forschung eine dauerhafte Lösung findet.',
    steps: [
      {
        id: 'reach-academy',
        title: 'Zur Freiheitsakademie reisen',
        description: 'Nutze nach Shizus Schwur den Blumunder Akademieweg.',
        locationId: 'freedom-academy-yard'
      },
      {
        id: 'hear-children',
        title: 'Die fünf Schüler anhören',
        description: 'Sprich mit Kenya, Chloe, Alice, Ryota und Gale über die instabilen Geist-Kerne.',
        locationId: 'academy-infirmary'
      },
      {
        id: 'first-core',
        title: 'Den ersten Geist-Kern stabilisieren',
        description: 'Entscheide, ob Rimuru zuerst beruhigt oder prüft — beides hilft, aber der Ton prägt ihr Vertrauen.',
        locationId: 'academy-infirmary'
      }
    ],
    reward: { gold: 120, itemIds: ['spirit-ember'] }
  },
  {
    id: 'tempest-arena',
    title: 'Ränge des Kolosseums',
    description: 'Der Arena-Vorstand eröffnet ein wiederholbares Kolosseum, in dem Tempest Kampfränge und Schmiedematerialien verdient.',
    steps: [
      {
        id: 'register',
        title: 'Im Kolosseum melden',
        description: 'Melde dich beim Arena-Vorstand von Tempest für die erste Rangfolge an.',
        locationId: 'colosseum-desk'
      },
      {
        id: 'bronze',
        title: 'Bronze-Rang bestehen',
        description: 'Bezwinge die erste Welle im Ring.',
        locationId: 'colosseum-ring'
      },
      {
        id: 'silver',
        title: 'Silber-Rang bestehen',
        description: 'Bezwinge die zweite Welle im Ring.',
        locationId: 'colosseum-ring'
      },
      {
        id: 'gold',
        title: 'Gold-Rang bestehen',
        description: 'Bezwinge die Finalwelle und sichere Tempests Arena-Lieferung.',
        locationId: 'colosseum-ring'
      }
    ],
    reward: { gold: 180, itemIds: ['magisteel'] }
  },
  {
    id: 'ramiris-labyrinth',
    main: true,
    title: "Ramiris' Labyrinth",
    description: 'Ramiris öffnet einen ersten Labyrinthflügel, in dem ein Magiekoloss die Geistertechnik für Shizus Schüler bewacht.',
    steps: [
      {
        id: 'meet-ramiris',
        title: 'Ramiris anhören',
        description: 'Sprich nach dem ersten stabilisierten Geist-Kern mit Ramiris an der Freiheitsakademie.',
        locationId: 'academy-infirmary'
      },
      {
        id: 'enter-labyrinth',
        title: 'Den Labyrinthflügel betreten',
        description: "Nimm den neuen Weg in Ramiris' Labyrinth und suche die Kolosskammer.",
        locationId: 'ramiris-threshold'
      },
      {
        id: 'defeat-colossus',
        title: 'Den Magiekoloss brechen',
        description: 'Besiege den steinernen Wächter, damit die beherrschbaren Großgeister erreichbar werden.',
        locationId: 'magic-colossus-chamber'
      }
    ],
    reward: { gold: 220, itemIds: ['magisteel', 'spirit-ember'] }
  },
  {
    id: 'tempest-invasion',
    main: true,
    title: 'Tempest verteidigen',
    description: 'Eine menschliche Strafkolonne rückt auf Tempest vor. Rigurd verteilt die Offiziere, Rimuru hält die Palisade und schlägt die Kommandowelle zurück.',
    steps: [
      {
        id: 'council',
        title: 'Den Verteidigungsrat alarmieren',
        description: 'Sprich nach Gelds Fall mit Rigurd in Tempest und ordne die Offiziersposten.',
        locationId: 'battlefield-front'
      },
      {
        id: 'vanguard',
        title: 'Die Vorhut an der Palisade brechen',
        description: 'Stell die erste Menschenwelle am südöstlichen Wall.',
        locationId: 'battlefield-front'
      },
      {
        id: 'command',
        title: 'Den Kommandotrupp zurückwerfen',
        description: 'Schlage den Sammelruf der Strafkolonne zurück und sichere Tempests Routen.',
        locationId: 'battlefield-heart'
      }
    ],
    reward: { gold: 160, itemIds: ['magisteel'] }
  },
  // Phase 154 — an Loot gekoppelte Nebenquests: ein erspielbarer Weg zu der in Welle 11
  // eingefuehrten Ausruestung (Kern/selten/legendaer, Phasen 149/150). Jede Quest jagt in
  // einer der duennen Regionen (Welle 10/153) und zahlt gezielt ein Gear-Stueck statt nur
  // Verbrauchsgut. Off-route: die Jagd-Encounter stehen in keiner Region-`encounterIds`-Liste
  // → ambiente Regionsschwierigkeit/Balance-Harness unberuehrt.
  {
    id: 'emberforge-hunt',
    title: 'Auftrag: Glutkern für die Schmiede',
    description: 'Rigurd braucht einen glutdurchzogenen Magicule-Kern aus der Glutgrotte — ein Oger-Krieger bewacht die letzte heiße Ader.',
    steps: [
      {
        id: 'accept-ember',
        title: 'Rigurds Auftrag annehmen',
        description: 'Nimm Rigurds Auftrag an, die Glutgrotte nach einem Kern zu durchsuchen.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'hunt-ember',
        title: 'Den Oger-Krieger erlegen',
        description: 'Stell den Oger-Krieger an der Glutader in der Glutgrotte.',
        locationId: 'ember-hollow-entrance'
      },
      {
        id: 'report-ember',
        title: 'Rigurd den Kern bringen',
        description: 'Bring Rigurd den geborgenen Glutkern und kassiere den Auftrag.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 200, itemIds: ['ember-magicule-core', 'magic-ore'] }
  },
  {
    id: 'echomoor-blade-hunt',
    title: 'Auftrag: Klinge aus dem Echsenmoor',
    description: 'Kaijin sucht ein grobes, aber wuchtiges Beil als Vorlage — es liegt bei einem Echsenkrieger im Moor.',
    steps: [
      {
        id: 'accept-blade',
        title: 'Rigurds Auftrag annehmen',
        description: 'Nimm den Auftrag an, das Beil aus dem Echsenmoor zu bergen.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'hunt-blade',
        title: 'Den Echsenkrieger stellen',
        description: 'Erleg den Echsenkrieger, der das Beil am Moorlager führt.',
        locationId: 'lizard-marsh-camp'
      },
      {
        id: 'report-blade',
        title: 'Rigurd berichten',
        description: 'Bring das Ork-Schlachtbeil zu Rigurd und kassiere den Auftrag.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 170, itemIds: ['orc-cleaver', 'magisteel'] }
  },
  {
    id: 'highland-ward-hunt',
    title: 'Auftrag: Der Wächter-Talisman',
    description: 'Nach dem Echo bittet Rigurd, den letzten Nachhut-Streuner am Schreingipfel zu bannen — Shuna weiht daraus einen Schutztalisman.',
    steps: [
      {
        id: 'accept-ward',
        title: 'Rigurds Auftrag annehmen',
        description: 'Nimm den Auftrag an, den Streuner am Schreingipfel zu bannen.',
        locationId: 'tempest-hollow'
      },
      {
        id: 'hunt-ward',
        title: 'Den Nachhut-Streuner bannen',
        description: 'Stell den Mordrahn-Streuner am Geisterschrein-Gipfel.',
        locationId: 'shrine-summit'
      },
      {
        id: 'report-ward',
        title: 'Rigurd berichten',
        description: 'Bring Rigurd den gebannten Nachhall; Shuna weiht daraus den Talisman.',
        locationId: 'tempest-hollow'
      }
    ],
    reward: { gold: 260, itemIds: ['ward-talisman', 'spirit-ember'] }
  }
] as const satisfies readonly QuestDefinition[];

export const LOCATIONS = [
  {
    id: 'tempest-hollow',
    name: 'Tempest-Hainstadt',
    kind: 'city',
    mapId: 'tempest-start',
    position: { x: 11, y: 8 },
    description: 'Eine junge Monsterstadt aus Palisaden, Werkbänken und improvisierten Versammlungsplätzen.',
    identity: 'Sicherer Hub: Dialoge, Shops, Bindungen und Questentscheidungen.',
    unlockFlag: 'story.tempest.named'
  },
  {
    id: 'tempest-council-plaza',
    name: 'Ratsplatz von Tempest',
    kind: 'outpost',
    mapId: 'tempest-start',
    position: { x: 8, y: 8 },
    description: 'Ein befestigter Feuerkreis, an dem Rigurd die ersten Aufgaben der jungen Stadt sammelt.',
    identity: 'Post-Prolog-Hubmarker: macht den Rat von Tempest als Zentrum der Band-2-Route sichtbar.',
    unlockFlag: 'story.slime-prologue.completed'
  },
  {
    id: 'tempest-name-stone',
    name: 'Namensstein',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 13, y: 9 },
    description: 'Ein einfacher Stein mit dem neuen Stadtnamen — noch roh, aber für alle sichtbar.',
    identity: 'Post-Prolog-Hubmarker: zeigt, dass aus dem Notlager eine benannte Siedlung geworden ist.',
    unlockFlag: 'story.tempest.named'
  },
  {
    id: 'tempest-palisade',
    name: 'Tempest-Palisade',
    kind: 'outpost',
    mapId: 'tempest-start',
    position: { x: 14, y: 6 },
    description: 'Frisch gesetzte Holzpfähle und Wachtücher markieren den Übergang von Lager zu Stadt.',
    identity: 'Post-Prolog-Hubmarker: weniger Notlager, mehr sichtbare Siedlungsstruktur.',
    unlockFlag: 'story.slime-prologue.completed'
  },
  {
    id: 'tempest-rest-camp',
    name: 'Tempest-Lager',
    kind: 'outpost',
    mapId: 'tempest-start',
    position: { x: 12, y: 11 },
    description: 'Ein geschützter Lagerkreis mit Wasser, Decken und genug Ruhe für kurze Absprachen.',
    identity: 'Ruhepunkt: Heilen, Speichern und kurze optionale Partygespräche zwischen den Hauptbeats.',
    unlockFlag: 'story.slime-prologue.completed'
  },
  {
    id: 'tempest-council-board',
    name: 'Tafel des Rates',
    kind: 'city',
    mapId: 'tempest-start',
    position: { x: 7, y: 9 },
    description: 'Auf der ersten Ratstafel stehen Versorgung, Hainroute und Shunas Siegelzeichen nebeneinander.',
    identity: 'Band-2-Hubmarker: Der Rat verändert Tempest sichtbar von einer Ansammlung Hütten zu einer organisierten Stadt.',
    unlockFlag: 'story.council.ready'
  },
  {
    id: 'tempest-echo-ward',
    name: 'Siegelwacht',
    kind: 'shrine',
    mapId: 'tempest-start',
    position: { x: 14, y: 3 },
    description: 'Ein kleiner Schutzstein erinnert an das gebrochene Echo und markiert Tempests erste gemeinsam bestandene Krise.',
    identity: 'Band-2-Abschlussmarker: Das Ahnensiegel wird Teil von Tempests sichtbarer Geschichte.',
    unlockFlag: 'story.act1.completed'
  },
  {
    id: 'tempest-kijin-quarter',
    name: 'Kijin-Viertel',
    kind: 'city',
    mapId: 'tempest-start',
    position: { x: 17, y: 6 },
    description: 'Geschwungene Dächer, Übungsplätze und Shunas Webzeichen geben den Kijin erstmals einen eigenen Stadtteil.',
    identity: 'Jungstadt-Marker: Die benannten Oger prägen Tempests Architektur und Alltag sichtbar.',
    unlockFlag: 'story.kijin.named'
  },
  {
    id: 'tempest-dwargon-quarter',
    name: 'Dwargon-Werkviertel',
    kind: 'city',
    mapId: 'tempest-start',
    // (15,5) liegt im Stadt-Layout selbst in einer Wand → Marker unerreichbar/verdeckt.
    position: { x: 20, y: 9 },
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
    // (20,5) wird im Stadt-Ausbau zur Wand → Ziel/Kampf unerreichbar. (20,6) ist in
    // allen Ausbaustufen begehbar. Muss mit dem east-route-deserter-Encounter matchen.
    position: { x: 20, y: 6 },
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
    id: 'gate-to-colosseum',
    name: 'Pfad zum Tempest-Kolosseum',
    kind: 'gateway',
    mapId: 'tempest-start',
    position: { x: 18, y: 12 },
    description: 'Ein breiter Holzsteg führt aus der Jungstadt zu Tempests neuem Kampfring.',
    identity: 'Optionaler Reisepunkt: öffnet die wiederholbare Arena nach der Kijin-Benennung.',
    unlockFlag: 'story.kijin.named',
    travelTo: { mapId: 'tempest-colosseum', x: 2, y: 7 }
  },
  {
    id: 'colosseum-gate-tempest',
    name: 'Rückweg nach Tempest',
    kind: 'gateway',
    mapId: 'tempest-colosseum',
    position: { x: 1, y: 7 },
    description: 'Der Steg zurück zum Tempest-Hain.',
    identity: 'Reisepunkt: zurück zur Jungstadt.',
    travelTo: { mapId: 'tempest-start', x: 18, y: 12 }
  },
  {
    id: 'colosseum-desk',
    name: 'Arena-Schalter',
    kind: 'outpost',
    mapId: 'tempest-colosseum',
    position: { x: 5, y: 7 },
    description: 'Am Kampfrand werden Ränge, Wellenfolge und Materialprämien verzeichnet.',
    identity: 'Arena-Hub: Anmeldung, Reset und Rangübersicht.'
  },
  {
    id: 'colosseum-ring',
    name: 'Kolosseumsring',
    kind: 'dungeon',
    mapId: 'tempest-colosseum',
    position: { x: 11, y: 6 },
    bounds: { x: 7, y: 4, width: 8, height: 5 },
    description: 'Ein freier Sandring mit Tribünen, auf dem Tempest Kampfränge ausruft.',
    identity: 'Wellenarena: Bronze, Silber und Gold als wiederholbare Kampfkette.'
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
    // Phase 106 — Haupthandlungsstrang: erst nach dem besiegelten Echsen-Bündnis
    // (Kette Dwargon → Echsen → Geld), damit der High-Level-Orc-Disaster nicht
    // sofort nach dem Kijin-Beat erreichbar ist.
    unlockFlag: 'story.lizard.allied',
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
    // Phase 106 — Haupthandlungsstrang: erst nach dem Dwargon-Bündnis (zweite
    // Region der Kette), nicht mehr zeitgleich mit allen anderen am Kijin-Beat.
    unlockFlag: 'faction.dwargon.allied',
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
    // Phase 106 — Haupthandlungsstrang: die Glutgrotte (Ifrit, hoechstes Level der
    // Kette) oeffnet zuletzt, erst nach der Jura-Tempest-Foederation (nach Geld).
    unlockFlag: 'faction.orcs.joined',
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
  },
  {
    id: 'gate-to-freedom-academy',
    name: 'Akademieweg nach Ingrassia',
    kind: 'gateway',
    mapId: 'blumund',
    position: { x: 18, y: 12 },
    description: 'Ein sicherer Wagenweg führt von Blumund zur Akademie, an der Shizus Schüler unter Beobachtung stehen.',
    identity: 'Reisepunkt: Übergang zur Band-4-Folge von Shizus Schwur.',
    unlockFlag: 'story.shizu.vow',
    travelTo: { mapId: 'freedom-academy', x: 2, y: 7 }
  },
  {
    id: 'academy-gate-blumund',
    name: 'Rückweg nach Blumund',
    kind: 'gateway',
    mapId: 'freedom-academy',
    position: { x: 1, y: 7 },
    description: 'Der bewachte Weg zurück zur Freien Gilde von Blumund.',
    identity: 'Reisepunkt: zurück nach Blumund.',
    travelTo: { mapId: 'blumund', x: 18, y: 12 }
  },
  {
    id: 'freedom-academy-yard',
    name: 'Hof der Freiheitsakademie',
    kind: 'outpost',
    mapId: 'freedom-academy',
    position: { x: 5, y: 6 },
    bounds: { x: 3, y: 4, width: 6, height: 5 },
    description: 'Ein stiller Schulhof, auf dem Beschwörungskreise im Stein nur schwach leuchten.',
    identity: 'Story-Treffpunkt: Rimuru erreicht Shizus Schüler und beginnt den Schutzschwur einzulösen.'
  },
  {
    id: 'academy-infirmary',
    name: 'Akademie-Krankenflügel',
    kind: 'shrine',
    mapId: 'freedom-academy',
    position: { x: 13, y: 6 },
    bounds: { x: 11, y: 4, width: 6, height: 5 },
    description: 'Ein heller Raum mit Decken, Kreidezeichen und schwankenden Geist-Kernen.',
    identity: 'Mechanik-Ort: erste Stabilisierung der Kinder, bevor spätere Geistertechnik die Lösung liefert.'
  },
  {
    id: 'gate-to-ramiris-labyrinth',
    name: 'Ramiris-Tor',
    kind: 'gateway',
    mapId: 'freedom-academy',
    position: { x: 18, y: 7 },
    description: 'Ein schwebender Türbogen faltet den Schulhof in einen Labyrinthflügel.',
    identity: "Reisepunkt: Übergang in Ramiris' Labyrinth.",
    unlockFlag: 'story.ramiris.met',
    travelTo: { mapId: 'ramiris-labyrinth', x: 2, y: 7 }
  },
  {
    id: 'labyrinth-gate-academy',
    name: 'Rücktor zur Akademie',
    kind: 'gateway',
    mapId: 'ramiris-labyrinth',
    position: { x: 1, y: 7 },
    description: 'Der Ausgang hält den Faden zur Freiheitsakademie offen.',
    identity: 'Reisepunkt: zurück zu Shizus Schülern.',
    travelTo: { mapId: 'freedom-academy', x: 18, y: 7 }
  },
  {
    id: 'ramiris-threshold',
    name: 'Labyrinth-Schwelle',
    kind: 'dungeon',
    mapId: 'ramiris-labyrinth',
    position: { x: 6, y: 6 },
    bounds: { x: 4, y: 4, width: 6, height: 5 },
    description: 'Wurzeln, Kristalle und alte Steinplatten bilden einen kontrollierten Testflügel.',
    identity: 'Story-Ort: erster begehbarer Labyrinthabschnitt Ramiris.'
  },
  {
    id: 'magic-colossus-chamber',
    name: 'Kolosskammer',
    kind: 'dungeon',
    mapId: 'ramiris-labyrinth',
    position: { x: 18, y: 6 },
    bounds: { x: 15, y: 4, width: 6, height: 5 },
    description: 'Ein steinerner Wächter hält Geistkristalle und Magisteel-Vorrichtungen im Gleichgewicht.',
    identity: 'Bossort: Magiekoloss als erster Ramiris-Set-Piece-Kampf.'
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
    id: 'deserter-reprisals',
    title: 'Die Vergeltung der Grenzgänger',
    category: 'history',
    body: 'Tempests hartes Urteil an der Osthandelsroute trieb die versprengten Söldner nicht auseinander, sondern zurück in einen letzten Vergeltungsschlag. Erst dessen Abwehr machte die Route wieder sicher.',
    unlockFlag: 'sidequest.deserter.retaliation-cleared'
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
    body: 'Sechs Oger überlebten den Untergang ihres Dorfes. Als Rimuru ihnen Namen gab, loderte die Magie auf und hob sie zu Kijin empor — Benimaru, Shion, Hakurou, Shuna, Kurobe und Souei. Ein Name ist kein Wort, sondern ein Anteil an Macht; wer ihn schenkt, bindet Schicksale aneinander.',
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
    id: 'tempest-invasion',
    title: 'Tempests erste Verteidigung',
    lockedTitle: 'Rauch an der Palisade',
    category: 'history',
    body: 'Nach Gelds Fall marschiert eine menschliche Strafkolonne auf Tempest. Rigurd verteilt die benannten Offiziere auf die Abschnitte, Rimuru hält die Palisade und macht aus einer Belagerung den Beweis, dass Tempest seine Wege selbst schützen kann.',
    unlockFlag: 'story.tempest-invasion.repulsed'
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
    body: 'Rimuru beginnt mit Wasserstrahl, doch Wasserklinge, Sturmböe und weitere Techniken müssen erbeutet werden. Erst gebrochene, geschwächte oder fast besiegte Gegner lassen per Verschlinger eine dauerhafte Fähigkeit zurück. Jede Essenz ist an einen konkreten Gegnerkern gebunden und wird im Kampf durch ein begrenztes Loadout gebändigt.',
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
    body: 'Erst Gabirus Niederlage öffnet den Echsenmenschen die Augen: Souka und der Häuptling schließen ein Bündnis mit Tempest gegen den Heerzug. Ob Rimuru Gabiru Respekt zeigt oder ihn demütigt, prägt den Ton dieses jungen Pakts.',
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
  },
  {
    id: 'shizu-children',
    title: 'Shizus Schüler',
    lockedTitle: 'Fünf unruhige Kerne',
    category: 'people',
    body: 'Kenya, Chloe, Alice, Ryota und Gale sind Andersweltler-Kinder der Freiheitsakademie. Ihre beschworenen Geist-Kerne halten sie am Leben und zerreißen sie zugleich langsam; Rimurus Schutzschwur macht aus Shizus Bitte eine spielbare Folgeaufgabe.',
    unlockFlag: 'story.children.met'
  },
  {
    id: 'ramiris-labyrinth',
    title: "Ramiris' Labyrinth",
    lockedTitle: 'Ein gefalteter Raum',
    category: 'places',
    body: 'Ramiris öffnet für Tempest zunächst nur einen kontrollierten Labyrinthflügel. Der Magiekoloss darin ist kein Zufallsmonster, sondern ein Wächter für Geistkristalle, Magisteel und spätere Großgeist-Bindungen.',
    unlockFlag: 'story.ramiris.met'
  }
] as const satisfies readonly LoreEntryDefinition[];

export const DIALOGS = [
  {
    // Konsequente Entscheidung (kein reines Fortschritts-Gate): der Spieler waehlt
    // Tempests erste Ausrichtung; die Wahl ist einmalig, schliesst die anderen aus
    // und wird sichtbar am Ortsbild (drei sich ausschliessende Wahrzeichen-Fundstellen).
    id: 'tempest-priority',
    startNodeId: 'root',
    nodes: [
      {
        id: 'root',
        speaker: 'Rigurd',
        text: 'Meister, Tempest traegt nun einen Namen — doch worauf legen wir zuerst unsere Kraft? Deine Entscheidung formt, was die Siedler als Erstes errichten.',
        choices: [
          {
            id: 'defense',
            label: 'Wehrhaftigkeit — ein Wachturm',
            nextNodeId: 'chosen',
            requirements: [{ notFlag: 'tempest.priority.chosen' }],
            effects: [
              { type: 'set-flag', flag: 'tempest.priority.defense', value: true },
              { type: 'set-flag', flag: 'tempest.priority.chosen', value: true }
            ]
          },
          {
            id: 'trade',
            label: 'Wohlstand — ein Marktplatz',
            nextNodeId: 'chosen',
            requirements: [{ notFlag: 'tempest.priority.chosen' }],
            effects: [
              { type: 'set-flag', flag: 'tempest.priority.trade', value: true },
              { type: 'set-flag', flag: 'tempest.priority.chosen', value: true }
            ]
          },
          {
            id: 'knowledge',
            label: 'Wissen — eine Schriftenhalle',
            nextNodeId: 'chosen',
            requirements: [{ notFlag: 'tempest.priority.chosen' }],
            effects: [
              { type: 'set-flag', flag: 'tempest.priority.knowledge', value: true },
              { type: 'set-flag', flag: 'tempest.priority.chosen', value: true }
            ]
          },
          { id: 'later', label: 'Noch nicht entscheiden', requirements: [{ notFlag: 'tempest.priority.chosen' }] }
        ]
      },
      {
        id: 'chosen',
        speaker: 'Rigurd',
        text: 'Verstanden, Meister. Die Siedler beginnen sofort — man wird es bald am Ortsbild sehen.',
        choices: [{ id: 'end', label: 'Gut.' }]
      }
    ]
  },
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
            id: 'muster-invasion',
            label: 'Verteidigung aufstellen',
            nextNodeId: 'invasion-mustered',
            requirements: [
              { flag: 'story.geld.devoured' },
              { questStatus: { questId: 'tempest-invasion', status: 'inactive' } },
              { notFlag: 'story.tempest-invasion.repulsed' }
            ],
            effects: [
              { type: 'start-quest', questId: 'tempest-invasion' },
              { type: 'complete-quest-step', questId: 'tempest-invasion', stepId: 'council' },
              { type: 'set-flag', flag: 'story.tempest-invasion.active', value: true }
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
          },
          // Phase 154 — an Loot gekoppelte Nebenquests (Gear-Belohnung aus Welle 11).
          // Verfuegbar ab dem Rat (rigurd-council/rigurd-established nutzen diesen Dialog).
          {
            id: 'accept-ember-order',
            label: 'Auftrag: Glutkern für die Schmiede',
            nextNodeId: 'ember-order-accepted',
            requirements: [
              { flag: 'story.council.ready' },
              { questStatus: { questId: 'emberforge-hunt', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'emberforge-hunt' },
              { type: 'complete-quest-step', questId: 'emberforge-hunt', stepId: 'accept-ember' },
              { type: 'set-flag', flag: 'sidequest.emberforge.started', value: true }
            ]
          },
          {
            id: 'report-ember-order',
            label: 'Glutkern abliefern',
            nextNodeId: 'ember-order-paid',
            requirements: [
              { questStatus: { questId: 'emberforge-hunt', status: 'active' } },
              { flag: 'sidequest.emberforge.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'emberforge-hunt', stepId: 'report-ember' },
              { type: 'complete-quest', questId: 'emberforge-hunt' },
              { type: 'add-gold', amount: 200 },
              { type: 'add-item', itemId: 'ember-magicule-core', quantity: 1 },
              { type: 'add-item', itemId: 'magic-ore', quantity: 2 }
            ]
          },
          {
            id: 'accept-marsh-blade',
            label: 'Auftrag: Klinge aus dem Echsenmoor',
            nextNodeId: 'marsh-blade-accepted',
            requirements: [
              { flag: 'story.council.ready' },
              { questStatus: { questId: 'echomoor-blade-hunt', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'echomoor-blade-hunt' },
              { type: 'complete-quest-step', questId: 'echomoor-blade-hunt', stepId: 'accept-blade' },
              { type: 'set-flag', flag: 'sidequest.echomoor-blade.started', value: true }
            ]
          },
          {
            id: 'report-marsh-blade',
            label: 'Ork-Schlachtbeil abliefern',
            nextNodeId: 'marsh-blade-paid',
            requirements: [
              { questStatus: { questId: 'echomoor-blade-hunt', status: 'active' } },
              { flag: 'sidequest.echomoor-blade.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'echomoor-blade-hunt', stepId: 'report-blade' },
              { type: 'complete-quest', questId: 'echomoor-blade-hunt' },
              { type: 'add-gold', amount: 170 },
              { type: 'add-item', itemId: 'orc-cleaver', quantity: 1 },
              { type: 'add-item', itemId: 'magisteel', quantity: 1 }
            ]
          },
          {
            id: 'accept-highland-ward',
            label: 'Auftrag: Der Wächter-Talisman',
            nextNodeId: 'highland-ward-accepted',
            requirements: [
              { flag: 'story.act1.completed' },
              { questStatus: { questId: 'highland-ward-hunt', status: 'inactive' } }
            ],
            effects: [
              { type: 'start-quest', questId: 'highland-ward-hunt' },
              { type: 'complete-quest-step', questId: 'highland-ward-hunt', stepId: 'accept-ward' },
              { type: 'set-flag', flag: 'sidequest.highland-ward.started', value: true }
            ]
          },
          {
            id: 'report-highland-ward',
            label: 'Gebannten Nachhall abliefern',
            nextNodeId: 'highland-ward-paid',
            requirements: [
              { questStatus: { questId: 'highland-ward-hunt', status: 'active' } },
              { flag: 'sidequest.highland-ward.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'highland-ward-hunt', stepId: 'report-ward' },
              { type: 'complete-quest', questId: 'highland-ward-hunt' },
              { type: 'add-gold', amount: 260 },
              { type: 'add-item', itemId: 'ward-talisman', quantity: 1 },
              { type: 'add-item', itemId: 'spirit-ember', quantity: 1 }
            ]
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
        id: 'invasion-mustered',
        speaker: 'Rigurd',
        text: 'Sturmzahn hält die Wache, Seidenschwinge meldet jeden Flankenlauf, die Heiler bleiben hinter dem Wall. Wenn die zweite Welle fällt, sind unsere Wege sicherer als zuvor.',
        choices: [{ id: 'end', label: 'Zur Palisade' }]
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
      },
      // Phase 154 — Auftrags-Zielknoten (an Loot gekoppelte Nebenquests).
      {
        id: 'ember-order-accepted',
        speaker: 'Rigurd',
        text: 'Die Glutgrotte glimmt noch nach. Ein Oger-Krieger hütet die letzte heiße Ader — brich ihn, und der Kern gehört der Schmiede.',
        choices: [{ id: 'end', label: 'Zur Glutgrotte' }]
      },
      {
        id: 'ember-order-paid',
        speaker: 'Rigurd',
        text: 'Ein sauberer Kern, noch warm. Kaijin bindet ihn dir gleich ein — nimm ihn und das Roherz obendrauf. Tempest dankt dir.',
        choices: [{ id: 'end', label: 'Gern geschehen' }]
      },
      {
        id: 'marsh-blade-accepted',
        speaker: 'Rigurd',
        text: 'Das Echsenmoor führt ein grobes Beil — viel Wucht, wenig Finesse. Kaijin will es als Vorlage. Stell den Krieger am Moorlager.',
        choices: [{ id: 'end', label: 'Zum Echsenmoor' }]
      },
      {
        id: 'marsh-blade-paid',
        speaker: 'Rigurd',
        text: 'Genau das Stück. Nimm das Ork-Schlachtbeil — bis Kaijin etwas Besseres schmiedet, spaltet es alles. Und ein Barren Magistahl für den Weg.',
        choices: [{ id: 'end', label: 'Gern geschehen' }]
      },
      {
        id: 'highland-ward-accepted',
        speaker: 'Rigurd',
        text: 'Ein letzter Streuner der Nachhut hängt am Schreingipfel fest. Bann ihn — Shuna weiht aus dem Nachhall einen Talisman, der den Geist gegen Kontrolle schirmt.',
        choices: [{ id: 'end', label: 'Zum Schreingipfel' }]
      },
      {
        id: 'highland-ward-paid',
        speaker: 'Rigurd',
        text: 'Der Nachhall ist rein. Shuna hat den Schutztalisman geweiht — trag ihn, und Fäulnis wie Zwang greifen seltener. Ein Funke Geistglut liegt bei.',
        choices: [{ id: 'end', label: 'Gern geschehen' }]
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
            id: 'spare-deserters',
            label: 'Den Überlebenden Gnade gewähren',
            nextNodeId: 'deserter-mercy',
            requirements: [
              { questStatus: { questId: 'border-runner', status: 'active' } },
              { flag: 'sidequest.deserter.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'border-runner', stepId: 'report-deserter' },
              { type: 'complete-quest', questId: 'border-runner' },
              { type: 'set-flag', flag: 'choice.deserters.mercy', value: true },
              { type: 'set-flag', flag: 'bond.lyrre.trust-2', value: true },
              { type: 'add-gold', amount: 110 },
              { type: 'add-item', itemId: 'mana-drop', quantity: 1 }
            ]
          },
          {
            id: 'punish-deserters',
            label: 'Ein hartes Exempel statuieren',
            nextNodeId: 'deserter-hardline',
            requirements: [
              { questStatus: { questId: 'border-runner', status: 'active' } },
              { flag: 'sidequest.deserter.cleared' }
            ],
            effects: [
              { type: 'complete-quest-step', questId: 'border-runner', stepId: 'report-deserter' },
              { type: 'complete-quest', questId: 'border-runner' },
              { type: 'set-flag', flag: 'choice.deserters.hardline', value: true },
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
        id: 'deserter-mercy',
        speaker: 'Gobta',
        text: 'Gobta nickt erleichtert. „Die Überlebenden bauen ihre Schulden in Tempest ab. Einer hilft schon beim Vorrat — und sorgt dafür, dass Reisende weniger zahlen.“',
        choices: [{ id: 'end', label: 'Gnade schafft Verbündete' }]
      },
      {
        id: 'deserter-hardline',
        speaker: 'Gobta',
        text: 'Gobta verzieht das Gesicht. „Die Route kennt jetzt unsere Härte. Aber die Entkommenen sammeln sich wieder am östlichen Grenzstein. Das war noch nicht das Ende.“',
        choices: [{ id: 'end', label: 'Den Gegenschlag erwarten' }]
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
            label: 'Die Oger benennen (Benimaru, Shion, Hakurou, Shuna, Kurobe, Souei)',
            nextNodeId: 'named',
            requirements: [
              { flag: 'story.slime-prologue.completed' },
              { notFlag: 'story.kijin.named' }
            ],
            effects: [
              { type: 'recruit-character', characterId: 'benimaru' },
              { type: 'recruit-character', characterId: 'shion' },
              { type: 'recruit-character', characterId: 'hakurou' },
              { type: 'recruit-character', characterId: 'shuna' },
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
        text: 'Mit jedem Namen lodert die Magie auf — die Oger steigen zu Kijin auf. Benimaru, Shion, Hakurou, Shuna, Kurobe und Souei knien nieder und schwören Tempest ewige Gefolgschaft.',
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
              // Phase 100 — das Zwergenbündnis hebt Tempests Ruf bei Dwargon aufs Maximum.
              { type: 'adjust-reputation', factionId: 'dwargon', amount: 90 },
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
              // Phase 100 — der Handelspakt mit Blumund festigt Tempests Ruf dort.
              { type: 'adjust-reputation', factionId: 'blumund', amount: 90 },
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
              // Phase 100 — die Föderation nimmt die Orks unter Tempests Banner auf.
              { type: 'adjust-reputation', factionId: 'orcs', amount: 90 },
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
    id: 'deserter-refugee',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Geretteter Grenzgänger',
        text: '„Ihr hättet uns erschlagen können. Stattdessen darf ich Vorräte tragen und Reisende warnen. Solange ich hier stehe, zahlt niemand den Aufschlag, den wir früher erpresst haben.“',
        choices: [{ id: 'end', label: 'Mach etwas aus der zweiten Chance' }]
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
            id: 'seal-respect',
            label: 'Gabiru Respekt erweisen',
            nextNodeId: 'allied-respect',
            requirements: [
              { flag: 'story.gabiru.humbled' },
              { notFlag: 'story.lizard.allied' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.lizard.allied', value: true },
              { type: 'set-flag', flag: 'choice.gabiru.respect', value: true },
              // Phase 100 — Gabiru mit Respekt zu behandeln bringt das volle Bündnis.
              { type: 'adjust-reputation', factionId: 'lizardmen', amount: 90 },
              { type: 'complete-quest-step', questId: 'lizard-alliance', stepId: 'ally' },
              { type: 'complete-quest', questId: 'lizard-alliance' },
              { type: 'add-gold', amount: 200 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          {
            id: 'seal-humiliate',
            label: 'Gabiru öffentlich demütigen',
            nextNodeId: 'allied-humiliate',
            requirements: [
              { flag: 'story.gabiru.humbled' },
              { notFlag: 'story.lizard.allied' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.lizard.allied', value: true },
              { type: 'set-flag', flag: 'choice.gabiru.humiliate', value: true },
              // Phase 100 — Gabiru zu demütigen sichert das Bündnis, aber weniger
              // Wohlwollen: nur „Bundesgenossen" statt volles Verbündet.
              { type: 'adjust-reputation', factionId: 'lizardmen', amount: 50 },
              { type: 'complete-quest-step', questId: 'lizard-alliance', stepId: 'ally' },
              { type: 'complete-quest', questId: 'lizard-alliance' },
              { type: 'add-gold', amount: 200 },
              { type: 'add-item', itemId: 'tempest-charm', quantity: 1 }
            ]
          },
          {
            id: 'aftermath-respect',
            label: 'Nach Gabirus Wache fragen',
            nextNodeId: 'respect-aftermath',
            requirements: [{ flag: 'choice.gabiru.respect' }]
          },
          {
            id: 'aftermath-humiliate',
            label: 'Nach Gabirus Wache fragen',
            nextNodeId: 'humiliate-aftermath',
            requirements: [{ flag: 'choice.gabiru.humiliate' }]
          },
          { id: 'leave', label: 'Später wiederkommen' }
        ]
      },
      {
        id: 'await-duel',
        speaker: 'Souka',
        text: 'Souka deutet zum Schilfkessel. „Gabiru wartet dort mit seiner Garde. Besieg ihn — danach entscheidet sich, ob aus seinem Stolz Loyalität oder Groll wird.“',
        choices: [{ id: 'end', label: 'Zum Schilfkessel' }]
      },
      {
        id: 'allied-respect',
        speaker: 'Souka',
        text: 'Souka verneigt sich. „Du hast Gabiru besiegt, ohne ihm die Würde zu nehmen. Seine Hundert bewachen nun unsere Händler — die Moorhändlerin gibt Tempest Bündnispreise.“',
        choices: [{ id: 'end', label: 'Stärke verdient Respekt' }]
      },
      {
        id: 'allied-humiliate',
        speaker: 'Souka',
        text: 'Soukas Blick bleibt kühl. „Gabiru wird gehorchen. Doch seine Hundert folgen aus Scham, nicht aus Vertrauen. Das Bündnis steht — seine Wunden bleiben sichtbar.“',
        choices: [{ id: 'end', label: 'Das Bündnis genügt' }]
      },
      {
        id: 'respect-aftermath',
        speaker: 'Souka',
        text: '„Gabirus Wache begleitet Händler durch den Sumpf. Sie erzählen inzwischen lieber von Rimurus Fairness als von ihrer Niederlage.“',
        choices: [{ id: 'end', label: 'So wächst ein Bündnis' }]
      },
      {
        id: 'humiliate-aftermath',
        speaker: 'Souka',
        text: '„Gabirus Wache hält Abstand. Sie erfüllt den Pakt, aber jedes Gespräch endet, sobald Tempests Banner auftaucht.“',
        choices: [{ id: 'end', label: 'Misstrauen hat einen Preis' }]
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
    id: 'shizu-children',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Shizus Schüler',
        text: 'Fünf Kinder stehen eng beieinander. Ihre Geist-Kerne flackern in verschiedenen Farben; jedes Flackern kostet Kraft. Sie kennen Shizus Namen — und warten, ob Rimuru nur ein weiterer Erwachsener mit Versprechen ist.',
        choices: [
          {
            id: 'arrive',
            label: 'Shizus Schwur nennen',
            nextNodeId: 'choice',
            requirements: [{ notFlag: 'story.children.met' }],
            effects: [
              { type: 'start-quest', questId: 'shizu-legacy' },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'reach-academy' },
              { type: 'set-flag', flag: 'story.children.met', value: true }
            ]
          },
          {
            id: 'comfort',
            label: 'Erst beruhigen',
            nextNodeId: 'comforted',
            requirements: [
              { flag: 'story.children.met' },
              { notFlag: 'story.children.first-core' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.children.comforted', value: true },
              { type: 'set-flag', flag: 'story.children.first-core', value: true },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'hear-children' },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'first-core' },
              { type: 'complete-quest', questId: 'shizu-legacy' },
              { type: 'add-gold', amount: 120 },
              { type: 'add-item', itemId: 'spirit-ember', quantity: 1 }
            ]
          },
          {
            id: 'test',
            label: 'Erst prüfen',
            nextNodeId: 'tested',
            requirements: [
              { flag: 'story.children.met' },
              { notFlag: 'story.children.first-core' }
            ],
            effects: [
              { type: 'set-flag', flag: 'story.children.tested', value: true },
              { type: 'set-flag', flag: 'story.children.first-core', value: true },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'hear-children' },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'first-core' },
              { type: 'complete-quest', questId: 'shizu-legacy' },
              { type: 'add-gold', amount: 120 },
              { type: 'add-item', itemId: 'spirit-ember', quantity: 1 }
            ]
          },
          {
            id: 'after-comfort',
            label: 'Nach den Kindern sehen',
            nextNodeId: 'after-comfort',
            requirements: [{ flag: 'story.children.comforted' }]
          },
          {
            id: 'after-test',
            label: 'Messwerte abgleichen',
            nextNodeId: 'after-test',
            requirements: [{ flag: 'story.children.tested' }]
          },
          { id: 'leave', label: 'Noch beobachten' }
        ]
      },
      {
        id: 'choice',
        speaker: 'Shizus Schüler',
        text: 'Chloe hält die anderen zurück, Kenya tritt vor, Alice klammert sich an ihren Ärmel. Ein Kern gerät aus dem Takt. Rimuru kann zuerst Angst lösen — oder sofort die magische Struktur lesen.',
        choices: [
          {
            id: 'comfort',
            label: 'Erst beruhigen',
            nextNodeId: 'comforted',
            effects: [
              { type: 'set-flag', flag: 'story.children.comforted', value: true },
              { type: 'set-flag', flag: 'story.children.first-core', value: true },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'hear-children' },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'first-core' },
              { type: 'complete-quest', questId: 'shizu-legacy' },
              { type: 'add-gold', amount: 120 },
              { type: 'add-item', itemId: 'spirit-ember', quantity: 1 }
            ]
          },
          {
            id: 'test',
            label: 'Erst prüfen',
            nextNodeId: 'tested',
            effects: [
              { type: 'set-flag', flag: 'story.children.tested', value: true },
              { type: 'set-flag', flag: 'story.children.first-core', value: true },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'hear-children' },
              { type: 'complete-quest-step', questId: 'shizu-legacy', stepId: 'first-core' },
              { type: 'complete-quest', questId: 'shizu-legacy' },
              { type: 'add-gold', amount: 120 },
              { type: 'add-item', itemId: 'spirit-ember', quantity: 1 }
            ]
          }
        ]
      },
      {
        id: 'comforted',
        speaker: 'Shizus Schüler',
        text: 'Rimuru senkt die Stimme und lässt Shizus Erinnerung sprechen. Die Kerne werden nicht geheilt, aber ihr Flackern wird ruhiger. Vertrauen entsteht, bevor die eigentliche Forschung beginnt.',
        choices: [{ id: 'end', label: 'Ich komme wieder' }]
      },
      {
        id: 'tested',
        speaker: 'Shizus Schüler',
        text: 'Der Große Weise liest die Kernstruktur in einem Atemzug. Die Kinder weichen erst zurück, sehen dann aber, dass der Schmerz nachlässt. Vertrauen kommt langsamer — die Daten sind klarer.',
        choices: [{ id: 'end', label: 'Ich komme wieder' }]
      },
      {
        id: 'after-comfort',
        speaker: 'Shizus Schüler',
        text: '„Du hast zuerst zu uns gesprochen, nicht zu den Kernen", sagt Chloe. Die Kinder warten auf die Geisterlösung, aber sie verstecken sich nicht mehr.',
        choices: [{ id: 'end', label: 'Der Schwur bleibt' }]
      },
      {
        id: 'after-test',
        speaker: 'Shizus Schüler',
        text: 'Kenya fragt nach jedem Messergebnis, Alice zählt die Pausen zwischen den Flackern. Sie vertrauen Rimuru vorsichtig — weil die Prüfung ihnen Zeit verschafft hat.',
        choices: [{ id: 'end', label: 'Der Schwur bleibt' }]
      }
    ]
  },
  {
    id: 'tempest-arena',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Arena-Vorstand',
        text: 'Der Ring ist frei. Bronze prüft Haltung, Silber prüft Ressourcen, Gold prüft, ob Tempest unter Druck noch koordiniert bleibt. Nach dem Goldrang kann ich die Liste für einen neuen Materiallauf zurücksetzen.',
        choices: [
          {
            id: 'register',
            label: 'Arena-Lauf starten',
            nextNodeId: 'registered',
            requirements: [
              { questStatus: { questId: 'tempest-arena', status: 'inactive' } },
              { notFlag: 'arena.run.active' }
            ],
            effects: [
              { type: 'start-quest', questId: 'tempest-arena' },
              { type: 'complete-quest-step', questId: 'tempest-arena', stepId: 'register' },
              { type: 'set-flag', flag: 'arena.run.active', value: true },
              { type: 'set-flag', flag: 'arena.bronze.cleared', value: false },
              { type: 'set-flag', flag: 'arena.silver.cleared', value: false },
              { type: 'set-flag', flag: 'arena.gold.cleared', value: false }
            ]
          },
          {
            id: 'restart',
            label: 'Neuen Materiallauf starten',
            nextNodeId: 'registered',
            requirements: [
              { flag: 'arena.gold.cleared' }
            ],
            effects: [
              { type: 'set-flag', flag: 'arena.run.active', value: true },
              { type: 'set-flag', flag: 'arena.bronze.cleared', value: false },
              { type: 'set-flag', flag: 'arena.silver.cleared', value: false },
              { type: 'set-flag', flag: 'arena.gold.cleared', value: false },
              { type: 'set-flag', flag: 'encounter.arena-bronze-wave.cleared', value: false },
              { type: 'set-flag', flag: 'encounter.arena-silver-wave.cleared', value: false },
              { type: 'set-flag', flag: 'encounter.arena-gold-wave.cleared', value: false }
            ]
          },
          {
            id: 'status',
            label: 'Rangliste prüfen',
            nextNodeId: 'status',
            requirements: [{ flag: 'arena.run.active' }]
          },
          { id: 'end', label: 'Später' }
        ]
      },
      {
        id: 'registered',
        speaker: 'Arena-Vorstand',
        text: 'Eingetragen. Tritt in die Ringmitte; die Wellen laufen nacheinander auf. Wer Gold schafft, bringt Magisteel und Ork-Hauer in Tempests Schmiede.',
        choices: [{ id: 'end', label: 'In den Ring' }]
      },
      {
        id: 'status',
        speaker: 'Arena-Vorstand',
        text: 'Die Tafel zeigt Bronze, Silber und Gold. Der nächste offene Rang erscheint in der Ringmitte; nach Gold kann ich denselben Lauf für weitere Materialien neu ansetzen.',
        choices: [{ id: 'end', label: 'Verstanden' }]
      }
    ]
  },
  {
    id: 'ramiris-labyrinth',
    startNodeId: 'start',
    nodes: [
      {
        id: 'start',
        speaker: 'Ramiris',
        text: 'Ramiris schwebt über den Kreidekreisen und zeigt auf einen gefalteten Türspalt. „Wenn ihr die Kinder retten wollt, braucht ihr beherrschbare Großgeister. Mein Labyrinth kann prüfen, ob Tempests Technik das aushält.“',
        choices: [
          {
            id: 'open',
            label: 'Labyrinthflügel öffnen',
            nextNodeId: 'opened',
            requirements: [
              { flag: 'story.children.first-core' },
              { notFlag: 'story.ramiris.met' }
            ],
            effects: [
              { type: 'start-quest', questId: 'ramiris-labyrinth' },
              { type: 'complete-quest-step', questId: 'ramiris-labyrinth', stepId: 'meet-ramiris' },
              { type: 'set-flag', flag: 'story.ramiris.met', value: true }
            ]
          },
          {
            id: 'after',
            label: 'Kolossdaten abgleichen',
            nextNodeId: 'after',
            requirements: [{ flag: 'story.magic-colossus.defeated' }]
          },
          {
            id: 'start-run',
            label: 'Labyrinthlauf starten',
            nextNodeId: 'run-started',
            requirements: [
              { flag: 'story.magic-colossus.defeated' },
              { notFlag: 'labyrinth.run.active' }
            ],
            effects: [
              { type: 'set-flag', flag: 'labyrinth.run.active', value: true },
              { type: 'set-flag', flag: 'labyrinth.floor1.cleared', value: false },
              { type: 'set-flag', flag: 'labyrinth.floor2.cleared', value: false },
              { type: 'set-flag', flag: 'labyrinth.floor3.cleared', value: false },
              { type: 'set-flag', flag: 'encounter.labyrinth-floor-1.cleared', value: false },
              { type: 'set-flag', flag: 'encounter.labyrinth-floor-2.cleared', value: false },
              { type: 'set-flag', flag: 'encounter.labyrinth-floor-3.cleared', value: false }
            ]
          },
          {
            id: 'abort-run',
            label: 'Lauf abbrechen',
            nextNodeId: 'run-aborted',
            requirements: [{ flag: 'labyrinth.run.active' }],
            effects: [{ type: 'set-flag', flag: 'labyrinth.run.active', value: false }]
          },
          { id: 'leave', label: 'Noch vorbereiten' }
        ]
      },
      {
        id: 'opened',
        speaker: 'Ramiris',
        text: 'Der Türspalt klappt in die Tiefe. „Nur ein Flügel, keine Prahlerei. Der Wächter dort lässt euch erst weiter, wenn ihr Break, Elemente und Forschung zusammendenkt.“',
        choices: [{ id: 'end', label: 'Zum Labyrinth' }]
      },
      {
        id: 'after',
        speaker: 'Ramiris',
        text: 'Ramiris klopft gegen einen Geistkristall. „Gut. Der Koloss ist gebrochen, nicht zerstört. Genau so kommt ihr später an die Großgeister, ohne die Kinder zu verbrennen.“',
        choices: [{ id: 'end', label: 'Daten sichern' }]
      },
      {
        id: 'run-started',
        speaker: 'Ramiris',
        text: 'Ramiris klappt drei Türen nacheinander auf. „Keine Rast zwischen den Etagen. Was ihr an LP und MP verliert, tragt ihr weiter — dafür spuckt der Kern echtes Schmiedematerial aus.“',
        choices: [{ id: 'end', label: 'In die erste Etage' }]
      },
      {
        id: 'run-aborted',
        speaker: 'Ramiris',
        text: 'Der Türspalt faltet sich zu. „Abbrechen ist erlaubt. Prahlen erst, wenn ihr den Lauf auch beendet.“',
        choices: [{ id: 'end', label: 'Zurück zur Akademie' }]
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
    // Entscheidungspunkt nach der Benennung; verschwindet, sobald die Ausrichtung
    // gewaehlt ist (tempest.priority.chosen).
    id: 'tempest-council',
    name: 'Ratsversammlung',
    mapId: 'tempest-start',
    position: { x: 3, y: 11 },
    dialogId: 'tempest-priority',
    color: 0xc9a24a,
    requirements: [{ flag: 'story.tempest.named' }, { notFlag: 'tempest.priority.chosen' }]
  },
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
    position: { x: 10, y: 7 },
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
    position: { x: 10, y: 7 },
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
    position: { x: 10, y: 7 },
    dialogId: 'rigurd-act1',
    color: 0xe9c56c,
    requirements: [{ flag: 'story.act1.completed' }]
  },
  {
    id: 'shuna',
    name: 'Shuna',
    mapId: 'tempest-start',
    position: { x: 11, y: 3 },
    dialogId: 'shuna-ritual',
    color: 0xf0b7ff,
    requirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'gobta',
    name: 'Gobta',
    mapId: 'tempest-start',
    position: { x: 13, y: 7 },
    dialogId: 'gobta-border',
    color: 0x9ff0a4,
    requirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'deserter-refugee',
    name: 'Geretteter Grenzgänger',
    mapId: 'tempest-start',
    position: { x: 4, y: 5 },
    dialogId: 'deserter-refugee',
    color: 0xb7aa91,
    requirements: [{ flag: 'choice.deserters.mercy' }]
  },
  {
    id: 'ranga-tempest',
    name: 'Ranga',
    mapId: 'tempest-start',
    position: { x: 4, y: 8 },
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
    position: { x: 5, y: 4 },
    dialogId: 'kijin-naming',
    color: 0xd66c6c,
    // Die geflüchteten Oger erscheinen im Dorf, sobald das Slime-Prolog-Kapitel steht.
    requirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'tempest-camp',
    name: 'Tempest-Lager',
    mapId: 'tempest-start',
    position: { x: 12, y: 10 },
    dialogId: 'tempest-rest',
    color: 0xf0d078,
    requirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'kurobe-tempest',
    name: 'Kurobe',
    mapId: 'tempest-start',
    position: { x: 18, y: 7 },
    dialogId: 'tempest-builders',
    color: 0x9d6c4a,
    requirements: [{ flag: 'story.kijin.named' }, { flag: 'faction.dwargon.allied' }]
  },
  {
    id: 'kaijin-tempest',
    name: 'Kaijin',
    mapId: 'tempest-start',
    position: { x: 19, y: 9 },
    dialogId: 'tempest-builders',
    color: 0xd2a679,
    service: 'smith',
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
    service: 'smith',
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
  },
  {
    id: 'academy-kenya',
    name: 'Kenya',
    mapId: 'freedom-academy',
    position: { x: 12, y: 5 },
    dialogId: 'shizu-children',
    color: 0xe8a04a,
    requirements: [{ flag: 'story.shizu.vow' }]
  },
  {
    id: 'academy-chloe',
    name: 'Chloe',
    mapId: 'freedom-academy',
    position: { x: 13, y: 5 },
    dialogId: 'shizu-children',
    color: 0x8fb8ff,
    requirements: [{ flag: 'story.shizu.vow' }]
  },
  {
    id: 'academy-alice',
    name: 'Alice',
    mapId: 'freedom-academy',
    position: { x: 14, y: 6 },
    dialogId: 'shizu-children',
    color: 0xf2d36b,
    requirements: [{ flag: 'story.shizu.vow' }]
  },
  {
    id: 'academy-ryota',
    name: 'Ryota',
    mapId: 'freedom-academy',
    position: { x: 12, y: 7 },
    dialogId: 'shizu-children',
    color: 0x6ec6ff,
    requirements: [{ flag: 'story.shizu.vow' }]
  },
  {
    id: 'academy-gale',
    name: 'Gale',
    mapId: 'freedom-academy',
    position: { x: 14, y: 7 },
    dialogId: 'shizu-children',
    color: 0x7ed957,
    requirements: [{ flag: 'story.shizu.vow' }]
  },
  {
    id: 'arena-steward',
    name: 'Arena-Vorstand',
    mapId: 'tempest-colosseum',
    position: { x: 5, y: 6 },
    dialogId: 'tempest-arena',
    color: 0xd9b36c
  },
  {
    id: 'academy-ramiris',
    name: 'Ramiris',
    mapId: 'freedom-academy',
    position: { x: 16, y: 5 },
    dialogId: 'ramiris-labyrinth',
    color: 0x9af7ff,
    requirements: [{ flag: 'story.children.first-core' }]
  },
  {
    id: 'labyrinth-ramiris',
    name: 'Ramiris',
    mapId: 'ramiris-labyrinth',
    position: { x: 5, y: 7 },
    dialogId: 'ramiris-labyrinth',
    color: 0x9af7ff,
    requirements: [{ flag: 'story.ramiris.met' }]
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
    itemIds: ['healing-herb', 'mana-drop', 'purifying-water', 'traveler-cloak', 'tempest-charm', 'hipokte-herb', 'revival-elixir', 'ward-talisman', 'kurobe-katana', 'kijin-haori', 'oni-mask', 'lesser-magicule-core', 'ember-magicule-core', 'soul-forged-core', 'spirit-oak-staff', 'warded-brigandine', 'swiftwind-boots', 'resonant-core'],
    itemRequirements: [
      // Phase 152 — mittlere Raritaeten erst nach der Ratsversammlung.
      { itemId: 'spirit-oak-staff', requirements: [{ flag: 'story.council.ready' }] },
      { itemId: 'warded-brigandine', requirements: [{ flag: 'story.council.ready' }] },
      { itemId: 'swiftwind-boots', requirements: [{ flag: 'story.council.ready' }] },
      { itemId: 'resonant-core', requirements: [{ flag: 'story.council.ready' }] },
      {
        itemId: 'tempest-charm',
        requirements: [{ flag: 'story.council.ready' }]
      },
      {
        itemId: 'lesser-magicule-core',
        requirements: [{ flag: 'story.council.ready' }]
      },
      {
        itemId: 'ember-magicule-core',
        requirements: [{ flag: 'story.council.ready' }]
      },
      {
        itemId: 'soul-forged-core',
        requirements: [{ flag: 'story.council.ready' }]
      },
      {
        itemId: 'hipokte-herb',
        requirements: [{ flag: 'story.council.ready' }]
      },
      {
        itemId: 'revival-elixir',
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
    sellMultiplier: 0.5,
    buyMultiplierByFlag: [
      { flag: 'choice.deserters.mercy', multiplier: 0.8 }
    ]
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
    itemIds: ['healing-herb', 'mana-drop', 'purifying-water', 'tempest-charm', 'hipokte-herb', 'full-potion', 'revival-elixir'],
    buyMultiplier: 1.15,
    sellMultiplier: 0.5,
    buyMultiplierByFlag: [
      { flag: 'choice.gabiru.respect', multiplier: 0.9 }
    ]
  },
  {
    id: 'shrine-rest',
    name: 'Schreinrast',
    mapId: 'spirit-highlands',
    position: { x: 4, y: 4 },
    itemIds: ['healing-herb', 'mana-drop', 'purifying-water', 'traveler-cloak', 'tempest-charm', 'hipokte-herb', 'full-potion', 'magisteel-blade', 'dwarf-plate', 'forge-band'],
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
    itemIds: ['healing-herb', 'mana-drop', 'purifying-water', 'hipokte-herb', 'full-potion'],
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
    itemIds: ['healing-herb', 'mana-drop', 'purifying-water', 'traveler-cloak', 'hipokte-herb', 'full-potion', 'tempest-charm'],
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
    enemyIds: ['forest-slime', 'direwolf-pup', 'forest-slime'],
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
    enemyIds: ['forest-slime', 'forest-slime'],
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
    enemyIds: ['spore-moth', 'orc-scout', 'spore-moth'],
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
    // Phase 88c — Kategorie-Mechanik ON-ROUTE: das Streunende Echo (resistsCategory
    // 'magical') steht jetzt auf dem Pflichtpfad statt nur in Nebenquests. Wer nur
    // Magie spammt, wird ausgebremst — der Kampf zwingt physischen Schaden zu wählen.
    // Ersetzt die Sporenmotte (statt des XP-starken Lanzenträgers), damit der
    // Ressourcen-/Level-Bogen zu den späten Bossen erhalten bleibt.
    enemyIds: ['human-lancer', 'stray-echo'],
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
    // Phase 88d — Physisch-Resistenz-Zweig ON-ROUTE: der Sumpfschrecken
    // (resistsCategory 'physical') ersetzt den Lanzenträger und zwingt magischen
    // Schaden — Gegenstück zum Streunenden Echo (marsh-frontier-clash, zwingt physisch).
    enemyIds: ['mordrahn-vanguard', 'bog-terror'],
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
    // Deckungsgleich mit der east-route-Location; (20,5) ist im Stadt-Ausbau Wand.
    position: { x: 20, y: 6 },
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
    id: 'deserter-retaliation',
    mapId: 'tempest-start',
    kind: 'trigger',
    // (19,5) wird im Stadt-Ausbau zur Wand → Kampf unerreichbar. (19,6) ist in allen
    // Ausbaustufen begehbar (neben dem east-route-deserter-Encounter (20,6)).
    position: { x: 19, y: 6 },
    enemyIds: ['human-deserter', 'human-deserter', 'human-lancer'],
    chance: 1,
    requirements: [
      { flag: 'choice.deserters.hardline' },
      { notFlag: 'sidequest.deserter.retaliation-cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.deserter.retaliation-cleared', value: true }
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
    enemyIds: ['spore-moth', 'lizardman-acolyte', 'spore-moth'],
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
    enemyIds: ['lizardman-acolyte', 'mordrahn-vanguard', 'lizardman-acolyte'],
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
  },
  {
    id: 'magic-colossus',
    mapId: 'ramiris-labyrinth',
    kind: 'trigger',
    position: { x: 18, y: 6 },
    enemyIds: ['magic-colossus'],
    chance: 1,
    requirements: [
      { flag: 'story.ramiris.met' },
      { notFlag: 'story.magic-colossus.defeated' }
    ],
    startEffects: [
      { type: 'complete-quest-step', questId: 'ramiris-labyrinth', stepId: 'enter-labyrinth' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.magic-colossus.defeated', value: true },
      { type: 'complete-quest-step', questId: 'ramiris-labyrinth', stepId: 'defeat-colossus' },
      { type: 'complete-quest', questId: 'ramiris-labyrinth' },
      { type: 'add-gold', amount: 220 },
      { type: 'add-item', itemId: 'magisteel', quantity: 1 },
      { type: 'add-item', itemId: 'spirit-ember', quantity: 1 }
    ]
  },
  {
    id: 'labyrinth-floor-1',
    mapId: 'ramiris-labyrinth',
    kind: 'trigger',
    position: { x: 6, y: 6 },
    enemyIds: ['spore-moth', 'lizardman-acolyte'],
    chance: 1,
    requirements: [
      { flag: 'labyrinth.run.active' },
      { notFlag: 'labyrinth.floor1.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'labyrinth.floor1.cleared', value: true },
      { type: 'add-gold', amount: 35 },
      { type: 'add-item', itemId: 'healing-herb', quantity: 1 }
    ]
  },
  {
    id: 'labyrinth-floor-2',
    mapId: 'ramiris-labyrinth',
    kind: 'trigger',
    position: { x: 12, y: 7 },
    enemyIds: ['ogre-warrior', 'orc-soldier'],
    chance: 1,
    requirements: [
      { flag: 'labyrinth.run.active' },
      { flag: 'labyrinth.floor1.cleared' },
      { notFlag: 'labyrinth.floor2.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'labyrinth.floor2.cleared', value: true },
      { type: 'add-gold', amount: 70 },
      { type: 'add-item', itemId: 'magic-ore', quantity: 2 }
    ]
  },
  {
    id: 'labyrinth-floor-3',
    mapId: 'ramiris-labyrinth',
    kind: 'trigger',
    position: { x: 18, y: 6 },
    enemyIds: ['orc-general', 'lizardman-warrior'],
    chance: 1,
    requirements: [
      { flag: 'labyrinth.run.active' },
      { flag: 'labyrinth.floor2.cleared' },
      { notFlag: 'labyrinth.floor3.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'labyrinth.floor3.cleared', value: true },
      { type: 'set-flag', flag: 'labyrinth.run.active', value: false },
      { type: 'add-gold', amount: 120 },
      { type: 'add-item', itemId: 'magisteel', quantity: 1 },
      { type: 'add-item', itemId: 'spirit-ember', quantity: 1 }
    ]
  },
  {
    id: 'tempest-invasion-vanguard',
    mapId: 'jura-battlefield',
    kind: 'trigger',
    position: { x: 9, y: 7 },
    enemyIds: ['human-lancer', 'human-deserter'],
    chance: 1,
    requirements: [
      { flag: 'story.tempest-invasion.active' },
      { notFlag: 'story.tempest-invasion.vanguard-cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.tempest-invasion.vanguard-cleared', value: true },
      { type: 'complete-quest-step', questId: 'tempest-invasion', stepId: 'vanguard' },
      { type: 'add-gold', amount: 60 }
    ]
  },
  {
    id: 'tempest-invasion-command',
    mapId: 'jura-battlefield',
    kind: 'trigger',
    position: { x: 15, y: 6 },
    enemyIds: ['human-lancer', 'human-deserter', 'human-lancer'],
    chance: 1,
    requirements: [
      { flag: 'story.tempest-invasion.vanguard-cleared' },
      { notFlag: 'story.tempest-invasion.repulsed' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.tempest-invasion.repulsed', value: true },
      { type: 'set-flag', flag: 'story.tempest-invasion.active', value: false },
      { type: 'complete-quest-step', questId: 'tempest-invasion', stepId: 'command' },
      { type: 'complete-quest', questId: 'tempest-invasion' },
      { type: 'adjust-reputation', factionId: 'blumund', amount: 10 },
      { type: 'add-gold', amount: 160 },
      { type: 'add-item', itemId: 'magisteel', quantity: 1 }
    ]
  },
  {
    id: 'blumund-road-ambush',
    mapId: 'blumund',
    kind: 'random',
    bounds: { x: 3, y: 3, width: 14, height: 9 },
    enemyIds: ['blumund-bandit', 'human-deserter'],
    chance: 0.1
  },
  {
    id: 'academy-spirit-flare',
    mapId: 'freedom-academy',
    kind: 'random',
    bounds: { x: 4, y: 3, width: 14, height: 8 },
    enemyIds: ['academy-wisp', 'stray-echo'],
    chance: 0.1
  },
  // Phase 146 — Vielfalt fuer duenne Zufallspools: je ein zweiter Zufalls-Encounter mit
  // den neuen Archetypen (kleine Gruppen, keine groesseren Bestandskaempfe). Alle Level
  // liegen im aktuellen Ambient-Band ihrer Region → floor/ceil unveraendert. NICHT in
  // `region.encounterIds` → off-route zur Story-Harness.
  {
    id: 'marsh-brackenhollow',
    mapId: 'spirit-marsh',
    kind: 'random',
    bounds: { x: 4, y: 3, width: 14, height: 9 },
    enemyIds: ['marsh-thornback', 'bog-warden'],
    chance: 0.12
  },
  {
    id: 'highlands-stormroost',
    mapId: 'spirit-highlands',
    kind: 'random',
    bounds: { x: 3, y: 2, width: 18, height: 10 },
    enemyIds: ['highland-galecaller', 'lizardman-acolyte'],
    chance: 0.12
  },
  {
    id: 'blumund-backalley',
    mapId: 'blumund',
    kind: 'random',
    bounds: { x: 3, y: 3, width: 14, height: 9 },
    enemyIds: ['blumund-brigand', 'blumund-bandit'],
    chance: 0.1
  },
  {
    id: 'academy-revenant-haunt',
    mapId: 'freedom-academy',
    kind: 'random',
    bounds: { x: 4, y: 3, width: 14, height: 8 },
    enemyIds: ['academy-revenant', 'stray-echo'],
    chance: 0.1
  },
  // Phase 73 — bislang encounter-lose Gegner ins Spiel holen. Optionale
  // Set-Piece-Trigger auf bestehenden Karten, hinter vorhandene Story-Flags
  // gegated; kein Pflichtpfad, daher nicht in den Balance-Korridoren.
  {
    // Ork-Späher als Vorbote der Horde, bevor der General auftaucht.
    id: 'orc-scout-patrol',
    mapId: 'jura-battlefield',
    kind: 'trigger',
    position: { x: 3, y: 7 },
    enemyIds: ['orc-grunt', 'orc-grunt'],
    chance: 1,
    requirements: [
      { flag: 'story.treyni.met' }
    ],
    victoryEffects: [
      { type: 'add-item', itemId: 'orc-tusk', quantity: 1 }
    ]
  },
  {
    // Trauernde Oger-Überlebende, deren Dorf die Ork-Horde verwüstet hat.
    id: 'grieving-ogres',
    mapId: 'jura-battlefield',
    kind: 'trigger',
    position: { x: 21, y: 5 },
    enemyIds: ['ogre-warrior', 'ogre-warrior'],
    chance: 1,
    requirements: [
      { flag: 'story.orc.engaged' }
    ],
    victoryEffects: [
      { type: 'add-item', itemId: 'magic-ore', quantity: 1 }
    ]
  },
  {
    // Ein Ork-Lord-Rest sammelt sich, nachdem „Geld" verschlungen ist.
    id: 'orc-lord-remnant',
    mapId: 'jura-battlefield',
    kind: 'trigger',
    position: { x: 12, y: 11 },
    enemyIds: ['orc-lord'],
    chance: 1,
    requirements: [
      { flag: 'story.geld.devoured' }
    ],
    victoryEffects: [
      { type: 'add-item', itemId: 'famine-charm', quantity: 1 }
    ]
  },
  {
    // Milim Nava sucht Tempest auf, um den neuen Dämonenlord zu prüfen — ein
    // optionaler Duell-Wall weit über dem regulären Ziellevel.
    id: 'milim-duel',
    mapId: 'tempest-start',
    kind: 'trigger',
    position: { x: 8, y: 7 },
    enemyIds: ['milim'],
    chance: 1,
    requirements: [
      { flag: 'story.ifrit.subdued' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'story.milim.duel', value: true },
      { type: 'add-item', itemId: 'magisteel', quantity: 1 }
    ]
  },
  {
    id: 'arena-bronze-wave',
    mapId: 'tempest-colosseum',
    kind: 'trigger',
    position: { x: 11, y: 6 },
    enemyIds: ['forest-slime', 'direwolf-pup', 'orc-grunt'],
    chance: 1,
    requirements: [
      { flag: 'arena.run.active' },
      { notFlag: 'arena.bronze.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'arena.bronze.cleared', value: true },
      { type: 'complete-quest-step', questId: 'tempest-arena', stepId: 'bronze' },
      { type: 'add-gold', amount: 40 },
      { type: 'add-item', itemId: 'healing-herb', quantity: 1 }
    ]
  },
  {
    id: 'arena-silver-wave',
    mapId: 'tempest-colosseum',
    kind: 'trigger',
    position: { x: 11, y: 6 },
    enemyIds: ['lizardman-warrior', 'ogre-warrior'],
    chance: 1,
    requirements: [
      { flag: 'arena.bronze.cleared' },
      { notFlag: 'arena.silver.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'arena.silver.cleared', value: true },
      { type: 'complete-quest-step', questId: 'tempest-arena', stepId: 'silver' },
      { type: 'add-gold', amount: 70 },
      { type: 'add-item', itemId: 'orc-tusk', quantity: 1 }
    ]
  },
  {
    id: 'arena-gold-wave',
    mapId: 'tempest-colosseum',
    kind: 'trigger',
    position: { x: 11, y: 6 },
    enemyIds: ['orc-general', 'ogre-warrior', 'lizardman-warrior'],
    chance: 1,
    requirements: [
      { flag: 'arena.silver.cleared' },
      { notFlag: 'arena.gold.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'arena.gold.cleared', value: true },
      { type: 'set-flag', flag: 'arena.run.active', value: false },
      { type: 'complete-quest-step', questId: 'tempest-arena', stepId: 'gold' },
      { type: 'complete-quest', questId: 'tempest-arena' },
      { type: 'add-gold', amount: 180 },
      { type: 'add-item', itemId: 'magisteel', quantity: 1 }
    ]
  },
  // Phase 154 — Jagd-Encounter der an Loot gekoppelten Nebenquests. Gegated hinter dem
  // jeweiligen `sidequest.<x>.started`-Flag und `notFlag: cleared`, damit sie nur waehrend
  // des Auftrags erscheinen und der Sieg den Auftrag abschliesst. Stehen in KEINER
  // Region-`encounterIds`-Liste → off-route, Balance-Harness unberuehrt.
  {
    id: 'emberforge-hunt-battle',
    mapId: 'ember-hollow',
    kind: 'trigger',
    position: { x: 7, y: 4 },
    enemyIds: ['ogre-warrior'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.emberforge.started' },
      { notFlag: 'sidequest.emberforge.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.emberforge.cleared', value: true },
      { type: 'complete-quest-step', questId: 'emberforge-hunt', stepId: 'hunt-ember' }
    ]
  },
  {
    id: 'echomoor-blade-hunt-battle',
    mapId: 'lizardman-marsh',
    kind: 'trigger',
    position: { x: 7, y: 4 },
    enemyIds: ['lizardman-warrior', 'lizardman-acolyte'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.echomoor-blade.started' },
      { notFlag: 'sidequest.echomoor-blade.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.echomoor-blade.cleared', value: true },
      { type: 'complete-quest-step', questId: 'echomoor-blade-hunt', stepId: 'hunt-blade' }
    ]
  },
  {
    id: 'highland-ward-hunt-battle',
    mapId: 'spirit-highlands',
    kind: 'trigger',
    position: { x: 9, y: 4 },
    enemyIds: ['mordrahn-vanguard', 'stray-echo'],
    chance: 1,
    requirements: [
      { flag: 'sidequest.highland-ward.started' },
      { notFlag: 'sidequest.highland-ward.cleared' }
    ],
    victoryEffects: [
      { type: 'set-flag', flag: 'sidequest.highland-ward.cleared', value: true },
      { type: 'complete-quest-step', questId: 'highland-ward-hunt', stepId: 'hunt-ward' }
    ]
  }
] as const satisfies readonly EncounterDefinition[];
