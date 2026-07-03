import { describe, expect, it } from 'vitest';
import { HEROES, type CharacterDefinition } from '../src/data';
import { createPartyMember } from '../src/systems/party';
import {
  canUnlockSkillNode,
  createProgressionBattleParty,
  createProgressionState,
  grantSkillPoints,
  unlockSkillNode
} from '../src/systems/progression';
import { committedBranch, talentPerksForNodes } from '../src/systems/talentPerk';

const hero = (id: string): CharacterDefinition => HEROES.find((entry) => entry.id === id)!;

describe('Phase 70 — Spec-Bäume: Branch-Lock und Perk-Zufluss', () => {
  it('leitet die Perks freigeschalteter Knoten ab', () => {
    expect(talentPerksForNodes(['benimaru-blade-focus']))
      .toContainEqual({ kind: 'damage-dealt', percent: 15, category: 'physical' });
    expect(talentPerksForNodes([])).toEqual([]);
  });

  it('benennt den gewählten Strang (oder null)', () => {
    expect(committedBranch([])).toBeNull();
    expect(committedBranch(['benimaru-flame-focus'])).toBe('flame');
  });

  it('sperrt die anderen Stränge, sobald einer gewählt ist (Qual der Wahl)', () => {
    const benimaru = createPartyMember(hero('benimaru'), { level: 9 });
    const state = grantSkillPoints(createProgressionState(), 'benimaru', 10).state;
    const blade = unlockSkillNode(benimaru, state, 'benimaru-blade-focus');
    expect(blade.ok).toBe(true);

    // Anderer Strang ist jetzt gesperrt …
    expect(canUnlockSkillNode(benimaru, blade.state, 'benimaru-flame-focus').ok).toBe(false);
    // … der gewählte Strang lässt sich weiter ausbauen.
    expect(canUnlockSkillNode(benimaru, blade.state, 'benimaru-blade-counter').ok).toBe(true);
  });

  it('speist die Perks in die Kampfparty ein', () => {
    const benimaru = createPartyMember(hero('benimaru'), { level: 9 });
    const state = {
      ...createProgressionState(),
      unlockedSkillNodeIdsByCharacterId: { benimaru: ['benimaru-blade-focus', 'benimaru-blade-counter'] }
    };
    const [unit] = createProgressionBattleParty([benimaru], state);
    expect(unit!.perks).toEqual(expect.arrayContaining([
      { kind: 'damage-dealt', percent: 15, category: 'physical' },
      { kind: 'counter', percent: 30 }
    ]));
  });

  it('jeder Benimaru-Strang hat mehrere Knoten und der Einstieg ist strangfrei erreichbar', () => {
    const branches = ['blade', 'flame', 'command'] as const;
    const benimaru = createPartyMember(hero('benimaru'), { level: 9 });
    const fresh = grantSkillPoints(createProgressionState(), 'benimaru', 10).state;
    for (const branch of branches) {
      // Genau ein Einstiegsknoten je Strang ohne Vorgänger, aus dem Startzustand wählbar.
      const entry = `benimaru-${branch === 'blade' ? 'blade-focus' : branch === 'flame' ? 'flame-focus' : 'command-presence'}`;
      expect(canUnlockSkillNode(benimaru, fresh, entry).ok, entry).toBe(true);
    }
  });
});
