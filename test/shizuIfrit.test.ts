import { describe, expect, it } from 'vitest';
import { EMBER_HOLLOW, getMap, getMapName, MAPS } from '../src/data/maps';
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

describe('Shizu & Ifrit (Phase 30)', () => {
  it('registriert die Glutgrotte mit sichtbarem Namen', () => {
    expect(MAPS['ember-hollow']).toBe(EMBER_HOLLOW);
    expect(getMap('ember-hollow')).toBe(EMBER_HOLLOW);
    expect(getMapName('ember-hollow')).toBe('Glutgrotte');
  });

  it('hält NPC, Encounter-Punkte und Tore auf begehbaren Kacheln', () => {
    const tiles: ReadonlyArray<readonly [number, number]> = [
      [4, 5], // Shizu
      [9, 6], // maskierter Majin
      [14, 6], // Ifrit
      [1, 6], // Rücktor
      [EMBER_HOLLOW.spawn.x, EMBER_HOLLOW.spawn.y]
    ];
    for (const [x, y] of tiles) {
      expect(isWalkable(EMBER_HOLLOW, x, y)).toBe(true);
    }
  });

  it('öffnet das Grotten-Tor erst nach der Kijin-Benennung', () => {
    const locked = freshWorld();
    expect(getTravelAtTile('tempest-start', { x: 22, y: 5 }, locked)).toBeUndefined();

    const open = withFlag(locked, 'story.kijin.named');
    const gate = getTravelAtTile('tempest-start', { x: 22, y: 5 }, open);
    expect(gate?.id).toBe('gate-to-ember-hollow');
    expect(gate?.travelTo?.mapId).toBe('ember-hollow');

    const back = getTravelAtTile('ember-hollow', { x: 1, y: 6 }, open);
    expect(back?.travelTo?.mapId).toBe('tempest-start');
  });

  it('spielt den Arc durch: Shizu → Majin → Ifrit → Schwur', () => {
    let state = freshWorld();
    const startGold = state.gold;

    // 1) Shizu treffen.
    const meet = chooseDialogOption(state, 'shizu-vow', 'start', 'meet');
    expect(meet.ok).toBe(true);
    state = meet.state.world;
    expect(state.flags['story.shizu.met']).toBe(true);

    // Der Schwur ist erst nach Ifrits Niederlage wählbar.
    expect(chooseDialogOption(state, 'shizu-vow', 'start', 'take-vow').ok).toBe(false);

    // 2) Maskierten Majin vertreiben.
    state = completeEncounter(state, 'masked-majin-ambush').state;
    expect(state.flags['story.majin.repelled']).toBe(true);

    // 3) Ifrit bezwingen.
    state = completeEncounter(state, 'ifrit-boss').state;
    expect(state.flags['story.ifrit.subdued']).toBe(true);

    // 4) Shizus Schwur tragen (Belohnung Geistglut + Quest-Abschluss).
    const vow = chooseDialogOption(state, 'shizu-vow', 'start', 'take-vow');
    expect(vow.ok).toBe(true);
    state = vow.state.world;
    expect(state.flags['story.shizu.vow']).toBe(true);
    expect(state.gold).toBe(startGold + 260);

    const quest = buildQuestLog(state).find((entry) => entry.id === 'shizu-vow');
    expect(quest?.status).toBe('completed');
    expect(quest?.steps.every((step) => step.completed)).toBe(true);
  });

  it('schaltet die Codexeinträge über die Arc-Flags frei', () => {
    let state = withFlag(freshWorld(), 'story.shizu.met');
    state = withFlag(state, 'story.ifrit.subdued');
    state = withFlag(state, 'story.shizu.vow');
    const codex = buildCodexView(state);
    for (const id of ['shizu', 'ifrit-spirit', 'otherworlders']) {
      expect(codex.find((entry) => entry.id === id)?.unlocked).toBe(true);
    }
  });
});
