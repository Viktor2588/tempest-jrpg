import type { SaveGameV2 } from './save';

export type MilestoneTone = 'bond' | 'battle' | 'chapter';

export interface StoryMilestone {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly highlights: readonly string[];
  readonly tone: MilestoneTone;
}

type MilestoneSave = Pick<SaveGameV2, 'flags' | 'party' | 'quests'>;

interface MilestoneDefinition extends StoryMilestone {
  readonly eligible: (save: MilestoneSave) => boolean;
}

const MILESTONES: readonly MilestoneDefinition[] = [
  {
    id: 'gobta-joins',
    kicker: 'Neue Bindung',
    title: 'Gobta tritt der Gruppe bei',
    body: 'Rigurds Bitte wird zur ersten gemeinsamen Aufgabe. Gobta kennt die Waldpfade und kämpft von nun an an Rimurus Seite.',
    highlights: ['Aktives Partymitglied: Gobta', 'Neue Front- und Scout-Fähigkeiten'],
    tone: 'bond',
    eligible: (save) => hasMember(save, 'gobta') && save.flags['story.goblin.plea'] === true
  },
  {
    id: 'direwolf-victory',
    kicker: 'Boss bezwungen',
    title: 'Das Direwolf-Rudel weicht zurück',
    body: 'Der Kampf endet nicht mit Auslöschung. Der junge Wolf an der Lichtung wartet auf Rimurus Entscheidung.',
    highlights: ['Direwolf-Anführer besiegt', 'Nächstes Ziel: Sprich mit Ranga'],
    tone: 'battle',
    eligible: (save) => save.flags['story.direwolf.defeated'] === true
  },
  {
    id: 'ranga-joins',
    kicker: 'Neue Bindung',
    title: 'Ranga schließt den Pakt',
    body: 'Ranga erkennt Rimuru als Gefährten an. Sein Geruchssinn, seine Geschwindigkeit und das Rudel öffnen neue Wege.',
    highlights: ['Aktives Partymitglied: Ranga', 'Scout- und Schnellreise vorbereitet'],
    tone: 'bond',
    eligible: (save) => hasMember(save, 'ranga') && save.flags['story.direwolf.pact'] === true
  },
  {
    id: 'band-one-complete',
    kicker: 'Band 1 abgeschlossen',
    title: 'Tempest erhält seinen Namen',
    body: 'Aus einem bedrohten Goblindorf wird der erste Kern einer gemeinsamen Stadt. Der neue Name trägt nun Verantwortung.',
    highlights: ['Tempest gegründet', 'Band 2 beginnt: Der erste Rat'],
    tone: 'chapter',
    eligible: (save) => save.flags['story.slime-prologue.completed'] === true
  },
  {
    id: 'first-council',
    kicker: 'Tempest wächst',
    title: 'Der erste Rat steht',
    body: 'Rigurd, Shuna, Gobta und Ranga verbinden Versorgung, Ritualwissen und Grenzschutz zu einem gemeinsamen Plan.',
    highlights: ['Flüsterhain freigeschaltet', 'Status-, Schwächen- und Teamleiste relevant'],
    tone: 'chapter',
    eligible: (save) => save.flags['story.council.ready'] === true
  },
  {
    id: 'nameless-echo-defeated',
    kicker: 'Boss bezwungen',
    title: 'Das namenlose Echo ist gebrochen',
    body: 'Das Siegel schweigt wieder. Tempest hat bewiesen, dass seine Bindung mehr ist als ein Name oder ein altes Ritual.',
    highlights: ['Ahnensiegel gesichert', 'Nächstes Ziel: Berichte Rigurd'],
    tone: 'battle',
    eligible: (save) => save.flags['story.boss.echo-defeated'] === true
  },
  {
    id: 'band-two-complete',
    kicker: 'Band 2 abgeschlossen',
    title: 'Tempest steht zusammen',
    body: 'Rat, Scoutpfade, Flüsterhain und Ahnensiegel sind gesichert. Die junge Stadt kann ihren Blick nun auf die Grenze richten.',
    highlights: ['Tempest-Talisman erhalten', 'Grenzfeuer bleibt eine freiwillige Überleitung'],
    tone: 'chapter',
    eligible: (save) =>
      save.flags['story.act1.completed'] === true
      || save.quests['binding-of-ancestors']?.status === 'completed'
  }
] as const;

export function getPendingMilestone(save: MilestoneSave): StoryMilestone | null {
  for (let index = MILESTONES.length - 1; index >= 0; index -= 1) {
    const milestone = MILESTONES[index]!;
    if (milestone.eligible(save) && save.flags[milestoneFlag(milestone.id)] !== true) {
      return toView(milestone);
    }
  }
  return null;
}

export function acknowledgeMilestone(
  flags: Readonly<Record<string, boolean>>,
  milestoneId: string
): Readonly<Record<string, boolean>> {
  const index = MILESTONES.findIndex((milestone) => milestone.id === milestoneId);
  if (index < 0) return flags;

  const next = { ...flags };
  for (let current = 0; current <= index; current += 1) {
    next[milestoneFlag(MILESTONES[current]!.id)] = true;
  }
  return next;
}

export function getMilestoneById(id: string): StoryMilestone | null {
  const milestone = MILESTONES.find((candidate) => candidate.id === id);
  return milestone ? toView(milestone) : null;
}

function milestoneFlag(id: string): string {
  return `milestone.${id}.shown`;
}

function hasMember(save: MilestoneSave, characterId: string): boolean {
  return [...save.party.active, ...save.party.reserve]
    .some((member) => member.characterId === characterId);
}

function toView(definition: MilestoneDefinition): StoryMilestone {
  const { eligible: _eligible, ...view } = definition;
  return view;
}
