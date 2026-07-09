import { describe, expect, it } from 'vitest';
import { createInitialNavState, moveSelection, activateSelection } from '../src/ui/menuKeyboard';

describe('Phase 119 menuKeyboard pure (honest)', () => {
  it('moveSelection cycles party members', () => {
    let s = createInitialNavState();
    s = moveSelection(s, 1);
    expect(s.selectedMemberIndex).toBe(1);
    s = moveSelection(s, -1);
    expect(s.selectedMemberIndex).toBe(0);
  });

  it('activateSelection returns action', () => {
    const s = createInitialNavState();
    const r = activateSelection(s);
    expect(r.action).toBe('activate');
  });

  it('supports other tab', () => {
    let s = { ...createInitialNavState(), selectedTab: 'quests' };
    s = moveSelection(s, 1, 4);
    // for non party, no change to member
    expect(s.selectedMemberIndex).toBe(0);
  });
});
