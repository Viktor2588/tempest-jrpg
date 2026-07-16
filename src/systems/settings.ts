// Spieleinstellungen (Phaser-/DOM-frei, headless testbar). Persistiert in einem
// eigenen localStorage-Schlüssel — getrennt vom Spielstand (save.ts), damit
// Optionen unabhängig vom Save-Schema bleiben.

export type Difficulty = 'leicht' | 'normal' | 'schwer';
export type TextSpeed = 'langsam' | 'normal' | 'schnell' | 'sofort';
export type BattleSpeed = 'normal' | 'schnell';
export type Colorblind = 'aus' | 'protan' | 'deutan' | 'tritan';

export const DIFFICULTIES: readonly Difficulty[] = ['leicht', 'normal', 'schwer'];
export const TEXT_SPEEDS: readonly TextSpeed[] = ['langsam', 'normal', 'schnell', 'sofort'];
export const BATTLE_SPEEDS: readonly BattleSpeed[] = ['normal', 'schnell'];
export const COLORBLIND_MODES: readonly Colorblind[] = ['aus', 'protan', 'deutan', 'tritan'];

export interface GameSettings {
  masterVolume: number; // 0..1
  musicVolume: number;  // 0..1
  sfxVolume: number;    // 0..1
  reducedMotion: boolean;
  seenTutorial: boolean;
  // Zugänglichkeit (Phase 14)
  difficulty: Difficulty;
  textSpeed: TextSpeed;
  battleSpeed: BattleSpeed;
  highContrast: boolean;
  colorblind: Colorblind;
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
  seenTutorial: false,
  difficulty: 'normal',
  textSpeed: 'normal',
  battleSpeed: 'normal',
  highContrast: false,
  colorblind: 'aus'
};

function clamp01(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}
function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return (typeof value === 'string' && (allowed as readonly string[]).includes(value)) ? (value as T) : fallback;
}

/** Säubert beliebige (auch alte/teilweise) Eingaben zu gültigen Einstellungen. */
export function normalizeSettings(raw: unknown): GameSettings {
  const r = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {};
  return {
    masterVolume: clamp01(r.masterVolume, DEFAULT_SETTINGS.masterVolume),
    musicVolume: clamp01(r.musicVolume, DEFAULT_SETTINGS.musicVolume),
    sfxVolume: clamp01(r.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    reducedMotion: asBool(r.reducedMotion, DEFAULT_SETTINGS.reducedMotion),
    seenTutorial: asBool(r.seenTutorial, DEFAULT_SETTINGS.seenTutorial),
    difficulty: asEnum(r.difficulty, DIFFICULTIES, DEFAULT_SETTINGS.difficulty),
    textSpeed: asEnum(r.textSpeed, TEXT_SPEEDS, DEFAULT_SETTINGS.textSpeed),
    battleSpeed: asEnum(r.battleSpeed, BATTLE_SPEEDS, DEFAULT_SETTINGS.battleSpeed),
    highContrast: asBool(r.highContrast, DEFAULT_SETTINGS.highContrast),
    colorblind: asEnum(r.colorblind, COLORBLIND_MODES, DEFAULT_SETTINGS.colorblind)
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

// ---- Zugänglichkeit: abgeleitete Werte für andere Systeme/Szenen ----

/** Verzögerung pro Zeichen für den Dialog-Schreibmaschineneffekt (ms). 0 = sofort. */
export function textCharDelayMs(s: GameSettings): number {
  return { langsam: 45, normal: 24, schnell: 12, sofort: 0 }[s.textSpeed];
}

/** Zugpause im Kampf; Animationen und Kampfwerte bleiben unverändert. */
export function battleTurnDelayMs(s: Pick<GameSettings, 'battleSpeed'>, normalMs: number): number {
  return s.battleSpeed === 'schnell' ? Math.round(normalMs * 0.35) : normalMs;
}

/** Schadensmultiplikator gegen den Spieler je Schwierigkeit (für die Kampf-Engine). */
export function enemyDamageMultiplier(s: GameSettings): number {
  return { leicht: 0.7, normal: 1, schwer: 1.4 }[s.difficulty];
}

/** Schadensmultiplikator der Party je Schwierigkeit (für die Kampf-Engine). */
export function playerDamageMultiplier(s: GameSettings): number {
  return { leicht: 1.25, normal: 1, schwer: 0.9 }[s.difficulty];
}
