import { describe, expect, it } from 'vitest';
import { HEROES, SKILL_TREES, SKILLS, type CharacterDefinition, type SkillTreeNodeDefinition } from '../src/data';
import { createPartyMember } from '../src/systems/party';
import {
  canUnlockSkillNode,
  createProgressionBattleParty,
  createProgressionState,
  grantSkillPoints,
  unlockSkillNode
} from '../src/systems/progression';
import { committedBranch, talentPerksForNodes } from '../src/systems/talentPerk';

const hero = (id: string): CharacterDefinition => HEROES.find((entry) => entry.id === id)!;

describe('Phase 70 — Spec-Bäume: Branch-Lock und Perk-Zufluss', () => {
  it('leitet die Perks freigeschalteter Knoten ab', () => {
    expect(talentPerksForNodes(['benimaru-blade-focus']))
      .toContainEqual({ kind: 'damage-dealt', percent: 15, category: 'physical' });
    expect(talentPerksForNodes([])).toEqual([]);
  });

  it('benennt den gewählten Strang (oder null)', () => {
    expect(committedBranch([])).toBeNull();
    expect(committedBranch(['benimaru-flame-focus'])).toBe('flame');
  });

  it('sperrt die anderen Stränge, sobald einer gewählt ist (Qual der Wahl)', () => {
    const benimaru = createPartyMember(hero('benimaru'), { level: 9 });
    const state = grantSkillPoints(createProgressionState(), 'benimaru', 10).state;
    const blade = unlockSkillNode(benimaru, state, 'benimaru-blade-focus');
    expect(blade.ok).toBe(true);

    // Anderer Strang ist jetzt gesperrt …
    expect(canUnlockSkillNode(benimaru, blade.state, 'benimaru-flame-focus').ok).toBe(false);
    // … der gewählte Strang lässt sich weiter ausbauen.
    expect(canUnlockSkillNode(benimaru, blade.state, 'benimaru-blade-counter').ok).toBe(true);
  });

  it('speist die Perks in die Kampfparty ein', () => {
    const benimaru = createPartyMember(hero('benimaru'), { level: 9 });
    const state = {
      ...createProgressionState(),
      unlockedSkillNodeIdsByCharacterId: { benimaru: ['benimaru-blade-focus', 'benimaru-blade-counter'] }
    };
    const [unit] = createProgressionBattleParty([benimaru], state);
    expect(unit!.perks).toEqual(expect.arrayContaining([
      { kind: 'damage-dealt', percent: 15, category: 'physical' },
      { kind: 'counter', percent: 30 }
    ]));
  });

  it('jeder Benimaru-Strang hat mehrere Knoten und der Einstieg ist strangfrei erreichbar', () => {
    const branches = ['blade', 'flame', 'command'] as const;
    const benimaru = createPartyMember(hero('benimaru'), { level: 9 });
    const fresh = grantSkillPoints(createProgressionState(), 'benimaru', 10).state;
    for (const branch of branches) {
      // Genau ein Einstiegsknoten je Strang ohne Vorgänger, aus dem Startzustand wählbar.
      const entry = `benimaru-${branch === 'blade' ? 'blade-focus' : branch === 'flame' ? 'flame-focus' : 'command-presence'}`;
      expect(canUnlockSkillNode(benimaru, fresh, entry).ok, entry).toBe(true);
    }
  });
});

describe('Phase 70 — Struktur-Integrität der Spec-Bäume', () => {
  const skillIds = new Set<string>(SKILLS.map((skill) => skill.id));
  const damagingSkillIds = new Set<string>(SKILLS.filter((skill) => skill.power > 0).map((skill) => skill.id));
  const specTrees = SKILL_TREES.filter((tree) =>
    (tree.nodes as readonly SkillTreeNodeDefinition[]).some((node) => node.branch !== undefined)
  );
  // Die bereits auf Spec-Stränge umgestellten Kämpfer (Rimuru → Phase 71).
  const converted = ['benimaru', 'shion', 'hakurou', 'souei', 'rigurd', 'ranga', 'gobta', 'shuna'];

  it('deckt die umgestellten Kämpfer mit je genau 3 exklusiven Strängen ab', () => {
    for (const characterId of converted) {
      const tree = SKILL_TREES.find((candidate) => candidate.characterId === characterId);
      expect(tree, characterId).toBeDefined();
      const treeNodes = tree!.nodes as readonly SkillTreeNodeDefinition[];
      const branches = new Set(treeNodes.map((node) => node.branch).filter((branch): branch is string => branch !== undefined));
      expect(branches.size, characterId).toBe(3);
      // Jeder Strang hat 4 Knoten und genau einen strangfreien Einstieg.
      for (const branch of branches) {
        const nodes = treeNodes.filter((node) => node.branch === branch);
        expect(nodes.length, `${characterId}/${branch}`).toBeGreaterThanOrEqual(4);
        expect(nodes.filter((node) => node.requiredNodeIds.length === 0).length, `${characterId}/${branch} entry`).toBe(1);
      }
    }
  });

  it('Phase 70b — sperrt bei gobta und shuna die anderen Stränge nach der Wahl (Gates bleiben)', () => {
    const gobta = createPartyMember(hero('gobta'), { level: 9 });
    const gState = grantSkillPoints(createProgressionState(), 'gobta', 10).state;
    const feint = unlockSkillNode(gobta, gState, 'gobta-feint-focus');
    expect(feint.ok).toBe(true);
    // Reiter- (story-gegatet) und Alpha-Strang jetzt gesperrt …
    expect(canUnlockSkillNode(gobta, feint.state, 'gobta-rider-focus').ok).toBe(false);
    expect(canUnlockSkillNode(gobta, feint.state, 'gobta-alpha-focus').ok).toBe(false);
    // … der gewählte Strang lässt sich weiter ausbauen.
    expect(canUnlockSkillNode(gobta, feint.state, 'gobta-feint-slip').ok).toBe(true);

    const shuna = createPartyMember(hero('shuna'), { level: 9 });
    const sState = grantSkillPoints(createProgressionState(), 'shuna', 10).state;
    const flame = unlockSkillNode(shuna, sState, 'shuna-flame-focus');
    expect(flame.ok).toBe(true);
    expect(canUnlockSkillNode(shuna, flame.state, 'shuna-ward-focus').ok).toBe(false);
    expect(canUnlockSkillNode(shuna, flame.state, 'shuna-weave-focus').ok).toBe(false);
    expect(canUnlockSkillNode(shuna, flame.state, 'shuna-flame-clarity').ok).toBe(true);
  });

  it('jeder Strang-Knoten trägt Perks, und Ketten-Skills verweisen auf echte (schädigende) Fähigkeiten', () => {
    for (const tree of specTrees) {
      for (const node of tree.nodes as readonly SkillTreeNodeDefinition[]) {
        if (node.branch === undefined) continue;
        expect(node.perks && node.perks.length > 0, node.id).toBe(true);
        if (node.skillId) expect(skillIds.has(node.skillId), node.skillId).toBe(true);
        for (const perk of node.perks ?? []) {
          if (perk.kind === 'skill-chain') {
            expect(skillIds.has(perk.triggerSkillId), `trigger ${perk.triggerSkillId}`).toBe(true);
            expect(damagingSkillIds.has(perk.followUpSkillId), `followup ${perk.followUpSkillId}`).toBe(true);
          }
        }
      }
    }
  });
});
