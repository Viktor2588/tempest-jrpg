export interface MenuNavState {
  selectedTab: string;
  selectedMemberIndex: number;
}

export function createInitialNavState(): MenuNavState {
  return { selectedTab: 'party', selectedMemberIndex: 0 };
}

export function moveSelection(state: MenuNavState, delta: number, numMembers: number = 4): MenuNavState {
  if (state.selectedTab === 'party') {
    const n = numMembers;
    return { ...state, selectedMemberIndex: (state.selectedMemberIndex + delta + n) % n };
  }
  return state;
}

export function activateSelection(state: MenuNavState): { action: string; state: MenuNavState } {
  return { action: 'activate', state };
}
