import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { getItemCount } from '../src/systems/inventory';
import { makeRng } from '../src/systems/rng';
import { createNewSave, exportSave, importSave } from '../src/systems/save';
import { createBattlePartyFromMembers } from '../src/systems/battle';
import {
  applyEffects,
  applyWorldState,
  buildCodexView,
  buildEndingGallery,
  buildQuestLog,
  createWorldState,
  buildShopView,
  buyItem,
  chooseDialogOption,
  completeEncounter,
  getAdjacentNpc,
  getAdjacentShop,
  getAdjacentTravel,
  getMapLocations,
  getMapNpcs,
  resolveEncounter,
  sellItem,
  startDialogForNpc,
  type WorldState
} from '../src/systems/world';
import { validateGameData } from './dataValidation';
import {
  runActOneStorySliceSmoke,
  runMiniFlowSmoke,
  runPrologueIntoActOneSmoke,
  runSlimePrologueSmoke
} from './worldSmoke';

function emptyWorld(): WorldState {
  return {
    flags: {},
    quests: {},
    inventory: [],
    gold: 120
  };
}

function postPrologueWorld(): WorldState {
  return {
    flags: { 'story.slime-prologue.completed': true },
    quests: {},
    inventory: [],
    gold: 120
  };
}

describe('world/dialog/shop/encounter system', () => {
  it('validiert Welt-Datenreferenzen zusammen mit den restlichen Game-Daten', () => {
    expect(validateGameData(GAME_DATA)).toEqual([]);
  });

  it('startet Rigurd-Dialog, setzt Quest und Bindungsflag', () => {
    const state = postPrologueWorld();
    const intro = startDialogForNpc(state, 'rigurd');
    const accepted = chooseDialogOption(state, intro.dialogId, intro.nodeId, 'accept');

    expect(accepted.ok).toBe(true);
    expect(accepted.state.world.quests['first-patrol']?.status).toBe('active');
    expect(accepted.state.world.flags['bond.rigurd.met']).toBe(true);
    expect(accepted.state.next?.nodeId).toBe('accepted');
  });

  it('gated die erste Patrouille bis nach dem Schleim-Prolog', () => {
    expect(startDialogForNpc(emptyWorld(), 'rigurd').choices.map((choice) => choice.id)).not.toContain('accept');
    expect(startDialogForNpc(postPrologueWorld(), 'rigurd').choices.map((choice) => choice.id)).toContain('accept');
  });

  it('schaltet Report-Dialog erst nach Trainingsbegegnung frei und vergibt Belohnung', () => {
    const accepted = chooseDialogOption(postPrologueWorld(), 'rigurd-intro', 'start', 'accept').state.world;
    const beforeEncounter = startDialogForNpc(accepted, 'rigurd');
    expect(beforeEncounter.choices.map((choice) => choice.id)).not.toContain('report');

    const encounter = resolveEncounter(accepted, 'tempest-start', { x: 20, y: 12 }, makeRng(1));
    expect(encounter.state.encounter?.id).toBe('training-clearing');
    const won = completeEncounter(encounter.state.world, encounter.state.encounter!.id);
    const reportDialog = startDialogForNpc(won.state, 'rigurd');
    const completed = chooseDialogOption(won.state, reportDialog.dialogId, reportDialog.nodeId, 'report');

    expect(reportDialog.choices.map((choice) => choice.id)).toContain('report');
    expect(completed.state.world.quests['first-patrol']?.status).toBe('completed');
    expect(completed.state.world.flags['bond.rigurd.trust-1']).toBe(true);
    expect(completed.state.world.gold).toBe(180);
    expect(getItemCount(completed.state.world.inventory, 'mana-drop')).toBe(1);
  });

  it('kauft und verkauft im Shop mit korrekten Preisen und Inventaränderungen', () => {
    const state = emptyWorld();
    const shop = buildShopView(state, 'tempest-supply');
    const herb = shop.items.find((item) => item.itemId === 'healing-herb')!;

    const bought = buyItem(state, 'tempest-supply', 'healing-herb', 2);
    expect(bought.ok).toBe(true);
    expect(bought.state.gold).toBe(120 - herb.buyPrice * 2);
    expect(getItemCount(bought.state.inventory, 'healing-herb')).toBe(2);

    const sold = sellItem(bought.state, 'tempest-supply', 'healing-herb', 1);
    expect(sold.ok).toBe(true);
    expect(sold.state.gold).toBe(120 - herb.buyPrice * 2 + herb.sellPrice);
    expect(getItemCount(sold.state.inventory, 'healing-herb')).toBe(1);
  });

  it('findet benachbarte NPCs und Shops für Interaktion', () => {
    expect(getAdjacentNpc('goblin-village', { x: 8, y: 6 })?.id).toBe('rigurd');
    expect(getAdjacentShop('goblin-village', { x: 10, y: 7 })?.id).toBe('goblin-hearth');
    expect(getAdjacentShop('tempest-start', { x: 5, y: 4 })?.id).toBe('tempest-supply');
    expect(getAdjacentNpc('tempest-start', { x: 10, y: 10 })).toBeUndefined();
  });

  it('löst Trigger-Encounter genau einmal aus und setzt Flags', () => {
    const first = resolveEncounter(emptyWorld(), 'tempest-start', { x: 20, y: 12 }, makeRng(1));
    const completed = completeEncounter(first.state.world, first.state.encounter!.id);
    const second = resolveEncounter(completed.state, 'tempest-start', { x: 20, y: 12 }, makeRng(1));

    expect(first.state.encounter?.id).toBe('training-clearing');
    expect(first.state.world.flags['encounter.training-cleared']).toBeUndefined();
    expect(completed.state.flags['encounter.training-cleared']).toBe(true);
    expect(completed.state.flags['encounter.training-clearing.cleared']).toBe(true);
    expect(second.state.encounter).toBeNull();
  });

  it('deckt den Mini-Flow Stadt → NPC/Quest → Shop → Begegnung → Belohnung → Speichern headless ab', () => {
    const world = runMiniFlowSmoke(makeRng(4));
    const save = applyWorldState(createNewSave({ now: '2026-06-27T00:00:00.000Z', seed: 4 }), world);

    expect(world.quests['first-patrol']?.status).toBe('completed');
    expect(world.flags['bond.rigurd.trust-1']).toBe(true);
    expect(getItemCount(world.inventory, 'healing-herb')).toBe(1);
    expect(getItemCount(world.inventory, 'mana-drop')).toBe(1);
    expect(save.party.gold).toBe(world.gold);
    expect(save.inventory.stacks).toEqual(world.inventory);
  });

  it('gated den Story-Dungeon über Rat-Flags und führt Questlog/Lore mit', () => {
    let state: WorldState = {
      flags: { 'story.slime-prologue.completed': true },
      quests: { 'binding-of-ancestors': { status: 'active', completedStepIds: [] } },
      inventory: [],
      gold: 120
    };
    state = chooseDialogOption(state, 'sora-act1', 'start', 'after-prologue').state.world;

    const blocked = resolveEncounter(state, 'tempest-start', { x: 14, y: 8 }, makeRng(2));
    expect(blocked.state.encounter).toBeNull();

    state = chooseDialogOption(state, 'vael-council', 'start', 'analyze').state.world;
    state = chooseDialogOption(state, 'lyrre-border', 'start', 'briefing').state.world;
    state = chooseDialogOption(state, 'sora-act1', 'start', 'council').state.world;

    const activeLocations = getMapLocations('tempest-start', state).map((location) => location.id);
    expect(activeLocations).toContain('whispering-grove');
    expect(activeLocations).not.toContain('ancestor-seal');

    const quest = buildQuestLog(state).find((entry) => entry.id === 'binding-of-ancestors')!;
    expect(quest.status).toBe('active');
    expect(quest.steps.find((step) => step.id === 'gather-council')?.completed).toBe(true);
    expect(quest.steps.find((step) => step.id === 'clear-grove')?.current).toBe(true);
    expect(buildCodexView(state).find((entry) => entry.id === 'tempest-council')?.unlocked).toBe(true);

    const grove = resolveEncounter(state, 'tempest-start', { x: 14, y: 8 }, makeRng(2));
    expect(grove.state.encounter?.id).toBe('whispering-grove-ambush');
    const completed = completeEncounter(grove.state.world, grove.state.encounter!.id);
    const repeated = completeEncounter(completed.state, grove.state.encounter!.id);

    expect(completed.state.flags['story.grove.cleared']).toBe(true);
    expect(getItemCount(completed.state.inventory, 'ancestor-seal-fragment')).toBe(1);
    expect(repeated.state).toEqual(completed.state);
    expect(getMapLocations('tempest-start', completed.state).map((location) => location.id)).toContain('ancestor-seal');
  });

  it('spielt den Schleim-Prolog Höhle → Goblindorf → Direwolf → Benennung headless durch', () => {
    const world = runSlimePrologueSmoke(makeRng(6));
    const quest = buildQuestLog(world).find((entry) => entry.id === 'slime-awakening')!;
    const unlockedLore = buildCodexView(world).filter((entry) => entry.unlocked).map((entry) => entry.id);

    expect(quest.status).toBe('completed');
    expect(quest.steps.every((step) => step.completed)).toBe(true);
    expect(world.flags['story.slime.awakened']).toBe(true);
    expect(world.flags['story.storm-dragon.oath']).toBe(true);
    expect(world.flags['story.goblin.plea']).toBe(true);
    expect(world.flags['story.direwolf.defeated']).toBe(true);
    expect(world.flags['story.slime-prologue.completed']).toBe(true);
    expect(world.flags['faction.direwolves.respected']).toBe(true);
    expect(world.flags['mount.direwolf.seed']).toBe(true);
    expect(world.flags['progression.gobta.wolf-fang-token']).toBe(true);
    expect(world.quests['binding-of-ancestors']?.status).toBe('active');
    expect(world.quests['binding-of-ancestors']?.completedStepIds).toEqual([]);
    expect(world.gold).toBe(220);
    expect(getItemCount(world.inventory, 'sealed-cave-crystal')).toBe(1);
    expect(getItemCount(world.inventory, 'wolf-fang-token')).toBe(1);
    expect(getItemCount(world.inventory, 'healing-herb')).toBe(1);
    expect(unlockedLore).toEqual([
      'slime-awakening',
      'tutorial-movement-questlog',
      'sealed-storm-dragon',
      'tutorial-codex-oath',
      'goblin-village',
      'tutorial-direwolf-boss',
      'direwolf-pact',
      'direwolf-faction',
      'direwolf-mount-seed',
      'gobta-rider-path',
      'first-tempest-naming',
      'storm-dragon-future-ally'
    ]);
  });

  it('macht Rigurds Prologvertrauen als einmalige Gründerhilfe nutzbar', () => {
    const prologue = runSlimePrologueSmoke(makeRng(7));
    const dialog = startDialogForNpc(prologue, 'rigurd');
    expect(dialog.choices.map((choice) => choice.id)).toContain('founder-supplies');

    const claimed = chooseDialogOption(prologue, dialog.dialogId, dialog.nodeId, 'founder-supplies');
    expect(claimed.ok).toBe(true);
    expect(claimed.state.world.flags['bond.rigurd.founder-supplies']).toBe(true);
    expect(getItemCount(claimed.state.world.inventory, 'healing-herb')).toBe(3);
    expect(getItemCount(claimed.state.world.inventory, 'mana-drop')).toBe(1);
    expect(startDialogForNpc(claimed.state.world, 'rigurd').choices.map((choice) => choice.id))
      .not.toContain('founder-supplies');
  });

  it('führt vom Prologabschluss direkt in Act 1 weiter', () => {
    const world = runPrologueIntoActOneSmoke(makeRng(9));
    const prologue = buildQuestLog(world).find((entry) => entry.id === 'slime-awakening')!;
    const actOne = buildQuestLog(world).find((entry) => entry.id === 'binding-of-ancestors')!;

    expect(prologue.status).toBe('completed');
    expect(actOne.status).toBe('completed');
    expect(actOne.steps.every((step) => step.completed)).toBe(true);
    expect(world.flags['story.slime-prologue.completed']).toBe(true);
    expect(world.flags['story.act1.completed']).toBe(true);
    expect(world.flags['story.intro.seen']).toBe(true);
    expect(world.flags['bond.sora.met']).toBe(true);
  });

  it('priorisiert aktive Quests im Quest-Log vor abgeschlossenen und unentdeckten', () => {
    // Späte Quest aktiv, frühe Quest abgeschlossen → der Sort muss umordnen, nicht die QUESTS-Reihenfolge spiegeln.
    const state: WorldState = {
      flags: {},
      quests: {
        'first-patrol': { status: 'completed', completedStepIds: [] },
        'shrine-vigil': { status: 'active', completedStepIds: [] }
      },
      inventory: [],
      gold: 0
    };
    const statuses = buildQuestLog(state).map((quest) => quest.status);
    expect(buildQuestLog(state)[0]!.id).toBe('shrine-vigil');
    expect(statuses.indexOf('active')).toBeLessThan(statuses.indexOf('completed'));
    expect(statuses.indexOf('completed')).toBeLessThan(statuses.indexOf('inactive'));
  });

  it('verdeckt ungesehene Enden in der Galerie und enthüllt erreichte', () => {
    const gallery = buildEndingGallery(['true']);
    const trueEnding = gallery.find((entry) => entry.kind === 'true')!;
    const hidden = gallery.filter((entry) => entry.kind !== 'true');

    expect(gallery).toHaveLength(3);
    expect(trueEnding).toMatchObject({
      title: 'Wahres Ende: Geteilte Last',
      seen: true
    });
    expect(trueEnding.body).not.toBeNull();
    expect(hidden.every((entry) =>
      !entry.seen
      && entry.title === '??? — noch nicht erreicht'
      && entry.body === null
    )).toBe(true);
  });

  it('lässt Zufallsmonster bei großem Levelvorsprung ausweichen', () => {
    const base: WorldState = { flags: {}, quests: {}, inventory: [], gold: 0 };
    const always = () => 0; // immer < chance → würde normalerweise auslösen
    const pos = { x: 15, y: 7 }; // im east-grass-Bereich (forest-slime, Lvl 1)

    // 5 Stufen Vorsprung → Monster weichen aus, keine Begegnung trotz garantiertem Roll.
    expect(resolveEncounter({ ...base, partyLevel: 6 }, 'tempest-start', pos, always).state.encounter).toBeNull();
    // Gleichlevelig → Begegnung wie gehabt.
    expect(resolveEncounter({ ...base, partyLevel: 1 }, 'tempest-start', pos, always).state.encounter?.id).toBe('east-grass');
  });

  it('öffnet den Pfad ins Geistmoor erst nach Abschluss von „Grenzfeuer"', () => {
    const pos = { x: 1, y: 7 }; // direkt am gate-to-marsh
    const locked: WorldState = { flags: {}, quests: {}, inventory: [], gold: 0 };
    expect(getAdjacentTravel('tempest-start', pos, locked)).toBeUndefined();
    expect(getMapLocations('tempest-start', locked).some((l) => l.id === 'gate-to-marsh')).toBe(false);

    const open: WorldState = { ...locked, flags: { 'story.act2.completed': true } };
    expect(getAdjacentTravel('tempest-start', pos, open)?.id).toBe('gate-to-marsh');
    // Ohne State (Reachability-Sicht) bleibt das Gateway sichtbar.
    expect(getAdjacentTravel('tempest-start', pos)?.id).toBe('gate-to-marsh');
  });

  it('spielt den Act-1-Story-Slice Intro → Stadt → Quest → Dungeon → Boss → Belohnung headless durch und persistiert ihn', () => {
    const world = runActOneStorySliceSmoke(makeRng(8));
    const quest = buildQuestLog(world).find((entry) => entry.id === 'binding-of-ancestors')!;
    const save = applyWorldState(createNewSave({ now: '2026-06-27T00:00:00.000Z', seed: 8 }), world);
    const roundtrip = importSave(exportSave(save), '2026-06-27T01:00:00.000Z');
    const persistedWorld = {
      flags: roundtrip.flags,
      quests: roundtrip.quests,
      inventory: roundtrip.inventory.stacks,
      gold: roundtrip.party.gold
    };

    expect(quest.status).toBe('completed');
    expect(quest.steps.every((step) => step.completed)).toBe(true);
    expect(world.flags['story.act1.completed']).toBe(true);
    expect(world.flags['story.boss.echo-defeated']).toBe(true);
    expect(world.gold).toBe(300);
    expect(getItemCount(world.inventory, 'ancestor-seal-fragment')).toBe(1);
    expect(getItemCount(world.inventory, 'tempest-charm')).toBe(1);
    expect(buildCodexView(world).filter((entry) => entry.unlocked).map((entry) => entry.id))
      .toEqual(['first-tempest-naming', 'storm-dragon-future-ally', 'nameless-core', 'tempest-council', 'binding-of-ancestors', 'mordrahn']);
    expect(persistedWorld.quests['binding-of-ancestors']?.status).toBe('completed');
    expect(persistedWorld.flags['story.act1.completed']).toBe(true);
    expect(getItemCount(persistedWorld.inventory, 'tempest-charm')).toBe(1);
  });
});

describe('Story-Rekrutierung (recruit-character)', () => {
  it('nimmt eine Figur idempotent in den Roster auf', () => {
    const world = createWorldState(createNewSave());
    const once = applyEffects(world, [{ type: 'recruit-character', characterId: 'ranga' }]);
    const twice = applyEffects(once, [{ type: 'recruit-character', characterId: 'ranga' }]);

    expect(once.roster).toContain('ranga');
    expect(twice.roster!.filter((id) => id === 'ranga')).toHaveLength(1);
  });

  it('rekrutiert eine bereits vorhandene Figur nicht doppelt', () => {
    const world = createWorldState(createNewSave());
    const result = applyEffects(world, [{ type: 'recruit-character', characterId: 'rimuru' }]);
    expect(result.roster!.filter((id) => id === 'rimuru')).toHaveLength(1);
  });

  it('persistiert Rekrutierte voll geheilt in die aktive Party und lässt Bestehende unberührt', () => {
    const save = createNewSave();
    const before = save.party.active.map((member) => member.characterId);
    const world = applyEffects(createWorldState(save), [{ type: 'recruit-character', characterId: 'ranga' }]);
    const next = applyWorldState(save, world);

    expect(next.party.active.map((member) => member.characterId)).toEqual([...before, 'ranga']);
    const ranga = next.party.active.find((member) => member.characterId === 'ranga')!;
    expect(ranga.currentHp).toBeGreaterThan(0);
  });

  it('überlebt einen Export/Import-Roundtrip', () => {
    const save = createNewSave();
    const world = applyEffects(createWorldState(save), [{ type: 'recruit-character', characterId: 'ranga' }]);
    const roundtrip = importSave(exportSave(applyWorldState(save, world)));
    expect(roundtrip.party.active.map((member) => member.characterId)).toContain('ranga');
  });

  it('rekrutiert Gobta über die Goblin-Bitte und Ranga über den Direwolf-Sieg (Canon-Prolog)', () => {
    const state: WorldState = {
      flags: { 'story.storm-dragon.oath': true },
      quests: { 'slime-awakening': { status: 'active', completedStepIds: [] } },
      inventory: [],
      gold: 0,
      roster: ['rimuru']
    };

    const afterPlea = chooseDialogOption(state, 'rigurd-intro', 'start', 'hear-goblin-plea');
    expect(afterPlea.ok).toBe(true);
    expect(afterPlea.state.world.roster).toContain('gobta');

    // Direwolf-Sieg unterwirft das Rudel (setzt story.direwolf.defeated), rekrutiert aber noch nicht.
    const afterDirewolf = completeEncounter(afterPlea.state.world, 'direwolf-pack-leader');
    expect(afterDirewolf.state.roster).not.toContain('ranga');
    expect(afterDirewolf.state.flags['story.direwolf.defeated']).toBe(true);

    // Erst Rangas Pakt-Dialog rekrutiert ihn und setzt story.direwolf.pact.
    const afterPact = chooseDialogOption(afterDirewolf.state, 'ranga-pact', 'start', 'seal-pact');
    expect(afterPact.ok).toBe(true);
    expect(afterPact.state.world.roster).toContain('ranga');
    expect(afterPact.state.world.flags['story.direwolf.pact']).toBe(true);
  });

  it('Canon-Partyfolge: Rimuru → +Gobta → +Ranga, Ranga sofort kampftauglich', () => {
    const fresh = createNewSave();
    expect(fresh.party.active.map((member) => member.characterId)).toEqual(['rimuru']);

    const afterGobta = applyWorldState(
      fresh,
      applyEffects(createWorldState(fresh), [{ type: 'recruit-character', characterId: 'gobta' }])
    );
    expect(afterGobta.party.active.map((member) => member.characterId)).toEqual(['rimuru', 'gobta']);

    const afterRanga = applyWorldState(
      afterGobta,
      applyEffects(createWorldState(afterGobta), [{ type: 'recruit-character', characterId: 'ranga' }])
    );
    expect(afterRanga.party.active.map((member) => member.characterId)).toEqual(['rimuru', 'gobta', 'ranga']);

    // Alle drei (inkl. Ranga) sind am Rekrutierungszeitpunkt als Kampfeinheiten verwendbar.
    expect(createBattlePartyFromMembers(afterRanga.party.active)).toHaveLength(3);
  });
});

describe('Canon-Benennung (Band 1)', () => {
  it('zeigt den Sturmdrachen sichtbar als „Veldora"', () => {
    const view = startDialogForNpc(emptyWorld(), 'sealed-storm-dragon');
    expect(view.speaker).toBe('Veldora');
    expect(buildCodexView(emptyWorld()).find((entry) => entry.id === 'sealed-storm-dragon')?.title).toBe('Veldora, der Sturmdrache');
  });
});

describe('Datengetriebene NPC-Sichtbarkeit', () => {
  it('blendet den Ranga-NPC bis zum Direwolf-Sieg aus', () => {
    const before = emptyWorld();
    const after: WorldState = { ...before, flags: { 'story.direwolf.defeated': true } };

    expect(getMapNpcs('direwolf-den', before).some((npc) => npc.id === 'ranga')).toBe(false);
    expect(getMapNpcs('direwolf-den', after).some((npc) => npc.id === 'ranga')).toBe(true);
    // Ohne State (Reachability-Sicht) bleibt der NPC sichtbar.
    expect(getMapNpcs('direwolf-den').some((npc) => npc.id === 'ranga')).toBe(true);

    // Interaktion respektiert die Sichtbarkeit.
    expect(getAdjacentNpc('direwolf-den', { x: 10, y: 5 }, before)).toBeUndefined();
    expect(getAdjacentNpc('direwolf-den', { x: 10, y: 5 }, after)?.id).toBe('ranga');
  });
});
