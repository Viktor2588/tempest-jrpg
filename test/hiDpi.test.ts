import { describe, expect, it } from 'vitest';
import {
  LOGICAL_GAME_HEIGHT,
  LOGICAL_GAME_WIDTH,
  MAX_RENDER_SCALE,
  renderBackingSize,
  resolveRenderScale,
  withHiDpiTextStyle
} from '../src/render/hiDpi';

const sceneSources = import.meta.glob('../src/scenes/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Readonly<Record<string, string>>;

describe('HiDPI-Rendering', () => {
  it('begrenzt den Renderfaktor deterministisch für Desktop und Mobile', () => {
    expect(resolveRenderScale(undefined)).toBe(1);
    expect(resolveRenderScale(0.75)).toBe(1);
    expect(resolveRenderScale(1.5)).toBe(1.5);
    expect(resolveRenderScale(2)).toBe(2);
    expect(resolveRenderScale(3)).toBe(MAX_RENDER_SCALE);
  });

  it('berechnet den physischen Backing Store aus der logischen 960×540-Fläche', () => {
    expect(renderBackingSize(LOGICAL_GAME_WIDTH, LOGICAL_GAME_HEIGHT, 1))
      .toEqual({ width: 960, height: 540 });
    expect(renderBackingSize(LOGICAL_GAME_WIDTH, LOGICAL_GAME_HEIGHT, 1.5))
      .toEqual({ width: 1440, height: 810 });
    expect(renderBackingSize(LOGICAL_GAME_WIDTH, LOGICAL_GAME_HEIGHT, 2))
      .toEqual({ width: 1920, height: 1080 });
  });

  it('setzt Text-Resolution standardmäßig auf DPR, respektiert aber Overrides', () => {
    const base = { fontFamily: 'sans-serif', fontSize: '16px' };
    expect(withHiDpiTextStyle(base, 2)).toEqual({ ...base, resolution: 2 });
    expect(base).not.toHaveProperty('resolution');
    expect(withHiDpiTextStyle({ ...base, resolution: 3 }, 2).resolution).toBe(3);
  });

  it('konfiguriert jede Phaser-Szene über die zentrale HiDPI-Policy', () => {
    const phaserScenes = Object.entries(sceneSources)
      .filter(([, source]) => source.includes('extends Phaser.Scene'));
    expect(phaserScenes.length).toBeGreaterThan(0);
    for (const [path, source] of phaserScenes) {
      expect(source, path).toContain('configureHiDpiScene(this)');
    }
  });
});
