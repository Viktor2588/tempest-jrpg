import { describe, expect, it } from 'vitest';
import { createNewSave, exportSave, importSave, migrate, type SaveGameV2 } from '../src/systems/save';
import {
  applyEffects,
  applyWorldState,
  buildCodexView,
  buildQuestLog,
  chooseDialogOption,
  completeEncounter,
  createWorldState,
  getActiveEnding,
  getMapEncounters,
  getMapLocations,
  getMapNpcs,
  getMapShops,
  getVisibleMapEncounters,
  npcHasQuestMarker,
  resolveEncounter,
  startDialogForNpc
} from '../src/systems/world';
import type { WorldEffect } from '../src/data/world';
import { MAPS, getMap } from '../src/data/maps';
import { isWalkable, type TileMap, type Vec2 } from '../src/systems/overworld';
import { makeRng } from '../src/systems/rng';

const MAP_ID = 'tempest-start';

// Spiegelt EXAKT die DialogueScene: lädt aus dem Save, nimmt nur die
// requirement-GEFILTERTEN Choices des Startknotens, wendet die Effekte an und
// schreibt zurück in den Save. Wirft, wenn die Choice für den Spieler gar nicht
// sichtbar wäre — so fängt der Test „Quest hängt, weil Option fehlt"-Bugs.
function talk(save: SaveGameV2, npcId: string, choiceId: string): SaveGameV2 {
  const view = startDialogForNpc(createWorldState(save), npcId);
  expect(
    view.choices.map((c) => c.id),
    `${npcId}: Choice '${choiceId}' ist für den Spieler nicht sichtbar`
  ).toContain(choiceId);
  const result = chooseDialogOption(createWorldState(save), view.dialogId, view.nodeId, choiceId);
  expect(result.ok, `${npcId}.${choiceId}: ${result.message}`).toBe(true);
  return applyWorldState(save, result.state.world);
}

// Spiegelt die OverworldScene: tritt auf die Encounter-Kachel (resolveEncounter),
// erwartet, dass der gated Trigger wirklich auslöst, und schreibt nach Sieg die
// victoryEffects (completeEncounter) zurück.
function clearTriggerAt(save: SaveGameV2, pos: Vec2, mapId: string = MAP_ID): SaveGameV2 {
  const triggered = resolveEncounter(createWorldState(save), mapId, pos, makeRng(1));
  expect(
    triggered.state.encounter,
    `Kein Encounter an (${pos.x},${pos.y}) auf '${mapId}' — gated Trigger nicht erreichbar`
  ).not.toBeNull();
  let next = applyWorldState(save, triggered.state.world);
  const won = completeEncounter(createWorldState(next), triggered.state.encounter!.id);
  next = applyWorldState(next, won.state);
  return next;
}

// Welche „!"-Marker der Overworld nach diesem Stand zeichnet (drawWorldObjects-Quelle).
function visibleTriggerIds(save: SaveGameV2, mapId: string = MAP_ID): string[] {
  return getVisibleMapEncounters(mapId, createWorldState(save))
    .filter((enc) => enc.kind === 'trigger')
    .map((enc) => enc.id);
}

function withPrologueCompleted(save: SaveGameV2): SaveGameV2 {
  return {
    ...save,
    flags: {
      ...save.flags,
      'story.slime.awakened': true,
      'story.storm-dragon.oath': true,
      'story.goblin.plea': true,
      'story.direwolf.defeated': true,
      'story.direwolf.pact': true,
      'story.slime-prologue.completed': true,
      'story.tempest.named': true,
      'faction.direwolves.respected': true,
      'mount.direwolf.seed': true,
      'progression.gobta.wolf-fang-token': true,
      'bond.rigurd.trust-prologue': true
    },
    quests: {
      ...save.quests,
      'slime-awakening': {
        status: 'completed',
        completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
      },
      'binding-of-ancestors': {
        status: 'active',
        completedStepIds: []
      }
    },
    inventory: {
      stacks: [
        ...save.inventory.stacks,
        { itemId: 'sealed-cave-crystal', quantity: 1 },
        { itemId: 'wolf-fang-token', quantity: 1 }
      ]
    }
  };
}

function saveAfterPrologue(): SaveGameV2 {
  return withPrologueCompleted(createNewSave());
}

describe('Act-1-Durchspielen (szenentreu)', () => {
  it('schließt „Bindung der Ahnen" über den echten Szenen-Fluss ab und füllt den Codex', () => {
    let save = saveAfterPrologue();

    // Hauptquest wurde vom Prologabschluss gestartet; Band 2 läuft sichtbar über Canon-Figuren.
    save = talk(save, 'rigurd-tempest', 'after-prologue'); // awakening + story.intro.seen
    save = talk(save, 'shuna', 'analyze');                 // story.vael.ready (Legacy-Flag), story.shuna.ready
    save = talk(save, 'gobta', 'briefing');                // story.gobta.ready
    save = talk(save, 'ranga-tempest', 'scout-route');     // story.lyrre.ready (Legacy-Flag), story.ranga.ready
    save = talk(save, 'rigurd-tempest', 'council');        // story.council.ready + gather-council
    // Nach dem Rat erscheint der Hain-Marker, der Schrein noch nicht.
    expect(visibleTriggerIds(save)).toContain('whispering-grove-ambush');
    expect(visibleTriggerIds(save)).not.toContain('shrine-approach');

    save = clearTriggerAt(save, { x: 14, y: 8 });  // Flüsterhain → clear-grove
    // Regressionsschutz: nach dem Hain-Sieg MUSS der Schrein-Marker auftauchen (sonst „stuck").
    expect(visibleTriggerIds(save)).toContain('shrine-approach');
    expect(visibleTriggerIds(save)).not.toContain('whispering-grove-ambush');

    save = clearTriggerAt(save, { x: 21, y: 13 }); // Schrein/Boss → defeat-mordrahn-echo
    expect(visibleTriggerIds(save).filter((id) => id === 'shrine-approach')).toHaveLength(0);

    save = talk(save, 'rigurd-tempest', 'report-act1'); // report-sora + complete-quest + Reward

    const quest = buildQuestLog(createWorldState(save)).find((q) => q.id === 'binding-of-ancestors')!;
    expect(quest.status).toBe('completed');
    expect(quest.steps.every((step) => step.completed)).toBe(true);

    // Codex muss sich entlang Act 1 füllen — die vier Act-1-Einträge sind entsperrt.
    const codex = buildCodexView(createWorldState(save));
    const unlocked = (id: string) => codex.find((entry) => entry.id === id)?.unlocked === true;
    for (const id of ['nameless-core', 'tempest-council', 'binding-of-ancestors', 'ancestor-seal-warning', 'mordrahn']) {
      expect(unlocked(id), `Act-1-Codex '${id}' blieb verschlossen`).toBe(true);
    }
  });

  it('schließt Act 2 „Grenzfeuer" über den echten Szenen-Fluss ab und füllt den Codex weiter', () => {
    // Act 1 als abgeschlossen voraussetzen (Act-2-Gate).
    let save: SaveGameV2 = {
      ...createNewSave(),
      flags: {
        'story.act1.completed': true,
        'story.direwolf.pact': true
      }
    };

    expect(npcHasQuestMarker(createWorldState(save), 'gobta')).toBe(true); // Gobta startet Act 2

    save = talk(save, 'gobta', 'muster');   // border-escalation aktiv + story.act2.started
    expect(visibleTriggerIds(save, 'spirit-marsh')).toContain('marsh-frontier-clash');
    expect(visibleTriggerIds(save, 'spirit-marsh')).not.toContain('border-rift-vanguard');

    save = clearTriggerAt(save, { x: 5, y: 11 }, 'spirit-marsh');
    save = talk(save, 'border-survivor', 'aid-survivors'); // nicht-tödliche Deeskalation
    save = talk(save, 'shuna', 'read-fracture');   // story.fracture.read
    expect(visibleTriggerIds(save, 'spirit-marsh')).toContain('border-rift-vanguard');

    save = clearTriggerAt(save, { x: 18, y: 4 }, 'spirit-marsh');
    save = talk(save, 'ranga-vanguard-trace', 'secure-trace');
    save = talk(save, 'gobta', 'report-act2');     // complete-quest + story.act2.completed

    const quest = buildQuestLog(createWorldState(save)).find((q) => q.id === 'border-escalation')!;
    expect(quest.status).toBe('completed');
    const incomplete = quest.steps.filter((step) => !step.completed).map((step) => step.id);
    expect(incomplete, `unfertige Schritte: ${incomplete.join(', ')}`).toHaveLength(0);

    const codex = buildCodexView(createWorldState(save));
    const unlocked = (id: string) => codex.find((entry) => entry.id === id)?.unlocked === true;
    expect(unlocked('border-fires')).toBe(true);
    expect(unlocked('border-deescalation')).toBe(true);
    expect(unlocked('second-fracture')).toBe(true);
    expect(unlocked('mordrahn-vanguard')).toBe(true);
  });

  function recruit(save: SaveGameV2, ...characterIds: readonly string[]): SaveGameV2 {
    const effects: WorldEffect[] = characterIds.map((characterId) => ({ type: 'recruit-character', characterId }));
    return applyWorldState(save, applyEffects(createWorldState(save), effects));
  }

  function bandFourReadySave(sharedLoadEligible: boolean): SaveGameV2 {
    const save: SaveGameV2 = {
      ...createNewSave(),
      flags: {
        'story.slime-prologue.completed': true,
        'story.act1.completed': true,
        'story.direwolf.pact': true,
        'story.act2.completed': true,
        ...(sharedLoadEligible
          ? { 'story.border.deescalated': true, 'story.vanguard.trace-read': true }
          : {})
      },
      quests: {
        'slime-awakening': {
          status: 'completed',
          completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
        },
        'binding-of-ancestors': {
          status: 'completed',
          completedStepIds: ['awakening', 'gather-council', 'clear-grove', 'defeat-mordrahn-echo', 'report-sora']
        },
        'border-escalation': {
          status: 'completed',
          completedStepIds: ['muster', 'border-clash', 'read-fracture', 'break-vanguard', 'report-act2']
        }
      }
    };
    return recruit(save, 'gobta', 'ranga');
  }

  // Band 4 bis zum Wahl-Dialog spielen (Bündnisrat → Durchbruch → Hüter).
  function act3UpToChoice(sharedLoadEligible: boolean): SaveGameV2 {
    let save = bandFourReadySave(sharedLoadEligible);
    save = talk(save, 'rigurd-established', 'rally'); // story.act3.started, aber noch kein Marsch
    expect(visibleTriggerIds(save)).not.toContain('alliance-breach');
    expect(getTrackedObjectiveStep(save)).toBe('rally');

    save = talk(save, 'shuna', 'alliance-shuna');
    save = talk(save, 'gobta', 'alliance-gobta');
    save = talk(save, 'ranga-tempest', 'alliance-ranga');
    save = talk(save, 'rigurd-established', 'complete-rally');
    expect(save.flags['story.alliance.council-ready']).toBe(true);
    expect(save.party.active.map((member) => member.characterId)).toContain('ranga');
    expect(visibleTriggerIds(save)).toContain('alliance-breach');

    save = clearTriggerAt(save, { x: 12, y: 7 }); // Bündnismarsch → breach
    save = clearTriggerAt(save, { x: 15, y: 2 }); // Bindungsherz → Hüter
    return save;
  }
  const getTrackedObjectiveStep = (save: SaveGameV2) =>
    buildQuestLog(createWorldState(save)).find((q) => q.id === 'ancestors-choice')
      ?.steps.find((step) => !step.completed)?.id ?? null;
  const codexUnlocked = (save: SaveGameV2, id: string) =>
    buildCodexView(createWorldState(save)).find((entry) => entry.id === id)?.unlocked === true;
  const expectEndingRoundtrip = (save: SaveGameV2, flag: 'ending.freedom' | 'ending.order' | 'ending.true') => {
    const roundtrip = importSave(exportSave(save), '2026-07-02T01:00:00.000Z');
    expect(roundtrip.flags[flag]).toBe(true);
    expect(roundtrip.quests['ancestors-choice']?.status).toBe('completed');
    expect(roundtrip.quests['ancestors-choice']?.completedStepIds).toEqual(['rally', 'breach', 'confront', 'choose']);
  };

  it('Band 4: startet erst freiwillig nach abgeschlossenem Band 3', () => {
    const afterBandTwo = bandFourReadySave(true);
    const beforeBandThree = {
      ...afterBandTwo,
      flags: { ...afterBandTwo.flags, 'story.act2.completed': false }
    };
    expect(startDialogForNpc(createWorldState(beforeBandThree), 'rigurd-established').choices.map((c) => c.id))
      .not.toContain('rally');

    const afterBandThree = bandFourReadySave(true);
    expect(startDialogForNpc(createWorldState(afterBandThree), 'rigurd-established').choices.map((c) => c.id))
      .toContain('rally');
    expect(afterBandThree.quests['ancestors-choice']).toBeUndefined();
  });

  it('Act 3: schließt mit Ende „Freiheit" ab (Bindung zerstören)', () => {
    let save = act3UpToChoice(false);
    expect(codexUnlocked(save, 'mordrahn-keeper')).toBe(true);
    expect(npcHasQuestMarker(createWorldState(save), 'rigurd-established')).toBe(true); // die Wahl steht an

    save = talk(save, 'rigurd-established', 'choose-destroy');
    const quest = buildQuestLog(createWorldState(save)).find((q) => q.id === 'ancestors-choice')!;
    expect(quest.status).toBe('completed');
    expect(quest.steps.every((step) => step.completed)).toBe(true);
    expect(createWorldState(save).flags['ending.freedom']).toBe(true);
    expect(codexUnlocked(save, 'ending-freedom')).toBe(true);
    expectEndingRoundtrip(save, 'ending.freedom');
  });

  it('Act 3: schließt mit Ende „Ordnung" ab (Bindung neu schmieden)', () => {
    let save = act3UpToChoice(false);
    save = talk(save, 'rigurd-established', 'choose-reforge');
    expect(buildQuestLog(createWorldState(save)).find((q) => q.id === 'ancestors-choice')!.status).toBe('completed');
    expect(createWorldState(save).flags['ending.order']).toBe(true);
    expect(codexUnlocked(save, 'ending-order')).toBe(true);
    expectEndingRoundtrip(save, 'ending.order');
  });

  it('leitet das aktive Ende für den Ende-Bildschirm korrekt ab', () => {
    const ending = (flags: Record<string, boolean>) =>
      getActiveEnding({ flags, quests: {}, inventory: [], gold: 0 });
    expect(ending({})).toBeNull();
    expect(ending({ 'ending.freedom': true })?.kind).toBe('freedom');
    expect(ending({ 'ending.order': true })?.kind).toBe('order');
    expect(ending({ 'ending.true': true })?.kind).toBe('true');
    // Priorität True > Ordnung > Freiheit, falls je mehrere gesetzt wären.
    expect(ending({ 'ending.order': true, 'ending.true': true })?.kind).toBe('true');
    // Titel/Text stammen aus dem passenden Codex-Eintrag.
    expect(ending({ 'ending.freedom': true })?.title).toBe('Ende: Freiheit');
  });

  it('Act 3: True-Ending nur mit belegten Band-3- und Bündnis-Bindungen', () => {
    // Ohne die belegten Grenz-/Spurbedingungen ist die Option nicht sichtbar.
    const noBonds = act3UpToChoice(false);
    expect(startDialogForNpc(createWorldState(noBonds), 'rigurd-established').choices.map((c) => c.id)).not.toContain('choose-true');

    // Mit Band-3-Deeskalation, Rangas Spur und geschlossenem Bündnisrat erscheint der dritte Weg.
    let save = act3UpToChoice(true);
    expect(startDialogForNpc(createWorldState(save), 'rigurd-established').choices.map((c) => c.id)).toContain('choose-true');
    save = talk(save, 'rigurd-established', 'choose-true');
    expect(createWorldState(save).flags['ending.true']).toBe(true);
    expect(codexUnlocked(save, 'ending-true')).toBe(true);
    expectEndingRoundtrip(save, 'ending.true');
  });

  it('Nebenquest: Rigurds Kopfgeld „Sumpfschrecken" ist annehm- und abschließbar', () => {
    // first-patrol als abgeschlossen voraussetzen (Gate fürs Kopfgeld).
    let save: SaveGameV2 = {
      ...createNewSave(),
      quests: { 'first-patrol': { status: 'completed', completedStepIds: ['accepted', 'training-cleared', 'reported'] } }
    };
    expect(npcHasQuestMarker(createWorldState(save), 'rigurd')).toBe(true); // Kopfgeld verfügbar

    save = talk(save, 'rigurd', 'accept-bog');     // bounty-bog aktiv + sidequest.bog.started
    expect(visibleTriggerIds(save)).toContain('west-bog-hunt');
    save = clearTriggerAt(save, { x: 2, y: 8 });   // Sumpfschrecken erlegt
    save = talk(save, 'rigurd', 'report-bog');     // Quest abgeschlossen + Belohnung

    expect(buildQuestLog(createWorldState(save)).find((q) => q.id === 'bounty-bog')!.status).toBe('completed');
    expect(buildCodexView(createWorldState(save)).find((e) => e.id === 'bestiary-bog-terror')?.unlocked).toBe(true);
  });

  it('Nebenquest: Shunas „Streunende Echos" ist annehm- und abschließbar', () => {
    let save: SaveGameV2 = { ...createNewSave(), flags: { 'story.act1.completed': true } };

    save = talk(save, 'shuna', 'accept-echo');     // relic-echoes aktiv + sidequest.echo.started
    expect(visibleTriggerIds(save)).toContain('north-rift-echo');
    save = clearTriggerAt(save, { x: 8, y: 2 });   // Echo gebannt
    save = talk(save, 'shuna', 'report-echo');     // Quest abgeschlossen + Belohnung

    expect(buildQuestLog(createWorldState(save)).find((q) => q.id === 'relic-echoes')!.status).toBe('completed');
    expect(buildCodexView(createWorldState(save)).find((e) => e.id === 'bestiary-stray-echo')?.unlocked).toBe(true);
  });

  it('Nebenquest: Gobtas „Grenzgänger" ist annehm- und abschließbar', () => {
    let save: SaveGameV2 = { ...createNewSave(), flags: { 'story.act1.completed': true } };
    save = talk(save, 'gobta', 'accept-deserter');
    expect(visibleTriggerIds(save)).toContain('east-route-deserter');
    save = clearTriggerAt(save, { x: 20, y: 6 });
    save = talk(save, 'gobta', 'report-deserter');
    expect(buildQuestLog(createWorldState(save)).find((q) => q.id === 'border-runner')!.status).toBe('completed');
    expect(buildCodexView(createWorldState(save)).find((e) => e.id === 'bestiary-human-deserter')?.unlocked).toBe(true);
  });

  it('Nebenquest (Postgame): Rigurds Apex-Kopfgeld „Urdirewolf" ist erst nach Act 3 verfügbar', () => {
    // Vor Act-3-Abschluss ist das Apex-Kopfgeld nicht sichtbar.
    const preGame = createNewSave();
    expect(startDialogForNpc(createWorldState(preGame), 'rigurd').choices.map((c) => c.id)).not.toContain('accept-apex');

    let save: SaveGameV2 = { ...createNewSave(), flags: { 'story.act3.completed': true } };
    expect(startDialogForNpc(createWorldState(save), 'rigurd').choices.map((c) => c.id)).toContain('accept-apex');
    save = talk(save, 'rigurd', 'accept-apex');
    expect(visibleTriggerIds(save)).toContain('south-hollow-apex');
    save = clearTriggerAt(save, { x: 13, y: 13 });
    save = talk(save, 'rigurd', 'report-apex');
    expect(buildQuestLog(createWorldState(save)).find((q) => q.id === 'apex-bounty')!.status).toBe('completed');
    expect(buildCodexView(createWorldState(save)).find((e) => e.id === 'bestiary-elder-direwolf')?.unlocked).toBe(true);
  });

  it('Regionsquest (Geistmoor): Eirs „Fäulnis im Moor" ist annehm- und abschließbar', () => {
    let save: SaveGameV2 = { ...createNewSave(), flags: { 'story.act1.completed': true } };
    expect(npcHasQuestMarker(createWorldState(save), 'eir')).toBe(true);

    save = talk(save, 'eir', 'accept-cleanse');
    expect(visibleTriggerIds(save, 'spirit-marsh')).toContain('marsh-blight');
    save = clearTriggerAt(save, { x: 12, y: 12 }, 'spirit-marsh');
    save = talk(save, 'eir', 'report-cleanse');

    expect(buildQuestLog(createWorldState(save)).find((q) => q.id === 'marsh-cleansing')!.status).toBe('completed');
    expect(buildCodexView(createWorldState(save)).find((e) => e.id === 'marsh-keeper')?.unlocked).toBe(true);
  });

  it('Regionsquest (Geisterschrein): Kaels „Wache am Schrein" ist annehm- und abschließbar', () => {
    let save: SaveGameV2 = { ...createNewSave(), flags: { 'story.act1.completed': true } };
    expect(npcHasQuestMarker(createWorldState(save), 'kael')).toBe(true);

    save = talk(save, 'kael', 'accept-vigil');
    expect(visibleTriggerIds(save, 'spirit-highlands')).toContain('shrine-windecho');
    save = clearTriggerAt(save, { x: 8, y: 4 }, 'spirit-highlands');
    save = talk(save, 'kael', 'report-vigil');

    expect(buildQuestLog(createWorldState(save)).find((q) => q.id === 'shrine-vigil')!.status).toBe('completed');
    expect(buildCodexView(createWorldState(save)).find((e) => e.id === 'shrine-watcher')?.unlocked).toBe(true);
  });

  it('Save-Kompatibilität: alter v1-Stand migriert und der Act-1-Bogen bleibt voll spielbar', () => {
    // Ein „alter" Spielstand aus der Zeit vor Talenten/Regionen/neuen Flags.
    let save: SaveGameV2 = migrate({
      schemaVersion: 1,
      createdAt: '2026-06-01T00:00:00.000Z',
      seed: 7,
      mapId: 'old-field',
      x: 3,
      y: 9,
      facing: 'left',
      gold: 50,
      activeParty: [{ id: 'rimuru', level: 3, xp: 240, learnedSkillIds: ['water-blade'] }],
      inventory: { 'healing-herb': 2 },
      flags: { introComplete: true }
    }, '2026-06-28T00:00:00.000Z');
    expect(save.schemaVersion).toBe(3);

    // Der komplette Act-1-Bogen ist auf dem migrierten Stand spielbar — kein Soft-Lock
    // durch fehlende neue Flags/Felder.
    save = withPrologueCompleted(save);
    save = talk(save, 'rigurd-tempest', 'after-prologue');
    save = talk(save, 'shuna', 'analyze');
    save = talk(save, 'gobta', 'briefing');
    save = talk(save, 'ranga-tempest', 'scout-route');
    save = talk(save, 'rigurd-tempest', 'council');
    save = clearTriggerAt(save, { x: 14, y: 8 });
    save = clearTriggerAt(save, { x: 21, y: 13 });
    save = talk(save, 'rigurd-tempest', 'report-act1');

    expect(buildQuestLog(createWorldState(save)).find((q) => q.id === 'binding-of-ancestors')!.status).toBe('completed');
    expect(codexUnlocked(save, 'nameless-core')).toBe(true);
    expect(createWorldState(save).flags['story.act1.completed']).toBe(true);
  });

  it('zeigt den Quest-Marker am jeweils richtigen NPC entlang der Story', () => {
    const marker = (save: SaveGameV2, npcId: string) => npcHasQuestMarker(createWorldState(save), npcId);
    let save = createNewSave();

    // Start: zuerst der Sturmdrache; Canon-Rat/Patrouille sind bis zum Prologabschluss nicht aktiv.
    expect(marker(save, 'sealed-storm-dragon')).toBe(true);
    expect(marker(save, 'rigurd-tempest')).toBe(false);
    expect(marker(save, 'shuna')).toBe(false);
    expect(marker(save, 'gobta')).toBe(false);
    expect(marker(save, 'ranga-tempest')).toBe(false);
    expect(marker(save, 'rigurd')).toBe(false);

    save = talk(save, 'sealed-storm-dragon', 'begin');
    expect(marker(save, 'sealed-storm-dragon')).toBe(true);
    save = talk(save, 'sealed-storm-dragon', 'oath');
    expect(marker(save, 'rigurd')).toBe(true);
    save = talk(save, 'rigurd', 'hear-goblin-plea');
    save = clearTriggerAt(save, { x: 9, y: 5 }, 'direwolf-den');
    // Nach dem Sieg schließt erst Rangas Pakt die Benennung auf; Rigurd hat solange keinen Marker.
    expect(marker(save, 'ranga')).toBe(true);
    expect(marker(save, 'rigurd')).toBe(false);
    save = talk(save, 'ranga', 'seal-pact');
    expect(marker(save, 'rigurd')).toBe(true);
    save = talk(save, 'rigurd', 'name-village');
    expect(marker(save, 'rigurd-tempest')).toBe(true);
    expect(marker(save, 'rigurd')).toBe(true); // post-Prolog-Patrouille ist jetzt sichtbar

    save = talk(save, 'rigurd-tempest', 'after-prologue'); // Quest aktiv + awakening
    // Jetzt sind Shuna und Gobta dran; Rigurd wartet auf den vollständigen Rat.
    expect(marker(save, 'shuna')).toBe(true);
    expect(marker(save, 'gobta')).toBe(true);
    expect(marker(save, 'ranga-tempest')).toBe(false);
    expect(marker(save, 'rigurd-tempest')).toBe(false);

    save = talk(save, 'shuna', 'analyze');
    save = talk(save, 'gobta', 'briefing');
    expect(marker(save, 'ranga-tempest')).toBe(true);
    save = talk(save, 'ranga-tempest', 'scout-route');
    // Shuna/Gobta/Ranga erledigt → kein Marker mehr; Rigurd wieder dran (Rat versammeln).
    expect(marker(save, 'shuna')).toBe(false);
    expect(marker(save, 'gobta')).toBe(false);
    expect(marker(save, 'ranga-tempest')).toBe(false);
    expect(marker(save, 'rigurd-tempest')).toBe(true);
  });

  it('hält NPCs, Shops, Gateways und Trigger-Encounter auf jeder Karte erreichbar', () => {
    const key = (x: number, y: number) => `${x},${y}`;
    const reachableSet = (map: TileMap): Set<string> => {
      const set = new Set<string>();
      const stack: Vec2[] = [map.spawn];
      while (stack.length) {
        const { x, y } = stack.pop()!;
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue;
        if (!isWalkable(map, x, y) || set.has(key(x, y))) continue;
        set.add(key(x, y));
        stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
      }
      return set;
    };
    // getAdjacent* nutzt Manhattan ≤ 1 → eine erreichbare Kachel in Reichweite genügt.
    const inReach = (set: Set<string>, pos: Vec2) => [...set].some((k) => {
      const [rx, ry] = k.split(',').map(Number);
      return Math.abs(rx! - pos.x) + Math.abs(ry! - pos.y) <= 1;
    });

    for (const mapId of Object.keys(MAPS)) {
      const reach = reachableSet(getMap(mapId));
      for (const npc of getMapNpcs(mapId)) {
        expect(inReach(reach, npc.position), `NPC '${npc.id}' auf '${mapId}' nicht erreichbar`).toBe(true);
      }
      for (const shop of getMapShops(mapId)) {
        expect(inReach(reach, shop.position), `Shop '${shop.id}' auf '${mapId}' nicht erreichbar`).toBe(true);
      }
      for (const loc of getMapLocations(mapId)) {
        if (loc.travelTo) {
          expect(inReach(reach, loc.position), `Gateway '${loc.id}' auf '${mapId}' nicht erreichbar`).toBe(true);
        }
      }
      for (const enc of getMapEncounters(mapId)) {
        if (enc.kind === 'trigger' && enc.position) {
          expect(reach.has(key(enc.position.x, enc.position.y)), `Trigger '${enc.id}' auf '${mapId}' nicht erreichbar`).toBe(true);
        }
      }
    }
  });

  it('Reise-Gateways zeigen auf gültige, begehbare Zielorte', () => {
    for (const mapId of Object.keys(MAPS)) {
      for (const loc of getMapLocations(mapId)) {
        if (!loc.travelTo) continue;
        const target = MAPS[loc.travelTo.mapId];
        expect(target, `Gateway '${loc.id}' → unbekannte Karte '${loc.travelTo.mapId}'`).toBeDefined();
        expect(
          isWalkable(target!, loc.travelTo.x, loc.travelTo.y),
          `Gateway '${loc.id}' → Zielposition (${loc.travelTo.x},${loc.travelTo.y}) nicht begehbar`
        ).toBe(true);
      }
    }
  });
});
