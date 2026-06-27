// Spieleinstellungen (Phaser-/DOM-frei, headless testbar). Persistiert in einem
// eigenen localStorage-Schlüssel — getrennt vom Spielstand (save.ts), damit
// Optionen unabhängig vom Save-Schema bleiben.

export interface GameSettings {
  masterVolume: number; // 0..1
  musicVolume: number;  // 0..1
  sfxVolume: number;    // 0..1
  reducedMotion: boolean;
  seenTutorial: boolean;
}

export interface SettingsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SETTINGS_KEY = 'tempest-settings-v1';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.9,
  reducedMotion: false,
  seenTutorial: false
};

function clamp01(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}
function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Säubert beliebige (auch alte/teilweise) Eingaben zu gültigen Einstellungen. */
export function normalizeSettings(raw: unknown): GameSettings {
  const r = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {};
  return {
    masterVolume: clamp01(r.masterVolume, DEFAULT_SETTINGS.masterVolume),
    musicVolume: clamp01(r.musicVolume, DEFAULT_SETTINGS.musicVolume),
    sfxVolume: clamp01(r.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    reducedMotion: asBool(r.reducedMotion, DEFAULT_SETTINGS.reducedMotion),
    seenTutorial: asBool(r.seenTutorial, DEFAULT_SETTINGS.seenTutorial)
  };
}

export function loadSettings(storage: SettingsStorage): GameSettings {
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(storage: SettingsStorage, settings: GameSettings): void {
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
  } catch {
    /* Quota/Private-Mode: still kein harter Fehler */
  }
}

/** Effektive Lautstärken (Master × Kanal) für die Audio-Ausgabe. */
export function effectiveSfxVolume(s: GameSettings): number {
  return clamp01(s.masterVolume * s.sfxVolume, 0);
}
export function effectiveMusicVolume(s: GameSettings): number {
  return clamp01(s.masterVolume * s.musicVolume, 0);
}
