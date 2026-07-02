# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Onboarding fuer Bewegung, Interaktion und Menueaufruf** *(abgeschlossen,
  technische Phase 50, Worktree
  `/worktree/tempest-phase-50-onboarding`)*
  - Branch: `phase-50-onboarding`
  - Tutorial-Pfeile und Hilfen nach erfolgreicher Nutzung ausblenden.
  - Bewegung, Interaktion und Menueaufruf als klare, speicherbare
    Onboarding-Schritte abbilden.
  - Desktop- und Mobile-Smoke fuer die Onboarding-Hinweise ergaenzen.
  - Abnahme: `git diff --check`; `bun run typecheck`; `bun run test`
    (44 Dateien, 317 Tests); `bun run build`; `bunx playwright test -g
    "Title → Overworld|Prologstart|Oberwelt-Onboarding"` (desktop/mobile,
    6 Tests).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Story-Roadmap

- Keine offene Story-Roadmap-Phase.

## UX- und Welt-Backlog

- [ ] Oberwelt-HUD auf einen Menuebutton unter der Minimap reduzieren.
- [ ] Menue-Bodies scrollbar machen; Quest- und Codexlisten filtern und
  Detailansichten statt ueberlanger Uebersichtskarten anbieten.
- [ ] Party nicht redundant auf jeder Menue-Seite anzeigen.
- [ ] Status, Ausruestung, Verzauberung, Inventar und mobile Textlayouts auf
  Ueberlappungen pruefen und korrigieren.
- [ ] Namensgebung, Entwicklungen und Bindungen unter Status konsolidieren.
- [ ] NPC-Kollisionen und Gateway-Ausloesung erst auf dem Zielfeld umsetzen.
- [ ] Siegesergebnis und Rueckkehr zur Welt klarer praesentieren.
- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
