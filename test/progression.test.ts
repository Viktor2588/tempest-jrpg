import { describe, expect, it } from 'vitest';
import {
  HEROES,
  PROGRESSION_LINES,
  PROGRESSION_REGIONS,
  SKILL_TREES,
  type CharacterDefinition
} from '../src/data';
import {
  act,
  createBattlePartyFromMembers,
  renderView,
  startBattle
} from '../src/systems/battle';
import { calculateMemberStats } from '../src/systems/menu';
import { createPartyMember } from '../src/systems/party';
import {
  analyzeProgressionBalance,
  applyBattleProgressionRewards,
  calculateProgressionStats,
  calculateStartingTeamMeter,
  catchUpReserveMembers,
  canUnlockSkillNode,
  canEvolve,
  createProgressionState,
  createProgressionBattleParty,
  discoverRegion,
  enchantEquipment,
  evolveMember,
  getProgressionSkillIds,
  getRelationshipLevelNumber,
  grantRelationshipPoints,
  grantSkillPoints,
  hasCustomName,
  renameMember,
  unlockSkillNode
} from '../src/systems/progression';
import { experienceForLevel } from '../src/systems/stats';

const hero = (id: string): CharacterDefinition => HEROES.find((entry) => entry.id === id)!;

describe('progression system', () => {
  it('verknüpft Namensgebung mit Entwicklung, Stats und Skills', () => {
    const rimuru = createPartyMember(hero('rimuru'), { level: 4 });
    const state = createProgressionState();

    expect(hasCustomName(rimuru)).toBe(false);
    expect(canEvolve(rimuru, state, 'rimuru-predator-slime').ok).toBe(false);

    const renamed = renameMember(rimuru, 'Ciel');
    expect(renamed.ok).toBe(true);
    expect(hasCustomName(renamed.member)).toBe(true);
    expect(createBattlePartyFromMembers([renamed.member])[0]!.name).toBe('Ciel');

    const evolved = evolveMember(renamed.member, renamed.state, 'rimuru-predator-slime');
    const predatorStats = calculateProgressionStats(evolved.member, evolved.state);
    const skillIds = getProgressionSkillIds(evolved.member, evolved.state);

    expect(evolved.ok).toBe(true);
    expect(predatorStats.magic).toBeGreaterThan(calculateProgressionStats(rimuru, state).magic);
    expect(skillIds).toContain('predator-aura');
  });

  it('gated frühere Rollen-Inhalte über Talentknoten statt Job-Unlocks', () => {
    const gobta = createPartyMember(hero('gobta'), { level: 5 });
    const shuna = createPartyMember(hero('shuna'), { level: 5 });
    const baseState = createProgressionState();
    const afterBond = grantRelationshipPoints(baseState, 'gobta-ranga', 80).state;
    const afterExploration = discoverRegion(afterBond, 'marsh-border').state;

    expect(getRelationshipLevelNumber(afterBond, 'gobta-ranga')).toBe(2);
    expect(afterExploration.discoveredRegionIds).toContain('marsh-border');

    let knightState = grantSkillPoints(afterBond, 'gobta', 4).state;
    const direwolfContext = { flags: { 'progression.gobta.wolf-fang-token': true } };
    const footwork = unlockSkillNode(gobta, knightState, 'gobta-pack-footwork');
    expect(footwork.ok).toBe(true);
    knightState = footwork.state;
    expect(unlockSkillNode(gobta, knightState, 'gobta-rider-feint').ok).toBe(false);
    const riderFeint = unlockSkillNode(gobta, knightState, 'gobta-rider-feint', direwolfContext);
    expect(riderFeint.ok).toBe(true);
    knightState = riderFeint.state;
    const tempestKnight = unlockSkillNode(gobta, knightState, 'gobta-tempest-knight', direwolfContext);
    expect(tempestKnight.ok).toBe(true);
    knightState = tempestKnight.state;
    expect(getProgressionSkillIds(gobta, knightState)).toContain('direwolf-rush');
    expect(calculateProgressionStats(gobta, knightState).defense)
      .toBeGreaterThan(calculateProgressionStats(gobta, baseState).defense);

    let marshState = grantSkillPoints(afterExploration, 'gobta', 2).state;
    for (const nodeId of ['gobta-pack-footwork', 'gobta-marsh-runner']) {
      const unlocked = unlockSkillNode(gobta, marshState, nodeId);
      expect(unlocked.ok).toBe(true);
      marshState = unlocked.state;
    }
    expect(getProgressionSkillIds(gobta, marshState)).toContain('storm-gust');

    let shunaState = grantSkillPoints(baseState, 'shuna', 4).state;
    for (const nodeId of ['shuna-prayer-thread', 'shuna-warding-weave']) {
      const unlocked = unlockSkillNode(shuna, shunaState, nodeId);
      expect(unlocked.ok).toBe(true);
      shunaState = unlocked.state;
    }
    expect(unlockSkillNode(shuna, shunaState, 'shuna-spirit-weaver').ok).toBe(false);
    const spiritWeaver = unlockSkillNode(shuna, shunaState, 'shuna-spirit-weaver', {
      flags: { 'bond.rigurd.trust-1': true }
    });
    expect(spiritWeaver.ok).toBe(true);
    expect(getProgressionSkillIds(shuna, spiritWeaver.state)).toContain('sacred-weave');
  });

  it('erklärt Gobtas Wolfsfang-Knoten und bindet Rimurus Ahnenknoten an Act 1', () => {
    const gobtaTree = SKILL_TREES.find((tree) => tree.characterId === 'gobta')!;
    const riderFeint = gobtaTree.nodes.find((node) => node.id === 'gobta-rider-feint')!;
    expect(riderFeint.requiredFlag).toBe('progression.gobta.wolf-fang-token');
    expect(riderFeint.description).toContain('Ranga');
    expect(riderFeint.description).toContain('Wolfsfang-Abzeichen');

    const rimuru = createPartyMember(hero('rimuru'), { level: 4 });
    let state = grantSkillPoints(createProgressionState(), 'rimuru', 2).state;
    const fluidCore = unlockSkillNode(rimuru, state, 'rimuru-fluid-core');
    expect(fluidCore.ok).toBe(true);
    state = fluidCore.state;

    expect(canUnlockSkillNode(rimuru, state, 'rimuru-ancestor-binding').ok).toBe(false);
    const unlocked = unlockSkillNode(rimuru, state, 'rimuru-ancestor-binding', {
      flags: { 'story.act1.completed': true }
    });
    expect(unlocked.ok).toBe(true);
    expect(calculateProgressionStats(rimuru, unlocked.state).spirit)
      .toBeGreaterThan(calculateProgressionStats(rimuru, state).spirit);
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

  it('führt Namensgebung, Entwicklung und Skill-Baum als zusammenhängenden Pfad aus', () => {
    const rimuru = createPartyMember(hero('rimuru'), { level: 6 });
    const renamed = renameMember(rimuru, 'Ciel');
    const evolved = evolveMember(renamed.member, renamed.state, 'rimuru-predator-slime');
    let state = grantSkillPoints(evolved.state, 'rimuru', 2).state;

    for (const nodeId of [
      'rimuru-fluid-core',
      'rimuru-predator-instinct',
      'rimuru-shadow-domain'
    ]) {
      const unlocked = unlockSkillNode(evolved.member, state, nodeId);
      expect(unlocked.ok).toBe(true);
      state = unlocked.state;
    }
    const unit = createProgressionBattleParty([evolved.member], state)[0]!;
    expect(unit.formName).toBe('Raubtier-Schleim');
    expect(unit.skillIds).toEqual(expect.arrayContaining(['predator-aura', 'venom-spit', 'spirit-bind']));
    expect(unit.skillIds).not.toContain('soothing-prayer');
    expect(calculateProgressionStats(evolved.member, state).magic)
      .toBeGreaterThan(calculateProgressionStats(rimuru, createProgressionState()).magic);
    expect(state.skillPointsByCharacterId.rimuru).toBe(0);
  });

  it('aktiviert Set-Boni und steigert ausgerüstete Gegenstände über Verzauberung', () => {
    const gobta = createPartyMember(hero('gobta'), { level: 4 });
    const state = createProgressionState();
    const baseDefense = calculateMemberStats(gobta).defense;
    const setAttack = calculateProgressionStats(gobta, state).attack;
    const setDefense = calculateProgressionStats(gobta, state).defense;
    const enchanted = enchantEquipment(gobta, state, 'weapon', 500);

    expect(setDefense).toBeGreaterThan(baseDefense);
    expect(enchanted.ok).toBe(true);
    expect(enchanted.gold).toBe(440);
    expect(calculateProgressionStats(gobta, enchanted.state).attack).toBeGreaterThan(setAttack);
  });

  it('übersetzt Party-Bindungen in Startbuff, Team-Leiste und ausführbaren Team-Angriff', () => {
    const party = [
      createPartyMember(hero('rimuru'), { level: 6 }),
      createPartyMember(hero('gobta'), { level: 6 })
    ];
    const bonded = grantRelationshipPoints(
      createProgressionState(),
      'rimuru-gobta',
      120
    ).state;
    const units = createProgressionBattleParty(party, bonded);
    const state = startBattle({
      party: units,
      enemyIds: ['forest-slime'],
      teamMeter: 100,
      seed: 9
    });
    const view = renderView(state);
    const actor = view.party.find((member) => member.active)!;
    const partner = view.party.find((member) => member.id !== actor.id)!;
    const target = view.enemies[0]!;

    expect(calculateStartingTeamMeter(party, bonded)).toBe(50);
    expect(view.party.every((member) => member.statuses.includes('attack-up'))).toBe(true);
    expect(actor.synergyPartnerIds).toContain(partner.sourceId);
    expect(act(state, {
      type: 'team-attack',
      partnerId: partner.id,
      targetId: target.id
    }).ok).toBe(true);
    expect(renderView(state).teamMeter).toBe(0);
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

  it('vergibt Kampf-EP, Skill-Punkte, Bindung und Reserve-Aufholen in einem Schritt', () => {
    const active = [
      createPartyMember(hero('rimuru'), { level: 1 }),
      createPartyMember(hero('gobta'), { level: 1 })
    ];
    const reserve = [createPartyMember(hero('shuna'), { level: 1 })];
    const result = applyBattleProgressionRewards(
      active,
      reserve,
      createProgressionState(),
      experienceForLevel(4),
      'chapter-2'
    );

    expect(result.active.every((member) => member.level >= 4)).toBe(true);
    expect(result.grantedSkillPoints).toBeGreaterThan(0);
    expect(result.state.relationshipPoints['rimuru-gobta']).toBe(5);
    expect(result.reserve[0]!.level).toBeGreaterThan(1);
  });

  it('vergibt auch Gobta/Ranga-Bindung, wenn beide gemeinsam aktiv kämpfen', () => {
    const active = [
      createPartyMember(hero('rimuru'), { level: 4 }),
      createPartyMember(hero('gobta'), { level: 4 }),
      createPartyMember(hero('ranga'), { level: 4 })
    ];
    const result = applyBattleProgressionRewards(
      active,
      [],
      createProgressionState(),
      10,
      'chapter-1'
    );

    expect(result.state.relationshipPoints['rimuru-gobta']).toBe(5);
    expect(result.state.relationshipPoints['gobta-ranga']).toBe(5);
  });

  it('liefert mehrere Linien, Regionen und monotone Balance-Bänder', () => {
    expect(PROGRESSION_LINES).toHaveLength(3);
    expect(PROGRESSION_REGIONS).toHaveLength(3);
    expect(PROGRESSION_REGIONS.every((region) => region.enemyIds.length > 0)).toBe(true);
    expect(analyzeProgressionBalance()).toEqual([]);
  });
});
