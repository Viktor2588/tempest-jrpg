import {
  buildQuestLog,
  getTrackedQuestObjective,
  type TrackedQuestObjectiveView,
  type WorldState
} from './world';

export interface SideQuestTrackerEntry {
  readonly questId: string;
  readonly title: string;
  readonly stepTitle: string;
}

export interface QuestTrackerView {
  readonly objective: TrackedQuestObjectiveView | null;
  readonly sideQuests: readonly SideQuestTrackerEntry[];
  readonly hiddenSideQuestCount: number;
}

export function buildQuestTracker(state: WorldState, maxSideQuests = 3): QuestTrackerView {
  const sideQuests = buildQuestLog(state)
    .filter((quest) => quest.status === 'active' && !quest.main)
    .map((quest) => ({
      questId: quest.id,
      title: quest.title,
      stepTitle: quest.steps.find((step) => step.current)?.title ?? 'Abschluss bereit'
    }));

  return {
    objective: getTrackedQuestObjective(state),
    sideQuests: sideQuests.slice(0, maxSideQuests),
    hiddenSideQuestCount: Math.max(0, sideQuests.length - maxSideQuests)
  };
}
