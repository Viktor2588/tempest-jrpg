import { describe, expect, it } from 'vitest';
import { GAME_DATA } from '../src/data';
import { RESEARCH_PROJECTS } from '../src/data/research';

// Die Nation-Arc-Datensätze (Phasen 91–100: Schmiede, Jagdbrett, Einrichtungen,
// Bewohner, Forschung) verweisen per ID auf items/enemies, werden aber vom
// zentralen validateGameData NICHT geprüft. Ein vertippter Item-/Gegner-ID
// bliebe still — ein totes Rezept, ein nie erfüllbarer Auftrag. Diese Prüfung
// hält jede Referenz an den echten Daten dicht.
const itemIds = new Set<string>(GAME_DATA.items.map((item) => item.id));
const enemyIds = new Set<string>(GAME_DATA.enemies.map((enemy) => enemy.id));

function unresolvedItem(path: string, itemId: string): string | null {
  return itemIds.has(itemId) ? null : `${path} → unbekanntes Item '${itemId}'`;
}
function unresolvedEnemy(path: string, enemyId: string): string | null {
  return enemyIds.has(enemyId) ? null : `${path} → unbekannter Gegner '${enemyId}'`;
}

describe('Nation-Arc-Datenintegrität', () => {
  it('löst jede Item-/Gegner-Referenz in Schmiede, Jagd, Einrichtungen, Bewohnern und Forschung auf', () => {
    const dangling: string[] = [];
    const add = (issue: string | null): void => {
      if (issue) dangling.push(issue);
    };

    for (const r of GAME_DATA.craftingRecipes) {
      add(unresolvedItem(`crafting.${r.id}.outputItemId`, r.outputItemId));
      r.inputs.forEach((i) => add(unresolvedItem(`crafting.${r.id}.inputs`, i.itemId)));
    }
    for (const b of GAME_DATA.bounties) {
      add(unresolvedEnemy(`bounties.${b.id}.targetEnemyId`, b.targetEnemyId));
      b.reward.items.forEach((i) => add(unresolvedItem(`bounties.${b.id}.reward`, i.itemId)));
    }
    for (const f of GAME_DATA.facilities) {
      if (f.output.kind === 'item') add(unresolvedItem(`facilities.${f.id}.output`, f.output.itemId));
    }
    for (const res of GAME_DATA.residents) {
      add(unresolvedEnemy(`residents.${res.id}.originEnemyId`, res.originEnemyId));
    }
    for (const p of RESEARCH_PROJECTS) {
      p.inputs.forEach((i) => add(unresolvedItem(`research.${p.id}.inputs`, i.itemId)));
    }

    expect(dangling).toEqual([]);
  });

  it('vergibt eindeutige IDs innerhalb jedes Nation-Arc-Datensatzes', () => {
    const dupes = (ids: readonly string[]): string[] =>
      ids.filter((id, i) => ids.indexOf(id) !== i);

    expect(dupes(GAME_DATA.craftingRecipes.map((r) => r.id))).toEqual([]);
    expect(dupes(GAME_DATA.bounties.map((b) => b.id))).toEqual([]);
    expect(dupes(GAME_DATA.facilities.map((f) => f.id))).toEqual([]);
    expect(dupes(GAME_DATA.residents.map((r) => r.id))).toEqual([]);
    expect(dupes(RESEARCH_PROJECTS.map((p) => p.id))).toEqual([]);
  });

  it('erkennt eine kaputte Referenz (Selbsttest des Wächters)', () => {
    // Ein vertippter Gegner-ID im Jagd-Ziel darf nicht als gültig durchgehen.
    expect(enemyIds.has('kein-solcher-gegner')).toBe(false);
    expect(unresolvedEnemy('bounties.x.targetEnemyId', 'kein-solcher-gegner')).not.toBeNull();
    expect(unresolvedItem('crafting.x.outputItemId', GAME_DATA.items[0]!.id)).toBeNull();
  });
});
