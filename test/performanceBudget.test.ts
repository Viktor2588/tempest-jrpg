import { describe, expect, it } from 'vitest';
import { BATTLE_ARENA_TEXTURES } from '../src/render/battleArt';
import {
  BATTLE_BACKGROUND_URLS,
  INITIAL_BATTLE_BACKGROUND_KINDS
} from '../src/render/battleBackgroundAssets';
import preloadSource from '../src/scenes/PreloadScene.ts?raw';

const backgroundSources = import.meta.glob('../src/assets/backgrounds/battle-*.webp', {
  eager: true,
  query: '?inline',
  import: 'default'
}) as Readonly<Record<string, string>>;

function encodedBytes(dataUrl: string): number {
  return Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);
}

describe('Startpfad-Performancebudget', () => {
  it('lädt nur die zwei für den Einstieg benötigten Kampfhintergründe vor', () => {
    expect(INITIAL_BATTLE_BACKGROUND_KINDS).toEqual(['sealed-cave', 'tempest-grove']);
    expect(preloadSource).toContain('INITIAL_BATTLE_BACKGROUND_KINDS.forEach');
    expect(preloadSource).not.toContain("this.load.image(BATTLE_ARENA_TEXTURES['tempest-city']");
  });

  it('hält die Einstiegshintergründe unter 320 KiB und registriert alle übrigen lazy', () => {
    const startupBytes = INITIAL_BATTLE_BACKGROUND_KINDS.reduce((total, kind) => {
      const filename = BATTLE_BACKGROUND_URLS[kind].match(/battle-[^/]+\.webp$/)?.[0];
      const source = Object.entries(backgroundSources)
        .find(([path]) => path.endsWith(`/${filename}`))?.[1];
      expect(source, filename).toBeDefined();
      return total + encodedBytes(source!);
    }, 0);

    expect(startupBytes).toBeLessThan(320 * 1024);
    expect(Object.keys(BATTLE_BACKGROUND_URLS).sort()).toEqual(Object.keys(BATTLE_ARENA_TEXTURES).sort());
    expect(Object.keys(BATTLE_BACKGROUND_URLS)).toHaveLength(21);
  });
});
