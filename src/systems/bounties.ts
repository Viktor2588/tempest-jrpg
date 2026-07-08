import { BOUNTIES, ENEMIES, ITEMS } from '../data';
import type { BountyDefinition, EnemyDefinition, ItemDefinition } from '../data';
import { addInventoryItem } from './inventory';
import type { InventoryStack } from './inventory';

// Phase 96 — Jagd-/Kopfgeldbrett (Bounties): reine Regeln ueber die persistierten
// Erlegungs-Zaehler (progression.defeatedEnemyCountsByEnemyId), die Einloese-Zaehler
// (progression.claimedBountyCountsByBountyId), Inventar/Gold und Flags. Keine Scene-/
// Save-Abhaengigkeit, damit sich Fortschritt + Einloesen headless testen und
// deterministisch pruefen lassen (analog systems/crafting). Erweitert die tote
// Verschlingen-Schleife (Phase 84) um belohnte, wiederholbare Ziele -> speist die
// Schmiede (Phase 91).

const bountyById = new Map<string, BountyDefinition>(BOUNTIES.map((bounty) => [bounty.id, bounty]));
const enemyById = new Map<string, EnemyDefinition>(ENEMIES.map((enemy) => [enemy.id, enemy]));
const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));

export interface BountyContext {
  readonly defeatedEnemyCounts: Readonly<Record<string, number>>;
  readonly claimedBountyCounts: Readonly<Record<string, number>>;
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
  readonly flags: Readonly<Record<string, boolean>>;
}

export interface BountyClaimResult {
  readonly ok: boolean;
  readonly inventory: readonly InventoryStack[];
  readonly gold: number;
  readonly claimedBountyCounts: Readonly<Record<string, number>>;
  readonly message: string;
}

export interface BountyRewardView {
  readonly label: string;
  readonly amount: number;
}

export interface BountyView {
  readonly bounty: BountyDefinition;
  readonly targetName: string;
  readonly required: number;
  // Erlegungen seit dem letzten Einloesen (auf `required` gedeckelt fuer die Anzeige).
  readonly progress: number;
  readonly claimedCount: number;
  readonly claimable: boolean;
  readonly rewardGold: number;
  readonly rewardItems: readonly BountyRewardView[];
}

export function getBounty(bountyId: string): BountyDefinition | undefined {
  return bountyById.get(bountyId);
}

function itemName(itemId: string): string {
  return itemById.get(itemId)?.name ?? itemId;
}

function targetName(bounty: BountyDefinition): string {
  return enemyById.get(bounty.targetEnemyId)?.name ?? bounty.targetEnemyId;
}

function claimedCount(bounty: BountyDefinition, claimedBountyCounts: Readonly<Record<string, number>>): number {
  return Math.max(0, Math.trunc(claimedBountyCounts[bounty.id] ?? 0));
}

// Ist der Auftrag sichtbar/annehmbar? Flag-Gate plus: einmalige Auftraege
// verschwinden, sobald sie einmal eingeloest wurden.
export function isBountyUnlocked(
  bounty: BountyDefinition,
  flags: Readonly<Record<string, boolean>>,
  claimedBountyCounts: Readonly<Record<string, number>>
): boolean {
  if (bounty.requiresFlag && flags[bounty.requiresFlag] !== true) {
    return false;
  }
  if (!bounty.repeatable && claimedCount(bounty, claimedBountyCounts) > 0) {
    return false;
  }
  return true;
}

// Erlegungen seit dem letzten Einloesen: Gesamtzahl minus die bereits fuer fruehere
// Einloesungen „verbrauchten" Erlegungen. Jedes Einloesen hebt die Schwelle um
// `requiredCount`, so dass derselbe wiederholbare Auftrag erst nach weiteren
// Erlegungen erneut faellig wird.
export function bountyProgress(bounty: BountyDefinition, context: BountyContext): number {
  const totalDefeated = Math.max(0, Math.trunc(context.defeatedEnemyCounts[bounty.targetEnemyId] ?? 0));
  const consumed = claimedCount(bounty, context.claimedBountyCounts) * bounty.requiredCount;
  return Math.max(0, totalDefeated - consumed);
}

export function canClaimBounty(
  bounty: BountyDefinition,
  context: BountyContext
): { readonly ok: boolean; readonly reason: string } {
  if (!isBountyUnlocked(bounty, context.flags, context.claimedBountyCounts)) {
    return { ok: false, reason: 'Nicht verfügbar.' };
  }
  if (bountyProgress(bounty, context) < bounty.requiredCount) {
    return { ok: false, reason: `Erlege ${targetName(bounty)} (${bounty.requiredCount}).` };
  }
  return { ok: true, reason: '' };
}

export function claimBounty(bounty: BountyDefinition, context: BountyContext): BountyClaimResult {
  const check = canClaimBounty(bounty, context);
  if (!check.ok) {
    return {
      ok: false,
      inventory: context.inventory,
      gold: context.gold,
      claimedBountyCounts: context.claimedBountyCounts,
      message: check.reason
    };
  }

  let inventory: readonly InventoryStack[] = context.inventory;
  for (const reward of bounty.reward.items) {
    inventory = addInventoryItem(inventory, reward.itemId, reward.quantity);
  }

  const claimedBountyCounts = {
    ...context.claimedBountyCounts,
    [bounty.id]: claimedCount(bounty, context.claimedBountyCounts) + 1
  };

  const rewardText = [
    bounty.reward.gold > 0 ? `${bounty.reward.gold} Gold` : null,
    ...bounty.reward.items.map((reward) => `${itemName(reward.itemId)} +${reward.quantity}`)
  ]
    .filter((entry): entry is string => entry !== null)
    .join(', ');

  return {
    ok: true,
    inventory,
    gold: context.gold + bounty.reward.gold,
    claimedBountyCounts,
    message: `Kopfgeld „${bounty.name}" eingelöst: ${rewardText}.`
  };
}

// Menue-/Brett-Ansicht: alle aktuell freigeschalteten Auftraege mit Fortschritt +
// Belohnung. Die Scene rendert daraus nur Text + Buttons.
export function buildBountyBoardView(context: BountyContext): BountyView[] {
  return BOUNTIES.filter((bounty) =>
    isBountyUnlocked(bounty, context.flags, context.claimedBountyCounts)
  ).map((bounty) => {
    const check = canClaimBounty(bounty, context);
    return {
      bounty,
      targetName: targetName(bounty),
      required: bounty.requiredCount,
      progress: Math.min(bounty.requiredCount, bountyProgress(bounty, context)),
      claimedCount: claimedCount(bounty, context.claimedBountyCounts),
      claimable: check.ok,
      rewardGold: bounty.reward.gold,
      rewardItems: bounty.reward.items.map((reward) => ({
        label: itemName(reward.itemId),
        amount: reward.quantity
      }))
    };
  });
}

// Erlegte Gegner-Arten eines gewonnenen Kampfes in die Zaehler einbuchen
// (battleResult ruft das nach dem Sieg auf). Idempotent-arm: reine Addition.
export function tallyDefeatedEnemies(
  defeatedEnemyCounts: Readonly<Record<string, number>>,
  defeatedEnemyIds: readonly string[]
): Readonly<Record<string, number>> {
  if (defeatedEnemyIds.length === 0) {
    return defeatedEnemyCounts;
  }
  const next: Record<string, number> = { ...defeatedEnemyCounts };
  for (const enemyId of defeatedEnemyIds) {
    if (!enemyId) {
      continue;
    }
    next[enemyId] = Math.max(0, Math.trunc(next[enemyId] ?? 0)) + 1;
  }
  return next;
}
