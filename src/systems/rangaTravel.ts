import { LOCATIONS, type WorldRequirement } from '../data/world';
import type { SaveLocation } from './save';
import type { WorldState } from './world';

export type RangaTravelStatus = 'available' | 'current' | 'locked' | 'unknown' | 'unsafe';
export type RangaDangerLevel = 'safe' | 'watch' | 'danger';

export interface RangaTravelDestinationView {
  readonly id: string;
  readonly locationId: string;
  readonly name: string;
  readonly description: string;
  readonly mapId: string;
  readonly x: number;
  readonly y: number;
  readonly dangerLevel: RangaDangerLevel;
  readonly dangerLabel: string;
  readonly status: RangaTravelStatus;
  readonly reason: string;
}

export interface RangaScoutReportView {
  readonly title: string;
  readonly body: string;
  readonly targetLocationId: string | null;
  readonly warning: string | null;
}

export interface RangaTravelView {
  readonly enabled: boolean;
  readonly scout: RangaScoutReportView;
  readonly destinations: readonly RangaTravelDestinationView[];
}

export interface RangaTravelResult {
  readonly ok: boolean;
  readonly location: SaveLocation | null;
  readonly message: string;
}

interface RangaTravelPointDefinition {
  readonly id: string;
  readonly locationId: string;
  readonly arrival: SaveLocation;
  readonly dangerLevel: RangaDangerLevel;
  readonly unlockRequirements?: readonly WorldRequirement[];
  readonly safeRequirements?: readonly WorldRequirement[];
}

const RANGA_TRAVEL_POINTS: readonly RangaTravelPointDefinition[] = [
  {
    id: 'sealed-cave',
    locationId: 'sealed-cave',
    arrival: { mapId: 'sealed-cave', x: 7, y: 6, facing: 'up' },
    dangerLevel: 'safe'
  },
  {
    id: 'goblin-village',
    locationId: 'goblin-village',
    arrival: { mapId: 'goblin-village', x: 8, y: 6, facing: 'down' },
    dangerLevel: 'safe',
    unlockRequirements: [{ flag: 'story.storm-dragon.oath' }]
  },
  {
    id: 'direwolf-den',
    locationId: 'direwolf-den',
    arrival: { mapId: 'direwolf-den', x: 2, y: 6, facing: 'right' },
    dangerLevel: 'watch',
    unlockRequirements: [{ flag: 'story.direwolf.pact' }]
  },
  {
    id: 'tempest-hollow',
    locationId: 'tempest-hollow',
    arrival: { mapId: 'tempest-start', x: 3, y: 5, facing: 'down' },
    dangerLevel: 'safe',
    unlockRequirements: [{ flag: 'story.slime-prologue.completed' }]
  },
  {
    id: 'spirit-marsh',
    locationId: 'gate-to-tempest',
    arrival: { mapId: 'spirit-marsh', x: 2, y: 2, facing: 'right' },
    dangerLevel: 'danger',
    unlockRequirements: [{ flag: 'story.act2.completed' }],
    safeRequirements: [{ flag: 'marsh.guardian.cleared' }]
  },
  {
    id: 'spirit-highlands',
    locationId: 'gate-to-marsh-back',
    arrival: { mapId: 'spirit-highlands', x: 2, y: 7, facing: 'right' },
    dangerLevel: 'danger',
    unlockRequirements: [{ flag: 'story.act2.completed' }],
    safeRequirements: [{ flag: 'highlands.guardian.cleared' }]
  }
] as const;

const locationById: ReadonlyMap<string, (typeof LOCATIONS)[number]> = new Map(
  LOCATIONS.map((location) => [location.id, location])
);

export function rangaTravelFlag(pointId: string): string {
  return `travel.ranga.discovered.${pointId}`;
}

export function hasRangaTravelAccess(state: WorldState): boolean {
  return state.flags['story.direwolf.pact'] === true || (state.roster ?? []).includes('ranga');
}

export function discoverRangaTravelFlags(
  state: WorldState,
  current: Pick<SaveLocation, 'mapId'>
): Readonly<Record<string, boolean>> {
  let nextFlags: Record<string, boolean> | null = null;
  for (const point of RANGA_TRAVEL_POINTS) {
    if (point.arrival.mapId !== current.mapId) continue;
    if (!requirementsMet(state, point.unlockRequirements ?? [])) continue;
    const flag = rangaTravelFlag(point.id);
    if ((nextFlags ?? state.flags)[flag]) continue;
    nextFlags = nextFlags ?? { ...state.flags };
    nextFlags[flag] = true;
  }
  return nextFlags ?? state.flags;
}

export function buildRangaTravelView(state: WorldState, current: SaveLocation): RangaTravelView {
  const enabled = hasRangaTravelAccess(state);
  return {
    enabled,
    scout: buildRangaScoutReport(state),
    destinations: RANGA_TRAVEL_POINTS.map((point) => buildDestinationView(state, current, point, enabled))
  };
}

export function resolveRangaTravel(
  state: WorldState,
  current: SaveLocation,
  destinationId: string
): RangaTravelResult {
  const destination = buildRangaTravelView(state, current).destinations.find((item) => item.id === destinationId);
  if (!destination) {
    return { ok: false, location: null, message: 'Ranga kennt dieses Ziel nicht.' };
  }
  if (destination.status !== 'available') {
    return { ok: false, location: null, message: destination.reason };
  }
  return {
    ok: true,
    location: {
      mapId: destination.mapId,
      x: destination.x,
      y: destination.y,
      facing: 'down'
    },
    message: `Ranga bringt dich nach ${destination.name}.`
  };
}

function buildDestinationView(
  state: WorldState,
  current: SaveLocation,
  point: RangaTravelPointDefinition,
  enabled: boolean
): RangaTravelDestinationView {
  const location = locationById.get(point.locationId);
  const unlocked = requirementsMet(state, point.unlockRequirements ?? []);
  const safe = requirementsMet(state, point.safeRequirements ?? []);
  const discovered = state.flags[rangaTravelFlag(point.id)] === true;
  const currentMap = current.mapId === point.arrival.mapId;
  const status: RangaTravelStatus = !enabled
    ? 'locked'
    : !unlocked
      ? 'locked'
      : !discovered
        ? 'unknown'
        : !safe
          ? 'unsafe'
          : currentMap
            ? 'current'
            : 'available';
  return {
    id: point.id,
    locationId: point.locationId,
    name: location?.name ?? point.id,
    description: location?.description ?? 'Rangas Route ist noch nicht kartiert.',
    mapId: point.arrival.mapId,
    x: point.arrival.x,
    y: point.arrival.y,
    dangerLevel: point.dangerLevel,
    dangerLabel: dangerLabel(point.dangerLevel),
    status,
    reason: statusReason(status)
  };
}

function buildRangaScoutReport(state: WorldState): RangaScoutReportView {
  if (!hasRangaTravelAccess(state)) {
    return {
      title: 'Ranga noch nicht im Pakt',
      body: 'Schnellreise und Scoutberichte öffnen sich erst, wenn der Direwolf-Pakt geschlossen ist.',
      targetLocationId: null,
      warning: null
    };
  }

  const bindingStatus = state.quests['binding-of-ancestors']?.status ?? 'inactive';
  if (bindingStatus === 'active' && !state.flags['story.council.ready']) {
    return state.flags['story.ranga.ready']
      ? {
          title: 'Scoutziel: Flüsterhain',
          body: 'Ranga hat den Hainrand und die spätere Grenzroute markiert. Rigurd kann den Rat losschicken.',
          targetLocationId: 'whispering-grove',
          warning: state.flags['scout.ambush.whispering-grove']
            ? 'Möglicher Hinterhalt im Unterholz markiert.'
            : null
        }
      : {
          title: 'Scout wartet auf Gobtas Route',
          body: 'Erst Gobtas Grenzplan, dann Rangas Geruchsspur. So bleibt der Hain kein Blindflug.',
          targetLocationId: 'tempest-hollow',
          warning: null
        };
  }
  if (bindingStatus === 'active' && state.flags['story.council.ready'] && !state.flags['story.grove.cleared']) {
    return {
      title: 'Pflichtziel: Flüsterhain',
      body: 'Der Hain ist freigegeben, aber nicht sicher. Ranga zeigt den Weg; Schnellreise bleibt gesperrt.',
      targetLocationId: 'whispering-grove',
      warning: 'Trigger-Kampf am Hainrand wahrscheinlich.'
    };
  }
  if (bindingStatus === 'active' && state.flags['story.grove.cleared'] && !state.flags['story.boss.echo-defeated']) {
    return {
      title: 'Pflichtziel: Ahnensiegel',
      body: 'Die Spur führt vom Hain zum Schrein. Ranga hält Abstand: Das Siegel ist kein sicherer Reisepunkt.',
      targetLocationId: 'ancestor-seal',
      warning: 'Boss-Signatur am Schrein.'
    };
  }
  if (state.flags['story.act1.completed'] && (state.quests['border-escalation']?.status ?? 'inactive') === 'inactive') {
    return {
      title: 'Freiwilliger Hook: Grenzfeuer',
      body: 'Gobta kann die Grenzlage öffnen, wenn du den optionalen Folgearc starten willst.',
      targetLocationId: 'border-camp',
      warning: null
    };
  }
  return {
    title: 'Keine akute Spur',
    body: 'Ranga hält die sicheren Wege offen und wartet auf den nächsten Scoutauftrag.',
    targetLocationId: null,
    warning: null
  };
}

function requirementsMet(state: WorldState, requirements: readonly WorldRequirement[]): boolean {
  return requirements.every((requirement) => {
    if (requirement.flag && state.flags[requirement.flag] !== true) return false;
    if (requirement.notFlag && state.flags[requirement.notFlag] === true) return false;
    if (requirement.questStatus) {
      const current = state.quests[requirement.questStatus.questId]?.status ?? 'inactive';
      if (current !== requirement.questStatus.status) return false;
    }
    if (requirement.questStep) {
      const completed = state.quests[requirement.questStep.questId]?.completedStepIds ?? [];
      if (!completed.includes(requirement.questStep.stepId)) return false;
    }
    if (requirement.missingQuestStep) {
      const completed = state.quests[requirement.missingQuestStep.questId]?.completedStepIds ?? [];
      if (completed.includes(requirement.missingQuestStep.stepId)) return false;
    }
    return true;
  });
}

function dangerLabel(level: RangaDangerLevel): string {
  if (level === 'safe') return 'Sicher';
  if (level === 'watch') return 'Wachsam';
  return 'Gefährlich';
}

function statusReason(status: RangaTravelStatus): string {
  if (status === 'available') return 'Bereit für Rangas Schnellreise.';
  if (status === 'current') return 'Du bist bereits an dieser Route.';
  if (status === 'unknown') return 'Noch nicht real besucht; Ranga findet keinen sicheren Zielgeruch.';
  if (status === 'unsafe') return 'Route bekannt, aber aktuell nicht sicher genug für Schnellreise.';
  return 'Route ist noch nicht freigeschaltet.';
}
