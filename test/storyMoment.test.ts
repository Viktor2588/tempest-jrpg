import { describe, expect, it } from 'vitest';
import { buildStoryMoment } from '../src/systems/storyMoment';
import type { WorldEffect } from '../src/data/world';

describe('story moments', () => {
  it('fasst einzelne Rekrutierung als Gefährten-Moment zusammen', () => {
    expect(buildStoryMoment([{ type: 'recruit-character', characterId: 'gobta' }])).toEqual({
      title: 'Gefährte beigetreten',
      body: 'Gobta kämpft jetzt an Rimurus Seite.',
      tone: 'recruit'
    });
  });

  it('fasst Mehrfach-Rekrutierungen in einem Panel zusammen', () => {
    const effects: WorldEffect[] = [
      { type: 'recruit-character', characterId: 'benimaru' },
      { type: 'recruit-character', characterId: 'shion' },
      { type: 'recruit-character', characterId: 'hakurou' }
    ];

    expect(buildStoryMoment(effects)).toEqual({
      title: 'Gefährten beigetreten',
      body: 'Benimaru, Shion und Hakurou kämpfen jetzt an Rimurus Seite.',
      tone: 'recruit'
    });
  });

  it('priorisiert Tempests Benennung vor generischem Questabschluss', () => {
    const effects: WorldEffect[] = [
      { type: 'complete-quest', questId: 'slime-awakening' },
      { type: 'set-flag', flag: 'story.tempest.named', value: true }
    ];

    expect(buildStoryMoment(effects)).toEqual({
      title: 'Tempest gegründet',
      body: 'Die Siedlung trägt jetzt einen Namen. Aus verstreuten Hütten wird der erste Kern von Tempest.',
      tone: 'bond'
    });
  });

  it('zeigt Rast als sichtbares Ruhepunkt-Moment', () => {
    expect(buildStoryMoment([{ type: 'restore-party' }])).toEqual({
      title: 'Gruppe erholt',
      body: 'Die aktive Gruppe ist vollständig geheilt und bereit für den nächsten Hauptbeat.',
      tone: 'rest'
    });
  });

  it('zeigt Questabschluss mit Belohnungsübersicht', () => {
    const moment = buildStoryMoment([{ type: 'complete-quest', questId: 'binding-of-ancestors' }]);

    expect(moment?.title).toBe('Kapitelziel abgeschlossen');
    expect(moment?.body).toContain('Bindung der Ahnen abgeschlossen');
    expect(moment?.body).toContain('180 Gold');
    expect(moment?.body).toContain('Tempest-Talisman');
    expect(moment?.tone).toBe('quest');
  });
});
