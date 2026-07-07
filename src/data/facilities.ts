import type { FacilityDefinition } from './types';

// Phase 93 — Einrichtungen & Produktion.
// Die per Naming aufgenommenen Bewohner (Phase 92) besetzen nach ihrer Rolle
// automatisch eine der vier Tempest-Einrichtungen. Jede Einrichtung wandelt pro
// Rast-Zyklus die Arbeitskraft ihrer Bewohner in Ressourcen: die Schmiede
// speist die Crafting-Materialien (Phase 91), Kueche/Trainingshalle sichern das
// Ueberleben unterwegs, die Wache traegt Gold aus gesicherten Routen bei. Die
// Ausbeute skaliert mit der Tempest-Wachstumsstufe (systems/tempestGrowth), so
// dass eine wachsende Nation spuerbar mehr produziert. Reine Daten; die
// deterministische Produktions-/Ansichts-Logik liegt in systems/facilities.
export const FACILITIES = [
  {
    id: 'forge',
    name: 'Schmiede',
    description: 'Kohleschuppe an der Esse — schuerft und laeutert magisches Erz fuer Kaijins Rezepte.',
    staffRoles: ['Handwerk'],
    output: { kind: 'item', itemId: 'magic-ore', perStaffPerLevel: 1 }
  },
  {
    id: 'kitchen',
    name: 'Kueche',
    description: 'Shunas Kueche — die Heiler destillieren Hipokte zu Heilkraut fuer die Reise.',
    staffRoles: ['Heilung'],
    output: { kind: 'item', itemId: 'healing-herb', perStaffPerLevel: 1 }
  },
  {
    id: 'training-hall',
    name: 'Trainingshalle',
    description: 'Die Bautrupps richten Vorratslager ein und fuellen die Manazufuhr auf.',
    staffRoles: ['Bau'],
    output: { kind: 'item', itemId: 'mana-drop', perStaffPerLevel: 1 }
  },
  {
    id: 'watch',
    name: 'Wache',
    description: 'Sturmzahns Wache und Seidenschwinges Spaeher sichern die Routen — sichere Wege bringen Gold.',
    staffRoles: ['Wache', 'Späher'],
    output: { kind: 'gold', perStaffPerLevel: 8 }
  }
] as const satisfies readonly FacilityDefinition[];
