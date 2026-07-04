import type { SkillTreeDefinition, SkillTreeNodeDefinition } from '../data';
import type { HudLayoutIssue } from './mobileLayout';

// Phase 72 — reines, headless testbares Layout für den Spec-Baum-Tab: eine
// Spalte je Spezialisierungsstrang, Knoten nach Tiefe (Eltern→Kind) gestapelt,
// Kanten aus `requiredNodeIds`. Zustände (aktiv/freischaltbar/gesperrt) und die
// Perk-Vorschau liefert die Szene aus der Progression bzw. `describePerk`.

export interface SpecLayoutNode {
  readonly nodeId: string;
  readonly branch: string; // '' für strangfreie (Legacy-)Knoten
  readonly column: number;
  readonly depth: number;
  readonly x: number;
  readonly y: number;
}

export interface SpecLayoutEdge {
  readonly fromNodeId: string;
  readonly toNodeId: string;
}

export interface SpecLayoutColumn {
  readonly branch: string;
  readonly index: number;
  readonly x: number;
}

export interface SpecTreeLayout {
  readonly columns: readonly SpecLayoutColumn[];
  readonly nodes: readonly SpecLayoutNode[];
  readonly edges: readonly SpecLayoutEdge[];
}

export interface SpecLayoutOptions {
  readonly left: number;
  readonly top: number;
  readonly columnWidth: number;
  readonly rowHeight: number;
  readonly nodeWidth: number;
  readonly nodeHeight: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
}

export const DEFAULT_SPEC_LAYOUT: SpecLayoutOptions = {
  left: 312,
  top: 200,
  columnWidth: 212,
  rowHeight: 62,
  nodeWidth: 196,
  nodeHeight: 50,
  viewportWidth: 960,
  viewportHeight: 540
};

// Spaltenreihenfolge: strangfreie Knoten zuerst (falls vorhanden), dann die
// Stränge in Erst-Auftritts-Reihenfolge.
function columnOrder(nodes: readonly SkillTreeNodeDefinition[]): string[] {
  const order: string[] = [];
  for (const node of nodes) {
    const branch = node.branch ?? '';
    if (!order.includes(branch)) order.push(branch);
  }
  // '' (strangfrei) immer als erste Spalte, sonst Reihenfolge beibehalten.
  return order.sort((a, b) => (a === '' ? -1 : b === '' ? 1 : 0));
}

// Tiefe innerhalb der eigenen Spalte: längster Pfad über requiredNodeIds, die in
// derselben Spalte liegen. Einstiegsknoten (keine spalteninternen Vorgänger) → 0.
function computeDepths(columnNodes: readonly SkillTreeNodeDefinition[]): Map<string, number> {
  const inColumn = new Set(columnNodes.map((node) => node.id));
  const byId = new Map(columnNodes.map((node) => [node.id, node] as const));
  const depth = new Map<string, number>();
  const visit = (id: string, guard: Set<string>): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    if (guard.has(id)) return 0; // Zyklusschutz
    guard.add(id);
    const node = byId.get(id);
    const parents = (node?.requiredNodeIds ?? []).filter((req) => inColumn.has(req));
    const value = parents.length === 0 ? 0 : 1 + Math.max(...parents.map((req) => visit(req, guard)));
    depth.set(id, value);
    return value;
  };
  for (const node of columnNodes) visit(node.id, new Set());
  return depth;
}

export function layoutSpecTree(
  tree: SkillTreeDefinition,
  options: SpecLayoutOptions = DEFAULT_SPEC_LAYOUT
): SpecTreeLayout {
  const treeNodes = tree.nodes as readonly SkillTreeNodeDefinition[];
  const order = columnOrder(treeNodes);
  const columns: SpecLayoutColumn[] = order.map((branch, index) => ({
    branch,
    index,
    x: options.left + index * options.columnWidth
  }));
  const nodes: SpecLayoutNode[] = [];
  for (const column of columns) {
    const columnNodes = treeNodes.filter((node) => (node.branch ?? '') === column.branch);
    const depths = computeDepths(columnNodes);
    // Geschwister derselben Tiefe würden bei y=Tiefe kollidieren → je Spalte eine
    // eigene Zeile pro Knoten, sortiert nach Tiefe (dann Auftritt). Die Tiefe
    // bleibt für Eltern→Kind-Linien erhalten.
    const ordered = columnNodes
      .map((node, appearance) => ({ node, appearance, depth: depths.get(node.id) ?? 0 }))
      .sort((a, b) => a.depth - b.depth || a.appearance - b.appearance);
    ordered.forEach((entry, row) => {
      nodes.push({
        nodeId: entry.node.id,
        branch: column.branch,
        column: column.index,
        depth: entry.depth,
        x: column.x,
        y: options.top + row * options.rowHeight
      });
    });
  }

  const positioned = new Set(nodes.map((node) => node.nodeId));
  const edges: SpecLayoutEdge[] = [];
  for (const node of treeNodes) {
    for (const parent of node.requiredNodeIds) {
      if (positioned.has(parent)) {
        edges.push({ fromNodeId: parent, toNodeId: node.id });
      }
    }
  }

  return { columns, nodes, edges };
}

// Headless-Validierung: Knoten bleiben im Canvas und überlappen nicht
// (gleiche Spalte + Tiefe). Gleiches HudLayoutIssue-Muster wie menuLayout.
export function analyzeSpecTreeLayout(
  layout: SpecTreeLayout,
  options: SpecLayoutOptions = DEFAULT_SPEC_LAYOUT
): HudLayoutIssue[] {
  const issues: HudLayoutIssue[] = [];
  const seen = new Map<string, string>();
  for (const node of layout.nodes) {
    const right = node.x + options.nodeWidth;
    const bottom = node.y + options.nodeHeight;
    if (node.x < 0 || right > options.viewportWidth) {
      issues.push({ path: `spec.node.${node.nodeId}`, message: `Knoten läuft horizontal aus dem Canvas (x=${node.x}, rechts=${right}).` });
    }
    if (bottom > options.viewportHeight) {
      issues.push({ path: `spec.node.${node.nodeId}`, message: `Knoten läuft vertikal aus dem Canvas (unten=${bottom}).` });
    }
    const cell = `${node.column}:${node.y}`;
    const existing = seen.get(cell);
    if (existing) {
      issues.push({ path: `spec.node.${node.nodeId}`, message: `Überlappt ${existing} auf Spalte ${node.column}, y=${node.y}.` });
    } else {
      seen.set(cell, node.nodeId);
    }
  }
  return issues;
}

export function clampSpecTreePan(
  layout: SpecTreeLayout,
  requestedY: number,
  options: SpecLayoutOptions = DEFAULT_SPEC_LAYOUT,
  viewportBottom = options.viewportHeight - 20
): number {
  const contentBottom = Math.max(
    options.top,
    ...layout.nodes.map((node) => node.y + options.nodeHeight)
  );
  return Math.min(0, Math.max(viewportBottom - contentBottom, requestedY));
}
