import { describe, expect, it } from 'vitest';
import { SKILLS, SKILL_FUSIONS } from '../src/data';
import {
  buildSkillFusionView,
  canFuseSkill,
  fuseSkill,
  isSkillFusionVisible,
  validateSkillFusions,
  type SkillFusionContext
} from '../src/systems/skillFusion';
import { createProgressionState, fuseMemberSkill, getProgressionCoreSkillIds } from '../src/systems/progression';
import { createPartyMember } from '../src/systems/party';
import { HEROES } from '../src/data';

const skillIds = new Set(SKILLS.map((skill) => skill.id));

function context(overrides: Partial<SkillFusionContext> = {}): SkillFusionContext {
  return {
    learnedSkillIds: [],
    magicules: 0,
    flags: {},
    ...overrides
  };
}

describe('skill-fusion data', () => {
  it('ist datenintegritär (gültige Skills, Rang klettert nach oben)', () => {
    expect(validateSkillFusions()).toEqual([]);
  });

  it('verweist nur auf existierende Skills mit ≥2 Eingaben', () => {
    for (const recipe of SKILL_FUSIONS) {
      expect(recipe.inputSkillIds.length, recipe.id).toBeGreaterThanOrEqual(2);
      expect(skillIds.has(recipe.outputSkillId), `${recipe.id} output`).toBe(true);
      for (const input of recipe.inputSkillIds) {
        expect(skillIds.has(input), `${recipe.id} input ${input}`).toBe(true);
      }
    }
  });
});

describe('skill-fusion rules', () => {
  it('verschmilzt zwei gelernte Skills zu einem und verbraucht Magicules', () => {
    const recipe = SKILL_FUSIONS.find((entry) => entry.id === 'fuse-hydro-lash')!;
    const before = context({
      learnedSkillIds: ['slime-strike', 'water-jet', 'great-sage'],
      magicules: 20
    });

    const check = canFuseSkill(recipe, before);
    const result = fuseSkill(recipe, before);

    expect(check.ok).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.magicules).toBe(8);
    expect(result.learnedSkillIds).toContain('hydro-lash');
    expect(result.learnedSkillIds).not.toContain('slime-strike');
    expect(result.learnedSkillIds).not.toContain('water-jet');
    // Unbeteiligte Skills bleiben erhalten.
    expect(result.learnedSkillIds).toContain('great-sage');
  });

  it('scheitert ohne die nötigen gelernten Skills, ohne etwas zu verbrauchen', () => {
    const recipe = SKILL_FUSIONS.find((entry) => entry.id === 'fuse-hydro-lash')!;
    const before = context({ learnedSkillIds: ['slime-strike'], magicules: 99 });

    const check = canFuseSkill(recipe, before);
    const result = fuseSkill(recipe, before);

    expect(check.ok).toBe(false);
    expect(check.reason).toContain('Wasserstrahl');
    expect(result.ok).toBe(false);
    expect(result.learnedSkillIds).toEqual(['slime-strike']);
    expect(result.magicules).toBe(99);
  });

  it('scheitert bei zu wenig Magicules', () => {
    const recipe = SKILL_FUSIONS.find((entry) => entry.id === 'fuse-hydro-lash')!;
    const result = fuseSkill(recipe, context({
      learnedSkillIds: ['slime-strike', 'water-jet'],
      magicules: 5
    }));
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Magicules');
  });

  it('versteckt story-gegatete Rezepte bis zum Flag und nach dem Verschmelzen', () => {
    const recipe = SKILL_FUSIONS.find((entry) => entry.id === 'fuse-maelstrom-fang')!;
    const learnedSkillIds = ['direwolf-rush', 'predator-aura'];

    expect(isSkillFusionVisible(recipe, learnedSkillIds, {})).toBe(false);
    expect(isSkillFusionVisible(recipe, learnedSkillIds, { 'story.geld.devoured': true })).toBe(true);
    // Einmalig: nach dem Verschmelzen (Output gelernt) verschwindet das Rezept.
    expect(isSkillFusionVisible(recipe, ['maelstrom-fang'], { 'story.geld.devoured': true })).toBe(false);
  });

  it('gatet Praedator-Perversion über Shizus Schwur und verbraucht geraubte Skills', () => {
    const recipe = SKILL_FUSIONS.find((entry) => entry.id === 'fuse-predator-perversion')!;
    const before = context({
      learnedSkillIds: ['venom-spit', 'predator-aura', 'great-sage'],
      magicules: 72,
      flags: { 'story.shizu.vow': true }
    });

    expect(isSkillFusionVisible(recipe, before.learnedSkillIds, {})).toBe(false);

    const result = fuseSkill(recipe, before);

    expect(result.ok).toBe(true);
    expect(result.magicules).toBe(0);
    expect(result.learnedSkillIds).toContain('predator-perversion');
    expect(result.learnedSkillIds).not.toContain('venom-spit');
  });

  it('listet nur sichtbare Rezepte in der Ansicht', () => {
    const view = buildSkillFusionView(context({
      learnedSkillIds: ['slime-strike', 'water-jet', 'direwolf-rush', 'predator-aura'],
      magicules: 50
    }));
    // ohne Flag ist nur das ungegatete Rezept sichtbar
    expect(view.map((row) => row.recipe.id)).toEqual(['fuse-hydro-lash']);
    expect(view[0]!.fusable).toBe(true);
  });
});

describe('skill-fusion progression integration', () => {
  it('verschmilzt für ein Party-Mitglied und fließt in das Kampf-Loadout', () => {
    const rimuru = HEROES.find((hero) => hero.id === 'rimuru')!;
    const member = createPartyMember(rimuru);
    const state = createProgressionState({ magicules: 30 });

    const result = fuseMemberSkill(member, state, 'fuse-hydro-lash');

    expect(result.ok).toBe(true);
    expect(result.state.magicules).toBe(18);
    expect(result.member.learnedSkillIds).toContain('hydro-lash');
    // der verschmolzene Skill ist im effektiven Skill-Satz des Mitglieds
    expect(getProgressionCoreSkillIds(result.member, result.state)).toContain('hydro-lash');
  });

  it('meldet einen unbekannten Rezept-Namen sauber zurück', () => {
    const rimuru = HEROES.find((hero) => hero.id === 'rimuru')!;
    const member = createPartyMember(rimuru);
    const result = fuseMemberSkill(member, createProgressionState(), 'nope');
    expect(result.ok).toBe(false);
    expect(result.member).toBe(member);
  });
});
