# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 75 — Menue-Smoke an zentrale Geometrie binden (Worktree
  `/worktree/tempest-phase-75-menu-smoke`): Party-Tausch-Smoke nutzt
  dieselben Layout-Konstanten wie `MenuScene`, damit Zentrierungen die
  Desktop-/Mobile-Abnahme nicht durch veraltete Klickkoordinaten brechen.
  Parallele Worktrees koennen per `PLAYWRIGHT_PORT` einen eigenen Vite-Port
  nutzen. Abnahme/Checks: `git diff --check`; `bun run typecheck`; `bun run
  test` (352 Tests); `bun run build`; `PLAYWRIGHT_PORT=4175 bun run test:e2e
  -- --grep "Party-Menü" --project=desktop-chromium
  --project=mobile-chromium --workers=1 --timeout=60000` (2 Tests).

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

- [ ] Phase 62 — Szenen-Skripte (Cutscene-light): kleines datengetriebenes
  Skriptsystem fuer inszenierte Momente in der Oberwelt (Schrittliste: Akteur
  bewegen/drehen, Emote, Kamera-Schwenk, Textbeat, Item-Uebergabe, Pause);
  Interpreter Phaser-frei testbar, Darstellung in OverworldScene. Die 4
  groessten Beats umstellen: Hoehlen-Erwachen, Direwolf-Pakt mit Rangas
  Benennung, Tempest-Benennungszeremonie, Sieg ueber Geld. Toast nur noch als
  Zusammenfassung danach.
- [ ] Phase 64 — Entscheidungen mit Konsequenz: 2–3 Mittelspiel-Entscheidungen
  ueber vorhandene Flag-/Requirement-Mechanik (z. B. Deserteure: Gnade →
  neuer Dorf-NPC + Haendlerrabatt, Haerte → Folge-Encounter + Codexeintrag;
  Gabiru nach dem Duell: demuetigen vs. respektieren → andere Echsen-Dialoge
  und Bündnis-Bonus). Konsequenzen muessen in Welt, Shop oder Kampf sichtbar
  sein, nicht nur im Text; Verzahnung mit den Ende-Bedingungen aus Band 4.
- [ ] Phase 65 — Weltereignisse & Entdeckungen: Karten-Events jenseits von
  Kaempfen als datengetriebene Definitionen — Fundstellen/Glitzerpunkte mit
  Lore + Item (RangaJourney-Entdeckungsmuster auf begehbare Karten
  verallgemeinern), einmalige Ambient-Events (fahrender Haendler nach
  Handelsquest, Fluesterhain sichtbar geheilt nach Siegelbruch), Post-Boss-
  Weltveraenderungen. Ziel: Erkundung wird belohnt, die Welt wirkt lebendig.
- [ ] Phase 66 — Beat-Dramaturgie: Akt-Struktur auditieren, sodass sich
  Beat-Typen (Kampf, Szene, Entscheidung, Entdeckung, Rekrutierung) im
  Hauptpfad abwechseln und kein 3x-„geh hin, sprich, komm zurueck" in Folge
  bleibt; Milestone-Banner im Moment statt danach ausloesen;
  `playthrough.test` um Beat-Reihenfolge/-Dichte-Checks ergaenzen.

## Balance-Roadmap (TODO.md: Kaempfe zu leicht, Grind-Gefuehl, kein Schwung)

Befund (Headless-Sim, Auto-Battle, 5 Seeds, ohne Talente/Ausruestung):
Gleichlevel-Normalkaempfe enden 5/5 mit 100 % Party-HP (reiner Filler);
Mordrahn (L10) faellt einer L6-Party in 7 Zuegen per Verschlingen-Instant-Kill;
Geld (L16) verliert 5/5 gegen eine ausgeruhte L8-Party bei ~100 % Rest-HP.
Kernproblem: Heilung/Action-Economy >> Gegnerdruck; Devour entwertet Bosse;
Leveln ist dadurch bedeutungslos, Kaempfe fuehlen sich nach Pflicht-Grind an.

## UI- & Grafik-Roadmap (TODO: UI-Bugs, unscharfe Grafik auf 4K)

Befund (Code-Analyse): `main.ts` fixiert den Canvas auf 960x540 mit
`Scale.FIT` — auf 4K streckt der Browser das Backing ~4x per CSS, alles wird
unscharf (auch Text; nirgends wird eine Text-`resolution` gesetzt). Global
erzwingt `pixelArt: true` NEAREST-Filterung auch fuer die malerischen
128x128-KI-Tiles, die auf TILE=48 dezimiert werden (Aliasing); einzelne
Stellen (battleBackgroundAtlas, PreloadScene:353) stellen bereits manuell auf
LINEAR um. Generierte Texturen (Battle-BGs 960x540, Portraits, VFX) sind nur
in 1x-Aufloesung erzeugt; Kenney-Sprites sind 16x16 (12x-Upscale auf 4K).

- [ ] Phase 61 — Asset-Aufloesungs-Pass (Imagegen bevorzugt): 16x16-Kenney-
  Sprites durch hoeher aufgeloeste, artSpec-konforme generierte Sprites
  ersetzen (Overworld-Figuren, Gegner-Cutouts zuerst), Provenienz in
  `ASSETS.md`; Ziel: kein sichtbarer 12x-Upscale mehr auf 4K.

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

- [ ] Phase 69 — Talent-Perk-Engine: datengetriebene passive Effekte als
  `TalentPerk`-Union, im Kampf ausgewertet: on-attacked (Konterchance,
  Ausweichchance), Schadensmodifikatoren (+X % physisch/magisch/je Element,
  erlitten/ausgeteilt), Stat-Prozente (+HP %), on-skill-cast-Ketten (Skill X
  → Chance auf Folgeaktion Y ohne Zugkosten), Buff-Wirkung verstaerkt.
  Hooks an bestehenden Stellen in `battle.ts` (applyDamage, resolveSkill,
  Reaktions-/Konter-Mechanik wiederverwenden); Perks fliessen ueber
  `createBattlePartyFromMembers` aus freigeschalteten Knoten ein; komplett
  headless testbar (jeder Perk-Typ mit deterministischem Seed-Test).
- [ ] Phase 70 — 3-Wege-Spezialisierungen: jeder Kaempfer (rimuru, gobta,
  rigurd, ranga, shuna, benimaru, shion, hakurou, souei) erhaelt 3 exklusive
  Straenge à 4–5 Knoten aus Perks der Phase 69; erster Knoten eines Strangs
  sperrt die anderen Straenge (Branch-Lock; Respec spaeter als teures Item
  moeglich). Vorlage Benimaru: „Klingensturm" (physisch) / „Schwarzflamme"
  (Feuermagie) / „Flammenkommandant" (Team-Buffs). Rigurd und Ranga erhalten
  damit erstmals Baeume. Rimurus Straenge verzahnen sich mit Verschlingen
  (`requiredLearnedSkillId`: verschlungene Skills werden im Baum „entfaltet").
  Balance-Harness: jede Spec muss die Korridore je Story-Beat schaffen und
  sich im Sim messbar unterscheiden (Schadensprofil, Rest-HP, Buff-Anteil).
- [ ] Phase 71 — Rimuru: Verschlingen als Progressionskern: Startskills auf
  `predator`, `great-sage`, `slime-strike` (+ `water-jet` als angeborene
  Schleimform-Faehigkeit) reduzieren; `water-blade`/`storm-gust` u. a. werden
  ueber Verschlingen erbeutet — Devour-Map-Pass ueber `enemies.ts`, damit
  jeder fruehe Gegner Rimuru etwas Neues beibringt (forest-slime lehrt aktuell
  `slime-strike`, das er schon kann → totes Verschlingen).
  `RIMURU_CORE_LOADOUT_SKILLS` (battle.ts) und Onboarding-Texte anpassen;
  Balance-Harness neu einpendeln, da Rimurus Fruehspiel schwaecher wird
  (Abstimmung mit Phasen 53–56/67).
- [ ] Phase 72 — Spec-Baum-UI: Talent-Tab als 3-Spalten-Spec-Layout (eine
  Spalte je Strang, Linien Eltern→Kind, Zustaende: aktiv / freischaltbar /
  gesperrt mit sichtbarem Grund inkl. Branch-Lock); Knoten-Vorschau zeigt
  Perk-Wirkung VOR dem Kauf; Strangwahl mit Bestaetigungsdialog („sperrt die
  anderen Richtungen"). Layout als pure Funktion (headless testbar nach dem
  `HudLayoutIssue`-Muster), mobile scroll-/pannbar; Abstimmung mit Phase 59.

## UX- und Welt-Backlog

- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
