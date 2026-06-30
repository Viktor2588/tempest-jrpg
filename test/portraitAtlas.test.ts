import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data/characters';
import { PORTRAIT_KINDS } from '../src/render/artSpec';
import portraitSource from '../src/render/portraitAtlas.ts?raw';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';
import menuSource from '../src/scenes/MenuScene.ts?raw';

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

  it('ordnet Canon- und Regions-NPCs aus Phase 39 dedizierte Storyportraits zu', () => {
    for (const [speakerCase, portraitKind] of [
      ["case 'moorhüterin eir':", 'eir'],
      ["case 'schreinwächter kael':", 'kael'],
      ["case 'könig gazel dwargo':", 'gazel'],
      ["case 'kaval, eren & gido':", 'blumund-adventurers'],
      ["case 'treyni':", 'treyni'],
      ["case 'milim nava':", 'milim'],
      ["case 'souka':", 'souka']
    ] as const) {
      expect(portraitSource).toContain(speakerCase);
      expect(portraitSource).toContain(`return '${portraitKind}';`);
      expect(preloadSource).toContain(`../assets/sprites/portrait-${portraitKind}.webp`);
    }
  });

  it('deckt das komplette spielbare Roster in Dialogen und im Party-Menü ab', () => {
    expect(HEROES.every((hero) => PORTRAIT_KINDS.includes(hero.id))).toBe(true);
    expect(menuSource).toContain('PORTRAIT_KINDS.includes');
    for (const hero of HEROES) {
      expect(preloadSource).toContain(`../assets/sprites/portrait-${hero.id}.webp`);
    }
    for (const speaker of ['benimaru', 'shion', 'hakurou', 'kurobe', 'souei', 'kaijin']) {
      expect(portraitSource).toContain(`case '${speaker}':`);
      expect(portraitSource).toContain(`return '${speaker}';`);
    }
  });
});
