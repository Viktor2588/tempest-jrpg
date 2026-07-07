import { describe, expect, it } from 'vitest';
import { LOCATIONS, type WorldLocationDefinition } from '../src/data/world';

// Phase 106 — Haupthandlungsstrang: der regionale Laufweg ist eine lineare Kette.
// Jede Region öffnet erst nach dem Abschluss-Flag der vorigen (Dwargon → Echsen →
// Geld → Blumund/Ifrit), damit die High-Level-Set-Pieces Orc-Disaster und Ifrit
// nicht mehr direkt nach dem gemeinsamen Kijin-Beat erreichbar sind.
const EXPECTED_GATE_FLAGS: Readonly<Record<string, string>> = {
  'gate-to-dwargon': 'story.kijin.named', // harmlose Schmiedestadt = Einstieg
  'gate-to-lizard-marsh': 'faction.dwargon.allied',
  'gate-to-battlefield': 'story.lizard.allied',
  'gate-to-blumund': 'faction.orcs.joined',
  'gate-to-ember-hollow': 'faction.orcs.joined'
};

describe('Phase 106 — regionale Gateway-Kette', () => {
  const gateById = new Map(
    (LOCATIONS as readonly WorldLocationDefinition[])
      .filter((loc) => loc.travelTo)
      .map((loc) => [loc.id, loc] as const)
  );

  it('gated jede regionale Reise hinter dem Abschluss-Flag der vorigen Region', () => {
    for (const [id, flag] of Object.entries(EXPECTED_GATE_FLAGS)) {
      expect(gateById.get(id)?.unlockFlag, id).toBe(flag);
    }
  });

  it('löst die drei Kampf-Regionen (Echsen/Geld/Ifrit) vom gemeinsamen Kijin-Beat', () => {
    for (const id of ['gate-to-lizard-marsh', 'gate-to-battlefield', 'gate-to-ember-hollow']) {
      const flag = gateById.get(id)?.unlockFlag;
      expect(flag, id).not.toBe('story.kijin.named');
      expect(flag, id).not.toBe('faction.kijin.sworn');
    }
  });
});
