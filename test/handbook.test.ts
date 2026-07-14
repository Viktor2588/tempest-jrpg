import { describe, expect, it } from 'vitest';
import { buildHandbook, HANDBOOK_ENTRIES } from '../src/systems/handbook';

describe('Mechanik-Handbuch (Phase 171)', () => {
  it('hat eindeutige Ids und nicht-leere Texte', () => {
    const ids = new Set(HANDBOOK_ENTRIES.map((entry) => entry.id));
    expect(ids.size).toBe(HANDBOOK_ENTRIES.length);
    for (const entry of HANDBOOK_ENTRIES) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.body.length).toBeGreaterThan(20);
    }
  });

  it('zeigt ungegatete Eintraege immer und zaehlt gegatete als gesperrt', () => {
    const view = buildHandbook({});
    const gated = HANDBOOK_ENTRIES.filter((entry) => entry.unlockFlag);
    expect(gated.length).toBeGreaterThan(0);
    expect(view.lockedCount).toBe(gated.length);
    expect(view.entries.length).toBe(HANDBOOK_ENTRIES.length - gated.length);
    expect(view.entries.some((entry) => entry.id === 'steal')).toBe(false);
  });

  it('schaltet gegatete Eintraege mit ihrem Story-Flag frei', () => {
    const view = buildHandbook({
      'story.shizu.vow': true,
      'story.council.ready': true,
      'craft.smithing.unlocked': true
    });
    expect(view.lockedCount).toBe(0);
    expect(view.entries.map((entry) => entry.id)).toContain('steal');
    expect(view.entries.map((entry) => entry.id)).toContain('workbench');
  });

  it('nutzt nur real existierende Gating-Flags (Tippfehler-Schutz)', () => {
    const known = new Set(['story.shizu.vow', 'story.council.ready', 'craft.smithing.unlocked']);
    for (const entry of HANDBOOK_ENTRIES) {
      if (entry.unlockFlag) expect(known.has(entry.unlockFlag)).toBe(true);
    }
  });
});
