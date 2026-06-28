import { describe, expect, it } from 'vitest';
import { getItemCount } from '../src/systems/inventory';
import {
  createNewSave,
  exportSave,
  importSave,
  migrate,
  normalize,
  startNewGamePlus,
  type SaveGameV2
} from '../src/systems/save';
import {
  applyWorldState,
  buildCodexView,
  buildQuestLog,
  chooseDialogOption,
  completeEncounter,
  createWorldState,
  npcHasQuestMarker,
  resolveEncounter,
  startDialogForNpc
} from '../src/systems/world';
import { makeRng } from '../src/systems/rng';
import type { Vec2 } from '../src/systems/overworld';

function talk(save: SaveGameV2, npcId: string, choiceId: string): SaveGameV2 {
  const world = createWorldState(save);
  const view = startDialogForNpc(world, npcId);
  expect(
    view.choices.map((choice) => choice.id),
    `${npcId}: Choice '${choiceId}' ist nicht sichtbar`
  ).toContain(choiceId);
  const result = chooseDialogOption(world, view.dialogId, view.nodeId, choiceId);
  expect(result.ok, `${npcId}.${choiceId}: ${result.message}`).toBe(true);
  return applyWorldState(save, result.state.world);
}

function clearTrigger(save: SaveGameV2, mapId: string, position: Vec2): SaveGameV2 {
  const triggered = resolveEncounter(createWorldState(save), mapId, position, makeRng(22));
  expect(triggered.state.encounter, `Kein Trigger auf ${mapId} (${position.x},${position.y})`).not.toBeNull();
  let next = applyWorldState(save, triggered.state.world);
  const completed = completeEncounter(createWorldState(next), triggered.state.encounter!.id);
  next = applyWorldState(next, completed.state);
  return next;
}

function checkpoint(save: SaveGameV2, label: string): SaveGameV2 {
  const roundtripped = importSave(exportSave(save), '2026-06-28T22:00:00.000Z');
  const memberIds = [...roundtripped.party.active, ...roundtripped.party.reserve].map((member) => member.characterId);
  expect(new Set(memberIds).size, `${label}: doppelte Party-Mitglieder`).toBe(memberIds.length);
  for (const [questId, quest] of Object.entries(roundtripped.quests)) {
    expect(
      new Set(quest.completedStepIds).size,
      `${label}: doppelte Queststeps in ${questId}`
    ).toBe(quest.completedStepIds.length);
  }
  return roundtripped;
}

function completeCanonBandOneAndTwo(seed = 22): SaveGameV2 {
  let save = checkpoint(createNewSave({ seed, now: '2026-06-28T20:00:00.000Z' }), 'new-save');

  save = talk(save, 'sealed-storm-dragon', 'begin');
  save = talk(save, 'sealed-storm-dragon', 'oath');

  save = checkpoint(save, 'before-gobta');
  save = talk(save, 'rigurd', 'hear-goblin-plea');
  save = checkpoint(save, 'after-gobta');
  expect(save.party.active.map((member) => member.characterId)).toEqual(['rimuru', 'gobta']);

  save = clearTrigger(save, 'direwolf-den', { x: 9, y: 5 });
  save = checkpoint(save, 'before-ranga-pact');
  expect(save.party.active.map((member) => member.characterId)).toEqual(['rimuru', 'gobta']);
  save = talk(save, 'ranga', 'seal-pact');
  save = checkpoint(save, 'after-ranga-pact');
  expect(save.party.active.map((member) => member.characterId)).toEqual(['rimuru', 'gobta', 'ranga']);

  save = talk(save, 'rigurd', 'name-village');
  save = talk(save, 'rigurd-tempest', 'after-prologue');
  save = talk(save, 'shuna', 'analyze');
  save = talk(save, 'gobta', 'briefing');
  save = talk(save, 'ranga-tempest', 'scout-route');

  save = checkpoint(save, 'before-council');
  save = talk(save, 'rigurd-tempest', 'council');
  save = checkpoint(save, 'after-council');

  save = checkpoint(save, 'before-grove');
  save = clearTrigger(save, 'tempest-start', { x: 14, y: 8 });
  save = checkpoint(save, 'after-grove');

  save = checkpoint(save, 'before-echo');
  save = clearTrigger(save, 'tempest-start', { x: 21, y: 13 });
  save = checkpoint(save, 'after-echo');

  save = talk(save, 'rigurd-tempest', 'report-act1');
  return checkpoint(save, 'band-2-complete');
}

function continueMidBandTwo(save: SaveGameV2): SaveGameV2 {
  save = talk(save, 'ranga-tempest', 'scout-route');
  save = talk(save, 'rigurd-tempest', 'council');
  save = clearTrigger(save, 'tempest-start', { x: 14, y: 8 });
  save = clearTrigger(save, 'tempest-start', { x: 21, y: 13 });
  return talk(save, 'rigurd-tempest', 'report-act1');
}

describe('Phase 22 – Band-1-/Band-2-Integrations-Gate', () => {
  it('spielt neuen Save mit Checkpoint-Roundtrips von Veldora bis Band-2-Abschluss durch', () => {
    const save = completeCanonBandOneAndTwo();
    const world = createWorldState(save);
    const prologue = buildQuestLog(world).find((quest) => quest.id === 'slime-awakening')!;
    const bandTwo = buildQuestLog(world).find((quest) => quest.id === 'binding-of-ancestors')!;

    expect(save.party.active.map((member) => member.characterId)).toEqual(['rimuru', 'gobta', 'ranga']);
    expect(prologue.status).toBe('completed');
    expect(bandTwo.status).toBe('completed');
    expect(bandTwo.steps.every((step) => step.completed)).toBe(true);
    expect(save.flags['story.act1.completed']).toBe(true);
    expect(save.flags['compat.legacyArc.visible']).toBeUndefined();
    expect(getItemCount(save.inventory.stacks, 'ancestor-seal-fragment')).toBe(1);
    expect(getItemCount(save.inventory.stacks, 'tempest-charm')).toBe(1);
    expect(buildCodexView(world).find((entry) => entry.id === 'mordrahn')?.title).toBe('Namenloses Echo');
  });

  it('Migrationsmatrix: alter Save ohne Prologflags startet weiter sauber in den Prolog', () => {
    const migrated = migrate({
      schemaVersion: 1,
      createdAt: '2026-06-01T00:00:00.000Z',
      seed: 3,
      mapId: 'sealed-cave',
      x: 7,
      y: 6,
      facing: 'up',
      gold: 77,
      activeParty: [{ id: 'rimuru', level: 2, xp: 50 }],
      inventory: { 'healing-herb': 1 },
      flags: {}
    }, '2026-06-28T20:30:00.000Z');

    const afterStart = talk(migrated, 'sealed-storm-dragon', 'begin');
    expect(afterStart.quests['slime-awakening']?.status).toBe('active');
    expect(afterStart.flags['story.slime.awakened']).toBe(true);
  });

  it('Migrationsmatrix: alter Save mitten in binding-of-ancestors bleibt fortsetzbar', () => {
    const base = createNewSave();
    const midAct = normalize({
      ...base,
      party: { ...base.party, active: base.party.active, reserve: [], gold: 220 },
      location: { mapId: 'tempest-start', x: 3, y: 5, facing: 'down' },
      flags: {
        'story.slime.awakened': true,
        'story.storm-dragon.oath': true,
        'story.goblin.plea': true,
        'story.direwolf.defeated': true,
        'story.direwolf.pact': true,
        'story.slime-prologue.completed': true,
        'story.tempest.named': true,
        'story.intro.seen': true,
        'story.shuna.ready': true,
        'story.vael.ready': true,
        'story.gobta.ready': true
      },
      quests: {
        'slime-awakening': {
          status: 'completed',
          completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
        },
        'binding-of-ancestors': {
          status: 'active',
          completedStepIds: ['awakening']
        }
      }
    });

    expect(midAct.party.active.map((member) => member.characterId)).toEqual(['rimuru', 'gobta', 'ranga']);
    const completed = continueMidBandTwo(checkpoint(midAct, 'mid-binding-migration'));
    expect(completed.quests['binding-of-ancestors']?.status).toBe('completed');
    expect(completed.flags['story.act1.completed']).toBe(true);
  });

  it('Migrationsmatrix: abgeschlossener Band-2-Save bleibt spielbar und öffnet nur freiwillige Folgehooks', () => {
    const completed = checkpoint(completeCanonBandOneAndTwo(23), 'completed-act1-migration');

    expect(completed.quests['binding-of-ancestors']?.status).toBe('completed');
    expect(completed.quests['border-escalation']?.status ?? 'inactive').toBe('inactive');
    expect(npcHasQuestMarker(createWorldState(completed), 'gobta')).toBe(true);

    const borderStarted = talk(completed, 'gobta', 'muster');
    expect(borderStarted.quests['border-escalation']?.status).toBe('active');
    expect(borderStarted.flags['story.act2.started']).toBe(true);
  });

  it('Migrationsmatrix: New Game+ setzt Story zurück, bleibt aber prologspielbar', () => {
    const completed = completeCanonBandOneAndTwo(24);
    const ng = startNewGamePlus(completed, '2026-06-28T21:00:00.000Z');

    expect(ng.flags).toEqual({});
    expect(ng.quests).toEqual({});
    expect(ng.location.mapId).toBe('sealed-cave');
    expect(ng.party.active.map((member) => member.characterId)).toEqual(['rimuru', 'gobta', 'ranga']);

    const afterStart = talk(ng, 'sealed-storm-dragon', 'begin');
    expect(afterStart.quests['slime-awakening']?.status).toBe('active');
    expect(afterStart.flags['story.slime.awakened']).toBe(true);
  });
});
