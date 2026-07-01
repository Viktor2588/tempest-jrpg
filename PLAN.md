# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[x]` ist im Phase-Branch abgeschlossen und wartet auf Integration.
- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] **Phase 43 - Einzigartige Kampfkonzepte je Kaempfer** *(abgeschlossen
  2026-07-01, Worktree `/worktree/tempest-phase-43-signatures`)*
  - Branch: `phase-43-signatures`
  - Ein generisches Signaturleisten-/Signaturaktions-Framework definieren.
  - Rimuru, Ranga, Shuna, Benimaru, Shion, Hakurou, Souei, Gobta, Rigurd und
    Kurobe datengetrieben anbinden.
  - Bestehende Analyse-, Zeit-, Status- und Break-Primitive wiederverwenden.
  - HUD und mindestens einen Test pro Signatur ergaenzen.
  - Rigurd als Reservekaempfer samt eigenem Imagegen-Kampf-Cutout anbinden.
  - Abnahme: `bun run typecheck`, `bun run test` (284/284), `bun run build`
    sowie Playwright-Smoke Desktop und `390x844` (24/24) gruen.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Kampf-Roadmap

- [ ] **Phase 44 - Team-Mix und Fusionsangriffe**
  - Verbundene Gruppenmitglieder aus `RELATIONSHIPS` gemeinsam Momentum
    ausgeben lassen.
  - Element-Fusionstabelle und Kombo-Resolver implementieren.
  - Bestehende `combatBonus`-/`teamAttack`-Daten kompatibel abbilden.
  - Gating, Fusionselemente und Determinismus testen.

- [ ] **Phase 45 - KI, Telegraph und Tempo-Politur**
  - Gegner-KI auf Analyse, Bruch, CT-Kontrolle und Aussetzstatus erweitern.
  - Telegraphen fuer informierte Block-/Konterentscheidungen nutzbar machen.
  - Neue Verben in Auto-Battle und Terminierungstests abdecken.

- [ ] **Phase 46 - Inhalt, Balance und Kampfpraesentation**
  - Schwachstellen-, Devour-, Telegraph-, Signatur- und Kombodaten fuer alle
    Gegner und Canon-Bosse vervollstaendigen.
  - Schwellen und Erfolgsraten balancieren.
  - Battle-HUD um unbekannte/erkannte Schwachstellen, Telegraph, Devour,
    Signaturleisten, Kombos und Statussymbole erweitern.
  - Deutsche Tutorial-/Codextexte und QA-Gates ergaenzen.
  - Volle Suite sowie Desktop- und `390x844`-Smoke abnehmen.

## Story-Roadmap

- [ ] **Band 3 - Grenzeskalation**
  - `border-escalation` nur freiwillig nach Band 2 starten.
  - Sichtbare Legacy-Namen durch Canon-Figuren oder neutrale Systemrollen
    ersetzen; stabile interne IDs beibehalten.
  - `spirit-marsh`, `marsh-frontier` und Rueckweg klar fuehren.
  - Ranga-Scout/Schnellreise nur nach Pakt und Entdeckung erlauben.
  - Grenzkampf, Rissanalyse und Vorhut als zusammenhaengenden Flow umsetzen.
  - Nicht-toedliche Deeskalation und indirekte Gegenspieler-Spuren erzaehlen.
  - Headless-, Save- und Browser-Smoke fuer den Gesamtflow ergaenzen.

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
