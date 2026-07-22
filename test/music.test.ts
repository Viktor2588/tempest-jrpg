import { describe, expect, it } from 'vitest';
import { battleMusicTrack, overworldMusicTrack } from '../src/audio/music';

describe('Phase 276 — Musik-Kontexte', () => {
  it('wählt Siedlung, Wildnis und Feld anhand der Karte', () => {
    expect(overworldMusicTrack('tempest-start')).toBe('settlement');
    expect(overworldMusicTrack('sealed-cave')).toBe('wilds');
    expect(overworldMusicTrack('spirit-marsh')).toBe('overworld');
  });

  it('reserviert das Boss-Motiv für Bosskämpfe', () => {
    expect(battleMusicTrack(false)).toBe('battle');
    expect(battleMusicTrack(true)).toBe('boss');
  });
});
