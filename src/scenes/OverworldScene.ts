import Phaser from 'phaser';
import { JURA_FIELD } from '../data/maps';
import { tryStep, WALL, type Dir, type Vec2 } from '../systems/overworld';

const TILE = 48;
const MOVE_MS = 130;

// Oberwelt: rendert das Kachelraster, bewegt den Spieler rasterweise (Tastatur +
// Touch-Steuerkreuz) und folgt mit der Kamera. Bewegung/Kollision kommt aus
// der reinen systems/overworld-Logik.
export class OverworldScene extends Phaser.Scene {
  private pos: Vec2 = { x: 0, y: 0 };
  private player!: Phaser.GameObjects.Rectangle;
  private moving = false;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private touchDir: Dir | null = null;

  constructor() {
    super('Overworld');
  }

  create(): void {
    const map = JURA_FIELD;

    // Kacheln zeichnen.
    const g = this.add.graphics();
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const wall = map.tiles[y]![x] === WALL;
        g.fillStyle(wall ? 0x2f3b52 : 0x161d2a, 1);
        g.fillRect(x * TILE, y * TILE, TILE, TILE);
        g.lineStyle(1, 0x0c111b, 0.6);
        g.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
    }

    // Spieler.
    this.pos = { ...map.spawn };
    this.player = this.add.rectangle(this.cx(this.pos.x), this.cy(this.pos.y), TILE * 0.62, TILE * 0.62, 0x68d7ff)
      .setStrokeStyle(2, 0xcdeaff);

    // Kamera folgt, begrenzt auf die Kartengröße.
    this.cameras.main.setBounds(0, 0, map.width * TILE, map.height * TILE);
    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);

    // Tastatur.
    const kb = this.input.keyboard;
    if (kb) {
      this.cursors = kb.createCursorKeys();
      this.wasd = kb.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    }

    // Touch-Steuerkreuz (mobil).
    this.buildDpad();

    // Kampf auslösen (Demo: Enter-Taste oder Knopf) → bindet Phase 3 an.
    const toBattle = () => this.scene.start('Battle');
    this.input.keyboard?.on('keydown-ENTER', toBattle);
    const btn = this.add.rectangle(this.scale.width - 86, 30, 150, 38, 0x3a2230, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0xff8aa0, 0.7).setInteractive();
    this.add.text(this.scale.width - 86, 30, '⚔ Kampf (Enter)', { fontFamily: 'sans-serif', fontSize: '13px', color: '#ffd6de' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    btn.on('pointerdown', toBattle);

    // Menü-Overlay (Phase 4): pausiert die Oberwelt, Szene rendert über ihr.
    const openMenu = () => {
      if (this.scene.isActive('Menu')) return;
      this.scene.launch('Menu');
      this.scene.pause();
    };
    this.input.keyboard?.on('keydown-M', openMenu);
    const menuBtn = this.add.rectangle(this.scale.width - 86, 80, 150, 44, 0x223049, 0.9)
      .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x68d7ff, 0.7).setInteractive();
    this.add.text(this.scale.width - 86, 80, '☰ Menü (M)', { fontFamily: 'sans-serif', fontSize: '14px', color: '#d8ecff' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(11);
    menuBtn.on('pointerdown', openMenu);
  }

  override update(): void {
    if (this.moving) return;
    const dir = this.readDir();
    if (dir) this.step(dir);
  }

  private readDir(): Dir | null {
    if (this.touchDir) return this.touchDir;
    const c = this.cursors, w = this.wasd;
    if (c?.left.isDown || w?.A.isDown) return 'left';
    if (c?.right.isDown || w?.D.isDown) return 'right';
    if (c?.up.isDown || w?.W.isDown) return 'up';
    if (c?.down.isDown || w?.S.isDown) return 'down';
    return null;
  }

  private step(dir: Dir): void {
    const next = tryStep(JURA_FIELD, this.pos, dir);
    if (next.x === this.pos.x && next.y === this.pos.y) return; // blockiert
    this.pos = next;
    this.moving = true;
    this.tweens.add({
      targets: this.player,
      x: this.cx(next.x),
      y: this.cy(next.y),
      duration: MOVE_MS,
      onComplete: () => { this.moving = false; }
    });
  }

  private cx(tileX: number): number { return tileX * TILE + TILE / 2; }
  private cy(tileY: number): number { return tileY * TILE + TILE / 2; }

  private buildDpad(): void {
    const r = 30, gap = 4, baseX = r + 18, baseY = this.scale.height - r - 18;
    const layout: Array<{ dir: Dir; dx: number; dy: number; label: string }> = [
      { dir: 'up', dx: 0, dy: -(r + gap), label: '▲' },
      { dir: 'down', dx: 0, dy: r + gap, label: '▼' },
      { dir: 'left', dx: -(r + gap), dy: 0, label: '◀' },
      { dir: 'right', dx: r + gap, dy: 0, label: '▶' }
    ];
    for (const b of layout) {
      const btn = this.add.rectangle(baseX + b.dx, baseY + b.dy, r * 1.7, r * 1.7, 0x223049, 0.55)
        .setScrollFactor(0).setDepth(10).setStrokeStyle(2, 0x68d7ff, 0.6).setInteractive();
      this.add.text(baseX + b.dx, baseY + b.dy, b.label, { fontFamily: 'sans-serif', fontSize: '20px', color: '#cdeaff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(11);
      btn.on('pointerdown', () => { this.touchDir = b.dir; });
      btn.on('pointerup', () => { if (this.touchDir === b.dir) this.touchDir = null; });
      btn.on('pointerout', () => { if (this.touchDir === b.dir) this.touchDir = null; });
    }
  }
}
