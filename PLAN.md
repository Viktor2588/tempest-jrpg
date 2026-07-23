# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.
Abgeschlossene Phasen stehen in `docs/PROJECT_KNOWLEDGE.md` und der Git-Historie.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- `[~]` **Phase 278 — Quest-Tracker & Zielklarheit (in Bearbeitung)** ⭐ HUD-Priorität
  - Worktree: `/worktree/tempest-phase-278-quest-tracker`
  - Branch: `phase-278-quest-tracker`
  - Ziel: dediziertes Overworld-HUD „aktuelles Ziel“ + Nebenquest-Liste.

- `[x]` **Phase 271 — Menü entschlacken / UX-Überarbeitung (abgeschlossen)** ⭐ HUD/UX
  - Worktree: `/worktree/tempest-phase-271-menu-declutter`
  - Branch: `phase-271-menu-declutter`
  - Abnahme: „Gruppe“ und „Abenteuer“ zeigen kontextuell nur 5 bzw. 3 Untertabs; Nummern-Shortcuts 1–8 bleiben erhalten.
  - Checks: `bun run typecheck`, `bun run test:unit` (873), `bun run build` sowie isolierter Desktop-Chromium-Menüsmoke bestanden.

- `[~]` **Phase 280 — Kampf-Präsentation & Feedback (in Bearbeitung)** ⭐ HUD
  - Worktree: `/worktree/tempest-phase-280-battle-feedback`
  - Branch: `phase-280-battle-feedback`
  - Ziel: schärfere Treffer-/Telegraph-/Signature-Feedbacks im Kampf-HUD.

- `[~]` **Phase 274 — Kampf-Balance-Pass (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-274-balance-pass`
  - Branch: `phase-274-balance-pass`
  - Ziel: Story-Kämpfe fordernder; Benchmark-Guardrails wo sinnvoll.

- `[~]` **Phase 272 — Visuelle Bugs beim Laufen (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-272-walk-bugs`
  - Branch: `phase-272-walk-bugs`
  - Ziel: saubere Walk-Darstellung (Facing, Bob, Depth).

- `[~]` **Phase 276 — Audio-Erweiterung (Musik & SFX) (in Bearbeitung)**
  - Worktree: `/worktree/tempest-phase-276-audio`
  - Branch: `phase-276-audio`
  - Hinweis: parallel von anderem Agenten (Codex) übernommen.

- `[ ]` **Phase 273 — Mehr Story-Content**
  - Problem: Story-Dichte und Zwischenbeats sind dünn.
  - Ziel: mehr Dialoge/Szenen auf Haupt- und Nebenpfaden.

- `[ ]` **Phase 275 — Bond-Szenen & Beziehungspfade erweitern**
  - Ziel: mehr Bond-Szenen pro Kern-Paar, Unlock-Signale.

- `[ ]` **Phase 277 — Mobile- & Touch-UX-Polish**
  - Ziel: 44px-Targets, lesbare Dichte auf 390×844 (nach 271 mergen).

- `[ ]` **Phase 279 — Overworld-Party-Präsenz (Follower/Companions)**
  - Ziel: 1–2 sichtbare Begleiter (nach 272 mergen).

- `[ ]` **Phase 281 — Siedlungs-/Facility-Wachstum spürbar machen**
  - Ziel: sichtbare Fortschrittsstufen für Tempest-Wachstum.

- `[ ]` **Phase 282 — Nebeninhalte & optionale Regionen**
  - Ziel: 2–4 lohnende Nebenpfade.

- `[ ]` **Phase 283 — Post-Game / New-Game+-Grundlage**
  - Ziel: leichte Post-Game-Schleife / NG+-Gerüst.

- `[ ]` **Phase 284 — Performance & Asset-Budget-Nachzug**
  - Ziel: stabile 960×540 auf Desktop/Mobile.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup

Phasen werden strikt in `/worktree/tempest-phase-<nr>-<kurzname>` auf dem
Branch `phase-<nr>-<kurzname>` umgesetzt. Worktrees werden erst nach Merge,
Sauberkeitspruefung und Archivierung entfernt.
