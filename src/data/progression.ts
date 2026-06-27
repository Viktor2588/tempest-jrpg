import type { StatBlock } from './types';

export type ProgressionUnlockSource = 'story' | 'evolution' | 'bond' | 'exploration';

export interface RegionProgressionDefinition {
  readonly id: string;
  readonly name: string;
  readonly chapterId: string;
  readonly baselineLevel: number;
  readonly encounterIds: readonly string[];
  readonly enemyIds: readonly string[];
}

export interface ProgressionLineDefinition {
  readonly id: string;
  readonly characterId: string;
  readonly name: string;
  readonly speciesLine: string;
  readonly regionId: string;
  readonly rivalEnemyIds: readonly string[];
  readonly description: string;
}

export interface EvolutionDefinition {
  readonly id: string;
  readonly lineId: string;
  readonly characterId: string;
  readonly formName: string;
  readonly rank: number;
  readonly requiredLevel: number;
  readonly requiresCustomName: boolean;
  readonly statBonus: Partial<StatBlock>;
  readonly skillIds: readonly string[];
  readonly unlockedJobIds: readonly string[];
  readonly description: string;
}

export interface RelationshipLevelDefinition {
  readonly level: number;
  readonly requiredPoints: number;
  readonly title: string;
  readonly passiveBonus: Partial<StatBlock>;
  readonly skillIds?: readonly string[];
  readonly unlockedJobIds?: readonly string[];
}

export interface RelationshipSceneDefinition {
  readonly id: string;
  readonly requiredLevel: number;
  readonly title: string;
  readonly summary: string;
  readonly flagId?: string;
}

export interface RelationshipDefinition {
  readonly id: string;
  readonly characterId: string;
  readonly partnerId: string;
  readonly partnerName: string;
  readonly partnerKind: 'npc' | 'party' | 'monster' | 'faction';
  readonly levels: readonly RelationshipLevelDefinition[];
  readonly scenes: readonly RelationshipSceneDefinition[];
}

export interface JobUnlockDefinition {
  readonly id: string;
  readonly jobId: string;
  readonly source: ProgressionUnlockSource;
  readonly characterId?: string;
  readonly requiredEvolutionId?: string;
  readonly requiredRelationshipLevel?: {
    readonly relationshipId: string;
    readonly level: number;
  };
  readonly requiredFlag?: string;
  readonly requiredRegionId?: string;
}

export interface CatchUpConfig {
  readonly maxLevelGap: number;
  readonly reserveExperienceRate: number;
  readonly chapterBaselines: Readonly<Record<string, number>>;
}

export const PROGRESSION_REGIONS = [
  {
    id: 'tempest-grove',
    name: 'Tempest-Hain',
    chapterId: 'chapter-1',
    baselineLevel: 3,
    encounterIds: ['training-clearing', 'east-grass'],
    enemyIds: ['forest-slime', 'direwolf-pup']
  },
  {
    id: 'marsh-border',
    name: 'Sumpfrand',
    chapterId: 'chapter-2',
    baselineLevel: 5,
    encounterIds: ['marsh-border-watch'],
    enemyIds: ['spore-moth', 'orc-scout']
  },
  {
    id: 'spirit-shrine',
    name: 'Geistschrein',
    chapterId: 'chapter-3',
    baselineLevel: 7,
    encounterIds: ['shrine-approach'],
    enemyIds: ['lizardman-acolyte', 'spore-moth']
  }
] as const satisfies readonly RegionProgressionDefinition[];

export const PROGRESSION_LINES = [
  {
    id: 'rimuru-slime-line',
    characterId: 'rimuru',
    name: 'Benannter Schleim',
    speciesLine: 'Schleim → Raubtier-Schleim',
    regionId: 'tempest-grove',
    rivalEnemyIds: ['forest-slime', 'spore-moth'],
    description: 'Rimurus Namensgebung verdichtet Magie und schaltet adaptive Schattenmagie frei.'
  },
  {
    id: 'gobta-direwolf-line',
    characterId: 'gobta',
    name: 'Hobgoblin-Reiter',
    speciesLine: 'Goblin → Hobgoblin-Wächter',
    regionId: 'marsh-border',
    rivalEnemyIds: ['direwolf-pup', 'orc-scout'],
    description: 'Gobtas Linie verbindet schnelle Goblin-Technik mit Direwolf-Teamdruck.'
  },
  {
    id: 'shuna-ogre-line',
    characterId: 'shuna',
    name: 'Kijin-Geistweberin',
    speciesLine: 'Ogerin → Kijin-Geistweberin',
    regionId: 'spirit-shrine',
    rivalEnemyIds: ['lizardman-acolyte', 'spore-moth'],
    description: 'Shunas Entwicklung stärkt Heilung, Geist und Teamstabilität.'
  }
] as const satisfies readonly ProgressionLineDefinition[];

export const EVOLUTIONS = [
  {
    id: 'rimuru-predator-slime',
    lineId: 'rimuru-slime-line',
    characterId: 'rimuru',
    formName: 'Raubtier-Schleim',
    rank: 2,
    requiredLevel: 4,
    requiresCustomName: true,
    statBonus: {
      maxHp: 18,
      maxMp: 14,
      magic: 5,
      spirit: 3,
      agility: 2
    },
    skillIds: ['predator-aura'],
    unlockedJobIds: ['predator-sage'],
    description: 'Ein benannter Kern macht Rimuru zu einer fokussierten Magie-/Adaptionsrolle.'
  },
  {
    id: 'gobta-hobgoblin-guard',
    lineId: 'gobta-direwolf-line',
    characterId: 'gobta',
    formName: 'Hobgoblin-Wächter',
    rank: 2,
    requiredLevel: 4,
    requiresCustomName: true,
    statBonus: {
      maxHp: 20,
      attack: 5,
      defense: 4,
      agility: 3
    },
    skillIds: ['direwolf-rush'],
    unlockedJobIds: [],
    description: 'Gobtas benannte Form stabilisiert die Front, ohne seine Initiative zu verlieren.'
  },
  {
    id: 'shuna-kijin-weaver',
    lineId: 'shuna-ogre-line',
    characterId: 'shuna',
    formName: 'Kijin-Geistweberin',
    rank: 2,
    requiredLevel: 5,
    requiresCustomName: true,
    statBonus: {
      maxMp: 16,
      magic: 4,
      spirit: 6
    },
    skillIds: ['sacred-weave'],
    unlockedJobIds: [],
    description: 'Shunas Namensentwicklung verschiebt sie klar in Richtung Heilung und Barrieren.'
  }
] as const satisfies readonly EvolutionDefinition[];

export const RELATIONSHIPS = [
  {
    id: 'rimuru-rigurd',
    characterId: 'rimuru',
    partnerId: 'rigurd',
    partnerName: 'Rigurd',
    partnerKind: 'npc',
    levels: [
      {
        level: 1,
        requiredPoints: 20,
        title: 'Verlässlicher Gründer',
        passiveBonus: { spirit: 1 }
      },
      {
        level: 2,
        requiredPoints: 60,
        title: 'Dorfvertrauen',
        passiveBonus: { maxHp: 6, defense: 2 }
      },
      {
        level: 3,
        requiredPoints: 120,
        title: 'Tempest-Stimme',
        passiveBonus: { maxHp: 10, maxMp: 6, spirit: 3 }
      }
    ],
    scenes: [
      {
        id: 'rigurd-patrol-thanks',
        requiredLevel: 1,
        title: 'Nach der ersten Patrouille',
        summary: 'Rigurd erklärt, warum Tempest seine Patrouillen dokumentiert.',
        flagId: 'bond.rigurd.trust-1'
      }
    ]
  },
  {
    id: 'gobta-ranga',
    characterId: 'gobta',
    partnerId: 'ranga',
    partnerName: 'Ranga',
    partnerKind: 'monster',
    levels: [
      {
        level: 1,
        requiredPoints: 25,
        title: 'Witterung',
        passiveBonus: { agility: 2 }
      },
      {
        level: 2,
        requiredPoints: 75,
        title: 'Rudel-Timing',
        passiveBonus: { attack: 2, agility: 3 },
        unlockedJobIds: ['tempest-knight']
      },
      {
        level: 3,
        requiredPoints: 140,
        title: 'Direwolf-Sprint',
        passiveBonus: { attack: 4, agility: 5 },
        skillIds: ['direwolf-rush']
      }
    ],
    scenes: [
      {
        id: 'ranga-training-dash',
        requiredLevel: 2,
        title: 'Rudeltraining',
        summary: 'Gobta lernt, seine Finte mit Rangas Sprintfenstern zu verzahnen.'
      }
    ]
  },
  {
    id: 'shuna-tempest',
    characterId: 'shuna',
    partnerId: 'tempest',
    partnerName: 'Tempest',
    partnerKind: 'faction',
    levels: [
      {
        level: 1,
        requiredPoints: 20,
        title: 'Tempest-Ritual',
        passiveBonus: { spirit: 2 }
      },
      {
        level: 2,
        requiredPoints: 70,
        title: 'Webkreis',
        passiveBonus: { maxMp: 8, magic: 2 }
      },
      {
        level: 3,
        requiredPoints: 130,
        title: 'Schreinbindung',
        passiveBonus: { maxMp: 12, magic: 3, spirit: 4 },
        skillIds: ['sacred-weave']
      }
    ],
    scenes: [
      {
        id: 'tempest-evening-weave',
        requiredLevel: 1,
        title: 'Abend am Webkreis',
        summary: 'Shuna nutzt ruhige Stadtmomente, um Barrierefäden für das Team vorzubereiten.'
      }
    ]
  }
] as const satisfies readonly RelationshipDefinition[];

export const JOB_UNLOCKS = [
  {
    id: 'unlock-predator-sage',
    jobId: 'predator-sage',
    source: 'evolution',
    characterId: 'rimuru',
    requiredEvolutionId: 'rimuru-predator-slime'
  },
  {
    id: 'unlock-tempest-knight',
    jobId: 'tempest-knight',
    source: 'bond',
    characterId: 'gobta',
    requiredRelationshipLevel: {
      relationshipId: 'gobta-ranga',
      level: 2
    }
  },
  {
    id: 'unlock-spirit-weaver',
    jobId: 'spirit-weaver',
    source: 'story',
    characterId: 'shuna',
    requiredFlag: 'bond.rigurd.trust-1'
  },
  {
    id: 'unlock-marsh-runner',
    jobId: 'marsh-runner',
    source: 'exploration',
    requiredRegionId: 'marsh-border'
  }
] as const satisfies readonly JobUnlockDefinition[];

export const CATCH_UP_CONFIG = {
  maxLevelGap: 2,
  reserveExperienceRate: 0.5,
  chapterBaselines: {
    'chapter-1': 3,
    'chapter-2': 5,
    'chapter-3': 7
  }
} as const satisfies CatchUpConfig;
