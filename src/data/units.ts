// Kampf-Statblöcke für Party und Gegner (datengetrieben, Phaser-/DOM-frei).
import type { Element } from './skills';

export interface UnitStats {
  name: string;
  maxHp: number;
  maxMp: number;
  atk: number;
  def: number;
  mag: number;
  spd: number;
  element: Element;
  weakness: Element | null;
  skills: string[];
}

export interface EnemyDef extends UnitStats {
  exp: number;
  gold: number;
}

// Demo-Party (bis das Party-/Progressionssystem aus Phase 2 angebunden ist).
export const DEMO_PARTY: UnitStats[] = [
  { name: 'Rin', maxHp: 120, maxMp: 30, atk: 22, def: 14, mag: 10, spd: 16, element: 'physisch', weakness: null, skills: ['windklinge'] },
  { name: 'Shion', maxHp: 150, maxMp: 12, atk: 28, def: 18, mag: 6, spd: 11, element: 'physisch', weakness: 'wind', skills: [] },
  { name: 'Gabiru', maxHp: 100, maxMp: 60, atk: 12, def: 10, mag: 26, spd: 14, element: 'wasser', weakness: 'wind', skills: ['feuerball', 'eissplitter', 'heilung'] }
];

export const ENEMIES: Record<string, EnemyDef> = {
  goblin: { name: 'Goblin', maxHp: 60, maxMp: 0, atk: 16, def: 8, mag: 4, spd: 12, element: 'physisch', weakness: 'feuer', skills: [], exp: 8, gold: 5 },
  direwolf: { name: 'Schreckenswolf', maxHp: 80, maxMp: 0, atk: 20, def: 10, mag: 4, spd: 18, element: 'wind', weakness: 'feuer', skills: [], exp: 12, gold: 7 },
  imp: { name: 'Imp', maxHp: 55, maxMp: 20, atk: 10, def: 8, mag: 18, spd: 15, element: 'feuer', weakness: 'wasser', skills: ['feuerball'], exp: 14, gold: 9 },
  ogre: { name: 'Oger', maxHp: 160, maxMp: 0, atk: 30, def: 16, mag: 4, spd: 8, element: 'erde', weakness: 'wind', skills: [], exp: 40, gold: 25 }
};

export function getEnemy(id: string): EnemyDef | undefined {
  return ENEMIES[id];
}
