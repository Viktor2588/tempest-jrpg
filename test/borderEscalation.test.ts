import { describe, expect, it } from 'vitest';
import { exportSave, importSave, createNewSave, type SaveGameV2 } from '../src/systems/save';
import { makeRng } from '../src/systems/rng';
import { buildRangaTravelView, discoverRangaTravelFlags, rangaTravelFlag } from '../src/systems/rangaTravel';
import {
  applyWorldState,
  chooseDialogOption,
  completeEncounter,
  createWorldState,
  getTrackedQuestObjective,
  getTravelAtTile,
  resolveEncounter,
  startDialogForNpc
} from '../src/systems/world';

function bandThreeReadySave(): SaveGameV2 {
  const base = createNewSave({ now: '2026-07-01T00:00:00.000Z', seed: 48 });
  return {
    ...base,
    flags: {
      ...base.flags,
      'story.act1.completed': true,
      'story.direwolf.pact': true
    }
  };
}

function talk(save: SaveGameV2, npcId: string, choiceId: string): SaveGameV2 {
  const world = createWorldState(save);
  const dialog = startDialogForNpc(world, npcId);
  expect(dialog.choices.map((choice) => choice.id)).toContain(choiceId);
  const result = chooseDialogOption(world, dialog.dialogId, dialog.nodeId, choiceId);
  expect(result.ok).toBe(true);
  return applyWorldState(save, result.state.world);
}

function winTrigger(
  save: SaveGameV2,
  mapId: string,
  position: { readonly x: number; readonly y: number }
): SaveGameV2 {
  const triggered = resolveEncounter(createWorldState(save), mapId, position, makeRng(48));
  expect(triggered.state.encounter).not.toBeNull();
  const afterTrigger = applyWorldState(save, triggered.state.world);
  const victory = completeEncounter(createWorldState(afterTrigger), triggered.state.encounter!.id);
  return applyWorldState(afterTrigger, victory.state);
}

describe('Band 3 – Grenzeskalation', () => {
  it('startet nur freiwillig nach Band 2 und Rangas Pakt', () => {
    const locked = createNewSave();
    expect(startDialogForNpc(createWorldState(locked), 'gobta').choices.map((choice) => choice.id))
      .not.toContain('muster');

    const withoutPact = {
      ...locked,
      flags: { 'story.act1.completed': true }
    };
    expect(startDialogForNpc(createWorldState(withoutPact), 'gobta').choices.map((choice) => choice.id))
      .not.toContain('muster');

    const ready = bandThreeReadySave();
    expect(startDialogForNpc(createWorldState(ready), 'gobta').choices.map((choice) => choice.id))
      .toContain('muster');
    expect(ready.quests['border-escalation']).toBeUndefined();
  });

  it('führt Hinweg, Deeskalation, Analyse, Vorhutspur und Rückweg als einen Save-sicheren Flow', () => {
    let save = talk(bandThreeReadySave(), 'gobta', 'muster');
    expect(save.quests['border-escalation']?.status).toBe('active');

    const outbound = getTravelAtTile('tempest-start', { x: 1, y: 7 }, createWorldState(save));
    expect(outbound?.id).toBe('gate-to-marsh');
    save = { ...save, location: { ...outbound!.travelTo!, facing: 'right' } };
    save = {
      ...save,
      flags: discoverRangaTravelFlags(createWorldState(save), save.location)
    };
    expect(save.flags[rangaTravelFlag('spirit-marsh')]).toBe(true);
    expect(buildRangaTravelView(createWorldState(save), save.location).scout.title)
      .toContain('Westpfad ins Geistmoor');

    expect(getTrackedQuestObjective(createWorldState(save))).toMatchObject({
      stepId: 'border-clash',
      locationId: 'marsh-frontier',
      mapId: 'spirit-marsh',
      position: { x: 5, y: 11 }
    });

    save = winTrigger(save, 'spirit-marsh', { x: 5, y: 11 });
    expect(save.flags['story.border.cleared']).toBe(true);
    expect(save.quests['border-escalation']?.completedStepIds).not.toContain('border-clash');

    save = talk(save, 'border-survivor', 'aid-survivors');
    expect(save.flags['story.border.deescalated']).toBe(true);
    expect(save.quests['border-escalation']?.completedStepIds).toContain('border-clash');
    expect(buildRangaTravelView(createWorldState(save), save.location).scout.title)
      .toContain('Rückweg zu Shuna');

    const inbound = getTravelAtTile('spirit-marsh', { x: 1, y: 2 }, createWorldState(save));
    expect(inbound?.id).toBe('gate-to-tempest');
    save = { ...save, location: { ...inbound!.travelTo!, facing: 'right' } };
    save = talk(save, 'shuna', 'read-fracture');
    expect(buildRangaTravelView(createWorldState(save), save.location).scout.title)
      .toContain('Vorhut am Grenzriss');

    expect(getTrackedQuestObjective(createWorldState(save))).toMatchObject({
      stepId: 'break-vanguard',
      locationId: 'border-rift',
      mapId: 'spirit-marsh',
      position: { x: 18, y: 4 }
    });

    save = { ...save, location: { ...outbound!.travelTo!, facing: 'right' } };
    save = winTrigger(save, 'spirit-marsh', { x: 18, y: 4 });
    save = talk(save, 'ranga-vanguard-trace', 'secure-trace');
    expect(save.flags['story.vanguard.trace-read']).toBe(true);
    expect(buildRangaTravelView(createWorldState(save), save.location).scout.title)
      .toContain('Abschlussbericht');

    save = { ...save, location: { ...inbound!.travelTo!, facing: 'right' } };
    save = talk(save, 'gobta', 'report-act2');
    expect(save.quests['border-escalation']).toMatchObject({ status: 'completed' });
    expect(save.flags).toMatchObject({
      'story.act2.completed': true,
      'story.border.deescalated': true,
      'story.vanguard.trace-read': true
    });

    const roundtrip = importSave(exportSave(save), '2026-07-01T01:00:00.000Z');
    expect(roundtrip.quests['border-escalation']).toEqual(save.quests['border-escalation']);
    expect(roundtrip.location.mapId).toBe('tempest-start');
    expect(roundtrip.flags['story.border.deescalated']).toBe(true);
  });
});
