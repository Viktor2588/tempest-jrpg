import { describe, it, expect } from 'vitest';
import { chooseAutoAction, prepareAutoReaction } from '../src/systems/autoBattle';
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
      prepareAutoReaction(state);
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

  it('analysiert robuste unbekannte Gegner automatisch', () => {
    const state = startBattle({
      party: [autoHero('rimuru', 'Rimuru', { skillIds: ['great-sage', 'water-blade'] })],
      enemies: [autoEnemy({ skillIds: ['venom-spit'], stats: { ...autoEnemy().stats, maxHp: 240 } })],
      seed: 45
    });
    const actor = state.combatants.find((combatant) => combatant.side === 'party')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    state.activeId = actor.id;

    expect(chooseAutoAction(state)).toEqual({ type: 'analyze', targetId: enemy.id });
  });

  it('verschlingt automatisch verwundbare freigegebene Gegner', () => {
    const state = startBattle({
      party: [autoHero('rimuru', 'Rimuru', { skillIds: ['predator', 'great-sage', 'water-blade'] })],
      enemies: [autoEnemy({ devourable: true, devourSkillId: 'venom-spit' })],
      seed: 46
    });
    const actor = state.combatants.find((combatant) => combatant.side === 'party')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    enemy.hp = Math.floor(enemy.maxHp * 0.3);
    state.activeId = actor.id;

    expect(chooseAutoAction(state)).toEqual({ type: 'devour', targetId: enemy.id });
  });

  it('wartet bei Bossen bis Phase 2 und Break mit dem automatischen Verschlingen', () => {
    const state = startBattle({
      party: [autoHero('rimuru', 'Rimuru', { skillIds: ['predator', 'water-blade'] })],
      enemies: [autoEnemy({ boss: true, devourable: true, devourSkillId: 'venom-spit' })],
      seed: 54
    });
    const actor = state.combatants.find((combatant) => combatant.side === 'party')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    enemy.hp = Math.floor(enemy.maxHp * 0.3);
    state.activeId = actor.id;

    expect(chooseAutoAction(state)?.type).not.toBe('devour');

    enemy.phaseIndex = 1;
    enemy.statuses.push({ id: 'guard-break', turns: 2 });
    expect(chooseAutoAction(state)).toEqual({ type: 'devour', targetId: enemy.id });
  });

  it('nutzt CT-Kontrolle gegen fast zugbereite Gegner', () => {
    const state = startBattle({
      party: [autoHero('rimuru', 'Rimuru', { skillIds: ['water-blade', 'temporal-snare'] })],
      enemies: [autoEnemy({ weaknesses: ['shadow'], resistances: ['water'] })],
      seed: 47
    });
    const actor = state.combatants.find((combatant) => combatant.side === 'party')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    enemy.ct = 180;
    state.activeId = actor.id;

    expect(chooseAutoAction(state)).toEqual({
      type: 'skill',
      skillId: 'temporal-snare',
      targetId: enemy.id
    });
  });

  it('zieht wartende Verbündete per Beschleunigung vor', () => {
    const state = startBattle({
      party: [
        autoHero('shuna', 'Shuna', { skillIds: ['quicken', 'water-blade'] }),
        autoHero('gobta', 'Gobta')
      ],
      enemies: [autoEnemy()],
      seed: 471
    });
    const actor = state.combatants.find((combatant) => combatant.sourceId === 'shuna')!;
    const gobta = state.combatants.find((combatant) => combatant.sourceId === 'gobta')!;
    actor.ct = 100;
    gobta.ct = 10;
    state.activeId = actor.id;

    expect(chooseAutoAction(state)).toEqual({
      type: 'skill',
      skillId: 'quicken',
      targetId: gobta.id
    });
  });

  it('bereitet bei analysiertem Telegraphen eine Auto-Reaktion vor', () => {
    const state = startBattle({
      party: [
        autoHero('rimuru', 'Rimuru'),
        autoHero('gobta', 'Gobta')
      ],
      enemies: [autoEnemy({ skillIds: ['black-flame'] })],
      seed: 48
    });
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    const gobta = state.combatants.find((combatant) => combatant.sourceId === 'gobta')!;
    enemy.analysisLevel = 1;
    enemy.telegraphSkillId = 'black-flame';
    gobta.hp = Math.floor(gobta.maxHp * 0.45);
    state.activeId = enemy.id;

    expect(prepareAutoReaction(state)).toBe(true);
    expect(gobta.reaction).toEqual({ kind: 'timing-block', timing: 'success' });
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
