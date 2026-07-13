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
  { id: 'predator', name: 'Verschlinger', description: 'Rimurus einzigartige Fähigkeit: verschlingt gebrochene, geschwächte Gegner und eignet sich ihre Kraft an.', element: 'shadow', target: 'self', costMp: 0, power: 0, tags: ['buff'], tier: 'unique-skill' },
  // Phase 108 — Skill-Fusion: verschmolzene Fertigkeiten. Der Große Weiser bündelt
  // gelernte Skills zu einem stärkeren; jeder Output steht über seinen Eingaben.
  { id: 'hydro-lash', name: 'Hydra-Schneide', description: 'Der Große Weiser bündelt Schleimschlag und Wasserstrahl zu einer geformten Wasserklinge, die härter und präziser trifft.', element: 'water', target: 'single-enemy', costMp: 7, power: 40, tags: ['magical'], tier: 'extra-skill', heavy: true },
  { id: 'maelstrom-fang', name: 'Mahlstrom-Reißzahn', description: 'Rangas Sturmwolf verschmilzt Direwolf-Ansturm und Raubtieraura zu einem reißenden Wirbelsturm-Angriff.', element: 'wind', target: 'single-enemy', costMp: 11, power: 52, tags: ['physical'], tier: 'unique-skill', heavy: true },
  { id: 'predator-perversion', name: 'Praedator-Perversion', description: 'Praedator zerlegt geraubte Fertigkeiten; der Große Weiser setzt sie zu einer schärferen Unique-Form zusammen.', element: 'shadow', target: 'single-enemy', costMp: 16, power: 58, tags: ['magical', 'debuff'], tier: 'unique-skill', heavy: true, statusEffect: { id: 'guard-break', chance: 0.75, turns: 2 } },
  // Phase 94 — Elementarfelder: laden das Schlachtfeld elementar auf (Board-Control).
  // Reiner Aufbau (kein Schaden) → verstärkt danach gleichelementige Treffer und öffnet
  // Fusions-Reaktionen (z. B. Glutfeld + Windtreffer = Feuersturm). Keine Auto-Nutzung.
  { id: 'ember-field', name: 'Glutfeld', description: 'Benimaru entfacht den Boden zu einem Flammenfeld — Feuertreffer lodern stärker, ein Windschlag entfacht einen Feuersturm.', element: 'fire', target: 'self', costMp: 8, power: 0, tags: ['buff'], tier: 'extra-skill', chargesField: true },
  { id: 'gale-field', name: 'Sturmfeld', description: 'Ranga peitscht Sturmböen über das Feld — Windtreffer schneiden schärfer, Fusionen mit anderen Elementen entfesseln sich.', element: 'wind', target: 'self', costMp: 8, power: 0, tags: ['buff'], tier: 'extra-skill', chargesField: true },
  { id: 'tide-field', name: 'Gezeitenfeld', description: 'Souei flutet das Schlachtfeld mit Wasser — Wassertreffer branden stärker, Fusionen wie Dampf oder Sturmflut werden möglich.', element: 'water', target: 'self', costMp: 8, power: 0, tags: ['buff'], tier: 'extra-skill', chargesField: true },
  // Phase 181 — Feindliches Elementarfeld: der Magiekoloss türmt den Boden zu einem Erdwall
  // auf (chargesField). Verstärkt seine eigenen Erdschläge (ogre-smash/petrifying-gaze); ein
  // Fremd-Element-Treffer (Wind/Wasser = seine Schwächen) entlädt dagegen eine Fusions-Reaktion
  // und räumt das Feld — das ist das lesbare Gegenspiel des Spielers.
  { id: 'terrastorm-field', name: 'Erdwall-Feld', description: 'Der Magiekoloss türmt den Boden zu einem massiven Erdwall auf — Erdtreffer wuchten schwerer, doch fremde Elemente entladen sich als Reaktion.', element: 'earth', target: 'self', costMp: 10, power: 0, tags: ['buff'], tier: 'extra-skill', chargesField: true },
  // Phase 183 — zweiter, elementar verschiedener Feld-Träger (off-route): Milims überwältigende
  // Drachenglut entzündet das Schlachtfeld zu einem Flammenfeld, das ihre Feuerschläge
  // (drago-nova/black-flame) verstärkt. Konter: ein Heilig-Treffer (ihre Schwäche) entlädt
  // eine Sonnenfeuer-Reaktion und räumt das Feld.
  { id: 'pyre-field', name: 'Drachen-Glutfeld', description: 'Milims überwältigende Drachenglut entzündet den Boden zu einem Flammenmeer — Feuertreffer lodern verheerend, fremde Elemente entladen sich als Reaktion.', element: 'fire', target: 'self', costMp: 12, power: 0, tags: ['buff'], tier: 'ultimate-skill', chargesField: true },
  // Phase 129 — Gegner-Kontrolle: telegraphierte Hart-CC-Skills aktivieren die gebaute,
  // aber ungenutzte Kontroll-Schicht. Bewusst maessvolle Chance/kurze Dauer; sleep/freeze
  // brechen bei Schaden (wakeOnDamage), stun/petrify nur 1 Runde. Traeger sind
  // Nicht-Harness-Gegner (Balance-Korridor unberuehrt); Gegenmittel: Läuterungswasser.
  { id: 'slumber-glow', name: 'Schlummerglühen', description: 'Das Akademie-Irrlicht pulsiert in einlullenden Wellen, die die Lider schwer werden lassen.', element: 'holy', target: 'single-enemy', costMp: 8, power: 12, tags: ['magical', 'debuff'], tier: 'extra-skill', statusEffect: { id: 'sleep', chance: 0.5, turns: 2 } },
  { id: 'blinding-feint', name: 'Blendfinte', description: 'Ein Handvoll Sand und ein falscher Hieb — der Blumund-Bandit stiftet Verwirrung.', element: 'neutral', target: 'single-enemy', costMp: 7, power: 16, tags: ['physical', 'debuff'], tier: 'skill', statusEffect: { id: 'confuse', chance: 0.5, turns: 2 } },
  { id: 'petrifying-gaze', name: 'Versteinernder Blick', description: 'Der Magiekoloss richtet seinen uralten Blick — Fleisch beginnt zu Stein zu erstarren.', element: 'earth', target: 'single-enemy', costMp: 12, power: 10, tags: ['magical', 'debuff'], tier: 'extra-skill', heavy: true, statusEffect: { id: 'petrify', chance: 0.35, turns: 1 } },
  { id: 'paralytic-howl', name: 'Lähmendes Heulen', description: 'Das uralte Direwolf-Heulen fährt durch Mark und Bein und lähmt die Glieder.', element: 'neutral', target: 'single-enemy', costMp: 9, power: 14, tags: ['magical', 'debuff'], tier: 'extra-skill', statusEffect: { id: 'paralyze', chance: 0.5, turns: 2 } },
  { id: 'crushing-blow', name: 'Zermalmender Hieb', description: 'Ein wuchtiger Ogerhieb, der das Ziel benommen zu Boden schlägt.', element: 'earth', target: 'single-enemy', costMp: 8, power: 28, tags: ['physical', 'debuff'], tier: 'extra-skill', heavy: true, statusEffect: { id: 'stun', chance: 0.4, turns: 1 } },
  // Phase 130 — Spieler-Kontrolle: gezielte CC-Fertigkeiten als TIEFE Spec-Belohnung
  // (Kapstein-Knoten von Hakurou/Souei, NICHT in der Balance-Harness-Priorität → Sims
  // unberuehrt). Bewusst kurze Dauer/maessvolle Chance; der Spieler erspielt Kontrolle
  // durch Spezialisierungs-Commitment (Qual der Wahl), statt sie geschenkt zu bekommen.
  { id: 'iai-stillness', name: 'Iai — Reglosigkeit', description: 'Hakurous vollendeter Blitzzug trifft einen Nerv und lässt das Ziel erstarren.', element: 'neutral', target: 'single-enemy', costMp: 10, power: 30, tags: ['physical', 'debuff'], tier: 'extra-skill', heavy: true, statusEffect: { id: 'stun', chance: 0.45, turns: 1 } },
  { id: 'shadow-bind', name: 'Schattenfessel', description: 'Souei wirft Stahlfäden aus dem Schatten, die die Glieder des Ziels verschnüren.', element: 'shadow', target: 'single-enemy', costMp: 11, power: 24, tags: ['magical', 'debuff'], tier: 'extra-skill', statusEffect: { id: 'paralyze', chance: 0.55, turns: 2 } },
  // Phase 133 — Freeze & Charm erwachen: die letzten beiden toten Hart-CC-Status. Beide
  // Traeger sind Nicht-Harness-Gegner (human-deserter, orc-lord) → Balance-Korridor
  // unberuehrt. freeze bricht bei Schaden (wakeOnDamage); charm gibt nur eine Aussetz-Chance.
  { id: 'frost-flask', name: 'Frostkolben', description: 'Der Deserteur zerschellt einen erbeuteten Alchemie-Kolben — beißender Frost lässt das Ziel erstarren.', element: 'water', target: 'single-enemy', costMp: 8, power: 18, tags: ['magical', 'debuff'], tier: 'skill', statusEffect: { id: 'freeze', chance: 0.4, turns: 2 } },
  { id: 'dominating-gaze', name: 'Beherrschender Blick', description: 'Der Ork-Lord fängt den Blick des Ziels — Gelds Fluch beugt für einen Moment dessen Willen.', element: 'shadow', target: 'single-enemy', costMp: 12, power: 14, tags: ['magical', 'debuff'], tier: 'extra-skill', statusEffect: { id: 'charm', chance: 0.4, turns: 2 } },
  // Phase 136 — Spieler-Weichkontrolle: gezielte Debuff-Fertigkeiten (silence/blind/weaken)
  // aktivieren die bislang nur auf Fusionen genutzte weiche Kontroll-Schicht offensiv. Als
  // TIEFE Spec-Belohnung an Nicht-Harness-Kapstein-Knoten (requiredLevel 9) → Balance-Korridor
  // unberuehrt (die Harness schaltet nur Gobta-/Rimuru-Knoten frei).
  { id: 'banishing-seal', name: 'Bannsiegel', description: 'Shuna verschließt mit einem heiligen Siegel den Zauberfluss des Ziels — für kurze Zeit keine Fähigkeiten.', element: 'holy', target: 'single-enemy', costMp: 12, power: 16, tags: ['magical', 'debuff'], tier: 'extra-skill', statusEffect: { id: 'silence', chance: 0.6, turns: 2 } },
  { id: 'blinding-dust', name: 'Blendstaub', description: 'Souei schleudert feinen Schattenstaub in die Augen des Ziels und trübt dessen Treffsicherheit.', element: 'shadow', target: 'single-enemy', costMp: 8, power: 20, tags: ['physical', 'debuff'], tier: 'skill', statusEffect: { id: 'blind', chance: 0.6, turns: 2 } },
  { id: 'enfeebling-grip', name: 'Zermürbender Griff', description: 'Shions Titanengriff presst die Kraft aus den Gliedern des Ziels — Angriff und Magie sinken.', element: 'neutral', target: 'single-enemy', costMp: 10, power: 26, tags: ['physical', 'debuff'], tier: 'extra-skill', statusEffect: { id: 'weaken', chance: 0.7, turns: 2 } },
  // Phase 138 — optionaler Akademie-Caster: Phase 2 wird als schwerer Flächenzauber
  // angekündigt; Bannsiegel lässt das Irrlicht stattdessen nur physisch angreifen.
  { id: 'arcane-overload', name: 'Arkane Überladung', description: 'Das Irrlicht überlädt seine freien Geistersplitter und entlädt sie über die ganze Gruppe.', element: 'holy', target: 'all-enemies', costMp: 18, power: 50, tags: ['magical', 'debuff'], tier: 'extra-skill', heavy: true, ctDelta: -75 }
] as const satisfies readonly SkillDefinition[];
