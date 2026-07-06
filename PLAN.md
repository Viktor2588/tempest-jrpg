# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- Keine laufende Arbeit.

## Integrationswarteschlange

- Keine offenen Integrationen.

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
Rallyer) sind gemergt.

- [ ] Phase 85 — Reaktionen als sichtbare, lehrbare aktive Verteidigung: die
  Timing-Block/Konter-Fenster (`perfect` = 0.25×/0.45×) existieren, sind dem
  Spieler aber kaum vermittelt. Sichtbar + lehrbar machen (Tutorial-Beat, HUD-
  Fenster), sodass Verteidigung ein Koennens-Moment wird. Verzahnt mit Phase 81
  (telegraphierter Big-Hit → perfektes Block-Fenster).
- [ ] Phase 88c — die build-relevanten Kategorie-Mechaniken (`resistsCategory`,
  `reflectsCategory`, `rally-cry`-Support-Check) zusaetzlich ON-ROUTE platzieren; bisher
  nur off-route (kein Korridor-Risiko). Braucht ggf. Anpassung der fixen Harness-Party,
  damit sie in jedem Rimuru-Spec beide Damage-Typen + Kontrolle sicher traegt.
- [ ] Phase 89 — Teaching-Curve der Kampf-Verben auditieren: analyze/break/
  devour/CT/fusion/reaktion/signature/telegraph/status ist eine Wand fuer neue
  Spieler. Pruefen (und ggf. staffeln), ob die Verben ueber die fruehen
  Encounter nacheinander eingefuehrt werden statt gedumpt. Phase 85 leistet das
  fuer Reaktionen — hier das Gesamtkonzept.
- [ ] Phase 86 (Cluster) — Out-of-Combat-Tiefe (knuepft an die Story-Roadmap
  oben an): Story-Konsequenzen vertiefen (mehr Verzweigungen mit sichtbarer
  Welt-/Shop-/Kampf-Folge, Richtung Phase 64) + Weltreaktivitaet/Entdeckung
  (Karten-Events jenseits von Kaempfen, sichtbar veraenderte Welt nach Bossen,
  Richtung Phase 65). Niedriger als Kampf-Tiefe, weil Kampf ~80 % der Spielzeit
  ist — aber der naechste Schritt, sobald die Kampfschleife traegt.

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
Empfehlung: 91 zuerst (schliesst den toten Material-Faden, Fundament fuer 92/93);
94 und die Side-Options sind unabhaengig und koennen dazwischen gezogen werden.

### Flaggschiff: Nation-Arc (Meta-Loop, optional, save-persistent, headless-testbar)

- [ ] Phase 91 — Die Schmiede (Crafting). Datengetriebenes `CraftingRecipe`
  (Inputs = Materialien + Gold -> Output = Ausruestung/Upgrade); Forge-Interaktion
  an Kaijin/Kurobe, die Inventar/Equipment/Enchantment wiederverwendet. Macht die
  toten Materialien + Boss-Cores (geld-core, spirit-ember) zu Verschlingen-/Jagd-
  zielen. Gating ueber das vorhandene `craft.smithing.unlocked`. Save-Migration
  (neue Rezept-/Freischalt-Flags). Kleinster Schritt, hoechster ROI, halb schon
  angelegt; zugleich erste Facility von Phase 93. Akzeptanz: Rezept verbraucht
  Inputs / gibt Output / respektiert Gating (Headless-Test), Menue-Smoke,
  Save-Roundtrip + Migration.
- [ ] Phase 92 — Bewohner (Residents). Verschonte/verschlungene Gegner per Naming
  als Bewohner rekrutieren (Tensura-Naming; knuepft an devour/naming/bonds).
  Save-State: Bewohnerliste mit Rolle/Herkunft + Roster-Ansicht. Noch keine
  Produktion, nur Bestand. Akzeptanz: Rekrutierung + Persistenz + Migration
  headless getestet, Roster-Smoke.
- [ ] Phase 93 — Einrichtungen & Produktion. Facilities (Schmiede, Kueche,
  Trainingshalle, Wache) nehmen Bewohner auf und produzieren pro Zyklus
  (Rast/Reise): Schmiede->Material/Rabatt, Kueche->Rast-Buffs (Cooking),
  Trainingshalle->Reserve-XP/Catch-up, Wache->Encounter-Kontrolle. Facility-Stufen
  koppeln an die tempestGrowth-Stufen. Schliesst die Schleife kaempfen/erkunden ->
  Material+Bewohner -> bauen/zuweisen -> Macht. Akzeptanz: Produktions-Zyklus
  deterministisch + balance-gesimt, Save-Migration, Facility-UI-Smoke.

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

- [ ] Phase 95 — Arena/Kolosseum. Wellen-Modus als Pruefstand fuer die tiefe
  Kampfmechanik; wiederverwendet Battle-Engine + Encounters; Raenge/Belohnungen
  (u. a. Material fuer die Schmiede). On-theme (Tensura-Turniere), wiederholbar.
- [ ] Phase 96 — Jagd-/Kopfgeldbrett. Erweitert das Verschlingen-Kompendium
  (Phase 84) zu wiederholbaren Auftraegen mit Material-/Gold-Belohnung -> speist
  die Schmiede (Phase 91).
- [ ] Phase 97 — Formation/Reihen. Front-/Hinterreihe + Positionierung, damit die
  Party-Zusammenstellung mit den Gegner-Archetypen (Phase 87/88/88b) mehr zaehlt
  (z. B. Hinterreihe = weniger physischer Schaden, dafuer Reichweiten-Gating).

### Zweite Welle: Figuren, Endgame, Aussenwelt (Nutzer 2026-07-06)

Die drei JRPG-Pfeiler, die noch ganz fehlen: Figuren-Bindung, Endgame/Replay,
politische Aussenwelt. Empfehlung: 98 (Bande) als bester Griff nach 91.

- [ ] Phase 98 — Bande (Bond-/Support-System). Befund: Relationships sind nur
  Punkte, Team-Mix-Fusionen haengen an `synergyPartnerIds`, es gibt keine
  Bond-Events. Bauen: optionale Bond-Szenen ueber den vorhandenen sceneScript-
  Interpreter (Phase 62), gegatet ueber Rast/Story/Relationship-Punkte; eine
  erreichte Bond-Stufe schaltet/verstaerkt Team-Mix-Partner + verleiht eine
  Bond-Perk (baut auf talentPerk). Charakter-Tiefe mit direktem Kampf-Payoff.
  Akzeptanz: Gating + Unlock + Perk headless getestet, Szenen-Runner-Test,
  Save-Migration, Dialog-/Szenen-Smoke. Risikoarm, hoher Hebel.
- [ ] Phase 99 — Das Labyrinth (Roguelike-Abstieg). Befund: greenfield; Battle-
  Engine + Scaling (67) + Archetypen (87/88/88b) sind da, aber Content ist
  einmalig-linear. Bauen: ein prozedural (deterministisch geseedet) aus
  vorhandenen Encounter-/Map-Bausteinen zusammengesetzter Etagen-Abstieg mit
  Run-Modifikatoren, eskalierender Tiefe und HP/MP-Carry ohne Zwischenrast
  (Risk/Reward). Run-Loot = Material/seltene Rezept-Inputs -> speist die Schmiede
  (91). On-theme (Ramiris' Dungeon), groesster Replay-/Endgame-Hebel. Akzeptanz:
  deterministische Etagen-Generierung + Run-Abbruch/Belohnung headless getestet
  (Seed-Reproduzierbarkeit), Balance-Sim fuer die Tiefenskalierung, Dungeon-Smoke.
- [ ] Phase 100 — Diplomatie (Faktionen/Reputation). Befund: Faktionen nur
  binaere Flags (faction.dwargon.allied, faction.orcs.joined) + ein
  partnerKind:'faction'; keine Skala. Bauen: graduelle Reputation pro Faktion
  (Dwargon, Echsen, Orks, Blumund, Daemonenlords), bewegt durch Entscheidungen/
  Quests/Handel; Schwellen schalten frei/zu: Faktions-Truppen als Kampf-
  Verbuendete/Team-Mix, Handelsrouten (speist die Nation-Oekonomie 93), exklusive
  Rezepte/Gegner. Externe Seite des Nation-Baus (91-93 intern); baut auf den
  vorhandenen faction.*-Flags. Akzeptanz: Reputationsuebergaenge + Schwellen-
  Unlocks + Save-Migration headless getestet, UI-Smoke.
- [ ] Phase 101 — Welt-Uhr (Zeit/Wetter). Overworld-Tag/Nacht + Wetter-Zyklus,
  der Encounter-Tabellen, NPC-Verfuegbarkeit und — verzahnt mit Phase 94 —
  Elementarfelder/Reaktionen beeinflusst (Regen = Wasserfeld, Nacht = Schatten-
  stark). Lebendige Welt + Erkundungs-Textur. Akzeptanz: deterministischer Zyklus
  + Encounter-/Feld-Einfluss headless getestet, Overworld-Smoke.

## UX- und Welt-Backlog

- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
- [ ] Content-Breite fuer "Schwung": 25 Gegner/25 Encounter fuer 4 Baende ist
  duenn, ebenso 3 Musik-Motive + 8 SFX. Mehr Region-Gegner (Vielfalt) und mehr
  CC0-Musik/SFX pro Region heben das Feel spuerbar — durch den CC0-Zwang aber
  begrenzt und niedrigerer Hebel als die Kampf-Tiefe-Roadmap.
