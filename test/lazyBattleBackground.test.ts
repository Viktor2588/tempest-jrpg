import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { BATTLE_ARENA_TEXTURES } from '../src/render/battleArt';
import {
  BATTLE_BACKGROUND_URLS,
  queueBattleBackground
} from '../src/render/battleBackgroundAssets';

// Minimaler Fake statt echter Phaser-Szene: queueBattleBackground berührt nur
// textures.exists (Ladewächter) und load.image (Ladeauftrag).
function fakeScene(alreadyLoaded: boolean) {
  const image = vi.fn();
  return {
    scene: {
      textures: { exists: () => alreadyLoaded },
      load: { image }
    } as unknown as Phaser.Scene,
    image
  };
}

describe('queueBattleBackground (Lazy-Load-Wächter)', () => {
  it('reiht einen noch nicht geladenen Hintergrund mit korrektem Key und URL ein', () => {
    const { scene, image } = fakeScene(false);

    const queued = queueBattleBackground(scene, 'tempest-city');

    expect(queued).toBe(true);
    expect(image).toHaveBeenCalledWith(
      BATTLE_ARENA_TEXTURES['tempest-city'],
      BATTLE_BACKGROUND_URLS['tempest-city']
    );
  });

  it('lädt einen bereits vorhandenen Hintergrund nicht erneut (idempotent)', () => {
    const { scene, image } = fakeScene(true);

    const queued = queueBattleBackground(scene, 'tempest-city');

    expect(queued).toBe(false);
    expect(image).not.toHaveBeenCalled();
  });
});
