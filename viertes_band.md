# Viertes Band – Plan für Story- und Content-Ausbau

## Leitlinie

Das vierte Band soll die vorbereitete Grenz- und Ahnenkrise in eine echte Bündnisentscheidung überführen. Nach Band 3 ist klar: Tempest kann nicht nur reagieren. Rimuru muss verschiedene Gruppen zusammenbringen, den Ursprung der Risse erreichen und entscheiden, wie Tempest mit alter Macht, Freiheit und Schutz umgeht. Die Umsetzung bleibt Canon-first bei sichtbaren Namen; bestehende Projektnamen und technische IDs werden als Platzhalter behandelt, bis sie sauber ersetzt sind.

## Projektregel: Originalnamen

Sichtbare Figuren sollen originale Tensura-Namen verwenden. Gobta/Gobota bleibt früher aktiver Begleiter, Ranga bleibt früher Companion und Reiseanker. Erfunden wirkende Projektnamen aus alten Daten (`Sora`, `Vael`, `Lyrre`, `Mordrahn`) dürfen in technischen IDs vorerst bestehen, sollen aber im sichtbaren Text durch Canon-Figuren, den Großen Weisen, neutrale Rollen oder namenlose Phänomene ersetzt werden.

## Zielbild

- Band 4 startet freiwillig nach `story.act2.completed`.
- Hauptquest ist `ancestors-choice` / „Die Wahl der Ahnen“.
- Rimuru führt ein Bündnis zusammen, statt nur einzelne Kämpfe zu gewinnen.
- Gobta/Gobota und Ranga bleiben frühe Begleiter und liefern Scout-/Frontnutzen.
- Shuna bleibt zunächst Ritual-/Ratfigur, bekommt aber mehr Gewicht bei Ahnen- und Schutzmagie.
- Der bisher indirekte Gegenspieler wird im vierten Band einem konkreten Canon-Arc zugeordnet und nicht als eigener erfundener Hauptgegner weitergeführt.
- Das Band endet nicht nur mit Sieg, sondern mit einer Entscheidung: Freiheit, Ordnung oder geteilte Last.
- Die Entscheidung wird zunächst nur dokumentiert und inszeniert, verändert aber noch keine späteren Karten oder Folgequests.
- Band 5 startet später als neuer optionaler Arc im Tempest-Hub.

## Aktueller technischer Anker im Projekt

| Bereich | Vorhandener Stand | Nutzung für Band 4 |
| --- | --- | --- |
| Hauptquest | `ancestors-choice` mit Steps `rally`, `breach`, `confront`, `choose` | Als kompletter Band-4-Arc ausbauen |
| Startbedingung | `story.act2.completed` | Freiwilliger Start nach Band 3 |
| Startdialog | Aktuell über technischen Storyanker bei `rally` | Sichtbar auf Canon-Anker migrieren |
| Kämpfe | `alliance-breach`, `mordrahn-confrontation` | Bündnismarsch und finaler Konflikt |
| Endings | `ending.freedom`, `ending.order`, `ending.true` | Drei klare Band-4-Ausgänge |
| Bindungen | `bond.sora.trust-1`, `bond.lyrre.trust-1` | Auf Canon-/neutrale Bindungsflags migrieren |

## Geplanter Storyflow

| Schritt | Spielbeat | Technische Umsetzung |
| --- | --- | --- |
| 1 | Nach Grenzfeuer wird der nächste Schritt freiwillig angeboten | `ancestors-choice` bleibt unsichtbar/inaktiv, bis Spieler beim Canon-Anker startet |
| 2 | Rimuru schmiedet ein Bündnis | Step `rally`, sichtbare Beteiligung von Rigurd, Gobta/Gobota, Ranga und Shuna |
| 3 | Verbündete Rollen werden festgelegt | Gobta/Gobota als Scout/Front, Ranga als Bewegung/Eröffnung, Shuna als Ritualschutz |
| 4 | Bündnismarsch zur tiefen Bindung | Encounter `alliance-breach`, Step `breach` |
| 5 | Wahrheit des Gegenspielers wird sichtbar | Vor dem Finale Codex-/Dialog-Enthüllung, keine erfundenen Namen ohne Canon-Migration |
| 6 | Finaler Konflikt an der Ahnenbindung | Encounter `mordrahn-confrontation` technisch nutzen, sichtbar ggf. neutralisieren |
| 7 | Entscheidung über das Siegel | Step `choose`: Freiheit, Ordnung oder dritter Weg |
| 8 | Epilog für Tempest | Auswirkungen im Hub, Codex, Party-/Bindungsboni und mögliche Band-5-Hooks |

## Umsetzungspakete

### 1. Freiwilliger Band-4-Start

- [ ] Sicherstellen, dass `ancestors-choice` nach Band 3 nicht automatisch startet.
- [ ] Startdialog bei einem Canon-Anker anbieten, sobald `story.act2.completed` gesetzt ist.
- [ ] Questlog-Hinweis: „Das Bündnis wartet“, aber ohne Zwang.
- [ ] Tests ergänzen: sichtbar nach Band 3, aktiv erst nach Startdialog.

### 2. Namens- und Rollenmigration

- [ ] Sichtbare Texte von `Sora`, `Vael`, `Lyrre`, `Mordrahn` entfernen oder neutralisieren.
- [ ] Funktionen auf Canon-Anker verteilen: Großer Weiser für Analyse, Rigurd für Stadt, Shuna für Ritual, Gobta/Gobota und Ranga für Bewegung/Scout.
- [ ] Interne IDs nur anfassen, wenn Tests und Save-Kompatibilität sauber bleiben.
- [ ] Codex-Einträge so umschreiben, dass sie ohne erfundene Namen verständlich sind.

### 3. Bündnis schmieden

- [ ] Step `rally` als spielbare Rat-/Bündnisszene inszenieren.
- [ ] Rigurd bringt Stadt-/Versorgungslogik ein.
- [ ] Gobta/Gobota bringt frühe Gefährtenperspektive ein und bekommt eigene Dialogentscheidungen im Bündnisrat.
- [ ] Ranga bringt Direwolf-/Scoutvorteil ein.
- [ ] Shuna markiert die rituelle Gefahr der Ahnenbindung.
- [ ] Optional: stärkere Bindungen öffnen zusätzliche Dialogzeilen, aber blockieren den Hauptflow nicht.

### 4. Bündnismarsch und Breach-Kampf

- [ ] `alliance-breach` als Band-4-Pflichtkampf inszenieren.
- [ ] Eigene Karte oder klarer Abschnitt für den Bündnismarsch.
- [ ] Ranga-Scout kann vor dem Kampf Vorteil geben: Initiative, Karte, Warnung oder Schnellreisepunkt.
- [ ] Gegnergruppe auf Band-4-Niveau balancen.
- [ ] Sieg narrativ als Durchbruch, nicht als endgültiges Finale darstellen.

### 5. Finale Konfrontation

- [ ] Technischen Kampf `mordrahn-confrontation` sichtbar auf einen konkreten Canon-Arc migrieren.
- [ ] Vor dem Kampf eine kurze Enthüllung einbauen: Warum die Bindung gefährlich ist.
- [ ] Bossmechanik sollte Entscheidungsthema spiegeln: Kontrolle, Freiheit, geteilte Last.
- [ ] Ranga im Band-4-Finale als vollwertiges Kampfmitglied einbinden, nicht nur als Scout-/Opening-Bonus.
- [ ] Nach Sieg nicht sofort Ende auslösen, sondern zur bewussten Entscheidung führen.

### 6. Drei Entscheidungen

- [ ] Freiheit: Bindung zerstören, Tempest bleibt selbstbestimmt, aber verletzlicher.
- [ ] Ordnung: Bindung neu schmieden, Tempest erhält Schutz, zahlt aber Preis.
- [ ] Geteilte Last: nur mit erfüllten Bindungsflags; Verantwortung wird verteilt.
- [ ] UI klar machen, welche Entscheidung welche Konsequenz bedeutet.
- [ ] Entscheidungen in Save-Flags, Codex und Epilog sichtbar machen.
- [ ] Entscheidungen noch nicht auf spätere Karten, Quests oder Band-5-Startbedingungen auswirken lassen.

### 7. Party- und Progressionsfolgen

- [ ] Gobta/Gobota nach Band 4 als dauerhaft etablierter Begleiter absichern.
- [ ] Ranga als vollwertiges Kampfmitglied im Finale bestätigen und spätere Mount-/Companion-Rolle weiter vorbereiten.
- [ ] Shunas Ritualrolle als spätere aktive Partyoption vorbereiten, aber nicht erzwingen.
- [ ] Rimurus Bindungsprogression an die gewählte Entscheidung koppeln.
- [ ] Der dritte Weg verlangt belegbare Bindungen, nicht nur Questabschluss.

### 8. Präsentation

- [ ] Finale Battle-Background für Ahnenherz/Siegelkern ergänzen.
- [ ] VFX für Bindungsbruch, Neuschmiedung und geteilte Last differenzieren.
- [ ] Soundhinweise für Bündnis, Finale und Entscheidung trennen.
- [ ] Epilog im Tempest-Hub sichtbar machen: NPC-Reaktionen und Codex-Folgeeinträge.

### 9. Tests und Gates

- [ ] Headless-Smoke: Band 3 abgeschlossen → Band 4 freiwillig starten → Rally → Breach → Finale → Entscheidung.
- [ ] Test: `ancestors-choice` startet nicht automatisch nach `story.act2.completed`.
- [ ] Test: Gobta/Gobota und Ranga bleiben im Band-4-Flow verfügbar.
- [ ] Test: Ranga ist im Band-4-Finale als vollwertiges Kampfmitglied verfügbar.
- [ ] Test: Gobta/Gobota-Dialogentscheidung im Bündnisrat setzt nachvollziehbares Flag, blockiert aber keinen Hauptpfad.
- [ ] Test: alle drei Endings setzen exakt ihre Flags.
- [ ] Test: True Ending ist nur mit erfüllten Bindungsbedingungen sichtbar.
- [ ] Test: Band 5 wird nach Band 4 nur als optionaler Tempest-Hub-Arc vorbereitet, nicht automatisch gestartet.
- [ ] E2E-Smoke: Browserpfad von Band-4-Start bis mindestens Rally-Szene.

## Definition of Done für „viertes Band technisch umgesetzt“

- Ein abgeschlossener Band-3-Spielstand bietet einen freiwilligen, klar erkennbaren Band-4-Start.
- Sichtbare Storytexte verwenden Canon-Namen oder neutrale Rollen, keine neuen erfundenen NPC-Namen.
- Gobta/Gobota ist als früher Begleiter etabliert; Ranga ist als früher Companion und Scout-/Reiseanker etabliert.
- Ranga ist im Band-4-Finale vollwertiges Kampfmitglied.
- Gobta/Gobota erhält im Bündnisrat eigene Dialogentscheidungen.
- `ancestors-choice` läuft vollständig durch Bündnis, Durchbruch, Konfrontation und Entscheidung.
- Die drei Entscheidungen sind im UI verständlich, im Save unterscheidbar und im Codex nachvollziehbar.
- Die drei Entscheidungen verändern vorerst keine späteren Karten oder Folgequests.
- Der dritte Weg verlangt echte Bindungs-/Vertrauensvoraussetzungen.
- Band 5 wird als optionaler neuer Arc im Tempest-Hub vorbereitet.
- Typecheck, Unit-/Smoke-Tests und ein Browser-Smoke laufen grün.

## Getroffene Designentscheidungen

- Der sichtbare Band-4-Gegenspieler soll einem konkreten Canon-Arc zugeordnet werden.
- Ranga soll im Band-4-Finale als vollwertiges Kampfmitglied auftreten.
- Gobta/Gobota soll eigene Dialogentscheidungen im Bündnisrat bekommen.
- Die Entscheidung über Freiheit/Ordnung/geteilte Last soll vorerst keine späteren Karten oder Folgequests verändern.
- Band 5 soll als neuer optionaler Arc im Tempest-Hub starten, nicht direkt automatisch aus dem Ending.
