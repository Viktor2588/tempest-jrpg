import { describe, expect, it } from 'vitest';
import portraitSource from '../src/render/portraitAtlas.ts?raw';

describe('Portrait-Atlas-Zuordnung', () => {
  it('ordnet den versiegelten Sturmdrachen einem eigenen Portrait zu', () => {
    expect(portraitSource).toContain("case 'versiegelter sturmdrache':");
    expect(portraitSource).toContain("return 'storm-dragon';");
    expect(portraitSource).toContain("case 'dragon':");
  });
});
