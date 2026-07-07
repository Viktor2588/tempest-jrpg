import { describe, expect, it } from 'vitest';
import { SKILLS } from '../src/data/skills';
import { SKILL_TIER_META, skillTierRank, skillTierBadge } from '../src/data/skillRank';
import type { SkillTier } from '../src/data/types';

const TIERS: readonly SkillTier[] = ['skill', 'extra-skill', 'unique-skill', 'ultimate-skill'];

describe('Phase 111 — Skill-Rang-System', () => {
  it('jeder Skill trägt einen gültigen Rang', () => {
    for (const skill of SKILLS) {
      expect(TIERS, skill.id).toContain(skill.tier);
    }
  });

  it('stuft die kanonischen Beispiele korrekt ein', () => {
    const tierOf = (id: string): SkillTier | undefined => SKILLS.find((s) => s.id === id)?.tier;
    // Rimurus zwei Unique-Skills (Canon: Predator + Großer Weiser).
    expect(tierOf('predator')).toBe('unique-skill');
    expect(tierOf('great-sage')).toBe('unique-skill');
    // Milims Drachenkraft = Ultimate.
    expect(tierOf('drago-nova')).toBe('ultimate-skill');
    // Grundangriff = Fähigkeit, Element-Magie = Extra-Skill.
    expect(tierOf('slime-strike')).toBe('skill');
    expect(tierOf('water-blade')).toBe('extra-skill');
  });

  it('die Rang-Leiter ist streng aufsteigend und vollständig', () => {
    const ranks = TIERS.map(skillTierRank);
    expect(ranks).toEqual([0, 1, 2, 3]);
    for (const tier of TIERS) {
      const meta = SKILL_TIER_META[tier];
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(meta.unlock.length).toBeGreaterThan(0);
    }
  });

  it('Grundfähigkeiten tragen keine Glyphe, höhere Ränge schon', () => {
    expect(skillTierBadge('skill')).toBe('');
    expect(skillTierBadge('unique-skill')).toBe('★ ');
    expect(skillTierBadge('ultimate-skill')).toBe('❖ ');
  });

  it('mindestens ein Skill je Rang existiert (die Leiter ist real belegt)', () => {
    for (const tier of TIERS) {
      expect(SKILLS.some((s) => s.tier === tier), tier).toBe(true);
    }
  });
});
