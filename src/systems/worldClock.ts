import type { ElementType, StatusEffectId } from '../data/types';

// Phase 101 — Welt-Uhr (Zeit/Wetter): eine rein deterministische Tag/Nacht- und
// Wetter-Uhr, abgeleitet aus einem fortlaufenden Schrittzähler (`clockStep`) und
// dem Welt-Seed. Kein Phaser/DOM → vollständig headless testbar (analog worldClock-
// Nachbarn wie systems/overworld). Die Uhr beeinflusst zunächst genau eine Sache mit
// Kampf-Konsequenz: das Eröffnungs-Elementarfeld (Phase 94) eines Encounters —
// Regen lädt das Feld auf Wasser, Nacht auf Schatten. Bewusst kleiner Zuschnitt
// (einfachste Lösung, die trägt): eine Uhr, zwei Einfluss-Quellen, keine neuen Assets.

export type TimeOfDay = 'morning' | 'day' | 'dusk' | 'night';
export type Weather = 'clear' | 'rain' | 'fog';

export interface WorldClock {
  // Wie viele volle Tage seit Spielbeginn vergangen sind (0-basiert).
  readonly day: number;
  readonly timeOfDay: TimeOfDay;
  readonly weather: Weather;
}

// Ein Tag = vier Tagesabschnitte à STEPS_PER_PHASE Schritten. Klein genug, dass ein
// normaler Erkundungslauf sichtbar durch die Abschnitte wandert.
export const STEPS_PER_PHASE = 8;
const PHASE_ORDER: readonly TimeOfDay[] = ['morning', 'day', 'dusk', 'night'];
const STEPS_PER_DAY = STEPS_PER_PHASE * PHASE_ORDER.length;

// Wetter ist pro Tag stabil und wechselt deterministisch von Tag zu Tag. Klar ist am
// häufigsten (3/5), Regen und Nebel selten (je 1/5) — Wetter-Effekte bleiben besonder.
const WEATHER_TABLE: readonly Weather[] = ['clear', 'clear', 'clear', 'rain', 'fog'];

function normalizeStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 0;
  return Math.floor(step);
}

// Kleiner, stabiler 32-Bit-Hash aus Seed + Tag → deterministische Wetterwahl.
function weatherHash(seed: number, day: number): number {
  const s = normalizeStep(seed) >>> 0;
  let h = (s ^ 0x9e3779b1) >>> 0;
  h = (Math.imul(h, 2654435761) ^ Math.imul(day + 1, 40503)) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  return h >>> 0;
}

export function timeOfDayAt(step: number): TimeOfDay {
  const s = normalizeStep(step);
  const phase = Math.floor(s / STEPS_PER_PHASE) % PHASE_ORDER.length;
  return PHASE_ORDER[phase]!;
}

export function dayAt(step: number): number {
  return Math.floor(normalizeStep(step) / STEPS_PER_DAY);
}

export function weatherAt(step: number, seed: number): Weather {
  const day = dayAt(step);
  return WEATHER_TABLE[weatherHash(seed, day) % WEATHER_TABLE.length]!;
}

export function clockAt(step: number, seed: number): WorldClock {
  return {
    day: dayAt(step),
    timeOfDay: timeOfDayAt(step),
    weather: weatherAt(step, seed)
  };
}

// Das Eröffnungs-Elementarfeld (Phase 94) eines Encounters unter dieser Uhr.
// Wetter hat Vorrang (Regen→Wasser), sonst färbt die Tageszeit das Feld.
// Phase 206 — die letzten toten Tagesviertel wecken: Abenddämmerung→Feuer
// (die Abendglut/untergehende Sonne entzündet das Feld), Morgen→Heilig (das
// erste Licht heiligt das Feld). Der klare Mittag (`day`) bleibt bewusst
// neutral (Baseline-Viertel). Damit tragen morning/dusk/night je ein eigenes
// Eröffnungselement — 3 von 4 Vierteln sind im Kampf unterscheidbar.
// null = neutrales Startfeld (keine Kampf-Änderung).
export function openingFieldElement(clock: WorldClock): ElementType | null {
  if (clock.weather === 'rain') return 'water';
  switch (clock.timeOfDay) {
    case 'night':
      return 'shadow';
    case 'dusk':
      return 'fire';
    case 'morning':
      return 'holy';
    default:
      return null; // Tag/klar: neutrales Startfeld
  }
}

// Phase 171 — Nebel verhuellt das Schlachtfeld: weckt den bis dahin toten `fog`-
// Wetterzustand. Ein Eroeffnungs-Status wird beim Kampfstart SYMMETRISCH auf ALLE
// Kaempfer (Party + Gegner) angewandt — Nebel truebt beiden Seiten die Sicht, im
// Nebel trifft niemand sicher. Klar/Regen liefern keinen Eroeffnungs-Status (leer).
// Reine Daten; die Anwendung liegt in systems/battle (startBattle).
export interface OpeningStatus {
  readonly id: StatusEffectId;
  readonly turns: number;
}

export function openingStatuses(clock: WorldClock): readonly OpeningStatus[] {
  if (clock.weather === 'fog') return [{ id: 'blind', turns: 2 }];
  return [];
}

// Phase 178 — Nebelsicht (proaktive Vorsorge): ein geladener Nebel-Ward (Klarsichttropfen,
// Flag `FOG_WARD_FLAG`) unterdrueckt die Nebel-Eroeffnungsblendung des naechsten Kampfes und
// wird dabei EINMALIG verbraucht. Ohne Nebel bleibt der Ward geladen (kein Verbrauch ohne
// Wirkung); ohne Ward-Flag verhaelt sich das Feld exakt wie `openingStatuses`. Rein/funktional.
export const FOG_WARD_FLAG = 'worldclock.fogward';

export interface WardedOpening {
  readonly statuses: readonly OpeningStatus[];
  readonly wardConsumed: boolean;
}

export function openingStatusesWarded(
  clock: WorldClock,
  flags: Readonly<Record<string, boolean>> | undefined
): WardedOpening {
  const statuses = openingStatuses(clock);
  const foggy = statuses.some((status) => status.id === 'blind');
  if (foggy && flags?.[FOG_WARD_FLAG]) {
    return { statuses: statuses.filter((status) => status.id !== 'blind'), wardConsumed: true };
  }
  return { statuses, wardConsumed: false };
}

// Phase 175 — Tag/Nacht faerbt die Oberwelt: ein rein kosmetischer Tint-Overlay je
// Tageszeit/Wetter (keine neuen Assets, kein Kampf-/Save-/Balance-Effekt). Wetter hat
// Vorrang (Nebel entsaettigt, Regen kuehlt); sonst faerbt die Tageszeit. `null` = kein
// Overlay (heller, klarer Tag).
export interface OverworldTint {
  readonly color: number;
  readonly alpha: number;
}

export function overworldTint(clock: WorldClock): OverworldTint | null {
  if (clock.weather === 'fog') return { color: 0x9098a4, alpha: 0.3 };
  if (clock.weather === 'rain') return { color: 0x2a3a52, alpha: 0.24 };
  switch (clock.timeOfDay) {
    case 'night':
      return { color: 0x0a1430, alpha: 0.42 };
    case 'dusk':
      return { color: 0x5a2a12, alpha: 0.24 };
    case 'morning':
      return { color: 0x2e2a48, alpha: 0.12 };
    default:
      return null; // Tag/klar: kein Overlay
  }
}

const TIME_LABELS: Readonly<Record<TimeOfDay, string>> = {
  morning: 'Morgen',
  day: 'Tag',
  dusk: 'Abenddämmerung',
  night: 'Nacht'
};

const TIME_GLYPHS: Readonly<Record<TimeOfDay, string>> = {
  morning: '☼',
  day: '☀',
  dusk: '☾',
  night: '☽'
};

const WEATHER_LABELS: Readonly<Record<Weather, string>> = {
  clear: 'Klar',
  rain: 'Regen',
  fog: 'Nebel'
};

export function timeOfDayLabel(timeOfDay: TimeOfDay): string {
  return TIME_LABELS[timeOfDay];
}

export function weatherLabel(weather: Weather): string {
  return WEATHER_LABELS[weather];
}

// Kompakte HUD-Zeile für die Oberwelt: "☾ Abenddämmerung · Regen".
export function clockHudLabel(clock: WorldClock): string {
  return `${TIME_GLYPHS[clock.timeOfDay]} ${TIME_LABELS[clock.timeOfDay]} · ${WEATHER_LABELS[clock.weather]}`;
}
