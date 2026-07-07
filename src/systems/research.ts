import { ITEMS, RESEARCH_PROJECTS } from '../data';
import type { ItemDefinition, ResearchProject } from '../data';
import { getItemCount, removeInventoryItem } from './inventory';
import type { InventoryStack } from './inventory';

const itemById = new Map<string, ItemDefinition>(ITEMS.map((item) => [item.id, item]));

export interface ResearchContext {
  readonly inventory: readonly InventoryStack[];
  readonly magicules: number;
  readonly flags: Readonly<Record<string, boolean>>;
}

export interface ResearchInputView {
  readonly itemId: string;
  readonly name: string;
  readonly required: number;
  readonly owned: number;
  readonly enough: boolean;
}

export interface ResearchProjectView {
  readonly project: ResearchProject;
  readonly inputs: readonly ResearchInputView[];
  readonly affordable: boolean;
  readonly completable: boolean;
  readonly reason: string;
}

export interface ResearchResult {
  readonly ok: boolean;
  readonly inventory: readonly InventoryStack[];
  readonly magicules: number;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly message: string;
}

function itemName(itemId: string): string {
  return itemById.get(itemId)?.name ?? itemId;
}

export function isResearchProjectVisible(
  project: ResearchProject,
  flags: Readonly<Record<string, boolean>>
): boolean {
  if (flags[project.unlockFlag] === true) return false;
  return !project.requiresFlag || flags[project.requiresFlag] === true;
}

export function canCompleteResearchProject(
  project: ResearchProject,
  context: ResearchContext
): { readonly ok: boolean; readonly reason: string } {
  if (!isResearchProjectVisible(project, context.flags)) {
    return { ok: false, reason: 'Noch nicht bereit.' };
  }
  if (context.magicules < project.magiculeCost) {
    return { ok: false, reason: `${project.magiculeCost} Magicules erforderlich.` };
  }
  const missing = project.inputs.find(
    (input) => getItemCount(context.inventory, input.itemId) < input.quantity
  );
  if (missing) {
    return { ok: false, reason: `Material fehlt: ${itemName(missing.itemId)}.` };
  }
  return { ok: true, reason: '' };
}

export function completeResearchProject(
  project: ResearchProject,
  context: ResearchContext
): ResearchResult {
  const check = canCompleteResearchProject(project, context);
  if (!check.ok) {
    return {
      ok: false,
      inventory: context.inventory,
      magicules: context.magicules,
      flags: context.flags,
      message: check.reason
    };
  }

  let inventory: readonly InventoryStack[] = context.inventory;
  for (const input of project.inputs) {
    inventory = removeInventoryItem(inventory, input.itemId, input.quantity);
  }

  return {
    ok: true,
    inventory,
    magicules: context.magicules - project.magiculeCost,
    flags: { ...context.flags, [project.unlockFlag]: true },
    message: `${project.name} abgeschlossen.`
  };
}

export function buildResearchView(context: ResearchContext): ResearchProjectView[] {
  return RESEARCH_PROJECTS
    .filter((project) => isResearchProjectVisible(project, context.flags))
    .map((project) => {
      const inputs = project.inputs.map<ResearchInputView>((input) => {
        const owned = getItemCount(context.inventory, input.itemId);
        return {
          itemId: input.itemId,
          name: itemName(input.itemId),
          required: input.quantity,
          owned,
          enough: owned >= input.quantity
        };
      });
      const check = canCompleteResearchProject(project, context);
      return {
        project,
        inputs,
        affordable: context.magicules >= project.magiculeCost,
        completable: check.ok,
        reason: check.reason
      };
    });
}
