import { describe, expect, it } from 'vitest';
import { GAME_DATA, validateGameData } from '../src/data';

describe('Game-Datenintegrität', () => {
  it('hat eindeutige IDs und gültige Referenzen im ersten Content-Set', () => {
    expect(validateGameData(GAME_DATA)).toEqual([]);
  });

  it('meldet kaputte Skill-Referenzen deterministisch', () => {
    const issues = validateGameData({
      ...GAME_DATA,
      heroes: [
        {
          ...GAME_DATA.heroes[0]!,
          initialSkillIds: ['missing-skill']
        }
      ]
    });

    expect(issues).toContainEqual({
      path: 'heroes.rimuru.initialSkillIds.missing-skill',
      message: "Unbekannter Skill 'missing-skill'."
    });
  });
});
