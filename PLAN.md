# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 120 — Content-Gegnerassets (abgeschlossen, Worktree: /worktree/tempest-phase-120-content-assets). Zwei repo-eigene generierte Battle-Cutouts (enemy-academy-wisp.webp, enemy-blumund-bandit.webp). Neue Gegner + Encounters in Blumund/Freiheitsakademie. In Worktree: typecheck ✓, 624 unit tests ✓, build ✓ (new sprites in dist/assets), E2E desktop smoke for Blumund+Academy asset saves ✓. Asset priority followed.
- [x] Phase 119 — Tastatur-Dialog-Navigation (abgeschlossen, Worktree: /worktree/tempest-phase-119-dialog-keyboard). Volle Tastatur-Navigation implementiert (Pfeile, Leertaste/Enter, default "weiter"). Akzeptanz erfüllt in DialogueScene.
- [x] Phase 101 — Welt-Uhr (Zeit/Wetter) (abgeschlossen, direkt auf main). Reine, deterministische Uhr (`systems/worldClock`) aus persistiertem Schrittzähler (`clockStep`) + Welt-Seed: Tageszeit (Morgen/Tag/Abenddämmerung/Nacht) + tagesstabiles Wetter (Klar/Regen/Nebel). Kampf-Konsequenz: Zeit/Wetter des Encounters bestimmen das Eröffnungs-Elementarfeld (Phase 94) — Regen=Wasser, Nacht=Schatten. Overworld-HUD zeigt Tageszeit + Wetter. Akzeptanz erfüllt: Zyklus/Determinismus + Encounter-/Feld-Einfluss headless getestet (test/worldClock.test.ts), Save-Roundtrip (test/save.test.ts), Overworld→Battle-Smoke grün.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Worktree-Setup (alle Phasen isoliert per AGENTS.md)

Canonical worktrees under /worktree/tempest-phase-*-* created/verified for pending and recent phases (asset priority 120+121 executed with full checks + E2E where applicable; others ready for parallel work):
- /worktree/tempest-phase-120-content-assets (asset phase, completed+verified)
- /worktree/tempest-phase-121-shuna-tempo (completed+verified in parallel)
- /worktree/tempest-phase-102-magicules
- /worktree/tempest-phase-103-offiziere
- /worktree/tempest-phase-104-erwachen
- /worktree/tempest-phase-113-shizus-kinder
- /worktree/tempest-phase-113-milim-fight
- /worktree/tempest-phase-114-geistertechnik
(Plus pre-existing for 94,97,99,101,105,109,112 etc. Old /home/viktor/worktree paths noted for future migration on merge.)

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
  `region-ramiris-labyrinth.png`-Banner. Akzeptanz erfüllt: Etagen-/Run-Logik
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

- [ ] Phase 123 — Bestiarium-Wissen im Kampf (bekannte Gegner starten aufgedeckt).
  Baut auf 122 auf: Beim Kampfstart bekommen Gegner, deren `sourceId` bereits in
  `analyzedEnemyIds` steht, ihren `analysisLevel` auf 1 vorgesetzt (Schwaechen +
  Telegraph sofort sichtbar), waehrend NEUE Arten und Bosse weiterhin frisch
  analysiert werden muessen (Boss-/Existenz-Gating wie bei Devour/Steal
  respektieren, damit Bosse spannend bleiben). Reduziert das repetitive
  Analyse-Spam auf laengst studierten Trash-Mobs und belohnt vorheriges Studium
  spuerbar, ohne die Boss-Entscheidungstiefe zu entwerten. Akzeptanz: Battle-Init
  bootstrappt `analysisLevel` nur fuer bekannte Nicht-Boss-Gegner (headless),
  Boss bleibt bei 0 (headless), Balance-Harness gruen (Story-Korridore
  unveraendert — Analyse war dort schon optionaler Vorteil), Kampf-Smoke gruen.

- [ ] Phase 124 — Sammel-Meisterschaft (optionaler Anreiz, kleiner Zuschnitt).
  Damit die Sammel-Schleife nicht rein kosmetisch bleibt: eine einmalige,
  deterministische Belohnung, wenn das Bestiarium einer Region vollstaendig
  (alle regionstypischen Gegner analysiert) ist — z.B. ein Magicule-Fund ueber
  das vorhandene `grantMagicules`/Discovery-Muster oder ein kleiner
  Schmiedematerial-Bonus. Bewusst klein und optional; verzahnt Sammeln (122/123)
  mit der Magicule-Oekonomie (102). Akzeptanz: Vollstaendigkeits-Erkennung +
  einmalige Belohnung headless getestet, Save-Roundtrip, keine Balance-Beruehrung.

## UX- und Welt-Backlog
