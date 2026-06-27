export type ElementType =
  | 'neutral'
  | 'water'
  | 'wind'
  | 'fire'
  | 'earth'
  | 'shadow'
  | 'holy';

export type StatusEffectId =
  | 'poison'
  | 'attack-up'
  | 'defense-up'
  | 'magic-up'
  | 'spirit-down'
  | 'haste'
  | 'guard-break';

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export interface StatBlock {
  readonly maxHp: number;
  readonly maxMp: number;
  readonly attack: number;
  readonly defense: number;
  readonly magic: number;
  readonly spirit: number;
  readonly agility: number;
}

export type SkillTarget = 'single-enemy' | 'all-enemies' | 'single-ally' | 'self';
export type SkillTag = 'physical' | 'magical' | 'heal' | 'buff' | 'debuff';

export interface SkillStatusEffect {
  readonly id: StatusEffectId;
  readonly chance: number;
  readonly turns: number;
}

export interface SkillDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly element: ElementType;
  readonly target: SkillTarget;
  readonly costMp: number;
  readonly power: number;
  readonly tags: readonly SkillTag[];
  readonly statusEffect?: SkillStatusEffect;
}

export type ItemCategory = 'consumable' | 'weapon' | 'armor' | 'accessory' | 'key';

export interface ItemEffect {
  readonly kind: 'heal-hp' | 'restore-mp' | 'revive' | 'grant-skill';
  readonly amount?: number;
  readonly skillId?: string;
}

export interface ItemDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ItemCategory;
  readonly price: number;
  readonly stackable: boolean;
  readonly startingQuantity?: number;
  readonly equipmentSlot?: EquipmentSlot;
  readonly equipmentSetId?: string;
  readonly enchantment?: {
    readonly maxLevel: number;
    readonly goldCostPerLevel: number;
    readonly statBonusPerLevel: Partial<StatBlock>;
  };
  readonly statBonus?: Partial<StatBlock>;
  readonly effect?: ItemEffect;
}

export interface CharacterDefinition {
  readonly id: string;
  readonly name: string;
  readonly species: string;
  readonly role: string;
  readonly startsInParty: boolean;
  readonly initialLevel: number;
  readonly initialExperience: number;
  readonly baseStats: StatBlock;
  readonly growthPerLevel: StatBlock;
  readonly initialSkillIds: readonly string[];
  readonly startingEquipment: Partial<Record<EquipmentSlot, string | null>>;
}

export interface EnemyDrop {
  readonly itemId: string;
  readonly chance: number;
}

export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  readonly element: ElementType;
  readonly stats: StatBlock;
  readonly skillIds: readonly string[];
  readonly weaknesses: readonly ElementType[];
  readonly resistances: readonly ElementType[];
  readonly experienceReward: number;
  readonly goldReward: number;
  readonly drops: readonly EnemyDrop[];
}
