import { describe, expect, it } from 'vitest';
import {
  STEPS_PER_PHASE,
  clockAt,
  clockHudLabel,
  dayAt,
  openingFieldElement,
  openingStatuses,
  timeOfDayAt,
  weatherAt,
  type WorldClock
} from '../src/systems/worldClock';
import { startBattle, type BattleUnitInput } from '../src/systems/battle';

// Phase 101 — Welt-Uhr: deterministischer Tages-/Wetterzyklus + Kampf-Feld-Einfluss.

function dummy(side: 'party' | 'enemy'): BattleUnitInput {
  return {
    sourceId: `${side}-unit`,
    name: side,
    side,
    level: 5,
    // Hohe Agilität → im ersten Zug handlungsbereit, bevor das Feld abklingt (tickField
    // läuft erst, wenn niemand die CT-Schwelle erreicht). So bleibt das Eröffnungsfeld messbar.
    stats: { maxHp: 200, maxMp: 50, attack: 20, defense: 20, magic: 20, spirit: 20, agility: 400 },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: []
  };
}

describe('Welt-Uhr: deterministischer Zyklus', () => {
  it('gleiche Eingaben liefern immer denselben Zustand', () => {
    const a = clockAt(123, 7);
    const b = clockAt(123, 7);
    expect(a).toEqual(b);
  });

  it('durchläuft die vier Tagesabschnitte in fester Reihenfolge', () => {
    expect(timeOfDayAt(0)).toBe('morning');
    expect(timeOfDayAt(STEPS_PER_PHASE)).toBe('day');
    expect(timeOfDayAt(STEPS_PER_PHASE * 2)).toBe('dusk');
    expect(timeOfDayAt(STEPS_PER_PHASE * 3)).toBe('night');
    // Nach einem vollen Tag zurück auf Morgen.
    expect(timeOfDayAt(STEPS_PER_PHASE * 4)).toBe('morning');
  });

  it('zählt Tage hoch und behält denselben Abschnitt über Tage hinweg', () => {
    expect(dayAt(0)).toBe(0);
    expect(dayAt(STEPS_PER_PHASE * 4 - 1)).toBe(0);
    expect(dayAt(STEPS_PER_PHASE * 4)).toBe(1);
    expect(timeOfDayAt(0)).toBe(timeOfDayAt(STEPS_PER_PHASE * 4));
  });

  it('Wetter ist innerhalb eines Tages stabil und kann über Tage wechseln', () => {
    const seed = 42;
    const dayZero = new Set<string>();
    for (let step = 0; step < STEPS_PER_PHASE * 4; step += 1) {
      dayZero.add(weatherAt(step, seed));
    }
    expect(dayZero.size).toBe(1); // ein Wetter pro Tag

    const perDay = new Set<string>();
    for (let day = 0; day < 40; day += 1) {
      perDay.add(weatherAt(day * STEPS_PER_PHASE * 4, seed));
    }
    // Über viele Tage tauchen mehrere Wetterlagen auf (nicht konstant).
    expect(perDay.size).toBeGreaterThan(1);
  });

  it('unterschiedliche Seeds können unterschiedliches Wetter ergeben', () => {
    const seeds = new Set<string>();
    for (let seed = 0; seed < 20; seed += 1) {
      seeds.add(weatherAt(0, seed));
    }
    expect(seeds.size).toBeGreaterThan(1);
  });

  it('negative/ungültige Schritte klemmen auf den Startzustand', () => {
    expect(timeOfDayAt(-5)).toBe('morning');
    expect(dayAt(-5)).toBe(0);
    expect(timeOfDayAt(Number.NaN)).toBe('morning');
  });
});

describe('Welt-Uhr: Feld-/Encounter-Einfluss', () => {
  const clock = (partial: Partial<WorldClock>): WorldClock => ({
    day: 0,
    timeOfDay: 'day',
    weather: 'clear',
    ...partial
  });

  it('Regen lädt das Eröffnungsfeld auf Wasser', () => {
    expect(openingFieldElement(clock({ weather: 'rain' }))).toBe('water');
  });

  it('Nacht lädt das Eröffnungsfeld auf Schatten', () => {
    expect(openingFieldElement(clock({ timeOfDay: 'night' }))).toBe('shadow');
  });

  it('Regen hat Vorrang vor der Nacht', () => {
    expect(openingFieldElement(clock({ weather: 'rain', timeOfDay: 'night' }))).toBe('water');
  });

  it('klarer Tag lässt das Feld neutral (null)', () => {
    expect(openingFieldElement(clock({ weather: 'clear', timeOfDay: 'day' }))).toBeNull();
  });

  it('ein Encounter unter Regen startet in einem Wasserfeld', () => {
    const state = startBattle({
      party: [dummy('party')],
      enemies: [dummy('enemy')],
      openingField: openingFieldElement(clock({ weather: 'rain' })),
      seed: 1
    });
    expect(state.field).not.toBeNull();
    expect(state.field?.element).toBe('water');
  });

  it('ein klarer Tags-Encounter startet ohne Feld', () => {
    const state = startBattle({
      party: [dummy('party')],
      enemies: [dummy('enemy')],
      openingField: openingFieldElement(clock({})),
      seed: 1
    });
    expect(state.field).toBeNull();
  });
});

describe('Welt-Uhr: Nebel-Eröffnung (Phase 171)', () => {
  const clock = (partial: Partial<WorldClock>): WorldClock => ({
    day: 0,
    timeOfDay: 'day',
    weather: 'clear',
    ...partial
  });

  it('Nebel liefert ein symmetrisches Eröffnungs-Blind', () => {
    const openings = openingStatuses(clock({ weather: 'fog' }));
    expect(openings).toHaveLength(1);
    expect(openings[0]).toEqual({ id: 'blind', turns: 2 });
  });

  it('klar/Regen liefern keinen Eröffnungs-Status', () => {
    expect(openingStatuses(clock({ weather: 'clear' }))).toHaveLength(0);
    expect(openingStatuses(clock({ weather: 'rain' }))).toHaveLength(0);
    // Auch nachts ohne Nebel kein Eröffnungs-Status (Nacht färbt nur das Feld).
    expect(openingStatuses(clock({ weather: 'clear', timeOfDay: 'night' }))).toHaveLength(0);
  });

  it('startBattle wendet den Nebel-Blind auf BEIDE Seiten an', () => {
    const state = startBattle({
      party: [dummy('party')],
      enemies: [dummy('enemy')],
      openingStatuses: openingStatuses(clock({ weather: 'fog' })),
      seed: 1
    });
    for (const combatant of state.combatants) {
      expect(combatant.statuses.some((status) => status.id === 'blind')).toBe(true);
    }
    expect(state.log.some((line) => line.includes('Schlachtfeld'))).toBe(true);
  });

  it('ohne Eröffnungs-Status bleibt niemand geblendet', () => {
    const state = startBattle({
      party: [dummy('party')],
      enemies: [dummy('enemy')],
      openingStatuses: openingStatuses(clock({ weather: 'clear' })),
      seed: 1
    });
    for (const combatant of state.combatants) {
      expect(combatant.statuses.some((status) => status.id === 'blind')).toBe(false);
    }
  });
});

describe('Welt-Uhr: HUD-Beschriftung', () => {
  it('nennt Tageszeit und Wetter', () => {
    const label = clockHudLabel({ day: 0, timeOfDay: 'night', weather: 'rain' });
    expect(label).toContain('Nacht');
    expect(label).toContain('Regen');
  });
});
