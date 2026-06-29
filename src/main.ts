import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';
import { DialogueScene } from './scenes/DialogueScene';
import { MenuScene } from './scenes/MenuScene';
import { ShopScene } from './scenes/ShopScene';
import { OptionsScene } from './scenes/OptionsScene';
import { EndingScene } from './scenes/EndingScene';
import { MilestoneScene } from './scenes/MilestoneScene';
import { RangaJourneyScene } from './scenes/RangaJourneyScene';

// Referenzauflösung (16:9, Querformat). Skaliert per FIT auf Handy & Desktop.
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b0f16',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    OverworldScene,
    BattleScene,
    MenuScene,
    DialogueScene,
    ShopScene,
    OptionsScene,
    EndingScene,
    MilestoneScene,
    RangaJourneyScene
  ]
});
