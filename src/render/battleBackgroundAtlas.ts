import Phaser from 'phaser';
import { BATTLE_ARENA_TEXTURES } from './battleArt';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

// Prozedurale Fallback-Arenen für alte Builds oder fehlgeschlagene Asset-Ladevorgänge.
// Wenn die dedizierten WebP-Hintergründe geladen wurden, bleiben ihre Texturen erhalten.
export function generatePrologueBattleBackgrounds(scene: Phaser.Scene): void {
  generateSealedCave(scene);
  generateDirewolfDen(scene);
  generateWhisperingGrove(scene);
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

function generateWhisperingGrove(scene: Phaser.Scene): void {
  const key = BATTLE_ARENA_TEXTURES['whispering-grove'];
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillGradientStyle(0x0b1511, 0x0b1511, 0x203626, 0x101827, 1);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  g.fillStyle(0x183123, 0.96);
  g.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT - 24, GAME_WIDTH * 0.96, 178);
  g.fillStyle(0x9fb6d6, 0.12);
  for (const x of [120, 210, 720, 820]) {
    g.fillRect(x, 96, 34, 268);
    g.fillCircle(x + 16, 96, 64);
    g.fillCircle(x - 20, 138, 52);
    g.fillCircle(x + 48, 148, 58);
  }
  g.lineStyle(3, 0xf0b7ff, 0.22);
  for (const y of [138, 184, 230]) {
    g.beginPath();
    g.moveTo(210, y);
    for (let step = 1; step <= 24; step++) {
      const t = step / 24;
      const inv = 1 - t;
      const x = inv * inv * 210 + 2 * inv * t * (GAME_WIDTH / 2) + t * t * 750;
      const curveY = inv * inv * y + 2 * inv * t * (y - 54) + t * t * (y + 12);
      g.lineTo(x, curveY);
    }
    g.strokePath();
  }
  g.fillStyle(0xf0b7ff, 0.17);
  g.fillCircle(GAME_WIDTH / 2, 174, 118);
  g.lineStyle(4, 0xe9c56c, 0.2);
  g.strokeEllipse(GAME_WIDTH / 2, GAME_HEIGHT - 64, 420, 92);
  g.generateTexture(key, GAME_WIDTH, GAME_HEIGHT);
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
  g.destroy();
}
