import type { FactionDefinition } from './types';

// Phase 100 — Diplomatie (Faktionen/Reputation).
// Datengetriebene Reputationsskala je Faktion. Reputation bewegt sich über den
// Welt-Effekt `adjust-reputation` (Entscheidungen/Quests/Handel); überschreitet sie
// eine Schwelle, setzt der Effekt deterministisch das `unlockFlag` der Stufe. So
// hängt die externe Nation-Seite an den bestehenden `faction.*`-Flags und speist über
// die Schwellen-Flags bestehende Systeme (z. B. reputationsgegatete Handels-Rezepte
// der Schmiede, Phase 91). Reine Daten; Logik in systems/diplomacy.
export const FACTIONS = [
  {
    id: 'dwargon',
    name: 'Bewaffnete Nation Dwargon',
    description: 'Das Zwergenkönigreich unter Gazel Dwargo — Schmiedekunst, Handel und Gesetz.',
    thresholds: [
      { points: 20, title: 'Geduldet', unlockFlag: 'reputation.dwargon.known', reward: 'Zutritt zu den Handwerksgassen.' },
      { points: 50, title: 'Handelspartner', unlockFlag: 'reputation.dwargon.trusted', reward: 'Zwergische Handelsroute: Magisteel-Nachschub in der Schmiede.' },
      { points: 90, title: 'Verbündet', unlockFlag: 'reputation.dwargon.allied', reward: 'Dwargons Gardisten als Bündnistruppe.' }
    ]
  },
  {
    id: 'blumund',
    name: 'Königreich Blumund',
    description: 'Der kleine Menschenstaat mit der Abenteuergilde — Rimurus erstes Fenster zur Menschenwelt.',
    thresholds: [
      { points: 20, title: 'Bekannt', unlockFlag: 'reputation.blumund.known', reward: 'Zugang zum Kopfgeldbrett der Gilde.' },
      { points: 50, title: 'Vertraut', unlockFlag: 'reputation.blumund.trusted', reward: 'Bevorzugte Aufträge und Preise.' },
      { points: 90, title: 'Schutzbund', unlockFlag: 'reputation.blumund.allied', reward: 'Blumunds Späher warnen vor Überfällen.' }
    ]
  },
  {
    id: 'orcs',
    name: 'Ork-Legionen',
    description: 'Die Ork-Horde, nach der Katastrophe unter Tempests Banner geeint (Geld Milishas Erbe).',
    thresholds: [
      { points: 20, title: 'Geduldet', unlockFlag: 'reputation.orcs.known', reward: 'Ork-Arbeiter für den Bau.' },
      { points: 50, title: 'Gefolgschaft', unlockFlag: 'reputation.orcs.trusted', reward: 'Ork-Hauer-Nachschub für die Schmiede.' },
      { points: 90, title: 'Schwurbund', unlockFlag: 'reputation.orcs.allied', reward: 'Ork-Legionäre als Bündnistruppe.' }
    ]
  },
  {
    id: 'lizardmen',
    name: 'Echsenmenschen des Sumpfes',
    description: 'Das Sumpfvolk um den Häuptlingssohn Gabiru — stolze Sumpfkrieger.',
    thresholds: [
      { points: 20, title: 'Waffenstillstand', unlockFlag: 'reputation.lizardmen.known', reward: 'Freie Passage durch das Sumpfland.' },
      { points: 50, title: 'Bundesgenossen', unlockFlag: 'reputation.lizardmen.trusted', reward: 'Sumpfrouten liefern Heilkräuter.' },
      { points: 90, title: 'Verbündet', unlockFlag: 'reputation.lizardmen.allied', reward: 'Echsenkrieger als Bündnistruppe.' }
    ]
  }
] as const satisfies readonly FactionDefinition[];
