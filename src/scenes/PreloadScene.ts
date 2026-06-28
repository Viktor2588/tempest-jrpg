import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { generatePlaceholderTextures } from '../render/placeholderArt';
import { generatePortraitTextures } from '../render/portraitAtlas';
import { generateVfxTextures } from '../render/vfxAtlas';
import { generatePrologueBattleBackgrounds } from '../render/battleBackgroundAtlas';
import {
  KINGDOM_UNIT_ATLAS,
  KINGDOM_UNIT_FRAMES,
  KINGDOM_UNIT_TEXTURE_KEY
} from '../render/enemyArt';
import { BATTLE_ARENA_TEXTURES, PARTY_BATTLE_ART } from '../render/battleArt';
// Echte CC0-Kacheln (Kenney „Tiny Town", CC0 — siehe ASSETS.md). Vite liefert die
// korrekte (gehashte, base-bewusste) URL; Phaser lädt sie als Textur.
import grassUrl from '../assets/tiles/grass.png';
import wallUrl from '../assets/tiles/wall.png';
import pathUrl from '../assets/tiles/path.png';
// Echte CC0-Charakter-/Gegner-Sprites (Kenney „Tiny Dungeon", CC0 — siehe ASSETS.md).
import heroUrl from '../assets/sprites/hero.png';
import enemySlimeUrl from '../assets/sprites/enemy-slime.png';
import enemyWolfUrl from '../assets/sprites/enemy-wolf.png';
import enemyImpUrl from '../assets/sprites/enemy-imp.png';
import enemyOgreUrl from '../assets/sprites/enemy-ogre.png';
import kingdomUnitsUrl from '../assets/sprites/kingdom-board-units.webp';
import humanLancerUrl from '../assets/sprites/enemy-human-lancer.webp';
import humanDeserterUrl from '../assets/sprites/enemy-human-deserter.webp';
import mordrahnUrl from '../assets/sprites/enemy-mordrahn.webp';
import rimuruBattleUrl from '../assets/sprites/party-rimuru.webp';
import gobtaBattleUrl from '../assets/sprites/party-gobta.webp';
import rangaBattleUrl from '../assets/sprites/party-ranga.webp';
import shunaBattleUrl from '../assets/sprites/party-shuna.webp';
import tempestGroveBattleUrl from '../assets/backgrounds/battle-tempest-grove.webp';
import sealedCaveBattleUrl from '../assets/backgrounds/battle-sealed-cave.webp';
import direwolfDenBattleUrl from '../assets/backgrounds/battle-direwolf-den.webp';
import ancestorSealBattleUrl from '../assets/backgrounds/battle-ancestor-seal.webp';
import spiritMarshBattleUrl from '../assets/backgrounds/battle-spirit-marsh.webp';
import spiritHighlandsBattleUrl from '../assets/backgrounds/battle-spirit-highlands.webp';

// Lädt globale Assets mit Fortschrittsbalken.
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const barW = 280;
    const x = (GAME_WIDTH - barW) / 2;
    const y = GAME_HEIGHT / 2;

    const frame = this.add.rectangle(GAME_WIDTH / 2, y, barW + 6, 22).setStrokeStyle(2, 0x4a5876);
    const fill = this.add.rectangle(x, y, 1, 14, 0x68d7ff).setOrigin(0, 0.5);
    this.add.text(GAME_WIDTH / 2, y - 30, 'Lade …', { fontFamily: 'sans-serif', fontSize: '16px', color: '#cbd6e8' }).setOrigin(0.5);

    this.load.on('progress', (p: number) => { fill.width = barW * p; });
    this.load.on('complete', () => { frame.destroy(); fill.destroy(); });

    // Echte CC0-Kacheln laden (Kenney Tiny Town).
    this.load.image('tile-grass', grassUrl);
    this.load.image('tile-wall', wallUrl);
    this.load.image('tile-path', pathUrl);
    // Echte CC0-Sprites laden (Kenney Tiny Dungeon).
    this.load.image('sprite-hero', heroUrl);
    this.load.image('sprite-enemy-slime', enemySlimeUrl);
    this.load.image('sprite-enemy-wolf', enemyWolfUrl);
    this.load.image('sprite-enemy-imp', enemyImpUrl);
    this.load.image('sprite-enemy-ogre', enemyOgreUrl);
    this.load.image(KINGDOM_UNIT_TEXTURE_KEY, kingdomUnitsUrl);
    this.load.image('sprite-enemy-human-lancer', humanLancerUrl);
    this.load.image('sprite-enemy-human-deserter', humanDeserterUrl);
    this.load.image('sprite-enemy-mordrahn', mordrahnUrl);
    this.load.image(PARTY_BATTLE_ART.rimuru, rimuruBattleUrl);
    this.load.image(PARTY_BATTLE_ART.gobta, gobtaBattleUrl);
    this.load.image(PARTY_BATTLE_ART.ranga, rangaBattleUrl);
    this.load.image(PARTY_BATTLE_ART.shuna, shunaBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['tempest-grove'], tempestGroveBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['sealed-cave'], sealedCaveBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['direwolf-den'], direwolfDenBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['ancestor-seal'], ancestorSealBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['spirit-marsh'], spiritMarshBattleUrl);
    this.load.image(BATTLE_ARENA_TEXTURES['spirit-highlands'], spiritHighlandsBattleUrl);
  }

  create(): void {
    this.registerKingdomUnitFrames();
    // Prozedurale Platzhalter-Texturen (ph-<kind>) erzeugen — global verfügbar,
    // bis echte CC0-Assets eingepflegt sind. Szenen nutzen sie mit Rechteck-Fallback.
    generatePlaceholderTextures(this);
    // Prozedurale Portraits (portrait-<kind>) für Dialog-/Menü-UI.
    generatePortraitTextures(this);
    // Prozeduraler Pixel-VFX-Atlas (vfx-<kind>) für Kampf-Feedback.
    generateVfxTextures(this);
    // Prozedurale Fallbacks, falls die dedizierten Prolog-WebPs nicht geladen wurden.
    generatePrologueBattleBackgrounds(this);
    this.scene.start('Title');
  }

  private registerKingdomUnitFrames(): void {
    const texture = this.textures.get(KINGDOM_UNIT_TEXTURE_KEY);
    const source = texture.getSourceImage();
    const frameWidth = source.width / KINGDOM_UNIT_ATLAS.columns;
    const frameHeight = source.height / KINGDOM_UNIT_ATLAS.rows;

    for (const [name, frame] of Object.entries(KINGDOM_UNIT_FRAMES)) {
      if (!texture.has(name)) {
        texture.add(
          name,
          0,
          frame.col * frameWidth,
          frame.row * frameHeight,
          frameWidth,
          frameHeight
        );
      }
    }

    [
      KINGDOM_UNIT_TEXTURE_KEY,
      'sprite-enemy-human-lancer',
      'sprite-enemy-human-deserter',
      'sprite-enemy-mordrahn',
      ...Object.values(PARTY_BATTLE_ART),
      ...Object.values(BATTLE_ARENA_TEXTURES)
    ].forEach((key) => {
      if (this.textures.exists(key)) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    });
  }
}
