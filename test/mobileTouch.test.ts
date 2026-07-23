import { describe, expect, it } from 'vitest';
import {
  allTouchControlRects,
  analyzeTouchControlLayout,
  layoutOverworldTouchControls,
  logicalToScreenPx,
  mobileFitScale,
  MOBILE_REFERENCE_VIEWPORT
} from '../src/systems/mobileLayout';

// Phase 277 — die Overworld-Touchflächen werden im logischen 960×540-Canvas
// bemessen und per Scale.FIT aufs Handy skaliert. Entscheidend fürs Finger-UX
// ist die physische Größe NACH FIT, nicht das logische Nennmaß.
const LOGICAL = { width: 960, height: 540 } as const;

describe('Phase 277 — mobile Touch-Ziele nach FIT-Skalierung', () => {
  it('skaliert das logische Canvas höhenbegrenzt aufs Referenz-Handy', () => {
    expect(mobileFitScale()).toBeCloseTo(390 / 540, 5);
  });

  it('hält jede Overworld-Steuerfläche physisch über 44 CSS-px', () => {
    const controls = layoutOverworldTouchControls(LOGICAL);
    for (const rect of allTouchControlRects(controls)) {
      expect(logicalToScreenPx(rect.width), `${rect.id}.width`).toBeGreaterThanOrEqual(44);
      expect(logicalToScreenPx(rect.height), `${rect.id}.height`).toBeGreaterThanOrEqual(44);
    }
  });

  it('bleibt am Referenz-Handy überlappungsfrei und im sicheren Viewport', () => {
    // Layout im logischen Raum (wie im Spiel), Prüfung gegen den logischen Viewport.
    const controls = layoutOverworldTouchControls(LOGICAL);
    expect(analyzeTouchControlLayout(controls, LOGICAL)).toEqual([]);
    // Und robust auch, wenn direkt fürs Referenz-Handy-Viewport berechnet.
    const mobile = layoutOverworldTouchControls(MOBILE_REFERENCE_VIEWPORT);
    expect(analyzeTouchControlLayout(mobile, MOBILE_REFERENCE_VIEWPORT)).toEqual([]);
  });
});
