// Phase 171 — Mechanik-Handbuch: knappe In-Game-Erklaerungen aller Spielsysteme
// als achter Codex-Modus. Reine Daten/Logik (Phaser-frei); spoiler-sensible
// Eintraege sind hinter bestehenden Story-Flags gegatet.

export interface HandbookEntry {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Optional: Eintrag erscheint erst, wenn das Flag gesetzt ist (Spoiler-Schutz). */
  readonly unlockFlag?: string;
}

export const HANDBOOK_ENTRIES: readonly HandbookEntry[] = [
  {
    id: 'combat-basics',
    title: 'Analyse & Break',
    body: 'Analysieren (Großer Weiser) deckt Schwächen und Telegraphe auf — einmal studierte Arten starten künftige Kämpfe aufgedeckt (Bestiarium). Treffer auf Schwächen füllen die Break-Leiste; ein gebrochener Gegner nimmt mehr Schaden und ist leichter zu verschlingen.'
  },
  {
    id: 'ct-order',
    title: 'CT-Leiste & Zugreihenfolge',
    body: 'Die CT-Leiste zeigt, wer als Nächstes handelt. Manche Aktionen verzögern gegnerische Züge (CT-Delay) — plane Heilung und Schutz VOR dem Zug schneller Gegner.'
  },
  {
    id: 'reaction',
    title: 'Reaktion (Timing-Verteidigung)',
    body: 'Bei gegnerischen Angriffen öffnet sich ein Timing-Fenster: perfekt reagiert nur 0,25× Schaden, rechtzeitig 0,5×, verpasst voller Schaden. Aktive Verteidigung ist ein Könnens-Moment, kein Automatismus.'
  },
  {
    id: 'elements',
    title: 'Elemente & Resistenz-Leiter',
    body: 'Schwäche 1,75× · Resistenz 0,5× · Immunität 0 · Absorption HEILT den Gegner. Prüfe nach der Analyse das Log/Bestiarium und wechsle das Element, statt Schwächen zu spammen — Absorber bestrafen das falsche Element.'
  },
  {
    id: 'status-cure',
    title: 'Status & Reinigung',
    body: 'Harte Kontrolle (Schlaf, Betäubung, Lähmung, Versteinerung, Verwirrung) kostet Züge. Schlaf bricht bei Schaden. Läuterungswasser entfernt negative Status und lässt Buffs stehen; Widerstands-Perks wehren Status präventiv ab.'
  },
  {
    id: 'devour-mimic',
    title: 'Verschlingen & Mimikry',
    body: 'Rimuru kann analysierte, geschwächte Gegner verschlingen (nach Break deutlich wahrscheinlicher) und erhält ihre Fertigkeit. Mimikry nimmt eine verschlungene Form an und erbt dabei deren Resistenz-Profil — wähle die Form passend zum Gegner.'
  },
  {
    id: 'steal',
    title: 'Rauben (Prädator-Perversion)',
    body: 'Auf einem analysierten, verschlingbaren Gegner zieht „⊗ Rauben" dessen Fertigkeit in Rimurus Loadout, ohne ihn zu töten. Seelengebundenes ist geschützt: Bosse und Ultimate-Fertigkeiten sind nicht raubbar.',
    unlockFlag: 'story.shizu.vow'
  },
  {
    id: 'skill-tiers',
    title: 'Skill-Ränge',
    body: 'Fertigkeiten tragen vier Ränge: Skill → Extra Skill → Unique Skill → Ultimate Skill (Glyphe und Farbe im Menü). Höhere Ränge sind seltener und stärker; Fusion führt die Leiter hinauf.'
  },
  {
    id: 'formation',
    title: 'Formation (Reihen)',
    body: 'Frontreihe: voller Schaden, volles Risiko. Rückreihe: weniger physischer Schaden in beide Richtungen. Stelle Heiler und Magier nach hinten, Klingen nach vorn.'
  },
  {
    id: 'magicules-naming',
    title: 'Magicules & Benennen',
    body: 'Magicules sind die Ausbau-Währung: Kämpfe und Funde füllen sie, Benennen von Bewohnern und Forschung verbrauchen sie. Ein benannter Bewohner wird stärker und kann Einrichtungen besetzen, die pro Tempest-Rast Ressourcen produzieren.',
    unlockFlag: 'story.council.ready'
  },
  {
    id: 'souls-awakening',
    title: 'Seelen & Erntefest',
    body: 'Nur Boss-Siege ernten Seelen. Das Erntefest (Erwachen) verbraucht Magicules UND Seelen: Tempests Offiziere werden erweckt, Rimuru erwacht — und jeder Gefährte erhält sein Ultimate-Geschenk (dauerhafter Bonus).',
    unlockFlag: 'story.council.ready'
  },
  {
    id: 'loot-rarity',
    title: 'Beute: Raritäten & Affixe',
    body: 'Ausrüstung hat Raritätsstufen (Farbe im Menü): gewöhnlich, selten, episch, legendär, legendär-Set. Gerollte Fundstücke aus Labyrinth und Boss-Siegen tragen zusätzliche Affixe („✦ …") — vergleiche vor dem Anlegen die ▲/▼-Stat-Vorschau.'
  },
  {
    id: 'workbench',
    title: 'Werkbank: Zerlegen & Umschmieden',
    body: 'An der Schmiede zerlegt die Werkbank ungenutzte Beute in Materialien (je höher die Rarität, desto mehr). Umschmieden würfelt die Affixe einer Fundstück-Instanz neu — es kostet Magisteel und Gold, der Kreislauf: Beute → zerlegen → umschmieden.',
    unlockFlag: 'craft.smithing.unlocked'
  },
  {
    id: 'core-slot',
    title: 'Kern-Slot',
    body: 'Der vierte Ausrüstungs-Slot nimmt Magicule-Kerne auf — thematisch an die Magicule-/Seelen-Ökonomie gebunden. Kerne fallen vor allem bei Bossen und im „Tempest-Vorrat" an.',
    unlockFlag: 'story.council.ready'
  },
  {
    id: 'bestiary-mastery',
    title: 'Bestiarium & Jagdgründe',
    body: 'Jede besiegte Art erscheint im Bestiarium; einmal per Analyse studiert, zeigt es Schwächen, Resistenzen, Immunitäten und Absorption dauerhaft. Sind alle Arten eines Jagdgrunds studiert, gibt es einmalig einen Magicule-Fund.'
  },
  {
    id: 'labyrinth',
    title: 'Labyrinth (Ramiris)',
    body: 'Drei Etagen ohne Zwischenrast — LP/MP werden mitgenommen. Die Gegner skalieren mit deiner Party (plus Tiefen-Vorsprung), die Beute wird pro Etage besser; auf der tiefsten Etage wartet manchmal ein verschlingbares Boss-Echo.'
  },
  {
    id: 'world-clock',
    title: 'Welt-Uhr & Rast',
    body: 'Die Welt kennt Tageszeiten und Wetter. Die Tempest-Rast lässt Einrichtungen produzieren und die Küche gewährt einmalig einen Schutz-Status für den nächsten Kampf.'
  },
  {
    id: 'bonds',
    title: 'Bindungen & Team-Attacken',
    body: 'Gemeinsame Kämpfe vertiefen Bindungen zwischen Gefährten: Stufen geben Stat-Boni, ab Stufe 2 Team-Attacken, ab Stufe 3 Eröffnungs-Status und Perks. Bindungsszenen erzählen die Beziehung.'
  }
];

export interface HandbookView {
  readonly entries: readonly HandbookEntry[];
  readonly lockedCount: number;
}

/** Sichtbare Handbuch-Eintraege: ungegatete immer, gegatete erst mit gesetztem Flag. */
export function buildHandbook(flags: Readonly<Record<string, boolean>>): HandbookView {
  const entries = HANDBOOK_ENTRIES.filter(
    (entry) => !entry.unlockFlag || flags[entry.unlockFlag] === true
  );
  return { entries, lockedCount: HANDBOOK_ENTRIES.length - entries.length };
}
