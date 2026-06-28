import { describe, expect, it } from 'vitest';
import assetsDoc from '../ASSETS.md?raw';
import musicSource from '../src/audio/music.ts?raw';
import sfxSource from '../src/audio/sfx.ts?raw';

const assetFiles = Object.keys(import.meta.glob('../src/assets/**/*', { eager: true, query: '?url', import: 'default' }))
  .map((path) => path.replace('../src/assets/', ''));

describe('Asset-Herkunft und Audio-Wiring', () => {
  it('dokumentiert jede eingecheckte Asset-Datei in ASSETS.md', () => {
    for (const file of assetFiles) {
      expect(assetsDoc).toContain(`\`${file}\``);
    }
  });

  it('nutzt echte CC0-SFX-Dateien statt prozeduraler Oszillator-Beep-Sounds', () => {
    expect(sfxSource).toContain('../assets/audio/ui-select.ogg');
    expect(sfxSource).toContain('../assets/audio/result-victory.ogg');
    expect(sfxSource).not.toContain('createOscillator');
    expect(sfxSource).not.toContain('OscillatorType');
  });

  it('bindet echte CC0-Musik-Motive für Titel, Oberwelt und Kampf ein', () => {
    expect(musicSource).toContain('../assets/music/title-theme.ogg');
    expect(musicSource).toContain('../assets/music/field-theme.ogg');
    expect(musicSource).toContain('../assets/music/battle-theme.ogg');
    expect(musicSource).toContain('effectiveMusicVolume');
  });
});
