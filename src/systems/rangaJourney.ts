import type { RangaTravelResult } from './rangaTravel';

export interface RangaJourneyDiscovery {
  readonly flag: string;
  readonly title: string;
  readonly body: string;
  readonly rewardItemId: string;
  readonly rewardLabel: string;
}

interface DiscoveryDefinition extends RangaJourneyDiscovery {
  readonly destinationId: string;
}

const DISCOVERIES: readonly DiscoveryDefinition[] = [
  {
    destinationId: 'goblin-village',
    flag: 'travel.ranga.discovery.herb-trail',
    title: 'Eine frische Kräuterspur',
    body: 'Ranga hält am Waldrand an. Zwischen den Wurzeln wächst eine unberührte Heilpflanze.',
    rewardItemId: 'healing-herb',
    rewardLabel: 'Heilkraut'
  },
  {
    destinationId: 'sealed-cave',
    flag: 'travel.ranga.discovery.storm-dew',
    title: 'Sturmtau am Höhlenpfad',
    body: 'Ein Tropfen verdichteter Magie hängt an einem Kristall nahe Veldoras Höhle.',
    rewardItemId: 'mana-drop',
    rewardLabel: 'Manatropfen'
  },
  {
    destinationId: 'tempest-hollow',
    flag: 'travel.ranga.discovery.lost-supplies',
    title: 'Verlorene Vorräte',
    body: 'Ranga wittert ein kleines Bündel, das von einem Tempest-Karren gefallen ist.',
    rewardItemId: 'healing-herb',
    rewardLabel: 'Heilkraut'
  }
] as const;

export function getRangaJourneyDiscovery(
  flags: Readonly<Record<string, boolean>>,
  destinationId: string
): RangaJourneyDiscovery | null {
  const discovery = DISCOVERIES.find((candidate) =>
    candidate.destinationId === destinationId && flags[candidate.flag] !== true
  );
  if (!discovery) return null;
  const { destinationId: _destinationId, ...view } = discovery;
  return view;
}

export function canPresentRangaJourney(
  result: RangaTravelResult
): result is RangaTravelResult & {
  readonly location: NonNullable<RangaTravelResult['location']>;
  readonly destinationId: string;
  readonly destinationName: string;
} {
  return result.ok
    && result.location !== null
    && typeof result.destinationId === 'string'
    && typeof result.destinationName === 'string';
}
