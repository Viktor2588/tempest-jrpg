# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [~] Phase 97 — Formation/Reihen (in Bearbeitung, Worktree: /worktree/tempest-phase-97-formation)

## Integrationswarteschlange

- Keine offenen Integrationen.

## Bugs
- zu viele punkte Geometrien nach abschluss von quests.
- Rimururs Großer weiser & Verschlingen lässt sich nicht im kampf ausführen
- Talentbäume sind nicht alle verfügbar. manche sind gesperrt aus unbekannt>
- Talent punkte innerhalb einer Reihe können nicht anderweite vershoben wer>
<signalisieren.

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

### Kampf-Ausbau: Elementarfelder

- [ ] Phase 94 — Schlachtfeld-Zustand (Elementarfelder). Ein Feld-/Terrain-Zustand
  auf dem `BattleState`: ein Skill laedt das Feld elementar auf -> verstaerkt das
  passende Element, loest Reaktionen mit Status/anderen Elementen aus
  (brennend+Wind=Ausbreitung, Wasserfeld+Schatten=..., verzahnt mit der 21-Paar-
  Fusionstabelle). Element-Wahl wird Board-Control statt nur Schwaeche-Treffer.
  Rein logisch auf dem vorhandenen Element/Fusion/Status-Motor. Akzeptanz:
  Feld-Erzeugung/-Reaktion/-Abklingen headless getestet, HUD-Anzeige des Feldes,
  Balance-Harness fuer jede Rimuru-Spec gruen.

### Contained Side-Options (wiederholbarer Content, kleiner Zuschnitt)

- [~] Phase 97 — Formation/Reihen. Front-/Hinterreihe + Positionierung, damit die
  Party-Zusammenstellung mit den Gegner-Archetypen (Phase 87/88/88b) mehr zaehlt
  (z. B. Hinterreihe = weniger physischer Schaden, dafuer Reichweiten-Gating).
  (in Bearbeitung in `/worktree/tempest-phase-97-formation`)

### Zweite Welle: Figuren, Endgame, Aussenwelt (Nutzer 2026-07-06)

Die drei JRPG-Pfeiler, die noch ganz fehlen: Figuren-Bindung, Endgame/Replay,
politische Aussenwelt. Empfehlung: 99 (Labyrinth) als naechster grosser Replay-Hebel.

- [ ] Phase 99 — Das Labyrinth (Roguelike-Abstieg). Befund: greenfield; Battle-
  Engine + Scaling (67) + Archetypen (87/88/88b) sind da, aber Content ist
  einmalig-linear. Bauen: ein prozedural (deterministisch geseedet) aus
  vorhandenen Encounter-/Map-Bausteinen zusammengesetzter Etagen-Abstieg mit
  Run-Modifikatoren, eskalierender Tiefe und HP/MP-Carry ohne Zwischenrast
  (Risk/Reward). Run-Loot = Material/seltene Rezept-Inputs -> speist die Schmiede
  (91). On-theme (Ramiris' Dungeon), groesster Replay-/Endgame-Hebel. Akzeptanz:
  deterministische Etagen-Generierung + Run-Abbruch/Belohnung headless getestet
  (Seed-Reproduzierbarkeit), Balance-Sim fuer die Tiefenskalierung, Dungeon-Smoke.
- [ ] Phase 101 — Welt-Uhr (Zeit/Wetter). Overworld-Tag/Nacht + Wetter-Zyklus,
  der Encounter-Tabellen, NPC-Verfuegbarkeit und — verzahnt mit Phase 94 —
  Elementarfelder/Reaktionen beeinflusst (Regen = Wasserfeld, Nacht = Schatten-
  stark). Lebendige Welt + Erkundungs-Textur. Akzeptanz: deterministischer Zyklus
  + Encounter-/Feld-Einfluss headless getestet, Overworld-Smoke.

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

- [ ] Phase 105 (optional, kleiner Zuschnitt) — Mimikry als aktive Kampf-Form.
  Befund: `mimic` ist nur ein Spec-Zweig mit Passiv-Perks (resonance/master);
  die Predator-Mimikry aus dem Canon (eine verschlungene Form annehmen) fehlt als
  Aktion. Bauen: eine Aktion/Signatur, die fuer einige Zuege Rimurus Loadout/
  Element auf das eines **verschlungenen Gegners** umstellt (wiederverwendet die
  8-Slot-Loadout + `devourSkillIds`) -> On-Demand-Wechsel von Schadenstyp/Element.
  Macht den mimic-Strang zur aktiven Identitaet und ist die direkte Spieler-
  Antwort auf die resistsCategory/reflectsCategory-Archetypen (88/88b/88c/88d).
  Unabhaengig von 102-104. Akzeptanz: Form-Wechsel/-Ablauf headless getestet,
  Balance-Harness je Rimuru-Spec gruen, HUD-Anzeige der aktiven Form.

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

- [ ] Phase 109 — Skript-Bosse & Adds (mid-fight Beschwoerung, mehrphasige
  Inszenierung). Befund: Bosse haben phase2SkillIds + Archetyp-Flags, aber
  mid-fight Combatant-Spawning fehlt (Phase 82 „splitter/summoner deferred"), und
  echte skript-getriebene Bossphasen fehlen. Bauen: (a) eine Add-/Beschwoerungs-
  Mechanik — ein Boss-Skill/Flag spawnt zur Laufzeit zusaetzliche Combatants in
  den BattleState (die eine fehlende Grundfaehigkeit); (b) darauf skript-getriebene
  Bossphasen (bei HP-Schwelle: Add-Welle / Musterwechsel / Umgebungseffekt),
  datengetrieben. Reuse: BattleState/Combatant-Modell, escalation-/Archetyp-Muster.
  Macht die Endbosse zu echten Set-Pieces. WICHTIG: Hard-Termination-Guards fuer
  Sims/Tests erhalten (Spawns duerfen nicht endlos/kein Soft-Lock). Akzeptanz:
  Spawn/Phasenwechsel deterministisch + terminierend headless getestet, Auto-Battle
  kommt mit Adds klar, Balance-Harness je Rimuru-Spec gruen, HUD zeigt neue
  Combatants, Battle-Smoke.

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

- [ ] Phase 112 — Praedator-Perversion: Skill-Raub & -Kombination (Unique Skill).
  Canon-Check (Nutzerauftrag): die gewuenschte Faehigkeit ist kanonisch KEIN
  eigener Skill „Degenerate", sondern der *Voellerei/Gluttony*-Zweig von Praedator
  (rauben/zersetzen) + *Grosser Weiser* (kombinieren); ein Skill ist raubbar, wenn
  er nicht an Existenz/Seele gebunden ist (Bosse/Ultimate-Traeger sind es -> nicht
  raubbar). Bauen: (a) aktive „Rauben"-Praedator-Aktion — auf einem analysierten/
  verschlingbaren Gegner wird EIN nicht-seelengebundener Skill in Rimurus Loadout
  gezogen (temporaer im Kampf, dauerhaft bei Kill ueber `learnedSkillIds`); (b)
  Skill-Fusion (108) vertiefen: gelernte Skills entlang der Rang-Leiter (111) zu
  hoeherrangigen Skills verschmelzen. Story-gegated nach Shizu-Absorption (das
  bestehende `shizu-vow`-Quest-Ende schaltet die Perversion frei). Reuse: devour/
  analyze, `learnedSkillIds`, 108, 111. Balance: Ultimate-Ergebnisse spaet gaten,
  seelengebundene Skills als nicht-raubbar markieren. Akzeptanz: Raub-/Fusions-
  Regeln + Seelen-Gating headless getestet, Save-Migration, Balance-Harness je
  Rimuru-Spec gruen (Korridore halten), HUD der aktiven/geraubten Form + Smoke.
## UX- und Welt-Backlog

- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
- [ ] Content-Breite fuer "Schwung": 25 Gegner/25 Encounter fuer 4 Baende ist
  duenn, ebenso 3 Musik-Motive + 8 SFX. Mehr Region-Gegner (Vielfalt) und mehr
  CC0-Musik/SFX pro Region heben das Feel spuerbar — durch den CC0-Zwang aber
  begrenzt und niedrigerer Hebel als die Kampf-Tiefe-Roadmap.
