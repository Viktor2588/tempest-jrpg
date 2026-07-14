// Prozeduraler Pixel-Portrait-Atlas (Phaser, browser-only). Erzeugt kohärente
// 64×64-Busts für Story-/Menüfiguren, bis echte CC0-Portraits eingepflegt sind.
import Phaser from 'phaser';
import { PORTRAIT_KINDS, portraitSpec, type PortraitKind, type PortraitMotif } from './artSpec';
import { hexColor } from './color';
import { generatedTexturePoint, generatedTextureSize, generatedTextureStroke } from './textureSharpness';

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
    case 'ratsversammlung':
      return 'rigurd';
    case 'veldora':
    case 'versiegelter sturmdrache':
      return 'storm-dragon';
    case 'ranga':
      return 'ranga';
    case 'shizu':
      return 'shizu';
    case 'shizus schüler':
    case 'kenya':
    case 'chloe':
    case 'alice':
    case 'ryota':
    case 'gale':
      return 'shizu-children';
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
    case 'kurobe & kaijin':
      return 'kurobe-kaijin';
    case 'moorhüterin eir':
    case 'eir':
      return 'eir';
    case 'grenzspäherin':
    case 'verwundete grenzspäherin':
      return 'border-scout';
    case 'geretteter grenzgänger':
      return 'border-traveler';
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
    case 'ramiris':
      return 'ramiris';
    case 'arena-vorstand':
      return 'arena-steward';
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
    const s = generatedTextureSize(spec.size);
    const unit = s / spec.size;
    const p = (value: number) => generatedTexturePoint(value, unit);

    g.fillStyle(hexColor(spec.background), 1);
    g.fillRect(0, 0, s, s);
    g.fillStyle(hexColor(spec.outline), 1);
    g.fillRect(0, 0, s, p(1));
    g.fillRect(0, s - p(1), s, p(1));
    g.fillRect(0, 0, p(1), s);
    g.fillRect(s - p(1), 0, p(1), s);
    g.fillStyle(hexColor(spec.accent), 0.22);
    g.fillRect(p(4), p(4), s - p(8), p(4));
    g.fillRect(p(4), p(10), p(4), s - p(14));

    drawBust(g, s, unit, spec.motif, hexColor(spec.base), hexColor(spec.accent), hexColor(spec.outline));

    g.generateTexture(key, s, s);
    g.destroy();
  }
}

function drawBust(
  g: Phaser.GameObjects.Graphics,
  size: number,
  unit: number,
  motif: PortraitMotif,
  base: number,
  accent: number,
  outline: number
): void {
  const cx = size / 2;
  const p = (value: number) => generatedTexturePoint(value, unit);

  g.fillStyle(outline, 1);
  g.fillRoundedRect(p(16), p(42), p(32), p(18), p(5));
  g.fillStyle(base, 1);
  g.fillRoundedRect(p(18), p(44), p(28), p(16), p(4));

  if (motif === 'slime') {
    g.fillStyle(outline, 1);
    g.fillCircle(cx, p(31), p(20));
    g.fillStyle(base, 1);
    g.fillCircle(cx, p(31), p(18));
    g.fillStyle(accent, 0.9);
    g.fillCircle(p(24), p(23), p(4));
    drawEyes(g, p(27), p(34), unit, outline, accent);
    return;
  }

  g.fillStyle(outline, 1);
  g.fillCircle(cx, p(26), p(17));
  g.fillStyle(base, 1);
  g.fillCircle(cx, p(27), p(15));

  switch (motif) {
    case 'warrior':
      g.fillStyle(accent, 1);
      g.fillTriangle(p(21), p(18), p(43), p(18), p(32), p(8));
      g.fillRect(p(18), p(21), p(28), p(4));
      break;
    case 'mage':
      g.fillStyle(accent, 1);
      g.fillTriangle(p(20), p(19), p(44), p(19), p(33), p(5));
      g.fillCircle(p(42), p(18), p(3));
      break;
    case 'scout':
      g.fillStyle(accent, 1);
      g.fillRect(p(18), p(19), p(28), p(5));
      g.fillTriangle(p(42), p(19), p(54), p(23), p(42), p(24));
      break;
    case 'elder':
      g.fillStyle(accent, 1);
      g.fillRect(p(22), p(15), p(20), p(6));
      g.fillStyle(outline, 0.7);
      g.fillRect(p(25), p(39), p(14), p(7));
      break;
    case 'dragon':
      g.fillStyle(accent, 0.95);
      g.fillTriangle(p(17), p(22), p(5), p(11), p(21), p(30));
      g.fillTriangle(p(47), p(22), p(59), p(11), p(43), p(30));
      g.fillStyle(outline, 0.85);
      g.fillTriangle(p(25), p(16), p(32), p(4), p(39), p(16));
      g.fillStyle(accent, 0.8);
      g.fillRect(p(21), p(39), p(22), p(4));
      break;
    case 'shadow':
      g.fillStyle(outline, 0.85);
      g.fillTriangle(p(16), p(18), p(48), p(18), p(32), p(4));
      g.fillStyle(accent, 0.8);
      g.fillCircle(cx, p(31), p(4));
      break;
    case 'priest':
      g.fillStyle(accent, 1);
      g.fillCircle(cx, p(15), p(4));
      g.fillRect(p(30), p(11), p(4), p(12));
      g.fillRect(p(26), p(15), p(12), p(3));
      break;
    case 'goblin':
      g.fillStyle(base, 1);
      g.fillTriangle(p(17), p(25), p(8), p(19), p(19), p(31));
      g.fillTriangle(p(47), p(25), p(56), p(19), p(45), p(31));
      g.lineStyle(generatedTextureStroke(1, unit), outline, 1);
      g.strokeTriangle(p(17), p(25), p(8), p(19), p(19), p(31));
      g.strokeTriangle(p(47), p(25), p(56), p(19), p(45), p(31));
      break;
  }

  drawEyes(g, p(27), p(29), unit, outline, accent);
}

function drawEyes(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  unit: number,
  outline: number,
  accent: number
): void {
  g.fillStyle(outline, 1);
  g.fillRect(x, y, generatedTexturePoint(3, unit), generatedTexturePoint(3, unit));
  g.fillRect(x + generatedTexturePoint(8, unit), y, generatedTexturePoint(3, unit), generatedTexturePoint(3, unit));
  g.fillStyle(accent, 0.85);
  g.fillRect(
    x + generatedTexturePoint(1, unit),
    y + generatedTexturePoint(1, unit),
    generatedTexturePoint(1, unit),
    generatedTexturePoint(1, unit)
  );
  g.fillRect(
    x + generatedTexturePoint(9, unit),
    y + generatedTexturePoint(1, unit),
    generatedTexturePoint(1, unit),
    generatedTexturePoint(1, unit)
  );
}
