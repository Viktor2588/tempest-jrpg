import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SETTINGS, SETTINGS_KEY, normalizeSettings, loadSettings, saveSettings,
  effectiveSfxVolume, effectiveMusicVolume, type SettingsStorage
} from '../src/systems/settings';

function memStorage(initial?: Record<string, string>): SettingsStorage & { data: Record<string, string> } {
  const data: Record<string, string> = { ...(initial ?? {}) };
  return {
    data,
    getItem: (k) => (k in data ? data[k]! : null),
    setItem: (k, v) => { data[k] = v; }
  };
}

describe('settings', () => {
  it('liefert Defaults ohne gespeicherte Daten', () => {
    expect(loadSettings(memStorage())).toEqual(DEFAULT_SETTINGS);
  });

  it('Roundtrip: speichern → laden ergibt denselben Zustand', () => {
    const s = memStorage();
    const custom = { ...DEFAULT_SETTINGS, masterVolume: 0.5, sfxVolume: 0.25, reducedMotion: true, seenTutorial: true };
    saveSettings(s, custom);
    expect(loadSettings(s)).toEqual(custom);
    expect(s.data[SETTINGS_KEY]).toBeTruthy();
  });

  it('klemmt Lautstärken in [0,1] und ersetzt Müll durch Defaults', () => {
    const n = normalizeSettings({ masterVolume: 5, musicVolume: -3, sfxVolume: 'laut', reducedMotion: 'ja' });
    expect(n.masterVolume).toBe(1);
    expect(n.musicVolume).toBe(0);
    expect(n.sfxVolume).toBe(DEFAULT_SETTINGS.sfxVolume);
    expect(n.reducedMotion).toBe(DEFAULT_SETTINGS.reducedMotion);
  });

  it('migriert teilweise/kaputte gespeicherte Daten ohne Absturz', () => {
    expect(loadSettings(memStorage({ [SETTINGS_KEY]: '{ kaputt' }))).toEqual(DEFAULT_SETTINGS);
    const partial = loadSettings(memStorage({ [SETTINGS_KEY]: JSON.stringify({ masterVolume: 0.3 }) }));
    expect(partial.masterVolume).toBe(0.3);
    expect(partial.sfxVolume).toBe(DEFAULT_SETTINGS.sfxVolume);
  });

  it('effektive Lautstärke ist Master × Kanal', () => {
    const s = { ...DEFAULT_SETTINGS, masterVolume: 0.5, sfxVolume: 0.5, musicVolume: 1 };
    expect(effectiveSfxVolume(s)).toBeCloseTo(0.25);
    expect(effectiveMusicVolume(s)).toBeCloseTo(0.5);
  });
});
