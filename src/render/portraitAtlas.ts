// Prozeduraler Pixel-Portrait-Atlas (Phaser, browser-only). Erzeugt kohärente
// 64×64-Busts für Story-/Menüfiguren, bis echte CC0-Portraits eingepflegt sind.
import Phaser from 'phaser';
import { PORTRAIT_KINDS, portraitSpec, type PortraitKind, type PortraitMotif } from './artSpec';
import { hexColor } from './color';

export function portraitKey(kind: PortraitKind): string {
  return 'portrait-' + kind;
}

export function portraitKindForSpeaker(speaker: string): PortraitKind | null {
  switch (speaker.trim().toLowerCase()) {
    case 'rimuru':
    case 'der namenlose':
      return 'rimuru';
    case 'gobta':
      return 'gobta';
    case 'shuna':
      return 'shuna';
    case 'sora':
      return 'sora';
    case 'vael':
      return 'vael';
    case 'lyrre':
      return 'lyrre';
    case 'rigurd':
      return 'rigurd';
    case 'veldora':
    case 'versiegelter sturmdrache':
      return 'storm-dragon';
    case 'ranga':
      return 'ranga';
    case 'shizu':
      return 'shizu';
    case 'gildenmeister fuze':
    case 'fuze':
      return 'fuze';
    case 'benimaru':
      return 'benimaru';
    case 'shion':
      return 'shion';
    case 'hakurou':
      return 'hakurou';
    case 'kurobe':
      return 'kurobe';
    case 'souei':
      return 'souei';
    case 'kaijin':
      return 'kaijin';
    case 'moorhüterin eir':
    case 'eir':
      return 'eir';
    case 'schreinwächter kael':
    case 'kael':
      return 'kael';
    case 'könig gazel dwargo':
    case 'gazel dwargo':
    case 'gazel':
      return 'gazel';
    case 'kaval, eren & gido':
    case 'kaval':
    case 'eren':
    case 'gido':
      return 'blumund-adventurers';
    case 'treyni':
      return 'treyni';
    case 'milim nava':
    case 'milim':
      return 'milim';
    case 'souka':
      return 'souka';
    case 'mordrahn':
    case 'mordrahns echo':
      return 'mordrahn';
    default:
      return null;
  }
}

export function portraitKeyForSpeaker(speaker: string): string | null {
  const kind = portraitKindForSpeaker(speaker);
  return kind ? portraitKey(kind) : null;
}

export function generatePortraitTextures(
  scene: Phaser.Scene,
  kinds: readonly PortraitKind[] = PORTRAIT_KINDS
): void {
  for (const kind of kinds) {
    const key = portraitKey(kind);
    if (scene.textures.exists(key)) {
      continue;
    }
    const spec = portraitSpec(kind);
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const s = spec.size;

    g.fillStyle(hexColor(spec.background), 1);
    g.fillRect(0, 0, s, s);
    g.fillStyle(hexColor(spec.outline), 1);
    g.fillRect(0, 0, s, 1);
    g.fillRect(0, s - 1, s, 1);
    g.fillRect(0, 0, 1, s);
    g.fillRect(s - 1, 0, 1, s);
    g.fillStyle(hexColor(spec.accent), 0.22);
    g.fillRect(4, 4, s - 8, 4);
    g.fillRect(4, 10, 4, s - 14);

    drawBust(g, s, spec.motif, hexColor(spec.base), hexColor(spec.accent), hexColor(spec.outline));

    g.generateTexture(key, s, s);
    g.destroy();
  }
}

function drawBust(
  g: Phaser.GameObjects.Graphics,
  size: number,
  motif: PortraitMotif,
  base: number,
  accent: number,
  outline: number
): void {
  const cx = size / 2;

  g.fillStyle(outline, 1);
  g.fillRoundedRect(16, 42, 32, 18, 5);
  g.fillStyle(base, 1);
  g.fillRoundedRect(18, 44, 28, 16, 4);

  if (motif === 'slime') {
    g.fillStyle(outline, 1);
    g.fillCircle(cx, 31, 20);
    g.fillStyle(base, 1);
    g.fillCircle(cx, 31, 18);
    g.fillStyle(accent, 0.9);
    g.fillCircle(24, 23, 4);
    drawEyes(g, 27, 34, outline, accent);
    return;
  }

  g.fillStyle(outline, 1);
  g.fillCircle(cx, 26, 17);
  g.fillStyle(base, 1);
  g.fillCircle(cx, 27, 15);

  switch (motif) {
    case 'warrior':
      g.fillStyle(accent, 1);
      g.fillTriangle(21, 18, 43, 18, 32, 8);
      g.fillRect(18, 21, 28, 4);
      break;
    case 'mage':
      g.fillStyle(accent, 1);
      g.fillTriangle(20, 19, 44, 19, 33, 5);
      g.fillCircle(42, 18, 3);
      break;
    case 'scout':
      g.fillStyle(accent, 1);
      g.fillRect(18, 19, 28, 5);
      g.fillTriangle(42, 19, 54, 23, 42, 24);
      break;
    case 'elder':
      g.fillStyle(accent, 1);
      g.fillRect(22, 15, 20, 6);
      g.fillStyle(outline, 0.7);
      g.fillRect(25, 39, 14, 7);
      break;
    case 'dragon':
      g.fillStyle(accent, 0.95);
      g.fillTriangle(17, 22, 5, 11, 21, 30);
      g.fillTriangle(47, 22, 59, 11, 43, 30);
      g.fillStyle(outline, 0.85);
      g.fillTriangle(25, 16, 32, 4, 39, 16);
      g.fillStyle(accent, 0.8);
      g.fillRect(21, 39, 22, 4);
      break;
    case 'shadow':
      g.fillStyle(outline, 0.85);
      g.fillTriangle(16, 18, 48, 18, 32, 4);
      g.fillStyle(accent, 0.8);
      g.fillCircle(cx, 31, 4);
      break;
    case 'priest':
      g.fillStyle(accent, 1);
      g.fillCircle(cx, 15, 4);
      g.fillRect(30, 11, 4, 12);
      g.fillRect(26, 15, 12, 3);
      break;
    case 'goblin':
      g.fillStyle(base, 1);
      g.fillTriangle(17, 25, 8, 19, 19, 31);
      g.fillTriangle(47, 25, 56, 19, 45, 31);
      g.lineStyle(1, outline, 1);
      g.strokeTriangle(17, 25, 8, 19, 19, 31);
      g.strokeTriangle(47, 25, 56, 19, 45, 31);
      break;
  }

  drawEyes(g, 27, 29, outline, accent);
}

function drawEyes(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  outline: number,
  accent: number
): void {
  g.fillStyle(outline, 1);
  g.fillRect(x, y, 3, 3);
  g.fillRect(x + 8, y, 3, 3);
  g.fillStyle(accent, 0.85);
  g.fillRect(x + 1, y + 1, 1, 1);
  g.fillRect(x + 9, y + 1, 1, 1);
}
