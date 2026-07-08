import type { BattleView } from './battle';
import { tallyDefeatedEnemies } from './bounties';
import { normalizeInventoryStacks } from './inventory';
import { applyBattleProgressionRewards, calculateProgressionStats, grantMagicules } from './progression';
import { recruitResidentsFromDevour } from './residents';
import type { SaveGameV2 } from './save';
import { applyWorldState, completeEncounter, createWorldState } from './world';

export interface ApplyBattleResultOptions {
  readonly encounterId?: string | null;
  readonly chapterId?: string;
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
  const withMagicules = grantMagicules(
    progressionResult.state,
    calculateBattleMagicules(battle)
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
        )
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

  const inventory = won
    ? normalizeInventoryStacks([...battle.inventory, ...battle.rewards.items])
    : normalizeInventoryStacks(battle.inventory);

  let nextSave: SaveGameV2 = {
    ...save,
    party: {
      active,
      reserve: progressionResult.reserve,
      gold: save.party.gold + (won ? battle.rewards.gold : 0)
    },
    inventory: { stacks: inventory },
    flags: learnedDevourSkill
      ? { ...save.flags, 'codex.predator-devour': true }
      : save.flags,
    progression
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
