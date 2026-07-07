import { describe, expect, it } from 'vitest';
import { HEROES, ITEMS } from '../src/data';
import { NPCS } from '../src/data/world';
import {
  SCENE_SCRIPTS,
  acknowledgeScene,
  getPendingScene,
  getSceneScript,
  scenePlayedFlag
} from '../src/data/scenes';
import {
  createSceneRunner,
  validateSceneScript,
  type SceneScript,
  type SceneScriptContext
} from '../src/systems/sceneScript';

const CONTEXT: SceneScriptContext = {
  actorIds: new Set<string>([...HEROES.map((h) => h.id), ...NPCS.map((n) => n.id)]),
  itemIds: new Set<string>(ITEMS.map((i) => i.id))
};

describe('sceneScript runner', () => {
  const script: SceneScript = {
    id: 'demo',
    steps: [
      { kind: 'text', line: 'a' },
      { kind: 'wait', ms: 10 },
      { kind: 'text', line: 'b' }
    ]
  };

  it('läuft Schritt für Schritt durch und meldet dann done', () => {
    const runner = createSceneRunner(script);
    expect(runner.index()).toBe(0);
    expect(runner.current()).toEqual({ kind: 'text', line: 'a' });
    expect(runner.done()).toBe(false);

    expect(runner.advance()).toEqual({ kind: 'wait', ms: 10 });
    expect(runner.advance()).toEqual({ kind: 'text', line: 'b' });
    expect(runner.advance()).toBeNull();
    expect(runner.done()).toBe(true);
    expect(runner.index()).toBe(3);
    // Weiteres advance bleibt stabil am Ende.
    expect(runner.advance()).toBeNull();
    expect(runner.index()).toBe(3);
  });
});

describe('sceneScript validation', () => {
  it('meldet unbekannte Akteure, Items, leere Beats und leere Skripte', () => {
    const bad: SceneScript = {
      id: 'bad',
      steps: [
        { kind: 'move', actor: 'niemand', to: { x: 1, y: 1 } },
        { kind: 'text', line: '   ' },
        { kind: 'give', itemId: 'kein-item', quantity: 0 },
        { kind: 'wait', ms: -5 }
      ]
    };
    const issues = validateSceneScript(bad, CONTEXT);
    expect(issues.some((m) => m.includes("Akteur 'niemand'"))).toBe(true);
    expect(issues.some((m) => m.includes('leerer Textbeat'))).toBe(true);
    expect(issues.some((m) => m.includes("Item 'kein-item'"))).toBe(true);
    expect(issues.some((m) => m.includes('Menge muss'))).toBe(true);
    expect(issues.some((m) => m.includes('negative Wartezeit'))).toBe(true);

    expect(validateSceneScript({ id: 'leer', steps: [] }, CONTEXT))
      .toContain("Szene 'leer': keine Schritte.");
  });
});

describe('SCENE_SCRIPTS (die grossen Beats)', () => {
  it('sind alle gegen echte Akteure und Items valide', () => {
    for (const script of SCENE_SCRIPTS) {
      expect(validateSceneScript(script, CONTEXT), script.id).toEqual([]);
    }
  });

  it('deckt die vorgesehenen Beats ab und liefert je eine Zusammenfassung', () => {
    for (const id of ['cave-awakening', 'direwolf-pact', 'tempest-naming', 'geld-victory', 'harvest-festival']) {
      const script = getSceneScript(id);
      expect(script, id).toBeDefined();
      expect(script!.steps.length).toBeGreaterThan(0);
      expect(script!.summary?.title, id).toBeTruthy();
    }
  });
});

describe('Szenen-Ausloeser (Flag-gegatet, einmalig, Story-Reihenfolge)', () => {
  it('spielt nichts ohne gesetztes Story-Flag', () => {
    expect(getPendingScene({})).toBeNull();
  });

  it('liefert die dem Flag zugeordnete Szene und bei mehreren den juengsten Beat', () => {
    expect(getPendingScene({ 'story.direwolf.pact': true })?.id).toBe('direwolf-pact');
    expect(getPendingScene({ 'story.harvest-festival.awakened': true })?.id).toBe('harvest-festival');
    // Mehrere ausgeloest (aelterer Save) → nur der juengste Beat, aeltere werden nicht nachgeholt.
    const both = getPendingScene({ 'story.storm-dragon.oath': true, 'story.tempest.named': true });
    expect(both?.id).toBe('tempest-naming');
  });

  it('markiert beim Bestaetigen die Szene und alle frueheren als gespielt', () => {
    const flags = { 'story.storm-dragon.oath': true, 'story.tempest.named': true };
    const next = acknowledgeScene(flags, 'tempest-naming');
    expect(next[scenePlayedFlag('tempest-naming')]).toBe(true);
    expect(next[scenePlayedFlag('cave-awakening')]).toBe(true); // frueherer Beat mit-erledigt
    expect(getPendingScene(next)).toBeNull();
    // acknowledge ist idempotent.
    expect(acknowledgeScene(next, 'tempest-naming')).toBe(next);
  });
});
