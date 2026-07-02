import Phaser from 'phaser';
import { BATTLE_ARENA_TEXTURES } from './battleArt';
import { generatedTexturePoint, generatedTextureSize, generatedTextureStroke } from './textureSharpness';

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
  const width = generatedTextureSize(GAME_WIDTH);
  const height = generatedTextureSize(GAME_HEIGHT);
  const unit = width / GAME_WIDTH;
  const p = (value: number) => generatedTexturePoint(value, unit);
  g.fillGradientStyle(0x07111c, 0x07111c, 0x17233c, 0x101827, 1);
  g.fillRect(0, 0, width, height);
  g.fillStyle(0x263856, 0.9);
  g.fillEllipse(width / 2, height - p(22), width * 0.95, p(160));
  g.fillStyle(0x9a6cff, 0.22);
  for (const x of [130, 230, 690, 790].map(p)) {
    g.fillTriangle(x, p(120), x - p(34), p(430), x + p(42), p(430));
    g.fillTriangle(x + p(30), p(170), x - p(10), p(480), x + p(76), p(480));
  }
  g.fillStyle(0x68d7ff, 0.16);
  g.fillCircle(width / 2, p(180), p(170));
  g.lineStyle(generatedTextureStroke(3), 0x68d7ff, 0.26);
  g.strokeCircle(width / 2, p(180), p(132));
  g.generateTexture(key, width, height);
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
  g.destroy();
}

function generateDirewolfDen(scene: Phaser.Scene): void {
  const key = BATTLE_ARENA_TEXTURES['direwolf-den'];
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const width = generatedTextureSize(GAME_WIDTH);
  const height = generatedTextureSize(GAME_HEIGHT);
  const unit = width / GAME_WIDTH;
  const p = (value: number) => generatedTexturePoint(value, unit);
  g.fillGradientStyle(0x172112, 0x172112, 0x263b2a, 0x101827, 1);
  g.fillRect(0, 0, width, height);
  g.fillStyle(0x2f4f37, 0.95);
  g.fillEllipse(width / 2, height - p(18), width * 0.98, p(185));
  g.fillStyle(0x10131c, 0.32);
  for (const x of [80, 165, 760, 850].map(p)) {
    g.fillRect(x, p(108), p(28), p(240));
    g.fillTriangle(x - p(34), p(150), x + p(14), p(42), x + p(62), p(150));
  }
  g.lineStyle(generatedTextureStroke(4), 0xe9c56c, 0.2);
  g.strokeEllipse(width / 2, height - p(60), p(360), p(96));
  g.fillStyle(0xe9c56c, 0.18);
  g.fillCircle(width / 2, p(160), p(110));
  g.generateTexture(key, width, height);
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
  g.destroy();
}

function generateWhisperingGrove(scene: Phaser.Scene): void {
  const key = BATTLE_ARENA_TEXTURES['whispering-grove'];
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const width = generatedTextureSize(GAME_WIDTH);
  const height = generatedTextureSize(GAME_HEIGHT);
  const unit = width / GAME_WIDTH;
  const p = (value: number) => generatedTexturePoint(value, unit);
  g.fillGradientStyle(0x0b1511, 0x0b1511, 0x203626, 0x101827, 1);
  g.fillRect(0, 0, width, height);
  g.fillStyle(0x183123, 0.96);
  g.fillEllipse(width / 2, height - p(24), width * 0.96, p(178));
  g.fillStyle(0x9fb6d6, 0.12);
  for (const x of [120, 210, 720, 820].map(p)) {
    g.fillRect(x, p(96), p(34), p(268));
    g.fillCircle(x + p(16), p(96), p(64));
    g.fillCircle(x - p(20), p(138), p(52));
    g.fillCircle(x + p(48), p(148), p(58));
  }
  g.lineStyle(generatedTextureStroke(3), 0xf0b7ff, 0.22);
  for (const y of [138, 184, 230]) {
    g.beginPath();
    g.moveTo(p(210), p(y));
    for (let step = 1; step <= 24; step++) {
      const t = step / 24;
      const inv = 1 - t;
      const x = inv * inv * p(210) + 2 * inv * t * (width / 2) + t * t * p(750);
      const curveY = inv * inv * p(y) + 2 * inv * t * p(y - 54) + t * t * p(y + 12);
      g.lineTo(x, curveY);
    }
    g.strokePath();
  }
  g.fillStyle(0xf0b7ff, 0.17);
  g.fillCircle(width / 2, p(174), p(118));
  g.lineStyle(generatedTextureStroke(4), 0xe9c56c, 0.2);
  g.strokeEllipse(width / 2, height - p(64), p(420), p(92));
  g.generateTexture(key, width, height);
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
  g.destroy();
}
