import type { BattleView } from './battle';
import { normalizeInventoryStacks } from './inventory';
import { applyBattleProgressionRewards, calculateProgressionStats } from './progression';
import type { SaveGameV2 } from './save';
import { applyWorldState, completeEncounter, createWorldState } from './world';

export interface ApplyBattleResultOptions {
  readonly encounterId?: string | null;
  readonly chapterId?: string;
}

export function applyBattleResultToSave(
  save: SaveGameV2,
  battle: BattleView,
  options: ApplyBattleResultOptions = {}
): SaveGameV2 {
  const won = battle.status === 'won';
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
  const progression = progressionResult.state;
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
    progression
  };

  if (won && options.encounterId) {
    const completed = completeEncounter(createWorldState(nextSave), options.encounterId);
    nextSave = applyWorldState(nextSave, completed.state);
  }

  return nextSave;
}
