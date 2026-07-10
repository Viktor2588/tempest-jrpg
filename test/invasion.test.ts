import { describe, expect, it } from 'vitest';
import { RESIDENTS, FACILITIES } from '../src/data';
import {
  BATTLE_ARENA_TEXTURES,
  battleArenaForMap
} from '../src/render/battleArt';
import { buildFacilityOverview } from '../src/systems/facilities';
import {
  AWAKENING_MAGICULE_COST,
  AWAKENING_SOUL_COST,
  canAwakenTempest,
  createProgressionState
} from '../src/systems/progression';
import { makeRng } from '../src/systems/rng';
import {
  buildQuestLog,
  chooseDialogOption,
  completeEncounter,
  getVisibleMapEncounters,
  resolveEncounter,
  type WorldState
} from '../src/systems/world';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

const CAMP_FLAGS = { 'story.tempest.named': true } as const;

function baseWorld(flags: Record<string, boolean> = {}): WorldState {
  return { flags, quests: {}, inventory: [], gold: 0 };
}

function triggerInvasion(state: WorldState, expectedId: string, position: { x: number; y: number }): WorldState {
  const triggered = resolveEncounter(state, 'jura-battlefield', position, makeRng(1));
  expect(triggered.state.encounter?.id).toBe(expectedId);
  const completed = completeEncounter(triggered.state.world, expectedId);
  expect(completed.ok, completed.message).toBe(true);
  return completed.state;
}

describe('Phase 110 — Tempest-Invasion', () => {
  it('startet nach Gelds Fall, spielt zwei Verteidigungswellen und schaltet das Erntefest frei', () => {
    const started = chooseDialogOption(
      baseWorld({ 'story.geld.devoured': true }),
      'rigurd-act1',
      'start',
      'muster-invasion'
    );
    expect(started.ok, started.message).toBe(true);
    let state = started.state.world;

    expect(state.flags['story.tempest-invasion.active']).toBe(true);
    expect(getVisibleMapEncounters('jura-battlefield', state).map((encounter) => encounter.id))
      .toContain('tempest-invasion-vanguard');

    state = triggerInvasion(state, 'tempest-invasion-vanguard', { x: 9, y: 7 });
    expect(state.flags['story.tempest-invasion.vanguard-cleared']).toBe(true);
    expect(getVisibleMapEncounters('jura-battlefield', state).map((encounter) => encounter.id))
      .toContain('tempest-invasion-command');

    state = triggerInvasion(state, 'tempest-invasion-command', { x: 15, y: 6 });
    expect(state.flags['story.tempest-invasion.repulsed']).toBe(true);
    expect(state.flags['story.tempest-invasion.active']).toBe(false);
    expect(state.inventory.find((stack) => stack.itemId === 'magisteel')?.quantity).toBe(1);
    expect(state.gold).toBe(220);

    const quest = buildQuestLog(state).find((entry) => entry.id === 'tempest-invasion');
    expect(quest?.status).toBe('completed');
    expect(quest?.steps.every((step) => step.completed)).toBe(true);

    const progression = createProgressionState({
      magicules: AWAKENING_MAGICULE_COST,
      souls: AWAKENING_SOUL_COST, // Phase 127 — Seelen-Gate aus Boss-Siegen
      promotedResidentIds: ['sturmzahn']
    });
    expect(canAwakenTempest(progression, { 'story.geld.devoured': true }).ok).toBe(false);
    expect(canAwakenTempest(progression, state.flags).ok).toBe(true);
  });

  it('macht die gesicherte Palisade als Produktionsfolge der Wache sichtbar', () => {
    const residents = RESIDENTS.map((resident) => resident.id);
    const before = buildFacilityOverview(residents, CAMP_FLAGS);
    const after = buildFacilityOverview(residents, {
      ...CAMP_FLAGS,
      'story.tempest-invasion.repulsed': true
    });
    const watch = FACILITIES.find((facility) => facility.id === 'watch')!;
    const beforeWatch = before.facilities.find((view) => view.facility.id === 'watch')!;
    const afterWatch = after.facilities.find((view) => view.facility.id === 'watch')!;

    expect(afterWatch.amountPerCycle).toBe(beforeWatch.amountPerCycle + watch.output.perStaffPerLevel);
  });

  it('verwendet den Invasions-Kampfhintergrund und lädt das Asset vor', () => {
    expect(battleArenaForMap('jura-battlefield', 'tempest-invasion-command').textureKey)
      .toBe(BATTLE_ARENA_TEXTURES['tempest-invasion']);
    expect(preloadSource).toContain('../assets/backgrounds/battle-tempest-invasion.png');
  });
});
