import type { SkillFusionRecipe } from './types';

// Phase 108 — Skill-Fusion/-Evolution.
// Datengetriebene Rezepte, die gelernte Fertigkeiten (learnedSkillIds) zu einem
// hoeherrangigen Skill verschmelzen — Rimurus zentralste Canon-Fantasie (Grosser
// Weiser kombiniert, Praedator wandelt). Gegated ueber die gelernten Skills statt
// Gold; die hoeherrangigen Rezepte kosten Magicules (Phase 102) und sind spaet
// story-gegated, damit Unique-Ergebnisse nicht zu frueh fallen. Reine Daten; die
// deterministische Verschmelzungs-/Ansichts-Logik liegt in systems/skillFusion.
export const SKILL_FUSIONS = [
  {
    id: 'fuse-hydro-lash',
    name: 'Hydra-Schneide verschmelzen',
    description: 'Schleimschlag und Wasserstrahl zu einer geformten Wasserklinge bündeln.',
    inputSkillIds: ['slime-strike', 'water-jet'],
    outputSkillId: 'hydro-lash',
    magiculeCost: 12
  },
  {
    id: 'fuse-maelstrom-fang',
    name: 'Mahlstrom-Reißzahn verschmelzen',
    description: 'Direwolf-Ansturm und Raubtieraura zu einem Wirbelsturm-Reißzahn vereinen.',
    inputSkillIds: ['direwolf-rush', 'predator-aura'],
    outputSkillId: 'maelstrom-fang',
    magiculeCost: 40,
    requiresFlag: 'story.geld.devoured'
  }
] as const satisfies readonly SkillFusionRecipe[];
