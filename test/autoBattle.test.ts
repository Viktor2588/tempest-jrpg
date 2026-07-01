import { describe, it, expect } from 'vitest';
import { chooseAutoAction } from '../src/systems/autoBattle';
import {
  act,
  createDefaultBattleParty,
  enemyTurn,
  isPlayerTurn,
  renderView,
  startBattle,
  type BattleUnitInput
} from '../src/systems/battle';
import { ENEMIES } from '../src/data';

const ENEMY_IDS = ENEMIES.map((e) => e.id);

// Spielt einen Kampf vollautomatisch: Spielerzüge via chooseAutoAction, Gegner via enemyTurn.
function autoRun(seed: number, enemyIds: string[]) {
  const state = startBattle({ party: createDefaultBattleParty(), enemyIds, seed });
  let guard = 0;
  while (renderView(state).status === 'active' && guard++ < 5000) {
    if (isPlayerTurn(state)) {
      const action = chooseAutoAction(state);
      if (!action) break;
      act(state, action);
    } else {
      enemyTurn(state);
    }
  }
  return { status: renderView(state).status, steps: guard };
}

function autoHero(
  sourceId: string,
  name: string,
  overrides: Partial<BattleUnitInput> = {}
): BattleUnitInput {
  return {
    sourceId,
    name,
    side: 'party',
    level: 6,
    stats: {
      maxHp: 150,
      maxMp: 60,
      attack: 24,
      defense: 18,
      magic: 25,
      spirit: 18,
      agility: 20
    },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds: ['slime-strike', 'water-blade'],
    ...overrides
  };
}

function autoEnemy(overrides: Partial<BattleUnitInput> = {}): BattleUnitInput {
  return {
    sourceId: 'auto-test-enemy',
    name: 'Prüfgegner',
    side: 'enemy',
    level: 5,
    stats: {
      maxHp: 200,
      maxMp: 20,
      attack: 18,
      defense: 12,
      magic: 12,
      spirit: 10,
      agility: 8
    },
    element: 'fire',
    weaknesses: ['water'],
    resistances: ['fire'],
    skillIds: [],
    experienceReward: 10,
    goldReward: 5,
    drops: [],
    ...overrides
  };
}

describe('autoBattle', () => {
  it('liefert für die aktive Party-Einheit eine gültige Aktion', () => {
    const state = startBattle({ party: createDefaultBattleParty(), enemyIds: ['forest-slime'], seed: 7 });
    if (isPlayerTurn(state)) {
      const action = chooseAutoAction(state);
      expect(action).toBeTruthy();
      expect(['attack', 'skill']).toContain(action!.type);
    }
  });

  it('nutzt Heilitems automatisch, wenn kein Heilskill verfügbar ist', () => {
    const state = startBattle({
      party: createDefaultBattleParty(),
      enemyIds: ['forest-slime'],
      inventory: [{ itemId: 'healing-herb', quantity: 1 }],
      seed: 8
    });
    const hero = state.combatants.find((combatant) => combatant.side === 'party')!;
    hero.hp = Math.floor(hero.maxHp * 0.25);
    state.activeId = hero.id;

    expect(chooseAutoAction(state)).toEqual({
      type: 'item',
      itemId: 'healing-herb',
      targetId: hero.id
    });
  });

  it('nutzt volle Team-Leiste für Synergieangriffe', () => {
    const state = startBattle({
      party: [
        autoHero('rimuru', 'Rimuru', { synergyPartnerIds: ['gobta'] }),
        autoHero('gobta', 'Gobta', { synergyPartnerIds: ['rimuru'] })
      ],
      enemies: [autoEnemy()],
      teamMeter: 100,
      seed: 9
    });
    const actor = state.combatants.find((combatant) => combatant.sourceId === 'rimuru')!;
    const partner = state.combatants.find((combatant) => combatant.sourceId === 'gobta')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    state.activeId = actor.id;

    expect(chooseAutoAction(state)).toEqual({
      type: 'team-attack',
      partnerId: partner.id,
      targetId: enemy.id
    });
  });

  it('setzt eine volle Signaturleiste vor dem Team-Angriff ein', () => {
    const state = startBattle({
      party: [
        autoHero('rimuru', 'Rimuru', { synergyPartnerIds: ['gobta'] }),
        autoHero('gobta', 'Gobta', { synergyPartnerIds: ['rimuru'] })
      ],
      enemies: [autoEnemy()],
      teamMeter: 100,
      seed: 43
    });
    const actor = state.combatants.find((combatant) => combatant.sourceId === 'rimuru')!;
    actor.signatureCharge = actor.signatureChargeMax;
    state.activeId = actor.id;

    expect(chooseAutoAction(state)).toEqual({ type: 'signature' });
  });

  it('bevorzugt beim Team-Mix einen Partner mit gültiger Elementfusion', () => {
    const state = startBattle({
      party: [
        autoHero('rimuru', 'Rimuru', { synergyPartnerIds: ['gobta', 'benimaru'] }),
        autoHero('gobta', 'Gobta', { synergyPartnerIds: ['rimuru'] }),
        autoHero('benimaru', 'Benimaru', { synergyPartnerIds: ['rimuru'] })
      ],
      enemies: [autoEnemy()],
      teamMeter: 100,
      seed: 44
    });
    const actor = state.combatants.find((combatant) => combatant.sourceId === 'rimuru')!;
    const benimaru = state.combatants.find((combatant) => combatant.sourceId === 'benimaru')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    actor.resonanceElement = 'water';
    benimaru.resonanceElement = 'fire';
    state.activeId = actor.id;

    expect(chooseAutoAction(state)).toEqual({
      type: 'team-attack',
      partnerId: benimaru.id,
      targetId: enemy.id
    });
  });

  it('bevorzugt Schwächen-Skills gegenüber billigeren neutralen Skills', () => {
    const state = startBattle({
      party: [autoHero('rimuru', 'Rimuru', { skillIds: ['slime-strike', 'water-blade'] })],
      enemies: [autoEnemy()],
      seed: 10
    });
    const actor = state.combatants.find((combatant) => combatant.side === 'party')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    state.activeId = actor.id;

    expect(chooseAutoAction(state)).toEqual({
      type: 'skill',
      skillId: 'water-blade',
      targetId: enemy.id
    });
  });

  it('beendet Kämpfe deterministisch und gewinnt gegen schwache Gegner', () => {
    const a = autoRun(5, ['forest-slime', 'forest-slime']);
    const b = autoRun(5, ['forest-slime', 'forest-slime']);
    expect(a.status).toBe('won');
    expect(a.status).toBe(b.status);
    expect(a.steps).toBe(b.steps); // deterministisch
  });

  it('terminiert über eine Stichprobe ohne Hänger', () => {
    for (let i = 0; i < ENEMY_IDS.length; i++) {
      const out = autoRun(11 + i * 7, [ENEMY_IDS[i]!, ENEMY_IDS[(i + 1) % ENEMY_IDS.length]!]);
      expect(['won', 'lost', 'fled']).toContain(out.status);
      expect(out.steps).toBeLessThan(5000);
    }
  });
});
