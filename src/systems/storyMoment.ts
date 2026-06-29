import { HEROES, ITEMS } from '../data';
import { QUESTS, type WorldEffect } from '../data/world';

export type StoryMomentTone = 'bond' | 'recruit' | 'quest' | 'rest';

export interface StoryMomentView {
  readonly title: string;
  readonly body: string;
  readonly tone: StoryMomentTone;
}

export function buildStoryMoment(effects: readonly WorldEffect[] | undefined): StoryMomentView | null {
  const activeEffects = effects ?? [];

  const recruitedNames = activeEffects
    .filter((effect): effect is Extract<WorldEffect, { readonly type: 'recruit-character' }> =>
      effect.type === 'recruit-character'
    )
    .map((effect) => characterName(effect.characterId));
  if (recruitedNames.length > 0) {
    return {
      title: recruitedNames.length === 1 ? 'Gefährte beigetreten' : 'Gefährten beigetreten',
      body: `${joinList(recruitedNames)} ${recruitedNames.length === 1 ? 'kämpft' : 'kämpfen'} jetzt an Rimurus Seite.`,
      tone: 'recruit'
    };
  }

  if (setsFlag(activeEffects, 'story.tempest.named')) {
    return {
      title: 'Tempest gegründet',
      body: 'Die Siedlung trägt jetzt einen Namen. Aus verstreuten Hütten wird der erste Kern von Tempest.',
      tone: 'bond'
    };
  }

  if (setsFlag(activeEffects, 'story.direwolf.pact')) {
    return {
      title: 'Pakt geschlossen',
      body: 'Ranga und das Direwolf-Rudel erkennen Rimurus Namen an. Der Pakt wird zur Grundlage für spätere Scout- und Reisewege.',
      tone: 'bond'
    };
  }

  if (setsFlag(activeEffects, 'story.storm-dragon.oath')) {
    return {
      title: 'Sturmschwur geschlossen',
      body: 'Veldoras Schwur bleibt als Echo bei Rimuru. Der Sturmdrache ist vorerst Codex- und Dialoganker.',
      tone: 'bond'
    };
  }

  if (activeEffects.some((effect) => effect.type === 'restore-party')) {
    return {
      title: 'Gruppe erholt',
      body: 'Die aktive Gruppe ist vollständig geheilt und bereit für den nächsten Hauptbeat.',
      tone: 'rest'
    };
  }

  const completedQuestIds = activeEffects
    .filter((effect): effect is Extract<WorldEffect, { readonly type: 'complete-quest' }> =>
      effect.type === 'complete-quest'
    )
    .map((effect) => effect.questId);
  if (completedQuestIds.length > 0) {
    const quest = QUESTS.find((candidate) => candidate.id === completedQuestIds[0]);
    const reward = quest?.reward ? rewardText(quest.reward) : 'Keine zusätzliche Belohnung.';
    return {
      title: quest && 'actId' in quest && quest.actId.startsWith('act-')
        ? 'Kapitelziel abgeschlossen'
        : 'Quest abgeschlossen',
      body: `${quest?.title ?? completedQuestIds[0]} abgeschlossen. ${reward}`,
      tone: 'quest'
    };
  }

  return null;
}

function setsFlag(effects: readonly WorldEffect[], flag: string): boolean {
  return effects.some((effect) =>
    effect.type === 'set-flag'
    && effect.flag === flag
    && effect.value
  );
}

function characterName(characterId: string): string {
  return HEROES.find((hero) => hero.id === characterId)?.name ?? characterId;
}

function itemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
}

function rewardText(reward: NonNullable<(typeof QUESTS)[number]['reward']>): string {
  const parts = [
    reward.gold ? `${reward.gold} Gold` : null,
    ...(reward.itemIds ?? []).map(itemName)
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? `Belohnung: ${joinList(parts)}.` : 'Keine zusätzliche Belohnung.';
}

function joinList(entries: readonly string[]): string {
  if (entries.length <= 1) return entries[0] ?? '';
  if (entries.length === 2) return `${entries[0]} und ${entries[1]}`;
  return `${entries.slice(0, -1).join(', ')} und ${entries[entries.length - 1]}`;
}
