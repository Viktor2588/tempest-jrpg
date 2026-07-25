import { describe, expect, it } from 'vitest';
import { HEROES, SKILLS, type CharacterDefinition } from '../src/data';
import { createPartyMember } from '../src/systems/party';
import { createProgressionState, getProgressionSkillIds } from '../src/systems/progression';

const hero = (id: string): CharacterDefinition => HEROES.find((entry) => entry.id === id)!;

describe('Zeitleisten-Skill der Reiter-Vollendung', () => {
  it('lehrt Gobta mit "Tempest-Ritter" die Beschleunigung', () => {
    const gobta = createPartyMember(hero('gobta'), { level: 9 });
    const state = createProgressionState({
      unlockedSkillNodeIdsByCharacterId: { gobta: ['gobta-rider-focus', 'gobta-rider-charge', 'gobta-rider-knight'] }
    });

    expect(getProgressionSkillIds(gobta, state)).toContain('quicken');
    expect(SKILLS.find((skill) => skill.id === 'quicken')?.ctDelta).toBe(60);
  });
});
