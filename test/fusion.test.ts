import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data';
import {
  act,
  renderView,
  startBattle,
  type BattleState,
  type BattleUnitInput
} from '../src/systems/battle';
import { resolveElementFusion } from '../src/systems/fusion';
import { createPartyMember } from '../src/systems/party';
import {
  calculateStartingTeamMeter,
  createProgressionState,
  getCombatSynergyPartnerIds
} from '../src/systems/progression';

function fusionHero(
  sourceId: string,
  skillIds: readonly string[],
  synergyPartnerIds: readonly string[]
): BattleUnitInput {
  return {
    sourceId,
    name: sourceId,
    side: 'party',
    level: 8,
    stats: {
      maxHp: 300,
      maxMp: 100,
      attack: 30,
      defense: 22,
      magic: 32,
      spirit: 22,
      agility: 30
    },
    element: 'neutral',
    weaknesses: [],
    resistances: [],
    skillIds,
    synergyPartnerIds
  };
}

function fusionEnemy(): BattleUnitInput {
  return {
    sourceId: 'fusion-dummy',
    name: 'Fusions-Dummy',
    side: 'enemy',
    level: 8,
    stats: {
      maxHp: 3000,
      maxMp: 20,
      attack: 18,
      defense: 24,
      magic: 18,
      spirit: 24,
      agility: 1
    },
    element: 'neutral',
    weaknesses: ['water', 'wind'],
    resistances: [],
    skillIds: []
  };
}

function fusionBattle(seed = 44): BattleState {
  return startBattle({
    party: [
      fusionHero('rimuru', ['water-blade'], ['benimaru']),
      fusionHero('benimaru', ['black-flame'], ['rimuru'])
    ],
    enemies: [fusionEnemy()],
    teamMeter: 100,
    seed
  });
}

function setTurn(state: BattleState, sourceId: string): void {
  const actor = state.combatants.find((combatant) => combatant.sourceId === sourceId)!;
  actor.ct = 100;
  state.activeId = actor.id;
}

function partyMember(characterId: string) {
  return createPartyMember(HEROES.find((hero) => hero.id === characterId)!);
}

describe('Phase 44 – Team-Mix und Fusionsangriffe', () => {
  it('löst Elementpaare symmetrisch und neutral-frei auf', () => {
    expect(resolveElementFusion('water', 'fire')?.resultElement).toBe('steam');
    expect(resolveElementFusion('fire', 'water')?.resultElement).toBe('steam');
    expect(resolveElementFusion('wind', 'wind')?.resultElement).toBe('cyclone');
    expect(resolveElementFusion('neutral', 'fire')).toBeNull();
    expect(resolveElementFusion(null, 'fire')).toBeNull();
  });

  it('lädt Resonanzen über Skills und zeigt sie im View-Modell', () => {
    const state = fusionBattle();
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;

    setTurn(state, 'rimuru');
    expect(act(state, { type: 'skill', skillId: 'water-blade', targetId: enemy.id }).ok).toBe(true);
    setTurn(state, 'benimaru');
    expect(act(state, { type: 'skill', skillId: 'black-flame', targetId: enemy.id }).ok).toBe(true);

    const party = renderView(state).party;
    expect(party.find((member) => member.sourceId === 'rimuru')?.resonanceElement).toBe('water');
    expect(party.find((member) => member.sourceId === 'benimaru')?.resonanceElement).toBe('fire');
  });

  it('lädt die datengetriebene Affinität auch über Signaturaktionen', () => {
    const state = fusionBattle();
    const rimuru = state.combatants.find((combatant) => combatant.sourceId === 'rimuru')!;
    rimuru.signatureCharge = rimuru.signatureChargeMax;
    state.activeId = rimuru.id;

    expect(act(state, { type: 'signature' }).ok).toBe(true);
    expect(rimuru.resonanceElement).toBe('water');
  });

  it('fusioniert verbundene Resonanzen, verbraucht Momentum und beide Ladungen', () => {
    const state = fusionBattle();
    const rimuru = state.combatants.find((combatant) => combatant.sourceId === 'rimuru')!;
    const benimaru = state.combatants.find((combatant) => combatant.sourceId === 'benimaru')!;
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    rimuru.resonanceElement = 'water';
    benimaru.resonanceElement = 'fire';
    setTurn(state, 'rimuru');

    expect(act(state, {
      type: 'team-attack',
      partnerId: benimaru.id,
      targetId: enemy.id
    }).ok).toBe(true);

    // Die Fusion verbraucht 100; der erzwungene Break verdient danach regulär 35 zurück.
    expect(state.teamMeter).toBe(35);
    expect(rimuru.resonanceElement).toBeNull();
    expect(benimaru.resonanceElement).toBeNull();
    expect(enemy.statuses.map((status) => status.id)).toContain('blind');
    expect(state.log.some((line) => line.includes('Dampfexplosion'))).toBe(true);
  });

  it('verstärkt gültige Fusionen gegenüber dem kompatiblen neutralen Team-Angriff', () => {
    const legacy = fusionBattle(99);
    const fusion = fusionBattle(99);
    const legacyParty = legacy.combatants.filter((combatant) => combatant.side === 'party');
    const fusionParty = fusion.combatants.filter((combatant) => combatant.side === 'party');
    const legacyEnemy = legacy.combatants.find((combatant) => combatant.side === 'enemy')!;
    const fusionEnemyState = fusion.combatants.find((combatant) => combatant.side === 'enemy')!;
    fusionParty[0]!.resonanceElement = 'water';
    fusionParty[1]!.resonanceElement = 'fire';
    legacy.activeId = legacyParty[0]!.id;
    fusion.activeId = fusionParty[0]!.id;

    expect(act(legacy, {
      type: 'team-attack',
      partnerId: legacyParty[1]!.id,
      targetId: legacyEnemy.id
    }).ok).toBe(true);
    expect(act(fusion, {
      type: 'team-attack',
      partnerId: fusionParty[1]!.id,
      targetId: fusionEnemyState.id
    }).ok).toBe(true);

    expect(fusionEnemyState.hp).toBeLessThan(legacyEnemy.hp);
    expect(legacy.log.some((line) => line.includes('Teamdruck'))).toBe(true);
  });

  it('bleibt bei gleichem Seed, Paar und Ziel deterministisch', () => {
    const run = (): { hp: number; log: readonly string[] } => {
      const state = fusionBattle(1234);
      const party = state.combatants.filter((combatant) => combatant.side === 'party');
      const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
      party[0]!.resonanceElement = 'water';
      party[1]!.resonanceElement = 'fire';
      state.activeId = party[0]!.id;
      act(state, { type: 'team-attack', partnerId: party[1]!.id, targetId: enemy.id });
      return { hp: enemy.hp, log: state.log };
    };

    expect(run()).toEqual(run());
  });

  it('gated neue spielbare Beziehungen weiterhin über combatBonus.teamAttack', () => {
    const progression = createProgressionState({
      relationshipPoints: {
        'gobta-ranga': 75,
        'rimuru-rigurd': 60
      }
    });

    expect(getCombatSynergyPartnerIds('gobta', progression)).toContain('ranga');
    expect(getCombatSynergyPartnerIds('ranga', progression)).toContain('gobta');
    expect(getCombatSynergyPartnerIds('rimuru', progression)).toContain('rigurd');
    expect(calculateStartingTeamMeter([
      partyMember('gobta'),
      partyMember('ranga')
    ], progression)).toBe(30);
  });

  it('lehnt Fusion und Team-Angriff ohne aktive Beziehung ab', () => {
    const state = startBattle({
      party: [
        fusionHero('rimuru', ['water-blade'], []),
        fusionHero('benimaru', ['black-flame'], [])
      ],
      enemies: [fusionEnemy()],
      teamMeter: 100,
      seed: 44
    });
    const party = state.combatants.filter((combatant) => combatant.side === 'party');
    const enemy = state.combatants.find((combatant) => combatant.side === 'enemy')!;
    party[0]!.resonanceElement = 'water';
    party[1]!.resonanceElement = 'fire';
    state.activeId = party[0]!.id;

    const result = act(state, {
      type: 'team-attack',
      partnerId: party[1]!.id,
      targetId: enemy.id
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Beziehung');
    expect(state.teamMeter).toBe(100);
  });
});
