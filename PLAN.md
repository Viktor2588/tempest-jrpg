# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- Keine (alle kürzlich abgeschlossenen Phasen archiviert nach Merge).

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup (alle Phasen isoliert per AGENTS.md)

Worktrees werden strikt pro Phase unter `/worktree/tempest-phase-<nr>-<kurzname>` angelegt und nach erfolgreichem Merge + Aufräumen entfernt. Siehe AGENTS.md.

## Bugs
- zu viele punkte Geometrien nach abschluss von quests. (Untersucht 2026-07-10: Marker-Systeme korrekt — geräumte Encounter/eingesammelte Funde werden gefiltert, worldLayer wird pro Redraw geleert, Tile-Grid-Graphics einmalig gezeichnet. Kein reproduzierbarer Leak im Code; braucht Live-Browser-Repro / genauere Beschreibung.)

## Story-Roadmap (TODO: Story & Events fesselnder machen)

Befund (Code-Analyse): Die gesamte Story laeuft ueber statische, flag-gegatete
NPC-Dialogmenues; grosse Beats (Tempest-Benennung, Direwolf-Pakt, Schwuere)
erscheinen nur als Toast/Milestone-Banner NACH dem Moment (telling statt
showing). Die Welt reagiert nicht sichtbar: tempest-hollow sieht vor und nach
der Staatsgruendung identisch aus. Dialog-Choices sind Fortschritts-Gates,
keine Entscheidungen — bis zum Finale (3 Enden) hat keine Wahl sichtbare
Konsequenz. Karten-„Events" sind ausschliesslich Kampf-Trigger ('!'-Kacheln);
das staerkste Event-Muster (RangaJourney-Entdeckungen: Inszenierung + Fund +
Belohnung) existiert nur bei der Schnellreise. Canon-Regeln beachten:
deutsches Originalwording, canon-first, keine kopierten Dialoge.

Umgesetzt (2026-07-10, Inkr. 1–3): Karten-Events sind nicht mehr nur Kampf-Trigger — 10 Fundstellen über das Discovery-Muster (systems/mapDiscovery) decken JEDE erkundbare Region ab (nur reine Kampf-Karten Labyrinth/Kolosseum bewusst ohne), davon 7 sichtbare Weltfolgen an großen Beats (Tempest-Benennung, Ork-Katastrophe, Kijin-Benennung, Shizu-Kinder-Kern, Direwolf-Pakt, Veldora-Schwur). Ergänzt die bereits vorhandene Wachstums-Tile-Umschaltung (overworldTileArt: wilderness→camp→village→city auf tempest-start). Der Befund „Welt reagiert nicht sichtbar"/„Events nur Kampf" ist damit adressiert. BEFUND-KORREKTUR (2026-07-10): „Beats nur als Toast" ist ueberholt — es gibt ein vollstaendiges SceneScript-System (data/scenes.ts, systems/sceneScript, in OverworldScene.getPendingScene gewired, test/sceneScript.test.ts): sechs grosse Beats (Hoehlen-Erwachen, Direwolf-Pakt, Tempest-Benennung, Geld-Sieg, Invasion-Abwehr, Erntefest) werden als Cutscene-light GESPIELT, die Zusammenfassung folgt erst danach. Zusammen mit der Wachstums-Tile-Umschaltung und den Weltfolge-Fundstellen sind Beats-als-Szene, sichtbare Weltreaktion und Nicht-nur-Kampf-Events ADRESSIERT. Umgesetzt (2026-07-10): konsequente Dialog-Entscheidung gebaut — die Tempest-Ausrichtungs-Wahl (NPC „Ratsversammlung" nach der Benennung) laesst den Spieler EINMALIG zwischen Wehrhaftigkeit/Wohlstand/Wissen waehlen; die Wahl schliesst die anderen aus (tempest.priority.chosen) und wird sichtbar am Ortsbild (genau ein Wahrzeichen: Wachturm/Marktplatz/Schriftenhalle ueber das Discovery-System). Canon-neutral, keine Kanon-Beats beruehrt. Damit sind ALLE Punkte der Story-Roadmap adressiert.

## Balance-Roadmap (TODO.md: Kaempfe zu leicht, Grind-Gefuehl, kein Schwung)

Befund (Headless-Sim, Auto-Battle, 5 Seeds, ohne Talente/Ausruestung):
Gleichlevel-Normalkaempfe enden 5/5 mit 100 % Party-HP (reiner Filler);
Mordrahn (L10) faellt einer L6-Party in 7 Zuegen per Verschlingen-Instant-Kill;
Geld (L16) verliert 5/5 gegen eine ausgeruhte L8-Party bei ~100 % Rest-HP.
Kernproblem: Heilung/Action-Economy >> Gegnerdruck; Devour entwertet Bosse;
Leveln ist dadurch bedeutungslos, Kaempfe fuehlen sich nach Pflicht-Grind an.

## Talent-Roadmap (Nutzerfeedback 2026-07-02: echte Spec-Baeume, Schmiede raus)

Befund (Code-Analyse + Nutzer-Designvorgabe): Die heutigen „Talente" sind nur
Punkte fuer Skill-Freischaltungen und flache Statboni, gerendert als Liste mit
unsichtbaren Voraussetzungen; kaijin/rigurd/ranga fehlen ganz in `SKILL_TREES`.
Designvorgabe des Nutzers: Echte Talentbaeume bestehen aus passiven Effekten
und Procs (Konterchance bei gegnerischem Physisch-Angriff, Ausweichchance,
+25 % physischer/magischer/Element-Schaden, mehr HP, Skill X loest
Kettenskill Y aus) in DREI exklusiven Spezialisierungsrichtungen pro
Kaempfer — wenige, maechtige Punkte, die spuerbar formen, wie ein Begleiter
kaempft. Wer Strang 1 waehlt, kann 2 und 3 nicht mitnehmen (Qual der Wahl).
Beispiel Benimaru: physisch („alle Physical-Talente") ODER Flammenmagie ODER
Flammen-Unterstuetzung/Team-Buffs. Ausserdem: die Schmiede Kaijin und Kurobe
verlassen vorerst das Kampfroster (bleiben Story-/Schmiede-NPCs).

## Kampf-Tiefe-Roadmap (Nutzer 2026-07-05: "interessanter machen")

Befund (Code-Analyse, nach Phase 80): Die Zahlen stimmen inzwischen (Balance-
Phasen 51–56, Anti-Aussitz-Eskalation Phase 80 gemergt) — Normalkaempfe kosten
~15–28 % HP, Bosse liegen mittig im Korridor, Aussitzen wird bestraft. Das
verbleibende "langweilig" ist **fehlende Entscheidungstiefe und Vielfalt**:
jeder Kampf hat dieselbe optimale Antwort (Schwaeche analysieren → ausnutzen →
sustainen). Die reichen Mechaniken (Analyse/Telegraph, Break, Devour, CT-Delay,
Reaktionen, Status) sind vorhanden, aber der Spieler *muss* sie nie waehlen.
Ziel der Roadmap: die vorhandenen Systeme vom optionalen Schmuck zum
notwendigen, belohnten Spiel machen. Reihenfolge = Prioritaet (oben zuerst).
Fundament: Phase 80 (Eskalation), 87 (Normalgegner-Archetypen: Mender + Rudel-
Raserei), 88 + 88b (build-relevante Kategorie-Resistenz/-Reflektor + Support-
Rallyer), 88c (Magie-Resistenz ON-ROUTE), 88d (Physisch-Resistenz +
`rally-cry`-Support-Check ON-ROUTE), 89 (gestaffelte Kampf-Teaching-Curve) und
86 (erste Out-of-Combat-Weltfolge per Post-Pakt-Fundstelle) sind gemergt.
Phase 85 (Reaktion als erspieltes Timing-Fenster: perfekt 0.25× / rechtzeitig
0.5× / verpasst voll, mit Tutorial-Beat) ist ebenfalls gemergt — aktive
Verteidigung ist jetzt ein sichtbarer Könnens-Moment.

## Erweiterungs-Roadmap (Nutzer 2026-07-06: umfangreichere Spielmechanik)

Befund (Code): Der Kampf-Moment traegt jetzt (Kampf-Tiefe-Roadmap 87/88/88b),
aber die Schichten drumherum fehlen. `tempestGrowth.ts` ist nur ein Label
(wilderness/camp/village/city aus Story-Flags) — keine Bevoelkerung, Ressourcen
oder Oekonomie. Crafting ist ein nie angeschlossener Faden: magic-ore/magisteel/
orc-tusk/geld-core/spirit-ember fallen als Drops an und werden von NICHTS
verbraucht (totes Inventar); Kaijin/Kurobe sind reine Story-NPCs; das Flag
`craft.smithing.unlocked` oeffnet nur einen Gold-Shop. Drei tote Schleifen
(kaempfen->Belohnung, erkunden->Fund, Tempest waechst) zeigen auf denselben
fehlenden Kern: Rimuru baut Tempest zur Nation. Non-Goals beachten: kein Backend/
PWA, kein Job/Klassen-System (Spec-Baeume bleiben das Progressionsmodell).
Empfehlung: Phase 91 (Schmiede), Phase 92 (Bewohner rekrutieren, Bestand +
Roster) und Phase 93 (Einrichtungen & Produktion) sind gemergt und schliessen
den toten Material-/Naming-/Wachstums-Faden — die Bewohner besetzen jetzt
rollenbasiert vier Einrichtungen, die pro Tempest-Rast deterministisch
Ressourcen (magic-ore/healing-herb/mana-drop/Gold) produzieren und die Schmiede
speisen. 94 und die Side-Options sind unabhaengig; als naechster Nation-Ausbau
bietet sich ein Folge-Inkrement zu 93 an (siehe unten).

### Nation-Arc: Folge-Inkremente zu Phase 93 (optional, kleiner Zuschnitt)

Phase 93b ist gemergt: die Kueche setzt bei der Tempest-Rast einen einmaligen
`defense-up`-Opening-Status fuer den naechsten Kampf und verbraucht ihn danach.

### Zweite Welle: Figuren, Endgame, Aussenwelt (Nutzer 2026-07-06)

Die drei JRPG-Pfeiler, die noch ganz fehlen: Figuren-Bindung, Endgame/Replay,
politische Aussenwelt. Empfehlung: 99 (Labyrinth) als naechster grosser Replay-Hebel.

- [x] Phase 99 — Das Labyrinth (Roguelike-Abstieg) (abgeschlossen, direkt auf main).
  Wiederholbarer Ramiris-Lauf: Ramiris-Dialog startet/bricht einen Lauf
  (`labyrinth.run.active`), drei riskante Etagen (`labyrinth-floor-1..3`) ohne
  Zwischenrast mit HP/MP-Carry, Loot speist die Schmiede. Deterministische
  Run-Logik in `systems/labyrinth.ts`, nutzt das vorhandene
  `region-ramiris-labyrinth.webp`-Banner. Akzeptanz erfüllt: Etagen-/Run-Logik
  headless getestet (test/labyrinth.test.ts), Labyrinth-Smoke grün.
  (Phase 101 — Welt-Uhr: abgeschlossen, siehe „Laufende Arbeit". Folge-Ausbau
  möglich: NPC-Verfuegbarkeit nach Tageszeit, wetterabhaengige Encounter-Tabellen.)

## Dritte Welle: Magicule-Oekonomie, benannte Offiziere & das Erwachen (Nutzer 2026-07-07: umfangreichere Spielmechanik)

Befund (Code + Canon-Abgleich): Die bestehende Roadmap deckt viele klassische
JRPG-Schichten ab (Felder 94, Arena 95, Jagd 96, Formation 97, Bande 98,
Labyrinth 99, Diplomatie 100, Welt-Uhr 101) — aber die **Tensura-eigenen
Kern-Fantasien, die Kampf und Nation verzahnen, fehlen strukturell**:
(1) Es gibt keine **Magicule-/Seelen-Ressource** — Verschlingen (Phase 84) und
Boss-Kills geben nur XP/Items/Skill, obwohl im Canon Macht *und das Benennen* an
Magicules haengen. (2) Bewohner (Phase 92) werden beim Verschlingen gratis
benannt und besetzen automatisch Einrichtungen (93); Benennen ist im Canon aber
eine **kostspielige Investition mit Machtsprung** — hier folgenlos. (3) Das
kanonische **Endgame — das Erwachen zum Daemonenlord / Erntefest (Massen-
Evolution der Nation)** existiert nur als Lore (`demon-lords`), nicht als
Mechanik; das einzige geplante Endgame ist das Labyrinth (99). Diese drei
schliessen die bereits gebauten toten Enden (Devour->Naming 84/92,
Nation-Produktion 93, Rimurus predator/sage/mimic-Specs) zu EINER Oekonomie mit
echtem Endgame-Machtsprung zusammen. Non-Goals gelten weiter (kein Backend/PWA,
kein Job/Klassen-System — Spec-Baeume bleiben das Progressionsmodell).
Reihenfolge = Abhaengigkeit: 102 ist Fundament fuer 103/104; 105 ist unabhaengig.
Zuschnitt bewusst klein halten (einfachste Loesung, die traegt) und jede
kampfberuehrende Phase gegen die Balance-Harness je Rimuru-Spec gruen fahren.

## Vierte Welle: Skill-Fusion, Skript-Bosse & Tempest-Invasion (Nutzer 2026-07-07: umfangreich)

Befund (Code-Abgleich, drei bestaetigte Luecken): (1) `fusion.ts`/`fusions.ts`
ist ausschliesslich die **Element**-Team-Mix-Fusion (`resolveElementFusion` ueber
zwei ElementTypes) — es gibt KEIN System, das gelernte/verschlungene *Fertigkeiten*
zu neuen oder Ultimate-Skills verschmilzt, obwohl das Rimurus zentralste
Canon-Fantasie ist (Predator->Voellerei->Beelzebub, Grosser Weiser->Raphael,
Kombination zu Ultimate Skills). (2) `battle.ts` kennt kein mid-fight
Combatant-Spawning — genau die Grundfaehigkeit, die Phase 82 als
„splitter/summoner deferred" vertagt hat; skript-getriebene Bossphasen fehlen
ebenso. (3) Die Nation (Bewohner 92 / Einrichtungen 93 / Offiziere 103) produziert
nur, wird aber nie bedroht — keine Invasion/Belagerung/Verteidigung, obwohl der
Falmuth-Ueberfall auf Tempest canonisch DAS Wendepunkt-Ereignis vor dem Erwachen
ist. Diese drei sind je eine grosse, eigenstaendige Schicht (Progression, Kampf,
Nation/Story), alle auf dem vorhandenen Motor und mit den frueheren Wellen
verzahnt. Non-Goals gelten weiter (kein Backend/PWA, kein Job/Klassen-System).
Reihenfolge: 108/109 unabhaengig; 110 setzt Offiziere (103) voraus und ist der
narrative Ausloeser fuer das Erwachen (104).

Hinweis: Der Plan ist inzwischen ausfuehrungs-, nicht planungsgebunden (20+ offene
Phasen). Diese Welle ist bewusst auf 3 starke Pfeiler begrenzt statt breiter.

## Fuenfte Welle: Skill-Raenge, Praedator-Perversion & Shizus Kinder (IDEEN.md, 2026-07-07)

Befund (Canon-Abgleich + Code, aus `IDEEN.md`): Der Skill-Layer ist flach —
`SkillDefinition` (types.ts) kennt kein Rang-Feld, obwohl die gesamte Tensura-
Machtfantasie auf der 4-Stufen-Leiter **Skill -> Extra Skill -> Unique Skill ->
Ultimate Skill** (Bedeutung, Einzigartigkeit, Staerke) beruht. Heute existieren
die Stufen unbenannt und vermischt: `great-sage`/Praedator sind faktisch Unique
Skills, die Signaturen (`signatures.ts`) faktisch ein Ultimate-Layer, aber
nichts sagt das dem Spieler oder dem System. Zweitens endet die Story derzeit
~Band 4 (Ahnenhueter-Finale); die vom Nutzer gewuenschten kanonischen Band-4-6-
Beats fehlen strukturell: (a) **Shizus Absorption -> Skill-Manipulation** (der
Nutzer nennt es „Degenerate/Perversion" und flaggt selbst „muss man
gegenchecken" — Canon ist Praedators *Voellerei/Gluttony*-Zweig + *Grosser
Weiser*: Skills rauben, kombinieren, manipulieren, sofern sie NICHT an
Existenz/Seele haengen), (b) **die Rettung von Shizus Kindern** (Andersweltler
der Freiheitsakademie, deren instabile Geist-Beschwoerung sie verzehrt), (c) das
**Labyrinth des Ramiris + Magiekoloss** und (d) die **Ingenieurskunst der
Geister** (Band-5-6-Magitech). Diese greifen ineinander: Shizu -> tiefere
Skill-Manipulation (Unique) -> Skill-Fusion (108) die Rang-Leiter hinauf ->
Ultimate beim Erwachen (104); die Kinder-Krise wird durch Geister-Technik
(Nation-R&D, 93-Linie) und die Geister des Labyrinths (99/Ramiris) geloest.
Non-Goals gelten weiter (kein Backend/PWA, kein Job/Klassen-System; Canon-first,
deutsches Originalwording, keine kopierten Dialoge). Reihenfolge = Abhaengigkeit:
111 ist Fundament fuer 112/104; 113 braucht Shizu (existiert) und wird von
114/115 aufgeloest. Phase 111 (Skill-Rang-System) ist gemergt — `SkillDefinition`
traegt jetzt `tier` (skill/extra-skill/unique-skill/ultimate-skill), alle Skills
sind kanonisch eingestuft (`great-sage`/Praedator = Unique, Milims Drachenkraft =
Ultimate) und die UI zeigt Rang-Glyphe + -Farbe; die Rang-Metadaten (`skillRank.ts`)
liefern die Grundlage fuers Gating in 112/104.

- [x] Phase 112 — Praedator-Perversion: Skill-Raub & -Kombination (Unique Skill)
  (abgeschlossen, direkt auf main). Umgesetzt: aktive „Rauben"-Aktion (BattleAction
  `steal`) — auf einem analysierten, verschlingbaren, nicht-seelengebundenen Gegner
  (kein Boss) wird die definierte Raub-Fertigkeit (`predatorStealSkillId` oder
  `devourSkillId`) in Rimurus Loadout gezogen, ohne ihn zu töten
  (temporär im Kampf, dauerhaft bei Sieg über die bestehende `mimicSkillIds` ->
  `learnedSkillIds`-Bankung). Seelen-Gating: Ultimate-Skills = seelengebunden (nicht
  raubbar), Bosse als Existenzen ebenfalls nicht beraubbar (`isStealableSkillId`/
  `stealableSkillFrom`). Story-gegated hinter der Shizu-Absorption (`story.shizu.vow`).
  Teil (b) Skill-Fusion-Vertiefung ergibt sich durch Komposition: geraubte Skills
  landen in `learnedSkillIds` und speisen die bestehende Skill-Fusion (Phase 108)
  entlang der Rang-Leiter (Phase 111). Akzeptanz erfüllt: Raub-/Seelen-Regeln +
  Analyse-/Boss-Gating headless getestet (test/predatorPlunder.test.ts), Kampf-
  Integration (kein Kill, kein Doppel-Raub), gegatetes „⊗ Rauben"-HUD, Kampf-Smokes
  grün, Balance-Harness unberührt (Rauben ist Spieler-optional).

## Bug-Translation Phases (aus Bugs-Liste übersetzt)

- [x] Phase 119 — Tastatur-Dialog-Navigation (in main integriert). Dialoge per Tastatur bedienbar (Pfeiltasten wechseln, Leertaste bestätigt, "weiter in der story" default-vorausgewählt außer bei echten Multi-Choice). Akzeptanz: Volle Tastatur-Navigation in DialogueScene/Menu, Accessibility-Smoke.
## Sechste Welle: Wissen, Sammeln & Meisterschaft (Plan 2026-07-10)

Befund (Code-Abgleich, keine offenen Phasen mehr — alle frueheren Wellen
102–120 sind auf `main` implementiert und die 628 Unit-Tests + Balance-Harness
sind gruen): Die reichen Kampf-Systeme (Analyse/Telegraph, Break, Devour, Steal,
Elementarfelder, Kategorie-Resistenzen) sind gebaut und liegen teils on-route
(Kampf-Tiefe-Roadmap 87–89), aber **ihre Belohnung endet mit dem Einzelkampf**:
„Analysieren" (Grosser Weiser) deckt Schwaechen/Telegraph NUR fuer den laufenden
Kampf auf — `analysisLevel` lebt in `BattleState` und wird nie persistiert. Es
fehlt der klassische JRPG-**Wissens-/Sammelpfeiler**: Besiegt-Zaehler existieren
(`defeatedEnemyCountsByEnemyId`, heute nur vom Kopfgeldbrett gelesen), werden dem
Spieler aber nirgends als Gegner-Kompendium gezeigt; der Codex hat sechs Modi
(Wissen/Verschlingen/Bewohner/Einrichtungen/Kopfgeld/Politik), aber **kein
lebendiges Bestiarium**. Damit gibt es keinen Grund, Analyse jenseits des
Pflichtmoments zu meistern, und keine dauerhafte Sammel-Schleife. Diese Welle
schliesst genau diese Luecke — ausschliesslich mit vorhandenen Daten (Gegner,
Schwaechen/Resistenzen, Analyse-Mechanik), OHNE neue Assets, mit bewusst
niedriger Komplexitaet. Reihenfolge = Abhaengigkeit: 122 ist Fundament (persistiert
das Wissen), 123 macht das Wissen im Kampf spuerbar, 124 ist ein optionaler
Sammel-Anreiz. Non-Goals gelten weiter (kein Backend/PWA, kein Job/Klassen-System;
canon-first, deutsches Originalwording).

- [x] Phase 122 — Lebendiges Bestiarium (Codex-Modus „🐾 Bestiarium")
  (abgeschlossen, direkt auf main). Umgesetzt: neuer siebter Codex-Modus, der
  jede erlegte Gegner-Art als Karte listet — Name, Level/Boss-Tag,
  Besiegt-Zaehler (aus dem bereits persistierten `defeatedEnemyCountsByEnemyId`)
  und, sobald mindestens EINMAL per „Analysieren" (Grosser Weiser) studiert, die
  aufgedeckten Kampfdaten (Schwaechen, Resistenzen, Element-/Kategorie-Reflektoren);
  unstudierte, aber besiegte Arten zeigen „???" als Anreiz. Neues persistiertes
  Feld `progression.analyzedEnemyIds`, am Kampfende im Sieg getallyt
  (`tallyAnalyzedEnemies`, gefuellt aus `battle.enemies` mit `analysisLevel > 0`),
  Save-Migration ueber `readStringArray` (alte Staende leer, keine Bruchgefahr).
  Reine Logik in `systems/bestiary.ts` (`buildBestiary`, headless). Codex-Modusleiste
  auf kompakte 7er-Reihe (11px, feste Breiten) umgestellt, damit alle Modi in eine
  Zeile passen. Keine neuen Assets. Akzeptanz erfuellt: Tally-/Reveal-Logik headless
  (`test/bestiary.test.ts`, 8 Tests — analysiert vs. nur besiegt vs. unbekannt,
  Sortierung, 0-Zaehler/Unbekannte gefiltert), Kampf-Tally-Wiring
  (`test/battleResult.test.ts` — studiert gebucht, unstudiert nicht), Save-Roundtrip
  (`test/save.test.ts`), typecheck ✓, 637 Unit-Tests ✓, build ✓, Desktop-E2E
  (Codex-Modusleiste + Bestiarium-Render) gruen, Balance-Harness unberuehrt
  (rein additive Persistenz).

- [x] Phase 123 — Bestiarium-Wissen im Kampf (bekannte Gegner starten aufgedeckt)
  (abgeschlossen, direkt auf main). Umgesetzt: `startBattle` nimmt optional
  `analyzedEnemyIds` und setzt beim Kampfstart fuer jeden Gegner, dessen `sourceId`
  bereits studiert ist UND der kein Boss ist, `analysisLevel` auf 1 (Schwaechen +
  Telegraph sofort sichtbar); Bosse (Existenzen) und noch nie studierte Arten
  bleiben bei 0. `BattleScene` reicht `progression.analyzedEnemyIds` durch.
  Reduziert das repetitive Analyse-Spam auf laengst studiertem Trash und belohnt
  vorheriges Studium, ohne die Boss-Entscheidungstiefe zu entwerten. Akzeptanz
  erfuellt: Battle-Init bootstrappt nur bekannte Nicht-Boss-Gegner
  (`test/bestiaryKnowledge.test.ts` — aufgedeckt vs. Boss bleibt 0 vs. kein
  Vorwissen), typecheck ✓, 640 Unit-Tests ✓, build ✓, Battle-E2E-Smoke gruen,
  Balance-Harness unberuehrt (Harness reicht kein Vorwissen durch → unveraendert).

- [x] Phase 124 — Sammel-Meisterschaft (optionaler Anreiz, kleiner Zuschnitt)
  (abgeschlossen, direkt auf main). Umgesetzt: fuenf kuratierte Jagdgruende
  (`systems/bestiaryMastery.ts` — Jura-Wildnis, Geistmoor, Jura-Schlachtfeld,
  Blumund-Umland, Freiheitsakademie) buendeln je ihre regionstypischen
  Nicht-Boss-Gegner. Sind alle Arten eines Jagdgrunds per „Analysieren"
  (persistiertes `progression.analyzedEnemyIds` aus Phase 122) studiert, zahlt
  der Kampf-Ergebnis-Pfad EINMALIG einen deterministischen Magicule-Fund ueber
  `grantMagicules` aus; ein Flag (`bestiary.mastery.<id>`) verhindert
  Doppelzahlung ueber Save-/Kampf-Grenzen. Der Sieg-Bildschirm zeigt
  „🐾 Jagdgrund gemeistert: …", die Bestiarium-Codex-Fusszeile „Jagdgruende m/n".
  Bewusst klein/optional; verzahnt Sammeln (122/123) mit der Magicule-Oekonomie
  (102), rein additive Spieler-Belohnung ohne Kampf-Balance-Effekt. Akzeptanz
  erfuellt: Vollstaendigkeits-Erkennung + einmalige Belohnung + Save-Roundtrip
  headless (`test/bestiaryMastery.test.ts`, 10 Tests — Teilfortschritt/
  Vollstaendigkeit, keine Doppelzahlung, Flag-Diff, Kampf-Integration,
  Export/Import-Roundtrip), typecheck ✓, 650 Unit-Tests ✓, build ✓,
  Bestiarium-Codex-E2E-Smoke gruen, Balance-Harness unberuehrt (Harness reicht
  kein Analyse-Wissen/keine Flags durch → unveraendert).

## Siebte Welle: Die Resistenz-Leiter & die Seelen-Oekonomie (Canon-Vertiefung, Plan 2026-07-10)

Befund (Code-Abgleich + `IDEE.md`-Kanon): Zwei kanonische Kern-Leitern aus der
Recherche-Notiz sind im Spiel noch nicht als Mechanik abgebildet, obwohl der
Motor alles Noetige bereits traegt:

(1) **Die Resistenz-Nebenleiter** `Resistenz -> Nullifizierung (Immunitaet) ->
Absorption` (IDEE.md §1) fehlt. `elementMultiplier` (systems/battle.ts) kennt
heute nur drei Stufen — Schwaeche (1.75×), Resistenz/Eigen-Element (0.5×),
neutral (1×). Es gibt kein **Nullifizieren (0×)** und keine **Absorption
(Treffer heilt statt schadet)**. Dadurch ist die optimale Kampf-Antwort
weiterhin „Element der Schwaeche spammen"; kein Gegner zwingt den Spieler, das
Element zu WECHSELN oder auf Physisch auszuweichen. Genau die Entscheidungstiefe,
die die Kampf-Tiefe-Roadmap sucht, liegt hier ungenutzt — die Datenfelder
(`weaknesses`/`resistances`/`reflectsElement`/`resistsCategory`) sind da, die
zwei oberen Resistenz-Stufen fehlen.

(2) **Die Seelen-Waehrung** (IDEE.md §3, Merksatz „Macht = Magicules (Ausbau) +
Seelen (Erwachen)") existiert nicht: das Erwachen/Erntefest (Phase 104) wird
allein ueber `AWAKENING_MAGICULE_COST` (Magicules) gegatet. Damit tragen
Magicules doppelt (Ausbau UND Erwachen), und Boss-Siege haben oekonomisch keine
eigene Bedeutung — sie geben nur XP/Items/Magicules wie jeder Kill. Der Kanon
trennt beides sauber: Namen/Ausbau kosten Magicules, das Erwachen erntet
**Seelen** (Massen-Evolution nach grossen Siegen).

Diese Welle schliesst genau diese zwei Luecken — ausschliesslich auf dem
vorhandenen Motor, mit vorhandenen Daten, bewusst niedriger Komplexitaet und
ohne neue Assets. Reihenfolge = Abhaengigkeit: 125 ist Fundament (Resistenz-
Leiter im Kampf), 126 verzahnt sie mit der Mimikry (Phase 105), 127 ist
unabhaengig (Seelen-Oekonomie). Non-Goals gelten weiter (kein Backend/PWA, kein
Job/Klassen-System; canon-first, deutsches Originalwording, keine kopierten
Dialoge). Jede kampfberuehrende Phase (125/126) wird gegen die Balance-Harness
je Rimuru-Spec gruen gefahren.

- [x] Phase 125 — Resistenz-Leiter: Nullifizierung & Absorption (Kampf-Tiefe +
  Canon-Fundament) (abgeschlossen, direkt auf main). Umgesetzt: `EnemyDefinition`
  und die Combatant-Sicht tragen `nullifies?`/`absorbs?`. In `applyDamage`
  (systems/battle.ts) schlaegt Absorption > Nullifizierung > Schwaeche/Resistenz:
  absorbiertes Element **heilt** das Ziel (halber Schaden, gedeckelt auf maxHP,
  Log „… absorbiert …"), nullifiziertes Element richtet **0** Schaden an (kein
  Mindest-1, Log „… ist immun gegen …"). Traeger: Ifrit **absorbiert Feuer**,
  Magiekoloss **nullifiziert Erde** (beide mit klaren Schwaechen → Pflichtpfad
  passierbar). Die Auto-Battle-KI und der Harness meiden absorbierte/immune
  Elemente (`scoreSkillTarget`: Faktor 0 + Absorptions-Strafe), sodass nie ein
  Absorber geheilt wird. „Analysieren" (Grosser Weiser) deckt die Leiter im Log
  auf; das Bestiarium (Phase 122) zeigt „Absorbiert/Immun" erst nach dem Studium
  (`BestiaryEntryView` um `nullifies`/`absorbs` erweitert). Ifrit-Boss-Tutorial
  angepasst. Akzeptanz erfuellt: Absorptions-Heilung/Deckelung + Null-Immunitaet
  + Auto-Meidung + Bestiarium-Aufdeckung headless (`test/elementResistanceLadder.test.ts`,
  8 Tests), Save-Roundtrip unberuehrt (Felder in statischen Gegnerdaten),
  typecheck ✓, 658 Unit-Tests ✓, build ✓, Battle-E2E-Smoke gruen,
  **Balance-Harness je Rimuru-Spec gruen** (Ifrit-Boss haelt den Korridor, die
  KI wechselt das Element).

- [x] Phase 126 — Mimikry erbt die Resistenz-Leiter (verzahnt 105 + 125)
  (abgeschlossen, direkt auf main). Umgesetzt: Nimmt Rimuru per Mimikry (Phase
  105) eine Element-Form an, erbt er defensiv das Resistenz-Profil der
  verschlungenen Quell-Art dieses Elements (`resistances`/`nullifies`/`absorbs`
  aus Phase 125) fuer die Dauer der Form; die Ifrit-Form absorbiert damit Feuer.
  Neue Combatant-Overlay-Felder `mimicResistances`/`mimicNullifies`/`mimicAbsorbs`
  (getrennt vom Grundprofil), gesetzt in `resolveMimicForm` (Quell-Art =
  verschlungene Gegner-Art mit passendem Element), geleert in `tickMimicForm`.
  `elementMultiplier` und die `applyDamage`-Absorptions-/Immunitaetspruefung
  beziehen die geerbten Profile mit ein; das Formwechsel-Log nennt die geerbte
  Absorption/Immunitaet. Damit gibt es einen echten taktischen Grund, eine Form
  gezielt zu WAEHLEN (z. B. Ifrit-Form gegen einen Feuer-Boss). Akzeptanz
  erfuellt: Vererbung/Entzug + Feuer-Absorption in der Ifrit-Form headless
  (`test/mimicForm.test.ts`, +3 Tests), keine Persistenz-Aenderung, typecheck ✓,
  661 Unit-Tests ✓, build ✓, Battle-E2E-Smoke gruen, **Balance-Harness
  unberuehrt** (Auto-Battle nutzt keine Mimik-Formen → Sims unveraendert; kein
  Soft-Lock, da die Absorption nur defensiv und zeitlich begrenzt ist).

- [x] Phase 127 — Seelen: die Erwachens-Waehrung (Endgame-Oekonomie, unabhaengig)
  (abgeschlossen, direkt auf main). Umgesetzt: neues persistiertes,
  nicht-negatives Feld `progression.souls` (Save-Migration ueber
  `readNonNegativeInteger`, alte Staende = 0). Nur **Boss-Siege** ernten Seelen
  (eine je erlegtem Boss, `calculateBattleSouls` — analog `calculateBattleMagicules`,
  aber ausschliesslich `enemy.boss && enemy.dead`). Das Erntefest
  (`canAwakenTempest`/`awakenTempest`) verlangt zusaetzlich zum Magicule-Preis
  `AWAKENING_SOUL_COST` (6) Seelen und verbraucht sie; die Ressourcenzeile und
  der Erntefest-Button (MenuScene) zeigen Magicules **und** Seelen getrennt.
  Damit tragen Boss-Kaempfe eine eigene Oekonomie und die Canon-Trennung „Ausbau
  (Magicules) vs. Erwachen (Seelen)" ist erfuellt. Akzeptanz erfuellt:
  Seelen-Ernte nur bei Bossen + Erwachen-Gate + Save-Roundtrip/Migration headless
  (`test/progression.test.ts`, `test/battleResult.test.ts`, `test/save.test.ts`,
  `test/invasion.test.ts` angepasst/ergaenzt), typecheck ✓, 664 Unit-Tests ✓,
  build ✓, Menue-E2E-Smoke gruen, keine Kampf-Balance-Beruehrung (rein additive
  Ressource + Gate).

## Achte Welle: Die Kontroll-Schicht erwacht (verifizierte tote Maschinerie, Plan 2026-07-11)

Befund (Code-Abgleich auf `main`, 664 Unit-Tests + Balance-Harness gruen): Die
Kampf-Engine traegt eine **vollstaendige, bereits getestete Hart-Kontroll-Schicht**
(`stun/sleep/freeze/paralyze/petrify/confuse/charm`, `types.ts:34-43`; Handling in
`battle.ts` ueber `HARD_SKIP_STATUSES`, `computeDisabled`, `wakeOnDamage`; KI-Bewertung
in `autoBattle.ts`) — aber **keine einzige Fertigkeit, Signatur, Fusion oder Opening
wendet diese Status je an** (Nachweis: die sieben Ids kommen ausserhalb von `types.ts`
nur im Motor `battle.ts`/`autoBattle.ts` vor, nie in `src/data/skills.ts` o.ae.). Die
gesamte Kontroll-Schicht ist toter Motor. Ebenso ist der `revive`-Item-Effekt
(`types.ts:88`, in `battle.ts:resolveItem` vollstaendig behandelt) definiert, aber
**kein Item nutzt ihn** — ein mitten im Kampf gefallener Verbuendeter ist
unwiederbringlich, obwohl der Motor Wiederbelebung kann. Und zwei volle
Party-Mitglieder (**Hakurou, Souei**) fehlen ganz in `RELATIONSHIPS`
(`data/progression.ts`) — sie erhalten null Bindungsboni, -szenen und Team-Attacken,
waehrend die anderen sieben eine volle Bindungs-Achse haben.

Diese Welle **aktiviert gebaute, bereits getestete Maschinerie mit fast reinen
Datenergaenzungen** (niedrigste Komplexitaet, hoechste Sicherheit) und adressiert
direkt das Kern-Feedback aus `TODO.md` (`Kaempfe zu leicht / Grind / kein Schwung`):
telegraphierte Gegner-Kontrolle zwingt zu Reihenfolge, Reaktion und Vorsorge statt
Schwaeche-Spam; Wiederbelebung/Reinigung geben die noetige Gegenspiel-Option und einen
neuen Gold-Abfluss. Non-Goals gelten weiter (kein Backend/PWA, kein Job/Klassen-System;
canon-first, deutsches Originalwording, keine kopierten Dialoge). Reihenfolge =
Abhaengigkeit: 128 (Wiederbelebung) ist Fundament/Vorsorge; 129 (Gegner-Kontrolle +
Reinigung) baut die Bedrohung samt Gegenmittel; 130 (Spieler-Kontrolle) ist die
offensive Aktivierung; 131 (Bindungs-Paritaet) ist unabhaengig und rein additiv. Jede
kampfberuehrende Phase (129/130) wird gegen die Balance-Harness je Rimuru-Spec gruen
gefahren.

- [x] Phase 128 — Wiederbelebung: das erste Revive-Item (abgeschlossen, direkt auf
  main). Umgesetzt: neues stapelbares Verbrauchs-Item `revival-elixir`
  („Wiederbelebungselixier", `effect: { kind: 'revive', amount: 80 }`, Preis 320) in
  `data/items.ts`; belebt im Kampf einen kampfunfaehigen Verbuendeten mit 80 LP wieder
  ueber den bereits vollstaendig vorhandenen `revive`-Case in `battle.ts:resolveItem`
  (kein Motor-Eingriff). Kaeuflich in „Tempest-Vorrat" (gegated hinter
  `story.council.ready`) und bei der „Moorhaendlerin" (neuer Spaetspiel-Gold-Abfluss).
  Zero-Balance-Risiko (rein additive Spieler-Option; Auto-Battle-Harness nutzt keine
  Revive-Items → Sims unveraendert). Akzeptanz erfuellt: Kampf-Revive-Integration
  headless (`test/battle.test.ts` — kein Revive auf Lebende + keine Verbrauch,
  Teil-LP-Deckel 80, Verbrauch bei Erfolg), Shop-/Item-Datenvalidierung
  (`test/qa.test.ts` gruen), typecheck ✓, 665 Unit-Tests ✓, build ✓.

- [x] Phase 129 — Gegner-Kontrolle erwacht + Reinigung (abgeschlossen, direkt auf
  main). Umgesetzt: fuenf neue telegraphierte Hart-CC-Gegner-Skills (`data/skills.ts`)
  aktivieren die gebaute, aber ungenutzte Kontroll-Schicht — `slumber-glow`→`sleep`
  (Akademie-Irrlicht), `blinding-feint`→`confuse` (Blumund-Bandit),
  `paralytic-howl`→`paralyze` (Alt-Direwolf), `crushing-blow`→`stun` (Oger-Krieger),
  `petrifying-gaze`→`petrify` (Magiekoloss, in `phase2SkillIds` → per Break
  telegraphiert). Bewusst maessvolle Chance (0.35–0.5) und **kurze** Dauer (1–2 Runden);
  `sleep` bricht bei Schaden (`wakeOnDamage`), `stun`/`petrify` nur 1 Runde. **Alle
  Traeger sind Nicht-Harness-Gegner** — der Balance-Korridor bleibt unberuehrt (bog-terror
  bewusst ausgespart, da ON-ROUTE). Als Gegenspiel neuer `cure-status`-Item-Effekt
  (`types.ts` + `battle.ts:resolveItem`, `CURABLE_STATUSES` entfernt negative Status,
  laesst Buffs stehen) plus das Item `purifying-water` („Läuterungswasser", 60 Gold,
  in fuenf Shops). Akzeptanz erfuellt: Status-Zufuegung (Irrlicht schlaefert Party ein),
  Cure-Entfernung (negativ raus, Buff bleibt, kein Verbrauch ohne Wirkung), Skill-Daten
  headless (`test/statusControl.test.ts`, 4 Tests), typecheck ✓, 669 Unit-Tests ✓,
  build ✓, **Balance-Harness gruen** (CC nur auf Nicht-Harness-Gegnern → Sims/Korridore
  unveraendert).

- [x] Phase 130 — Spieler-Kontrolle: gezielte CC-Fertigkeiten (abgeschlossen, direkt auf
  main). Umgesetzt: zwei neue Spieler-CC-Skills (`data/skills.ts`) — `iai-stillness`
  („Iai — Reglosigkeit" → `stun`, Chance 0.45/1 Runde) und `shadow-bind`
  („Schattenfessel" → `paralyze`, Chance 0.55/2 Runden). Bewusst als **tiefe
  Spec-Belohnung** ausgeliefert: sie haengen an den bestehenden Kapstein-Knoten
  `hakurou-iai-master` bzw. `souei-shadow-phantom` (requiredLevel 9). Der Spieler
  erspielt Kontrolle durch Spezialisierungs-Commitment (Qual der Wahl), statt sie
  geschenkt zu bekommen. **Balance-sicher by design:** die Auto-Battle-Harness
  schaltet ausschliesslich die priorisierten Knoten frei (Gobta ×2, Rimuru-Spec ×4) —
  diese beiden Kapstein-Knoten sind NICHT dabei, also erhaelt die Harness-Party die
  Skills nie und die Korridore bleiben unberuehrt. Akzeptanz erfuellt: Skill-Daten +
  Knoten-Verdrahtung headless (`test/statusControl.test.ts`), typecheck ✓,
  671 Unit-Tests ✓, build ✓, **Balance-Harness (beide Tests, je Spec) gruen**.

- [x] Phase 131 — Bindungs-Paritaet: Hakurou & Souei (abgeschlossen, direkt auf main).
  Umgesetzt: zwei neue `RELATIONSHIPS`-Eintraege (`data/progression.ts`) fuer die beiden
  bislang bindungslosen Kijin — `hakurou-benimaru` (Meister/Schueler) und `souei-shion`
  (Rimurus Klingen), beide Party↔Party und damit ueber den bestehenden Punkt-Pfad
  (beide aktiv im Kampf) sammelbar, im Stil der uebrigen Paare (drei Stufen mit
  Stat-Boni, Team-Attacke ab Stufe 2, Opening-Status `haste` + Perk ab Stufe 3 —
  Hakurou `counter` 8 %, Souei `dodge` 6 %; je zwei Bindungsszenen mit Flags). Damit
  haben alle neun Party-Mitglieder die volle Bindungs-Achse. Rein additiv; die Perks
  liegen auf der hoechsten Stufe (in der Harness-Route nicht erreicht) und die
  Stufe-1-Boni sind modest → **Balance-Harness (beide Tests, je Spec) gruen**. Akzeptanz
  erfuellt: eigene Bindung fuer Hakurou/Souei + Stufen-Boni headless
  (`test/progression.test.ts`), Datenvalidierung (`test/qa.test.ts`), typecheck ✓,
  670 Unit-Tests ✓, build ✓.

## Neunte Welle: Die Widerstands-Schicht antwortet (verifizierte tote Maschinerie, Plan 2026-07-11)

Befund (Code-Abgleich auf `main`, 671 Unit-Tests + Balance-Harness gruen): Die
Achte Welle hat die Hart-Kontroll-Schicht der Gegner geweckt (Phase 129/130) und
ihr mit dem `cure-status`-Item (Phase 129, `purifying-water`) ein **reaktives**
Gegenmittel gegeben. Es fehlt aber die zweite Haelfte jeder guten CC-Oekonomie —
**praeventiver Widerstand** — und zwei kanonische Bausteine liegen weiter als
tote, getestete Maschinerie:

(1) **Es gibt nirgends Status-Widerstand oder -Immunitaet.** `applySkillStatus`
(`systems/battle.ts:1722`) und `applyStatus` (`:2364`) fuegen negative Status
**bedingungslos** zu; der Motor kennt zwar die vollstaendige Negativ-Liste
(`DEBUFF_STATUSES`, `:371`) und die heilbare Liste (`CURABLE_STATUSES`, Phase 129),
aber **keinen Wurf, der einen Status abwehrt**, keine Immunitaet, kein
Ausruestungs-/Spec-Schutz. Das `TalentPerk`-System (`types.ts`, passive Procs auf
Combatants) traegt neun Perk-Arten — aber **keine defensive Status-Art**. Damit ist
die einzige Antwort auf die erwachte Kontroll-Schicht die reaktive Reinigung; es
gibt keinen Grund, in Zaehigkeit gegen Kontrolle zu investieren.

(2) **`freeze` und `charm` sind vollstaendig gebauter, aber ungenutzter
Hart-CC.** Beide Status werden im Motor komplett behandelt — `freeze` in
`HARD_SKIP_STATUSES`, `freeze`+`charm` in `WAKE_ON_DAMAGE_STATUSES`, beide in
`computeDisabled`/`statusLabel`/`removeExpiredStatuses` und in der KI-Bewertung
(`autoBattle.ts`) — aber **keine Fertigkeit, Signatur oder Fusion wendet sie je an**
(Nachweis: die Ids kommen ausserhalb `types.ts` nur im Motor vor). Die Achte Welle
hat fuenf der sieben Hart-CC-Status verdrahtet (`sleep/confuse/petrify/paralyze/stun`)
und diese zwei bewusst offen gelassen — sie sind der letzte tote Rest der
Kontroll-Schicht.

(3) **Rimurus kanonische Praedator-Unterfaehigkeit „Isolation" fehlt.** Canon
(IDEE.md §1: „Isolation (Isolate, neutralisiert Gift/Gefahr)") gibt der Slime-Natur
Gift-/Status-Neutralisierung — im Spiel hat Rimuru dafuer nichts, obwohl der
Praedator-Zweig (Phase 111/112) alle anderen Unterfaehigkeiten traegt.

Diese Welle **aktiviert gebaute, bereits getestete Maschinerie mit fast reinen
Datenergaenzungen plus einem kleinen, klar umrissenen Motor-Hook** (der
Widerstands-Wurf) und schliesst die CC-Oekonomie der Achten Welle: erst die
Widerstands-Schicht (Fundament), dann die letzten zwei toten Hart-CC als neue
Bedrohung (damit es etwas zu widerstehen gibt), dann Rimurus Isolation als
kanonische Immunitaet, schliesslich ein optionaler Ausruestungs-Schutz. Non-Goals
gelten weiter (kein Backend/PWA, kein Job/Klassen-System; canon-first, deutsches
Originalwording, keine kopierten Dialoge). Reihenfolge = Abhaengigkeit: 132 ist
Fundament (Widerstands-Perk + Motor-Hook); 133 gibt der Schicht ihre Bedrohung;
134 ist die kanonische Anwendung von 132; 135 ist unabhaengig/optional. Jede
kampfberuehrende Phase wird gegen die Balance-Harness je Rimuru-Spec gruen
gefahren; **alle CC-Traeger bleiben Nicht-Harness-Gegner** und die Widerstands-Perks
liegen NICHT auf den von der Harness freigeschalteten Knoten → der Korridor bleibt
unberuehrt.

## Zehnte Welle: Content & Endgame-Skalierung (Nutzer 2026-07-11)

Befund (Code): (1) Gegner-Vielfalt ist mit ~28 Arten schlank — Encounter-Pools
wiederholen sich. (2) `systems/labyrinth.ts` (`createLabyrinthRun`) baut Floors aus
einem FESTEN Pool OHNE Party-Skalierung → nach den ersten Leveln trivial, obwohl
`systems/enemyScaling.ts` die Skalierung fertig hat: `createScaledEnemyBattleUnits(
enemyIds, partyLevel, kind)` + `effectiveEnemyLevel` (mit `Math.max(base, …)` → nie
unter Basis) + `experienceFalloffMultiplier` (kein Overgrind-Farmen). (3) Verschlingen
ist einmalig: verpasst man den Devour eines Bosses (Basis-Chance 0.1, +0.45 nach Break),
ist die Art weg — obwohl `defeatedEnemyCountsByEnemyId` (besiegt) und `devouredSourceIds`
(verschlungen) „besiegt, aber nicht verschlungen" exakt berechenbar machen. Non-Goals
gelten weiter (kein Backend/PWA, kein Job/Klassen-System; canon-first). Reihenfolge:
147 ist Fundament (Skalierung), 148 baut darauf; 146 ist unabhaengig.

- [x] Phase 147 — Labyrinth skaliert party-relativ (Wiederholbarkeit traegt)
  (abgeschlossen, direkt auf main). Umgesetzt: `systems/labyrinth.ts` traegt jetzt
  `createScaledLabyrinthFloorUnits(enemyIds, partyLevel, depth)` — anders als reguläre
  Trigger-Encounter (gedeckelt auf Basis + 6) verfolgt das Labyrinth das VOLLE Party-Level
  plus einen Tiefen-Lead (`labyrinthFloorLevelLead`: Floor 1<2<3, +0/+1/+2), nie unter Basis
  (`labyrinthFloorEnemyLevel` mit `Math.max(base, …)`), damit ein Lauf auch nach vielen
  Leveln fordernd bleibt. Der XP-Falloff (`experienceFalloffMultiplier`) greift weiter →
  Overgrind bringt nichts. `BattleScene.buildEncounterEnemies` erkennt die drei
  Labyrinth-Etagen per `labyrinthEncounterDepth('labyrinth-floor-1..3')` und nutzt den
  neuen Pfad; alle uebrigen Encounter behalten die reguläre Skalierung (Phase 67). Akzeptanz
  erfuellt: Encounter→Tiefe-Mapping, Tiefen-Lead, party-relative + deterministische
  Skalierung mit Basis-Floor headless (`test/labyrinth.test.ts`, +4 Tests), typecheck ✓,
  699 Unit-Tests ✓, build ✓. Labyrinth ist off-route → Balance-Korridor unberuehrt (Harness
  reicht keine Labyrinth-Encounter durch).

- [x] Phase 148 — Boss-Echos: skalierte Revanche im Labyrinth zum Verschlingen
  (abgeschlossen, direkt auf main). Umgesetzt: neues persistiertes Feld
  `progression.devouredSourceIds` (Save-Migration via `readStringArray`, alte Stände leer),
  am Kampfende im Sieg als Union von `battle.devouredSourceIds` gebucht (`battleResult`).
  `systems/labyrinth.ts` wählt daraus deterministisch ein Echo: `eligibleBossEchoIds`/
  `selectLabyrinthBossEcho` liefern verschlingbare Bosse mit `defeatedEnemyCountsByEnemyId>0`,
  die NICHT in `devouredSourceIds` stehen (wertvollstes zuerst — höchstes Basislevel).
  `createLabyrinthBossEchoUnit` baut das Echo party-relativ skaliert (Phase 147) und
  verschlingbar (trägt `boss`/`devourable`/`devourSkillId` → Break gibt erneut +Devour-Chance,
  Sieg bucht es in `devouredSourceIds` → verschwindet). `BattleScene` hängt auf der tiefsten
  Etage (`labyrinth-floor-3`) das Echo an die Gegner an — NUR wenn eins existiert, sonst
  unverändert; keine neue Map, kein neues Venue. Akzeptanz erfuellt: Echo-Auswahl (Ein-/
  Ausschluss, Determinismus), skalierte verschlingbare Einheit, Persistenz-Roundtrip/Migration
  headless (`test/labyrinthEcho.test.ts`, 4 Tests), typecheck ✓, 715 Unit-Tests ✓, build ✓,
  **Balance-Harness gruen** (Labyrinth off-route → Korridor unberührt).

## Elfte Welle: Ausruestungs-Overhaul, Loot & Content-Aufwertung (Nutzer 2026-07-11)

Befund (Code + Nutzer-Vorgabe): Das Ausruestungssystem hat schon Slots (weapon/
armor/accessory), `statBonus`, Verzauberung (`enchantment`/`enchantEquipment`),
Set-Boni (`EQUIPMENT_SETS` mit `tiers`), Perks (Phase 135) und Crafting (Schmiede)
— aber KEINE Raritaet/Tier-Stufen, keinen Kern-Slot, kein Random-Roll-Loot und nur
14 Ausruestungsteile. Regionen (184 Bezuege) und Quests sind zahlreich, teils aber
duenn bestueckt. Nutzer-Vorgabe: Raritaet wie Diablo 3 — legendaer-EINZIGARTIG (mit
Signatur-Perk) vs. legendaer-SET; Kern-Slots (an die Magicule-/Seelen-Oekonomie
gebunden); Random-Roll-Loot (v.a. Labyrinth); mehr Gear/Sets. Content-Fokus: Items/
Ausruestung, duenne Regionen aufwerten, neue an Loot gekoppelte Nebenquests — KEINE
neuen leeren Karten. Non-Goals gelten weiter (kein Backend/PWA, kein Job/Klassen-
System; canon-first). Reihenfolge = Abhaengigkeit: 149 Fundament; 150/151 bauen
darauf; 152–154 sind Content auf dem neuen System.

- [x] Phase 149 — Raritaet/Tier-Fundament (legendaer-einzigartig vs. legendaer-Set)
  (abgeschlossen, direkt auf main). Umgesetzt: neuer Typ `ItemRarity`
  (gewoehnlich|selten|episch|legendaer|legendaer-set) + optionales Feld `rarity` auf
  `ItemDefinition`; reine Regeln/Metadaten in `systems/itemRarity.ts` (Farbe/Label fürs
  Menue, `rarityStatMultiplier`/`rarityEnchantCap` als vorwärtsgerichtete Loot-Budgets für
  151/152, `isLegendaryUnique`, `legendaryHasSignaturePerk`). Die 14 bestehenden
  Ausruestungsteile sind retrofittet (Klassifizierung, KEINE Stat-Änderung → Balance
  unberührt): Starter-Set `gewoehnlich`, Kijin-/Dwargon-Set `legendaer-set` (speist die
  `EQUIPMENT_SETS`-Tier-Boni), ork-cleaver `selten`, famine-charm/ember-signet/
  spirit-core-ward `episch`, ward-talisman `legendaer` (genau ein Signatur-Perk). Das
  Ausruestungs-Menue färbt den Item-Namen nach Raritaet und zeigt das Raritaets-Label.
  Akzeptanz erfuellt: Leiter/Farben/Budgets, Default-Fallback, Signatur-Perk-Regel für ALLE
  Items, Set-Zuordnung headless (`test/itemRarity.test.ts`, 7 Tests), typecheck ✓,
  706 Unit-Tests ✓, build ✓. Reines Fundament (keine neuen Items, keine Stat-Skalierung
  bestehender Teile) → Balance-Korridor unberührt.

- [x] Phase 150 — Kern-Slot (Magicule-Kern) (abgeschlossen, direkt auf main). Umgesetzt:
  vierter Slot `'core'` (`EquipmentSlot` + `ItemCategory` erweitert, `EQUIPMENT_SLOTS`),
  generisch über die bestehende Slot-Iteration verdrahtet (Stat-Bonus, Perks, Ausrüsten/
  Ablegen, Set-Erkennung laufen unverändert über alle Slots). `createPartyMember` und die
  Save-Normalisierung (`save.ts`) tragen `core` (Altstände ohne Feld → `null`, keine
  Bruchgefahr). Das Ausruestungs-Menue zeigt vier Slots (engere Panel-Abstände 190/+84,
  Höhe 76, Set-Zeile auf y=508) mit Slot-Label „Kern". Drei neue Kern-Items
  (`lesser-magicule-core` selten, `ember-magicule-core` episch, `soul-forged-core` legendär
  mit Signatur-Perk `status-resist`) mit massvollen Boni, thematisch an die Magicule-/
  Seelen-Oekonomie gebunden, im „Tempest-Vorrat" (gated hinter `story.council.ready`)
  kaufbar. Akzeptanz erfuellt: Slot-Wiring + Kern-Bonus + legendärer Perk + Kern-Daten +
  Save-Roundtrip/Migration headless (`test/coreSlot.test.ts`, 5 Tests), typecheck ✓,
  711 Unit-Tests ✓, build ✓, **Balance-Harness gruen** (Sim nutzt keine Ausruestung →
  Korridore unverändert).

- [x] Phase 151 — Loot mit FESTEN Affix-Pools pro Raritaet (abgeschlossen, direkt auf main).
  Umgesetzt: kuratiertes, deterministisches Affix-System (`systems/lootAffix.ts`) statt freier
  Zufalls-Rolls — endlicher Affix-Katalog (`statBonus`-/`TalentPerk`-Bausteine), je Raritaet
  ein FESTER Pool + feste Anzahl (gewoehnlich 0, selten 1, episch 2, legendaer 2 inkl.
  Perk-Pool). `rollEquipmentInstance(seed, baseId)` waehlt daraus DETERMINISTISCH und
  wiederholungsfrei. Eine leichte, NICHT-stapelbare Ausruestungs-Instanz speichert nur
  Basis-Item-Id + Affix-Ids, als String-Id kodiert (`loot|<baseId>|<affixe>`) → lebt OHNE
  Save-Migration in `equipment[slot]`/Inventar (save filtert Ids nicht). `resolveInstanceDefinition`
  synthetisiert Basis+Affix-`statBonus`/-Perks (Instanzen ohne Set-Bonus/Verzauberung). Ein
  zentraler Resolver in `menu.ts` (Inventar/Ausruesten/Anzeige) + `progression.ts`
  (`equipmentPerksForMember`) macht Instanzen ausruestbar — fuer bestehende Ids identisch zum
  Direktzugriff (rein additiv). `rollLabyrinthLootItemId(seed, table)` liefert den
  deterministischen Labyrinth-Drop aus dem Run-Seed. Instanz-Ausruesten laeuft end-to-end
  headless (equipItem → Boni + Perks). Balance-sicher: die Auto-Battle-Harness nutzt keine
  Ausruestung → Korridore unveraendert. OFFEN/FOLGE: die tatsaechliche Vergabe im Kampf-/
  Etagen-Reward-Fluss (Phaser `BattleScene`) ist noch anzubinden (nicht headless verifizierbar).
  Akzeptanz erfuellt: Affix-Pools + deterministische Auswahl + Instanz-Ausruesten headless
  (`test/lootAffix.test.ts`, 6 Tests), typecheck ✓, 737 Unit-Tests ✓, build ✓,
  **Balance-Harness gruen**.

- [x] Phase 152 — Mehr Gear & Sets (Content auf dem neuen System) (abgeschlossen, direkt
  auf main). Umgesetzt: neun neue Ausruestungsteile auf dem Raritaetssystem (149/150), rein
  additiv (keine Stat-Aenderung bestehender Teile): ein neues Legendaer-Set „Sturmgeist-Ornat"
  (`galewind-edge`/`stormweave-garb`/`zephyr-band` mit 2/3-Tier-Boni, in der Schmiede
  wiederholbar gefertigt), zwei legendaer-einzigartige Stuecke mit genau EINEM Signatur-Perk
  (`stormfang-blade` → devour-chance +15, `veldora-scale-ward` → max-hp +10 %, einmalige
  Rezepte) und vier mittlere Raritaeten (`spirit-oak-staff`/selten, `warded-brigandine`/episch,
  `swiftwind-boots`/selten, `resonant-core`/episch Kern) im „Tempest-Vorrat" kaufbar (gated
  `story.council.ready`). Items rendern als Text (kein Icon-System) → **keine neuen Assets
  noetig**. Balance-safe: die Auto-Battle-Harness nutzt keine Ausruestung → Korridore
  unveraendert. Akzeptanz erfuellt: Gear-/Raritaet-/Signatur-Perk-/Set-/Erspielbarkeits-Test
  headless (`test/gearContent152.test.ts`, 5 Tests), Datenintegritaet + Crafting + itemRarity
  gruen, typecheck ✓, 731 Unit-Tests ✓, build ✓, **Balance-Harness gruen**.

- [x] Phase 153 — Duenne Regionen aufwerten (Qualitaet statt neue leere Karten)
  (abgeschlossen, direkt auf main — Encounter-Vielfalt via Phase 146 nachgezogen).
  Teil-Umsetzung (direkt auf main): fuenf neue, an das Loot gekoppelte Fundstellen
  (`mapDiscovery`) auf duennen Regionen (bislang je nur 1 Fund) — spirit-highlands
  (Windgeist → `lesser-magicule-core`), ember-hollow (Restglut → `ember-magicule-core`;
  beide Kern-Funde gated hinter `story.council.ready`, damit die Magicule-Oekonomie nicht
  zu frueh anspringt), freedom-academy (→ `magisteel`), lizardman-marsh (→ `magic-ore`),
  blumund (→ `hipokte-herb`). Alle Fundstellen auf verifiziert begehbaren Kacheln
  (Daten-Integritaetstest deckt Begehbarkeit + echtes Belohnungsitem ab), canon-konforme
  Kurzlore, einmalig/flag-gegatet. Akzeptanz (Fundstellen-Teil) erfuellt: Gating/Belohnungen
  headless (`test/mapDiscovery.test.ts`), typecheck ✓, 716 Unit-Tests ✓, build ✓,
  **Balance-Harness gruen** (nicht kampfberuehrend). NACHGEZOGEN: die Encounter-Vielfalt
  ist mit Phase 146 geliefert — die neuen Archetypen besetzen jetzt zweite Zufalls-Encounter
  auf genau diesen duennen Regionen (spirit-marsh/spirit-highlands/blumund/freedom-academy).

- [x] Phase 154 — Neue Nebenquests, an Loot gekoppelt (abgeschlossen, direkt auf main).
  Umgesetzt: drei optionale Jagd-Nebenquests ueber das bestehende `QuestDefinition`-/
  Dialog-/Encounter-System, deren Belohnung gezielt die Welle-11-Ausruestung ausschuettet
  (erspielbarer Weg zum Gear jenseits von Drops): `emberforge-hunt` (Glutgrotte, Oger-Krieger)
  → `ember-magicule-core` (episch Kern) + `magic-ore`; `echomoor-blade-hunt` (Echsenmoor,
  Echsenkrieger) → `orc-cleaver` (selten Waffe) + `magisteel`; `highland-ward-hunt`
  (Schreingipfel, Mordrahn-Streuner) → `ward-talisman` (legendaer) + `spirit-ember`.
  Accept/Report haengen im `rigurd-act1`-Dialog (verfuegbar ab `story.council.ready` bzw.
  `story.act1.completed` fuer das legendaere Stueck); die Jagd laeuft ueber neue, per
  `sidequest.<x>.started`/`notFlag: cleared` gegatete Trigger-Encounter auf verifiziert
  begehbaren Kacheln der duennen Regionen (Welle 10/153), deren Sieg das `cleared`-Flag setzt
  und den Jagd-Schritt abschliesst. **Off-route:** die Jagd-Encounter stehen in KEINER
  Region-`encounterIds`-Liste → ambiente Regionsschwierigkeit + Balance-Harness unberuehrt.
  Akzeptanz erfuellt: Gear-Belohnung (echtes Ausruestungs-Slot-Gear, nicht `gewoehnlich`) +
  Flag-/Sieg-/Cleared-Wiring + Begehbarkeit + Off-route headless (`test/lootQuests.test.ts`,
  5 Tests), Datenintegritaet gruen (`validateGameData`/`dataIntegrity`), typecheck ✓,
  721 Unit-Tests ✓, build ✓, **Balance-Harness gruen**.

## Zwoelfte Welle: Die Loot-Schleife schliesst sich (Plan 2026-07-12)

Befund (Code-Abgleich auf `main`, 737 Unit-Tests + Balance-Harness gruen): Die Elfte
Welle hat das Ausruestungs-Fundament vollstaendig gebaut — Raritaets-/Tier-System
(149), Kern-Slot (150), das kuratierte Affix-/Instanz-Loot-System (151,
`systems/lootAffix.ts`: feste Affix-Pools je Raritaet, deterministischer Roll, kodierte
NICHT-stapelbare Instanzen, Instanz-Ausruesten via zentralem Resolver in
`menu.ts`/`progression.ts`), neues Gear + ein neues Legendaer-Set (152) und
loot-gekoppelte Nebenquests (154). Der zentrale, Diablo-artige Reiz — **zufaellig
gerollte Ausruestung aus Labyrinth-Laeufen** — bleibt aber unerreichbar, weil DREI
Enden noch offen sind:

(1) **Keine gerollte Instanz erreicht je den Spieler.** `rollLabyrinthLootItemId`
(Phase 151) ist rein gebaut und getestet, wird aber NIRGENDS aufgerufen — der
Kampf-/Etagen-Reward-Fluss (`BattleScene.drawResult`/`battleResult`) vergibt nur die
statischen `EnemyDrop`-Items und feste Encounter-`victoryEffects`. Das Affix-System ist
damit toter, verifizierter Motor (wie die Kontroll-Schicht vor Welle 8).

(2) **Instanzen sind im Menue nicht als Loot lesbar.** `getSortedInventory`/
`getEquipmentItems` liefern die synthetisierte Instanz-Definition (Basis+Affixe), aber
der MenuScene-Renderer faerbt den Namen nicht nach Raritaet (`rarityColor` existiert seit
149, wird nur fuer statische Items genutzt) und zeigt die gerollten Affixe nicht auf — ein
gerolltes „Sturmwind-Schneide (scharf, vital)" sieht aus wie ein gewoehnliches Item.

(3) **Boss-Siege haben keine eigene Loot-Bedeutung.** Boss-Kills ernten Seelen (127) und
Magicules (102), aber droppen — ausser den festen `EnemyDrop`-Kernen — kein gerolltes
Endgame-Gear; der Kern-Slot (150) hat keinen erspielbaren Roll-Nachschub.

Diese Welle **aktiviert das gebaute, getestete Affix-System und macht es sichtbar** —
mit reiner, headless-testbarer Reward-/View-Logik plus duennem Phaser-Wiring. Non-Goals
gelten weiter (kein Backend/PWA, kein Job/Klassen-System; canon-first, deutsches
Originalwording). Reihenfolge = Abhaengigkeit: 155 macht Drops real (Fundament), 156 macht
sie lesbar, 157 verzahnt Boss-Loot mit der Kern-/Seelen-Oekonomie. Jede kampfberuehrende
Phase bleibt **off-route** (Labyrinth/Boss-Drops sind Spieler-Belohnung, nicht Teil der
Story-Harness-Route) → Korridor unberuehrt; wird trotzdem gegen die Harness gruen gefahren.

- [x] Phase 155 — Labyrinth-Drops vergeben echte Loot-Instanzen (abgeschlossen, direkt auf
  main). Umgesetzt: `systems/labyrinth.ts` traegt drei kuratierte Basis-Gear-Loot-Tische je
  Tiefe (`LABYRINTH_LOOT_TABLES`; Tiefe 1 selten, 2 episch, 3 ausschliesslich legendaer) und
  die reine Funktion `rollLabyrinthFloorLoot(seed, depth)` — sie wuerfelt aus dem Kampf-Seed
  DETERMINISTISCH mit gedeckelter, tiefenabhaengiger Chance (0.15/0.25/0.4), und rollt bei
  Erfolg ueber das bestehende `rollLabyrinthLootItemId` (Phase 151) eine kodierte,
  nicht-stapelbare Ausruestungs-Instanz (sonst `null`; nur Tiefe 1..3 haben einen Tisch). Der
  Reward-Fluss (`applyBattleResultToSave`) nimmt optional `labyrinthLoot: { seed, depth }`,
  rollt bei Sieg und bankt die Instanz ueber die Inventar-Normalisierung. `BattleScene` leitet
  die Tiefe aus `labyrinthEncounterDepth(encounterId)` ab, reicht Seed+Tiefe NUR auf
  Labyrinth-Etagen durch und zeigt den Fund als „✦ Labyrinth-Fund: …" in der Sieg-Zeile
  (Instanzname via `resolveInstanceItem`). Bewusst niedrige Chance/kuratierter Tisch (kein
  offenes Farmen). Akzeptanz erfuellt: Loot-Tisch-Auswahl + Tiefe→Raritaet + Determinismus +
  gedeckelte Chance + Inventar-Bank (nur Sieg) headless (`test/labyrinthLoot.test.ts`, 5 Tests),
  `BattleScene`-Wiring, typecheck ✓, 742 Unit-Tests ✓, build ✓, **Balance-Harness gruen**
  (Labyrinth off-route → Auto-Battle-Harness reicht keine `labyrinthLoot`-Option durch →
  Korridor unberuehrt).

- [x] Phase 156 — Instanz-Anzeige im Menue (Raritaets-Farbe + Affix-Aufschluesselung)
  (abgeschlossen, direkt auf main). Umgesetzt: `InventoryItemView` (`systems/menu.ts`) traegt
  jetzt `rarity` (`rarityOf`) + `affixLabels` (neue Helferfunktion `instanceAffixLabels` in
  `lootAffix.ts`, dekodiert die Instanz-Id → Affix-Labels; fuer statische Items leer). Der
  Inventar-View faerbt Instanz-Namen nach ihrer Basis-Raritaet (`rarityColor`, Phase 149) und
  listet die gerollten Affixe als eigene Detailzeile („✦ scharf · vital"); die Ausruestungs-
  Slots zeigen die Affixe neben dem Raritaets-Label. `MenuScene.button` nimmt optional eine
  Textfarbe durch. Der Instanz-Name bleibt der SAUBERE Basis-Name — das Affix-Suffix ist aus
  `resolveInstanceDefinition` entfernt und wird ueberall explizit aufgeschluesselt (auch in der
  BattleScene-Loot-Zeile aus Phase 155). `ItemRarity` aus `../data` re-exportiert. Rein additive
  View-Daten; keine Balance-/Save-Beruehrung. Akzeptanz erfuellt: View-Daten (Raritaet +
  Affix-Labels an Instanzen, sauberer Name, statische Items unveraendert) headless
  (`test/instanceDisplay.test.ts`, 4 Tests), typecheck ✓, 746 Unit-Tests ✓, build ✓.

- [x] Phase 157 — Boss-Drops: gerolltes Kern-/Endgame-Loot (abgeschlossen, direkt auf main).
  Umgesetzt: `rollBossLoot(battle, seed)` in `systems/battleResult.ts` (reine Belohnungslogik
  analog `calculateBattleSouls`) — grosse Boss-Siege (`enemy.boss && enemy.dead`, nur bei
  Sieg) vergeben mit gegateter, deterministischer Chance (0.5, aus dem Kampf-Seed) eine
  gerollte Loot-Instanz aus einem kleinen, KERN-lastigen Boss-Tisch (`soul-forged-core`,
  `ember-magicule-core`, `resonant-core`, `veldora-scale-ward` — ausschliesslich episch/
  legendaer) ueber das generische `rollLabyrinthLootItemId` (Phase 151). `applyBattleResultToSave`
  nimmt optional `bossLoot: { seed }`, rollt bei Boss-Sieg und bankt die Instanz;
  `BattleScene` reicht den Kampf-Seed nur bei Sieg durch und zeigt „★ Boss-Beute: …" in der
  Sieg-Zeile. So bekommt der Kern-Slot (Phase 150) erspielbaren Roll-Nachschub und Boss-
  Kaempfe eine eigene Loot-Bedeutung neben Seelen (127)/Magicules (102). Akzeptanz erfuellt:
  Boss-Only-Gate (kein Trash/Flucht/Niederlage/lebender Boss) + Determinismus + kern-lastiger
  Tisch hoher Raritaet + gegatete Chance + Inventar-Bank (nur mit Option, nur bei Boss-Sieg)
  headless (`test/bossLoot.test.ts`, 4 Tests), typecheck ✓, 750 Unit-Tests ✓, build ✓,
  **Balance-Harness gruen** (bossLoot opt-in → Auto-Battle-Harness reicht keinen Loot-Seed
  durch → Sims unveraendert).

## Dreizehnte Welle: Die Loot-Werkbank — Vergleichen, Zerlegen, Umschmieden (Plan 2026-07-12)

Befund (Code-Abgleich auf `main`, 750 Unit-Tests + Balance-Harness gruen): Die Elfte/
Zwoelfte Welle haben das Loot-Fundament FERTIG gebaut UND angeschlossen — Raritaet/Kern/
Affix-Instanzen (149–152), gerollte Drops aus Labyrinth-Etagen (155) und Boss-Siegen
(157), sichtbar aufgeschluesselt im Menue (156). Damit fliesst jetzt ein stetiger Strom
gerollter Ausruestungs-Instanzen zum Spieler — aber der Motor drumherum hat DREI
verifizierte Luecken, die genau diesen neuen Strom unbrauchbar/undurchschaubar lassen:

(1) **Ausruesten ist blind.** Die Ausruestbar-Liste (`MenuScene.drawEquipment`,
`src/scenes/MenuScene.ts:591-604`) rendert je Kandidat nur „Name ×Menge" und ruft direkt
`equipItem` (`src/systems/menu.ts:202-237`); es gibt NIRGENDS eine Stat-Delta-Vorschau
(vorher/nachher) gegen das aktuell getragene Teil. Bei sonst gleichem Slot muss der Spieler
zwei Items im Kopf verrechnen — genau die Entscheidung, die ein Loot-System lesbar machen
muss, fehlt.

(2) **Loot-Instanzen sind unverkaeuflich UND unentsorgbar — der Stapel waechst ohne
Grenze.** `sellItem` (`src/systems/world.ts:580-598`) schlaegt eine Id nur im Sortiment des
Ladens nach (`buildShopView` iteriert `shop.itemIds`, `:543-554`); eine `loot|…`-Instanz
steht in keinem Sortiment → „Item kann hier nicht verkauft werden". Es gibt kein Salvage/
Zerlegen (kein Reverse-Pfad in `crafting.ts`), kein Verwerfen (`removeInventoryItem`,
`src/systems/inventory.ts:52-62`, wird nie spielerseitig aufgerufen), und keine Inventar-
Obergrenze (`normalizeInventoryStacks` deckelt nie). Der Spieler kann Beute NUR loswerden,
indem er sie traegt.

(3) **Tote Materialien + nicht-verzauberbare Instanzen.** `hipokte-herb` („Grundlage fuer
staerkere Traenke", `src/data/items.ts:109`), `healing-herb` (Kuechen-Output,
`src/data/facilities.ts:25`) und `wolf-fang-token` werden von KEINEM Rezept/keiner Forschung
verbraucht (Nachweis: nicht in `CRAFTING_RECIPES`/`research.ts`-Inputs) — totes Material.
Gleichzeitig tragen Loot-Instanzen bewusst `enchantment: undefined` (`lootAffix.ts:164`),
lassen sich also NICHT wie feste Teile verzaubern — ihre Affixe sind final gerollt und der
Spieler hat keinen Hebel, ein „fast perfektes" Stueck zu verbessern.

Diese Welle macht den frisch angeschlossenen Loot-Strom **beherrschbar und lohnend** — rein
auf dem vorhandenen Motor, mit vorhandenen Daten, bewusst niedriger Komplexitaet und ohne
neue Assets. Reihenfolge = Abhaengigkeit: 158 (Vergleich) ist unabhaengige reine View-Logik;
159 (Zerlegen) schliesst den Entsorgungs-/Material-Kreis (Fundament fuer Materialrueckgewinn);
160 (Umschmieden) gibt der Instanz-Beute den fehlenden Verbesserungs-Hebel und verbraucht die
zurueckgewonnenen Materialien. Non-Goals gelten weiter (kein Backend/PWA, kein Job/Klassen-
System; canon-first, deutsches Originalwording, keine kopierten Dialoge). **Keine Phase
beruehrt den Kampf** (alles lebt im Menue/an der Schmiede) → die Balance-Harness ist strukturell
unberuehrt; sie wird zur Sicherheit trotzdem gruen gefahren.

- [x] Phase 158 — Ausruestungs-Vergleich: Stat-Delta beim Ausruesten (abgeschlossen, direkt
  auf main). Umgesetzt: neue reine Funktion `equipmentStatDelta(member, itemId)` in
  `systems/menu.ts` liefert je Stat die Differenz zwischen Kandidaten-Item und dem aktuell im
  selben Slot getragenen Teil (leerer Slot → voller Kandidaten-Bonus; ueber den bestehenden
  `resolveItem`-Pfad werden Loot-Instanzen korrekt aufgeloest; nur geaenderte Stats, stabile
  Reihenfolge). `MenuScene.drawEquipment` zeigt neben jedem Ausruestbar-Eintrag die geaenderten
  Stats als kompakte ▲/▼-Liste (grün +, rot −, bis 4 Stats, Kuerzel via `STAT_ABBR`). Rein
  additive Anzeige; `equipItem`/Save/Balance unberuehrt. Akzeptanz erfuellt: Delta-Berechnung
  (leerer Slot = voller Bonus, Kandidat vs. getragen mit korrekten Vorzeichen, nicht-ausruestbar
  → leer, Instanz-Aufloesung Basis+Affixe) headless (`test/equipDelta.test.ts`, 4 Tests),
  typecheck ✓, 754 Unit-Tests ✓, build ✓.

- [x] Phase 159 — Loot zerlegen: Instanzen in Materialien (Salvage an der Schmiede)
  (abgeschlossen, direkt auf main). Umgesetzt: neue reine Funktion `salvageEquipment(context,
  itemId)` in `systems/crafting.ts` zerlegt ein Ausruestungs-Item aus dem Inventar
  deterministisch in Materialien, gestaffelt nach Raritaet (`rarityOf`, loest Loot-Instanzen
  ueber `resolveInstanceItem` auf): selten → 1× `magic-ore`, episch → 1× `magisteel`, legendaer/
  legendaer-set → 1× `magisteel` + 1× `spirit-ember`, `gewoehnlich` → nichts; entfernt das Item
  (`removeInventoryItem`) und bankt die Materialien (`addInventoryItem`). `salvageYield`/
  `salvageYieldLabel` liefern die Vorschau. Nur ausruestbare Items im Inventar sind zerlegbar
  (getragene Teile liegen NICHT im Inventar → automatisch geschuetzt; Nicht-Gear/fehlend
  abgelehnt). Neue smith-gegatete Schmiede-Unteransicht „Werkbank" (`forgeBench`-Umschalter in
  `MenuScene.drawForge` → `drawWorkbench`) listet die zerlegbare Beute (raritaets-gefaerbt) mit
  Ertrags-Vorschau und „Zerlegen"-Button, `CraftContext` aus `forgeContext()`. Schliesst die
  verifizierte Luecke unverkaeuflicher/unentsorgbarer Loot-Instanzen UND speist die (teils toten)
  Crafting-Materialien. Akzeptanz erfuellt: raritaets-gestaffelter Ertrag + Entfernen/Banken +
  Instanz-Aufloesung + Nicht-Gear-/Fehlend-Schutz + Vorschau-Label headless
  (`test/salvage.test.ts`, 5 Tests), typecheck ✓, 759 Unit-Tests ✓, build ✓, **Balance-Harness
  strukturell unberuehrt** (menue-/schmiede-only, nicht kampfberuehrend).

- [x] Phase 160 — Affix-Umschmieden: eine Loot-Instanz neu rollen (Schmiede) (abgeschlossen,
  direkt auf main). Umgesetzt: neue reine Funktion `reforgeInstance(seed, itemId)` in
  `systems/lootAffix.ts` wuerfelt fuer eine kodierte `loot|…`-Instanz die Affixe DETERMINISTISCH
  neu (gleiche Basis-Id + gleiche Raritaets-Regel → gleicher Pool/gleiche Anzahl ueber
  `rollEquipmentInstance`) und gibt die neue kodierte Instanz-Id zurueck (statische Items → null).
  `reforgeCost`/`reforgeEquipment` in `systems/crafting.ts`: Umschmieden kostet 1× `magisteel` +
  raritaets-abhaengiges Gold (40/80/140/220/200), verbraucht die in 159 zurueckgewonnenen
  Materialien (Kreislauf Beute → zerlegen → umschmieden) und ersetzt die Instanz im Inventar; nur
  echte Instanzen sind umschmiedbar (feste Teile tragen ihre kuratierten Affixe/Sets). Die
  Werkbank-Unteransicht (Phase 159) zeigt je Instanz einen „Umschmieden · <gold>G"-Button (Seed
  aus `Date.now()`, damit jeder Versuch neu, aber im Aufruf deterministisch ist; abgeblendet bei
  fehlendem Material/Gold). Akzeptanz erfuellt: Neuwurf gleicher Basis/Raritaet + Anzahl-Treue +
  Determinismus je Seed + Seed-Vielfalt + statische Items unberuehrt + Materialkosten/Inventar-
  Roundtrip + Ablehnung bei fehlendem Material/Gold headless (`test/reforge.test.ts`, 5 Tests),
  typecheck ✓, 764 Unit-Tests ✓, build ✓, **Balance-Harness strukturell unberuehrt** (menue-/
  schmiede-only, nicht kampfberuehrend).

## UX- und Welt-Backlog

- [x] Phase 165 — Sieben uebergrosse PNG-Assets als WebP ausliefern
  (abgeschlossen in `/worktree/tempest-phase-165-webp-assets`). Die sieben noch
  unkomprimierten, global vorgeladenen Rasterassets sind bei gleicher Aufloesung als
  WebP verdrahtet; Alpha des Magiekoloss-Cutouts bleibt erhalten. Asset-Gesamtgroesse:
  18.541.022 -> 2.410.884 Bytes (-87 %). Keine Art-/Layout-/Balance-Aenderung.
  Akzeptanz erfuellt: Provenienz/Imports/Format-Regressionstest, `git diff --check` ✓,
  typecheck ✓, 766 Unit-Tests inklusive Balance-Harness ✓, build ✓, vier fokussierte
  Desktop-Chromium-Smokes (Akademie, Kolosseum, Invasion, Labyrinth) ✓.
