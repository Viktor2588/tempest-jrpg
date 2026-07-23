import { describe, expect, it } from 'vitest';
import { buildQuestTracker } from '../src/systems/questTracker';
import type { WorldState } from '../src/systems/world';

describe('quest tracker', () => {
  it('stellt das priorisierte Hauptziel und aktive Nebenquests getrennt bereit', () => {
    const state: WorldState = {
      flags: { 'story.slime-prologue.completed': true },
      quests: {
        'binding-of-ancestors': { status: 'active', completedStepIds: ['awakening'] },
        'first-patrol': { status: 'active', completedStepIds: ['accepted'] }
      },
      inventory: [],
      gold: 0
    };

    expect(buildQuestTracker(state)).toMatchObject({
      objective: {
        questId: 'binding-of-ancestors',
        stepId: 'gather-council',
        stepTitle: 'Rat versammeln'
      },
      sideQuests: [{
        questId: 'first-patrol',
        title: 'Erste Patrouille',
        stepTitle: 'Trainingspfad sichern'
      }],
      hiddenSideQuestCount: 0
    });
  });

  it('bleibt ohne aktive Quests eindeutig', () => {
    const state: WorldState = {
      flags: {},
      quests: {},
      inventory: [],
      gold: 0
    };

    expect(buildQuestTracker(state)).toEqual({
      objective: null,
      sideQuests: [],
      hiddenSideQuestCount: 0
    });
  });

  it('begrenzt die Nebenquest-Liste und weist auf weitere Einträge hin', () => {
    const state: WorldState = {
      flags: { 'story.slime-prologue.completed': true },
      quests: {
        'first-patrol': { status: 'active', completedStepIds: [] }
      },
      inventory: [],
      gold: 0
    };

    expect(buildQuestTracker(state, 0)).toMatchObject({
      objective: { questId: 'first-patrol' },
      sideQuests: [],
      hiddenSideQuestCount: 1
    });
  });
});
