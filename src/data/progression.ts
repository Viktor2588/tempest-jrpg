import type { StatusEffectId, StatBlock, TalentPerk } from './types';

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
  // Phase 70 — Spezialisierungsstrang; das Wählen eines Strangs sperrt die anderen (Branch-Lock).
  readonly branch?: string;
  // Phase 70 — passive Perks/Procs, die dieser Knoten gewährt (Phase-69-Engine).
  readonly perks?: readonly TalentPerk[];
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
  },
  { id: 'benimaru-ogre-line', characterId: 'benimaru', name: 'Kijin-General', speciesLine: 'Oger → Kijin-General', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior', 'orc-soldier'], description: 'Benimarus Linie verbindet Ogerkraft mit der Schwarzflamme zum Generalsrang.' },
  { id: 'shion-ogre-line', characterId: 'shion', name: 'Kijin-Leibwache', speciesLine: 'Oger → Kijin-Leibwache', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior', 'orc-general'], description: 'Shions Linie maximiert Konstitution und rohe Kraft.' },
  { id: 'hakurou-ogre-line', characterId: 'hakurou', name: 'Kijin-Schwertheiliger', speciesLine: 'Oger → Kijin-Schwertheiliger', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior', 'lizardman-warrior'], description: 'Hakurous Linie verfeinert Geschwindigkeit und Schwertkunst.' },
  { id: 'souei-ogre-line', characterId: 'souei', name: 'Kijin-Schatten', speciesLine: 'Oger → Kijin-Schatten', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior', 'masked-majin'], description: 'Soueis Linie schärft Tempo, Verdeckung und Präzision.' }
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
  },
  { id: 'benimaru-kijin', lineId: 'benimaru-ogre-line', characterId: 'benimaru', formName: 'Kijin-General', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 18, attack: 4, magic: 5 }, skillIds: ['black-flame'], skillPointReward: 2, description: 'Rimurus Benennung verwandelt den Oger in einen Kijin-General mit Schwarzflamme.' },
  { id: 'shion-kijin', lineId: 'shion-ogre-line', characterId: 'shion', formName: 'Kijin-Leibwache', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 26, attack: 5, defense: 3 }, skillIds: ['ogre-smash'], skillPointReward: 2, description: 'Die Benennung formt die monströse Kraft der Oger-Leibwache.' },
  { id: 'hakurou-kijin', lineId: 'hakurou-ogre-line', characterId: 'hakurou', formName: 'Kijin-Schwertheiliger', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 14, attack: 4, agility: 5 }, skillIds: ['quick-step'], skillPointReward: 2, description: 'Der alte Schwertmeister steigt durch die Benennung zum Kijin auf.' },
  { id: 'souei-kijin', lineId: 'souei-ogre-line', characterId: 'souei', formName: 'Kijin-Schatten', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 14, agility: 6, attack: 3 }, skillIds: ['venom-spit'], skillPointReward: 2, description: 'Der stille Oger wird durch die Benennung zum Kijin-Schatten.' }
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
        passiveBonus: { spirit: 1 },
        combatBonus: { startingTeamMeter: 15 }
      },
      {
        level: 2,
        requiredPoints: 60,
        title: 'Dorfvertrauen',
        passiveBonus: { maxHp: 6, defense: 2 },
        combatBonus: { startingTeamMeter: 30, teamAttack: true }
      },
      {
        level: 3,
        requiredPoints: 120,
        title: 'Tempest-Stimme',
        passiveBonus: { maxHp: 10, maxMp: 6, spirit: 3 },
        combatBonus: { startingTeamMeter: 45, teamAttack: true, openingStatusId: 'defense-up' }
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
        passiveBonus: { agility: 2 },
        combatBonus: { startingTeamMeter: 15 }
      },
      {
        level: 2,
        requiredPoints: 75,
        title: 'Rudel-Timing',
        passiveBonus: { attack: 2, agility: 3 },
        combatBonus: { startingTeamMeter: 30, teamAttack: true }
      },
      {
        level: 3,
        requiredPoints: 140,
        title: 'Direwolf-Sprint',
        passiveBonus: { attack: 4, agility: 5 },
        skillIds: ['direwolf-rush'],
        combatBonus: { startingTeamMeter: 45, teamAttack: true, openingStatusId: 'haste' }
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
  },
  {
    id: 'rimuru-veldora',
    characterId: 'rimuru',
    partnerId: 'sealed-storm-dragon',
    partnerName: 'Veldora',
    partnerKind: 'monster',
    levels: [
      { level: 1, requiredPoints: 30, title: 'Mangafreund', passiveBonus: { maxMp: 6, magic: 2 }, combatBonus: { startingTeamMeter: 25 } },
      { level: 2, requiredPoints: 80, title: 'Sturm-Resonanz', passiveBonus: { maxMp: 12, magic: 4 }, combatBonus: { startingTeamMeter: 40 } },
      { level: 3, requiredPoints: 150, title: 'Verda-Bund', passiveBonus: { maxMp: 18, magic: 6, spirit: 3 }, combatBonus: { startingTeamMeter: 55, openingStatusId: 'magic-up' } }
    ],
    scenes: [
      { id: 'veldora-manga-night', requiredLevel: 1, title: 'Manga im Magenraum', summary: 'Rimuru teilt Geschichten mit dem versiegelten Sturmdrachen und festigt ihre Freundschaft.', flagId: 'bond-veldora-1' },
      { id: 'veldora-name-bond', requiredLevel: 3, title: 'Bund der Namensgebung', summary: 'Die geteilte Magie zwischen Rimuru und Veldora verstärkt beider Sturmkraft.' }
    ]
  },
  {
    id: 'rimuru-benimaru',
    characterId: 'rimuru',
    partnerId: 'benimaru',
    partnerName: 'Benimaru',
    partnerKind: 'party',
    levels: [
      { level: 1, requiredPoints: 25, title: 'Treueschwur', passiveBonus: { attack: 1, defense: 1 }, partnerPassiveBonus: { attack: 1 }, combatBonus: { startingTeamMeter: 20 } },
      { level: 2, requiredPoints: 70, title: 'Generalsband', passiveBonus: { attack: 2, magic: 2 }, partnerPassiveBonus: { attack: 2, magic: 2 }, combatBonus: { startingTeamMeter: 35, teamAttack: true } },
      { level: 3, requiredPoints: 130, title: 'Schwarzflammen-Pakt', passiveBonus: { attack: 3, magic: 3, maxHp: 8 }, partnerPassiveBonus: { attack: 4, magic: 3 }, combatBonus: { startingTeamMeter: 50, teamAttack: true, openingStatusId: 'attack-up' } }
    ],
    scenes: [
      { id: 'benimaru-oath', requiredLevel: 1, title: 'Schwur des Generals', summary: 'Benimaru gelobt Rimuru als erster der Oger ewige Gefolgschaft.', flagId: 'bond-benimaru-1' },
      { id: 'benimaru-blackflame', requiredLevel: 3, title: 'Vereinte Schwarzflamme', summary: 'Rimurus Vertrauen entfacht Benimarus Schwarzflamme zu voller Stärke.' }
    ]
  },
  {
    id: 'rimuru-shion',
    characterId: 'rimuru',
    partnerId: 'shion',
    partnerName: 'Shion',
    partnerKind: 'party',
    levels: [
      { level: 1, requiredPoints: 25, title: 'Leibwächterin', passiveBonus: { maxHp: 8, defense: 1 }, partnerPassiveBonus: { attack: 1 }, combatBonus: { startingTeamMeter: 20 } },
      { level: 2, requiredPoints: 70, title: 'Unerschütterlich', passiveBonus: { maxHp: 14, defense: 2 }, partnerPassiveBonus: { attack: 3, maxHp: 10 }, combatBonus: { startingTeamMeter: 35, teamAttack: true } },
      { level: 3, requiredPoints: 130, title: 'Sturmwächterin', passiveBonus: { maxHp: 22, defense: 3, attack: 2 }, partnerPassiveBonus: { attack: 5, maxHp: 16 }, combatBonus: { startingTeamMeter: 50, teamAttack: true, openingStatusId: 'defense-up' } }
    ],
    scenes: [
      { id: 'shion-devotion', requiredLevel: 1, title: 'Grenzenlose Hingabe', summary: 'Shion stellt sich kompromisslos vor Rimuru und stählt ihren Körper.', flagId: 'bond-shion-1' },
      { id: 'shion-guardian', requiredLevel: 3, title: 'Wächterin des Sturms', summary: 'Shions Wille macht sie zur unzerstörbaren Mauer an Rimurus Seite.' }
    ]
  },
  {
    id: 'rimuru-milim',
    characterId: 'rimuru',
    partnerId: 'milim',
    partnerName: 'Milim Nava',
    partnerKind: 'monster',
    levels: [
      { level: 1, requiredPoints: 40, title: 'Neugieriger Demonlord', passiveBonus: { attack: 2 }, combatBonus: { startingTeamMeter: 20 } },
      { level: 2, requiredPoints: 100, title: 'Honigfreundschaft', passiveBonus: { attack: 4, agility: 2 }, combatBonus: { startingTeamMeter: 40 } },
      { level: 3, requiredPoints: 180, title: 'Drachenfaust-Bund', passiveBonus: { attack: 6, agility: 3, maxHp: 10 }, combatBonus: { startingTeamMeter: 60, openingStatusId: 'attack-up' } }
    ],
    scenes: [
      { id: 'milim-honey', requiredLevel: 1, title: 'Honig besiegt den Demonlord', summary: 'Rimuru gewinnt Milims Freundschaft mit einem Glas Honig statt einer Schlacht.', flagId: 'bond-milim-1' },
      { id: 'milim-dragon-fist', requiredLevel: 3, title: 'Bund der Drachenfaust', summary: 'Milims Vertrauen verleiht Rimurus Sturm einen Hauch von Drachenzerstörung.' }
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
    name: 'Drei Wege der Essenz',
    nodes: [
      {
        id: 'rimuru-fluid-core',
        name: 'Fließender Kern',
        description: 'Strang Verschlinger: verdichtet Beute-Essenzen und erhöht die Aneignungschance.',
        cost: 1,
        requiredLevel: 2,
        requiredNodeIds: [],
        branch: 'predator',
        perks: [{ kind: 'devour-chance', percent: 10 }],
        statBonus: { maxMp: 4, magic: 1 }
      },
      {
        id: 'rimuru-predator-instinct',
        name: 'Raubtierinstinkt',
        description: 'Die benannte Schleimform liest verwundbare Gegner sicherer.',
        cost: 1,
        requiredLevel: 4,
        requiredNodeIds: ['rimuru-fluid-core'],
        branch: 'predator',
        perks: [{ kind: 'devour-chance', percent: 15 }]
      },
      {
        id: 'rimuru-predator-devour',
        name: 'Verschlinger-Archiv',
        description: 'Stabilisiert verschlungene Essenzen, damit Rimuru absorbierte Skills kontrolliert ins Kampf-Loadout nimmt.',
        cost: 1,
        requiredLevel: 5,
        requiredNodeIds: ['rimuru-predator-instinct'],
        requiredFlag: 'codex.predator-devour',
        branch: 'predator',
        perks: [{ kind: 'devour-chance', percent: 15 }, { kind: 'max-hp', percent: 10 }],
        statBonus: { maxMp: 4, spirit: 1 }
      },
      {
        id: 'rimuru-predator-sage',
        name: 'Raubtier-Weiser',
        description: 'Vollendung des Verschlinger-Strangs: Schattenbeute wird sicherer und stärker.',
        cost: 2,
        requiredLevel: 7,
        requiredNodeIds: ['rimuru-predator-devour'],
        requiredEvolutionId: 'rimuru-predator-slime',
        branch: 'predator',
        perks: [{ kind: 'devour-chance', percent: 15 }, { kind: 'damage-dealt', percent: 20, element: 'shadow' }],
        statBonus: { maxMp: 8, magic: 3, spirit: 2, agility: 1 }
      },
      {
        id: 'rimuru-ancestor-binding',
        name: 'Ahnenbindung',
        description: 'Strang Großer Weiser: verarbeitet die Ahnenbindung zu tieferer Analyse.',
        cost: 1,
        requiredLevel: 4,
        requiredNodeIds: [],
        requiredFlag: 'story.act1.completed',
        branch: 'sage',
        perks: [{ kind: 'analysis-power', levels: 1 }],
        statBonus: { maxMp: 4, spirit: 2 }
      },
      {
        id: 'rimuru-sage-foresight',
        name: 'Vorhersage',
        description: 'Großer Weiser berechnet Angriffe früh genug zum Ausweichen.',
        cost: 1,
        requiredLevel: 5,
        requiredNodeIds: ['rimuru-ancestor-binding'],
        branch: 'sage',
        perks: [{ kind: 'dodge', percent: 15 }]
      },
      {
        id: 'rimuru-sage-magicule',
        name: 'Magicule-Kalkül',
        description: 'Analysierte Zauber werden effizienter und durchschlagskräftiger.',
        cost: 1,
        requiredLevel: 6,
        requiredNodeIds: ['rimuru-sage-foresight'],
        branch: 'sage',
        perks: [{ kind: 'damage-dealt', percent: 15, category: 'magical' }],
        statBonus: { maxMp: 6, magic: 2 }
      },
      {
        id: 'rimuru-sage-raphael',
        name: 'Weiser Horizont',
        description: 'Vollendung des Weiser-Strangs: maximale Analyse und Magiekontrolle.',
        cost: 2,
        requiredLevel: 9,
        requiredNodeIds: ['rimuru-sage-magicule'],
        branch: 'sage',
        perks: [{ kind: 'analysis-power', levels: 1 }, { kind: 'damage-dealt', percent: 20, category: 'magical' }]
      },
      {
        id: 'rimuru-marsh-runner',
        name: 'Marschenläufer-Instinkt',
        description: 'Strang Mimik: wandelt Sumpferkundung in adaptive Bewegung um.',
        cost: 1,
        requiredLevel: 4,
        requiredNodeIds: [],
        requiredFlag: 'story.act2.completed',
        branch: 'mimic',
        perks: [{ kind: 'dodge', percent: 10 }],
        statBonus: { maxHp: 3, agility: 3 }
      },
      {
        id: 'rimuru-shadow-domain',
        name: 'Schattendomäne',
        description: 'Verstärkt verschlungene Schattenmagie wie Geistfessel und Giftdorn.',
        cost: 1,
        requiredLevel: 6,
        requiredNodeIds: ['rimuru-marsh-runner'],
        branch: 'mimic',
        perks: [{ kind: 'damage-dealt', percent: 20, element: 'shadow' }],
        statBonus: { magic: 3, spirit: 2 }
      },
      {
        id: 'rimuru-mimic-resonance',
        name: 'Essenzen-Resonanz',
        description: 'Verschlungene Wasserklinge kann eine erbeutete Sturmböe nachziehen.',
        cost: 2,
        requiredLevel: 7,
        requiredNodeIds: ['rimuru-shadow-domain'],
        branch: 'mimic',
        perks: [{ kind: 'skill-chain', triggerSkillId: 'water-blade', followUpSkillId: 'storm-gust', percent: 40 }]
      },
      {
        id: 'rimuru-mimic-master',
        name: 'Adaptive Meisterschaft',
        description: 'Vollendung des Mimik-Strangs: erbeutete Magie formt eine robuste Kampfgestalt.',
        cost: 2,
        requiredLevel: 9,
        requiredNodeIds: ['rimuru-mimic-resonance'],
        branch: 'mimic',
        perks: [{ kind: 'damage-dealt', percent: 25, category: 'magical' }, { kind: 'max-hp', percent: 10 }]
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
        description: 'Lehrt den Schnellen Schritt, sobald Rangas Pakt und das Wolfsfang-Abzeichen Gobtas Reiterpfad eröffnen.',
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
  },
  { id: 'benimaru-tree', characterId: 'benimaru', name: 'Schwarzflammen-General', nodes: [
    // Strang 1 — Klingensturm (physisch): rohe Nahkampfwucht und Konter.
    { id: 'benimaru-blade-focus', name: 'Klingenfokus', description: 'Strang Klingensturm: schärft den physischen Angriff.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'blade', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }], statBonus: { attack: 2 } },
    { id: 'benimaru-blade-counter', name: 'Konterhaltung', description: 'Pariert Angriffe mit einem Gegenschlag.', cost: 1, requiredLevel: 5, requiredNodeIds: ['benimaru-blade-focus'], branch: 'blade', perks: [{ kind: 'counter', percent: 30 }] },
    { id: 'benimaru-blade-resolve', name: 'Kriegerherz', description: 'Zähigkeit an der Front.', cost: 1, requiredLevel: 6, requiredNodeIds: ['benimaru-blade-focus'], branch: 'blade', perks: [{ kind: 'max-hp', percent: 12 }] },
    { id: 'benimaru-blade-storm', name: 'Klingensturm', description: 'Vollendung des physischen Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['benimaru-blade-counter'], branch: 'blade', perks: [{ kind: 'damage-dealt', percent: 25, category: 'physical' }, { kind: 'counter', percent: 20 }] },
    // Strang 2 — Schwarzflamme (Feuermagie): Elementschaden und Kettenzauber.
    { id: 'benimaru-flame-focus', name: 'Flammenfokus', description: 'Strang Schwarzflamme: entfacht die konzentrierte Schwarzflamme.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'flame', perks: [{ kind: 'damage-dealt', percent: 20, element: 'fire' }], skillId: 'black-flame' },
    { id: 'benimaru-flame-mastery', name: 'Schwarzglut', description: 'Vertieft die Magie.', cost: 1, requiredLevel: 5, requiredNodeIds: ['benimaru-flame-focus'], branch: 'flame', perks: [{ kind: 'damage-dealt', percent: 15, category: 'magical' }] },
    { id: 'benimaru-flame-chain', name: 'Flammenkette', description: 'Schwarzflamme entzündet ein nachfolgendes Inferno.', cost: 2, requiredLevel: 6, requiredNodeIds: ['benimaru-flame-focus'], branch: 'flame', perks: [{ kind: 'skill-chain', triggerSkillId: 'black-flame', followUpSkillId: 'ifrit-inferno', percent: 40 }] },
    { id: 'benimaru-flame-inferno', name: 'Hölleninferno', description: 'Vollendung des Feuerstrangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['benimaru-flame-mastery'], branch: 'flame', perks: [{ kind: 'damage-dealt', percent: 25, element: 'fire' }], skillId: 'ifrit-inferno' },
    // Strang 3 — Flammenkommandant (Team-Buffs): stärkt und schützt die Gruppe.
    { id: 'benimaru-command-presence', name: 'Kommandopräsenz', description: 'Strang Flammenkommandant: eigene Buffs halten länger.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'command', perks: [{ kind: 'buff-power', percent: 100 }], skillId: 'war-cry' },
    { id: 'benimaru-command-wall', name: 'Feuerwall', description: 'Schirmt gegen erlittenen Schaden ab.', cost: 1, requiredLevel: 5, requiredNodeIds: ['benimaru-command-presence'], branch: 'command', perks: [{ kind: 'damage-taken', percent: 15 }] },
    { id: 'benimaru-command-rally', name: 'Anfeuerung', description: 'Stählt die Konstitution.', cost: 1, requiredLevel: 6, requiredNodeIds: ['benimaru-command-presence'], branch: 'command', perks: [{ kind: 'max-hp', percent: 10 }] },
    { id: 'benimaru-command-marshal', name: 'Flammenkommandant', description: 'Vollendung des Kommando-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['benimaru-command-wall'], branch: 'command', perks: [{ kind: 'buff-power', percent: 100 }, { kind: 'damage-taken', percent: 10 }] }
  ] },
  { id: 'shion-tree', characterId: 'shion', name: 'Stahlfaust-Leibwache', nodes: [
    // Strang 1 — Zermalmen (rohe Kraft)
    { id: 'shion-crush-focus', name: 'Zermalmerfokus', description: 'Strang Zermalmen: rohe physische Wucht.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'crush', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }], skillId: 'ogre-smash', statBonus: { attack: 2 } },
    { id: 'shion-crush-quake', name: 'Nachbeben', description: 'Oger-Wucht entlädt einen Folgehieb.', cost: 2, requiredLevel: 5, requiredNodeIds: ['shion-crush-focus'], branch: 'crush', perks: [{ kind: 'skill-chain', triggerSkillId: 'ogre-smash', followUpSkillId: 'orc-cleave', percent: 35 }] },
    { id: 'shion-crush-might', name: 'Titanenkraft', description: 'Steigert den physischen Schaden.', cost: 1, requiredLevel: 6, requiredNodeIds: ['shion-crush-focus'], branch: 'crush', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }] },
    { id: 'shion-crush-titan', name: 'Titanengriff', description: 'Vollendung des Zermalmen-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['shion-crush-quake'], branch: 'crush', perks: [{ kind: 'damage-dealt', percent: 25, category: 'physical' }], statBonus: { attack: 4 } },
    // Strang 2 — Bollwerk (Verteidigung)
    { id: 'shion-bulwark-body', name: 'Eisenkörper', description: 'Strang Bollwerk: monströse Konstitution.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'bulwark', perks: [{ kind: 'max-hp', percent: 15 }], skillId: 'iron-guard', statBonus: { defense: 2 } },
    { id: 'shion-bulwark-wall', name: 'Bollwerk', description: 'Verschanzte Verteidigung.', cost: 1, requiredLevel: 5, requiredNodeIds: ['shion-bulwark-body'], branch: 'bulwark', perks: [{ kind: 'damage-taken', percent: 15 }] },
    { id: 'shion-bulwark-evade', name: 'Ausfallschritt', description: 'Weicht trotz Masse aus.', cost: 1, requiredLevel: 6, requiredNodeIds: ['shion-bulwark-body'], branch: 'bulwark', perks: [{ kind: 'dodge', percent: 15 }] },
    { id: 'shion-bulwark-fortress', name: 'Festungswall', description: 'Vollendung des Bollwerk-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['shion-bulwark-wall'], branch: 'bulwark', perks: [{ kind: 'max-hp', percent: 15 }, { kind: 'damage-taken', percent: 10 }] },
    // Strang 3 — Leibwache (Team)
    { id: 'shion-guard-oath', name: 'Leibwachen-Schwur', description: 'Strang Leibwache: eigene Buffs halten länger.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'guardian', perks: [{ kind: 'buff-power', percent: 100 }], skillId: 'battle-cry' },
    { id: 'shion-guard-aegis', name: 'Schutzschild', description: 'Mindert erlittenen Schaden.', cost: 1, requiredLevel: 5, requiredNodeIds: ['shion-guard-oath'], branch: 'guardian', perks: [{ kind: 'damage-taken', percent: 12 }] },
    { id: 'shion-guard-rally', name: 'Sammelruf', description: 'Stählt die Konstitution.', cost: 1, requiredLevel: 6, requiredNodeIds: ['shion-guard-oath'], branch: 'guardian', perks: [{ kind: 'max-hp', percent: 10 }] },
    { id: 'shion-guard-marshal', name: 'Schildmarschall', description: 'Vollendung des Leibwache-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['shion-guard-aegis'], branch: 'guardian', perks: [{ kind: 'buff-power', percent: 100 }, { kind: 'counter', percent: 20 }] }
  ] },
  { id: 'hakurou-tree', characterId: 'hakurou', name: 'Schwertheiliger', nodes: [
    // Strang 1 — Blitzschnitt (Tempo)
    { id: 'hakurou-flash-focus', name: 'Blitzfokus', description: 'Strang Blitzschnitt: rasender Angriff.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'flash', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }], skillId: 'quick-step', statBonus: { agility: 2 } },
    { id: 'hakurou-flash-feint', name: 'Finte', description: 'Goblin-Finte entlädt einen Folgeschnitt.', cost: 2, requiredLevel: 5, requiredNodeIds: ['hakurou-flash-focus'], branch: 'flash', perks: [{ kind: 'skill-chain', triggerSkillId: 'goblin-feint', followUpSkillId: 'orc-cleave', percent: 35 }] },
    { id: 'hakurou-flash-evade', name: 'Windschritt', description: 'Ausweichen durch Tempo.', cost: 1, requiredLevel: 6, requiredNodeIds: ['hakurou-flash-focus'], branch: 'flash', perks: [{ kind: 'dodge', percent: 15 }] },
    { id: 'hakurou-flash-godspeed', name: 'Götterschnelle', description: 'Vollendung des Blitz-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['hakurou-flash-feint'], branch: 'flash', perks: [{ kind: 'damage-dealt', percent: 25, category: 'physical' }], statBonus: { agility: 4 } },
    // Strang 2 — Iai (Präzision/Konter)
    { id: 'hakurou-iai-stance', name: 'Iai-Haltung', description: 'Strang Iai: geduldiger Gegenschlag.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'iai', perks: [{ kind: 'counter', percent: 30 }], statBonus: { attack: 2 } },
    { id: 'hakurou-iai-read', name: 'Klingenlesen', description: 'Erhöht die Konterchance.', cost: 1, requiredLevel: 5, requiredNodeIds: ['hakurou-iai-stance'], branch: 'iai', perks: [{ kind: 'counter', percent: 20 }] },
    { id: 'hakurou-iai-edge', name: 'Scharfe Schneide', description: 'Steigert den physischen Schaden.', cost: 1, requiredLevel: 6, requiredNodeIds: ['hakurou-iai-stance'], branch: 'iai', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }] },
    { id: 'hakurou-iai-master', name: 'Schwertheiliger', description: 'Vollendung des Iai-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['hakurou-iai-read'], branch: 'iai', perks: [{ kind: 'counter', percent: 30, scale: 1.4 }] },
    // Strang 3 — Lehrmeister (Team)
    { id: 'hakurou-mentor-call', name: 'Lehrmeister', description: 'Strang Lehrmeister: eigene Buffs halten länger.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'mentor', perks: [{ kind: 'buff-power', percent: 100 }], skillId: 'battle-cry' },
    { id: 'hakurou-mentor-guard', name: 'Deckung lehren', description: 'Mindert erlittenen Schaden.', cost: 1, requiredLevel: 5, requiredNodeIds: ['hakurou-mentor-call'], branch: 'mentor', perks: [{ kind: 'damage-taken', percent: 12 }] },
    { id: 'hakurou-mentor-poise', name: 'Gelassenheit', description: 'Stählt die Konstitution.', cost: 1, requiredLevel: 6, requiredNodeIds: ['hakurou-mentor-call'], branch: 'mentor', perks: [{ kind: 'max-hp', percent: 10 }] },
    { id: 'hakurou-mentor-sage', name: 'Altmeister', description: 'Vollendung des Lehrmeister-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['hakurou-mentor-guard'], branch: 'mentor', perks: [{ kind: 'buff-power', percent: 100 }, { kind: 'dodge', percent: 10 }] }
  ] },
  { id: 'souei-tree', characterId: 'souei', name: 'Schattenklinge', nodes: [
    // Strang 1 — Gift (anhaltender Schaden)
    { id: 'souei-venom-focus', name: 'Giftfokus', description: 'Strang Gift: der vergiftete Stoß.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'venom', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }], skillId: 'venom-spit', statBonus: { attack: 2 } },
    { id: 'souei-venom-lace', name: 'Giftranke', description: 'Giftstoß entlädt einen Folgeschnitt.', cost: 2, requiredLevel: 5, requiredNodeIds: ['souei-venom-focus'], branch: 'venom', perks: [{ kind: 'skill-chain', triggerSkillId: 'venom-spit', followUpSkillId: 'spear-charge', percent: 35 }] },
    { id: 'souei-venom-edge', name: 'Ätzklinge', description: 'Steigert den physischen Schaden.', cost: 1, requiredLevel: 6, requiredNodeIds: ['souei-venom-focus'], branch: 'venom', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }] },
    { id: 'souei-venom-master', name: 'Giftmeister', description: 'Vollendung des Gift-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['souei-venom-lace'], branch: 'venom', perks: [{ kind: 'damage-dealt', percent: 25, category: 'physical' }], statBonus: { attack: 4 } },
    // Strang 2 — Schatten (Verdeckung)
    { id: 'souei-shadow-step', name: 'Schattenschritt', description: 'Strang Schatten: verdeckte Beweglichkeit.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'shadow', perks: [{ kind: 'dodge', percent: 18 }], statBonus: { agility: 3 } },
    { id: 'souei-shadow-veil', name: 'Schattenschleier', description: 'Mindert erlittenen Schaden.', cost: 1, requiredLevel: 5, requiredNodeIds: ['souei-shadow-step'], branch: 'shadow', perks: [{ kind: 'damage-taken', percent: 15 }] },
    { id: 'souei-shadow-evade', name: 'Nebelgang', description: 'Erhöht die Ausweichchance.', cost: 1, requiredLevel: 6, requiredNodeIds: ['souei-shadow-step'], branch: 'shadow', perks: [{ kind: 'dodge', percent: 12 }] },
    { id: 'souei-shadow-phantom', name: 'Phantom', description: 'Vollendung des Schatten-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['souei-shadow-veil'], branch: 'shadow', perks: [{ kind: 'dodge', percent: 20 }, { kind: 'damage-taken', percent: 10 }] },
    // Strang 3 — Meucheln (Präzision/Konter)
    { id: 'souei-assassin-focus', name: 'Meuchelfokus', description: 'Strang Meucheln: tödliche Präzision.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'assassin', perks: [{ kind: 'counter', percent: 25 }], skillId: 'quick-step', statBonus: { agility: 2 } },
    { id: 'souei-assassin-mark', name: 'Todesmal', description: 'Steigert den physischen Schaden.', cost: 1, requiredLevel: 5, requiredNodeIds: ['souei-assassin-focus'], branch: 'assassin', perks: [{ kind: 'damage-dealt', percent: 18, category: 'physical' }] },
    { id: 'souei-assassin-riposte', name: 'Blutriposte', description: 'Erhöht die Konterchance.', cost: 1, requiredLevel: 6, requiredNodeIds: ['souei-assassin-focus'], branch: 'assassin', perks: [{ kind: 'counter', percent: 20 }] },
    { id: 'souei-assassin-execute', name: 'Meucheln', description: 'Vollendung des Meuchel-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['souei-assassin-mark'], branch: 'assassin', perks: [{ kind: 'damage-dealt', percent: 22, category: 'physical' }, { kind: 'counter', percent: 15 }], statBonus: { attack: 3 } }
  ] },
  { id: 'rigurd-tree', characterId: 'rigurd', name: 'Goblin-Häuptling', nodes: [
    // Strang 1 — Wall (Verteidigung)
    { id: 'rigurd-wall-guard', name: 'Schildwall', description: 'Strang Wall: standhafte Verteidigung.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'wall', perks: [{ kind: 'max-hp', percent: 15 }], skillId: 'iron-guard', statBonus: { defense: 2 } },
    { id: 'rigurd-wall-brace', name: 'Verschanzen', description: 'Mindert erlittenen Schaden.', cost: 1, requiredLevel: 5, requiredNodeIds: ['rigurd-wall-guard'], branch: 'wall', perks: [{ kind: 'damage-taken', percent: 15 }] },
    { id: 'rigurd-wall-endure', name: 'Zähigkeit', description: 'Stählt die Konstitution weiter.', cost: 1, requiredLevel: 6, requiredNodeIds: ['rigurd-wall-guard'], branch: 'wall', perks: [{ kind: 'max-hp', percent: 12 }] },
    { id: 'rigurd-wall-bastion', name: 'Bastion', description: 'Vollendung des Wall-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['rigurd-wall-brace'], branch: 'wall', perks: [{ kind: 'max-hp', percent: 15 }, { kind: 'damage-taken', percent: 10 }] },
    // Strang 2 — Kriegsherr (Angriff)
    { id: 'rigurd-war-fury', name: 'Kriegsfuror', description: 'Strang Kriegsherr: physische Wucht.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'warlord', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }], statBonus: { attack: 2 } },
    { id: 'rigurd-war-counter', name: 'Gegenwehr', description: 'Pariert Angriffe mit einem Gegenschlag.', cost: 1, requiredLevel: 5, requiredNodeIds: ['rigurd-war-fury'], branch: 'warlord', perks: [{ kind: 'counter', percent: 25 }] },
    { id: 'rigurd-war-might', name: 'Häuptlingskraft', description: 'Steigert den physischen Schaden.', cost: 1, requiredLevel: 6, requiredNodeIds: ['rigurd-war-fury'], branch: 'warlord', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }] },
    { id: 'rigurd-war-warlord', name: 'Kriegsherr', description: 'Vollendung des Kriegsherr-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['rigurd-war-counter'], branch: 'warlord', perks: [{ kind: 'damage-dealt', percent: 22, category: 'physical' }, { kind: 'counter', percent: 15 }], statBonus: { attack: 3 } },
    // Strang 3 — Häuptling (Team)
    { id: 'rigurd-chief-call', name: 'Häuptlingsruf', description: 'Strang Häuptling: eigene Buffs halten länger.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'chieftain', perks: [{ kind: 'buff-power', percent: 100 }], skillId: 'battle-cry' },
    { id: 'rigurd-chief-banner', name: 'Kriegsbanner', description: 'Mindert erlittenen Schaden.', cost: 1, requiredLevel: 5, requiredNodeIds: ['rigurd-chief-call'], branch: 'chieftain', perks: [{ kind: 'damage-taken', percent: 12 }] },
    { id: 'rigurd-chief-rally', name: 'Stammesmut', description: 'Stählt die Konstitution.', cost: 1, requiredLevel: 6, requiredNodeIds: ['rigurd-chief-call'], branch: 'chieftain', perks: [{ kind: 'max-hp', percent: 10 }] },
    { id: 'rigurd-chief-warchief', name: 'Kriegshäuptling', description: 'Vollendung des Häuptling-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['rigurd-chief-banner'], branch: 'chieftain', perks: [{ kind: 'buff-power', percent: 100 }, { kind: 'max-hp', percent: 10 }] }
  ] },
  { id: 'ranga-tree', characterId: 'ranga', name: 'Sturmdirewolf', nodes: [
    // Strang 1 — Reißzahn (Angriff)
    { id: 'ranga-fang-focus', name: 'Reißzahnfokus', description: 'Strang Reißzahn: der stürmische Ansturm.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'fang', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }], skillId: 'direwolf-rush', statBonus: { attack: 2 } },
    { id: 'ranga-fang-chain', name: 'Rudelhatz', description: 'Der Ansturm entlädt einen Folgebiss.', cost: 2, requiredLevel: 5, requiredNodeIds: ['ranga-fang-focus'], branch: 'fang', perks: [{ kind: 'skill-chain', triggerSkillId: 'direwolf-rush', followUpSkillId: 'orc-cleave', percent: 35 }] },
    { id: 'ranga-fang-maul', name: 'Zermalmbiss', description: 'Steigert den physischen Schaden.', cost: 1, requiredLevel: 6, requiredNodeIds: ['ranga-fang-focus'], branch: 'fang', perks: [{ kind: 'damage-dealt', percent: 15, category: 'physical' }] },
    { id: 'ranga-fang-alpha', name: 'Alpha-Reißzahn', description: 'Vollendung des Reißzahn-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['ranga-fang-chain'], branch: 'fang', perks: [{ kind: 'damage-dealt', percent: 25, category: 'physical' }], statBonus: { attack: 4 } },
    // Strang 2 — Sturmböe (Tempo)
    { id: 'ranga-gale-step', name: 'Sturmschritt', description: 'Strang Sturmböe: reines Tempo.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'gale', perks: [{ kind: 'dodge', percent: 18 }], skillId: 'quick-step', statBonus: { agility: 3 } },
    { id: 'ranga-gale-veer', name: 'Windausweichen', description: 'Erhöht die Ausweichchance.', cost: 1, requiredLevel: 5, requiredNodeIds: ['ranga-gale-step'], branch: 'gale', perks: [{ kind: 'dodge', percent: 12 }] },
    { id: 'ranga-gale-rush', name: 'Böenstoß', description: 'Steigert den physischen Schaden.', cost: 1, requiredLevel: 6, requiredNodeIds: ['ranga-gale-step'], branch: 'gale', perks: [{ kind: 'damage-dealt', percent: 12, category: 'physical' }] },
    { id: 'ranga-gale-tempest', name: 'Sturmläufer', description: 'Vollendung des Sturmböe-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['ranga-gale-veer'], branch: 'gale', perks: [{ kind: 'dodge', percent: 20 }, { kind: 'counter', percent: 15 }] },
    // Strang 3 — Rudel (Team)
    { id: 'ranga-pack-howl', name: 'Rudelheulen', description: 'Strang Rudel: eigene Buffs halten länger.', cost: 1, requiredLevel: 3, requiredNodeIds: [], branch: 'pack', perks: [{ kind: 'buff-power', percent: 100 }], skillId: 'battle-cry' },
    { id: 'ranga-pack-guard', name: 'Rudelschutz', description: 'Mindert erlittenen Schaden.', cost: 1, requiredLevel: 5, requiredNodeIds: ['ranga-pack-howl'], branch: 'pack', perks: [{ kind: 'damage-taken', percent: 12 }] },
    { id: 'ranga-pack-bond', name: 'Rudelband', description: 'Stählt die Konstitution.', cost: 1, requiredLevel: 6, requiredNodeIds: ['ranga-pack-howl'], branch: 'pack', perks: [{ kind: 'max-hp', percent: 10 }] },
    { id: 'ranga-pack-alpha', name: 'Rudelführer', description: 'Vollendung des Rudel-Strangs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['ranga-pack-guard'], branch: 'pack', perks: [{ kind: 'buff-power', percent: 100 }, { kind: 'counter', percent: 15 }] }
  ] }
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
  },
  {
    id: 'kijin-regalia',
    name: 'Kijin-Kriegsornat',
    itemIds: ['kurobe-katana', 'kijin-haori', 'oni-mask'],
    tiers: [
      { pieces: 2, statBonus: { attack: 3, defense: 2 } },
      { pieces: 3, statBonus: { maxHp: 12, magic: 3, spirit: 3 } }
    ]
  },
  {
    id: 'dwargon-forged',
    name: 'Dwargon-Schmiedewerk',
    itemIds: ['magisteel-blade', 'dwarf-plate', 'forge-band'],
    tiers: [
      { pieces: 2, statBonus: { defense: 3, maxHp: 8 } },
      { pieces: 3, statBonus: { attack: 4, defense: 4, maxMp: 4 } }
    ]
  }
] as const satisfies readonly EquipmentSetDefinition[];
