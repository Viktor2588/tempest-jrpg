import { describe, expect, it } from 'vitest';
import { getRangaJourneyDiscovery, canPresentRangaJourney } from '../src/systems/rangaJourney';

describe('Ranga-Reiseinszenierung', () => {
  it('liefert pro Ziel einen einmaligen optionalen Fund', () => {
    const discovery = getRangaJourneyDiscovery({}, 'goblin-village');
    expect(discovery?.rewardItemId).toBe('healing-herb');
    expect(getRangaJourneyDiscovery({ [discovery!.flag]: true }, 'goblin-village')).toBeNull();
  });

  it('liefert für Ziele ohne Fund keine Entdeckung', () => {
    expect(getRangaJourneyDiscovery({}, 'direwolf-den')).toBeNull();
    expect(getRangaJourneyDiscovery({}, 'unknown')).toBeNull();
  });

  it('akzeptiert nur erfolgreiche Reisen mit Zielmetadaten', () => {
    expect(canPresentRangaJourney({
      ok: true,
      location: { mapId: 'tempest-start', x: 3, y: 5, facing: 'down' },
      message: 'Los',
      destinationId: 'tempest-hollow',
      destinationName: 'Tempest'
    })).toBe(true);
    expect(canPresentRangaJourney({ ok: false, location: null, message: 'Nein' })).toBe(false);
  });
});
