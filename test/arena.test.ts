import { describe, expect, it } from 'vitest';
import { TEMPEST_COLOSSEUM, getMapName } from '../src/data/maps';
import { isWalkable } from '../src/systems/overworld';
import { makeRng } from '../src/systems/rng';
import {
  buildQuestLog,
  chooseDialogOption,
  completeEncounter,
  getMapLocations,
  getVisibleMapEncounters,
  resolveEncounter,
  type WorldState
} from '../src/systems/world';

function baseWorld(flags: Record<string, boolean> = {}): WorldState {
  return { flags, quests: {}, inventory: [], gold: 0 };
}

function chooseArena(state: WorldState, choiceId: string): WorldState {
  const result = chooseDialogOption(state, 'tempest-arena', 'start', choiceId);
  expect(result.ok, result.message).toBe(true);
  return result.state.world;
}

function clearArenaWave(state: WorldState, expectedId: string): WorldState {
  const triggered = resolveEncounter(state, 'tempest-colosseum', { x: 11, y: 6 }, makeRng(1));
  expect(triggered.state.encounter?.id).toBe(expectedId);
  const completed = completeEncounter(triggered.state.world, expectedId);
  expect(completed.ok, completed.message).toBe(true);
  return completed.state;
}

function visibleArenaTriggers(state: WorldState): string[] {
  return getVisibleMapEncounters('tempest-colosseum', state)
    .filter((encounter) => encounter.kind === 'trigger')
    .map((encounter) => encounter.id);
}

describe('Tempest-Kolosseum', () => {
  it('ist nach der Kijin-Benennung als eigene Karte erreichbar', () => {
    expect(getMapName('tempest-colosseum')).toBe('Tempest-Kolosseum');
    expect(isWalkable(TEMPEST_COLOSSEUM, 2, 7)).toBe(true);
    expect(isWalkable(TEMPEST_COLOSSEUM, 11, 6)).toBe(true);

    expect(getMapLocations('tempest-start', baseWorld()).map((location) => location.id))
      .not.toContain('gate-to-colosseum');
    expect(getMapLocations('tempest-start', baseWorld({ 'story.kijin.named': true })).map((location) => location.id))
      .toContain('gate-to-colosseum');
  });

  it('spielt Bronze, Silber und Gold als wiederholbare Rangfolge', () => {
    let state = chooseArena(baseWorld({ 'story.kijin.named': true }), 'register');
    expect(visibleArenaTriggers(state)).toEqual(['arena-bronze-wave']);

    state = clearArenaWave(state, 'arena-bronze-wave');
    expect(state.flags['arena.bronze.cleared']).toBe(true);
    expect(visibleArenaTriggers(state)).toEqual(['arena-silver-wave']);

    state = clearArenaWave(state, 'arena-silver-wave');
    expect(state.flags['arena.silver.cleared']).toBe(true);
    expect(visibleArenaTriggers(state)).toEqual(['arena-gold-wave']);

    state = clearArenaWave(state, 'arena-gold-wave');
    expect(state.flags['arena.gold.cleared']).toBe(true);
    expect(state.flags['arena.run.active']).toBe(false);
    expect(state.gold).toBe(290);
    expect(state.inventory.find((stack) => stack.itemId === 'magisteel')?.quantity).toBe(1);
    expect(visibleArenaTriggers(state)).toEqual([]);

    const quest = buildQuestLog(state).find((entry) => entry.id === 'tempest-arena');
    expect(quest?.status).toBe('completed');
    expect(quest?.steps.every((step) => step.completed)).toBe(true);

    state = chooseArena(state, 'restart');
    expect(state.flags['arena.bronze.cleared']).toBe(false);
    expect(state.flags['arena.silver.cleared']).toBe(false);
    expect(state.flags['arena.gold.cleared']).toBe(false);
    expect(state.flags['encounter.arena-bronze-wave.cleared']).toBe(false);
    expect(visibleArenaTriggers(state)).toEqual(['arena-bronze-wave']);
  });
});
