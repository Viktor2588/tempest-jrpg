import { describe, expect, it } from 'vitest';
import {
  EMPTY_PROFILE,
  incrementNewGamePlus,
  loadProfile,
  PROFILE_STORAGE_KEY,
  recordEndingSeen,
  saveProfile
} from '../src/systems/profile';
import type { StorageLike } from '../src/systems/save';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('profile.ts', () => {
  it('liefert ein leeres Profil ohne gespeicherte Daten', () => {
    expect(loadProfile(new MemoryStorage())).toEqual(EMPTY_PROFILE);
  });

  it('nimmt Enden idempotent auf und persistiert sie über einen Roundtrip', () => {
    const storage = new MemoryStorage();
    let profile = recordEndingSeen(EMPTY_PROFILE, 'true');
    profile = recordEndingSeen(profile, 'true'); // doppelt → keine Duplikate
    profile = recordEndingSeen(profile, 'freedom');
    saveProfile(storage, profile);

    const loaded = loadProfile(storage);
    expect(loaded.endingsSeen).toEqual(['true', 'freedom']);
  });

  it('zählt New Game+ hoch', () => {
    expect(incrementNewGamePlus(incrementNewGamePlus(EMPTY_PROFILE)).newGamePlusCount).toBe(2);
  });

  it('fällt bei beschädigtem Profil-JSON auf ein leeres Profil zurück', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROFILE_STORAGE_KEY, '{ kaputt');
    expect(loadProfile(storage)).toEqual(EMPTY_PROFILE);
  });
});
