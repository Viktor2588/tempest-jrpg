import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SETTINGS, SETTINGS_KEY, normalizeSettings, loadSettings, saveSettings,
  effectiveSfxVolume, effectiveMusicVolume,
  textCharDelayMs, enemyDamageMultiplier, playerDamageMultiplier, type SettingsStorage
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

  it('Zugänglichkeits-Defaults und Enum-Validierung', () => {
    expect(DEFAULT_SETTINGS.difficulty).toBe('normal');
    expect(DEFAULT_SETTINGS.textSpeed).toBe('normal');
    expect(DEFAULT_SETTINGS.colorblind).toBe('aus');
    // ungültige Enum-Werte fallen auf Default zurück
    const n = normalizeSettings({ difficulty: 'unmöglich', textSpeed: 5, colorblind: 'x', highContrast: 1 });
    expect(n.difficulty).toBe('normal');
    expect(n.textSpeed).toBe('normal');
    expect(n.colorblind).toBe('aus');
    expect(n.highContrast).toBe(false);
    // gültige Werte bleiben erhalten
    const ok = normalizeSettings({ difficulty: 'schwer', textSpeed: 'sofort', colorblind: 'deutan', highContrast: true });
    expect(ok).toMatchObject({ difficulty: 'schwer', textSpeed: 'sofort', colorblind: 'deutan', highContrast: true });
  });

  it('abgeleitete Zugänglichkeitswerte', () => {
    expect(textCharDelayMs({ ...DEFAULT_SETTINGS, textSpeed: 'sofort' })).toBe(0);
    expect(textCharDelayMs({ ...DEFAULT_SETTINGS, textSpeed: 'langsam' })).toBeGreaterThan(textCharDelayMs({ ...DEFAULT_SETTINGS, textSpeed: 'schnell' }));
    expect(enemyDamageMultiplier({ ...DEFAULT_SETTINGS, difficulty: 'leicht' })).toBeLessThan(1);
    expect(enemyDamageMultiplier({ ...DEFAULT_SETTINGS, difficulty: 'schwer' })).toBeGreaterThan(1);
    expect(playerDamageMultiplier({ ...DEFAULT_SETTINGS, difficulty: 'leicht' })).toBeGreaterThan(1);
  });
});
