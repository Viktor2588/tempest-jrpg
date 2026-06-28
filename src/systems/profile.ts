import type { StorageLike } from './save';

// Spieler-Profil: überlebt einzelne Spielstände (eigener localStorage-Key) und
// hält fortschrittsübergreifende Daten — welche Enden gesehen wurden und wie oft
// New Game+ gestartet wurde. Bewusst vom Save-Schema entkoppelt, damit Enden-
// Galerie und NG+-Zähler ohne Migration/Roundtrip-Risiko persistent bleiben.
export interface PlayerProfile {
  readonly endingsSeen: readonly string[];
  readonly newGamePlusCount: number;
}

export const PROFILE_STORAGE_KEY = 'tempest-chronik.profile.v1';
export const EMPTY_PROFILE: PlayerProfile = { endingsSeen: [], newGamePlusCount: 0 };

export function loadProfile(storage: StorageLike, key = PROFILE_STORAGE_KEY): PlayerProfile {
  const raw = storage.getItem(key);
  if (raw === null) return EMPTY_PROFILE;
  try {
    return normalizeProfile(JSON.parse(raw) as unknown);
  } catch {
    return EMPTY_PROFILE; // beschädigtes Profil → leerer Neustart statt Absturz
  }
}

export function saveProfile(storage: StorageLike, profile: PlayerProfile, key = PROFILE_STORAGE_KEY): PlayerProfile {
  const normalized = normalizeProfile(profile);
  storage.setItem(key, JSON.stringify(normalized));
  return normalized;
}

/** Markiert ein Ende als gesehen (idempotent). */
export function recordEndingSeen(profile: PlayerProfile, kind: string): PlayerProfile {
  if (profile.endingsSeen.includes(kind)) return profile;
  return { ...profile, endingsSeen: [...profile.endingsSeen, kind] };
}

export function incrementNewGamePlus(profile: PlayerProfile): PlayerProfile {
  return { ...profile, newGamePlusCount: profile.newGamePlusCount + 1 };
}

function normalizeProfile(raw: unknown): PlayerProfile {
  if (typeof raw !== 'object' || raw === null) return EMPTY_PROFILE;
  const record = raw as Record<string, unknown>;
  const endingsSeen = Array.isArray(record.endingsSeen)
    ? [...new Set(record.endingsSeen.filter((value): value is string => typeof value === 'string'))]
    : [];
  const count = typeof record.newGamePlusCount === 'number' && Number.isFinite(record.newGamePlusCount)
    ? Math.max(0, Math.trunc(record.newGamePlusCount))
    : 0;
  return { endingsSeen, newGamePlusCount: count };
}
