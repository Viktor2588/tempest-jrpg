import { describe, expect, it } from 'vitest';
import { RELATIONSHIPS, type RelationshipDefinition } from '../src/data';
import {
  bondPerksForCharacter,
  createProgressionState,
  getRelationshipLevelNumber
} from '../src/systems/progression';
import {
  acknowledgeBondScene,
  bondSceneToScript,
  bondScenePlayedFlag,
  getPendingBondScene
} from '../src/systems/bondScenes';
import { validateSceneScript } from '../src/systems/sceneScript';

const relById = new Map<string, RelationshipDefinition>(
  (RELATIONSHIPS as readonly RelationshipDefinition[]).map((rel) => [rel.id, rel])
);

// Punktestand, der eine Beziehung sicher auf Stufe 3 (hoechste Stufe) hebt.
function maxPointsFor(relationshipId: string): number {
  const rel = relById.get(relationshipId)!;
  return Math.max(...rel.levels.map((level) => level.requiredPoints));
}

describe('Bindungs-Szenen (Phase 98)', () => {
  it('liefert keine Szene, solange die Bindungsstufe nicht erreicht ist', () => {
    const state = createProgressionState();
    // Frisch: alle Beziehungen auf Stufe 0 → keine Szene faellig.
    expect(getPendingBondScene(state, {})).toBeNull();
  });

  it('gibt eine faellige Szene aus, sobald die geforderte Stufe erreicht ist', () => {
    const state = createProgressionState({
      relationshipPoints: { 'rimuru-gobta': 20 }
    });
    expect(getRelationshipLevelNumber(state, 'rimuru-gobta')).toBe(1);
    const pending = getPendingBondScene(state, {});
    expect(pending?.relationship.id).toBe('rimuru-gobta');
    expect(pending?.scene.requiredLevel).toBe(1);
  });

  it('ueberspringt bereits gespielte Szenen und liefert die naechste', () => {
    const state = createProgressionState({
      relationshipPoints: { 'rimuru-gobta': 120 }
    });
    const first = getPendingBondScene(state, {});
    expect(first?.scene.id).toBe('rimuru-gobta-patrol');
    const flags = acknowledgeBondScene({}, first!.scene.id);
    const second = getPendingBondScene(state, flags);
    expect(second?.scene.id).toBe('rimuru-gobta-storm-drill');
  });

  it('respektiert die Roster-Verfuegbarkeit des Hauptcharakters', () => {
    const state = createProgressionState({ relationshipPoints: { 'gobta-ranga': 25 } });
    // gobta ist Hauptcharakter dieser Beziehung; ohne ihn im Roster keine Szene.
    expect(getPendingBondScene(state, {}, new Set(['rimuru']))).toBeNull();
    expect(getPendingBondScene(state, {}, new Set(['gobta']))?.relationship.id).toBe('gobta-ranga');
  });

  it('acknowledge ist idempotent und setzt den eigenen Flag-Namensraum', () => {
    const flags = acknowledgeBondScene({}, 'rimuru-gobta-patrol');
    expect(flags[bondScenePlayedFlag('rimuru-gobta-patrol')]).toBe(true);
    expect(acknowledgeBondScene(flags, 'rimuru-gobta-patrol')).toBe(flags);
  });

  it('erzeugt ein gueltiges, nicht-leeres SceneScript pro Szene', () => {
    const context = { actorIds: new Set<string>(), itemIds: new Set<string>() };
    for (const rel of RELATIONSHIPS as readonly RelationshipDefinition[]) {
      for (const scene of rel.scenes) {
        const script = bondSceneToScript(rel, scene);
        expect(script.steps.length).toBeGreaterThan(0);
        expect(script.summary?.title).toBe(scene.title);
        // Erzaehler-/Sprecher-Beats brauchen keine bekannten Akteure → keine Fehler.
        expect(validateSceneScript(script, context)).toEqual([]);
      }
    }
  });
});

describe('Bond-Perks (Phase 98)', () => {
  it('verleiht keine Perk unterhalb der hoechsten Bindungsstufe', () => {
    const state = createProgressionState({ relationshipPoints: { 'rimuru-milim': 100 } });
    expect(getRelationshipLevelNumber(state, 'rimuru-milim')).toBe(2);
    expect(bondPerksForCharacter('rimuru', state)).toEqual([]);
  });

  it('verleiht die Bond-Perk der erreichten hoechsten Stufe dem Hauptcharakter', () => {
    const state = createProgressionState({
      relationshipPoints: { 'rimuru-milim': maxPointsFor('rimuru-milim') }
    });
    expect(getRelationshipLevelNumber(state, 'rimuru-milim')).toBe(3);
    const perks = bondPerksForCharacter('rimuru', state);
    expect(perks).toContainEqual({ kind: 'damage-dealt', category: 'physical', percent: 10 });
  });

  it('ordnet die Perk nur dem Hauptcharakter zu, nicht dem Partner', () => {
    const state = createProgressionState({
      relationshipPoints: { 'gobta-ranga': maxPointsFor('gobta-ranga') }
    });
    expect(bondPerksForCharacter('gobta', state)).toContainEqual({ kind: 'dodge', percent: 10 });
    // ranga ist Partner, nicht Hauptcharakter dieser Beziehung.
    expect(bondPerksForCharacter('ranga', state)).toEqual([]);
  });

  it('jede Beziehung definiert genau eine Bond-Perk an ihrer hoechsten Stufe', () => {
    for (const rel of RELATIONSHIPS as readonly RelationshipDefinition[]) {
      const topLevel = Math.max(...rel.levels.map((level) => level.level));
      const withPerk = rel.levels.filter((level) => level.perk !== undefined);
      expect(withPerk).toHaveLength(1);
      expect(withPerk[0]!.level).toBe(topLevel);
    }
  });
});
