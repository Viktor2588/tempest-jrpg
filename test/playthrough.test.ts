import { describe, expect, it } from 'vitest';
import { createNewSave, type SaveGameV2 } from '../src/systems/save';
import {
  applyWorldState,
  buildCodexView,
  buildQuestLog,
  chooseDialogOption,
  completeEncounter,
  createWorldState,
  getMapEncounters,
  getMapNpcs,
  getVisibleMapEncounters,
  npcHasQuestMarker,
  resolveEncounter,
  startDialogForNpc
} from '../src/systems/world';
import { JURA_FIELD } from '../src/data/maps';
import { isWalkable, type Vec2 } from '../src/systems/overworld';
import { makeRng } from '../src/systems/rng';

const MAP_ID = 'tempest-start';

// Spiegelt EXAKT die DialogueScene: lädt aus dem Save, nimmt nur die
// requirement-GEFILTERTEN Choices des Startknotens, wendet die Effekte an und
// schreibt zurück in den Save. Wirft, wenn die Choice für den Spieler gar nicht
// sichtbar wäre — so fängt der Test „Quest hängt, weil Option fehlt"-Bugs.
function talk(save: SaveGameV2, npcId: string, choiceId: string): SaveGameV2 {
  const view = startDialogForNpc(createWorldState(save), npcId);
  expect(
    view.choices.map((c) => c.id),
    `${npcId}: Choice '${choiceId}' ist für den Spieler nicht sichtbar`
  ).toContain(choiceId);
  const result = chooseDialogOption(createWorldState(save), view.dialogId, view.nodeId, choiceId);
  expect(result.ok, `${npcId}.${choiceId}: ${result.message}`).toBe(true);
  return applyWorldState(save, result.state.world);
}

// Spiegelt die OverworldScene: tritt auf die Encounter-Kachel (resolveEncounter),
// erwartet, dass der gated Trigger wirklich auslöst, und schreibt nach Sieg die
// victoryEffects (completeEncounter) zurück.
function clearTriggerAt(save: SaveGameV2, pos: Vec2): SaveGameV2 {
  const triggered = resolveEncounter(createWorldState(save), MAP_ID, pos, makeRng(1));
  expect(
    triggered.state.encounter,
    `Kein Encounter an (${pos.x},${pos.y}) — gated Trigger nicht erreichbar`
  ).not.toBeNull();
  let next = applyWorldState(save, triggered.state.world);
  const won = completeEncounter(createWorldState(next), triggered.state.encounter!.id);
  next = applyWorldState(next, won.state);
  return next;
}

// Welche „!"-Marker der Overworld nach diesem Stand zeichnet (drawWorldObjects-Quelle).
function visibleTriggerIds(save: SaveGameV2): string[] {
  return getVisibleMapEncounters(MAP_ID, createWorldState(save))
    .filter((enc) => enc.kind === 'trigger')
    .map((enc) => enc.id);
}

describe('Act-1-Durchspielen (szenentreu)', () => {
  it('schließt „Bindung der Ahnen" über den echten Szenen-Fluss ab und füllt den Codex', () => {
    let save = createNewSave();

    // Hauptquest startet vor Sora: nur dann ist sie sichtbar/aktivierbar.
    save = talk(save, 'sora', 'begin');     // Quest aktiv + awakening + story.intro.seen
    save = talk(save, 'vael', 'analyze');   // story.vael.ready
    save = talk(save, 'lyrre', 'briefing'); // story.lyrre.ready
    save = talk(save, 'sora', 'council');   // story.council.ready + gather-council
    // Nach dem Rat erscheint der Hain-Marker, der Schrein noch nicht.
    expect(visibleTriggerIds(save)).toContain('whispering-grove-ambush');
    expect(visibleTriggerIds(save)).not.toContain('shrine-approach');

    save = clearTriggerAt(save, { x: 14, y: 8 });  // Flüsterhain → clear-grove
    // Regressionsschutz: nach dem Hain-Sieg MUSS der Schrein-Marker auftauchen (sonst „stuck").
    expect(visibleTriggerIds(save)).toContain('shrine-approach');
    expect(visibleTriggerIds(save)).not.toContain('whispering-grove-ambush');

    save = clearTriggerAt(save, { x: 21, y: 13 }); // Schrein/Boss → defeat-mordrahn-echo
    expect(visibleTriggerIds(save).filter((id) => id === 'shrine-approach')).toHaveLength(0);

    save = talk(save, 'sora', 'report-act1'); // report-sora + complete-quest + Reward

    const quest = buildQuestLog(createWorldState(save)).find((q) => q.id === 'binding-of-ancestors')!;
    expect(quest.status).toBe('completed');
    expect(quest.steps.every((step) => step.completed)).toBe(true);

    // Codex muss sich entlang der Story füllen — kein Eintrag darf verschlossen bleiben.
    const codex = buildCodexView(createWorldState(save));
    for (const entry of codex) {
      expect(entry.unlocked, `Codex-Eintrag '${entry.id}' blieb verschlossen`).toBe(true);
    }
  });

  it('zeigt den Quest-Marker am jeweils richtigen NPC entlang der Story', () => {
    const marker = (save: SaveGameV2, npcId: string) => npcHasQuestMarker(createWorldState(save), npcId);
    let save = createNewSave();

    // Start: Sora (Story) und Rigurd (Patrouille) bieten je eine Aktion; Vael/Lyrre noch nicht.
    expect(marker(save, 'sora')).toBe(true);
    expect(marker(save, 'rigurd')).toBe(true);
    expect(marker(save, 'vael')).toBe(false);
    expect(marker(save, 'lyrre')).toBe(false);

    save = talk(save, 'sora', 'begin'); // Quest aktiv
    // Jetzt sind Vael & Lyrre dran; bei Sora gibt es gerade nichts zu tun.
    expect(marker(save, 'vael')).toBe(true);
    expect(marker(save, 'lyrre')).toBe(true);
    expect(marker(save, 'sora')).toBe(false);

    save = talk(save, 'vael', 'analyze');
    save = talk(save, 'lyrre', 'briefing');
    // Vael/Lyrre erledigt → kein Marker mehr; Sora wieder dran (Rat versammeln).
    expect(marker(save, 'vael')).toBe(false);
    expect(marker(save, 'lyrre')).toBe(false);
    expect(marker(save, 'sora')).toBe(true);
  });

  it('hält jeden Quest-NPC und Story-Encounter auf der Karte erreichbar', () => {
    // Flood-Fill der begehbaren Kacheln ab dem Spawn (4er-Nachbarschaft).
    const reachable = new Set<string>();
    const key = (x: number, y: number) => `${x},${y}`;
    const stack: Vec2[] = [JURA_FIELD.spawn];
    while (stack.length) {
      const { x, y } = stack.pop()!;
      if (x < 0 || y < 0 || x >= JURA_FIELD.width || y >= JURA_FIELD.height) continue;
      if (!isWalkable(JURA_FIELD, x, y) || reachable.has(key(x, y))) continue;
      reachable.add(key(x, y));
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
    }

    // NPCs: getAdjacentNpc nutzt Manhattan ≤ 1 → eine erreichbare Kachel in Reichweite genügt.
    for (const npc of getMapNpcs(MAP_ID)) {
      const ok = [...reachable].some((k) => {
        const [rx, ry] = k.split(',').map(Number);
        return Math.abs(rx! - npc.position.x) + Math.abs(ry! - npc.position.y) <= 1;
      });
      expect(ok, `NPC '${npc.id}' bei (${npc.position.x},${npc.position.y}) ist nicht erreichbar`).toBe(true);
    }

    // Trigger-Encounter: der Spieler muss die Kachel betreten → sie muss erreichbar sein.
    for (const enc of getMapEncounters(MAP_ID)) {
      if (enc.kind !== 'trigger' || !enc.position) continue;
      expect(
        reachable.has(key(enc.position.x, enc.position.y)),
        `Encounter '${enc.id}' bei (${enc.position.x},${enc.position.y}) ist nicht erreichbar`
      ).toBe(true);
    }
  });
});
