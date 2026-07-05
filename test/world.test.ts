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
  buildDevourCompendium,
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
  getTravelAtTile,
  getMapLocations,
  canEnchantEquipment,
  getMapNpcs,
  getTrackedQuestObjective,
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

  it('macht Tempest nach dem Prolog als benannte Siedlung auf der Karte sichtbar', () => {
    const before = getMapLocations('tempest-start', emptyWorld()).map((location) => location.id);
    const after = getMapLocations('tempest-start', {
      flags: {
        'story.slime-prologue.completed': true,
        'story.tempest.named': true
      },
      quests: {},
      inventory: [],
      gold: 0
    }).map((location) => location.id);

    for (const id of ['tempest-council-plaza', 'tempest-name-stone', 'tempest-palisade']) {
      expect(before).not.toContain(id);
      expect(after).toContain(id);
    }
  });

  it('zeigt Tempests Wachstum nach Prolog, Rat und Band-2-Abschluss in drei Stufen', () => {
    const prologue = postPrologueWorld();
    const council: WorldState = {
      ...prologue,
      flags: { ...prologue.flags, 'story.council.ready': true }
    };
    const established: WorldState = {
      ...council,
      flags: { ...council.flags, 'story.act1.completed': true }
    };

    expect(getMapLocations('tempest-start', prologue).map((location) => location.id))
      .not.toContain('tempest-council-board');
    expect(getMapLocations('tempest-start', council).map((location) => location.id))
      .toContain('tempest-council-board');
    expect(getMapLocations('tempest-start', established).map((location) => location.id))
      .toContain('tempest-echo-ward');

    expect(getMapNpcs('tempest-start', prologue).find((npc) => npc.name === 'Rigurd')?.position)
      .toEqual({ x: 2, y: 4 });
    expect(getMapNpcs('tempest-start', council).find((npc) => npc.name === 'Rigurd')?.position)
      .toEqual({ x: 3, y: 6 });
    expect(getMapNpcs('tempest-start', established).find((npc) => npc.name === 'Rigurd')?.position)
      .toEqual({ x: 4, y: 7 });
  });

  it('macht Kijin- und Dwargon-Werkviertel samt Schmieden erst in der Jungstadt sichtbar', () => {
    const village = {
      ...postPrologueWorld(),
      flags: {
        ...postPrologueWorld().flags,
        'story.council.ready': true
      }
    };
    const city: WorldState = {
      ...village,
      flags: {
        ...village.flags,
        'story.kijin.named': true,
        'faction.dwargon.allied': true
      }
    };

    expect(getMapLocations('tempest-start', village).map((location) => location.id))
      .not.toContain('tempest-dwargon-quarter');
    expect(getMapLocations('tempest-start', city).map((location) => location.id))
      .toEqual(expect.arrayContaining(['tempest-kijin-quarter', 'tempest-dwargon-quarter']));
    expect(getMapNpcs('tempest-start', village).map((npc) => npc.id))
      .not.toContain('kaijin-tempest');
    expect(getMapNpcs('tempest-start', city).map((npc) => npc.id))
      .toEqual(expect.arrayContaining(['kurobe-tempest', 'kaijin-tempest']));
  });

  it('erweitert Tempests Händlerangebot nach Rat und Kijin-Benennung', () => {
    const baseItems = buildShopView(postPrologueWorld(), 'tempest-supply').items.map((item) => item.itemId);
    const councilItems = buildShopView({
      ...postPrologueWorld(),
      flags: { ...postPrologueWorld().flags, 'story.council.ready': true }
    }, 'tempest-supply').items.map((item) => item.itemId);
    const kijinItems = buildShopView({
      ...postPrologueWorld(),
      flags: { ...postPrologueWorld().flags, 'story.council.ready': true, 'story.kijin.named': true }
    }, 'tempest-supply').items.map((item) => item.itemId);

    expect(baseItems).not.toContain('tempest-charm');
    expect(councilItems).toContain('tempest-charm');
    expect(councilItems).not.toContain('kurobe-katana');
    expect(kijinItems).toContain('kurobe-katana');
  });

  it('schaltet das Tempest-Lager nach dem Prolog als sicheren Ruhepunkt frei', () => {
    const beforeLocations = getMapLocations('tempest-start', emptyWorld()).map((location) => location.id);
    const beforeNpcs = getMapNpcs('tempest-start', emptyWorld()).map((npc) => npc.id);
    const afterLocations = getMapLocations('tempest-start', postPrologueWorld()).map((location) => location.id);
    const afterNpcs = getMapNpcs('tempest-start', postPrologueWorld()).map((npc) => npc.id);

    expect(beforeLocations).not.toContain('tempest-rest-camp');
    expect(beforeNpcs).not.toContain('tempest-camp');
    expect(afterLocations).toContain('tempest-rest-camp');
    expect(afterNpcs).toContain('tempest-camp');
  });

  it('heilt am Tempest-Lager die aktive Party und persistiert die Ressourcen in den Save', () => {
    const fresh = createNewSave();
    const damaged = {
      ...fresh,
      flags: { 'story.slime-prologue.completed': true },
      party: {
        ...fresh.party,
        active: fresh.party.active.map((member) => ({ ...member, currentHp: 1, currentMp: 0 }))
      }
    };

    const rested = chooseDialogOption(createWorldState(damaged), 'tempest-rest', 'start', 'rest');
    const saved = applyWorldState(damaged, rested.state.world);

    expect(rested.ok).toBe(true);
    expect(saved.flags['rest.tempest.used']).toBe(true);
    expect(saved.party.active[0]!.currentHp).toBe(fresh.party.active[0]!.currentHp);
    expect(saved.party.active[0]!.currentMp).toBe(fresh.party.active[0]!.currentMp);
  });

  it('gated optionale Lagergespräche nach Story-Flags und blendet einmalige Gespräche aus', () => {
    const state: WorldState = {
      flags: {
        'story.slime-prologue.completed': true,
        'story.direwolf.pact': true,
        'story.council.ready': true,
        'story.grove.cleared': true,
        'story.boss.echo-defeated': true
      },
      quests: {},
      inventory: [],
      gold: 0
    };

    const choices = startDialogForNpc(state, 'tempest-camp').choices.map((choice) => choice.id);
    expect(choices).toEqual([
      'rest',
      'save',
      'talk-ranga-pact',
      'talk-council',
      'talk-grove',
      'talk-echo',
      'end'
    ]);

    const talked = chooseDialogOption(state, 'tempest-rest', 'start', 'talk-echo');
    expect(talked.ok).toBe(true);
    expect(talked.state.world.flags['partytalk.after-echo']).toBe(true);
    expect(talked.state.world.flags['bond.rigurd.echo-camp']).toBe(true);
    expect(startDialogForNpc(talked.state.world, 'tempest-camp').choices.map((choice) => choice.id))
      .not.toContain('talk-echo');
  });

  it('bietet am Lager einen expliziten, autosave-fähigen Sicherungspunkt', () => {
    const state = postPrologueWorld();
    const result = chooseDialogOption(state, 'tempest-rest', 'start', 'save');

    expect(result.ok).toBe(true);
    expect(result.state.world.flags['rest.tempest.saved']).toBe(true);
    expect(result.state.next?.speaker).toBe('Tempest-Lager');
  });

  it('reagiert im Band-2-Hub-Dialog auf die sichtbare Siedlungsstruktur', () => {
    const state: WorldState = {
      flags: { 'story.slime-prologue.completed': true },
      quests: { 'binding-of-ancestors': { status: 'active', completedStepIds: ['awakening'] } },
      inventory: [],
      gold: 0
    };

    const result = chooseDialogOption(state, 'rigurd-act1', 'start', 'state');
    expect(result.state.next?.text).toContain('Namensstein');
    expect(result.state.next?.text).toContain('Palisade');
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
    state = chooseDialogOption(state, 'rigurd-act1', 'start', 'after-prologue').state.world;

    const blocked = resolveEncounter(state, 'tempest-start', { x: 14, y: 8 }, makeRng(2));
    expect(blocked.state.encounter).toBeNull();

    state = chooseDialogOption(state, 'shuna-ritual', 'start', 'analyze').state.world;
    state = chooseDialogOption(state, 'gobta-border', 'start', 'briefing').state.world;
    state = chooseDialogOption(state, 'ranga-scout', 'start', 'scout-route').state.world;
    state = chooseDialogOption(state, 'rigurd-act1', 'start', 'council').state.world;

    const activeLocations = getMapLocations('tempest-start', state).map((location) => location.id);
    expect(activeLocations).toContain('whispering-grove');
    expect(activeLocations).not.toContain('ancestor-seal');
    const groveLocation = getMapLocations('tempest-start', state).find((location) => location.id === 'whispering-grove')!;
    expect(groveLocation.bounds).toEqual({ x: 13, y: 7, width: 4, height: 3 });

    const quest = buildQuestLog(state).find((entry) => entry.id === 'binding-of-ancestors')!;
    expect(quest.status).toBe('active');
    expect(quest.steps.find((step) => step.id === 'gather-council')?.completed).toBe(true);
    expect(quest.steps.find((step) => step.id === 'clear-grove')?.current).toBe(true);
    expect(buildCodexView(state).find((entry) => entry.id === 'tempest-council')?.unlocked).toBe(true);
    const tutorial = buildCodexView(state).find((entry) => entry.id === 'tutorial-grove-combat')!;
    expect(tutorial.unlocked).toBe(true);
    expect(tutorial.body).toContain('Status');
    expect(tutorial.body).toContain('Schwächen');
    expect(tutorial.body).toContain('Teamleiste');

    const grove = resolveEncounter(state, 'tempest-start', { x: 14, y: 8 }, makeRng(2));
    expect(grove.state.encounter?.id).toBe('whispering-grove-ambush');
    const enemyLevels = grove.state.encounter!.enemyIds.map((id) =>
      GAME_DATA.enemies.find((enemy) => enemy.id === id)!.level
    );
    expect(Math.max(...enemyLevels)).toBeLessThanOrEqual(4);
    expect(grove.state.encounter!.enemyIds).toEqual(['spore-moth', 'orc-scout']);
    const completed = completeEncounter(grove.state.world, grove.state.encounter!.id);
    const repeated = completeEncounter(completed.state, grove.state.encounter!.id);

    expect(completed.state.flags['story.grove.cleared']).toBe(true);
    expect(completed.state.flags['codex.ancestor-seal-warning']).toBe(true);
    expect(completed.state.flags['codex.tutorial-echo-boss']).toBe(true);
    expect(buildCodexView(completed.state).find((entry) => entry.id === 'ancestor-seal-warning')?.unlocked)
      .toBe(true);
    expect(buildCodexView(completed.state).find((entry) => entry.id === 'ancestor-seal-warning')?.newlyUnlocked)
      .toBe(true);
    const echoTutorial = buildCodexView(completed.state).find((entry) => entry.id === 'tutorial-echo-boss')!;
    expect(echoTutorial.unlocked).toBe(true);
    expect(echoTutorial.body).toContain('Magieeffekte');
    expect(echoTutorial.body).toContain('Teamzüge');
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
      'ranga-scout-travel',
      'gobta-rider-path',
      'first-tempest-naming',
      'storm-dragon-future-ally',
      'veldora-bond'
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

  it('macht die Gründerhilfe auch im Band-2-Tempest-Hub verfügbar', () => {
    const state: WorldState = {
      flags: {
        'story.slime-prologue.completed': true,
        'bond.rigurd.trust-prologue': true
      },
      quests: { 'binding-of-ancestors': { status: 'active', completedStepIds: [] } },
      inventory: [],
      gold: 120
    };
    const dialog = startDialogForNpc(state, 'rigurd-tempest');
    expect(dialog.choices.map((choice) => choice.id)).toContain('founder-supplies');

    const claimed = chooseDialogOption(state, dialog.dialogId, dialog.nodeId, 'founder-supplies');
    expect(claimed.ok).toBe(true);
    expect(claimed.state.world.flags['bond.rigurd.founder-supplies']).toBe(true);
    expect(getItemCount(claimed.state.world.inventory, 'healing-herb')).toBe(2);
    expect(getItemCount(claimed.state.world.inventory, 'mana-drop')).toBe(1);
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
    expect(world.flags['bond.rigurd.act1-met']).toBe(true);
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

  it('priorisiert aktive Hauptquests vor aktiven Nebenquests', () => {
    const state: WorldState = {
      flags: {},
      quests: {
        'first-patrol': { status: 'active', completedStepIds: [] },
        'binding-of-ancestors': { status: 'active', completedStepIds: [] }
      },
      inventory: [],
      gold: 0
    };

    expect(buildQuestLog(state)[0]!.id).toBe('binding-of-ancestors');
  });

  it('liefert ein getracktes Hauptziel aus dem aktuellen Quest-Schritt', () => {
    const state: WorldState = {
      flags: { 'story.slime-prologue.completed': true },
      quests: {
        'first-patrol': { status: 'active', completedStepIds: ['accepted'] },
        'binding-of-ancestors': { status: 'active', completedStepIds: ['awakening', 'gather-council'] }
      },
      inventory: [],
      gold: 0
    };

    const objective = getTrackedQuestObjective(state);
    expect(objective).toMatchObject({
      questId: 'binding-of-ancestors',
      stepId: 'clear-grove',
      locationId: 'whispering-grove',
      locationName: 'Flüsterhain',
      mapId: 'tempest-start',
      status: 'locked'
    });
    expect(objective?.hint).toContain('noch nicht markiert');
  });

  it('markiert das getrackte Ziel als sichtbar, sobald der Ort freigeschaltet oder gescoutet ist', () => {
    const base: WorldState = {
      flags: { 'story.slime-prologue.completed': true },
      quests: {
        'binding-of-ancestors': { status: 'active', completedStepIds: ['awakening', 'gather-council'] }
      },
      inventory: [],
      gold: 0
    };

    expect(getTrackedQuestObjective(base)?.status).toBe('locked');
    expect(getTrackedQuestObjective({ ...base, flags: { ...base.flags, 'scout.whispering-grove': true } }))
      .toMatchObject({
        locationId: 'whispering-grove',
        status: 'visible',
        position: { x: 14, y: 8 }
      });
    expect(getTrackedQuestObjective({ ...base, flags: { ...base.flags, 'story.council.ready': true } })?.status)
      .toBe('visible');
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

  it('öffnet den Pfad ins Geistmoor erst nach freiwilligem Start von „Grenzfeuer"', () => {
    const pos = { x: 1, y: 7 }; // direkt am gate-to-marsh
    const locked: WorldState = { flags: {}, quests: {}, inventory: [], gold: 0 };
    expect(getAdjacentTravel('tempest-start', pos, locked)).toBeUndefined();
    expect(getMapLocations('tempest-start', locked).some((l) => l.id === 'gate-to-marsh')).toBe(false);

    const open: WorldState = { ...locked, flags: { 'story.act2.started': true } };
    expect(getAdjacentTravel('tempest-start', pos, open)?.id).toBe('gate-to-marsh');
    // Ohne State (Reachability-Sicht) bleibt das Gateway sichtbar.
    expect(getAdjacentTravel('tempest-start', pos)?.id).toBe('gate-to-marsh');
  });

  it('reist nur, wenn man genau auf der Gateway-Kachel steht (nicht ein Feld davor)', () => {
    const open: WorldState = { flags: { 'story.act2.started': true }, quests: {}, inventory: [], gold: 0 };
    // gate-to-marsh liegt auf (1,7): exakt darauf → Übergang.
    expect(getTravelAtTile('tempest-start', { x: 1, y: 7 }, open)?.id).toBe('gate-to-marsh');
    // Direkt daneben (2,7): kein Übergang mehr — vorher hätte getAdjacentTravel ausgelöst.
    expect(getTravelAtTile('tempest-start', { x: 2, y: 7 }, open)).toBeUndefined();
    expect(getAdjacentTravel('tempest-start', { x: 2, y: 7 }, open)?.id).toBe('gate-to-marsh');
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
      .toEqual([
        'tutorial-grove-combat',
        'tutorial-echo-boss',
        'first-tempest-naming',
        'storm-dragon-future-ally',
        'nameless-core',
        'tempest-council',
        'binding-of-ancestors',
        'ancestor-seal-warning',
        'mordrahn'
      ]);
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

  it('legt weitere Story-Rekruten nach der aktiven Dreiergruppe in die Reserve', () => {
    const fresh = createNewSave();
    const recruited = applyWorldState(
      fresh,
      applyEffects(createWorldState(fresh), [
        { type: 'recruit-character', characterId: 'gobta' },
        { type: 'recruit-character', characterId: 'ranga' },
        { type: 'recruit-character', characterId: 'shuna' },
        { type: 'recruit-character', characterId: 'benimaru' }
      ])
    );

    expect(recruited.party.active.map((member) => member.characterId))
      .toEqual(['rimuru', 'gobta', 'ranga']);
    expect(recruited.party.reserve.map((member) => member.characterId))
      .toEqual(['shuna', 'benimaru']);
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

describe('Hauptpfad-Führung', () => {
  it('sortiert aktive Hauptquests vor Nebenquests und verfolgt sie im Zielmarker', () => {
    // border-runner (Nebenquest) ist im Datensatz VOR blumund-guild (Hauptquest)
    // definiert — ohne main-Flag würde die Nebenquest per Index zuerst kommen.
    const state: WorldState = {
      flags: {},
      quests: {
        'border-runner': { status: 'active', completedStepIds: [] },
        'blumund-guild': { status: 'active', completedStepIds: [] }
      },
      inventory: [],
      gold: 0
    };

    const active = buildQuestLog(state).filter((q) => q.status === 'active');
    expect(active[0]!.id).toBe('blumund-guild');
    expect(active.find((q) => q.id === 'blumund-guild')!.main).toBe(true);
    expect(active.find((q) => q.id === 'border-runner')!.main).toBe(false);

    // Der verfolgte Zielmarker greift dieselbe Hauptquest, nicht die Nebenquest.
    expect(getTrackedQuestObjective(state)?.questId).toBe('blumund-guild');
  });
});

describe('Verzaubern nur bei einem Schmied', () => {
  it('sperrt Verzaubern ohne Schmied und erlaubt es bei einem sichtbaren Schmied oder per Rimuru-Skill', () => {
    const noSmith = emptyWorld();
    // Dwargon-Schmied (Kaijin) erscheint erst nach freigeschalteter Schmiedekunst.
    const dwargonForge: WorldState = { ...noSmith, flags: { 'craft.smithing.unlocked': true } };

    expect(canEnchantEquipment(noSmith, 'dwargon')).toBe(false);
    expect(canEnchantEquipment(noSmith, 'tempest-start')).toBe(false);
    expect(canEnchantEquipment(dwargonForge, 'dwargon')).toBe(true);
    // Abseits jeder Schmiede bleibt es gesperrt …
    expect(canEnchantEquipment(dwargonForge, 'jura-forest')).toBe(false);
    // … außer Rimuru hat den Skill zum Verzaubern unterwegs gelernt.
    const mobile: WorldState = { ...noSmith, flags: { 'craft.mobileEnchant.unlocked': true } };
    expect(canEnchantEquipment(mobile, 'jura-forest')).toBe(true);
  });
});

describe('Phase 84 — Verschlingen-Kompendium', () => {
  it('listet jeden devourbaren Gegner mit gelehrtem Skill, nach Level sortiert', () => {
    const entries = buildDevourCompendium(createWorldState(createNewSave()));
    expect(entries.length).toBeGreaterThan(0);
    // Jeder Eintrag hat einen echten Skillnamen (nicht die rohe ID).
    for (const entry of entries) {
      expect(entry.skillName).not.toBe('');
      expect(entry.skillName).not.toBe(entry.skillId);
    }
    // Nach Level aufsteigend sortiert (Jagd-Progression).
    const levels = entries.map((entry) => entry.level);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });

  it('markiert gelernte Beute, sobald Rimuru den Skill kann', () => {
    const save = createNewSave();
    const target = buildDevourCompendium(createWorldState(save)).find((entry) => !entry.learned)!;
    expect(target).toBeDefined();
    // Rimuru lernt den Skill → der Eintrag gilt als erbeutet.
    const withSkill = {
      ...save,
      party: {
        ...save.party,
        active: save.party.active.map((member) =>
          member.characterId === 'rimuru'
            ? { ...member, learnedSkillIds: [...member.learnedSkillIds, target.skillId] }
            : member
        )
      }
    };
    const after = buildDevourCompendium(createWorldState(withSkill)).find((entry) => entry.enemyId === target.enemyId)!;
    expect(after.learned).toBe(true);
  });
});
