import type { FormationRow, PartyMemberState } from './party';

export const MAX_ACTIVE_PARTY_SIZE = 3;
export type ActiveFormationDirection = FormationRow;

export interface PartyFormationState {
  readonly active: readonly PartyMemberState[];
  readonly reserve: readonly PartyMemberState[];
}

export interface PartyFormationResult {
  readonly ok: boolean;
  readonly state: PartyFormationState;
  readonly message: string;
}

export function activateReserveMember(
  state: PartyFormationState,
  reserveCharacterId: string,
  replaceActiveCharacterId?: string
): PartyFormationResult {
  const reserveIndex = state.reserve.findIndex((member) => member.characterId === reserveCharacterId);
  if (reserveIndex < 0) {
    return { ok: false, state, message: 'Figur ist nicht in der Reserve.' };
  }
  const incoming = state.reserve[reserveIndex]!;

  if (state.active.length < MAX_ACTIVE_PARTY_SIZE) {
    return {
      ok: true,
      state: {
        active: [...state.active, incoming],
        reserve: state.reserve.filter((_, index) => index !== reserveIndex)
      },
      message: `${incoming.name} ist jetzt aktiv.`
    };
  }

  const activeIndex = state.active.findIndex((member) =>
    member.characterId === replaceActiveCharacterId
  );
  if (activeIndex < 0) {
    return {
      ok: false,
      state,
      message: `Die aktive Gruppe ist voll. Wähle zuerst ein aktives Mitglied zum Tauschen.`
    };
  }
  const outgoing = state.active[activeIndex]!;
  const active = [...state.active];
  active[activeIndex] = incoming;
  const reserve = [...state.reserve];
  reserve[reserveIndex] = outgoing;

  return {
    ok: true,
    state: { active, reserve },
    message: `${incoming.name} wechselt für ${outgoing.name} in die aktive Gruppe.`
  };
}

export function moveActiveMember(
  state: PartyFormationState,
  characterId: string,
  direction: ActiveFormationDirection
): PartyFormationResult {
  const activeIndex = state.active.findIndex((member) => member.characterId === characterId);
  if (activeIndex < 0) {
    return { ok: false, state, message: 'Figur ist nicht in der aktiven Gruppe.' };
  }

  const moving = state.active[activeIndex]!;
  if ((moving.formationRow ?? 'front') === direction) {
    return { ok: false, state, message: 'Diese Reihe ist bereits erreicht.' };
  }

  const active = state.active.map((member) =>
    member.characterId === characterId ? { ...member, formationRow: direction } : member
  );

  return {
    ok: true,
    state: { active, reserve: state.reserve },
    message: direction === 'front'
      ? `${moving.name} rückt in die Front.`
      : `${moving.name} geht in die Hinterreihe.`
  };
}
