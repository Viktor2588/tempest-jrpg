import { describe, expect, it } from 'vitest';
import { ITEMS } from '../src/data';
import { getMap } from '../src/data/maps';
import { isWalkable } from '../src/systems/overworld';
import {
  allMapDiscoveryDefinitions,
  getMapDiscoveries,
  getMapDiscoveryAt
} from '../src/systems/mapDiscovery';
import type { WorldClock } from '../src/systems/worldClock';

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

  // Phase 153 — duenne Regionen aufgewertet: neue, an das Loot gekoppelte Fundstellen.
  it('wertet duenne Regionen mit loot-gekoppelten Fundstellen auf (Phase 153)', () => {
    // Magistahl/Erz-Funde sind sofort sichtbar (ungegated).
    expect(getMapDiscoveryAt('freedom-academy', 13, 8, {})?.rewardItemId).toBe('magisteel');
    expect(getMapDiscoveryAt('lizardman-marsh', 15, 8, {})?.rewardItemId).toBe('magic-ore');
    expect(getMapDiscoveryAt('blumund', 13, 8, {})?.rewardItemId).toBe('hipokte-herb');

    // Magicule-Kern-Funde erscheinen erst nach der Ratsversammlung.
    expect(getMapDiscoveryAt('spirit-highlands', 17, 8, {})).toBeNull();
    const windCore = getMapDiscoveryAt('spirit-highlands', 17, 8, { 'story.council.ready': true });
    expect(windCore?.rewardItemId).toBe('lesser-magicule-core');

    expect(getMapDiscoveryAt('ember-hollow', 16, 6, {})).toBeNull();
    const emberCore = getMapDiscoveryAt('ember-hollow', 16, 6, { 'story.council.ready': true });
    expect(emberCore?.rewardItemId).toBe('ember-magicule-core');

    // Einmalig: nach dem Einsammeln verschwunden.
    expect(getMapDiscoveryAt('spirit-highlands', 17, 8, {
      'story.council.ready': true,
      'discovery.spirit-highlands.wind-core': true
    })).toBeNull();
  });

  // Phase 176 — zeit-/wettergebundene Funde.
  it('zeigt den Nebelfund NUR bei Nebel (Uhr-gegatet)', () => {
    const clear: WorldClock = { day: 0, timeOfDay: 'day', weather: 'clear' };
    const foggy: WorldClock = { day: 0, timeOfDay: 'day', weather: 'fog' };
    // Ohne Uhr oder bei klarem Wetter unsichtbar.
    expect(getMapDiscoveryAt('whispering-grove', 10, 6, {})).toBeNull();
    expect(getMapDiscoveryAt('whispering-grove', 10, 6, {}, clear)).toBeNull();
    // Bei Nebel sichtbar.
    const mist = getMapDiscoveryAt('whispering-grove', 10, 6, {}, foggy);
    expect(mist?.rewardItemId).toBe('mana-drop');
    // Marker-Liste respektiert das Uhr-Gate ebenfalls.
    expect(getMapDiscoveries('whispering-grove', {}, clear).some((d) => d.x === 10 && d.y === 6)).toBe(false);
    expect(getMapDiscoveries('whispering-grove', {}, foggy).some((d) => d.x === 10 && d.y === 6)).toBe(true);
  });

  it('zeigt den Nachtfund NUR nachts und bleibt nach dem Einsammeln weg', () => {
    const day: WorldClock = { day: 0, timeOfDay: 'day', weather: 'clear' };
    const night: WorldClock = { day: 0, timeOfDay: 'night', weather: 'clear' };
    expect(getMapDiscoveryAt('spirit-highlands', 9, 5, {}, day)).toBeNull();
    expect(getMapDiscoveryAt('spirit-highlands', 9, 5, {}, night)?.rewardItemId).toBe('spirit-ember');
    // Einmalig: mit gesetztem Flag auch nachts weg.
    expect(getMapDiscoveryAt('spirit-highlands', 9, 5, {
      'discovery.spirit-highlands.night-ember': true
    }, night)).toBeNull();
  });
});
