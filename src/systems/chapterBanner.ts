import type { SaveGameV2 } from './save';

export interface ChapterBanner {
  readonly kicker: string;
  readonly line: string;
}

export interface ChapterSummary {
  readonly banner: ChapterBanner;
  readonly recap: string;
  readonly nextObjective: string;
  readonly highlights: readonly string[];
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

export function getChapterSummary(save: Pick<SaveGameV2, 'flags' | 'quests' | 'party' | 'inventory'> | null | undefined): ChapterSummary {
  const banner = getChapterBanner(save);
  if (!save) {
    return {
      banner,
      recap: 'Rimuru erwacht in der versiegelten Höhle und sucht den ersten Schwur.',
      nextObjective: 'Sprich mit Veldora und ordne die Schleimform.',
      highlights: []
    };
  }

  if (!save.flags['story.slime-prologue.completed']) {
    return {
      banner,
      recap: 'Der Prolog führt von Veldoras Schwur über Rigurds Dorfbitte bis zur Direwolf-Lichtung.',
      nextObjective: prologueObjective(save),
      highlights: partyHighlights(save)
    };
  }

  if (save.quests['binding-of-ancestors']?.status !== 'completed') {
    return {
      banner,
      recap: 'Tempest hat einen Namen, aber die erste Stadtbindung muss sich im Rat und im Flüsterhain beweisen.',
      nextObjective: bandTwoObjective(save),
      highlights: [
        ...partyHighlights(save),
        ...(save.flags['story.council.ready'] ? ['Rat von Tempest versammelt'] : []),
        ...(save.flags['scout.whispering-grove'] ? ['Ranga hat den Flüsterhain markiert'] : [])
      ]
    };
  }

  return {
    banner,
    recap: 'Band 1 und Band 2 sind abgeschlossen: Veldoras Schwur, Gobtas Beitritt, Rangas Pakt, Tempests Rat, Flüsterhain und das namenlose Echo liegen hinter dir.',
    nextObjective: save.quests['border-escalation']?.status === 'active'
      ? 'Halte die Sumpfgrenze und bring Shuna die Grenzfunde.'
      : 'Optional: Sprich mit Gobta über die Grenzlage oder raste im Tempest-Lager.',
    highlights: [
      ...partyHighlights(save),
      'Tempest als junge Stadt gegründet',
      'Namenloses Echo am Ahnensiegel gebrochen',
      ...(hasItem(save, 'tempest-charm') ? ['Belohnung: Tempest-Talisman erhalten'] : [])
    ]
  };
}

function prologueObjective(save: Pick<SaveGameV2, 'flags' | 'quests'>): string {
  if (!save.flags['story.slime.awakened']) return 'Sprich mit Veldora und ordne Rimurus Schleimform.';
  if (!save.flags['story.storm-dragon.oath']) return 'Schließe den Sturmschwur mit Veldora.';
  if (!save.flags['story.goblin.plea']) return 'Folge dem Höhlenausgang und höre Rigurds Bitte.';
  if (!save.flags['story.direwolf.defeated']) return 'Stell den Direwolf-Anführer an der Lichtung.';
  if (!save.flags['story.direwolf.pact']) return 'Schließe den Pakt mit Ranga.';
  return 'Kehre zu Rigurd zurück und benenne die Siedlung.';
}

function bandTwoObjective(save: Pick<SaveGameV2, 'flags' | 'quests'>): string {
  const completed = save.quests['binding-of-ancestors']?.completedStepIds ?? [];
  if (!completed.includes('awakening')) return 'Sprich mit Rigurd in Tempest und sammle den ersten Rat.';
  if (!save.flags['story.shuna.ready'] || !save.flags['story.gobta.ready'] || !save.flags['story.ranga.ready']) {
    return 'Hole Shunas Siegeldeutung, Gobtas Grenzplan und Rangas Scoutbericht ein.';
  }
  if (!save.flags['story.council.ready']) return 'Kehre zu Rigurd zurück und versammle den Rat.';
  if (!save.flags['story.grove.cleared']) return 'Sichere den Flüsterhain.';
  if (!save.flags['story.boss.echo-defeated']) return 'Brich das namenlose Echo am Ahnensiegel.';
  return 'Berichte Rigurd vom Siegelbruch und schließe Band 2 ab.';
}

function partyHighlights(save: Pick<SaveGameV2, 'party'>): string[] {
  const ids = new Set(save.party.active.map((member) => member.characterId));
  return [
    ids.has('gobta') ? 'Gobta ist beigetreten' : null,
    ids.has('ranga') ? 'Ranga ist beigetreten' : null,
    ids.has('benimaru') ? 'Kijin-Gefolge ist beigetreten' : null
  ].filter((entry): entry is string => entry !== null);
}

function hasItem(save: Pick<SaveGameV2, 'inventory'>, itemId: string): boolean {
  return save.inventory.stacks.some((stack) => stack.itemId === itemId && stack.quantity > 0);
}
