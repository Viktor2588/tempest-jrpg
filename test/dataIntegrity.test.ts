import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { validateGameData } from './dataValidation';

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

  it('meldet Quest-Schritte ohne abschließende Dialog- oder Encounter-Quelle', () => {
    const quest = GAME_DATA.world.quests[0]!;
    const issues = validateGameData({
      ...GAME_DATA,
      world: {
        ...GAME_DATA.world,
        quests: [
          {
            ...quest,
            steps: [
              ...quest.steps,
              {
                id: 'orphan-step',
                title: 'Verwaister Schritt',
                description: 'Dieser Schritt wird absichtlich von keiner Quelle abgeschlossen.',
                locationId: 'tempest-hollow'
              }
            ]
          },
          ...GAME_DATA.world.quests.slice(1)
        ]
      }
    });

    expect(issues).toContainEqual({
      path: `world.quests.${quest.id}.steps.orphan-step.completion`,
      message: `Quest-Schritt '${quest.id}.orphan-step' hat keine Dialog- oder Encounter-Quelle, die ihn abschließt.`
    });
  });
});
