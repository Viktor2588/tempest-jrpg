import { describe, expect, it } from 'vitest';
import { BLUMUND, getMap, getMapName, MAPS } from '../src/data/maps';
import { BLUMUND_FLOOR_TILE_TEXTURE_KEY, BLUMUND_WALL_TILE_TEXTURE_KEY, overworldTileTextureCandidates } from '../src/render/overworldTileArt';
import { isWalkable } from '../src/systems/overworld';
import { createNewSave } from '../src/systems/save';
import {
  buildCodexView,
  buildQuestLog,
  chooseDialogOption,
  createWorldState,
  getMapNpcs,
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

describe('Blumund & Free Guild (Phase 32)', () => {
  it('registriert die sichere Stadt mit eigenem Tile-Thema', () => {
    expect(MAPS.blumund).toBe(BLUMUND);
    expect(getMap('blumund')).toBe(BLUMUND);
    expect(getMapName('blumund')).toBe('Blumund');
    expect(overworldTileTextureCandidates('blumund', false)[0]).toBe(BLUMUND_FLOOR_TILE_TEXTURE_KEY);
    expect(overworldTileTextureCandidates('blumund', true)[0]).toBe(BLUMUND_WALL_TILE_TEXTURE_KEY);
  });

  it('hält Gate, NPCs und Shop auf begehbaren Kacheln', () => {
    expect(isWalkable(BLUMUND, BLUMUND.spawn.x, BLUMUND.spawn.y)).toBe(true);
    expect(isWalkable(BLUMUND, 1, 7)).toBe(true);
    for (const npc of getMapNpcs('blumund')) {
      expect(isWalkable(BLUMUND, npc.position.x, npc.position.y), npc.id).toBe(true);
    }
    for (const shop of getMapShops('blumund')) {
      expect(isWalkable(BLUMUND, shop.position.x, shop.position.y), shop.id).toBe(true);
    }
  });

  it('öffnet die Handelsstraße erst nach Gründung der Föderation', () => {
    const locked = freshWorld();
    expect(getTravelAtTile('tempest-start', { x: 1, y: 2 }, locked)).toBeUndefined();

    const open = withFlag(locked, 'faction.orcs.joined');
    const gate = getTravelAtTile('tempest-start', { x: 1, y: 2 }, open);
    expect(gate?.travelTo?.mapId).toBe('blumund');
    expect(getTravelAtTile('blumund', { x: 1, y: 7 }, open)?.travelTo?.mapId).toBe('tempest-start');
  });

  it('führt Anmeldung, Routenprüfung und Handelsabkommen idempotent durch', () => {
    let state = freshWorld();
    const startingGold = state.gold;

    const register = chooseDialogOption(state, 'fuze-blumund', 'start', 'register');
    expect(register.ok).toBe(true);
    state = register.state.world;
    expect(state.flags['story.blumund.entered']).toBe(true);
    expect(buildQuestLog(state).find((quest) => quest.id === 'blumund-guild')?.status).toBe('active');

    const compare = chooseDialogOption(state, 'blumund-adventurers', 'start', 'compare');
    expect(compare.ok).toBe(true);
    state = compare.state.world;
    expect(state.flags['story.blumund.guild-tested']).toBe(true);

    const seal = chooseDialogOption(state, 'fuze-blumund', 'start', 'seal-trade');
    expect(seal.ok).toBe(true);
    state = seal.state.world;
    expect(state.flags['faction.blumund.allied']).toBe(true);
    expect(state.flags['trade.blumund.unlocked']).toBe(true);
    expect(state.gold).toBe(startingGold + 180);
    expect(state.inventory.find((stack) => stack.itemId === 'full-potion')?.quantity).toBe(1);
    expect(buildQuestLog(state).find((quest) => quest.id === 'blumund-guild')?.status).toBe('completed');

    const repeat = chooseDialogOption(state, 'fuze-blumund', 'start', 'seal-trade');
    expect(repeat.ok).toBe(false);
    expect(state.gold).toBe(startingGold + 180);
  });

  it('schaltet beide Codexeinträge über die Questflags frei', () => {
    let state = withFlag(freshWorld(), 'story.blumund.entered');
    state = withFlag(state, 'story.blumund.guild-tested');
    const codex = buildCodexView(state);
    expect(codex.find((entry) => entry.id === 'blumund-free-guild')?.unlocked).toBe(true);
    expect(codex.find((entry) => entry.id === 'fuze-adventurers')?.unlocked).toBe(true);
  });

  it('gated die wertvollsten Handelswaren hinter dem Abkommen', () => {
    const shop = getMapShops('blumund')[0];
    expect(shop?.id).toBe('blumund-guild-supply');
    expect(shop?.itemIds).toContain('full-potion');
    expect(shop?.itemRequirements?.find((entry) => entry.itemId === 'full-potion')?.requirements)
      .toEqual([{ flag: 'trade.blumund.unlocked' }]);
  });
});
