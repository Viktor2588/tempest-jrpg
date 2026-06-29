import { describe, expect, it } from 'vitest';
import { createNewSave } from '../src/systems/save';
import {
  acknowledgeMilestone,
  getMilestoneById,
  getPendingMilestone
} from '../src/systems/milestones';

describe('Story-Meilensteine', () => {
  it('zeigt Rekrutierungen und Boss-Nachspiel in Story-Reihenfolge', () => {
    const base = createNewSave({ now: '2026-06-29T00:00:00.000Z' });
    const gobta = {
      ...base,
      flags: { ...base.flags, 'story.goblin.plea': true },
      party: {
        ...base.party,
        active: [...base.party.active, {
          characterId: 'gobta',
          name: 'Gobta',
          level: 1,
          experience: 0,
          currentHp: 99,
          currentMp: 12,
          learnedSkillIds: ['goblin-feint'],
          equipment: { weapon: null, armor: null, accessory: null }
        }]
      }
    };

    expect(getPendingMilestone(gobta)?.id).toBe('gobta-joins');
    const afterGobta = {
      ...gobta,
      flags: {
        ...acknowledgeMilestone(gobta.flags, 'gobta-joins'),
        'story.direwolf.defeated': true
      }
    };
    expect(getPendingMilestone(afterGobta)?.id).toBe('direwolf-victory');
  });

  it('zeigt bei alten fortgeschrittenen Saves nur den neuesten relevanten Stand', () => {
    const base = createNewSave({ now: '2026-06-29T00:00:00.000Z' });
    const completed = {
      ...base,
      flags: {
        ...base.flags,
        'story.goblin.plea': true,
        'story.direwolf.defeated': true,
        'story.direwolf.pact': true,
        'story.slime-prologue.completed': true,
        'story.council.ready': true,
        'story.boss.echo-defeated': true,
        'story.act1.completed': true
      },
      quests: {
        ...base.quests,
        'binding-of-ancestors': { status: 'completed' as const, completedStepIds: [] }
      }
    };

    expect(getPendingMilestone(completed)?.id).toBe('band-two-complete');
    const flags = acknowledgeMilestone(completed.flags, 'band-two-complete');
    expect(getPendingMilestone({ ...completed, flags })).toBeNull();
  });

  it('ignoriert unbekannte IDs und liefert stabile Viewdaten', () => {
    const flags = { existing: true };
    expect(acknowledgeMilestone(flags, 'unknown')).toBe(flags);
    expect(getMilestoneById('unknown')).toBeNull();
    expect(getMilestoneById('ranga-joins')?.tone).toBe('bond');
  });
});
