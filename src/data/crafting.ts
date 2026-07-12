import type { CraftingRecipe } from './types';

// Phase 91 — Die Schmiede (Crafting).
// Datengetriebene Rezepte, die an Kaijins/Kurobes Esse (service 'smith') die
// bislang toten Drop-Materialien und Boss-Kerne verbrauchen und daraus
// Ausrüstung schmieden. Alles über das bestehende craft.smithing.unlocked
// gegatet (Gazels Urteil). Wiederholbare Rezepte veredeln Rohstoffe; die
// einmaligen wandeln einzigartige Boss-Kerne (geld-core, spirit-ember) in
// einzigartige Ausrüstung — ein direktes Verschlingen-/Jagd-Ziel.
export const CRAFTING_RECIPES = [
  {
    id: 'refine-magisteel',
    name: 'Magisteel veredeln',
    description: 'Magisches Erz und Magicules zu Magisteel läutern — Grundstoff jeder Kijin-Klinge.',
    outputItemId: 'magisteel',
    outputQuantity: 1,
    goldCost: 60,
    inputs: [{ itemId: 'magic-ore', quantity: 2 }],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: true
  },
  {
    id: 'forge-magisteel-blade',
    name: 'Magisteel-Klinge schmieden',
    description: 'Aus veredeltem Magisteel eine ausgewogene Klinge treiben.',
    outputItemId: 'magisteel-blade',
    outputQuantity: 1,
    goldCost: 200,
    inputs: [{ itemId: 'magisteel', quantity: 2 }],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: true
  },
  {
    id: 'forge-dwarf-plate',
    name: 'Zwergenplatte fügen',
    description: 'Schwere Magisteel-Platten nach Dwargon-Art fügen.',
    outputItemId: 'dwarf-plate',
    outputQuantity: 1,
    goldCost: 180,
    inputs: [{ itemId: 'magisteel', quantity: 2 }],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: true
  },
  {
    id: 'forge-forge-band',
    name: 'Schmiedereif ziehen',
    description: 'Ein zwergischer Ring aus Magisteel, gehärtet mit Ork-Hauern.',
    outputItemId: 'forge-band',
    outputQuantity: 1,
    goldCost: 150,
    inputs: [
      { itemId: 'magisteel', quantity: 1 },
      { itemId: 'orc-tusk', quantity: 2 }
    ],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: true
  },
  {
    id: 'forge-famine-charm',
    name: 'Hungeramulett schmieden',
    description: 'Den Geld-Kern in ein Amulett bannen, das Zähigkeit aus dem Hunger nährt.',
    outputItemId: 'famine-charm',
    outputQuantity: 1,
    goldCost: 300,
    inputs: [
      { itemId: 'geld-core', quantity: 1 },
      { itemId: 'magisteel', quantity: 1 }
    ],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: false
  },
  {
    id: 'forge-ember-signet',
    name: 'Glut-Siegel schmieden',
    description: 'Ifrits Geistglut in ein Siegel fassen, das eine Feuer-Affinität trägt.',
    outputItemId: 'ember-signet',
    outputQuantity: 1,
    goldCost: 300,
    inputs: [
      { itemId: 'spirit-ember', quantity: 1 },
      { itemId: 'magisteel', quantity: 1 }
    ],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: false
  },
  {
    id: 'forge-spirit-core-ward',
    name: 'Geistkern-Talisman infundieren',
    description: 'Stabilisierte Geistfrequenz in Magisteel bannen — ein Prototyp fuer die Kinder-Kerne.',
    outputItemId: 'spirit-core-ward',
    outputQuantity: 1,
    goldCost: 260,
    inputs: [
      { itemId: 'spirit-ember', quantity: 1 },
      { itemId: 'magisteel', quantity: 1 },
      { itemId: 'mana-drop', quantity: 1 }
    ],
    requiresFlag: 'research.spirit-infusion.unlocked',
    repeatable: false
  },
  // — Phase 152: Rezepte fuer das neue Sturmgeist-Set (wiederholbar) und zwei
  //   legendaer-einzigartige Stuecke (einmalig). Gated ueber craft.smithing.unlocked. —
  {
    id: 'forge-galewind-edge',
    name: 'Sturmwind-Schneide treiben',
    description: 'Magisteel mit Windgeist-Mana zu einer leichten, schnellen Klinge treiben.',
    outputItemId: 'galewind-edge',
    outputQuantity: 1,
    goldCost: 240,
    inputs: [
      { itemId: 'magisteel', quantity: 1 },
      { itemId: 'mana-drop', quantity: 2 }
    ],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: true
  },
  {
    id: 'forge-stormweave-garb',
    name: 'Sturmgewebe-Robe weben',
    description: 'Verdichtete Windgeist-Fäden zu einer schützenden, leichten Robe weben.',
    outputItemId: 'stormweave-garb',
    outputQuantity: 1,
    goldCost: 220,
    inputs: [
      { itemId: 'magic-ore', quantity: 2 },
      { itemId: 'mana-drop', quantity: 2 }
    ],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: true
  },
  {
    id: 'forge-zephyr-band',
    name: 'Zephyr-Reif fassen',
    description: 'Einen Windgeist-Reif fassen, der Schritt und Geist zugleich trägt.',
    outputItemId: 'zephyr-band',
    outputQuantity: 1,
    goldCost: 220,
    inputs: [
      { itemId: 'magisteel', quantity: 1 },
      { itemId: 'mana-drop', quantity: 1 }
    ],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: true
  },
  {
    id: 'forge-stormfang-blade',
    name: 'Sturmzahn-Klinge schmieden',
    description: 'Eine räuberische Klinge schmieden, die dem Träger Raubtier-Instinkt verleiht.',
    outputItemId: 'stormfang-blade',
    outputQuantity: 1,
    goldCost: 400,
    inputs: [
      { itemId: 'magisteel', quantity: 2 },
      { itemId: 'orc-tusk', quantity: 2 },
      { itemId: 'mana-drop', quantity: 2 }
    ],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: false
  },
  {
    id: 'forge-veldora-scale-ward',
    name: 'Sturmschuppen-Ward fassen',
    description: 'Einen Splitter Sturm-Magicule in einen Talisman fassen, der die Lebenskraft härtet.',
    outputItemId: 'veldora-scale-ward',
    outputQuantity: 1,
    goldCost: 380,
    inputs: [
      { itemId: 'magisteel', quantity: 3 },
      { itemId: 'mana-drop', quantity: 2 }
    ],
    requiresFlag: 'craft.smithing.unlocked',
    repeatable: false
  }
] as const satisfies readonly CraftingRecipe[];
