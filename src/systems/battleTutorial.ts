export interface BattleTutorialView {
  readonly id: string;
  readonly flag: string;
  readonly title: string;
  readonly body: string;
  readonly tips: readonly string[];
}

const TUTORIALS: Readonly<Record<string, BattleTutorialView>> = {
  'direwolf-pack-leader': {
    id: 'direwolf-boss',
    flag: 'tutorial.battle.direwolf.seen',
    title: 'Boss-Tipp: Rudeldruck',
    body: 'Der Direwolf-Anführer ist der erste Kampf, in dem reines Angreifen unnötig riskant wird.',
    tips: [
      'Verteidigen dämpft gefährliche Züge.',
      'Schwächen und Status bauen Break-Druck auf.',
      'Eine volle Teamleiste öffnet den Gruppenangriff.'
    ]
  },
  'whispering-grove-ambush': {
    id: 'grove-status',
    flag: 'tutorial.battle.grove.seen',
    title: 'Kampf-Tipp: Sporen und Status',
    body: 'Im Flüsterhain kontrollieren Status-Effekte das Tempo des Kampfes.',
    tips: [
      'Elementare Schwächen erzeugen sichere Schadensfenster.',
      'Buffs und Debuffs zählen stärker als blindes Angreifen.',
      'Gobta und Ranga füllen gemeinsam die Teamleiste.'
    ]
  },
  'shrine-approach': {
    id: 'nameless-echo',
    flag: 'tutorial.battle.echo.seen',
    title: 'Boss-Tipp: Namenloses Echo',
    body: 'Das Echo ist eine magische Ordnungsspur. Beobachte Status, Break-Leiste und seine Phasen.',
    tips: [
      'Magische Angriffe treffen die Siegelstruktur zuverlässiger.',
      'Break unterbricht Druck und macht das Echo verwundbar.',
      'Heile vor dem Phasenwechsel statt erst danach.'
    ]
  },
  'geld-disaster-boss': {
    id: 'orc-disaster',
    flag: 'tutorial.battle.orc-disaster.seen',
    title: 'Boss-Tipp: Orc Disaster',
    body: 'Gelds Hunger eskaliert in Phase 2. Analyse und Telegraph machen den Druck planbar.',
    tips: [
      'Heilige Treffer bauen den Break am schnellsten auf.',
      'Reagiere auf Katastrophenbrüllen mit Schutz oder Kontrolle.',
      'Nutze Signatur und Fusionskombo im Break-Fenster.'
    ]
  },
  'gabiru-duel': {
    id: 'gabiru',
    flag: 'tutorial.battle.gabiru.seen',
    title: 'Duell-Tipp: Gabiru',
    body: 'Gabirus Tempo wechselt zwischen Speersturm, Flutlanze und Kriegsschrei.',
    tips: [
      'Schatten ist seine analysierbare Schwäche.',
      'Der Telegraph unterscheidet Angriff und Verstärkung.',
      'Break verhindert, dass sein Tempo den Kampf diktiert.'
    ]
  },
  'ifrit-boss': {
    id: 'ifrit',
    flag: 'tutorial.battle.ifrit.seen',
    title: 'Boss-Tipp: Ifrit',
    body: 'Ifrit widersteht Feuer und setzt die gesamte Gruppe unter magischen Flächendruck.',
    tips: [
      'Wasser öffnet Break-Fenster.',
      'Der Inferno-Telegraph ist das Signal für Schutz und Heilung.',
      'Halte Signaturen und Teamfusion für die gebrochene Phase bereit.'
    ]
  }
};

export function getBattleTutorial(
  encounterId: string | null | undefined,
  flags: Readonly<Record<string, boolean>>
): BattleTutorialView | null {
  const tutorial = encounterId ? TUTORIALS[encounterId] : undefined;
  if (!tutorial || flags[tutorial.flag] === true) return null;
  return tutorial;
}
