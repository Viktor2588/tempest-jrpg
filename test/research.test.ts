import { describe, expect, it } from 'vitest';
import { ITEMS, RESEARCH_PROJECTS } from '../src/data';
import {
  buildResearchView,
  canCompleteResearchProject,
  completeResearchProject,
  type ResearchContext
} from '../src/systems/research';
import { getItemCount } from '../src/systems/inventory';

const itemIds = new Set(ITEMS.map((item) => item.id));

function context(overrides: Partial<ResearchContext> = {}): ResearchContext {
  return {
    inventory: [],
    magicules: 0,
    flags: {},
    ...overrides
  };
}

describe('research data', () => {
  it('verweist nur auf existierende Items und setzt ein Unlock-Flag', () => {
    for (const project of RESEARCH_PROJECTS) {
      expect(project.unlockFlag, project.id).toMatch(/^research\./);
      expect(project.magiculeCost).toBeGreaterThan(0);
      expect(project.inputs.length).toBeGreaterThan(0);
      for (const input of project.inputs) {
        expect(itemIds.has(input.itemId), `${project.id} input ${input.itemId}`).toBe(true);
        expect(input.quantity).toBeGreaterThan(0);
      }
    }
  });
});

describe('research projects', () => {
  it('zeigt Geistkern-Forschung erst nach dem Kinder-Kern-Flag', () => {
    expect(buildResearchView(context())).toHaveLength(0);

    const view = buildResearchView(context({
      flags: { 'story.children.first-core': true }
    }));
    expect(view.map((row) => row.project.id)).toEqual(['stabilize-spirit-cores']);
  });

  it('verbraucht Material und Magicules beim Stabilisieren', () => {
    const project = RESEARCH_PROJECTS.find((entry) => entry.id === 'stabilize-spirit-cores')!;
    const before = context({
      inventory: [
        { itemId: 'spirit-ember', quantity: 1 },
        { itemId: 'mana-drop', quantity: 2 }
      ],
      magicules: 25,
      flags: { 'story.children.first-core': true }
    });

    const result = completeResearchProject(project, before);

    expect(result.ok).toBe(true);
    expect(result.magicules).toBe(5);
    expect(result.flags['research.spirit-cores.stabilized']).toBe(true);
    expect(getItemCount(result.inventory, 'spirit-ember')).toBe(0);
    expect(getItemCount(result.inventory, 'mana-drop')).toBe(0);
  });

  it('gibt die Geist-Infusion nach stabilisierten Kernen frei', () => {
    const view = buildResearchView(context({
      flags: {
        'story.children.first-core': true,
        'research.spirit-cores.stabilized': true
      }
    }));

    expect(view.map((row) => row.project.id)).toEqual(['spirit-infusion']);
  });

  it('schlaegt ohne Material fehl, ohne etwas zu verbrauchen', () => {
    const project = RESEARCH_PROJECTS.find((entry) => entry.id === 'spirit-infusion')!;
    const before = context({
      inventory: [{ itemId: 'magic-ore', quantity: 1 }],
      magicules: 99,
      flags: { 'research.spirit-cores.stabilized': true }
    });

    const check = canCompleteResearchProject(project, before);
    const result = completeResearchProject(project, before);

    expect(check.ok).toBe(false);
    expect(check.reason).toContain('Magisches Erz');
    expect(result.ok).toBe(false);
    expect(result.flags['research.spirit-infusion.unlocked']).toBeUndefined();
    expect(getItemCount(result.inventory, 'magic-ore')).toBe(1);
  });
});
