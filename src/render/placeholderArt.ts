// Prozedurale Platzhalter-Texturen (Phaser, browser-only). Erzeugt aus den
// reinen Specs in artSpec.ts kohärente 32×32-Texturen, bis echte CC0-Assets
// eingepflegt sind. Schlüssel: 'ph-<kind>' (z. B. 'ph-tile-grass').
import Phaser from 'phaser';
import { PLACEHOLDER_KINDS, placeholderSpec, type PlaceholderKind } from './artSpec';
import { hexColor } from './color';

const ART_INSET = 1;

export function placeholderKey(kind: PlaceholderKind): string {
  return 'ph-' + kind;
}

/** Erzeugt (idempotent) alle Platzhalter-Texturen in der Textur-Verwaltung der Szene. */
export function generatePlaceholderTextures(scene: Phaser.Scene, kinds: readonly PlaceholderKind[] = PLACEHOLDER_KINDS): void {
  for (const kind of kinds) {
    const key = placeholderKey(kind);
    if (scene.textures.exists(key)) continue;
    const spec = placeholderSpec(kind);
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const s = spec.size;

    g.fillStyle(hexColor(spec.base), 1);
    if (spec.shape === 'block') {
      g.fillRect(0, 0, s, s);
      // Akzent-Ecke für Textur
      g.fillStyle(hexColor(spec.accent), 1);
      g.fillRect(0, 0, s, Math.max(2, Math.floor(s * 0.18)));
    } else {
      g.fillCircle(s / 2, s / 2, s / 2 - ART_INSET);
      g.fillStyle(hexColor(spec.accent), 1);
      g.fillCircle(s / 2 - s * 0.14, s / 2 - s * 0.14, Math.max(2, s * 0.12)); // „Glanzpunkt"
    }
    // 1px-Outline
    g.lineStyle(1, hexColor(spec.outline), 1);
    if (spec.shape === 'block') g.strokeRect(0.5, 0.5, s - 1, s - 1);
    else g.strokeCircle(s / 2, s / 2, s / 2 - ART_INSET);

    g.generateTexture(key, s, s);
    g.destroy();
  }
}
