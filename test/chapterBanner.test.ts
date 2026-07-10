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

  it('führt Shuna bewusst als erste Band-2-Ratsstation', () => {
    const base = createNewSave();
    const councilOpen = {
      ...base,
      flags: { 'story.slime-prologue.completed': true },
      quests: {
        'binding-of-ancestors': {
          status: 'active' as const,
          completedStepIds: ['awakening']
        }
      }
    };

    expect(getChapterSummary(councilOpen).nextObjective)
      .toBe('Sprich zuerst mit Shuna in Tempest und deute die Siegelspur.');
    expect(getChapterSummary({
      ...councilOpen,
      flags: { ...councilOpen.flags, 'story.shuna.ready': true }
    }).nextObjective).toBe('Hole Gobtas Grenzplan und Rangas Scoutbericht ein.');
  });

  it('fasst den Band-2-Abschluss als Band-3-Hook mit Boss-Nachspiel und Belohnung zusammen', () => {
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
      kicker: 'Band 3',
      line: 'Tempest steht — die Grenze ruft.'
    });
    expect(summary.recap).toContain('Tempest hat den Rat');
    expect(summary.nextObjective).toContain('Optional');
    expect(summary.highlights).toContain('Tempest als junge Stadt gegründet');
    expect(summary.highlights).toContain('Belohnung: Tempest-Talisman erhalten');
  });

  it('fasst den Band-3-Abschluss als Band-4-Hook zusammen', () => {
    const base = createNewSave();
    const save = {
      ...base,
      flags: {
        'story.slime-prologue.completed': true,
        'story.act1.completed': true,
        'story.act2.completed': true,
        'story.border.deescalated': true,
        'story.vanguard.trace-read': true
      },
      quests: {
        'binding-of-ancestors': {
          status: 'completed' as const,
          completedStepIds: ['awakening', 'gather-council', 'clear-grove', 'defeat-mordrahn-echo', 'report-sora']
        },
        'border-escalation': {
          status: 'completed' as const,
          completedStepIds: ['muster', 'border-clash', 'read-fracture', 'break-vanguard', 'report-act2']
        }
      },
      party: {
        ...base.party,
        active: [...base.party.active, partyMember('gobta'), partyMember('ranga')]
      }
    };

    const summary = getChapterSummary(save);
    expect(summary.banner).toEqual({
      kicker: 'Band 4',
      line: 'Die Bindung verlangt eine letzte Entscheidung.'
    });
    expect(summary.nextObjective).toBe('Optional: Sprich mit Rigurd über den letzten Bündnisrat.');
    expect(summary.highlights).toContain('Grenzbericht ohne Massaker gesichert');
  });

  it('fasst den Abschluss mit erreichtem Ende zusammen', () => {
    const base = createNewSave();
    const save = {
      ...base,
      flags: {
        'story.slime-prologue.completed': true,
        'story.act1.completed': true,
        'story.act2.completed': true,
        'story.act3.completed': true,
        'ending.true': true
      },
      quests: {
        'binding-of-ancestors': { status: 'completed' as const, completedStepIds: [] },
        'border-escalation': { status: 'completed' as const, completedStepIds: [] },
        'ancestors-choice': { status: 'completed' as const, completedStepIds: ['rally', 'breach', 'confront', 'choose'] }
      },
      party: {
        ...base.party,
        active: [...base.party.active, partyMember('gobta'), partyMember('ranga')]
      }
    };

    const summary = getChapterSummary(save);
    expect(summary.banner.kicker).toBe('Epilog');
    expect(summary.highlights).toContain('Ende erreicht: Geteilte Last');
  });
});

function partyMember(characterId: string) {
  const hero = HEROES.find((candidate) => candidate.id === characterId);
  if (!hero) throw new Error(`Unknown hero '${characterId}'`);
  return createPartyMember(hero);
}
