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
