import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/data';
import { getMap } from '../src/data/maps';
import { isWalkable } from '../src/systems/overworld';
import {
  allMapDiscoveryDefinitions,
  getMapDiscoveries,
  getMapDiscoveryAt
} from '../src/systems/mapDiscovery';

describe('Karten-Entdeckungen', () => {
  it('liefert eine Fundstelle exakt auf ihrer Kachel, sonst nichts', () => {
    expect(getMapDiscoveryAt('spirit-marsh', 4, 11, {})?.title).toBe('Schimmernde Moorblüte');
    expect(getMapDiscoveryAt('spirit-marsh', 5, 11, {})).toBeNull();
    expect(getMapDiscoveryAt('tempest-start', 4, 11, {})).toBeNull();
  });

  it('verschwindet, sobald sie eingesammelt ist (flag-gegatet, einmalig)', () => {
    const flags = { 'discovery.spirit-marsh.moor-bloom': true };
    expect(getMapDiscoveryAt('spirit-marsh', 4, 11, flags)).toBeNull();
    expect(getMapDiscoveries('spirit-marsh', flags).some((d) => d.x === 4 && d.y === 11)).toBe(false);
  });

  it('zeigt eine Weltveraenderung erst nach dem ausloesenden Flag (Post-Boss)', () => {
    // Geheilter Siegelhain: erst nach Sieg über das namenlose Echo sichtbar.
    expect(getMapDiscoveryAt('spirit-marsh', 18, 11, {})).toBeNull();
    const healed = getMapDiscoveryAt('spirit-marsh', 18, 11, { 'story.boss.echo-defeated': true });
    expect(healed?.rewardItemId).toBe('full-potion');
  });

  it('zeigt Rangas Rudelspur erst nach dem Pakt als sichtbare Weltfolge', () => {
    expect(getMapDiscoveryAt('tempest-start', 5, 5, {})).toBeNull();
    const trail = getMapDiscoveryAt('tempest-start', 5, 5, { 'story.direwolf.pact': true });
    expect(trail?.title).toBe('Rangas Rudelspur');
    expect(trail?.rewardItemId).toBe('healing-herb');
    expect(getMapDiscoveryAt('tempest-start', 5, 5, {
      'story.direwolf.pact': true,
      'discovery.tempest-start.ranga-pack-trail': true
    })).toBeNull();
  });

  it('zeigt den ersten Namensstein erst nach der Tempest-Benennung als Weltfolge', () => {
    expect(getMapDiscoveryAt('tempest-start', 12, 8, {})).toBeNull();
    const stone = getMapDiscoveryAt('tempest-start', 12, 8, { 'story.tempest.named': true });
    expect(stone?.title).toBe('Der erste Namensstein');
    expect(stone?.rewardItemId).toBe('tempest-charm');
    expect(getMapDiscoveryAt('tempest-start', 12, 8, {
      'story.tempest.named': true,
      'discovery.tempest-start.founding-stone': true
    })).toBeNull();
  });

  it('zeigt das Orkschlacht-Mahnmal erst nach dem Sieg über die Ork-Katastrophe', () => {
    expect(getMapDiscoveryAt('jura-battlefield', 12, 7, {})).toBeNull();
    const memorial = getMapDiscoveryAt('jura-battlefield', 12, 7, { 'story.geld.devoured': true });
    expect(memorial?.title).toBe('Mahnmal der Orkschlacht');
    expect(memorial?.rewardItemId).toBe('orc-tusk');
  });

  it('zeigt Veldoras Nachhall in der versiegelten Höhle erst nach dem Schwur', () => {
    expect(getMapDiscoveryAt('sealed-cave', 7, 6, {})).toBeNull();
    const echo = getMapDiscoveryAt('sealed-cave', 7, 6, { 'story.storm-dragon.oath': true });
    expect(echo?.title).toBe('Nachhall des Sturmdrachen');
    expect(echo?.rewardItemId).toBe('mana-drop');
  });

  it('platziert jede Fundstelle auf einer begehbaren Kachel und vergibt ein echtes Item', () => {
    const itemIds = new Set<string>(ITEMS.map((item) => item.id));
    for (const def of allMapDiscoveryDefinitions()) {
      const map = getMap(def.mapId);
      expect(isWalkable(map, def.x, def.y), `${def.flag} @ ${def.mapId}(${def.x},${def.y})`).toBe(true);
      expect(itemIds.has(def.rewardItemId), def.rewardItemId).toBe(true);
    }
  });
});
