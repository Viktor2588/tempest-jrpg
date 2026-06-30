import { describe, expect, it } from 'vitest';
import portraitSource from '../src/render/portraitAtlas.ts?raw';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

describe('Portrait-Atlas-Zuordnung', () => {
  it('ordnet den versiegelten Sturmdrachen einem eigenen Portrait zu', () => {
    expect(portraitSource).toContain("case 'versiegelter sturmdrache':");
    expect(portraitSource).toContain("return 'storm-dragon';");
    expect(portraitSource).toContain("case 'dragon':");
  });

  it('ordnet Veldora und Ranga sichtbare Portraits zu (Canon Band 1)', () => {
    // Quelltext-Prüfung (Modulimport zöge Phaser in den Headless-Lauf).
    expect(portraitSource).toContain("case 'veldora':");
    expect(portraitSource).toContain("case 'ranga':");
    expect(portraitSource).toContain("return 'ranga';");
  });

  it('lädt echte Imagegen-Portraits für den aktuellen Kerncast', () => {
    for (const file of [
      'portrait-rimuru.webp',
      'portrait-gobta.webp',
      'portrait-shuna.webp',
      'portrait-rigurd.webp',
      'portrait-ranga.webp',
      'portrait-veldora.webp'
    ]) {
      expect(preloadSource).toContain(`../assets/sprites/${file}`);
    }
  });

  it('ordnet Shizu und Gildenmeister Fuze eigene Storyportraits zu', () => {
    expect(portraitSource).toContain("case 'shizu':");
    expect(portraitSource).toContain("return 'shizu';");
    expect(portraitSource).toContain("case 'gildenmeister fuze':");
    expect(portraitSource).toContain("return 'fuze';");
    expect(preloadSource).toContain('../assets/sprites/portrait-shizu.webp');
    expect(preloadSource).toContain('../assets/sprites/portrait-fuze.webp');
  });
});
