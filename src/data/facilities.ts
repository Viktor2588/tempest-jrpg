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
    output: { kind: 'item', itemId: 'magic-ore', perStaffPerLevel: 1 },
    growth: [
      { level: 1, title: 'Feldesse', description: 'Eine glühende Werkbank hält die ersten Erzadern in Gang.' },
      { level: 2, title: 'Holzschmiede', description: 'Blasebälge und überdachte Ambosse machen aus dem Lager ein Handwerksviertel.' },
      { level: 3, title: 'Magisteel-Werkhalle', description: 'Dwargons Steinöfen prägen Tempests Silhouette und veredeln jede Lieferung.' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Kueche',
    description: 'Shunas Kueche — die Heiler destillieren Hipokte zu Heilkraut fuer die Reise.',
    staffRoles: ['Heilung'],
    output: { kind: 'item', itemId: 'healing-herb', perStaffPerLevel: 1 },
    growth: [
      { level: 1, title: 'Kochfeuer', description: 'Ein geschützter Feuerkreis versorgt die erste Wache und Reisende.' },
      { level: 2, title: 'Gemeinschaftsküche', description: 'Vorratsregale und lange Tische machen Heilung zum Alltag im Dorf.' },
      { level: 3, title: 'Shunas Versorgungshaus', description: 'Eine helle Großküche verteilt Kräuter und Rationen durch die Stadt.' }
    ]
  },
  {
    id: 'training-hall',
    name: 'Trainingshalle',
    description: 'Die Bautrupps richten Vorratslager ein und fuellen die Manazufuhr auf.',
    staffRoles: ['Bau'],
    output: { kind: 'item', itemId: 'mana-drop', perStaffPerLevel: 1 },
    growth: [
      { level: 1, title: 'Übungsring', description: 'Markierte Pfähle und Kisten bündeln die ersten Bautrupps.' },
      { level: 2, title: 'Bautrupp-Hof', description: 'Ein Holzdeck mit Lagerhaus gibt Ausbildung und Manareserven einen festen Ort.' },
      { level: 3, title: 'Garnisonsakademie', description: 'Steinterrassen und Übungshalle machen Tempests Verteidigung dauerhaft sichtbar.' }
    ]
  },
  {
    id: 'watch',
    name: 'Wache',
    description: 'Sturmzahns Wache und Seidenschwinges Spaeher sichern die Routen — sichere Wege bringen Gold.',
    staffRoles: ['Wache', 'Späher'],
    output: { kind: 'gold', perStaffPerLevel: 8 },
    growth: [
      { level: 1, title: 'Wachtposten', description: 'Ein Signalfeuer und Holzpfähle halten die ersten Wege im Blick.' },
      { level: 2, title: 'Palisadenwache', description: 'Ein erhöhter Turm verbindet Dorfwache, Späher und gesicherte Routen.' },
      { level: 3, title: 'Stadtwache', description: 'Steinerne Wehrgänge und Banner machen Tempests sichere Handelswege sichtbar.' }
    ]
  }
] as const satisfies readonly FacilityDefinition[];
