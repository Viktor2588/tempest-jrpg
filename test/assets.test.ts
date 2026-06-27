import { describe, expect, it } from 'vitest';
import assetsDoc from '../ASSETS.md?raw';
import sfxSource from '../src/audio/sfx.ts?raw';

const assetFiles = Object.keys(import.meta.glob('../src/assets/**/*', { eager: true, query: '?url', import: 'default' }))
  .map((path) => path.replace('../src/assets/', ''));

describe('Asset-Lizenzen und Audio-Wiring', () => {
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
});
