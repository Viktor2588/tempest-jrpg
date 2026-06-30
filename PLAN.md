# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [~] **Phase 39 - Imagegen-Storyportraits III: Canon- und Regions-NPCs**
  - Worktree: `/worktree/tempest-phase-39-canon-npc-portraits`
  - Branch: `phase-39-canon-npc-portraits`
  - Portraits fuer Eir, Gazel, Kael, Milim, Souka, Treyni und die
    Blumund-Abenteurer integrieren.
  - Asset-Provenienz, Art-Mapping, Preload und Tests gemeinsam abschliessen.
  - Typecheck, Tests, Build und Desktop-/Mobile-E2E ausfuehren.

- [~] **Phase 41 - Kampf-Rewrite II: Verschlinger und Momentum**
  - Worktree: `/worktree/tempest-phase-41-predator`
  - Branch: `phase-41-predator`
  - `{type: "devour"}` ueber Bruch, niedrige LP und Debuffs gaten.
  - Deterministischen gewichteten Skill-Qualitaetswurf implementieren.
  - Momentum als begrenzten CT-Schub bei Schwachstellentreffern und Devour
    implementieren; Terminierung erhalten.
  - Rimuru die Unique-Skills `predator` und `great-sage` geben.
  - Gating, Qualitaetswurf und Momentum-Grenzen testen.

## Integrationswarteschlange

- [~] Die gepushte Asset-Branchkette Phase 33 bis 38 in Reihenfolge in `main`
  integrieren und nach jedem Merge die relevanten Checks ausfuehren.
- [ ] Phase 39 nach Abschluss und Push integrieren.
- [ ] Phase 41 nach Abschluss und Push integrieren.
- [ ] Nur sauber gemergte Worktrees entfernen; ungemergte oder geaenderte
  Worktrees und Branches erhalten.

## Kampf-Roadmap

- [ ] **Phase 42 - Permanente Skill-Aneignung und Rimurus Skill-Mix**
  - Devour dauerhaft in `learnedSkillIds` persistieren.
  - `devourable` und `devourSkillId` fuer Gegner datengetrieben definieren.
  - Dubletten verhindern und Save-Migration/Normalisierung absichern.
  - Rimurus Wasser-, Predator- und absorbierte Skills ueber Kosten und ein
    Loadout-Limit balancieren.
  - Codex und `rimuru-predator-*`-Talentknoten anbinden.

- [ ] **Phase 43 - Einzigartige Kampfkonzepte je Kaempfer**
  - Ein generisches Signaturleisten-/Signaturaktions-Framework definieren.
  - Rimuru, Ranga, Shuna, Benimaru, Shion, Hakurou, Souei, Gobta, Rigurd und
    Kurobe datengetrieben anbinden.
  - Bestehende Analyse-, Zeit-, Status- und Break-Primitive wiederverwenden.
  - HUD und mindestens einen Test pro Signatur ergaenzen.

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
- [ ] Alle implementierten Phasen auf fehlende dedizierte Bildassets pruefen;
  sinnvolle Luecken per Imagegen als WebP schliessen und in `ASSETS.md`
  dokumentieren.
