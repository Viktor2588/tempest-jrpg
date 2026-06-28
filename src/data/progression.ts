import type { StatusEffectId, StatBlock } from './types';

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
  readonly skillPointReward: number;
  readonly description: string;
}

export interface RelationshipCombatBonus {
  readonly startingTeamMeter?: number;
  readonly teamAttack?: boolean;
  readonly openingStatusId?: StatusEffectId;
}

export interface RelationshipLevelDefinition {
  readonly level: number;
  readonly requiredPoints: number;
  readonly title: string;
  readonly passiveBonus: Partial<StatBlock>;
  readonly partnerPassiveBonus?: Partial<StatBlock>;
  readonly combatBonus?: RelationshipCombatBonus;
  readonly skillIds?: readonly string[];
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

export interface CatchUpConfig {
  readonly maxLevelGap: number;
  readonly reserveExperienceRate: number;
  readonly chapterBaselines: Readonly<Record<string, number>>;
}

export interface SkillTreeNodeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly requiredLevel: number;
  readonly requiredNodeIds: readonly string[];
  readonly requiredEvolutionId?: string;
  readonly requiredRelationshipLevel?: {
    readonly relationshipId: string;
    readonly level: number;
  };
  readonly requiredFlag?: string;
  readonly requiredRegionId?: string;
  readonly skillId?: string;
  readonly statBonus?: Partial<StatBlock>;
}

export interface SkillTreeDefinition {
  readonly id: string;
  readonly characterId: string;
  readonly name: string;
  readonly nodes: readonly SkillTreeNodeDefinition[];
}

export interface EquipmentSetTierDefinition {
  readonly pieces: number;
  readonly statBonus: Partial<StatBlock>;
}

export interface EquipmentSetDefinition {
  readonly id: string;
  readonly name: string;
  readonly itemIds: readonly string[];
  readonly tiers: readonly EquipmentSetTierDefinition[];
}

export const PROGRESSION_REGIONS = [
  {
    id: 'tempest-grove',
    name: 'Tempest-Hain',
    chapterId: 'chapter-1',
    baselineLevel: 3,
    encounterIds: ['training-clearing', 'east-grass', 'direwolf-pack-leader', 'whispering-grove-ambush'],
    enemyIds: ['forest-slime', 'direwolf-pup', 'direwolf-alpha', 'spore-moth', 'orc-scout']
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
    enemyIds: ['lizardman-acolyte', 'spore-moth', 'mordrahn-echo']
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
    regionId: 'tempest-grove',
    rivalEnemyIds: ['direwolf-pup', 'direwolf-alpha', 'orc-scout'],
    description: 'Gobtas Linie verbindet schnelle Goblin-Technik mit dem frühen Direwolf-Pakt von Tempest.'
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
    skillPointReward: 2,
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
    skillPointReward: 2,
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
    skillPointReward: 2,
    description: 'Shunas Namensentwicklung verschiebt sie klar in Richtung Heilung und Barrieren.'
  }
] as const satisfies readonly EvolutionDefinition[];

export const RELATIONSHIPS = [
  {
    id: 'rimuru-gobta',
    characterId: 'rimuru',
    partnerId: 'gobta',
    partnerName: 'Gobta',
    partnerKind: 'party',
    levels: [
      {
        level: 1,
        requiredPoints: 20,
        title: 'Gemeinsame Patrouille',
        passiveBonus: { defense: 1 },
        partnerPassiveBonus: { agility: 1 },
        combatBonus: { startingTeamMeter: 20 }
      },
      {
        level: 2,
        requiredPoints: 60,
        title: 'Tempest-Doppelschlag',
        passiveBonus: { attack: 2, magic: 2 },
        partnerPassiveBonus: { attack: 2, agility: 2 },
        combatBonus: { startingTeamMeter: 35, teamAttack: true }
      },
      {
        level: 3,
        requiredPoints: 120,
        title: 'Sturmvorhut',
        passiveBonus: { attack: 3, magic: 3, agility: 2 },
        partnerPassiveBonus: { attack: 3, defense: 2, agility: 3 },
        combatBonus: {
          startingTeamMeter: 50,
          teamAttack: true,
          openingStatusId: 'attack-up'
        }
      }
    ],
    scenes: [
      {
        id: 'rimuru-gobta-patrol',
        requiredLevel: 1,
        title: 'Patrouille zu zweit',
        summary: 'Rimuru und Gobta lernen, ihre improvisierten Angriffe aufeinander abzustimmen.'
      },
      {
        id: 'rimuru-gobta-storm-drill',
        requiredLevel: 2,
        title: 'Sturmtraining',
        summary: 'Ein gemeinsames Manöver wird zum verlässlichen Team-Angriff.'
      }
    ]
  },
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
        passiveBonus: { attack: 2, agility: 3 }
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
      },
      {
        id: 'wolf-fang-first-ride',
        requiredLevel: 1,
        title: 'Erster Ritt am Dorfrand',
        summary: 'Das Wolfsfang-Abzeichen macht Gobtas Reiterpfad greifbar: kein Mount-System im Prolog, aber ein klarer Pakt für später.',
        flagId: 'progression.gobta.wolf-fang-token'
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

export const CATCH_UP_CONFIG = {
  maxLevelGap: 2,
  reserveExperienceRate: 0.5,
  chapterBaselines: {
    'chapter-1': 3,
    'chapter-2': 5,
    'chapter-3': 7
  }
} as const satisfies CatchUpConfig;

export const SKILL_TREES = [
  {
    id: 'rimuru-adaptation-tree',
    characterId: 'rimuru',
    name: 'Adaptive Essenz',
    nodes: [
      {
        id: 'rimuru-fluid-core',
        name: 'Fließender Kern',
        description: 'Verdichtet Magie und erhöht die MP-Reserve.',
        cost: 1,
        requiredLevel: 2,
        requiredNodeIds: [],
        statBonus: { maxMp: 4, magic: 1 }
      },
      {
        id: 'rimuru-predator-instinct',
        name: 'Raubtierinstinkt',
        description: 'Öffnet nach der Entwicklung den Zugriff auf Giftdorn.',
        cost: 1,
        requiredLevel: 4,
        requiredNodeIds: ['rimuru-fluid-core'],
        requiredEvolutionId: 'rimuru-predator-slime',
        skillId: 'venom-spit'
      },
      {
        id: 'rimuru-marsh-runner',
        name: 'Marschenläufer-Instinkt',
        description: 'Wandelt Sumpferkundung in Tempo und robuste Geländekontrolle um.',
        cost: 1,
        requiredLevel: 4,
        requiredNodeIds: ['rimuru-fluid-core'],
        requiredRegionId: 'marsh-border',
        statBonus: { maxHp: 3, agility: 3 }
      },
      {
        id: 'rimuru-shadow-domain',
        name: 'Schattendomäne',
        description: 'Verstärkt Schattenmagie und lehrt Geistfessel.',
        cost: 2,
        requiredLevel: 6,
        requiredNodeIds: ['rimuru-predator-instinct'],
        skillId: 'spirit-bind',
        statBonus: { magic: 3, spirit: 2 }
      },
      {
        id: 'rimuru-predator-sage',
        name: 'Raubtier-Weiser',
        description: 'Faltet die frühere Raubtier-Weiser-Rolle in eine fokussierte Magie-Talentspitze.',
        cost: 2,
        requiredLevel: 7,
        requiredNodeIds: ['rimuru-shadow-domain'],
        requiredEvolutionId: 'rimuru-predator-slime',
        statBonus: { maxMp: 8, magic: 3, spirit: 2, agility: 1 }
      }
    ]
  },
  {
    id: 'gobta-pack-tree',
    characterId: 'gobta',
    name: 'Rudeltaktik',
    nodes: [
      {
        id: 'gobta-pack-footwork',
        name: 'Rudelschritt',
        description: 'Verbessert Gobtas Initiative.',
        cost: 1,
        requiredLevel: 2,
        requiredNodeIds: [],
        statBonus: { agility: 2 }
      },
      {
        id: 'gobta-rider-feint',
        name: 'Reiterfinte',
        description: 'Lehrt den Schnellen Schritt, sobald Tempests Direwolf-Pakt Gobtas Reiterpfad eröffnet.',
        cost: 1,
        requiredLevel: 4,
        requiredNodeIds: ['gobta-pack-footwork'],
        requiredFlag: 'progression.gobta.wolf-fang-token',
        skillId: 'quick-step'
      },
      {
        id: 'gobta-marsh-runner',
        name: 'Marschenläufer',
        description: 'Macht Sumpferkundung zu schneller Flankenarbeit und lehrt Sturmböe.',
        cost: 1,
        requiredLevel: 4,
        requiredNodeIds: ['gobta-pack-footwork'],
        requiredRegionId: 'marsh-border',
        skillId: 'storm-gust',
        statBonus: { attack: 1, spirit: 1, agility: 4 }
      },
      {
        id: 'gobta-tempest-knight',
        name: 'Tempest-Ritter',
        description: 'Bindet Rangas Rudel-Timing an robuste Frontwerte und Direwolf-Druck.',
        cost: 2,
        requiredLevel: 5,
        requiredNodeIds: ['gobta-rider-feint'],
        requiredRelationshipLevel: {
          relationshipId: 'gobta-ranga',
          level: 2
        },
        skillId: 'direwolf-rush',
        statBonus: { maxHp: 8, attack: 3, defense: 3, agility: 1 }
      },
      {
        id: 'gobta-alpha-charge',
        name: 'Alpha-Ansturm',
        description: 'Verbindet die benannte Form mit dem Direwolf-Ansturm.',
        cost: 2,
        requiredLevel: 6,
        requiredNodeIds: ['gobta-rider-feint'],
        requiredEvolutionId: 'gobta-hobgoblin-guard',
        skillId: 'direwolf-rush',
        statBonus: { attack: 3, agility: 2 }
      }
    ]
  },
  {
    id: 'shuna-weaving-tree',
    characterId: 'shuna',
    name: 'Geistgewebe',
    nodes: [
      {
        id: 'shuna-prayer-thread',
        name: 'Gebetsfaden',
        description: 'Stärkt Geist und MP.',
        cost: 1,
        requiredLevel: 2,
        requiredNodeIds: [],
        statBonus: { maxMp: 4, spirit: 2 }
      },
      {
        id: 'shuna-warding-weave',
        name: 'Schutzgewebe',
        description: 'Lehrt das Barrieregebet.',
        cost: 1,
        requiredLevel: 4,
        requiredNodeIds: ['shuna-prayer-thread'],
        skillId: 'barrier-prayer'
      },
      {
        id: 'shuna-spirit-weaver',
        name: 'Geistweberin',
        description: 'Verwandelt Tempests Vertrauen in stärkere Heil- und Barrierewerte.',
        cost: 2,
        requiredLevel: 5,
        requiredNodeIds: ['shuna-warding-weave'],
        requiredFlag: 'bond.rigurd.trust-1',
        skillId: 'sacred-weave',
        statBonus: { maxMp: 8, magic: 2, spirit: 4 }
      },
      {
        id: 'shuna-sacred-circle',
        name: 'Sakralkreis',
        description: 'Vollendet das Gewebe der benannten Kijin-Form.',
        cost: 2,
        requiredLevel: 6,
        requiredNodeIds: ['shuna-warding-weave'],
        requiredEvolutionId: 'shuna-kijin-weaver',
        skillId: 'sacred-weave',
        statBonus: { magic: 2, spirit: 3 }
      }
    ]
  }
] as const satisfies readonly SkillTreeDefinition[];

export const EQUIPMENT_SETS = [
  {
    id: 'tempest-initiate',
    name: 'Tempest-Anwärter',
    itemIds: ['tempest-training-sword', 'traveler-cloak', 'tempest-charm'],
    tiers: [
      {
        pieces: 2,
        statBonus: { defense: 2, agility: 1 }
      },
      {
        pieces: 3,
        statBonus: { maxHp: 8, attack: 2, spirit: 2 }
      }
    ]
  }
] as const satisfies readonly EquipmentSetDefinition[];
