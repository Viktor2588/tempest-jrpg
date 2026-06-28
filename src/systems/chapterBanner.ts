import type { SaveGameV2 } from './save';

export interface ChapterBanner {
  readonly kicker: string;
  readonly line: string;
}

export function getChapterBanner(save: Pick<SaveGameV2, 'flags' | 'quests'> | null | undefined): ChapterBanner {
  if (!save) {
    return { kicker: 'Prolog', line: 'Erwachen in der versiegelten Höhle' };
  }
  if (
    save.flags['story.slime-prologue.completed']
    && save.quests['binding-of-ancestors']?.status !== 'completed'
  ) {
    return { kicker: 'Band 2', line: 'Eine Stadt braucht mehr als einen Namen.' };
  }
  if (save.flags['story.act1.completed'] && save.quests['border-escalation']?.status !== 'completed') {
    return { kicker: 'Band 2', line: 'Tempest steht — die Grenze ruft.' };
  }
  return { kicker: 'Prolog', line: 'Erwachen in der versiegelten Höhle' };
}
