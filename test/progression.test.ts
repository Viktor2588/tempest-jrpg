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
    const gobta = createPartyMember(hero('gobta'), { level: 9 });
    const shuna = createPartyMember(hero('shuna'), { level: 9 });
    const baseState = createProgressionState();
    const afterBond = grantRelationshipPoints(baseState, 'gobta-ranga', 80).state;
    const afterExploration = discoverRegion(afterBond, 'marsh-border').state;

    expect(getRelationshipLevelNumber(afterBond, 'gobta-ranga')).toBe(2);
    expect(afterExploration.discoveredRegionIds).toContain('marsh-border');

    // Reiter-Strang: Direwolf-Ansturm braucht das Wolfsfang-Flag, Tempest-Ritter zusätzlich die Ranga-Bindung.
    let riderState = grantSkillPoints(afterBond, 'gobta', 4).state;
    const direwolfContext = { flags: { 'progression.gobta.wolf-fang-token': true } };
    riderState = unlockSkillNode(gobta, riderState, 'gobta-rider-focus').state;
    expect(unlockSkillNode(gobta, riderState, 'gobta-rider-charge').ok).toBe(false);
    const charge = unlockSkillNode(gobta, riderState, 'gobta-rider-charge', direwolfContext);
    expect(charge.ok).toBe(true);
    riderState = charge.state;
    expect(getProgressionSkillIds(gobta, riderState)).toContain('direwolf-rush');
    const tempestKnight = unlockSkillNode(gobta, riderState, 'gobta-rider-knight', direwolfContext);
    expect(tempestKnight.ok).toBe(true);
    riderState = tempestKnight.state;
    expect(calculateProgressionStats(gobta, riderState).defense)
      .toBeGreaterThan(calculateProgressionStats(gobta, baseState).defense);

    // Alpha-Strang (eigene Figur wegen Branch-Lock): Marschenläufer braucht Sumpferkundung.
    let noRegion = grantSkillPoints(baseState, 'gobta', 2).state;
    noRegion = unlockSkillNode(gobta, noRegion, 'gobta-alpha-focus').state;
    expect(unlockSkillNode(gobta, noRegion, 'gobta-alpha-storm').ok).toBe(false);
    let marshState = grantSkillPoints(afterExploration, 'gobta', 2).state;
    marshState = unlockSkillNode(gobta, marshState, 'gobta-alpha-focus').state;
    marshState = unlockSkillNode(gobta, marshState, 'gobta-alpha-storm').state;
    expect(getProgressionSkillIds(gobta, marshState)).toContain('storm-gust');

    // Weber-Strang: Geistweberin (Sakralgewebe) braucht Rigurds Vertrauen.
    let shunaState = grantSkillPoints(baseState, 'shuna', 4).state;
    shunaState = unlockSkillNode(shuna, shunaState, 'shuna-weave-focus').state;
    shunaState = unlockSkillNode(shuna, shunaState, 'shuna-weave-prayer').state;
    expect(unlockSkillNode(shuna, shunaState, 'shuna-weave-spirit').ok).toBe(false);
    const spiritWeaver = unlockSkillNode(shuna, shunaState, 'shuna-weave-spirit', {
      flags: { 'bond.rigurd.trust-1': true }
    });
    expect(spiritWeaver.ok).toBe(true);
    expect(getProgressionSkillIds(shuna, spiritWeaver.state)).toContain('sacred-weave');
  });

  it('erklärt Gobtas Wolfsfang-Knoten und sperrt Rimurus andere Stränge nach der Wahl', () => {
    const gobtaTree = SKILL_TREES.find((tree) => tree.characterId === 'gobta')!;
    const charge = gobtaTree.nodes.find((node) => node.id === 'gobta-rider-charge')!;
    expect(charge.requiredFlag).toBe('progression.gobta.wolf-fang-token');
    expect(charge.description).toContain('Ranga');
    expect(charge.description).toContain('Wolfsfang');

    // Branch-Lock: wer Rimurus Raubtier-Strang beginnt, kann den Schatten-Strang nicht mehr wählen.
    const rimuru = createPartyMember(hero('rimuru'), { level: 5 });
    let state = grantSkillPoints(createProgressionState(), 'rimuru', 2).state;
    const focus = unlockSkillNode(rimuru, state, 'rimuru-predator-focus');
    expect(focus.ok).toBe(true);
    state = focus.state;
    const blocked = canUnlockSkillNode(rimuru, state, 'rimuru-shadow-focus');
    expect(blocked.ok).toBe(false);
    expect(blocked.message).toContain('Spezialisierungsstrang');
    expect(calculateProgressionStats(rimuru, state).attack)
      .toBeGreaterThan(calculateProgressionStats(rimuru, createProgressionState()).attack);
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
    let state = grantSkillPoints(evolved.state, 'rimuru', 3).state;

    // Raubtier-Strang: Giftdorn erst nach der Raubtier-Entwicklung (Evolutions-Gate).
    let unlocked = unlockSkillNode(evolved.member, state, 'rimuru-predator-focus');
    expect(unlocked.ok).toBe(true);
    state = unlocked.state;
    unlocked = unlockSkillNode(evolved.member, state, 'rimuru-predator-venom');
    expect(unlocked.ok).toBe(true);
    state = unlocked.state;

    // Branch-Lock: der Schatten-Strang (spirit-bind) ist nach der Raubtier-Wahl gesperrt.
    expect(unlockSkillNode(evolved.member, state, 'rimuru-shadow-bind').ok).toBe(false);

    const unit = createProgressionBattleParty([evolved.member], state)[0]!;
    expect(unit.formName).toBe('Raubtier-Schleim');
    expect(unit.skillIds).toContain('predator-aura');
    expect(unit.skillIds).toContain('venom-spit');
    expect(unit.skillIds).not.toContain('spirit-bind');
    expect(unit.skillIds).not.toContain('soothing-prayer');
    expect(calculateProgressionStats(evolved.member, state).attack)
      .toBeGreaterThan(calculateProgressionStats(rimuru, createProgressionState()).attack);
    // Start 5 (Evolution +2, grant +3), Raubtierfokus + Giftdorn kosten je 1 → 3 übrig.
    expect(state.skillPointsByCharacterId.rimuru).toBe(3);
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
    // Reserve-Lücke geschlossen: die gebenkte Figur erhält Skillpunkte für die auf der
    // Bank gewonnenen Level (floor(level/2)), nicht nur die aktive Party.
    const shuna = result.reserve[0]!;
    expect(result.state.skillPointsByCharacterId['shuna'] ?? 0)
      .toBe(Math.floor(shuna.level / 2) - Math.floor(1 / 2));
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
    expect(PROGRESSION_LINES.length).toBeGreaterThanOrEqual(3);
    expect(PROGRESSION_REGIONS).toHaveLength(3);
    expect(PROGRESSION_REGIONS.every((region) => region.enemyIds.length > 0)).toBe(true);
    expect(analyzeProgressionBalance()).toEqual([]);
  });
});
