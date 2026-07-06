import type { ResidentDefinition } from './types';

// Phase 92 — Bewohner (Residents).
// Wenn Rimuru eine Gegner-Art verschlingt, kann er einen Überlebenden benennen —
// im Tensura-Kanon zugleich Evolution und Bindung an Tempest. Jeder Eintrag
// koppelt eine verschlingbare (Nicht-Boss-)Art an einen benannten Bewohner mit
// Rolle. Der Bestand speist noch nichts (Phase 93 setzt Einrichtungen darauf auf);
// er schließt aber den bislang toten Faden „verschlungener Gegner -> Nation".
export const RESIDENTS = [
  {
    id: 'sturmzahn',
    name: 'Sturmzahn',
    species: 'Tempest-Wolf',
    role: 'Wache',
    originEnemyId: 'direwolf-alpha',
    origin: 'Ein Direwolf-Anführer, nach dem Pakt benannt und in Rangas Rudel erhoben.'
  },
  {
    id: 'seidenschwinge',
    name: 'Seidenschwinge',
    species: 'Falter-Volk',
    role: 'Späher',
    originEnemyId: 'spore-moth',
    origin: 'Eine Sporenmotte, geläutert und benannt — späht nun lautlos die Wälder aus.'
  },
  {
    id: 'gobwa',
    name: 'Gobwa',
    species: 'Hochork',
    role: 'Wache',
    originEnemyId: 'orc-soldier',
    origin: 'Ein Ork-Soldat, satt geworden und benannt, hält Wache am Tempest-Tor.'
  },
  {
    id: 'gobkyu',
    name: 'Gobkyu',
    species: 'Hobgoblin',
    role: 'Bau',
    originEnemyId: 'orc-grunt',
    origin: 'Ein Ork-Plänkler, benannt und in die Bautrupps aufgenommen.'
  },
  {
    id: 'flossreiter',
    name: 'Flossreiter',
    species: 'Echsenmensch',
    role: 'Heilung',
    originEnemyId: 'lizardman-acolyte',
    origin: 'Ein Echsen-Akolyth aus dem Sumpf, benannt und als Heiler in Tempest gebunden.'
  },
  {
    id: 'morastwacht',
    name: 'Morastwacht',
    species: 'Sumpfgänger',
    role: 'Bau',
    originEnemyId: 'bog-terror',
    origin: 'Der Sumpfschrecken, gebändigt und benannt — trocknet nun die Gräben aus.'
  },
  {
    id: 'kohleschuppe',
    name: 'Kohleschuppe',
    species: 'Oger',
    role: 'Handwerk',
    originEnemyId: 'ogre-warrior',
    origin: 'Ein Oger-Krieger, benannt und an Kaijins Esse als Grobschmied gestellt.'
  }
] as const satisfies readonly ResidentDefinition[];
