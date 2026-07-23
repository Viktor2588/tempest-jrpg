export type MenuTab = 'party' | 'inventory' | 'equipment' | 'status' | 'growth' | 'quests' | 'codex' | 'travel';
export type MenuTabGroup = 'party' | 'adventure';

export type QuestStatusFilter = 'active' | 'completed';

export type CodexMode = 'lore' | 'devour' | 'residents' | 'facilities' | 'bounties' | 'diplomacy' | 'bestiary' | 'handbook';

// Codex sub-modes (moved from MenuScene for cleaner separation)
export const CODEX_MODES: ReadonlyArray<{ id: CodexMode; label: string; width: number }> = [
  { id: 'lore', label: 'Wissen', width: 66 },
  { id: 'devour', label: '🍴 Verschlingen', width: 106 },
  { id: 'residents', label: '🏛️ Bewohner', width: 84 },
  { id: 'facilities', label: '🏭 Einrichtungen', width: 116 },
  { id: 'bounties', label: '🎯 Kopfgeld', width: 80 },
  { id: 'diplomacy', label: '🤝 Politik', width: 74 },
  { id: 'bestiary', label: '🐾 Bestiarium', width: 96 },
  { id: 'handbook', label: '📖 Handbuch', width: 92 }
];

export const TAB_GROUPS: ReadonlyArray<{ id: MenuTabGroup; label: string }> = [
  { id: 'party', label: 'Gruppe' },
  { id: 'adventure', label: 'Abenteuer' }
];

export const TABS: ReadonlyArray<{ id: MenuTab; label: string; group: MenuTabGroup }> = [
  { id: 'party', label: '1 Party', group: 'party' },
  { id: 'inventory', label: '2 Inventar', group: 'party' },
  { id: 'equipment', label: '3 Ausrüstung', group: 'party' },
  { id: 'status', label: '4 Status', group: 'party' },
  { id: 'growth', label: '5 Talente', group: 'party' },
  { id: 'quests', label: '6 Quests', group: 'adventure' },
  { id: 'codex', label: '7 Codex', group: 'adventure' },
  { id: 'travel', label: '8 Ranga', group: 'adventure' }
];

export const CHARACTER_TABS: ReadonlySet<MenuTab> = new Set<MenuTab>(['inventory', 'equipment', 'status', 'growth']);

export function tabGroupFor(tab: MenuTab): MenuTabGroup {
  return TABS.find((candidate) => candidate.id === tab)?.group ?? 'party';
}

export function tabsForGroup(group: MenuTabGroup): ReadonlyArray<typeof TABS[number]> {
  return TABS.filter((tab) => tab.group === group);
}

export const TAB_DESCRIPTIONS: Readonly<Record<MenuTab, string>> = {
  party: 'Überblick über deine aktive Gruppe.',
  inventory: 'Gegenstände ansehen und an einer Figur benutzen.',
  equipment: 'Waffe, Rüstung und Accessoire anlegen oder ablegen.',
  status: 'Werte, Skills, Namensgebung, Entwicklung und Bindungen der Figur.',
  growth: 'Talentbaum: Knoten mit Skillpunkten freischalten.',
  quests: 'Aktive Aufträge verfolgen; Abgeschlossenes wandert ins Archiv.',
  codex: 'Gesammeltes Wissen über Welt, Figuren und Gegner — plus das Mechanik-Handbuch.',
  travel: 'Mit Ranga zu entdeckten, sicheren Orten schnellreisen.'
};
