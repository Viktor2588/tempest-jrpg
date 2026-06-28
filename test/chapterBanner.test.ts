import { describe, expect, it } from 'vitest';
import { createNewSave } from '../src/systems/save';
import { getChapterBanner } from '../src/systems/chapterBanner';

describe('chapter banner', () => {
  it('zeigt vor Storyfortschritt den Prolog-Hinweis', () => {
    expect(getChapterBanner(createNewSave()).line).toBe('Erwachen in der versiegelten Höhle');
  });

  it('zeigt nach dem Prolog den Band-2-Hinweis aus dem Plan', () => {
    const save = {
      ...createNewSave(),
      flags: {
        'story.slime-prologue.completed': true,
        'story.tempest.named': true
      },
      quests: {
        'slime-awakening': {
          status: 'completed' as const,
          completedStepIds: ['cave-awakening', 'storm-dragon-oath', 'goblin-plea', 'direwolf-pack', 'name-the-village']
        },
        'binding-of-ancestors': {
          status: 'active' as const,
          completedStepIds: []
        }
      }
    };

    expect(getChapterBanner(save)).toEqual({
      kicker: 'Band 2',
      line: 'Eine Stadt braucht mehr als einen Namen.'
    });
  });
});
