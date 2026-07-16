import { describe, expect, it } from 'vitest';
import assetsDoc from '../ASSETS.md?raw';
import musicSource from '../src/audio/music.ts?raw';
import sfxSource from '../src/audio/sfx.ts?raw';
import dialogueSource from '../src/scenes/DialogueScene.ts?raw';
import battleSource from '../src/scenes/BattleScene.ts?raw';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';
import shopSource from '../src/scenes/ShopScene.ts?raw';
import menuSource from '../src/scenes/MenuScene.ts?raw';
import endingSource from '../src/scenes/EndingScene.ts?raw';
import overworldSource from '../src/scenes/OverworldScene.ts?raw';
import saveSlotSource from '../src/scenes/SaveSlotScene.ts?raw';
import optionsSource from '../src/scenes/OptionsScene.ts?raw';
import discoverySource from '../src/scenes/DiscoveryScene.ts?raw';

const assetFiles = Object.keys(import.meta.glob('../src/assets/**/*', { eager: true, query: '?url', import: 'default' }))
  .map((path) => path.replace('../src/assets/', ''));

describe('Asset-Herkunft und Audio-Wiring', () => {
  it('lädt und zeigt die projektgenerierte Händler-Vignette', () => {
    expect(preloadSource).toContain("this.load.image('ui-shop-merchant-vignette'");
    expect(shopSource).toContain("this.add.image(700, 116, 'ui-shop-merchant-vignette')");
    expect(menuSource).toContain("this.add.image(690, 150, 'ui-shop-merchant-vignette')");
    expect(overworldSource).toContain("this.add.image(x, y, 'ui-shop-merchant-vignette')");
    expect(overworldSource).toContain('.setCrop(64, 0, 256, 256)');
  });

  it('verwendet die drei Ende-Key-Arts auch als Galerie-Karten', () => {
    expect(endingSource).toContain('const key = `bg-ending-${entry.kind}`');
    expect(endingSource).toContain('this.add.image(x, 362, key)');
    expect(endingSource).toContain('if (!entry.seen) image.setTint');
  });

  it('verwendet das vorhandene Titel-Key-Art auch hinter der Speicherverwaltung', () => {
    expect(preloadSource).toContain("this.load.image('bg-title-keyart'");
    expect(saveSlotSource).toContain("this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-title-keyart')");
  });

  it('verwendet das vorhandene Titel-Key-Art auch hinter den Optionen', () => {
    expect(optionsSource).toContain("this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-title-keyart')");
  });

  it('zeigt Fundstellen mit dem vorhandenen Motiv ihrer Region', () => {
    expect(discoverySource).toContain('regionBannerTextureForMap(');
    expect(discoverySource).toContain('addRegionBannerImage(this, cx, 166, bannerKey, 536, 128)');
  });

  it('dokumentiert jede eingecheckte Asset-Datei in ASSETS.md', () => {
    for (const file of assetFiles) {
      expect(assetsDoc).toContain(`\`${file}\``);
    }
  });

  it('ersetzt die 16x16-Kenney-Sprites durch hochaufgeloeste Projektassets', () => {
    expect(assetFiles).toEqual(expect.arrayContaining([
      'sprites/overworld-rimuru-slime.webp',
      'sprites/enemy-direwolf-pup.webp',
      'sprites/enemy-ogre-warrior.webp'
    ]));
    for (const legacy of [
      'sprites/hero.png',
      'sprites/enemy-slime.png',
      'sprites/enemy-wolf.png',
      'sprites/enemy-imp.png',
      'sprites/enemy-ogre.png'
    ]) {
      expect(assetFiles).not.toContain(legacy);
    }
  });

  it('liefert die sieben grossen Rasterassets WebP-optimiert aus', () => {
    const optimized = [
      'ui/region-tempest-colosseum',
      'ui/region-ramiris-labyrinth',
      'ui/region-freedom-academy',
      'backgrounds/battle-tempest-colosseum',
      'backgrounds/battle-tempest-invasion',
      'sprites/enemy-magic-colossus',
      'sprites/portrait-shizu-children'
    ];
    for (const path of optimized) {
      expect(assetFiles).toContain(`${path}.webp`);
      expect(assetFiles).not.toContain(`${path}.png`);
    }
  });

  it('liefert die zehn generierten Gegner-Cutouts als WebP mit Alpha aus', () => {
    for (const name of [
      'orc-lord',
      'elder-direwolf',
      'milim',
      'mordrahn-vanguard',
      'orc-grunt',
      'academy-revenant',
      'marsh-hexer',
      'marsh-thornback',
      'storm-shard',
      'blumund-brigand'
    ]) {
      expect(assetFiles).toContain(`sprites/enemy-${name}.webp`);
      expect(assetFiles).not.toContain(`sprites/enemy-${name}.png`);
    }
  });

  it('liefert das Mimik-HUD WebP-optimiert aus', () => {
    expect(assetFiles).toContain('ui/mimic-form-indicator.webp');
    expect(assetFiles).not.toContain('ui/mimic-form-indicator.jpg');
  });

  it('lädt und zeigt den vorhandenen Milim-Siegbanner nur im Milim-Duell', () => {
    expect(preloadSource).toContain('../assets/ui/milim-fight-banner.webp');
    expect(preloadSource).toContain("this.load.image('ui-milim-fight-banner'");
    expect(battleSource).toContain("this.encounterId === 'milim-duel'");
    expect(battleSource).toContain("'ui-milim-fight-banner'");
  });

  it('lädt und zeigt den vorhandenen Dialog-Tastaturhinweis als zugeschnittenen Frame', () => {
    expect(preloadSource).toContain("../assets/ui/dialog-keyboard-hint.webp");
    expect(preloadSource).toContain("this.load.image('ui-dialog-keyboard-hint'");
    expect(preloadSource).toContain("dialogHint.add('controls', 0, 80, 120, 500, 500)");
    expect(dialogueSource).toContain("'ui-dialog-keyboard-hint', 'controls'");
  });

  it('nutzt in sfx.ts echte CC0-SFX-Dateien; die prozedurale Schicht liegt separat', () => {
    // Basis-SFX = echte CC0-Dateien (ASSETS.md). Die prozedurale Game-Feel-Schicht
    // (Phase 144, createOscillator) lebt bewusst in sfxProcedural.ts, damit reine
    // Logik-Module (systems/battle.ts) keine .ogg-Imports in Nicht-Vite-Transformer
    // (Playwright-E2E) ziehen. sfx.ts bleibt dadurch policy-rein.
    expect(sfxSource).toContain('../assets/audio/ui-select.ogg');
    expect(sfxSource).toContain('../assets/audio/result-victory.ogg');
    expect(sfxSource).not.toContain('createOscillator');
  });

  it('bindet echte CC0-Musik-Motive für Titel, Oberwelt und Kampf ein', () => {
    expect(musicSource).toContain('../assets/music/title-theme.ogg');
    expect(musicSource).toContain('../assets/music/field-theme.ogg');
    expect(musicSource).toContain('../assets/music/battle-theme.ogg');
    expect(musicSource).toContain('effectiveMusicVolume');
  });
});
