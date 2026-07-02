# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Oberwelt-HUD auf einen Menuebutton unter der Minimap reduzieren**
  *(abgeschlossen, technische Phase 51, Worktree
  `/worktree/tempest-phase-51-hud-menu`)*
  - Branch: `phase-51-hud-menu`
  - Den Oberwelt-HUD-Buttonbestand auf einen klaren Menuebutton unter der
    Minimap reduzieren.
  - Mobile Bewegung/Interaktion als Steuerflaechen erhalten, aber nicht mehr
    als HUD-Aktionsbuttons neben der Minimap fuehren.
  - Layout- und Browser-Smoke fuer Desktop/Mobile aktualisieren.
  - Abnahme: `git diff --check`; `bun run typecheck`; `bun run test`
    (44 Dateien, 317 Tests); `bun run build`; `bunx playwright test -g
    "Title → Overworld|Prologstart|Oberwelt-Onboarding"` (desktop/mobile,
    6 Tests).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Story-Roadmap

- Keine offene Story-Roadmap-Phase.

## UX- und Welt-Backlog

- [ ] Menue-Bodies scrollbar machen; Quest- und Codexlisten filtern und
  Detailansichten statt ueberlanger Uebersichtskarten anbieten.
- [ ] Party nicht redundant auf jeder Menue-Seite anzeigen.
- [ ] Status, Ausruestung, Verzauberung, Inventar und mobile Textlayouts auf
  Ueberlappungen pruefen und korrigieren.
- [ ] Namensgebung, Entwicklungen und Bindungen unter Status konsolidieren.
- [ ] NPC-Kollisionen und Gateway-Ausloesung erst auf dem Zielfeld umsetzen.
- [ ] Siegesergebnis und Rueckkehr zur Welt klarer praesentieren.
- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
