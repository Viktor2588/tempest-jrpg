import { describe, expect, it } from 'vitest';
import { DWARGON, getMap, getMapName, MAPS } from '../src/data/maps';
import { HEROES } from '../src/data/characters';
import { isWalkable } from '../src/systems/overworld';
import { createNewSave } from '../src/systems/save';
import {
  buildCodexView,
  buildQuestLog,
  chooseDialogOption,
  createWorldState,
  getMapShops,
  getTravelAtTile,
  type WorldState
} from '../src/systems/world';

function freshWorld(): WorldState {
  return createWorldState(createNewSave());
}

function withFlag(state: WorldState, flag: string): WorldState {
  return { ...state, flags: { ...state.flags, [flag]: true } };
}

describe('Dwargon-Arc (Phase 27)', () => {
  it('registriert die Dwargon-Karte mit sichtbarem Namen', () => {
    expect(MAPS.dwargon).toBe(DWARGON);
    expect(getMap('dwargon')).toBe(DWARGON);
    expect(getMapName('dwargon')).toBe('Dwargon');
  });

  it('hält Shops und NPCs auf begehbaren Kacheln', () => {
    const shops = getMapShops('dwargon');
    expect(shops.map((shop) => shop.id).sort()).toEqual(
      ['dwargon-apothecary', 'dwargon-smithy', 'dwargon-trader']
    );
    for (const shop of shops) {
      expect(isWalkable(DWARGON, shop.position.x, shop.position.y)).toBe(true);
    }
    // Beide Story-NPCs (Gazel im Thron, Kaijin an der Schmiede) stehen auf Boden.
    expect(isWalkable(DWARGON, 12, 3)).toBe(true);
    expect(isWalkable(DWARGON, 6, 9)).toBe(true);
    // Spawn + Rücktor sind begehbar.
    expect(isWalkable(DWARGON, DWARGON.spawn.x, DWARGON.spawn.y)).toBe(true);
    expect(isWalkable(DWARGON, 1, 7)).toBe(true);
  });

  it('öffnet das Dwargon-Tor erst nach der Kijin-Benennung', () => {
    const locked = freshWorld();
    expect(getTravelAtTile('tempest-start', { x: 22, y: 8 }, locked)).toBeUndefined();

    const open = withFlag(locked, 'story.kijin.named');
    const gate = getTravelAtTile('tempest-start', { x: 22, y: 8 }, open);
    expect(gate?.id).toBe('gate-to-dwargon');
    expect(gate?.travelTo?.mapId).toBe('dwargon');

    // Rückweg von Dwargon in den Jura-Wald ist immer offen.
    const back = getTravelAtTile('dwargon', { x: 1, y: 7 }, open);
    expect(back?.travelTo?.mapId).toBe('tempest-start');
  });

  it('führt Gazel-Urteil → Kaijin-Beitritt durch und gewährt die Belohnung', () => {
    let state = freshWorld();
    const startGold = state.gold;
    expect(state.roster?.includes('kaijin') ?? false).toBe(false);

    // Gazels Urteil: schaltet Schmiedekunst frei und erledigt die ersten Quest-Schritte.
    const judgment = chooseDialogOption(state, 'gazel-dwargo', 'start', 'plead');
    expect(judgment.ok).toBe(true);
    state = judgment.state.world;
    expect(state.flags['craft.smithing.unlocked']).toBe(true);
    expect(state.flags['story.dwargon.entered']).toBe(true);

    // Kaijin tritt bei → Roster, Gold-Belohnung, Quest abgeschlossen.
    const recruit = chooseDialogOption(state, 'kaijin-forge', 'start', 'recruit');
    expect(recruit.ok).toBe(true);
    state = recruit.state.world;
    expect(state.roster?.includes('kaijin')).toBe(true);
    expect(state.flags['faction.dwargon.allied']).toBe(true);
    expect(state.gold).toBe(startGold + 120);

    const quest = buildQuestLog(state).find((entry) => entry.id === 'dwargon-craft');
    expect(quest?.status).toBe('completed');

    // Wiederholung bleibt idempotent (kein zweiter Beitritt / keine zweite Belohnung).
    const goldAfter = state.gold;
    const repeat = chooseDialogOption(state, 'kaijin-forge', 'start', 'recruit');
    expect(repeat.ok).toBe(false);
    expect(state.gold).toBe(goldAfter);
  });

  it('schaltet die Dwargon-Codexeinträge über die Arc-Flags frei', () => {
    let state = withFlag(freshWorld(), 'story.dwargon.entered');
    state = withFlag(state, 'craft.smithing.unlocked');
    const codex = buildCodexView(state);
    const dwargon = codex.find((entry) => entry.id === 'dwargon');
    const gazel = codex.find((entry) => entry.id === 'gazel-dwargo');
    expect(dwargon?.unlocked).toBe(true);
    expect(gazel?.unlocked).toBe(true);
  });

  it('macht Kaijin zu einer rekrutierbaren Heldenfigur', () => {
    const kaijin = HEROES.find((hero) => hero.id === 'kaijin');
    expect(kaijin).toBeDefined();
    expect(kaijin?.startsInParty).toBe(false);
    expect(kaijin?.initialSkillIds.length).toBeGreaterThan(0);
  });
});
