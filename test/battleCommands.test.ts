import { describe, expect, it } from 'vitest';
import battleSceneSource from '../src/scenes/BattleScene.ts?raw';

// Regression: die Unique-Verben Großer Weiser/Verschlinger müssen als eigene
// Kampfbefehle erreichbar sein (nicht nur für die Auto-KI). Vgl. Bug „lässt sich
// nicht im Kampf ausführen". Die Engine-Logik selbst deckt battle.test.ts ab.
describe('BattleScene — Unique-Verb-Befehle', () => {
  it('bietet Analysieren (great-sage) und Verschlingen (predator) als Befehle an', () => {
    expect(battleSceneSource).toContain('🔍 Analysieren');
    expect(battleSceneSource).toContain('🍴 Verschlingen');
    expect(battleSceneSource).toContain("this.pendingVerb = 'analyze'");
    expect(battleSceneSource).toContain("this.pendingVerb = 'devour'");
  });

  it('routet die Ziel-Wahl über pendingVerb auf die analyze/devour-Aktion', () => {
    expect(battleSceneSource).toContain('this.doAct({ type: this.pendingVerb, targetId: unit.id })');
  });

  it('filtert die Unique-Verben aus der wirkbaren Skill-Liste', () => {
    expect(battleSceneSource).toContain("if (id === 'great-sage' || id === 'predator') return [];");
  });

  it('zeigt beim Rauben-Zielmodus das Skill-Raub-Banner', () => {
    expect(battleSceneSource).toContain("this.pendingSteal && this.textures.exists('ui-predator-steal')");
    expect(battleSceneSource).toContain("this.add.image(GAME_WIDTH / 2, 90, 'ui-predator-steal')");
  });
});
