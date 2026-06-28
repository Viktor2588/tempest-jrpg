import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { getItemCount } from '../src/systems/inventory';
import { makeRng } from '../src/systems/rng';
import { createNewSave, exportSave, importSave } from '../src/systems/save';
import {
  applyWorldState,
  buildCodexView,
  buildEndingGallery,
  buildQuestLog,
  buildShopView,
  buyItem,
  chooseDialogOption,
  completeEncounter,
  getAdjacentNpc,
  getAdjacentShop,
  getAdjacentTravel,
  getMapLocations,
  resolveEncounter,
  sellItem,
  startDialogForNpc,
  type WorldState
} from '../src/systems/world';
import { validateGameData } from './dataValidation';
import { runActOneStorySliceSmoke, runMiniFlowSmoke } from './worldSmoke';

function emptyWorld(): WorldState {
  return {
    flags: {},
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
    const state = emptyWorld();
    const intro = startDialogForNpc(state, 'rigurd');
    const accepted = chooseDialogOption(state, intro.dialogId, intro.nodeId, 'accept');

    expect(accepted.ok).toBe(true);
    expect(accepted.state.world.quests['first-patrol']?.status).toBe('active');
    expect(accepted.state.world.flags['bond.rigurd.met']).toBe(true);
    expect(accepted.state.next?.nodeId).toBe('accepted');
  });

  it('schaltet Report-Dialog erst nach Trainingsbegegnung frei und vergibt Belohnung', () => {
    const accepted = chooseDialogOption(emptyWorld(), 'rigurd-intro', 'start', 'accept').state.world;
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
    expect(getAdjacentNpc('tempest-start', { x: 2, y: 3 })?.id).toBe('rigurd');
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
    let state = chooseDialogOption(emptyWorld(), 'sora-act1', 'start', 'begin').state.world;

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
      .toEqual(['nameless-core', 'tempest-council', 'binding-of-ancestors', 'mordrahn']);
    expect(persistedWorld.quests['binding-of-ancestors']?.status).toBe('completed');
    expect(persistedWorld.flags['story.act1.completed']).toBe(true);
    expect(getItemCount(persistedWorld.inventory, 'tempest-charm')).toBe(1);
  });
});
