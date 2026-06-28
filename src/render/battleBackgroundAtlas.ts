import Phaser from 'phaser';
import { BATTLE_ARENA_TEXTURES } from './battleArt';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

// Prozedurale Fallback-Arenen für alte Builds oder fehlgeschlagene Asset-Ladevorgänge.
// Wenn die dedizierten WebP-Hintergründe geladen wurden, bleiben ihre Texturen erhalten.
export function generatePrologueBattleBackgrounds(scene: Phaser.Scene): void {
  generateSealedCave(scene);
  generateDirewolfDen(scene);
}

function generateSealedCave(scene: Phaser.Scene): void {
  const key = BATTLE_ARENA_TEXTURES['sealed-cave'];
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillGradientStyle(0x07111c, 0x07111c, 0x17233c, 0x101827, 1);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  g.fillStyle(0x263856, 0.9);
  g.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT - 22, GAME_WIDTH * 0.95, 160);
  g.fillStyle(0x9a6cff, 0.22);
  for (const x of [130, 230, 690, 790]) {
    g.fillTriangle(x, 120, x - 34, 430, x + 42, 430);
    g.fillTriangle(x + 30, 170, x - 10, 480, x + 76, 480);
  }
  g.fillStyle(0x68d7ff, 0.16);
  g.fillCircle(GAME_WIDTH / 2, 180, 170);
  g.lineStyle(3, 0x68d7ff, 0.26);
  g.strokeCircle(GAME_WIDTH / 2, 180, 132);
  g.generateTexture(key, GAME_WIDTH, GAME_HEIGHT);
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
  g.destroy();
}

function generateDirewolfDen(scene: Phaser.Scene): void {
  const key = BATTLE_ARENA_TEXTURES['direwolf-den'];
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillGradientStyle(0x172112, 0x172112, 0x263b2a, 0x101827, 1);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  g.fillStyle(0x2f4f37, 0.95);
  g.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT - 18, GAME_WIDTH * 0.98, 185);
  g.fillStyle(0x10131c, 0.32);
  for (const x of [80, 165, 760, 850]) {
    g.fillRect(x, 108, 28, 240);
    g.fillTriangle(x - 34, 150, x + 14, 42, x + 62, 150);
  }
  g.lineStyle(4, 0xe9c56c, 0.2);
  g.strokeEllipse(GAME_WIDTH / 2, GAME_HEIGHT - 60, 360, 96);
  g.fillStyle(0xe9c56c, 0.18);
  g.fillCircle(GAME_WIDTH / 2, 160, 110);
  g.generateTexture(key, GAME_WIDTH, GAME_HEIGHT);
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
  g.destroy();
}
