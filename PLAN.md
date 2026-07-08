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
Rallyer) und 88c (Magie-Resistenz jetzt ON-ROUTE, Korridor-Risiko harness-
erzwungen) sind gemergt. Phase 85 (Reaktion als erspieltes Timing-Fenster:
perfekt 0.25× / rechtzeitig 0.5× / verpasst voll, mit Tutorial-Beat) ist
ebenfalls gemergt — aktive Verteidigung ist jetzt ein sichtbarer Könnens-Moment.

- [ ] Phase 88d (Rest) — der `rally-cry`-Support-Check bleibt noch off-route.
  Erledigt: der Physisch-Resistenz-Zweig (`resistsCategory: 'physical'`, Sumpfschrecken)
  liegt jetzt ON-ROUTE im Pflichtkampf `border-rift-vanguard` (ersetzt den Lanzenträger,
  zwingt magischen Schaden) — Gegenstück zum Magie-Resistenz-Echo (88c). Alle Story-
  Korridore je Rimuru-Spec gruen, Regressions-Guard erweitert (beide Kategorien on-route).
  Messbefund (wichtig für den Rest): ein zweiter On-Route-Kategorie-Gegner auf demselben
  Border-/Alliance-Paar treibt den Sage-HP-Carryover in den späten masked-majin-Korridor
  (>0.9) bzw. — als 3. Gegner — den XP-/Level-Bogen aus dem Ruder (training-clearing/geld
  kippen). Der `rally-cry`-Support-Check (`reflectsCategory` bzw. Rufer, zwingt Kontrolle)
  braucht daher eine EIGENE Platzierung mit eigener Nachbalance, nicht das Border-/
  Alliance-Paar. Akzeptanz: alle Story-/Boss-Korridore je Spec gruen, Regressions-Guard.
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
Empfehlung: Phase 91 (Schmiede), Phase 92 (Bewohner rekrutieren, Bestand +
Roster) und Phase 93 (Einrichtungen & Produktion) sind gemergt und schliessen
den toten Material-/Naming-/Wachstums-Faden — die Bewohner besetzen jetzt
rollenbasiert vier Einrichtungen, die pro Tempest-Rast deterministisch
Ressourcen (magic-ore/healing-herb/mana-drop/Gold) produzieren und die Schmiede
speisen. 94 und die Side-Options sind unabhaengig; als naechster Nation-Ausbau
bietet sich ein Folge-Inkrement zu 93 an (siehe unten).

### Nation-Arc: Folge-Inkremente zu Phase 93 (optional, kleiner Zuschnitt)

- [ ] Phase 93b — Facility-Effekte jenseits reiner Ressourcen. Die aktuelle
  Produktion (Phase 93) liefert bewusst nur Material/Gold ins Inventar. Die im
  urspruenglichen Plan skizzierten Zusatz-Effekte fehlen noch: Kueche ->
  temporaerer Rast-Buff (Cooking, wirkt in den naechsten Kaempfen),
  Trainingshalle -> Reserve-XP/Catch-up statt mana-drop, Wache ->
  Encounter-Kontrolle (Rate/Vermeidung) statt reinem Gold. Braucht Verzahnung mit
  dem Rast-/Encounter-Fluss (nicht nur dem Menue-Knopf). Akzeptanz: Effekte
  headless getestet, Balance-Sim, Save-Migration, Smoke.
- [ ] Phase 93c — Produktion an einen echten Rast-/Reise-Trigger koppeln. Heute
  laeuft ein Zyklus ueber den "Tempest-Rast halten"-Knopf im Einrichtungs-Menue
  (spielerinitiiert, idle-artig). Alternativ/zusaetzlich: automatisch bei
  `restore-party` (Lager/Rast) bzw. Schnellreise abrechnen, damit die Nation auch
  im normalen Spielfluss produziert. Braucht residentIds im WorldState-Pfad.

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

- [x] Phase 104 — Das Erwachen / Erntefest (Endgame-Massen-Evolution). (abgeschlossen in `/worktree/tempest-phase-104-erwachen`; Checks: `git diff --check`, `bun run typecheck`, `bun run test`, `bun run build`, `bun run test:e2e -- --project=desktop-chromium -g "Phase 93"`)
  Befund: greenfield; „Daemonenlord" nur Lore. Bauen: ein **einmaliges, story-
  und magicule-gegatetes Erwachen** (spaet, nach Band 3; NG+-bewusst), das den
  angesparten Pool (102) verbraucht und (a) auf Rimurus Spec-Baeumen eine vierte
  **„Erwacht"-Stufe** bzw. eine Uebersignatur freischaltet (wiederverwendet
  evolution + signature) und (b) alle benannten Offiziere (103) eine Stufe
  evolviert (dauerhafter Einrichtungs- + Kampf-Boost). Der kanonische Endgame-
  Machtsprung, der 84/92/93/102/103 auszahlt — groesstes Endgame-/Replay-Ereignis
  neben dem Labyrinth (99). Akzeptanz: Gate (Story + Ressource) + einmalige
  Persistenz + NG+-Verhalten headless getestet, Evolutions-Anwendung
  deterministisch, Balance-Sim (Post-Erwachen sprengt die Korridore nicht),
  Erwachen-Szene ueber den sceneScript-Interpreter (62) + Smoke.
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

- [ ] Phase 108 — Skill-Fusion/-Evolution (Fertigkeiten verschmelzen zu einzig-
  artigen/Ultimate-Skills). Befund: nur Element-Team-Mix vorhanden, keine
  Skill-Verschmelzung (s. o.). Bauen: eine datengetriebene `SkillFusionRecipe`
  (Inputs = 2+ gelernte Skill-IDs, optional Material/Magicules aus 102; Output =
  ein neuer Skill), aufgeloest in einem reinen `systems/skillFusion`-Modul (analog
  crafting.ts): gegated ueber `learnedSkillIds` statt Gold; die Basis-Skills
  verschmelzen (aus dem Loadout entfernt, durch den fusionierten ersetzt).
  Persistenz ueber learnedSkillIds/eine neue uniqueStrings-Liste, Save-Migration
  automatisch. UI: „Verschmelzen"-Tab (analog Schmiede) im Skill-/Talent-Menue.
  Verzahnt mit 102 (Magicule-Kosten), 105 (Mimikry-Formen als Input), Devour-
  Kompendium (84). Balance: Ultimate-Skills spaet gaten. Akzeptanz: Rezept-
  Aufloesung + Verbrauch/Ersatz + Gating headless getestet, Save-Roundtrip +
  Migration, Balance-Harness je Rimuru-Spec gruen (Korridore halten), Menue-Smoke.
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
- [ ] Phase 110 — Tempest-Invasion & Verteidigung (die fehlende Bedrohungsschicht;
  Ausloeser fuer 104). Befund: Die Nation wird nie angegriffen (s. o.). Bauen: ein
  story-gegateter Invasions-/Verteidigungs-Arc — eine rivalisierende (menschliche)
  Armee greift Tempest an; der Spieler verteidigt in einer Encounter-Sequenz, in
  der die benannten Offiziere (103) als Verbuendete/Abschnittsverteidiger einge-
  setzt werden (reuse Ally-/Team-Mix-Pfad + Wellenstruktur der Arena 95), mit
  Folgen fuer Bevoelkerung/Produktion je nach Ausgang. Das Opfer/der Verlust
  triggert narrativ das Erwachen (104). Externe Bedrohungsseite zum internen
  Nation-Bau; wer angreift/hilft, kann an der Diplomatie-Reputation (100) haengen.
  Akzeptanz: Invasions-Gate + Verteidigungs-Sequenz + Ausgangsfolgen (Produktions-/
  Roster-Effekt) headless getestet, Save-Migration, Balance-Sim der Wellen, Szene
  ueber den sceneScript-Interpreter (62) + Smoke.

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
- [ ] Phase 115 — Das Labyrinth des Ramiris & der Magiekoloss (Set-Piece, Band 5-6).
  Befund: greenfield; das Labyrinth (99) und Skript-Bosse/Adds (109) sind geplant,
  aber Ramiris (Labyrinth-Meisterin) und der vom Nutzer gewuenschte Magiekoloss-
  Kampf fehlen. Bauen: Ramiris als Labyrinth-Rahmen (NPC/Story) + einen skript-
  getriebenen **Magiekoloss**-Waechterboss (reuse 109 Bossphasen/Adds + 94 Felder);
  das Labyrinth liefert die beherrschbaren Grossgeister, die 113/114 aufloesen.
  Setzt 99 (Etagen-Abstieg) + 109 (Skript-Bosse) voraus bzw. baut sie mit. WICHTIG:
  Hard-Termination-Guards fuer Sims/Tests (kein Soft-Lock durch Adds/Phasen).
  Akzeptanz: Koloss-Phasen deterministisch + terminierend headless getestet,
  Balance-Sim der Tiefenskalierung, HUD neuer Combatants, Dungeon-/Boss-Smoke.

## UX- und Welt-Backlog

- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
- [ ] Content-Breite fuer "Schwung": 25 Gegner/25 Encounter fuer 4 Baende ist
  duenn, ebenso 3 Musik-Motive + 8 SFX. Mehr Region-Gegner (Vielfalt) und mehr
  CC0-Musik/SFX pro Region heben das Feel spuerbar — durch den CC0-Zwang aber
  begrenzt und niedrigerer Hebel als die Kampf-Tiefe-Roadmap.
