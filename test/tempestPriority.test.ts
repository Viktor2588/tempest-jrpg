import { describe, expect, it } from 'vitest';
import { DIALOGS } from '../src/data';
import { getMapNpcs, type WorldState } from '../src/systems/world';
import { getMapDiscoveryAt } from '../src/systems/mapDiscovery';

// Story-Roadmap letzter Punkt: eine Dialog-Entscheidung mit sichtbarer,
// verzweigender, einmaliger Konsequenz (kein reines Fortschritts-Gate).
function world(flags: Record<string, boolean>): WorldState {
  return { flags, quests: {}, inventory: [], gold: 0 };
}

describe('Tempest-Ausrichtung — konsequente Entscheidung', () => {
  const dialog = DIALOGS.find((d) => d.id === 'tempest-priority')!;

  it('bietet drei sich gegenseitig ausschließende Ausrichtungen', () => {
    const root = dialog.nodes.find((n) => n.id === 'root')!;
    const picks = root.choices.filter((c) => ['defense', 'trade', 'knowledge'].includes(c.id));
    expect(picks).toHaveLength(3);
    for (const c of picks) {
      const reqs = (c as unknown as { requirements?: { notFlag?: string }[] }).requirements ?? [];
      expect(reqs.some((r) => r.notFlag === 'tempest.priority.chosen')).toBe(true);
      const flags = ((c as unknown as { effects?: { type: string; flag: string }[] }).effects ?? [])
        .filter((e) => e.type === 'set-flag').map((e) => e.flag);
      expect(flags).toContain('tempest.priority.chosen');
      expect(flags.some((f) => f.startsWith('tempest.priority.') && f !== 'tempest.priority.chosen')).toBe(true);
    }
  });

  it('zeigt den Rats-NPC nach der Benennung und verbirgt ihn nach der Wahl', () => {
    expect(getMapNpcs('tempest-start', world({})).some((n) => n.id === 'tempest-council')).toBe(false);
    expect(getMapNpcs('tempest-start', world({ 'story.tempest.named': true }))
      .some((n) => n.id === 'tempest-council')).toBe(true);
    expect(getMapNpcs('tempest-start', world({ 'story.tempest.named': true, 'tempest.priority.chosen': true }))
      .some((n) => n.id === 'tempest-council')).toBe(false);
  });

  it('macht die Wahl sichtbar: je Ausrichtung genau ein Wahrzeichen', () => {
    expect(getMapDiscoveryAt('tempest-start', 16, 4, { 'tempest.priority.defense': true })?.title).toBe('Tempests Wachturm');
    expect(getMapDiscoveryAt('tempest-start', 18, 10, { 'tempest.priority.trade': true })?.title).toBe('Tempests Marktplatz');
    expect(getMapDiscoveryAt('tempest-start', 14, 11, { 'tempest.priority.knowledge': true })?.title).toBe('Tempests Schriftenhalle');
    expect(getMapDiscoveryAt('tempest-start', 16, 4, {})).toBeNull();
    expect(getMapDiscoveryAt('tempest-start', 18, 10, { 'tempest.priority.defense': true })).toBeNull();
  });
});
