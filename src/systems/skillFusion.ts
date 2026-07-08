import { SKILLS, SKILL_FUSIONS, skillTierRank } from '../data';
import type { SkillDefinition, SkillFusionRecipe } from '../data';
import { uniqueStrings } from './party';

// Phase 108 — Skill-Fusion: reine Regeln über die gelernten Skills eines Kämpfers
// (learnedSkillIds) + Magicules + Flags. Keine Scene-/WorldState-Abhängigkeit,
// damit sich Verschmelzung + Ansicht headless testen lassen (analog systems/crafting
// und systems/research). Verbraucht die Eingabe-Skills und ersetzt sie durch den
// fusionierten Output — die Rang-Leiter (Phase 111) hinauf.

const skillById = new Map<string, SkillDefinition>(SKILLS.map((skill) => [skill.id, skill]));
const recipeById = new Map<string, SkillFusionRecipe>(
  SKILL_FUSIONS.map((recipe) => [recipe.id, recipe])
);

export interface SkillFusionContext {
  readonly learnedSkillIds: readonly string[];
  readonly magicules: number;
  readonly flags: Readonly<Record<string, boolean>>;
}

export interface SkillFusionResult {
  readonly ok: boolean;
  readonly learnedSkillIds: readonly string[];
  readonly magicules: number;
  readonly message: string;
}

export interface FusionInputView {
  readonly skillId: string;
  readonly name: string;
  readonly owned: boolean;
}

export interface SkillFusionView {
  readonly recipe: SkillFusionRecipe;
  readonly outputName: string;
  readonly inputs: readonly FusionInputView[];
  readonly magiculeCost: number;
  readonly affordable: boolean;
  readonly fusable: boolean;
  readonly reason: string;
}

export function getSkillFusionRecipe(recipeId: string): SkillFusionRecipe | undefined {
  return recipeById.get(recipeId);
}

function skillName(skillId: string): string {
  return skillById.get(skillId)?.name ?? skillId;
}

// Ist das Rezept für diesen Kämpfer sichtbar? Flag-Gate plus: sobald der Output
// bereits gelernt wurde, verschwindet das (einmalige) Rezept — jede Verschmelzung
// gibt es pro Kämpfer nur einmal.
export function isSkillFusionVisible(
  recipe: SkillFusionRecipe,
  learnedSkillIds: readonly string[],
  flags: Readonly<Record<string, boolean>>
): boolean {
  if (learnedSkillIds.includes(recipe.outputSkillId)) {
    return false;
  }
  if (recipe.requiresFlag && flags[recipe.requiresFlag] !== true) {
    return false;
  }
  return true;
}

// Prüft die gelernten Eingabe-Skills + Magicules für ein sichtbares Rezept.
export function canFuseSkill(
  recipe: SkillFusionRecipe,
  context: SkillFusionContext
): { readonly ok: boolean; readonly reason: string } {
  if (!isSkillFusionVisible(recipe, context.learnedSkillIds, context.flags)) {
    return { ok: false, reason: 'Nicht verfügbar.' };
  }
  const owned = new Set(context.learnedSkillIds);
  const missing = recipe.inputSkillIds.find((skillId) => !owned.has(skillId));
  if (missing) {
    return { ok: false, reason: `Skill fehlt: ${skillName(missing)}.` };
  }
  if (context.magicules < recipe.magiculeCost) {
    return { ok: false, reason: `${recipe.magiculeCost} Magicules erforderlich.` };
  }
  return { ok: true, reason: '' };
}

// Verschmelzung abrechnen: entfernt die Eingabe-Skills aus learnedSkillIds, fügt den
// Output hinzu und zieht die Magicules ab. Deterministisch, ohne RNG.
export function fuseSkill(
  recipe: SkillFusionRecipe,
  context: SkillFusionContext
): SkillFusionResult {
  const check = canFuseSkill(recipe, context);
  if (!check.ok) {
    return {
      ok: false,
      learnedSkillIds: context.learnedSkillIds,
      magicules: context.magicules,
      message: check.reason
    };
  }

  const consumed = new Set(recipe.inputSkillIds);
  const learnedSkillIds = uniqueStrings([
    ...context.learnedSkillIds.filter((skillId) => !consumed.has(skillId)),
    recipe.outputSkillId
  ]);

  return {
    ok: true,
    learnedSkillIds,
    magicules: context.magicules - recipe.magiculeCost,
    message: `${skillName(recipe.outputSkillId)} verschmolzen.`
  };
}

// Menü-/Verschmelzen-Ansicht: alle für diesen Kämpfer sichtbaren Rezepte mit
// Skill-/Magicule-Status. Die Scene rendert daraus nur noch Text + Buttons.
export function buildSkillFusionView(context: SkillFusionContext): SkillFusionView[] {
  const owned = new Set(context.learnedSkillIds);
  return SKILL_FUSIONS.filter((recipe) =>
    isSkillFusionVisible(recipe, context.learnedSkillIds, context.flags)
  ).map((recipe) => {
    const inputs = recipe.inputSkillIds.map<FusionInputView>((skillId) => ({
      skillId,
      name: skillName(skillId),
      owned: owned.has(skillId)
    }));
    const check = canFuseSkill(recipe, context);
    return {
      recipe,
      outputName: skillName(recipe.outputSkillId),
      inputs,
      magiculeCost: recipe.magiculeCost,
      affordable: context.magicules >= recipe.magiculeCost,
      fusable: check.ok,
      reason: check.reason
    };
  });
}

// Datenintegrität: jedes Rezept braucht ≥2 gültige Eingabe-Skills, einen gültigen
// Output, und der Output muss auf der Rang-Leiter mindestens so hoch stehen wie
// seine stärkste Eingabe (Verschmelzung klettert die Leiter hinauf, nie hinab).
export function validateSkillFusions(): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  const recipes: readonly SkillFusionRecipe[] = SKILL_FUSIONS;
  for (const recipe of recipes) {
    if (seen.has(recipe.id)) {
      issues.push(`skillFusions.${recipe.id}: doppelte ID.`);
    }
    seen.add(recipe.id);
    const inputSkillIds: readonly string[] = recipe.inputSkillIds;
    if (inputSkillIds.length < 2) {
      issues.push(`skillFusions.${recipe.id}: braucht mindestens zwei Eingabe-Skills.`);
    }
    if (recipe.magiculeCost < 0 || !Number.isInteger(recipe.magiculeCost)) {
      issues.push(`skillFusions.${recipe.id}: Magicule-Kosten müssen eine nicht-negative ganze Zahl sein.`);
    }
    const output = skillById.get(recipe.outputSkillId);
    if (!output) {
      issues.push(`skillFusions.${recipe.id}: unbekannter Output-Skill '${recipe.outputSkillId}'.`);
    }
    let maxInputRank = 0;
    for (const inputId of inputSkillIds) {
      const input = skillById.get(inputId);
      if (!input) {
        issues.push(`skillFusions.${recipe.id}: unbekannter Eingabe-Skill '${inputId}'.`);
        continue;
      }
      if (inputSkillIds.indexOf(inputId) !== inputSkillIds.lastIndexOf(inputId)) {
        issues.push(`skillFusions.${recipe.id}: Eingabe-Skill '${inputId}' ist mehrfach gelistet.`);
      }
      if (inputId === recipe.outputSkillId) {
        issues.push(`skillFusions.${recipe.id}: Output '${recipe.outputSkillId}' ist auch Eingabe.`);
      }
      maxInputRank = Math.max(maxInputRank, skillTierRank(input.tier));
    }
    if (output && skillTierRank(output.tier) < maxInputRank) {
      issues.push(`skillFusions.${recipe.id}: Output-Rang liegt unter der stärksten Eingabe.`);
    }
  }
  return issues;
}
