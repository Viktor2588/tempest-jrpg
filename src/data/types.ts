export type ElementType =
  | 'neutral'
  | 'water'
  | 'wind'
  | 'fire'
  | 'earth'
  | 'shadow'
  | 'holy';

// Phase 69/70 — Talent-Perks: datengetriebene passive Effekte/Procs, die Spec-
// Baum-Knoten tragen und im Kampf ausgewertet werden (Helfer in systems/talentPerk).
export type DamageCategory = 'physical' | 'magical';

export type TalentPerk =
  | { readonly kind: 'damage-dealt'; readonly percent: number; readonly category?: DamageCategory; readonly element?: ElementType }
  | { readonly kind: 'damage-taken'; readonly percent: number; readonly category?: DamageCategory; readonly element?: ElementType }
  | { readonly kind: 'max-hp'; readonly percent: number }
  | { readonly kind: 'dodge'; readonly percent: number }
  | { readonly kind: 'counter'; readonly percent: number; readonly scale?: number }
  | { readonly kind: 'skill-chain'; readonly triggerSkillId: string; readonly followUpSkillId: string; readonly percent: number }
  | { readonly kind: 'buff-power'; readonly percent: number }
  | { readonly kind: 'devour-chance'; readonly percent: number }
  | { readonly kind: 'analysis-power'; readonly levels: number };

export type StatusEffectId =
  | 'poison'
  | 'attack-up'
  | 'defense-up'
  | 'magic-up'
  | 'spirit-down'
  | 'haste'
  | 'guard-break'
  // Phase 40 — Aussetz-/Behinderungs-Status (Zeitleiste-Rewrite)
  | 'stun' // setzt einen Zug komplett aus
  | 'sleep' // setzt aus, bis Schaden weckt
  | 'freeze' // setzt aus; Schaden bricht das Eis
  | 'paralyze' // Chance, den Zug zu verlieren
  | 'petrify' // versteinert: setzt aus
  | 'blind' // physische Treffsicherheit/Schaden sinkt
  | 'silence' // keine Fähigkeiten nutzbar
  | 'confuse' // Chance, den Zug zu verschwenden
  | 'charm' // Chance, gebannt auszusetzen
  | 'weaken'; // Angriff und Magie gesenkt

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
  // Phase 40 — Zeitkontrolle: positiver Wert zieht ein Ziel auf der CT-Leiste vor (hasten),
  // negativer wirft es zurück (delay). Wird nach Schaden/Effekt angewandt.
  readonly ctDelta?: number;
  // Phase 81 — Big-Hit: telegraphierter großer Treffer. Wird immer angekündigt
  // (auch ohne Analyse) und schlägt gegen ein ungedecktes Ziel (kein Block/Guard)
  // deutlich härter zu — der Spieler soll den Telegraph lesen und kontern.
  readonly heavy?: boolean;
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
  readonly boss?: boolean;
  readonly element: ElementType;
  readonly stats: StatBlock;
  readonly skillIds: readonly string[];
  readonly phase2SkillIds?: readonly string[];
  // Phase 80 — Anti-Aussitzen: erhöht den ausgeteilten Schaden dieses Gegners pro
  // Runde (nach einer Gnadenfrist). Zwingt lange Kämpfe zum Ende, statt sie
  // aussitzen zu lassen. Nur auf Bossen gesetzt; Trash bleibt schnell.
  readonly escalationPercentPerTurn?: number;
  // Phase 82 — Gegner-Archetypen (bestrafen die Standardtaktik):
  // gepanzert bis Break: nimmt stark reduzierten Schaden, solange nicht gebrochen
  // (guard-break) → zwingt in den Break-Loop statt reinem Chippen.
  readonly armoredUntilBreak?: boolean;
  // Element-Reflektor: ein Bruchteil des Schadens dieses Elements prallt auf den
  // Angreifer zurück (typisch die scheinbare Schwäche → „Dornen-Falle", zwingt zum
  // Umschalten statt Schwäche-Spam).
  readonly reflectsElement?: ElementType;
  // Heiler-Bestrafer: schlägt zurück, sobald die Party heilt → macht reines
  // Aussitzen/Sustain teuer.
  readonly punishesHealing?: boolean;
  // Phase 87 — Normalgegner-Archetypen (Boss-Muster auf den Alltagskampf ausgeweitet):
  // Mender: heilt verwundete Verbündete (die Gegner-KI darf dafür Heil-Skills wählen,
  // die sonst gefiltert werden) → der Spieler muss den Heiler fokussen/ausschalten.
  readonly healsAllies?: boolean;
  // Rudel: gerät einmalig in Raserei (attack-up, +25 % Angriff), sobald ein Verbündeter
  // fällt → einen Einzelnen zu zerlegen macht den Rest gefährlich (Kill-Reihenfolge zählt).
  readonly enrageOnAllyDeath?: boolean;
  // Phase 88 — build-relevante Encounter: wehrt eine ganze Schadenskategorie (physisch
  // ODER magisch) teils ab → der falsche Damage-Typ trifft nur gemindert, die Spec-/
  // Build-Wahl bekommt Kampf-Konsequenz (auf die passende Kategorie umschalten).
  readonly resistsCategory?: DamageCategory;
  // Phase 88b — Kategorie-Reflektor: ein Bruchteil des Schadens dieser Kategorie prallt auf
  // den (Party-)Angreifer zurück → bestraft stures Spammen einer Schadensart (Spiegel-Gegner).
  readonly reflectsCategory?: DamageCategory;
  readonly devourable: boolean;
  readonly devourSkillId?: string;
  readonly weaknesses: readonly ElementType[];
  readonly resistances: readonly ElementType[];
  readonly experienceReward: number;
  readonly goldReward: number;
  readonly drops: readonly EnemyDrop[];
}
