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
  if (save.flags['story.act2.completed'] && save.quests['ancestors-choice']?.status !== 'completed') {
    return { kicker: 'Band 4', line: 'Die Bindung verlangt eine letzte Entscheidung.' };
  }
  if (save.flags['story.act3.completed'] || save.quests['ancestors-choice']?.status === 'completed') {
    return { kicker: 'Epilog', line: 'Tempests Entscheidung trägt die Zukunft.' };
  }
  if (save.flags['story.act1.completed'] && save.quests['border-escalation']?.status !== 'completed') {
    return { kicker: 'Band 3', line: 'Tempest steht — die Grenze ruft.' };
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

  if (!save.flags['story.act2.completed'] && save.quests['border-escalation']?.status !== 'completed') {
    return {
      banner,
      recap: 'Tempest hat den Rat, den Flüsterhain und das namenlose Echo überstanden. Jetzt entscheidet die Grenze, ob Menschen und Monster einander nur fürchten oder zuhören.',
      nextObjective: bandThreeObjective(save),
      highlights: [
        ...partyHighlights(save),
        'Tempest als junge Stadt gegründet',
        ...(save.flags['story.border.deescalated'] ? ['Sumpfgrenze nicht-tödlich deeskaliert'] : []),
        ...(save.flags['story.vanguard.trace-read'] ? ['Ranga hat die anonyme Siegelspur gesichert'] : []),
        ...(hasItem(save, 'tempest-charm') ? ['Belohnung: Tempest-Talisman erhalten'] : [])
      ]
    };
  }

  if (save.flags['story.act2.completed'] && save.quests['ancestors-choice']?.status !== 'completed') {
    return {
      banner,
      recap: 'Die Sumpfgrenze wurde deeskaliert und die fremde Siegelspur bleibt namenlos. Tempest kann freiwillig den letzten Bündnisrat einberufen.',
      nextObjective: bandFourObjective(save),
      highlights: [
        ...partyHighlights(save),
        'Grenzbericht ohne Massaker gesichert',
        ...(save.flags['story.alliance.council-ready'] ? ['Bündnisrat geschlossen'] : []),
        ...(save.flags['story.breach.cleared'] ? ['Linie der alten Ordnung gebrochen'] : [])
      ]
    };
  }

  return {
    banner,
    recap: 'Tempest hat über die Ahnenbindung entschieden. Die Zukunft hängt nun an der gewählten Verantwortung.',
    nextObjective: 'Speichere den Abschluss oder starte New Game+, um andere Enden zu sehen.',
    highlights: [
      ...partyHighlights(save),
      getEndingHighlight(save),
      ...(hasItem(save, 'tempest-charm') ? ['Belohnung: Tempest-Talisman erhalten'] : [])
    ].filter((entry): entry is string => entry !== null)
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
  if (!save.flags['story.shuna.ready']) return 'Sprich zuerst mit Shuna in Tempest und deute die Siegelspur.';
  if (!save.flags['story.gobta.ready'] || !save.flags['story.ranga.ready']) return 'Hole Gobtas Grenzplan und Rangas Scoutbericht ein.';
  if (!save.flags['story.council.ready']) return 'Kehre zu Rigurd zurück und versammle den Rat.';
  if (!save.flags['story.grove.cleared']) return 'Sichere den Flüsterhain.';
  if (!save.flags['story.boss.echo-defeated']) return 'Brich das namenlose Echo am Ahnensiegel.';
  return 'Berichte Rigurd vom Siegelbruch und schließe Band 2 ab.';
}

function bandThreeObjective(save: Pick<SaveGameV2, 'flags' | 'quests'>): string {
  if ((save.quests['border-escalation']?.status ?? 'inactive') === 'inactive') {
    return 'Optional: Sprich mit Gobta über die Grenzlage oder raste im Tempest-Lager.';
  }
  if (!save.flags['story.border.cleared']) return 'Folge Rangas Westpfad ins Geistmoor und stoppe die Patrouille.';
  if (!save.flags['story.border.deescalated']) return 'Senke die Waffen und versorge die Verwundeten an der Sumpfgrenze.';
  if (!save.flags['story.fracture.read']) return 'Bring Shuna den kalten Siegelspan aus dem Geistmoor.';
  if (!save.flags['story.vanguard.trace-read']) return 'Brich die Vorhut am Grenzriss und sichere Rangas Spur.';
  return 'Berichte Gobta von Deeskalation und Siegelspur.';
}

function bandFourObjective(save: Pick<SaveGameV2, 'flags' | 'quests'>): string {
  if ((save.quests['ancestors-choice']?.status ?? 'inactive') === 'inactive') {
    return 'Optional: Sprich mit Rigurd über den letzten Bündnisrat.';
  }
  if (!save.flags['story.alliance.council-ready']) {
    return 'Hole Shunas Ritualplan, Gobtas Menschenroute und Rangas Rückzugsspur ein.';
  }
  if (!save.flags['story.breach.cleared']) return 'Führe den Bündnismarsch gegen die Linie der alten Ordnung.';
  if (!save.flags['story.mordrahn.defeated']) return 'Stell den Hüter am Bindungsherz.';
  return 'Triff bei Rigurd die Entscheidung über Freiheit, Ordnung oder Geteilte Last.';
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

function getEndingHighlight(save: Pick<SaveGameV2, 'flags'>): string | null {
  if (save.flags['ending.true']) return 'Ende erreicht: Geteilte Last';
  if (save.flags['ending.order']) return 'Ende erreicht: Ordnung';
  if (save.flags['ending.freedom']) return 'Ende erreicht: Freiheit';
  return null;
}
