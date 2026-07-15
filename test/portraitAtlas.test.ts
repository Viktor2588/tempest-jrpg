import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/data/characters';
import { PORTRAIT_KINDS } from '../src/render/artSpec';
import portraitSource from '../src/render/portraitAtlas.ts?raw';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';
import menuSource from '../src/scenes/MenuScene.ts?raw';
import saveSlotSource from '../src/scenes/SaveSlotScene.ts?raw';

describe('Portrait-Atlas-Zuordnung', () => {
  it('zeigt die vorhandenen Charakterportraits auch in der Seitenleiste', () => {
    expect(menuSource).toContain('this.drawPortrait(summary.member.characterId, 48, y, 34)');
    expect(menuSource).toContain('textOffsetX: 54');
  });

  it('zeigt das vorhandene Gruppenleiter-Portrait auch im belegten Speicherslot', () => {
    expect(saveSlotSource).toContain('portraitKey(lead.characterId as PortraitKind)');
    expect(saveSlotSource).toContain('this.add.image(x + 40, y + 66, leadPortrait)');
  });

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

  it('zeigt Rigurds vorhandenes Portrait am Ratsversammlungs-NPC', () => {
    expect(portraitSource).toContain("case 'ratsversammlung':");
    expect(portraitSource).toContain("return 'rigurd';");
    expect(preloadSource).toContain('../assets/sprites/portrait-rigurd.webp');
  });

  it('zeigt am Tempest-Lager die eigene Rastplatz-Vignette', () => {
    expect(portraitSource).toContain("case 'tempest-lager':");
    expect(portraitSource).toContain("return 'tempest-camp';");
    expect(preloadSource).toContain('../assets/sprites/portrait-tempest-camp.webp');
    expect(preloadSource).toContain("this.load.image(portraitKey('tempest-camp')");
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
    expect(portraitSource).toContain("case 'shizus schüler':");
    expect(portraitSource).toContain("return 'shizu-children';");
    expect(portraitSource).toContain("case 'gildenmeister fuze':");
    expect(portraitSource).toContain("return 'fuze';");
    expect(preloadSource).toContain('../assets/sprites/portrait-shizu.webp');
    expect(preloadSource).toContain('../assets/sprites/portrait-shizu-children.webp');
    expect(preloadSource).toContain('../assets/sprites/portrait-fuze.webp');
  });

  it('zeigt das vorhandene Gruppenportrait auch an allen fünf Akademieschülern', () => {
    for (const student of ['kenya', 'chloe', 'alice', 'ryota', 'gale']) {
      expect(portraitSource).toContain(`case '${student}':`);
    }
    expect(portraitSource).toContain("return 'shizu-children';");
  });

  it('ordnet Canon- und Regions-NPCs aus Phase 39 dedizierte Storyportraits zu', () => {
    for (const [speakerCase, portraitKind] of [
      ["case 'moorhüterin eir':", 'eir'],
      ["case 'schreinwächter kael':", 'kael'],
      ["case 'könig gazel dwargo':", 'gazel'],
      ["case 'kaval, eren & gido':", 'blumund-adventurers'],
      ["case 'treyni':", 'treyni'],
      ["case 'milim nava':", 'milim'],
      ["case 'ramiris':", 'ramiris'],
      ["case 'arena-vorstand':", 'arena-steward'],
      ["case 'souka':", 'souka']
    ] as const) {
      expect(portraitSource).toContain(speakerCase);
      expect(portraitSource).toContain(`return '${portraitKind}';`);
      expect(preloadSource).toContain(`../assets/sprites/portrait-${portraitKind}.webp`);
    }
  });

  it('ordnet der verwundeten Grenzspäherin ihr echtes Storyportrait zu', () => {
    expect(portraitSource).toContain("case 'grenzspäherin':");
    expect(portraitSource).toContain("case 'verwundete grenzspäherin':");
    expect(portraitSource).toContain("return 'border-scout';");
    expect(preloadSource).toContain('../assets/sprites/portrait-border-scout.webp');
    expect(preloadSource).toContain("this.load.image(portraitKey('border-scout')");
  });

  it('ordnet dem geretteten Grenzgänger sein echtes Storyportrait zu', () => {
    expect(portraitSource).toContain("case 'geretteter grenzgänger':");
    expect(portraitSource).toContain("return 'border-traveler';");
    expect(preloadSource).toContain('../assets/sprites/portrait-border-traveler.webp');
    expect(preloadSource).toContain("this.load.image(portraitKey('border-traveler')");
  });

  it('lädt Mordrahns echtes Storyportrait statt des prozeduralen Fallbacks', () => {
    expect(portraitSource).toContain("case 'mordrahn':");
    expect(portraitSource).toContain("case 'mordrahns echo':");
    expect(portraitSource).toContain("return 'mordrahn';");
    expect(preloadSource).toContain('../assets/sprites/portrait-mordrahn.webp');
    expect(preloadSource).toContain("this.load.image(portraitKey('mordrahn')");
  });

  it('ordnet dem gemeinsamen Werkstattdialog ein echtes Duoportrait zu', () => {
    expect(portraitSource).toContain("case 'kurobe & kaijin':");
    expect(portraitSource).toContain("return 'kurobe-kaijin';");
    expect(preloadSource).toContain('../assets/sprites/portrait-kurobe-kaijin.webp');
    expect(preloadSource).toContain("this.load.image(portraitKey('kurobe-kaijin')");
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
