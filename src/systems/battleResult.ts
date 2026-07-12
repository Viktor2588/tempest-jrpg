import type { BattleView } from './battle';
import { tallyAnalyzedEnemies } from './bestiary';
import { collectHuntingGroundRewards } from './bestiaryMastery';
import { tallyDefeatedEnemies } from './bounties';
import { KITCHEN_REST_BUFF_FLAG } from './facilities';
import { normalizeInventoryStacks } from './inventory';
import { rollLabyrinthFloorLoot } from './labyrinth';
import { rollLabyrinthLootItemId } from './lootAffix';
import { makeRng } from './rng';
import { applyBattleProgressionRewards, calculateProgressionStats, grantMagicules, grantSouls } from './progression';
import { recruitResidentsFromDevour } from './residents';
import type { SaveGameV2 } from './save';
import { applyWorldState, completeEncounter, createWorldState } from './world';

export interface ApplyBattleResultOptions {
  readonly encounterId?: string | null;
  readonly chapterId?: string;
  // Phase 155 — Labyrinth-Etagen-Loot: bei einem Sieg auf einer Labyrinth-Etage
  // rollt der Reward-Fluss deterministisch (aus dem Kampf-Seed + Tiefe) eine
  // gerollte Ausruestungs-Instanz und bankt sie als nicht-stapelbares Inventar-Item.
  readonly labyrinthLoot?: { readonly seed: number; readonly depth: number };
  // Phase 157 — Boss-Drops: bei einem Boss-Sieg rollt der Reward-Fluss deterministisch
  // (aus dem Kampf-Seed) mit gegateter Chance ein kern-lastiges Endgame-Loot und bankt es.
  readonly bossLoot?: { readonly seed: number };
}

export function calculateBattleMagicules(battle: BattleView): number {
  if (battle.status !== 'won') {
    return 0;
  }
  const enemyMagicules = battle.enemies.length;
  const devourMagicules = uniqueStrings(battle.devouredSourceIds).length * 12;
  const bossMagicules = battle.enemies.filter((enemy) => enemy.boss).length * 30;
  return enemyMagicules + devourMagicules + bossMagicules;
}

// Phase 127 — Seelen (魂): NUR Boss-Siege ernten Seelen (eine je erlegtem Boss).
// Damit tragen Boss-Kaempfe eine eigene, sichtbare Oekonomie (Erwachens-Gate),
// getrennt von den Magicules aus jedem Kill.
export function calculateBattleSouls(battle: BattleView): number {
  if (battle.status !== 'won') {
    return 0;
  }
  return battle.enemies.filter((enemy) => enemy.boss && enemy.dead).length;
}

// Phase 157 — Boss-Drops: grosse Boss-Siege geben mit gegateter, deterministischer
// Chance (aus dem Kampf-Seed) ein gerolltes Endgame-Loot aus einem KERN-lastigen Tisch
// hoher Raritaet — so bekommt der Kern-Slot (Phase 150) erspielbaren Roll-Nachschub und
// Boss-Kaempfe eine eigene Loot-Bedeutung neben Seelen (127)/Magicules (102). Rein/
// funktional (Seed rein → Ergebnis raus), analog `calculateBattleSouls`.
const BOSS_LOOT_TABLE: readonly string[] = [
  'soul-forged-core',   // legendaer Kern (Signatur-Perk)
  'ember-magicule-core', // episch Kern
  'resonant-core',       // episch Kern
  'veldora-scale-ward'   // legendaer Accessoire (Kern-Alternative)
];
const BOSS_LOOT_CHANCE = 0.5;

export function rollBossLoot(battle: BattleView, seed: number): string | null {
  if (battle.status !== 'won') return null;
  const bossKills = battle.enemies.filter((enemy) => enemy.boss && enemy.dead).length;
  if (bossKills === 0) return null;
  if (makeRng((seed ^ 0x0b055) >>> 0)() >= BOSS_LOOT_CHANCE) return null;
  return rollLabyrinthLootItemId((seed ^ 0xb0551007) >>> 0, BOSS_LOOT_TABLE);
}

export function applyBattleResultToSave(
  save: SaveGameV2,
  battle: BattleView,
  options: ApplyBattleResultOptions = {}
): SaveGameV2 {
  const won = battle.status === 'won';
  const learnedDevourSkill = won && battle.party.some((combatant) => combatant.mimicSkillIds.length > 0);
  const progressionResult = won
    ? applyBattleProgressionRewards(
        save.party.active,
        save.party.reserve,
        save.progression,
        battle.rewards.experience,
        options.chapterId
      )
    : {
        active: save.party.active,
        reserve: save.party.reserve,
        state: save.progression,
        grantedSkillPoints: 0
      };
  // Phase 92 — Bewohner: in diesem Kampf verschlungene Gegner-Arten als Bewohner
  // rekrutieren (per Naming). Idempotent; alte Bewohner bleiben erhalten.
  const withMagicules = grantSouls(
    grantMagicules(progressionResult.state, calculateBattleMagicules(battle)).state,
    calculateBattleSouls(battle)
  ).state;
  const recruited = won
    ? recruitResidentsFromDevour(withMagicules.residentIds, battle.devouredSourceIds)
    : null;
  const progressionBase =
    recruited && recruited.newlyRecruited.length > 0
      ? { ...withMagicules, residentIds: recruited.residentIds }
      : withMagicules;
  // Phase 96 — Kopfgeldbrett: erlegte Gegner-Arten dieses Siegs in die Zaehler
  // einbuchen (Grundlage fuer den Auftrags-Fortschritt).
  const progression = won
    ? {
        ...progressionBase,
        defeatedEnemyCountsByEnemyId: tallyDefeatedEnemies(
          progressionBase.defeatedEnemyCountsByEnemyId,
          battle.enemies.filter((enemy) => enemy.dead).map((enemy) => enemy.sourceId)
        ),
        // Phase 122 — Lebendiges Bestiarium: im Sieg studierte Arten (analysisLevel > 0)
        // dauerhaft ins Analyse-Wissen buchen (deckt Kampfdaten im Codex auf).
        analyzedEnemyIds: tallyAnalyzedEnemies(
          progressionBase.analyzedEnemyIds,
          battle.enemies.filter((enemy) => enemy.analysisLevel > 0).map((enemy) => enemy.sourceId)
        ),
        // Phase 148 — Boss-Echos: verschlungene Quell-Ids dauerhaft merken, damit das
        // Labyrinth nur „besiegt, aber nicht verschlungen"-Bosse als Echo beschwört.
        devouredSourceIds: uniqueStrings([...progressionBase.devouredSourceIds, ...battle.devouredSourceIds])
      }
    : progressionBase;
  const active = progressionResult.active.map((member) => {
    if (battle.status === 'lost') {
      return member;
    }
    const previous = save.party.active.find(
      (candidate) => candidate.characterId === member.characterId
    );
    const combatant = battle.party.find((candidate) => candidate.sourceId === member.characterId);
    if (!previous || !combatant) {
      return member;
    }
    const hpGrowth = Math.max(0, member.currentHp - previous.currentHp);
    const mpGrowth = Math.max(0, member.currentMp - previous.currentMp);
    const stats = calculateProgressionStats(member, progression);
    return {
      ...member,
      learnedSkillIds: uniqueStrings([...member.learnedSkillIds, ...combatant.mimicSkillIds]),
      currentHp: Math.min(stats.maxHp, Math.max(1, combatant.hp + hpGrowth)),
      currentMp: Math.min(stats.maxMp, Math.max(0, combatant.mp + mpGrowth))
    };
  });

  // Phase 155 — gerollte Labyrinth-Etagen-Beute (deterministisch, gedeckelte Chance)
  // als nicht-stapelbares Inventar-Item banken. Nur bei Sieg auf einer Labyrinth-Etage.
  const labyrinthLootId = won && options.labyrinthLoot
    ? rollLabyrinthFloorLoot(options.labyrinthLoot.seed, options.labyrinthLoot.depth)
    : null;
  // Phase 157 — gerolltes Boss-Endgame-Loot (deterministisch, gegatete Chance) banken.
  const bossLootId = won && options.bossLoot
    ? rollBossLoot(battle, options.bossLoot.seed)
    : null;
  const inventory = won
    ? normalizeInventoryStacks([
        ...battle.inventory,
        ...battle.rewards.items,
        ...(labyrinthLootId ? [{ itemId: labyrinthLootId, quantity: 1 }] : []),
        ...(bossLootId ? [{ itemId: bossLootId, quantity: 1 }] : [])
      ])
    : normalizeInventoryStacks(battle.inventory);

  const baseFlags = {
    ...save.flags,
    ...(learnedDevourSkill ? { 'codex.predator-devour': true } : {}),
    [KITCHEN_REST_BUFF_FLAG]: false
  };

  // Phase 124 — Sammel-Meisterschaft: neu vollstaendig studierte Jagdgruende
  // einmalig mit einem Magicule-Fund belohnen (Flag verhindert Doppelzahlung).
  // Verzahnt den Bestiarium-Sammelpfeiler (122/123) mit der Magicule-Oekonomie
  // (102). Reine Spieler-Belohnung, kein Kampf-Balance-Effekt.
  const masteryRewards = won
    ? collectHuntingGroundRewards(progression.analyzedEnemyIds, baseFlags)
    : [];
  let masteredProgression = progression;
  let flags = baseFlags;
  for (const reward of masteryRewards) {
    masteredProgression = grantMagicules(masteredProgression, reward.magicules).state;
    flags = { ...flags, [reward.flag]: true };
  }

  let nextSave: SaveGameV2 = {
    ...save,
    party: {
      active,
      reserve: progressionResult.reserve,
      gold: save.party.gold + (won ? battle.rewards.gold : 0)
    },
    inventory: { stacks: inventory },
    flags,
    progression: masteredProgression
  };

  if (won && options.encounterId) {
    const completed = completeEncounter(createWorldState(nextSave), options.encounterId);
    nextSave = applyWorldState(nextSave, completed.state);
  }

  return nextSave;
}

export interface LevelUpSummary {
  readonly characterId: string;
  readonly name: string;
  readonly fromLevel: number;
  readonly toLevel: number;
}

// Stufenaufstiege der aktiven Gruppe zwischen Vorher-/Nachher-Save — für die
// Sieg-Präsentation. Rein/funktional, damit die Zusammenfassung ohne Szene testbar ist.
export function summarizeBattleLevelUps(before: SaveGameV2, after: SaveGameV2): LevelUpSummary[] {
  const previousLevels = new Map(before.party.active.map((member) => [member.characterId, member.level]));
  const summaries: LevelUpSummary[] = [];
  for (const member of after.party.active) {
    const fromLevel = previousLevels.get(member.characterId);
    if (fromLevel !== undefined && member.level > fromLevel) {
      summaries.push({ characterId: member.characterId, name: member.name, fromLevel, toLevel: member.level });
    }
  }
  return summaries;
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}
