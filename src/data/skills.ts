// Fähigkeiten-/Magietabelle (typisiert, datengetrieben). Phaser-/DOM-frei.

export type Element = 'physisch' | 'feuer' | 'wasser' | 'wind' | 'erde' | 'licht' | 'dunkel';
export type StatusId = 'gift' | 'verteidigt';

export type SkillKind = 'magie' | 'heilung';
export type SkillTarget = 'ein-gegner' | 'alle-gegner' | 'ein-verbündeter' | 'selbst';

export interface Skill {
  id: string;
  name: string;
  mp: number;
  power: number; // Multiplikator auf MAG
  element: Element;
  kind: SkillKind;
  target: SkillTarget;
  status?: StatusId;
}

export const SKILLS: Record<string, Skill> = {
  feuerball: { id: 'feuerball', name: 'Feuerball', mp: 4, power: 1.4, element: 'feuer', kind: 'magie', target: 'ein-gegner' },
  flammenwoge: { id: 'flammenwoge', name: 'Flammenwoge', mp: 8, power: 1.0, element: 'feuer', kind: 'magie', target: 'alle-gegner' },
  eissplitter: { id: 'eissplitter', name: 'Eissplitter', mp: 4, power: 1.4, element: 'wasser', kind: 'magie', target: 'ein-gegner' },
  windklinge: { id: 'windklinge', name: 'Windklinge', mp: 4, power: 1.4, element: 'wind', kind: 'magie', target: 'ein-gegner' },
  giftstich: { id: 'giftstich', name: 'Giftstich', mp: 3, power: 0.8, element: 'dunkel', kind: 'magie', target: 'ein-gegner', status: 'gift' },
  heilung: { id: 'heilung', name: 'Heilung', mp: 5, power: 1.6, element: 'licht', kind: 'heilung', target: 'ein-verbündeter' }
};

export function getSkill(id: string): Skill | undefined {
  return SKILLS[id];
}
