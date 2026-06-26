import { DIALOGS, ENCOUNTERS, NPCS, SHOPS, type DialogChoiceDefinition, type DialogDefinition, type DialogNodeDefinition, type EncounterDefinition, type NpcDefinition, type ShopDefinition, type WorldEffect, type WorldRequirement } from '../data/world';
import { ITEMS, type ItemDefinition } from '../data';
import { addInventoryItem, getItemCount, removeInventoryItem } from './inventory';
import type { InventoryStack } from './inventory';
import { type Rng } from './rng';
import type { QuestState, SaveGameV2 } from './save';
import type { Vec2 } from './overworld';

export interface WorldState {
  readonly flags: Readonly<Record<string, boolean>>;
  readonly quests: Readonly<Record<string, QuestState>>;
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
}

export interface DialogView {
  readonly dialogId: string;
  readonly nodeId: string;
  readonly speaker: string;
  readonly text: string;
  readonly choices: readonly DialogChoiceDefinition[];
}

export interface ShopItemView {
  readonly itemId: string;
  readonly name: string;
  readonly quantity: number;
  readonly buyPrice: number;
  readonly sellPrice: number;
}

export interface ShopView {
  readonly id: string;
  readonly name: string;
  readonly gold: number;
  readonly items: readonly ShopItemView[];
}

export interface WorldResult<T = WorldState> {
  readonly ok: boolean;
  readonly state: T;
  readonly message: string;
}

const dialogsById = new Map<string, DialogDefinition>(DIALOGS.map((dialog) => [dialog.id, dialog]));
const npcById = new Map<string, NpcDefinition>(NPCS.map((npc) => [npc.id, npc]));
const shopById = new Map<string, ShopDefinition>(SHOPS.map((shop) => [shop.id, shop]));
const itemById: ReadonlyMap<string, ItemDefinition> = new Map(ITEMS.map((item) => [item.id, item]));

export function createWorldState(save: SaveGameV2): WorldState {
  return {
    flags: save.flags,
    quests: save.quests,
    inventory: save.inventory.stacks,
    gold: save.party.gold
  };
}

export function applyWorldState(save: SaveGameV2, world: WorldState): SaveGameV2 {
  return {
    ...save,
    flags: world.flags,
    quests: world.quests,
    inventory: { stacks: world.inventory },
    party: { ...save.party, gold: world.gold }
  };
}

export function getMapNpcs(mapId: string): NpcDefinition[] {
  return NPCS.filter((npc) => npc.mapId === mapId);
}

export function getMapShops(mapId: string): ShopDefinition[] {
  return SHOPS.filter((shop) => shop.mapId === mapId);
}

export function getMapEncounters(mapId: string): EncounterDefinition[] {
  return ENCOUNTERS.filter((encounter) => encounter.mapId === mapId);
}

export function getAdjacentNpc(mapId: string, position: Vec2): NpcDefinition | undefined {
  return getMapNpcs(mapId).find((npc) => isAdjacentOrSame(npc.position, position));
}

export function getAdjacentShop(mapId: string, position: Vec2): ShopDefinition | undefined {
  return getMapShops(mapId).find((shop) => isAdjacentOrSame(shop.position, position));
}

export function startDialogForNpc(state: WorldState, npcId: string): DialogView {
  const npc = requireNpc(npcId);
  return getDialogView(state, npc.dialogId, requireDialog(npc.dialogId).startNodeId);
}

export function getDialogView(state: WorldState, dialogId: string, nodeId: string): DialogView {
  const dialog = requireDialog(dialogId);
  const node = requireDialogNode(dialog, nodeId);
  return {
    dialogId,
    nodeId,
    speaker: node.speaker,
    text: node.text,
    choices: node.choices.filter((choice) => requirementsMet(state, choice.requirements ?? []))
  };
}

export function chooseDialogOption(
  state: WorldState,
  dialogId: string,
  nodeId: string,
  choiceId: string
): WorldResult<{ readonly world: WorldState; readonly next: DialogView | null }> {
  const view = getDialogView(state, dialogId, nodeId);
  const choice = view.choices.find((candidate) => candidate.id === choiceId);
  if (!choice) {
    return { ok: false, state: { world: state, next: view }, message: 'Dialogauswahl ist nicht verfügbar.' };
  }

  const nextWorld = applyEffects(state, choice.effects ?? []);
  const next = choice.nextNodeId ? getDialogView(nextWorld, dialogId, choice.nextNodeId) : null;
  return { ok: true, state: { world: nextWorld, next }, message: choice.label };
}

export function buildShopView(state: WorldState, shopId: string): ShopView {
  const shop = requireShop(shopId);
  return {
    id: shop.id,
    name: shop.name,
    gold: state.gold,
    items: shop.itemIds.flatMap((itemId): ShopItemView[] => {
      const item = itemById.get(itemId);
      if (!item) return [];
      return [{
        itemId,
        name: item.name,
        quantity: getItemCount(state.inventory, itemId),
        buyPrice: Math.round(item.price * shop.buyMultiplier),
        sellPrice: Math.max(1, Math.floor(item.price * shop.sellMultiplier))
      }];
    })
  };
}

export function buyItem(state: WorldState, shopId: string, itemId: string, quantity = 1): WorldResult {
  const shopItem = buildShopView(state, shopId).items.find((item) => item.itemId === itemId);
  if (!shopItem) {
    return { ok: false, state, message: 'Item wird hier nicht verkauft.' };
  }

  const total = shopItem.buyPrice * quantity;
  if (state.gold < total) {
    return { ok: false, state, message: 'Nicht genug Gold.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold - total,
      inventory: addInventoryItem(state.inventory, itemId, quantity)
    },
    message: `${shopItem.name} gekauft.`
  };
}

export function sellItem(state: WorldState, shopId: string, itemId: string, quantity = 1): WorldResult {
  const shopItem = buildShopView(state, shopId).items.find((item) => item.itemId === itemId);
  if (!shopItem) {
    return { ok: false, state, message: 'Item kann hier nicht verkauft werden.' };
  }
  if (getItemCount(state.inventory, itemId) < quantity) {
    return { ok: false, state, message: 'Item nicht im Inventar.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      gold: state.gold + shopItem.sellPrice * quantity,
      inventory: removeInventoryItem(state.inventory, itemId, quantity)
    },
    message: `${shopItem.name} verkauft.`
  };
}

export function resolveEncounter(
  state: WorldState,
  mapId: string,
  position: Vec2,
  rng: Rng
): WorldResult<{ readonly world: WorldState; readonly encounter: EncounterDefinition | null }> {
  const trigger = getMapEncounters(mapId).find((encounter) =>
    encounter.kind === 'trigger'
    && encounter.position
    && encounter.position.x === position.x
    && encounter.position.y === position.y
    && !state.flags[`encounter.${encounter.id}.cleared`]
  );
  if (trigger) {
    return {
      ok: true,
      state: {
        world: applyEffects(state, [
          { type: 'set-flag', flag: `encounter.${trigger.id}.cleared`, value: true },
          { type: 'set-flag', flag: 'encounter.training-cleared', value: true }
        ]),
        encounter: trigger
      },
      message: 'Begegnung ausgelöst.'
    };
  }

  const random = getMapEncounters(mapId).find((encounter) =>
    encounter.kind === 'random'
    && encounter.bounds
    && inBounds(position, encounter.bounds)
    && rng() < encounter.chance
  );

  return {
    ok: true,
    state: { world: state, encounter: random ?? null },
    message: random ? 'Zufallsbegegnung.' : 'Keine Begegnung.'
  };
}

export function runMiniFlowSmoke(seedRng: Rng): WorldState {
  let state: WorldState = {
    flags: {},
    quests: {},
    inventory: [],
    gold: 120
  };

  const intro = startDialogForNpc(state, 'rigurd');
  const accepted = chooseDialogOption(state, intro.dialogId, intro.nodeId, 'accept');
  state = accepted.state.world;

  const bought = buyItem(state, 'tempest-supply', 'healing-herb', 1);
  if (!bought.ok) throw new Error(bought.message);
  state = bought.state;

  const encounter = resolveEncounter(state, 'tempest-start', { x: 20, y: 12 }, seedRng);
  if (!encounter.state.encounter) throw new Error('Expected trigger encounter.');
  state = encounter.state.world;

  const report = startDialogForNpc(state, 'rigurd');
  const completed = chooseDialogOption(state, report.dialogId, report.nodeId, 'report');
  state = completed.state.world;

  return state;
}

function applyEffects(state: WorldState, effects: readonly WorldEffect[]): WorldState {
  return effects.reduce((current, effect) => applyEffect(current, effect), state);
}

function applyEffect(state: WorldState, effect: WorldEffect): WorldState {
  switch (effect.type) {
    case 'set-flag':
      return { ...state, flags: { ...state.flags, [effect.flag]: effect.value } };
    case 'start-quest':
      return {
        ...state,
        quests: {
          ...state.quests,
          [effect.questId]: state.quests[effect.questId] ?? { status: 'active', completedStepIds: [] }
        }
      };
    case 'complete-quest-step': {
      const quest = state.quests[effect.questId] ?? { status: 'active', completedStepIds: [] };
      return {
        ...state,
        quests: {
          ...state.quests,
          [effect.questId]: {
            ...quest,
            status: quest.status === 'inactive' ? 'active' : quest.status,
            completedStepIds: [...new Set([...quest.completedStepIds, effect.stepId])]
          }
        }
      };
    }
    case 'complete-quest': {
      const quest = state.quests[effect.questId] ?? { status: 'active', completedStepIds: [] };
      return {
        ...state,
        quests: {
          ...state.quests,
          [effect.questId]: { ...quest, status: 'completed' }
        }
      };
    }
    case 'add-item':
      return { ...state, inventory: addInventoryItem(state.inventory, effect.itemId, effect.quantity) };
    case 'add-gold':
      return { ...state, gold: Math.max(0, state.gold + effect.amount) };
  }
}

function requirementsMet(state: WorldState, requirements: readonly WorldRequirement[]): boolean {
  return requirements.every((requirement) => {
    if (requirement.flag) return state.flags[requirement.flag] === true;
    if (requirement.questStatus) {
      const current = state.quests[requirement.questStatus.questId]?.status ?? 'inactive';
      return current === requirement.questStatus.status;
    }
    return true;
  });
}

function requireNpc(npcId: string): NpcDefinition {
  const npc = npcById.get(npcId);
  if (!npc) throw new Error(`Unknown NPC '${npcId}'.`);
  return npc;
}

function requireShop(shopId: string): ShopDefinition {
  const shop = shopById.get(shopId);
  if (!shop) throw new Error(`Unknown shop '${shopId}'.`);
  return shop;
}

function requireDialog(dialogId: string): DialogDefinition {
  const dialog = dialogsById.get(dialogId);
  if (!dialog) throw new Error(`Unknown dialog '${dialogId}'.`);
  return dialog;
}

function requireDialogNode(dialog: DialogDefinition, nodeId: string): DialogNodeDefinition {
  const node = dialog.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) throw new Error(`Unknown dialog node '${dialog.id}.${nodeId}'.`);
  return node;
}

function isAdjacentOrSame(a: Vec2, b: Vec2): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1;
}

function inBounds(position: Vec2, bounds: { readonly x: number; readonly y: number; readonly width: number; readonly height: number }): boolean {
  return position.x >= bounds.x
    && position.y >= bounds.y
    && position.x < bounds.x + bounds.width
    && position.y < bounds.y + bounds.height;
}
