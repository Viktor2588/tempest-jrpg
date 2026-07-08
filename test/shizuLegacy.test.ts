import { describe, expect, it } from 'vitest';
import { FREEDOM_ACADEMY, RAMIRIS_LABYRINTH, getMap, getMapName, MAPS } from '../src/data/maps';
import { isWalkable } from '../src/systems/overworld';
import { makeRng } from '../src/systems/rng';
import { createNewSave } from '../src/systems/save';
import {
  buildCodexView,
  buildQuestLog,
  chooseDialogOption,
  completeEncounter,
  createWorldState,
  getMapNpcs,
  getTravelAtTile,
  resolveEncounter,
  type WorldState
} from '../src/systems/world';
import portraitSource from '../src/render/portraitAtlas.ts?raw';

function freshWorld(): WorldState {
  return createWorldState(createNewSave());
}

function withFlag(state: WorldState, flag: string): WorldState {
  return { ...state, flags: { ...state.flags, [flag]: true } };
}

describe('Shizus Vermächtnis (Phase 113)', () => {
  it('registriert die Freiheitsakademie mit sichtbarem Namen', () => {
    expect(MAPS['freedom-academy']).toBe(FREEDOM_ACADEMY);
    expect(getMap('freedom-academy')).toBe(FREEDOM_ACADEMY);
    expect(getMapName('freedom-academy')).toBe('Freiheitsakademie');
  });

  it('öffnet Ramiris-Labyrinth als ersten Koloss-Set-Piece-Slice', () => {
    expect(MAPS['ramiris-labyrinth']).toBe(RAMIRIS_LABYRINTH);
    expect(getMap('ramiris-labyrinth')).toBe(RAMIRIS_LABYRINTH);
    expect(getMapName('ramiris-labyrinth')).toBe('Ramiris-Labyrinth');

    let state = withFlag(freshWorld(), 'story.children.first-core');
    expect(getMapNpcs('freedom-academy', state).map((npc) => npc.id)).toContain('academy-ramiris');
    expect(getTravelAtTile('freedom-academy', { x: 18, y: 7 }, state)).toBeUndefined();

    const opened = chooseDialogOption(state, 'ramiris-labyrinth', 'start', 'open');
    expect(opened.ok).toBe(true);
    state = opened.state.world;
    expect(state.flags['story.ramiris.met']).toBe(true);
    expect(getTravelAtTile('freedom-academy', { x: 18, y: 7 }, state)?.travelTo?.mapId)
      .toBe('ramiris-labyrinth');

    const encounter = resolveEncounter(state, 'ramiris-labyrinth', { x: 18, y: 6 }, makeRng(1));
    expect(encounter.state.encounter?.id).toBe('magic-colossus');
    state = completeEncounter(encounter.state.world, encounter.state.encounter!.id).state;
    expect(state.flags['story.magic-colossus.defeated']).toBe(true);
    const quest = buildQuestLog(state).find((entry) => entry.id === 'ramiris-labyrinth');
    expect(quest?.status).toBe('completed');
    expect(quest?.steps.every((step) => step.completed)).toBe(true);
    expect(buildCodexView(state).find((entry) => entry.id === 'ramiris-labyrinth')?.unlocked).toBe(true);
  });

  it('öffnet den Akademieweg erst nach Shizus Schwur', () => {
    const locked = freshWorld();
    expect(getTravelAtTile('blumund', { x: 18, y: 12 }, locked)).toBeUndefined();

    const open = withFlag(locked, 'story.shizu.vow');
    const gate = getTravelAtTile('blumund', { x: 18, y: 12 }, open);
    expect(gate?.id).toBe('gate-to-freedom-academy');
    expect(gate?.travelTo?.mapId).toBe('freedom-academy');

    const back = getTravelAtTile('freedom-academy', { x: 1, y: 7 }, open);
    expect(back?.travelTo?.mapId).toBe('blumund');
  });

  it('platziert Schüler und Akademie-Orte auf begehbaren Kacheln', () => {
    const tiles: ReadonlyArray<readonly [number, number]> = [
      [1, 7],
      [5, 6],
      [13, 6],
      [12, 5],
      [13, 5],
      [14, 6],
      [12, 7],
      [14, 7],
      [FREEDOM_ACADEMY.spawn.x, FREEDOM_ACADEMY.spawn.y]
    ];
    for (const [x, y] of tiles) expect(isWalkable(FREEDOM_ACADEMY, x, y)).toBe(true);
  });

  it('macht aus Shizus Schwur eine spielbare Kinder-Folgequest mit Wahlfolge', () => {
    let state = withFlag(freshWorld(), 'story.shizu.vow');
    expect(getMapNpcs('freedom-academy', state).map((npc) => npc.id).sort()).toEqual([
      'academy-alice',
      'academy-chloe',
      'academy-gale',
      'academy-kenya',
      'academy-ryota'
    ]);

    const arrive = chooseDialogOption(state, 'shizu-children', 'start', 'arrive');
    expect(arrive.ok).toBe(true);
    state = arrive.state.world;
    expect(state.flags['story.children.met']).toBe(true);

    const comfort = chooseDialogOption(state, 'shizu-children', 'choice', 'comfort');
    expect(comfort.ok).toBe(true);
    state = comfort.state.world;
    expect(state.flags['story.children.comforted']).toBe(true);
    expect(state.flags['story.children.first-core']).toBe(true);

    const quest = buildQuestLog(state).find((entry) => entry.id === 'shizu-legacy');
    expect(quest?.status).toBe('completed');
    expect(quest?.steps.every((step) => step.completed)).toBe(true);
    expect(buildCodexView(state).find((entry) => entry.id === 'shizu-children')?.unlocked).toBe(true);
  });

  it('ordnet dem Gruppen-Sprecher das generierte Schülerportrait zu', () => {
    expect(portraitSource).toContain("case 'shizus schüler':");
    expect(portraitSource).toContain("return 'shizu-children';");
  });
});
