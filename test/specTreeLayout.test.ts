import { describe, expect, it } from 'vitest';
import { SKILL_TREES, type SkillTreeNodeDefinition } from '../src/data';
import { getSkillTree } from '../src/systems/progression';
import { describePerk } from '../src/systems/talentPerk';
import { analyzeSpecTreeLayout, clampSpecTreePan, layoutSpecTree } from '../src/systems/specTreeLayout';

const branchedTrees = SKILL_TREES.filter((tree) =>
  (tree.nodes as readonly SkillTreeNodeDefinition[]).some((node) => node.branch !== undefined)
);

describe('Phase 72 — Spec-Baum-Layout', () => {
  it('legt Benimarus Baum in 3 Strang-Spalten mit Eltern→Kind-Kanten', () => {
    const layout = layoutSpecTree(getSkillTree('benimaru')!);
    expect(layout.columns.map((column) => column.branch)).toEqual(['blade', 'flame', 'command']);
    // Einstiegsknoten je Strang bei Tiefe 0, Spalten-x steigt monoton.
    const focus = layout.nodes.find((node) => node.nodeId === 'benimaru-blade-focus')!;
    expect(focus.depth).toBe(0);
    expect(layout.columns[0]!.x).toBeLessThan(layout.columns[2]!.x);
    // Kante focus → counter (Vorgänger) existiert.
    expect(layout.edges).toContainEqual({ fromNodeId: 'benimaru-blade-focus', toNodeId: 'benimaru-blade-counter' });
  });

  it('platziert alle Strang-Bäume ohne Überlappung im Canvas', () => {
    for (const tree of branchedTrees) {
      const issues = analyzeSpecTreeLayout(layoutSpecTree(tree));
      expect(issues, tree.characterId).toEqual([]);
    }
  });

  it('Geschwister-Knoten derselben Tiefe bekommen verschiedene Zeilen', () => {
    const layout = layoutSpecTree(getSkillTree('benimaru')!);
    const counter = layout.nodes.find((node) => node.nodeId === 'benimaru-blade-counter')!;
    const resolve = layout.nodes.find((node) => node.nodeId === 'benimaru-blade-resolve')!;
    expect(counter.depth).toBe(resolve.depth); // beide hängen an focus
    expect(counter.y).not.toBe(resolve.y); // aber unterschiedliche Zeilen
  });

  it('beschreibt jede Perk-Art menschenlesbar', () => {
    expect(describePerk({ kind: 'damage-dealt', percent: 15, category: 'physical' })).toBe('+15% physischer Schaden');
    expect(describePerk({ kind: 'damage-dealt', percent: 20, element: 'fire' })).toBe('+20% Feuer-Schaden');
    expect(describePerk({ kind: 'damage-taken', percent: 15 })).toBe('-15% erlittener Schaden');
    expect(describePerk({ kind: 'max-hp', percent: 12 })).toBe('+12% max. LP');
    expect(describePerk({ kind: 'dodge', percent: 15 })).toBe('15% Ausweichchance');
    expect(describePerk({ kind: 'counter', percent: 30, scale: 1.4 })).toBe('30% Konterchance (×1.4 Wucht)');
    expect(describePerk({ kind: 'skill-chain', triggerSkillId: 'x', followUpSkillId: 'y', percent: 40 }))
      .toContain('40%');
    expect(describePerk({ kind: 'buff-power', percent: 100 })).toContain('länger');
  });

  it('begrenzt Touch-Panning auf den sichtbaren Bauminhalt', () => {
    const tree = getSkillTree('benimaru')!;
    const layout = layoutSpecTree(tree, {
      left: 300, top: 300, columnWidth: 212, rowHeight: 100,
      nodeWidth: 196, nodeHeight: 50, viewportWidth: 960, viewportHeight: 540
    });
    expect(clampSpecTreePan(layout, -999, {
      left: 300, top: 300, columnWidth: 212, rowHeight: 100,
      nodeWidth: 196, nodeHeight: 50, viewportWidth: 960, viewportHeight: 540
    })).toBe(-130);
    expect(clampSpecTreePan(layout, 20)).toBe(0);
  });
});
