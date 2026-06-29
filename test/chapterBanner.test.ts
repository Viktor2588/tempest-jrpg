import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import { createNewSave } from '../src/systems/save';
import { getChapterBanner, getChapterSummary } from '../src/systems/chapterBanner';
import { createPartyMember } from '../src/systems/party';

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

  it('fasst den frühen Prolog mit nächstem Veldora-Ziel zusammen', () => {
    const summary = getChapterSummary(createNewSave());

    expect(summary.banner).toEqual({
      kicker: 'Prolog',
      line: 'Erwachen in der versiegelten Höhle'
    });
    expect(summary.recap).toContain('Veldoras Schwur');
    expect(summary.nextObjective).toBe('Sprich mit Veldora und ordne Rimurus Schleimform.');
    expect(summary.highlights).toEqual([]);
  });

  it('fasst Band 2 mit Canon-Party, Rat und Ranga-Scoutmarkierung zusammen', () => {
    const base = createNewSave();
    const save = {
      ...base,
      flags: {
        'story.slime-prologue.completed': true,
        'story.shuna.ready': true,
        'story.gobta.ready': true,
        'story.ranga.ready': true,
        'story.council.ready': true,
        'scout.whispering-grove': true
      },
      quests: {
        'binding-of-ancestors': {
          status: 'active' as const,
          completedStepIds: ['awakening', 'gather-council']
        }
      },
      party: {
        ...base.party,
        active: [...base.party.active, partyMember('gobta'), partyMember('ranga')]
      }
    };

    const summary = getChapterSummary(save);
    expect(summary.banner.kicker).toBe('Band 2');
    expect(summary.nextObjective).toBe('Sichere den Flüsterhain.');
    expect(summary.highlights).toEqual([
      'Gobta ist beigetreten',
      'Ranga ist beigetreten',
      'Rat von Tempest versammelt',
      'Ranga hat den Flüsterhain markiert'
    ]);
  });

  it('fasst den Band-2-Abschluss mit Boss-Nachspiel und Belohnung zusammen', () => {
    const base = createNewSave();
    const save = {
      ...base,
      flags: {
        'story.slime-prologue.completed': true,
        'story.act1.completed': true
      },
      quests: {
        'binding-of-ancestors': {
          status: 'completed' as const,
          completedStepIds: ['awakening', 'gather-council', 'clear-grove', 'defeat-mordrahn-echo', 'report-sora']
        }
      },
      inventory: {
        stacks: [...base.inventory.stacks, { itemId: 'tempest-charm', quantity: 1 }]
      },
      party: {
        ...base.party,
        active: [...base.party.active, partyMember('gobta'), partyMember('ranga')]
      }
    };

    const summary = getChapterSummary(save);
    expect(summary.banner).toEqual({
      kicker: 'Band 2',
      line: 'Tempest steht — die Grenze ruft.'
    });
    expect(summary.recap).toContain('Band 1 und Band 2 sind abgeschlossen');
    expect(summary.nextObjective).toContain('Optional');
    expect(summary.highlights).toContain('Namenloses Echo am Ahnensiegel gebrochen');
    expect(summary.highlights).toContain('Belohnung: Tempest-Talisman erhalten');
  });
});

function partyMember(characterId: string) {
  const hero = HEROES.find((candidate) => candidate.id === characterId);
  if (!hero) throw new Error(`Unknown hero '${characterId}'`);
  return createPartyMember(hero);
}
