# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Band 4 - Ahnenbindung und Entscheidung** *(abgeschlossen,
  technische Phase 49, Worktree `/worktree/tempest-phase-49-band-4`)*
  - Branch: `phase-49-band-4`
  - `ancestors-choice` nur freiwillig nach Band 3 starten.
  - Buendnisrat, Buendnismarsch, Breach-Kampf und Finale ausarbeiten.
  - Finale sichtbare Legacy-Namen canonisieren, ohne Saves zu brechen.
  - Freiheit, Ordnung und Geteilte Last als persistente Entscheidungen
    implementieren.
  - Den dritten Weg an belegbare Bindungsbedingungen koppeln.
  - Ranga im Finale als vollwertiges Kampfmitglied einsetzen.
  - Ending-, Save-, Codex- und Browser-Tests fuer alle Wege ergaenzen.
  - Abnahme: `git diff --check`; `bun run typecheck`; `bun run test`
    (44 Dateien, 316 Tests); `bun run build`; `bunx playwright test -g
    "Band 4"` (desktop/mobile, 6 Tests).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Story-Roadmap

- Keine offene Story-Roadmap-Phase.

## UX- und Welt-Backlog

- [ ] Onboarding fuer Bewegung, Interaktion und Menueaufruf fertigstellen;
  Tutorial-Pfeile und Hilfen danach ausblenden.
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
