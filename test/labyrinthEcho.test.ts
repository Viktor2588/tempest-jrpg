import { describe, expect, it } from 'vitest';
import {
  createLabyrinthBossEchoUnit,
  eligibleBossEchoIds,
  selectLabyrinthBossEcho,
  type LabyrinthEchoProgress
} from '../src/systems/labyrinth';
import { createProgressionState } from '../src/systems/progression';
import { createNewSave, exportSave, importSave } from '../src/systems/save';

const progress = (
  defeated: Record<string, number>,
  devoured: readonly string[] = []
): LabyrinthEchoProgress => ({
  defeatedEnemyCountsByEnemyId: defeated,
  devouredSourceIds: devoured
});

describe('Labyrinth Boss-Echos (Phase 148)', () => {
  it('wählt nur besiegte, verschlingbare, noch nicht verschlungene Bosse', () => {
    // ifrit (L14) + orc-disaster (L16) besiegt, ifrit bereits verschlungen.
    const p = progress({ ifrit: 1, 'orc-disaster': 2, 'forest-slime': 9 }, ['ifrit']);
    const ids = eligibleBossEchoIds(p);
    expect(ids).toContain('orc-disaster');
    expect(ids).not.toContain('ifrit'); // schon verschlungen
    expect(ids).not.toContain('forest-slime'); // kein Boss
    // Deterministische Auswahl: das wertvollste (höchstes Basislevel) Echo.
    expect(selectLabyrinthBossEcho(p)).toBe('orc-disaster');
  });

  it('schließt nicht-verschlingbare Bosse und unbesiegte Arten aus', () => {
    // milim ist Boss, aber devourable: false → nie echo-fähig.
    expect(eligibleBossEchoIds(progress({ milim: 3 }))).toEqual([]);
    // nichts besiegt → kein Echo.
    expect(selectLabyrinthBossEcho(progress({}))).toBeNull();
    // alle in Frage kommenden bereits verschlungen → kein Echo.
    expect(selectLabyrinthBossEcho(progress({ ifrit: 1 }, ['ifrit']))).toBeNull();
  });

  it('baut ein skaliertes, verschlingbares Echo als Kampfeinheit (Party-relativ)', () => {
    const low = createLabyrinthBossEchoUnit('gabiru', 6, 3);
    const high = createLabyrinthBossEchoUnit('gabiru', 25, 3);
    expect(low).not.toBeNull();
    expect(high).not.toBeNull();
    // Verschlingbar wie das Original → Break gibt erneut +Devour-Chance.
    expect(low!.devourable).toBe(true);
    expect(low!.boss).toBe(true);
    expect(low!.sourceId).toBe('gabiru');
    // Party-relativ: höheres Party-Level → höheres Echo-Level.
    expect(high!.level).toBeGreaterThan(low!.level);
    // Unbekannte Art → kein Echo.
    expect(createLabyrinthBossEchoUnit('does-not-exist', 10)).toBeNull();
  });

  it('persistiert die Verschlingungs-Historie und migriert Altstände zu leer', () => {
    const state = createProgressionState({ devouredSourceIds: ['ifrit', 'ifrit', 'gabiru'] });
    // uniqueStrings entdoppelt.
    expect([...state.devouredSourceIds].sort()).toEqual(['gabiru', 'ifrit']);

    const base = createNewSave();
    expect(base.progression.devouredSourceIds).toEqual([]);
    // Roundtrip erhält gesetzte Werte.
    const withHistory = {
      ...base,
      progression: { ...base.progression, devouredSourceIds: ['orc-disaster'] }
    };
    const loaded = importSave(exportSave(withHistory), '2026-07-11T12:00:00.000Z');
    expect(loaded.progression.devouredSourceIds).toEqual(['orc-disaster']);

    // Altstand ohne Feld → leere Historie (alle besiegten Bosse echo-fähig).
    const raw = JSON.parse(exportSave(base)) as { progression: Record<string, unknown> };
    delete raw.progression.devouredSourceIds;
    const migrated = importSave(JSON.stringify(raw), '2026-07-11T12:05:00.000Z');
    expect(migrated.progression.devouredSourceIds).toEqual([]);
  });
});
