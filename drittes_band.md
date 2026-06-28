# Drittes Band – Plan für Story- und Content-Ausbau

## Leitlinie

Das dritte Band führt Tempest aus der inneren Aufbauphase an die Grenze. Nach Rat, Ahnenzeichen und erstem Echo wird sichtbar, dass Tempest nicht isoliert wachsen kann: Menschenpatrouillen, Sumpfwege, Gerüchte und eine feindliche Vorhut testen, ob die junge Stadt stark bleiben kann, ohne sofort zum Feindbild zu werden. Der Band soll als Grenz- und Vertrauensbogen funktionieren: ein Canon-Anker für die Grenzlage wird wichtiger, der Große Weise oder eine passende Canon-Figur liest die Risse, Gobta/Gobota und Ranga liefern Scout-/Schnellreise-Nutzen, und Tempest lernt, Konflikte kontrolliert zu gewinnen.

## Projektregel: Originalnamen

Wie in Band 2 gilt: sichtbare Figuren sollen Canon-Namen verwenden. Bestehende Projektnamen wie `Lyrre`, `Vael` und `Mordrahn` bleiben nur Arbeits-/Technikplatzhalter, bis die Band-3-Umsetzung auf originale Tensura-Namen oder neutrale Systemrollen migriert ist. Ranga ist der frühe Direwolf-Begleiter und der natürliche Anker für Scout- und Schnellreise-Mechaniken.

## Zielbild

- Band 3 startet freiwillig über einen Canon-Anker für die Grenzlage, nachdem Band 2 `story.act1.completed` gesetzt hat.
- Hauptquest ist `border-escalation` / „Grenzfeuer“.
- `spirit-marsh` wird jetzt als echter Band-3-Schauplatz geöffnet, nicht nur vorbereitet.
- Der Fokus liegt auf Grenze, Sumpfpfaden, Menschenkontakt und einer feindlichen Vorhut.
- Der Gegenspieler bleibt noch indirekt: Vorhut, Risse, Manipulation, aber kein finaler persönlicher Kampf.
- Der Direwolf-Pakt liefert über Ranga erstmals praktischen Nutzen über Scout-/Schnellreise-Mechanik.
- Gobta/Gobota bleibt aktiver früher Partybegleiter und bildet mit Ranga das Scout-Duo des Bands.
- Der Band endet mit `story.act2.completed` und einem klaren, aber freiwilligen Übergang zur nächsten Hauptquest bei einem Canon-Anker.

## Aktueller technischer Anker im Projekt

| Bereich | Vorhandener Stand | Nutzung für Band 3 |
| --- | --- | --- |
| Hauptquest | `border-escalation` mit fünf Steps existiert | Als kompletter Band-3-Questflow ausbauen |
| Start-NPC | Aktuell startet Lyrre `border-escalation` über `muster` | Sichtbar auf Canon-Anker migrieren; freiwilliger Bandstart, kein Autostart |
| Analyse-NPC | Aktuell hat Vael den `read-fracture`-Dialog | Sichtbar auf Canon-Anker oder Großen Weisen migrieren; Mitte des Bands: Grenzfunde deuten |
| Karten | `tempest-start`, `spirit-marsh`, `spirit-highlands` | `spirit-marsh` als Kernkarte öffnen, Hochland nur andeuten |
| Encounter | `marsh-frontier-clash`, `border-rift-vanguard` existieren | Pflichtkämpfe für Grenzschlag und Vorhut |
| Nebenquests | `border-runner`, `bounty-bog`, `marsh-cleansing`, `relic-echoes` | Optionaler Grenz-/Sumpf-Content rund um Band 3 |
| Folgequest | `ancestors-choice` startet nach `story.act2.completed` | Band-4-Hook, nicht mehr Band-3-Kern |

## Geplanter Storyflow

| Schritt | Spielbeat | Technische Umsetzung |
| --- | --- | --- |
| 1 | Ein Canon-Anker meldet Grenzfeuer | Dialogoption `Grenzlage hören` startet `border-escalation`, Step `muster` |
| 2 | Scout-Route wird geöffnet | Ranga-/Gobta/Gobota-Scout aktiviert Schnellreise oder Gefahrenvorschau zur Sumpfgrenze |
| 3 | Erste Patrouille an der Sumpfgrenze | Encounter `marsh-frontier-clash`, Step `border-clash`, Flag `story.border.cleared` |
| 4 | Canon-Anker mahnt kontrollierten Sieg an | Nachkampf-Dialog: Grenze halten, keine Eskalation provozieren |
| 5 | Großer Weiser/Canon-Anker liest Grenzfunde | Dialog `read-fracture`, Step `read-fracture`, Hinweis auf Verrat/Leck in Tempest |
| 6 | Sumpfpfad wird spielbar | `spirit-marsh` mit Händler, Gefahrenzone und optionalem Nebenauftrag öffnen |
| 7 | Feindliche Vorhut am Grenzriss | Encounter `border-rift-vanguard`, Step `break-vanguard`, Flag `story.vanguard.broken` |
| 8 | Die Grenze wird gesichert | Abschlussdialog `report-act2`, `story.act2.completed`, später auf Canon-Bindungsflag migrieren |
| 9 | Canon-Anker bereitet Bündnisfrage vor | `ancestors-choice` wird sichtbar, aber erst freiwillig gestartet |

## Umsetzungspakete

### 1. Freiwilliger Band-3-Start über Canon-Anker

- [ ] Sicherstellen, dass `border-escalation` nach Band 2 nicht automatisch startet.
- [ ] Aktuellen Lyrre-Start auf Canon-Namen/Systemrolle migrieren und als klaren Band-3-Start markieren.
- [ ] Questlog-Priorität setzen: aktive `border-escalation` über Nebenquests anzeigen.
- [ ] Titel-/Onboarding-Hinweis ergänzen: „Grenzen halten, ohne Feuer zu legen.“

### 2. Sumpfgrenze als neuer Kernraum

- [ ] `spirit-marsh` als Band-3-Karte zuverlässig über Gateway/Scout-Funktion erreichbar machen.
- [ ] `marsh-frontier` als sichtbaren Grenzpunkt mit Patrouillen- und Warnmarkern darstellen.
- [ ] `marsh-trader` als Versorgungsanker vor längeren Grenzkämpfen nutzen.
- [ ] Rückweg nach Tempest klar markieren, damit die Rissanalyse nicht verloren geht.

### 3. Direwolf-Scout- und Schnellreise-Mechanik

- [ ] Voraussetzung: `story.direwolf.pact` oder `mount.direwolf.seed`.
- [ ] Scout-Funktion zunächst klein halten: bekannte sichere Punkte zwischen Tempest, Dorf und Sumpfgrenze.
- [ ] Gobta/Gobota-/Ranga-Dialog einbauen, der die Mechanik erklärt.
- [ ] Gobta/Gobota bleibt aktives Partymitglied; Ranga läuft als Companion oder Reiseaktion, solange kein vollständiger Tier-Party-Slot existiert.
- [ ] Schnellreise nicht kampflos missbrauchen lassen: nur nach entdecktem Gateway oder abgeschlossenem Scout-Beat.
- [ ] Testen, dass alte Saves ohne Direwolf-Pakt nicht kaputtgehen.

### 4. Grenzkämpfe mit kontrollierter Eskalation

- [ ] `marsh-frontier-clash` als ersten Band-3-Pflichtkampf balancen.
- [ ] Sieg narrativ als Zurückdrängen/Entwaffnen darstellen, nicht als Massaker.
- [ ] Nachkampf-Dialog über Canon-Anker aktualisieren: Stärke und Fairness als Tempest-Prinzip.
- [ ] Battle-Hinweis für menschliche Gegner ergänzen: Status, Fokusziel, nicht nur Rohschaden.

### 5. Rissanalyse als Mittelteil

- [ ] Nach `story.border.cleared` den Analyse-Dialog deutlich markieren.
- [ ] `story.fracture.read` nicht nur als Step setzen, sondern mit Codex/Lore verbinden.
- [ ] Leck-/Verratsverdacht als Storyhaken formulieren, ohne sofort den Täter festzulegen.
- [ ] Nach der Analyse den `border-rift-vanguard`-Trigger sichtbar öffnen.

### 6. Feindliche Vorhut

- [ ] `border-rift-vanguard` als Band-3-Bosskampf inszenieren.
- [ ] Gegnergruppe `mordrahn-vanguard` + `human-lancer` auf Rolle und Schwierigkeit prüfen.
- [ ] Eigenes Battle-Background für Grenzriss/Sumpffeuer ergänzen.
- [ ] Nach dem Sieg `story.vanguard.broken` mit Codex-Eintrag zur Vorhut verbinden.
- [ ] Mordrahn als sichtbaren Namen vor Umsetzung ersetzen oder neutralisieren; der Gegenspieler bleibt indirekt: Befehle, Zeichen, Rissmagie, keine direkte Konfrontation.

### 7. Nebencontent rund um die Grenze

- [ ] `border-runner` als moralische Nebenquest stärker an den Band-3-Canon-Anker binden.
- [ ] `bounty-bog` als Versorgungs-/Handelsweg-Problem in Band 3 passend platzieren.
- [ ] `marsh-cleansing` optional vorbereiten, aber nicht zur Pflicht machen.
- [ ] Nebenquests dürfen `border-escalation` unterstützen, aber den Hauptflow nicht blockieren.

### 8. Party- und Progressionsfolgen

- [ ] Band-3-Vertrauen sichtbar machen: aktuelles `bond.lyrre.trust-1` auf Canon-Bindungsflag migrieren oder neutral als Grenzvertrauen führen.
- [ ] Gobta/Gobota-/Direwolf-Progression durch Scout-Mechanik im Skilltree klarer erklären.
- [ ] Rimuru erhält Grenz-/Bindungsprogression nach `story.fracture.read`.
- [ ] Shuna bleibt weiterhin Rat-/Ritualstütze, kann aber im Abschluss die Folgen der Risse deuten.

### 9. Präsentation

- [ ] Portraits/Platzhalter für Canon-Anker, Ranga, menschliche Patrouille und Vorhut prüfen.
- [ ] `spirit-marsh` visuell klar von Tempest/Hain unterscheiden: Nebel, Wasser, Grenzfeuer.
- [ ] Soundhinweise für Scout-Reise, Grenzkampf, Rissanalyse und Vorhut-Sieg differenzieren.
- [ ] Codex-Freischaltungen für `Grenzfeuer`, `Der zweite Riss` und die feindliche Vorhut klar signalisieren.

### 10. Tests und Gates

- [ ] Headless-Smoke: Band 2 abgeschlossen → Canon-Anker startet `border-escalation` → Grenze → Analyse → Vorhut → Abschluss.
- [ ] Test: `border-escalation` startet nicht automatisch nach Band 2.
- [ ] Test: Direwolf-Scout/Schnellreise ist nur mit passendem Pakt/Flag verfügbar.
- [ ] Test: `story.border.cleared`, `story.fracture.read`, `story.vanguard.broken`, `story.act2.completed` entstehen in korrekter Reihenfolge.
- [ ] Test: `ancestors-choice` wird nach Band 3 sichtbar, startet aber erst freiwillig beim Canon-Anker.
- [ ] E2E-Smoke: Browserpfad vom freiwilligen Grenzstart bis mindestens erstem Grenzkampf.

## Definition of Done für „drittes Band technisch umgesetzt“

- Ein abgeschlossener Band-2-Spielstand bietet bei einem Canon-Anker einen freiwilligen, klar erkennbaren Band-3-Start.
- Die Sumpfgrenze ist als eigener Spielraum erreichbar, lesbar und funktional von Tempest getrennt.
- Direwolf-Scout/Schnellreise ist spielbar, gated und im UI verständlich.
- `border-escalation` läuft als vollständiger Questflow durch Musterung, Grenzkampf, Rissanalyse, Vorhutkampf und Bericht.
- Die Kämpfe vermitteln kontrollierte Eskalation statt reiner Vernichtung.
- Der indirekte Gegenspieler wird über Vorhut und Rissmagie stärker aufgebaut, aber noch nicht final konfrontiert.
- Band 3 endet mit `story.act2.completed` und öffnet `ancestors-choice` nur als freiwilligen nächsten Schritt.
- Typecheck, Unit-/Smoke-Tests und ein Browser-Smoke laufen grün.

## Offene Designfragen

- Soll `spirit-marsh` in Band 3 vollständig geöffnet werden oder nur als Grenzstreifen mit späterer Moorvertiefung?
- Welche Canon-Figur übernimmt im Band-3-Hauptkampf die taktische Support-Rolle?
- Soll der Verrats-/Leck-Hinweis konkret auf eine Figur zeigen oder vorerst anonym bleiben?
- Soll die Ranga-Schnellreise über Menü, Gateway-Interaktion oder Gobta/Gobota-/Ranga-Dialog ausgelöst werden?
- Soll `ancestors-choice` nach Band 3 nur sichtbar werden oder aktiv als „Band 4 beginnt“-Hinweis im Questlog erscheinen?
