import type { BountyDefinition } from './types';

// Phase 96 — Jagd-/Kopfgeldbrett.
// Datengetriebene Subjugations-Auftraege: Rimuru registriert sich bei der Freien
// Gilde in Blumund (`story.blumund.guild-tested`) und nimmt dort wiederholbare
// Jagdauftraege an. Jeder Auftrag verlangt eine Zahl erlegter Ziel-Gegner und zahlt
// die bislang toten Drop-Materialien (magic-ore/orc-tusk/…) + Gold aus, die die
// Schmiede (Phase 91) speisen — so wird gezieltes Jagen belohnt statt Grind. Die
// fruehen Auftraege stehen ab der Gilde offen; die seltenen Ziele sind hinter den
// spaeteren Story-Flags gegatet. Reine Daten; die Fortschritts-/Einloese-Logik
// liegt in systems/bounties.
const GUILD_FLAG = 'story.blumund.guild-tested';

export const BOUNTIES = [
  {
    id: 'bounty-forest-slime',
    name: 'Schleim-Plage eindaemmen',
    description: 'Die Waldschleime am Grenzpfad binden die Karawanen. Erlege drei.',
    targetEnemyId: 'forest-slime',
    requiredCount: 3,
    reward: { gold: 30, items: [{ itemId: 'healing-herb', quantity: 2 }] },
    requiresFlag: GUILD_FLAG,
    repeatable: true
  },
  {
    id: 'bounty-direwolf-pup',
    name: 'Wolfsrudel lichten',
    description: 'Jung-Direwolfe streunen zu nah an den Doerfern. Vertreibe drei.',
    targetEnemyId: 'direwolf-pup',
    requiredCount: 3,
    reward: { gold: 24, items: [{ itemId: 'mana-drop', quantity: 2 }] },
    requiresFlag: GUILD_FLAG,
    repeatable: true
  },
  {
    id: 'bounty-spore-moth',
    name: 'Sporenmotten raeuchern',
    description: 'Ihr Gift verdirbt das Erz in den Stollen. Erlege drei Sporenmotten.',
    targetEnemyId: 'spore-moth',
    requiredCount: 3,
    reward: { gold: 30, items: [{ itemId: 'magic-ore', quantity: 2 }] },
    requiresFlag: GUILD_FLAG,
    repeatable: true
  },
  {
    id: 'bounty-orc-scout',
    name: 'Spaeher der Horde',
    description: 'Ork-Spaeher kundschaften die Routen aus. Schalte zwei aus.',
    targetEnemyId: 'orc-scout',
    requiredCount: 2,
    reward: { gold: 40, items: [{ itemId: 'orc-tusk', quantity: 2 }] },
    requiresFlag: GUILD_FLAG,
    repeatable: true
  },
  {
    id: 'bounty-lizardman-acolyte',
    name: 'Sumpf-Akolythen',
    description: 'Die Echsen-Akolythen stoeren die Wasserwege. Erlege drei.',
    targetEnemyId: 'lizardman-acolyte',
    requiredCount: 3,
    reward: {
      gold: 55,
      items: [
        { itemId: 'magic-ore', quantity: 1 },
        { itemId: 'healing-herb', quantity: 1 }
      ]
    },
    requiresFlag: GUILD_FLAG,
    repeatable: true
  },
  {
    id: 'bounty-bog-terror',
    name: 'Der Sumpfschrecken',
    description: 'Ein Sumpfschrecken haust an der Grenzspalte — gepanzert und giftig. Erlege zwei.',
    targetEnemyId: 'bog-terror',
    requiredCount: 2,
    reward: { gold: 90, items: [{ itemId: 'magisteel', quantity: 1 }] },
    requiresFlag: 'story.border.cleared',
    repeatable: true
  },
  {
    id: 'bounty-elder-direwolf',
    name: 'Kopfgeld: Urdirewolf',
    description: 'Ein uralter Urdirewolf fordert das Rudel heraus. Ein einmaliges Kopfgeld.',
    targetEnemyId: 'elder-direwolf',
    requiredCount: 1,
    reward: {
      gold: 150,
      items: [
        { itemId: 'magic-ore', quantity: 3 },
        { itemId: 'orc-tusk', quantity: 2 }
      ]
    },
    requiresFlag: 'story.act2.completed',
    repeatable: false
  }
] as const satisfies readonly BountyDefinition[];
