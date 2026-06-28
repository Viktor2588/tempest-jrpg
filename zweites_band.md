# Zweites Band – Plan für Story- und Content-Ausbau

## Leitlinie

Das zweite Band soll den abgeschlossenen Prolog in eine spielbare Aufbau- und Konfliktphase überführen. Tempest ist nicht mehr nur ein gerettetes Dorf, sondern eine junge Gemeinschaft mit Namen, Pflichten und sichtbaren Bindungen. Die Umsetzung bleibt eigenständig: keine 1:1-Adaption, sondern ein datengetriebener JRPG-Bogen über Rat, Grenzsicherung, erste Außenkontakte, Ahnenmagie und die Frage, was Tempest als Stadt zusammenhält.

## Projektregel: Originalnamen

Da das Projekt vorerst privat bleibt, sollen sichtbare Figuren und Begleiter mit originalen Tensura-Namen geführt werden. Neue erfundene NPC-Namen vermeiden. Bereits vorhandene Projektnamen wie `Sora`, `Vael`, `Lyrre` oder `Mordrahn` gelten ab jetzt als technische Altlast/Arbeitsplatzhalter und sollen vor der spielbaren Umsetzung durch Canon-Figuren, Canon-Begriffe oder neutrale Systemrollen ersetzt werden.

## Zielbild

- Band 1 endet mit `story.slime-prologue.completed` und startet `binding-of-ancestors`.
- Band 2 beginnt direkt danach in Tempest und macht die neue Siedlung spielerisch greifbar.
- Der zentrale Konflikt ist nicht nur ein stärkerer Gegner, sondern eine Belastungsprobe für Tempests erste Bindungen.
- Rimuru, Rigurd, Gobta/Gobota, Ranga und Shuna sollen klare Rollen im Flow bekommen.
- Gobta/Gobota ist ab Band 2 durchgehend früher aktiver Partybegleiter; Ranga begleitet Rimuru als Scout-/Reiseanker.
- Das Direwolf-Rudel aus Band 1 wirkt über Ranga als Folgeentscheidung weiter: Grenzschutz, schnelle Bewegung, Gobta-Progression.
- Der Band endet mit einer klaren Eskalation in Richtung `border-escalation` und bereitet einen größeren Folgekonflikt vor.
- Der Band bleibt zunächst bei der bestehenden Vorlage: Tempest/Hain als Kern, Moor/Schrein nur als vorbereitete Folgeorte.

## Aktueller technischer Anker im Projekt

| Bereich | Vorhandener Stand | Nutzung für Band 2 |
| --- | --- | --- |
| Hauptquest | `binding-of-ancestors` existiert und startet nach dem Prolog | Als Kernquest von Band 2 ausbauen |
| Folgequest | `border-escalation` existiert | Als Cliffhanger/Übergang zu Band 3 nutzen |
| Karten | `tempest-start`, `spirit-marsh`, `spirit-highlands` | Tempest-Hub erweitern, Moor/Schrein als spätere Band-2-Orte vorbereiten |
| Gegner | Technisch aktuell `mordrahn-echo`, `mordrahn-vanguard`, `lizardman-acolyte`, `spore-moth` | Sichtbar als namenloses Echo/Spuren führen, bis der Canon-Bogen feststeht |
| Progression | Shuna-/Gobta-/Rimuru-Linien mit Moor-/Schrein-Ankern | Band-2-Belohnungen an Bindung, Rat und Grenzschutz koppeln |
| Codex | Ahnenbindung, aktueller Echo-Platzhalter, Grenzfeuer und Orte existieren | Freischaltungen schärfer an Storybeats binden und sichtbare Fantasienamen entfernen |

## Namensmigration vor Umsetzung

- [x] `Sora` als sichtbaren NPC-Namen entfernen; Questführung stattdessen über Rimuru, Rigurd, Shuna oder den Großen Weisen lösen.
- [x] `Vael` und `Lyrre` als sichtbare erfundene NPCs vermeiden; ihre Funktionen auf Canon-Figuren oder neutrale Systeme verteilen.
- [ ] `Mordrahn` nicht als sichtbaren Canon-Ersatz verwenden; falls der Konflikt bleibt, als namenloses Echo/Systemphänomen führen, bis ein passender Canon-Bogen gewählt ist.
- [x] Ranga als frühen Begleiter in Dialogen, Codex und Progression explizit benennen.
- [x] Gobta/Gobotas story-gesteuerten Beitritt aus Band 1 übernehmen und in Band 2 nicht mehr auf eine automatisch vollständige Startparty vertrauen.
- [x] Interne IDs nur ändern, wenn es technisch sauber und testbar ist; sichtbare Namen haben Priorität.

## Umgesetzt in dieser Iteration

- [x] Sichtbarer Band-2-Hauptfluss läuft über Rigurd, Shuna, Gobta und Ranga statt über Sora, Vael und Lyrre.
- [x] Quest-/Step-IDs bleiben für Save-Kompatibilität stabil: `binding-of-ancestors`, `awakening`, `gather-council`, `clear-grove`, `defeat-mordrahn-echo`, `report-sora`.
- [x] Alte Kompatibilitätsflags bleiben intern erhalten und werden von Canon-Dialogen gesetzt: `story.vael.ready`, `story.lyrre.ready`, `bond.sora.*`, `bond.lyrre.*`.
- [x] Sora, Vael und Lyrre sind keine sichtbaren Band-2-NPCs mehr im Tempest-Hub.
- [x] Unit-, Smoke- und Browser-Tests laufen über die Canon-Route.

## Geplanter Storyflow

| Schritt | Spielbeat | Technische Umsetzung |
| --- | --- | --- |
| 1 | Tempest sammelt sich nach der ersten Benennung | `binding-of-ancestors` als aktive Hauptquest im Questlog priorisieren |
| 2 | Rimuru/der Große Weise erklärt, dass der Name der Stadt alte Siegel berührt | Dialogoption ohne erfundenen NPC-Namen: Step `awakening`, Codex `nameless-core` |
| 3 | Erster Rat von Tempest | Ratsszene mit Rigurd, Gobta/Gobota, Ranga und Shuna als sichtbare Beteiligte |
| 4 | Aufgaben werden verteilt | Drei kurze Sub-Beats: Vorräte, Ranga-Scout, Ahnenzeichen |
| 5 | Flüsterhain wird gesichert | Encounter `whispering-grove-ambush` als erster Band-2-Kampf |
| 6 | Das erste namenlose Echo erscheint | `shrine-approach` oder eigener Zwischenkampf als Warnung, noch nicht Finale |
| 7 | Tempest besiegelt seine Gründung | Abschlussdialog bei Canon-Anker/Rigurd, Belohnung über Bindungs-/Progressionsflags |
| 8 | Westgrenze meldet Feuer | `border-escalation` sichtbar starten, aber als nächster Band-Hook stehen lassen |

## Umsetzungspakete

### 1. Band-2-Start sauber inszenieren

- [x] Nach `slime-awakening` Abschluss nicht nur `binding-of-ancestors` starten, sondern den Spieler klar zum nächsten Canon-Anker führen: Rimuru/Rigurd/Shuna statt erfundenem NPC.
- [x] Questlog-Sortierung prüfen: `binding-of-ancestors` muss über Nebenquests stehen.
- [x] Tempest-Hub visuell nach dem Prolog verändern: weniger Notlager, mehr benannte Siedlung.
- [x] Kurzen Titel-/Loading-Hinweis für Band 2 ergänzen: „Eine Stadt braucht mehr als einen Namen.“

### 2. Rat von Tempest als spielbarer Hub-Beat

- [x] Ratsszene als Dialogkette oder eigenes `council`-Dialogschema anlegen.
- [x] Rigurd gibt Verwaltungs-/Versorgungsziel.
- [x] Gobta/Gobota und Ranga bringen Direwolf-Grenzschutz ein, falls `story.direwolf.pact` gesetzt ist.
- [x] Shuna bleibt zunächst Rat-/Ritualfigur und deutet Ahnen-/Schreinmagie an.
- [x] Kommende Grenzeskalation ohne neue erfundene NPC-Namen andeuten.

### 3. Drei kurze Aufbauaufgaben

- [x] Vorratsbeat: Shop/Heilpunkt/Gründerhilfe mit `bond.rigurd.trust-prologue` verknüpfen.
- [x] Grenzbeat: Ranga-/Gobta-Scout-Moment als frühe Schnellreise-/Scout-Mechanik vorbereiten.
- [x] Ahnenbeat: Codex-/Lore-Freischaltung über altes Siegel, nicht nur Dialogtext.
- [x] Alle drei Beats müssen Flags setzen, damit Dialoge danach sichtbar reagieren können.

### 4. Flüsterhain als erster Band-2-Kampfraum

- [x] Eigene Mini-Map oder klar abgegrenzten Bereich für den Flüsterhain anlegen.
- [x] Encounter `whispering-grove-ambush` als Band-2-Pflichtkampf prüfen und ggf. balancen.
- [x] Battle-Hintergrund für Hain/Echo-Störung ergänzen.
- [x] Kampf-Tutorial erweitern: Status, Magieschwäche und Teamleiste statt nur Angriff/Verteidigung.

### 5. Ahnenbindung und namenloses Echo

- [x] Technisches `mordrahn-echo` sichtbar nicht als erfundene Figur ausspielen, sondern als erstes klares Zeichen eines namenlosen Gegenspielers/Systemphänomens.
- [x] Vor dem Kampf Codex-Hinweis oder Schreinzeichen freischalten.
- [x] Nach dem Kampf passenden Codex-Flag setzen und Canon-Anker/Rigurd-Dialog aktualisieren.
- [x] Der Gegenspieler bleibt im zweiten Band nur als Echo/Spur erkennbar; keine neue erfundene Person sichtbar einführen.

### 6. Party- und Progressionsfolgen

- [x] Gobta/Gobota als festen frühen Front-/Scout-Begleiter im Band-2-Hauptflow berücksichtigen.
- [x] Shuna als Rat-/Ritualfigur in den Band-2-Flow holen und `shuna-ogre-line` sichtbar vorbereiten.
- [x] Gobtas Direwolf-Knoten über Ranga und `wolf-fang-token` im Menü verständlicher erklären.
- [x] Rimurus Bindungs-/Namensprogression mit `binding-of-ancestors` verknüpfen.
- [x] Erste Beziehungsboni nach Rat/Hain/Schrein sichtbar machen.

### 7. Präsentation

- [ ] Portraits/Platzhalter für Rimuru, Rigurd, Gobta, Ranga, Shuna und ggf. namenloses Echo prüfen.
- [x] Tempest-Hub nach Band-1-Abschluss mit neuen Markern/NPC-Reaktionen aktualisieren.
- [ ] Soundhinweise für Rat, Ahnenzeichen und Echo-Kampf differenzieren.
- [x] Codex-Neueinträge nach Freischaltung klarer signalisieren.

### 8. Tests und Gates

- [x] Headless-Smoke: Prologabschluss → Canon-Anker → Rat → Hain → Schrein-Echo → Questabschluss.
- [x] Test: `binding-of-ancestors` startet automatisch und bleibt priorisiert sichtbar.
- [x] Test: Direwolf-Pakt beeinflusst Band-2-Dialog oder Scout-Beat.
- [x] Test: Codex enthält nach Band 2 mindestens `nameless-core`, `tempest-council`, `binding-of-ancestors`, `ancestor-seal-warning`, `mordrahn`.
- [x] E2E-Smoke: Browserpfad vom abgeschlossenen Prolog bis zum ersten Band-2-Dialog.

## Definition of Done für „zweites Band technisch umgesetzt“

- Ein abgeschlossener Band-1-Spielstand führt ohne externe Anleitung zum nächsten Canon-Anker und in `binding-of-ancestors`.
- Tempest wirkt nach dem Prolog sichtbar verändert und reagiert auf den Direwolf-Pakt.
- Der Rat von Tempest ist ein spielbarer Storybeat, nicht nur ein Codex-Eintrag.
- Der Flüsterhain und das erste namenlose Echo liefern einen vollständigen Kampf-/Story-Mittelteil.
- Band 2 endet mit abgeschlossener Ahnenbindungs-Quest und einem klaren Hook auf `border-escalation`.
- Typecheck, Unit-/Smoke-Tests und ein Browser-Smoke laufen grün.

## Getroffene Designentscheidungen

- Band 2 bleibt bei der aktuellen Vorlage: Tempest/Hain ist der Kern; `spirit-marsh` und `spirit-highlands` bleiben vorbereitete Folgeorte statt voll geöffneter Band-2-Schauplätze.
- Shuna wird zunächst als Rat-/Ritualfigur aufgebaut, nicht sofort als aktive Partyfigur.
- Der aktuelle Gegenspieler-Platzhalter erscheint im zweiten Band nur als Echo; direkte Stimme, Projektion oder voller Auftritt bleiben späteren Bänden vorbehalten.
- Der Direwolf-Pakt soll über Ranga eine frühe Schnellreise-/Scout-Mechanik freischalten, nicht nur narrative Reaktionen.
- `border-escalation` startet am Ende freiwillig über einen Canon-Anker für die Grenzlage, nicht automatisch.
- Für sichtbare Namen gilt ab jetzt Canon-first: erfundene NPC-Namen werden nicht weiter ausgebaut.
