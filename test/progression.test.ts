import { describe, expect, it } from 'vitest';
import {
  HEROES,
  PROGRESSION_LINES,
  PROGRESSION_REGIONS,
  type CharacterDefinition
} from '../src/data';
import { createBattlePartyFromMembers } from '../src/systems/battle';
import { getAvailableJobs } from '../src/systems/menu';
import { createPartyMember } from '../src/systems/party';
import {
  analyzeProgressionBalance,
  calculateProgressionStats,
  catchUpReserveMembers,
  canEvolve,
  createProgressionState,
  discoverRegion,
  evolveMember,
  getProgressionSkillIds,
  getRelationshipLevelNumber,
  getUnlockedJobIds,
  grantRelationshipPoints,
  hasCustomName,
  renameMember
} from '../src/systems/progression';
import { experienceForLevel } from '../src/systems/stats';

const hero = (id: string): CharacterDefinition => HEROES.find((entry) => entry.id === id)!;

describe('progression system', () => {
  it('verknüpft Namensgebung mit Entwicklung, Stats, Skills und Job-Freischaltung', () => {
    const rimuru = createPartyMember(hero('rimuru'), { level: 4 });
    const state = createProgressionState();

    expect(hasCustomName(rimuru)).toBe(false);
    expect(canEvolve(rimuru, state, 'rimuru-predator-slime').ok).toBe(false);

    const renamed = renameMember(rimuru, 'Ciel');
    expect(renamed.ok).toBe(true);
    expect(hasCustomName(renamed.member)).toBe(true);
    expect(createBattlePartyFromMembers([renamed.member])[0]!.name).toBe('Ciel');

    const evolved = evolveMember(renamed.member, renamed.state, 'rimuru-predator-slime');
    const unlockedJobs = getUnlockedJobIds('rimuru', evolved.state);
    const predatorStats = calculateProgressionStats(evolved.member, evolved.state, 'predator-sage');
    const skillIds = getProgressionSkillIds(evolved.member, evolved.state, 'predator-sage');

    expect(evolved.ok).toBe(true);
    expect(unlockedJobs).toContain('predator-sage');
    expect(getAvailableJobs('rimuru').map((job) => job.id)).not.toContain('predator-sage');
    expect(getAvailableJobs('rimuru', unlockedJobs).map((job) => job.id)).toContain('predator-sage');
    expect(predatorStats.magic).toBeGreaterThan(calculateProgressionStats(rimuru, state).magic);
    expect(skillIds).toContain('predator-aura');
  });

  it('schaltet Rollen über Beziehungen, Story-Flags und Erkundung getrennt frei', () => {
    const baseState = createProgressionState();
    const afterBond = grantRelationshipPoints(baseState, 'gobta-ranga', 80).state;
    const afterExploration = discoverRegion(afterBond, 'marsh-border').state;

    expect(getRelationshipLevelNumber(afterBond, 'gobta-ranga')).toBe(2);
    expect(getUnlockedJobIds('gobta', afterBond)).toContain('tempest-knight');
    expect(getUnlockedJobIds('gobta', afterExploration)).toContain('marsh-runner');
    expect(getAvailableJobs('gobta', getUnlockedJobIds('gobta', afterExploration)).map((job) => job.id))
      .toEqual(expect.arrayContaining(['tempest-knight', 'marsh-runner']));

    const shunaStoryJobs = getUnlockedJobIds('shuna', baseState, { 'bond.rigurd.trust-1': true });
    expect(shunaStoryJobs).toContain('spirit-weaver');
    expect(getAvailableJobs('shuna', shunaStoryJobs).map((job) => job.id)).toContain('spirit-weaver');
  });

  it('wendet Beziehungsboni nachvollziehbar auf Charakterwerte an', () => {
    const gobta = createPartyMember(hero('gobta'), { level: 5 });
    const baseState = createProgressionState();
    const bondedState = grantRelationshipPoints(baseState, 'gobta-ranga', 140).state;
    const baseStats = calculateProgressionStats(gobta, baseState);
    const bondedStats = calculateProgressionStats(gobta, bondedState);
    const skillIds = getProgressionSkillIds(gobta, bondedState);

    expect(getRelationshipLevelNumber(bondedState, 'gobta-ranga')).toBe(3);
    expect(bondedStats.attack).toBeGreaterThan(baseStats.attack);
    expect(bondedStats.agility).toBeGreaterThan(baseStats.agility);
    expect(skillIds).toContain('direwolf-rush');
  });

  it('holt Reservefiguren über Kapitel-Baselines und Party-Abstand ohne Grinding auf', () => {
    const active = [
      createPartyMember(hero('rimuru'), { level: 8 }),
      createPartyMember(hero('gobta'), { level: 8 })
    ];
    const reserve = [createPartyMember(hero('shuna'), { level: 1 })];

    const result = catchUpReserveMembers(active, reserve, 'chapter-2');
    const caughtUp = result.reserve[0]!;

    expect(result.targetLevel).toBe(6);
    expect(result.grantedExperience).toBe(experienceForLevel(6));
    expect(caughtUp.level).toBe(6);
    expect(caughtUp.experience).toBe(experienceForLevel(6));
    expect(caughtUp.currentHp).toBeGreaterThan(reserve[0]!.currentHp);
  });

  it('liefert mehrere Linien, Regionen und monotone Balance-Bänder', () => {
    expect(PROGRESSION_LINES).toHaveLength(3);
    expect(PROGRESSION_REGIONS).toHaveLength(3);
    expect(PROGRESSION_REGIONS.every((region) => region.enemyIds.length > 0)).toBe(true);
    expect(analyzeProgressionBalance()).toEqual([]);
  });
});
