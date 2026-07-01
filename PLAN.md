# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Band 3 - Grenzeskalation** *(abgeschlossen, technische Phase 48,
  Worktree `/worktree/tempest-phase-48-band-3`)*
  - Branch: `phase-48-band-3`
  - `border-escalation` nur freiwillig nach Band 2 starten.
  - Sichtbare Legacy-Namen durch Canon-Figuren oder neutrale Systemrollen
    ersetzen; stabile interne IDs beibehalten.
  - `spirit-marsh`, `marsh-frontier` und Rueckweg klar fuehren.
  - Ranga-Scout/Schnellreise nur nach Pakt und Entdeckung erlauben.
  - Grenzkampf, Rissanalyse und Vorhut als zusammenhaengenden Flow umsetzen.
  - Nicht-toedliche Deeskalation und indirekte Gegenspieler-Spuren erzaehlen.
  - Headless-, Save- und Browser-Smoke fuer den Gesamtflow ergaenzen.
  - Abnahme: `git diff --check`; `bun run typecheck`; `bun run test`
    (44 Dateien, 311 Tests); `bun run build`; `bunx playwright test -g
    "Band 3 → Nachkampf"` (desktop/mobile, 2 Tests).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Story-Roadmap

- [ ] **Band 4 - Ahnenbindung und Entscheidung**
  - `ancestors-choice` nur freiwillig nach Band 3 starten.
  - Buendnisrat, Buendnismarsch, Breach-Kampf und Finale ausarbeiten.
  - Finale sichtbare Legacy-Namen canonisieren, ohne Saves zu brechen.
  - Freiheit, Ordnung und Geteilte Last als persistente Entscheidungen
    implementieren.
  - Den dritten Weg an belegbare Bindungsbedingungen koppeln.
  - Ranga im Finale als vollwertiges Kampfmitglied einsetzen.
  - Ending-, Save-, Codex- und Browser-Tests fuer alle Wege ergaenzen.

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
