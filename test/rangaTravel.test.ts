import { describe, expect, it } from 'vitest';
import { createNewSave, type SaveGameV2 } from '../src/systems/save';
import {
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
    const caveFlags = discoverRangaTravelFlags(createWorldState(cave), cave.location);
    expect(caveFlags[rangaTravelFlag('sealed-cave')]).toBe(true);
    expect(caveFlags[rangaTravelFlag('goblin-village')]).toBeUndefined();

    const village = saveWith(
      { ...caveFlags, 'story.storm-dragon.oath': true },
      { mapId: 'goblin-village', x: 8, y: 6, facing: 'down' }
    );
    const villageFlags = discoverRangaTravelFlags(createWorldState(village), village.location);
    expect(villageFlags[rangaTravelFlag('goblin-village')]).toBe(true);
    expect(villageFlags[rangaTravelFlag('tempest-hollow')]).toBeUndefined();
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
});
