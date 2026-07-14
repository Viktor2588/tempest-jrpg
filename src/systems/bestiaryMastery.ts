// Phase 124 — Sammel-Meisterschaft: verzahnt den Wissens-/Sammelpfeiler
// (Bestiarium 122/123) mit der Magicule-Oekonomie (102). Wer alle
// regionstypischen (Nicht-Boss-)Gegner eines Jagdgrunds per „Analysieren"
// (Grosser Weiser) studiert hat, erhaelt EINMALIG einen deterministischen
// Magicule-Fund. Rein/funktional, Phaser-frei, headless testbar.
//
// Bewusst kuratierte Jagdgruende (statt roher mapId-Gruppierung): die
// tempest-start-Karte ist ein Story-Sammelbecken und Challenge-Karten
// (Kolosseum/Labyrinth) mischen Gegner aller Regionen — beides ergaebe keine
// thematisch saubere Sammel-Region. Bosse (Existenzen) zaehlen nie mit; sie
// werden im Kampf nicht per Bestiarium-Vorwissen aufgedeckt (Phase 123) und
// sollen die Vervollstaendigung nicht blockieren.

export interface HuntingGround {
  readonly id: string;
  readonly name: string;
  // Regionstypische Nicht-Boss-Gegner-Arten, die studiert werden muessen.
  readonly enemyIds: readonly string[];
  // Einmaliger, deterministischer Magicule-Fund bei Vollstaendigkeit.
  readonly magiculeReward: number;
}

export const HUNTING_GROUNDS: readonly HuntingGround[] = [
  {
    id: 'jura-forest',
    name: 'Jura-Wildnis',
    enemyIds: ['forest-slime', 'direwolf-pup', 'direwolf-alpha', 'spore-moth', 'orc-scout'],
    magiculeReward: 8
  },
  {
    id: 'spirit-marsh',
    name: 'Geistmoor',
    enemyIds: ['spore-moth', 'lizardman-acolyte', 'human-lancer', 'stray-echo', 'bog-terror', 'mordrahn-vanguard'],
    magiculeReward: 12
  },
  {
    id: 'jura-battlefield',
    name: 'Jura-Schlachtfeld',
    enemyIds: ['orc-grunt', 'orc-soldier', 'orc-general', 'orc-lord', 'ogre-warrior', 'human-lancer', 'human-deserter'],
    magiculeReward: 16
  },
  {
    id: 'blumund',
    name: 'Blumund-Umland',
    enemyIds: ['blumund-bandit', 'human-deserter'],
    magiculeReward: 8
  },
  {
    id: 'freedom-academy',
    name: 'Freiheitsakademie',
    enemyIds: ['academy-wisp', 'stray-echo'],
    magiculeReward: 8
  }
] as const;

const MASTERY_FLAG_PREFIX = 'bestiary.mastery.';

// Persistenz-Flag, das eine bereits ausgezahlte Jagdgrund-Meisterschaft merkt
// (verhindert doppelte Belohnung ueber Save-/Kampf-Grenzen hinweg).
export function huntingGroundMasteryFlag(groundId: string): string {
  return `${MASTERY_FLAG_PREFIX}${groundId}`;
}

export interface HuntingGroundProgress {
  readonly id: string;
  readonly name: string;
  readonly total: number;
  readonly analyzedCount: number;
  readonly complete: boolean;
  readonly rewarded: boolean;
  readonly magiculeReward: number;
}

// Fortschritt je Jagdgrund aus dem persistierten Analyse-Wissen + den Flags.
export function evaluateHuntingGrounds(
  analyzedEnemyIds: readonly string[],
  flags: Readonly<Record<string, boolean>>
): readonly HuntingGroundProgress[] {
  const analyzed = new Set(analyzedEnemyIds);
  return HUNTING_GROUNDS.map((ground) => {
    const analyzedCount = ground.enemyIds.filter((id) => analyzed.has(id)).length;
    const complete = analyzedCount === ground.enemyIds.length;
    return {
      id: ground.id,
      name: ground.name,
      total: ground.enemyIds.length,
      analyzedCount,
      complete,
      rewarded: flags[huntingGroundMasteryFlag(ground.id)] === true,
      magiculeReward: ground.magiculeReward
    };
  });
}

// Kompakte Zusammenfassung fuer die Codex-Fusszeile: gemeisterte / gesamte Jagdgruende.
export function summarizeHuntingGrounds(
  analyzedEnemyIds: readonly string[],
  flags: Readonly<Record<string, boolean>>
): { readonly mastered: number; readonly total: number } {
  const progress = evaluateHuntingGrounds(analyzedEnemyIds, flags);
  return {
    mastered: progress.filter((entry) => entry.complete).length,
    total: progress.length
  };
}

export interface HuntingGroundReward {
  readonly groundId: string;
  readonly name: string;
  readonly magicules: number;
  readonly flag: string;
}

// Alle Jagdgruende, die JETZT vollstaendig studiert sind, aber noch nicht
// belohnt wurden (Flag ungesetzt). Der Aufrufer bucht Magicules + Flag ein.
// Deterministisch; keine Zufalls-/Zeitabhaengigkeit.
export function collectHuntingGroundRewards(
  analyzedEnemyIds: readonly string[],
  flags: Readonly<Record<string, boolean>>
): readonly HuntingGroundReward[] {
  return evaluateHuntingGrounds(analyzedEnemyIds, flags)
    .filter((entry) => entry.complete && !entry.rewarded)
    .map((entry) => ({
      groundId: entry.id,
      name: entry.name,
      magicules: entry.magiculeReward,
      flag: huntingGroundMasteryFlag(entry.id)
    }));
}

// Jagdgruende, deren Meisterschafts-Flag zwischen zwei Flag-Staenden neu gesetzt
// wurde — fuer die Sieg-Praesentation (Vorher/Nachher-Diff).
export function newlyMasteredHuntingGrounds(
  beforeFlags: Readonly<Record<string, boolean>>,
  afterFlags: Readonly<Record<string, boolean>>
): readonly HuntingGround[] {
  return HUNTING_GROUNDS.filter((ground) => {
    const flag = huntingGroundMasteryFlag(ground.id);
    return afterFlags[flag] === true && beforeFlags[flag] !== true;
  });
}
