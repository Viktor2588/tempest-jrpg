import { describe, expect, it } from 'vitest';
import { createNewSave, type SaveGameV2 } from '../src/systems/save';
import {
  buildRangaJourneyView,
  buildRangaTravelView,
  discoverRangaTravelFlags,
  rangaTravelFlag,
  resolveRangaTravel
} from '../src/systems/rangaTravel';
import {
  buildCodexView,
  createWorldState,
  getAdjacentTravel,
  getMapLocations,
  type WorldState
} from '../src/systems/world';

function saveWith(flags: Record<string, boolean>, location: SaveGameV2['location']): SaveGameV2 {
  const base = createNewSave();
  return {
    ...base,
    flags,
    location
  };
}

describe('Ranga-Scout und Schnellreise', () => {
  it('bleibt vor Rangas Pakt gesperrt', () => {
    const save = createNewSave();
    const view = buildRangaTravelView(createWorldState(save), save.location);

    expect(view.enabled).toBe(false);
    expect(view.scout.title).toBe('Ranga noch nicht im Pakt');
    expect(view.destinations.every((destination) => destination.status === 'locked')).toBe(true);
  });

  it('persistiert nur real besuchte Reisepunkte als entdeckt', () => {
    const cave = saveWith({}, { mapId: 'sealed-cave', x: 7, y: 6, facing: 'up' });
    expect(discoverRangaTravelFlags(createWorldState(cave), cave.location))
      .not.toHaveProperty(rangaTravelFlag('sealed-cave'));

    const pact = { ...cave, flags: { 'story.direwolf.pact': true } };
    const caveFlags = discoverRangaTravelFlags(createWorldState(pact), pact.location);
    expect(caveFlags[rangaTravelFlag('sealed-cave')]).toBe(true);
    expect(caveFlags[rangaTravelFlag('goblin-village')]).toBeUndefined();

    const village = saveWith(
      { ...caveFlags, 'story.direwolf.pact': true, 'story.storm-dragon.oath': true },
      { mapId: 'goblin-village', x: 8, y: 6, facing: 'down' }
    );
    const villageFlags = discoverRangaTravelFlags(createWorldState(village), village.location);
    expect(villageFlags[rangaTravelFlag('goblin-village')]).toBe(true);
    expect(villageFlags[rangaTravelFlag('tempest-hollow')]).toBeUndefined();
  });

  it('schaltet Reise nicht allein durch einen inkonsistenten Roster ohne Pakt frei', () => {
    const state: WorldState = {
      flags: {},
      quests: {},
      inventory: [],
      gold: 0,
      roster: ['rimuru', 'ranga']
    };

    expect(buildRangaTravelView(state, createNewSave().location).enabled).toBe(false);
  });

  it('reist nur zu entdeckten, freigeschalteten und sicheren Zielen', () => {
    const save = saveWith({
      'story.direwolf.pact': true,
      'story.storm-dragon.oath': true,
      [rangaTravelFlag('sealed-cave')]: true,
      [rangaTravelFlag('goblin-village')]: true
    }, { mapId: 'sealed-cave', x: 7, y: 6, facing: 'up' });
    const state = createWorldState(save);

    expect(resolveRangaTravel(state, save.location, 'tempest-hollow').ok).toBe(false);
    const result = resolveRangaTravel(state, save.location, 'goblin-village');
    expect(result).toMatchObject({
      ok: true,
      location: { mapId: 'goblin-village', x: 8, y: 6 }
    });
  });

  it('liefert ein kurzes Ranga-Reisemoment und eine Reduced-Motion-Sofortvariante', () => {
    const save = saveWith({
      'story.direwolf.pact': true,
      'story.storm-dragon.oath': true,
      [rangaTravelFlag('sealed-cave')]: true,
      [rangaTravelFlag('goblin-village')]: true
    }, { mapId: 'sealed-cave', x: 7, y: 6, facing: 'up' });
    const destination = buildRangaTravelView(createWorldState(save), save.location)
      .destinations.find((item) => item.id === 'goblin-village')!;

    const cinematic = buildRangaJourneyView(destination, { reducedMotion: false });
    expect(cinematic).toMatchObject({
      mode: 'cinematic',
      title: 'Ranga trägt dich nach Goblindorf',
      durationMs: 1200
    });
    expect(cinematic.body).toContain('Geruchsspur');
    expect(cinematic.routeNote).toContain('Sicher');

    const instant = buildRangaJourneyView(destination, { reducedMotion: true });
    expect(instant).toMatchObject({
      mode: 'instant',
      durationMs: 0
    });
    expect(instant.body).toContain('sofort abgeschlossen');
  });

  it('blockiert bekannte, aber aktuell unsichere Fernrouten', () => {
    const unsafe = saveWith({
      'story.direwolf.pact': true,
      'story.act2.completed': true,
      [rangaTravelFlag('tempest-hollow')]: true,
      [rangaTravelFlag('spirit-marsh')]: true
    }, { mapId: 'tempest-start', x: 3, y: 5, facing: 'down' });

    const unsafeView = buildRangaTravelView(createWorldState(unsafe), unsafe.location);
    expect(unsafeView.destinations.find((destination) => destination.id === 'spirit-marsh')?.status).toBe('unsafe');
    expect(resolveRangaTravel(createWorldState(unsafe), unsafe.location, 'spirit-marsh').ok).toBe(false);

    const safe = { ...unsafe, flags: { ...unsafe.flags, 'marsh.guardian.cleared': true } };
    expect(resolveRangaTravel(createWorldState(safe), safe.location, 'spirit-marsh').ok).toBe(true);
  });

  it('liefert den Band-2-Scoutbericht und deckt den Flüsterhain nur als Scoutmarker auf', () => {
    const state: WorldState = {
      flags: {
        'story.direwolf.pact': true,
        'story.ranga.ready': true,
        'scout.whispering-grove': true,
        'scout.ambush.whispering-grove': true
      },
      quests: {
        'binding-of-ancestors': { status: 'active', completedStepIds: ['awakening'] }
      },
      inventory: [],
      gold: 0,
      roster: ['rimuru', 'gobta', 'ranga']
    };

    const view = buildRangaTravelView(state, { mapId: 'tempest-start', x: 3, y: 5, facing: 'down' });
    expect(view.scout).toMatchObject({
      title: 'Scoutziel: Flüsterhain',
      targetLocationId: 'whispering-grove'
    });
    expect(view.scout.warning).toContain('Hinterhalt');
    expect(getMapLocations('tempest-start', state).some((location) => location.id === 'whispering-grove')).toBe(true);
    expect(getAdjacentTravel('tempest-start', { x: 14, y: 8 }, state)).toBeUndefined();
  });

  it('spoilt gesperrte Legacy-Codex-Einträge nicht mit alten Eigennamen', () => {
    const entry = buildCodexView({ flags: {}, quests: {}, inventory: [], gold: 0 })
      .find((candidate) => candidate.id === 'mordrahn-keeper')!;

    expect(entry.unlocked).toBe(false);
    expect(entry.title).toBe('Unbekannter Hüter');
    expect(entry.body).toBeNull();
  });

  it('führt Band 4 vom freiwilligen Hook über Bündnisrat bis zur Entscheidung', () => {
    const base: WorldState = {
      flags: {
        'story.direwolf.pact': true,
        'story.act2.completed': true,
        'story.border.deescalated': true,
        'story.vanguard.trace-read': true
      },
      quests: { 'border-escalation': { status: 'completed', completedStepIds: [] } },
      inventory: [],
      gold: 0,
      roster: ['rimuru', 'gobta', 'ranga']
    };

    expect(buildRangaTravelView(base, { mapId: 'tempest-start', x: 4, y: 7, facing: 'down' }).scout)
      .toMatchObject({ title: 'Freiwilliger Hook: Wahl der Ahnen', targetLocationId: 'tempest-hollow' });

    const council = {
      ...base,
      quests: {
        ...base.quests,
        'ancestors-choice': { status: 'active' as const, completedStepIds: [] }
      }
    };
    expect(buildRangaTravelView(council, { mapId: 'tempest-start', x: 4, y: 7, facing: 'down' }).scout)
      .toMatchObject({ title: 'Wahl der Ahnen: Bündnisrat', targetLocationId: 'tempest-hollow' });

    const march = {
      ...council,
      flags: { ...council.flags, 'story.alliance.council-ready': true }
    };
    expect(buildRangaTravelView(march, { mapId: 'tempest-start', x: 4, y: 7, facing: 'down' }).scout)
      .toMatchObject({ title: 'Wahl der Ahnen: Bündnismarsch', targetLocationId: 'alliance-march' });

    const finale = {
      ...march,
      flags: { ...march.flags, 'story.breach.cleared': true }
    };
    expect(buildRangaTravelView(finale, { mapId: 'tempest-start', x: 12, y: 7, facing: 'down' }).scout)
      .toMatchObject({ title: 'Wahl der Ahnen: Bindungsherz', targetLocationId: 'ancestor-heart' });

    const decision = {
      ...finale,
      flags: { ...finale.flags, 'story.mordrahn.defeated': true }
    };
    expect(buildRangaTravelView(decision, { mapId: 'tempest-start', x: 15, y: 2, facing: 'down' }).scout)
      .toMatchObject({ title: 'Wahl der Ahnen: Entscheidung', targetLocationId: 'tempest-hollow' });
  });

  it('erklärt Ranga-Schnellreise erst nach real entdecktem sicherem Reisepunkt', () => {
    const before = buildCodexView({
      flags: { 'story.direwolf.pact': true },
      quests: {},
      inventory: [],
      gold: 0
    }).find((candidate) => candidate.id === 'tutorial-ranga-fast-travel')!;

    const after = buildCodexView({
      flags: {
        'story.direwolf.pact': true,
        [rangaTravelFlag('tempest-hollow')]: true
      },
      quests: {},
      inventory: [],
      gold: 0
    }).find((candidate) => candidate.id === 'tutorial-ranga-fast-travel')!;

    expect(before.unlocked).toBe(false);
    expect(after.unlocked).toBe(true);
    expect(after.body).toContain('wirklich gerochen');
    expect(after.body).toContain('keine Teleports');
  });
});
