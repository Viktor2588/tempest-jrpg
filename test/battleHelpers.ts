import { HEROES } from '../src/data';
import {
  act,
  currentActor,
  enemyTurn,
  isPlayerTurn,
  renderView,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';

// Seit dem story-gesteuerten Party-Aufbau startet ein Spiel nur mit Rimuru. Für Tests, die
// eine Mehr-Personen-Party brauchen, Gobta explizit ergänzen.
export const GOBTA = HEROES.find((hero) => hero.id === 'gobta')!;

export function autoPlay(state: BattleState): { status: string; steps: number } {
  let guard = 0;

  while (state.status === 'active' && guard++ < 5000) {
    if (isPlayerTurn(state)) {
      const actor = currentActor(state)!;
      const enemy = renderView(state).enemies.find((candidate) => !candidate.dead);
      if (!enemy) break;

      const affordableSkill = actor.skillIds
        .find((skillId) => skillId === 'storm-gust' && actor.mp >= 7)
        ?? actor.skillIds.find((skillId) => skillId === 'water-blade' && actor.mp >= 4);

      if (affordableSkill) {
        act(state, { type: 'skill', skillId: affordableSkill, targetId: enemy.id });
      } else {
        act(state, { type: 'attack', targetId: enemy.id });
      }
    } else {
      enemyTurn(state);
    }
  }

  return { status: state.status, steps: guard };
}

export function weakParty(): BattleUnitInput[] {
  return [
    {
      sourceId: 'test-weakling',
      name: 'Testling',
      side: 'party',
      level: 1,
      stats: {
        maxHp: 18,
        maxMp: 0,
        attack: 3,
        defense: 2,
        magic: 1,
        spirit: 2,
        agility: 4
      },
      element: 'neutral',
      weaknesses: ['shadow'],
      resistances: [],
      skillIds: []
    }
  ];
}

export function fastTank(): BattleUnitInput[] {
  // Minimal version; real usage patches from createDefaultBattleParty
  return [
    {
      sourceId: 'fast-tank',
      name: 'FastTank',
      side: 'party',
      level: 10,
      stats: {
        maxHp: 160,
        maxMp: 40,
        attack: 12,
        defense: 10,
        magic: 8,
        spirit: 10,
        agility: 99
      },
      element: 'neutral',
      weaknesses: [],
      resistances: [],
      skillIds: ['water-blade']
    }
  ];
}

export function lootEnemy(): BattleUnitInput[] {
  return [
    {
      sourceId: 'loot-slime',
      name: 'Beuteschleim',
      side: 'enemy',
      level: 1,
      stats: {
        maxHp: 20,
        maxMp: 0,
        attack: 1,
        defense: 1,
        magic: 1,
        spirit: 1,
        agility: 1
      },
      element: 'water',
      weaknesses: ['wind'],
      resistances: [],
      skillIds: [],
      experienceReward: 10,
      goldReward: 5,
      drops: [{ itemId: 'healing-herb', chance: 1 }]
    }
  ];
}

// Add more shared helpers here as needed when splitting further.
