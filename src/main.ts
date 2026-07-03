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
import { DiscoveryScene } from './scenes/DiscoveryScene';
import {
  GAME_BACKING_SIZE,
  GAME_RENDER_SCALE,
  LOGICAL_GAME_HEIGHT,
  LOGICAL_GAME_WIDTH
} from './render/hiDpi';
import { RENDER_PIXEL_ART, RENDER_ROUND_PIXELS } from './render/textureSharpness';

// Referenzauflösung (16:9, Querformat). Skaliert per FIT auf Handy & Desktop.
export const GAME_WIDTH = LOGICAL_GAME_WIDTH;
export const GAME_HEIGHT = LOGICAL_GAME_HEIGHT;
export { GAME_RENDER_SCALE };

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b0f16',
  width: GAME_BACKING_SIZE.width,
  height: GAME_BACKING_SIZE.height,
  pixelArt: RENDER_PIXEL_ART,
  render: {
    roundPixels: RENDER_ROUND_PIXELS
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true
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
    RangaJourneyScene,
    DiscoveryScene
  ]
});

game.canvas.dataset.logicalWidth = String(GAME_WIDTH);
game.canvas.dataset.logicalHeight = String(GAME_HEIGHT);
game.canvas.dataset.renderScale = String(GAME_RENDER_SCALE);
