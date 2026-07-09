import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import { createPartyMember } from '../src/systems/party';
import {
  activateReserveMember,
  MAX_ACTIVE_PARTY_SIZE,
  moveActiveMember
} from '../src/systems/partyFormation';

const member = (id: string, formationRow: 'front' | 'back' = 'front') =>
  createPartyMember(HEROES.find((hero) => hero.id === id)!, { formationRow });

describe('Party-/Reserveverwaltung', () => {
  it('füllt einen freien aktiven Platz aus der Reserve', () => {
    const result = activateReserveMember({
      active: [member('rimuru'), member('gobta')],
      reserve: [member('ranga')]
    }, 'ranga');

    expect(result.ok).toBe(true);
    expect(result.state.active.map((entry) => entry.characterId))
      .toEqual(['rimuru', 'gobta', 'ranga']);
    expect(result.state.reserve).toHaveLength(0);
  });

  it('tauscht bei voller Dreiergruppe gegen das ausgewählte Mitglied', () => {
    expect(MAX_ACTIVE_PARTY_SIZE).toBe(3);
    const result = activateReserveMember({
      active: [member('rimuru'), member('gobta'), member('ranga')],
      reserve: [member('shuna')]
    }, 'shuna', 'gobta');

    expect(result.ok).toBe(true);
    expect(result.state.active.map((entry) => entry.characterId))
      .toEqual(['rimuru', 'shuna', 'ranga']);
    expect(result.state.reserve.map((entry) => entry.characterId)).toEqual(['gobta']);
  });

  it('verändert bei ungültiger Auswahl nichts', () => {
    const state = {
      active: [member('rimuru'), member('gobta'), member('ranga')],
      reserve: [member('shuna')]
    };
    expect(activateReserveMember(state, 'unknown', 'gobta').state).toBe(state);
    expect(activateReserveMember(state, 'shuna').ok).toBe(false);
  });

  it('verschiebt aktive Mitglieder nach vorn und hinten', () => {
    const state = {
      active: [member('rimuru'), member('gobta', 'back'), member('ranga', 'back')],
      reserve: [member('shuna')]
    };

    const front = moveActiveMember(state, 'ranga', 'front');
    expect(front.ok).toBe(true);
    expect(front.state.active.map((entry) => [entry.characterId, entry.formationRow]))
      .toEqual([['rimuru', 'front'], ['gobta', 'back'], ['ranga', 'front']]);

    const back = moveActiveMember(front.state, 'rimuru', 'back');
    expect(back.ok).toBe(true);
    expect(back.state.active.map((entry) => [entry.characterId, entry.formationRow]))
      .toEqual([['rimuru', 'back'], ['gobta', 'back'], ['ranga', 'front']]);
  });
});
