// Prozeduraler Pixel-VFX-Atlas (Phaser, browser-only). Nutzt die reinen
// VFX-Specs aus artSpec.ts und erzeugt wiederverwendbare Texturen:
// 'vfx-hit-burst', 'vfx-heal-spark', ...
import Phaser from 'phaser';
import { VFX_KINDS, vfxSpec, type VfxKind } from './artSpec';

function hex(color: string): number {
  return Phaser.Display.Color.HexStringToColor(color).color;
}

export function vfxKey(kind: VfxKind): string {
  return 'vfx-' + kind;
}

export function generateVfxTextures(scene: Phaser.Scene, kinds: readonly VfxKind[] = VFX_KINDS): void {
  for (const kind of kinds) {
    const key = vfxKey(kind);
    if (scene.textures.exists(key)) continue;

    const spec = vfxSpec(kind);
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const s = spec.size;
    const c = s / 2;

    if (spec.shape === 'burst') drawBurst(g, s, c, spec);
    else if (spec.shape === 'spark') drawSpark(g, s, c, spec);
    else if (spec.shape === 'puff') drawPuff(g, s, c, spec);
    else if (spec.shape === 'bolt') drawBolt(g, s, spec);
    else drawRing(g, s, c, spec);

    g.generateTexture(key, s, s);
    g.destroy();
  }
}

function drawBurst(g: Phaser.GameObjects.Graphics, s: number, c: number, spec: ReturnType<typeof vfxSpec>): void {
  g.lineStyle(1, hex(spec.outline), 1);
  g.fillStyle(hex(spec.base), 1);
  g.fillCircle(c, c, s * 0.24);
  g.fillStyle(hex(spec.accent), 1);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x1 = c + Math.cos(a) * s * 0.18;
    const y1 = c + Math.sin(a) * s * 0.18;
    const x2 = c + Math.cos(a + 0.25) * s * 0.43;
    const y2 = c + Math.sin(a + 0.25) * s * 0.43;
    const x3 = c + Math.cos(a - 0.25) * s * 0.43;
    const y3 = c + Math.sin(a - 0.25) * s * 0.43;
    g.fillTriangle(x1, y1, x2, y2, x3, y3);
  }
  g.strokeCircle(c, c, s * 0.24);
}

function drawSpark(g: Phaser.GameObjects.Graphics, s: number, c: number, spec: ReturnType<typeof vfxSpec>): void {
  g.lineStyle(2, hex(spec.outline), 0.9);
  g.fillStyle(hex(spec.base), 1);
  g.fillCircle(c, c, s * 0.18);
  g.fillStyle(hex(spec.accent), 1);
  g.fillRect(c - 2, s * 0.12, 4, s * 0.76);
  g.fillRect(s * 0.12, c - 2, s * 0.76, 4);
  g.strokeCircle(c, c, s * 0.32);
}

function drawPuff(g: Phaser.GameObjects.Graphics, s: number, c: number, spec: ReturnType<typeof vfxSpec>): void {
  g.fillStyle(hex(spec.base), 0.95);
  g.fillCircle(c - 5, c, s * 0.18);
  g.fillCircle(c + 4, c - 4, s * 0.2);
  g.fillCircle(c + 5, c + 5, s * 0.16);
  g.fillStyle(hex(spec.accent), 0.75);
  g.fillCircle(c, c + 1, s * 0.13);
  g.lineStyle(1, hex(spec.outline), 0.8);
  g.strokeCircle(c - 5, c, s * 0.18);
  g.strokeCircle(c + 4, c - 4, s * 0.2);
  g.strokeCircle(c + 5, c + 5, s * 0.16);
}

function drawBolt(g: Phaser.GameObjects.Graphics, s: number, spec: ReturnType<typeof vfxSpec>): void {
  const c = s / 2;
  g.lineStyle(1, hex(spec.outline), 1);
  g.fillStyle(hex(spec.base), 1);
  g.fillTriangle(2, c, s * 0.68, 3, s * 0.92, c);
  g.fillTriangle(2, c, s * 0.68, s - 3, s * 0.92, c);
  g.fillStyle(hex(spec.accent), 1);
  g.fillCircle(s * 0.72, c, Math.max(2, s * 0.12));
  g.strokeTriangle(2, c, s * 0.68, 3, s * 0.92, c);
  g.strokeTriangle(2, c, s * 0.68, s - 3, s * 0.92, c);
}

function drawRing(g: Phaser.GameObjects.Graphics, s: number, c: number, spec: ReturnType<typeof vfxSpec>): void {
  g.lineStyle(2, hex(spec.base), 1);
  g.strokeCircle(c, c, s * 0.36);
  g.lineStyle(1, hex(spec.accent), 0.8);
  g.strokeCircle(c, c, s * 0.22);
  g.lineStyle(1, hex(spec.outline), 0.75);
  g.strokeCircle(c, c, s * 0.43);
}
