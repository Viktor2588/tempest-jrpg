import { describe, expect, it } from 'vitest';
import { JURA_BATTLEFIELD, getMap, getMapName, MAPS } from '../src/data/maps';
import { isWalkable } from '../src/systems/overworld';
import { createNewSave } from '../src/systems/save';
import {
  buildCodexView,
  buildQuestLog,
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

describe('Orc-Disaster-Arc (Phase 28)', () => {
  it('registriert das Jura-Schlachtfeld mit sichtbarem Namen', () => {
    expect(MAPS['jura-battlefield']).toBe(JURA_BATTLEFIELD);
    expect(getMap('jura-battlefield')).toBe(JURA_BATTLEFIELD);
    expect(getMapName('jura-battlefield')).toBe('Jura-Schlachtfeld');
  });

  it('hält NPCs, Encounter-Punkte und Tore auf begehbaren Kacheln', () => {
    const tiles: ReadonlyArray<readonly [number, number]> = [
      [4, 7], // Treyni
      [12, 4], // Föderations-Rigurd
      [18, 6], // Milim
      [9, 7], // Ork-Vorhut
      [15, 6], // Geld-Boss
      [1, 7], // Rücktor
      [JURA_BATTLEFIELD.spawn.x, JURA_BATTLEFIELD.spawn.y]
    ];
    for (const [x, y] of tiles) {
      expect(isWalkable(JURA_BATTLEFIELD, x, y)).toBe(true);
    }
  });

  it('öffnet das Heerfeld-Tor erst nach dem besiegelten Echsen-Bündnis (Phase 106)', () => {
    const locked = freshWorld();
    expect(getTravelAtTile('tempest-start', { x: 22, y: 2 }, locked)).toBeUndefined();

    // Phase 106 — der Kijin-Schwur allein reicht NICHT mehr: erst das besiegelte
    // Echsen-Bündnis (Kette Dwargon → Echsen → Geld) öffnet das Heerfeld, damit der
    // High-Level-Orc-Disaster nicht direkt nach dem Kijin-Beat erreichbar ist.
    const kijinOnly = withFlag(locked, 'faction.kijin.sworn');
    expect(getTravelAtTile('tempest-start', { x: 22, y: 2 }, kijinOnly)).toBeUndefined();

    const open = withFlag(locked, 'story.lizard.allied');
    const gate = getTravelAtTile('tempest-start', { x: 22, y: 2 }, open);
    expect(gate?.id).toBe('gate-to-battlefield');
    expect(gate?.travelTo?.mapId).toBe('jura-battlefield');

    const back = getTravelAtTile('jura-battlefield', { x: 1, y: 7 }, open);
    expect(back?.travelTo?.mapId).toBe('tempest-start');
  });

  it('spielt den vollen Arc durch: Treyni → Vorhut → Geld → Föderation → Milim', () => {
    let state = freshWorld();
    const startGold = state.gold;

    // 1) Treynis Warnung startet die Quest.
    const plea = chooseDialogOption(state, 'treyni-plea', 'start', 'accept');
    expect(plea.ok).toBe(true);
    state = plea.state.world;
    expect(state.flags['story.treyni.met']).toBe(true);

    // 2) Ork-Vorhut brechen.
    state = completeEncounter(state, 'orc-vanguard').state;
    expect(state.flags['story.orc.engaged']).toBe(true);

    // Treyni verschwindet, sobald die Schlacht eröffnet ist (notFlag story.orc.engaged).
    expect(chooseDialogOption(state, 'treyni-plea', 'start', 'accept').ok).toBe(false);

    // 3) Orc-Disaster „Geld" stellen.
    state = completeEncounter(state, 'geld-disaster-boss').state;
    expect(state.flags['story.geld.devoured']).toBe(true);

    // 4) Föderation gründen (Belohnung + Quest-Abschluss).
    const federation = chooseDialogOption(state, 'geld-federation', 'start', 'found');
    expect(federation.ok).toBe(true);
    state = federation.state.world;
    expect(state.flags['faction.orcs.joined']).toBe(true);
    expect(state.gold).toBe(startGold + 320);

    const quest = buildQuestLog(state).find((entry) => entry.id === 'geld-disaster');
    expect(quest?.status).toBe('completed');
    expect(quest?.steps.every((step) => step.completed)).toBe(true);

    // 5) Milim — Test wird Freundschaft.
    const milim = chooseDialogOption(state, 'milim-honey', 'start', 'honey');
    expect(milim.ok).toBe(true);
    state = milim.state.world;
    expect(state.flags['story.milim.met']).toBe(true);
  });

  it('schaltet die Arc-Codexeinträge über die Arc-Flags frei', () => {
    let state = withFlag(freshWorld(), 'story.treyni.met');
    state = withFlag(state, 'faction.orcs.joined');
    state = withFlag(state, 'story.milim.met');
    const codex = buildCodexView(state);
    for (const id of ['treyni', 'jura-federation', 'demon-lords']) {
      expect(codex.find((entry) => entry.id === id)?.unlocked).toBe(true);
    }
  });
});
