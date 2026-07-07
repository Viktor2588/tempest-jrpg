import { describe, expect, it } from 'vitest';
import { LIZARDMAN_MARSH, getMap, getMapName, MAPS } from '../src/data/maps';
import { isWalkable } from '../src/systems/overworld';
import { createNewSave } from '../src/systems/save';
import {
  buildCodexView,
  buildQuestLog,
  buildShopView,
  chooseDialogOption,
  completeEncounter,
  createWorldState,
  getTravelAtTile,
  type WorldState
} from '../src/systems/world';

function freshWorld(): WorldState {
  return createWorldState(createNewSave());
}

function withFlag(state: WorldState, flag: string): WorldState {
  return { ...state, flags: { ...state.flags, [flag]: true } };
}

describe('Echsenmenschen-Allianz (Phase 29)', () => {
  it('registriert den Echsen-Sumpf mit sichtbarem Namen', () => {
    expect(MAPS['lizardman-marsh']).toBe(LIZARDMAN_MARSH);
    expect(getMap('lizardman-marsh')).toBe(LIZARDMAN_MARSH);
    expect(getMapName('lizardman-marsh')).toBe('Echsen-Sumpf');
  });

  it('hält NPC, Encounter-Punkt und Tore auf begehbaren Kacheln', () => {
    const tiles: ReadonlyArray<readonly [number, number]> = [
      [4, 6], // Souka
      [13, 6], // Gabiru-Duell
      [1, 7], // Rücktor
      [LIZARDMAN_MARSH.spawn.x, LIZARDMAN_MARSH.spawn.y]
    ];
    for (const [x, y] of tiles) {
      expect(isWalkable(LIZARDMAN_MARSH, x, y)).toBe(true);
    }
  });

  it('öffnet das Sumpf-Tor erst nach dem Dwargon-Bündnis (Phase 106)', () => {
    const locked = freshWorld();
    expect(getTravelAtTile('tempest-start', { x: 22, y: 13 }, locked)).toBeUndefined();

    // Phase 106 — zweite Region der Kette: erst nach Dwargon, nicht mehr am Kijin-Beat.
    expect(getTravelAtTile('tempest-start', { x: 22, y: 13 }, withFlag(locked, 'faction.kijin.sworn'))).toBeUndefined();
    const open = withFlag(locked, 'faction.dwargon.allied');
    const gate = getTravelAtTile('tempest-start', { x: 22, y: 13 }, open);
    expect(gate?.id).toBe('gate-to-lizard-marsh');
    expect(gate?.travelTo?.mapId).toBe('lizardman-marsh');

    const back = getTravelAtTile('lizardman-marsh', { x: 1, y: 7 }, open);
    expect(back?.travelTo?.mapId).toBe('tempest-start');
  });

  it('spielt den Arc mit Respekt und sichtbarem Bündnisrabatt durch', () => {
    let state = freshWorld();
    const startGold = state.gold;
    const normalHerbPrice = buildShopView(state, 'marsh-trader')
      .items.find((item) => item.itemId === 'healing-herb')!.buyPrice;

    // 1) Soukas Warnung startet die Quest.
    const parley = chooseDialogOption(state, 'souka-alliance', 'start', 'parley');
    expect(parley.ok).toBe(true);
    state = parley.state.world;
    expect(state.flags['story.lizard.met']).toBe(true);

    // Das Bündnis lässt sich noch nicht besiegeln, solange Gabiru ungebrochen ist.
    expect(chooseDialogOption(state, 'souka-alliance', 'start', 'seal-respect').ok).toBe(false);
    expect(chooseDialogOption(state, 'souka-alliance', 'start', 'seal-humiliate').ok).toBe(false);

    // 2) Gabiru-Duell.
    state = completeEncounter(state, 'gabiru-duel').state;
    expect(state.flags['story.gabiru.humbled']).toBe(true);

    // 3) Bündnis besiegeln (Belohnung + Quest-Abschluss).
    const seal = chooseDialogOption(state, 'souka-alliance', 'start', 'seal-respect');
    expect(seal.ok).toBe(true);
    expect(seal.state.next?.nodeId).toBe('allied-respect');
    state = seal.state.world;
    expect(state.flags['story.lizard.allied']).toBe(true);
    expect(state.flags['choice.gabiru.respect']).toBe(true);
    expect(state.gold).toBe(startGold + 200);
    expect(buildShopView(state, 'marsh-trader')
      .items.find((item) => item.itemId === 'healing-herb')!.buyPrice).toBeLessThan(normalHerbPrice);
    expect(chooseDialogOption(state, 'souka-alliance', 'start', 'aftermath-respect').state.next?.nodeId)
      .toBe('respect-aftermath');

    const quest = buildQuestLog(state).find((entry) => entry.id === 'lizard-alliance');
    expect(quest?.status).toBe('completed');
    expect(quest?.steps.every((step) => step.completed)).toBe(true);
  });

  it('bewahrt nach öffentlicher Demütigung den anderen Echsen-Dialog ohne Bündnisrabatt', () => {
    let state = chooseDialogOption(freshWorld(), 'souka-alliance', 'start', 'parley').state.world;
    state = completeEncounter(state, 'gabiru-duel').state;
    const normalHerbPrice = buildShopView(state, 'marsh-trader')
      .items.find((item) => item.itemId === 'healing-herb')!.buyPrice;

    const seal = chooseDialogOption(state, 'souka-alliance', 'start', 'seal-humiliate');
    expect(seal.ok).toBe(true);
    expect(seal.state.next?.nodeId).toBe('allied-humiliate');
    state = seal.state.world;
    expect(state.flags['choice.gabiru.humiliate']).toBe(true);
    expect(buildShopView(state, 'marsh-trader')
      .items.find((item) => item.itemId === 'healing-herb')!.buyPrice).toBe(normalHerbPrice);
    expect(chooseDialogOption(state, 'souka-alliance', 'start', 'aftermath-humiliate').state.next?.nodeId)
      .toBe('humiliate-aftermath');
  });

  it('schaltet die Codexeinträge über die Arc-Flags frei', () => {
    let state = withFlag(freshWorld(), 'story.lizard.met');
    state = withFlag(state, 'story.lizard.allied');
    const codex = buildCodexView(state);
    for (const id of ['lizardfolk', 'lizard-pact']) {
      expect(codex.find((entry) => entry.id === id)?.unlocked).toBe(true);
    }
  });
});
