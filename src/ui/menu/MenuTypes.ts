export type MenuTab = 'party' | 'inventory' | 'equipment' | 'status' | 'growth' | 'quests' | 'codex' | 'travel';

export type QuestStatusFilter = 'active' | 'completed';

export type CodexMode = 'lore' | 'devour' | 'residents' | 'facilities' | 'bounties' | 'diplomacy' | 'bestiary';

// Codex sub-modes (moved from MenuScene for cleaner separation)
export const CODEX_MODES: ReadonlyArray<{ id: CodexMode; label: string; width: number }> = [
  { id: 'lore', label: 'Wissen', width: 66 },
  { id: 'devour', label: '🍴 Verschlingen', width: 106 },
  { id: 'residents', label: '🏛️ Bewohner', width: 84 },
  { id: 'facilities', label: '🏭 Einrichtungen', width: 116 },
  { id: 'bounties', label: '🎯 Kopfgeld', width: 80 },
  { id: 'diplomacy', label: '🤝 Politik', width: 74 },
  { id: 'bestiary', label: '🐾 Bestiarium', width: 96 }
];

export const TABS: ReadonlyArray<{ id: MenuTab; label: string }> = [
  { id: 'party', label: '1 Party' },
  { id: 'inventory', label: '2 Inventar' },
  { id: 'equipment', label: '3 Ausrüstung' },
  { id: 'status', label: '4 Status' },
  { id: 'growth', label: '5 Talente' },
  { id: 'quests', label: '6 Quests' },
  { id: 'codex', label: '7 Codex' },
  { id: 'travel', label: '8 Ranga' }
];

export const CHARACTER_TABS: ReadonlySet<MenuTab> = new Set<MenuTab>(['inventory', 'equipment', 'status', 'growth']);

export const TAB_DESCRIPTIONS: Readonly<Record<MenuTab, string>> = {
  party: 'Überblick über deine aktive Gruppe.',
  inventory: 'Gegenstände ansehen und an einer Figur benutzen.',
  equipment: 'Waffe, Rüstung und Accessoire anlegen oder ablegen.',
  status: 'Werte, Skills, Namensgebung, Entwicklung und Bindungen der Figur.',
  growth: 'Talentbaum: Knoten mit Skillpunkten freischalten.',
  quests: 'Aktive Aufträge verfolgen; Abgeschlossenes wandert ins Archiv.',
  codex: 'Gesammeltes Wissen über Welt, Figuren und Gegner.',
  travel: 'Mit Ranga zu entdeckten, sicheren Orten schnellreisen.'
};
