import { describe, expect, it } from 'vitest';
import { createLabyrinthRun, collectLabyrinthReward } from '../src/systems/labyrinth';
import { getItemCount } from '../src/systems/inventory';
import { makeRng } from '../src/systems/rng';
import {
  chooseDialogOption,
  completeEncounter,
  getVisibleMapEncounters,
  resolveEncounter,
  type WorldState
} from '../src/systems/world';

function baseWorld(flags: Record<string, boolean> = {}): WorldState {
  return { flags, quests: {}, inventory: [], gold: 0 };
}

function visibleLabyrinthTriggers(state: WorldState): string[] {
  return getVisibleMapEncounters('ramiris-labyrinth', state)
    .filter((encounter) => encounter.kind === 'trigger')
    .map((encounter) => encounter.id);
}

function clearFloor(state: WorldState, position: { readonly x: number; readonly y: number }, expectedId: string): WorldState {
  const triggered = resolveEncounter(state, 'ramiris-labyrinth', position, makeRng(1));
  expect(triggered.state.encounter?.id).toBe(expectedId);
  const completed = completeEncounter(triggered.state.world, expectedId);
  expect(completed.ok, completed.message).toBe(true);
  return completed.state;
}

describe('Ramiris-Labyrinth (Phase 99)', () => {
  it('generiert reproduzierbare Etagen mit Carry-Regel und Run-Loot', () => {
    const a = createLabyrinthRun(99);
    const b = createLabyrinthRun(99);
    const c = createLabyrinthRun(100);

    expect(a).toEqual(b);
    expect(c.floors).not.toEqual(a.floors);
    expect(a.carryRule).toBe('hp-mp-carry-no-rest');
    expect(a.floors.map((floor) => floor.depth)).toEqual([1, 2, 3]);

    const result = collectLabyrinthReward([], 10, a.floors[2]!.reward);
    expect(result.gold).toBe(130);
    expect(getItemCount(result.inventory, 'magisteel')).toBe(1);
    expect(getItemCount(result.inventory, 'spirit-ember')).toBe(1);
  });

  it('spielt den wiederholbaren Labyrinthlauf als drei riskante Etagen', () => {
    let state = baseWorld({ 'story.magic-colossus.defeated': true });
    const started = chooseDialogOption(state, 'ramiris-labyrinth', 'start', 'start-run');
    expect(started.ok, started.message).toBe(true);
    state = started.state.world;

    expect(state.flags['labyrinth.run.active']).toBe(true);
    expect(visibleLabyrinthTriggers(state)).toEqual(['labyrinth-floor-1']);

    state = clearFloor(state, { x: 6, y: 6 }, 'labyrinth-floor-1');
    expect(visibleLabyrinthTriggers(state)).toEqual(['labyrinth-floor-2']);

    state = clearFloor(state, { x: 12, y: 7 }, 'labyrinth-floor-2');
    expect(visibleLabyrinthTriggers(state)).toEqual(['labyrinth-floor-3']);

    state = clearFloor(state, { x: 18, y: 6 }, 'labyrinth-floor-3');
    expect(state.flags['labyrinth.run.active']).toBe(false);
    expect(state.flags['labyrinth.floor3.cleared']).toBe(true);
    expect(state.gold).toBe(225);
    expect(getItemCount(state.inventory, 'magisteel')).toBe(1);
    expect(getItemCount(state.inventory, 'spirit-ember')).toBe(1);

    const restarted = chooseDialogOption(state, 'ramiris-labyrinth', 'start', 'start-run');
    expect(restarted.ok, restarted.message).toBe(true);
    expect(visibleLabyrinthTriggers(restarted.state.world)).toEqual(['labyrinth-floor-1']);
  });
});
