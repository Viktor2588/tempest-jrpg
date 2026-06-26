import { describe, expect, it } from 'vitest';
import { validateGameData, GAME_DATA } from '../src/data';
import { getItemCount } from '../src/systems/inventory';
import { makeRng } from '../src/systems/rng';
import { createNewSave } from '../src/systems/save';
import {
  applyWorldState,
  buildShopView,
  buyItem,
  chooseDialogOption,
  getAdjacentNpc,
  getAdjacentShop,
  resolveEncounter,
  runMiniFlowSmoke,
  sellItem,
  startDialogForNpc,
  type WorldState
} from '../src/systems/world';

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
    const reportDialog = startDialogForNpc(encounter.state.world, 'rigurd');
    const completed = chooseDialogOption(encounter.state.world, reportDialog.dialogId, reportDialog.nodeId, 'report');

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
    const second = resolveEncounter(first.state.world, 'tempest-start', { x: 20, y: 12 }, makeRng(1));

    expect(first.state.encounter?.id).toBe('training-clearing');
    expect(first.state.world.flags['encounter.training-cleared']).toBe(true);
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
});
