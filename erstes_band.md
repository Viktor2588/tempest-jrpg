# Erstes Band – Story- und Content-Ausbau

## Leitlinie

Der erste Tensura-Storybogen soll technisch als spielbarer JRPG-Prolog funktionieren, aber mit eigenen Dialogformulierungen und eigener Spielstruktur. Ziel ist keine 1:1-Text- oder Panel-Adaption, sondern eine datengetriebene Umsetzung der groben Beats: Erwachen, erste Bindung, erstes Dorf, erste Bedrohung, erste Gründung.

## Projektregel: Originalnamen

Da das Projekt vorerst ein privates Hobbyprojekt bleibt, dürfen die originalen Tensura-Namen verwendet werden. Für bessere Orientierung sollen sichtbare Figuren, Orte und Begleiter künftig mit Canon-Namen geführt werden: Rimuru, Veldora, Rigurd, Gobta/Gobota und Ranga statt generischer oder erfundener Platzhalter. Bestehende technische IDs können intern vorerst bleiben, sichtbare Namen und Planungsdokumente sollen aber auf die Canon-Namen migrieren.

## Umgesetzt

- [x] Den ersten Tensura-Prolog story-technisch als spielbaren Questflow umsetzen: Höhlenerwachen, Sturmschwur, Goblindorf, Direwolf-Rudel und erste Benennung.
- [x] Quest `slime-awakening` mit fünf Schritten anlegen.
- [x] Orte `sealed-cave`, `goblin-village` und `direwolf-den` in die Weltkarte einhängen.
- [x] NPC/Dialog `sealed-storm-dragon` als Veldora-Prolog-Anker anlegen.
- [x] Rigurd um Prologoptionen erweitern: Goblin-Bitte und Siedlungsbenennung.
- [x] Triggerkampf `direwolf-pack-leader` mit neuem Gegner `direwolf-alpha` einbauen.
- [x] Key-Items `sealed-cave-crystal` und `wolf-fang-token` als persistente Questartefakte ergänzen.
- [x] Codex/Lore-Einträge für Prolog-Beats freischalten.
- [x] Headless-Smoke-Test für den kompletten Prologfluss ergänzen.
- [x] Neue Spielstände am Prolog-/Sturmdrachenpunkt starten lassen.
- [x] `first-patrol` bis nach dem Prologabschluss gaten.
- [x] `binding-of-ancestors` direkt nach `slime-awakening` starten und über den nächsten Storyanker fortsetzen.
- [x] Direwolf-Rudel als Fraktions-/Mount-/Gobta-Progressionsanker über Flags, Codex und Skilltree vorbereiten.
- [x] Headless-Smoke-Test für Prolog → Act 1 ergänzen.
- [x] Eigene Prolog-Kartenräume für Höhle, Goblindorf und Direwolf-Lichtung anlegen.
- [x] Travel-/Gateway-Übergänge zwischen Höhle, Dorf, Lichtung und Tempest definieren.
- [x] `bond.rigurd.trust-prologue` als späteren Dialogvorteil über Rigurds Gründerhilfe nutzen.
- [x] Datenvalidierung für verwaiste Quest-Schritte ergänzen.

## Aktueller Prologfluss

| Schritt | Spielbeat | Technischer Zustand |
| --- | --- | --- |
| 1 | Rimuru erwacht als Schleim in der Höhle | Karte `sealed-cave`; Dialogoption startet `slime-awakening`, setzt `story.slime.awakened` |
| 2 | Veldora, der versiegelte Sturmdrache, wird zum ersten Bindungsanker | Queststep `storm-dragon-oath`, Flag `story.storm-dragon.oath`, Item `sealed-cave-crystal`, Gateway zum Dorf |
| 3 | Goblins bitten um Schutz | Karte `goblin-village`; Rigurd-Option schließt Step `goblin-plea`, setzt `story.goblin.plea` |
| 4 | Direwolf-Rudel wird an der Lichtung gestellt; Ranga soll daraus als früher Begleiter hervorgehen | Karte `direwolf-den`; Trigger-Encounter `direwolf-pack-leader`, Gegner `direwolf-alpha` + `direwolf-pup` |
| 5 | Das Dorf erhält seinen ersten Namen | Rigurd-Abschluss setzt `story.slime-prologue.completed`, vergibt Gold und `wolf-fang-token`, öffnet Pfad nach Tempest |

## Nachtrag: Ranga und Canon-Namen

- [ ] Veldora als sichtbaren Namen für den Sturmdrachen verwenden, `sealed-storm-dragon` nur als interne ID behalten.
- [ ] Gobta/Gobota als frühen aktiven Begleiter einführen: Höhlenstart zunächst nur mit Rimuru, Beitritt nach der Goblin-Bitte oder spätestens nach der ersten Benennung.
- [ ] Aktuelles `startsInParty: true` für Gobta/Gobota durch einen story-gesteuerten Beitritt ersetzen, damit er nicht bereits in Veldoras Höhle mitläuft.
- [ ] Ranga nach dem Direwolf-Boss als frühen Begleiter einführen.
- [ ] `wolf-fang-token` und `story.direwolf.pact` mit Ranga statt nur generischem Direwolf-Rudel erklären.
- [ ] Ranga als Companion-/Scout-/Mount-Seed vorbereiten: zunächst Begleiter und Reiseanker, später Kampf- oder Mount-Funktion.
- [ ] Dialoge nach dem Rudelkampf so anpassen, dass die Unterwerfung/der Pakt zu Ranga als persönlichem Begleiter führt.
- [ ] Party-Reihenfolge testen: Rimuru allein → Gobta/Gobota tritt bei → Ranga wird nach dem Rudelkampf als Begleiter freigeschaltet.

## Nächste sinnvolle Ausbaustufen

### 1. Prolog als echter Start statt optionaler Weltinhalt

- [x] Neuen Spielstand näher an `sealed-cave` starten lassen oder einen Prolog-Startmodus einführen.
- [x] Erste Quest automatisch oder über den Sturmdrachen priorisiert im Questlog hervorheben.
- [x] Nach dem Sturmschwur den Weg zum Goblindorf visuell/UX-seitig klarer markieren.
- [x] Prüfen, ob `first-patrol` erst nach `slime-awakening` sichtbar werden sollte, damit der Einstieg sauberer wirkt.

### 2. Eigene Kartenräume statt drei Marker auf der Startkarte

- [x] Separate Mini-Map für die versiegelte Höhle bauen: enger Pfad, Kristallkammer, Sturmdrachen-Position.
- [x] Goblindorf als kleiner Hub mit Rigurd, Händler-/Heilpunkt und sichtbaren Schäden darstellen.
- [x] Direwolf-Lichtung als klare Bossarena mit offenem Zentrum und flankierenden Hindernissen gestalten.
- [x] Travel-/Gateway-Übergänge zwischen Höhle, Dorf und Hain sauber definieren.

### 3. Mehr spielbare Tutorial-Mechanik

- [x] Schleim-Erwachen als kurzes Tutorial für Bewegung, Interaktion und Questlog nutzen.
- [x] Sturmschwur als Tutorial für Codex/Lore-Freischaltung verwenden.
- [x] Direwolf-Kampf als erstes Boss-Tutorial für Schwächen, Buffs und Gruppenangriffe ausbauen.
- [x] Nicht-tödlichen Abschluss des Rudelkampfs darstellen: Sieg bedeutet Unterwerfung/Abkommen, nicht Auslöschung.

### 4. Party- und Bindungsfolgen

- [ ] Gobta/Gobota früh im Goblindorf als aktiven Begleiter beitreten lassen.
- [x] Nach dem Prolog Gobta klarer motivieren und mit Ranga einen Direwolf-Begleiter als frühe Bindungs-/Reiterfantasie vorbereiten.
- [x] Direwolf-Rudel als Fraktion ausbauen: Respekt-/Paktstatus, spätere Dialogreaktionen und eigene Codex-Fortschreibung.
- [x] Direwolf-Rudel als Mount-System vorbereiten: schnelle Reise, Spezialbewegung oder Kampf-Opening erst später aktivieren.
- [x] Direwolf-Rudel in Gobtas Progression einbinden: `wolf-fang-token` als Voraussetzung für Direwolf-/Gobta-Knoten prüfen.
- [x] `bond.rigurd.trust-prologue` in spätere Dialoge oder Shopkonditionen einfließen lassen.
- [x] `binding-of-ancestors` direkt nach Abschluss von `slime-awakening` starten oder als unmittelbar sichtbaren Storyanschluss erzwingen.

### 5. Präsentation

- [x] Portrait/Platzhalter für den versiegelten Sturmdrachen ergänzen.
- [x] Sturmdrache zunächst nur als Codex-/Dialoganker führen; keine aktive Party- oder Kampfrolle im frühen Spiel.
- [x] Spätere Rückkehr des Sturmdrachen als spielbarer Charakter für einen späteren Band/Arc vormerken.
- [x] Eigenes Battle-Background für Direwolf-Lichtung oder Höhle anlegen.
- [x] Kurze Startszene vor dem Titel/Overworld-Einstieg prüfen: Titel-Tutorial übernimmt den Startkontext, keine separate Szene nötig.
- [x] Soundhinweise für Schwur, Questabschluss und Rudelboss differenzieren.

### 6. Tests und Gates

- [x] Smoke-Test erweitern: Prolog → Act 1 Übergang in einem Flow prüfen.
- [x] Datenvalidierung um optionalen Check ergänzen: Quest-Schritte sollten mindestens einen Dialog oder Encounter haben, der sie abschließen kann.
- [x] E2E-Pfad ergänzen, sobald Startposition/UX final ist.

## Definition of Done für „erster Manga technisch umgesetzt“

- Der neue Spielstand führt den Spieler ohne Vorwissen durch Höhle, Sturmschwur, Goblindorf und Direwolf-Boss.
- Gobta tritt früh, aber erst nach dem Höhlenabschnitt bei; Ranga folgt nach dem Direwolf-Pakt.
- Jeder Storybeat ist im Questlog, in Flags und im Codex nachvollziehbar.
- Die Spielwelt zeigt die Stationen nicht nur als Datenmarker, sondern als unterscheidbare Räume.
- Der Prolog endet in einer klaren Gründungs-/Benennungsentscheidung und leitet sauber in die bestehende Tempest-Handlung über.
- Typecheck, Unit-/Smoke-Tests und ein Browser-Smoke laufen grün.

## Getroffene Designentscheidungen

- Der Sturmdrache bleibt im frühen Spiel nur Codex-/Dialoganker und kehrt erst in einem späteren Band/Arc als spielbarer Charakter zurück.
- Das Direwolf-Rudel soll alle drei Rollen tragen: eigene Fraktion, späteres Mount-System und Progressionsanker für Gobta.
- `binding-of-ancestors` soll direkt nach dem Prolog starten, nicht optional bei einem späteren NPC liegen bleiben.
- Sichtbare Namen sollen auf Canon-Namen migrieren: Veldora statt nur „Sturmdrache“, Ranga statt generischer Direwolf-Begleiter.
- Gobta/Gobota ist der erste frühe Partybegleiter; Ranga folgt als früher Companion nach dem Direwolf-Kampf.
