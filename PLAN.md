# Plan: „Tempest – Chronik" (JRPG, Phaser, Browser & Handy)

## Arbeitsweise
- Dieser Plan ist die **verbindliche Referenz** für das Projekt. Alle künftigen Änderungen am Konzept werden in **dieser Datei** (`PLAN.md`) nachgezogen.
- Umsetzung erfolgt **autonom (Automode)**: die jeweils nächste offene Phase wird durchgebaut, headless getestet und im Browser/auf Handy-Größe geprüft; Rückmeldung bei echten Entscheidungen oder am Phasenende.
- Fortschritt steht unten unter **Status / Fortschritt**.
- **Phasen-Disziplin:** Eine Phase, die gerade bearbeitet wird, wird hier als `[~] … (in Bearbeitung)` markiert. Beim Lesen dieses Plans nur Phasen übernehmen, die **nicht** in Bearbeitung sind, damit parallele Arbeit nicht kollidiert.

## Entwicklung
- Jede Phase unter **Status / Fortschritt** wird in einem eigenen Git-Worktree unter `/worktree` abgearbeitet, nicht direkt im Haupt-Checkout. Namensschema: `/worktree/tempest-phase-<nr>-<kurzname>`.
- Vor Start einer Phase: passenden Branch/Worktree anlegen und die Phase in diesem Plan als `[~] … (in Bearbeitung)` markieren.
- Bei Abschluss einer Phase: relevante Checks ausführen, `PLAN.md` aktualisieren, den Code committen und pushen.
- Erst nach erfolgreichem Push und sauber dokumentiertem Phasenstand wird die nächste Phase begonnen.

## Kontext / Vision
Ein klassisches **JRPG** im Universum von *That Time I Got Reincarnated as a Slime* (Tensura) bzw. der „Tempest"-Welt: eine erkundbare Oberwelt mit Städten und NPCs, eine Party reisender Helden/Monster, **rundenbasierte Kämpfe**, ein Fertigkeits-/Magiesystem, Ausrüstung und Inventar, eine fortschreitende Geschichte mit Dialogen und Quests sowie das markante **Kreaturen-Entwicklungs-/Namensgebungs-System** der Vorlage als Party-Progression.

Bewusster Neuanfang (Clean Slate) statt Migration des bestehenden Königreich-Builders: die Architektur soll von Beginn an zum JRPG-Genre passen. Das Ziel ist kein langsames Retro-Menüspiel, sondern ein modernes, schnelles, charaktergetriebenes JRPG: reich an Story und Weltgefühl, aber mit klaren Menüs, kurzen Wegen, beschleunigten Kämpfen und Progression ohne stumpfes Grinding.

## Große Design-Vision: Moderne JRPG-Pfeiler

### 1. Fesselnder Kampf & Zugökonomie
- **Schneller Spielfluss:** Kämpfe sollen so wenig Reibung wie möglich erzeugen: kurze Intros, klare Trefferanimationen, schnelle Ergebnisauflösung und keine unnötigen Menüwege.
- **Nahtlose Begegnungen:** Exploration und Kampf sollen sich möglichst direkt verbinden. Begegnungen dürfen in eine Battle-Ansicht wechseln, aber ohne lange Übergangssequenzen oder Tempoverlust.
- **Aktive Beteiligung:** Defensive/Offensive Reaktionsfenster, Timing-Boni oder kurze Eingabe-Events können Angriffe, Verteidigung oder Spezialaktionen verstärken. Wichtig: optional schnell bedienbar, niemals rhythmusbrechend.
- **Taktische Build-Vielfalt:** Talentbäume, Skills, Status, Ausrüstung und Synergien sollen unterschiedliche Kampfpläne ermöglichen, ohne Rollen-/Jobwechsel als separates System zu erzwingen.
- **Lesbare Tiefe statt Komplexitätsballast:** Jede Kampfentscheidung muss klaren Wert haben: Schaden, Schutz, Tempo, Status, Position/Rolle, Ressource oder Synergie.

### 2. Immersive Umwelt- & Levelgestaltung
- **Städte als Spielräume:** Städte sind sichere Orte, aber nicht bloß Shops. Sie dienen als Lore-Hubs, Quest-Knoten, Beziehungsräume und leichte Puzzle-/Erkundungszonen.
- **Dungeons mit Identität:** Jede Region braucht eine klare visuelle und mechanische Idee: Gegnerverhalten, kleine Umweltregeln, Abkürzungen, Geheimnisse, Ressourcenpunkte.
- **Visuelle Dichte:** Auch mit Platzhalter-/Pixel-/2.5D-Assets muss jede Karte bewusst komponiert wirken: markante Silhouetten, lokale Farbpaletten, erkennbare Biome, dekorative Details ohne Gameplay-Unklarheit.
- **Pacing durch Kontrast:** Intensive Kampf-/Dungeon-Segmente wechseln sich mit ruhigeren Stadt-, Dialog- und Vorbereitungsphasen ab.

### 3. Charakter- & narrative Progression
- **Charaktergetriebene Story:** Haupt- und Nebenfiguren sollen mechanisch und erzählerisch wachsen. Quests, Dialoge und Kämpfe sollen dieselben Figuren stärken, nicht getrennte Systeme sein.
- **Beziehungen mit Spielwert:** Freundschafts-/Bindungsmechaniken liefern Story-Szenen und konkrete Boni, z. B. Teamangriffe, passive Buffs, bessere Shop-/Quest-Optionen oder neue Klassen-/Skill-Pfade.
- **Schlanke Progression:** Level-Skalierung, Reserve-EP oder Party-weites Aufholen verhindern, dass ungenutzte Figuren dauerhaft zurückfallen.
- **Namensgebung & Entwicklung als Kernfantasie:** Das Tempest-typische Kreaturen-Entwicklungs-/Namensgebungssystem bleibt die zentrale Progressionsfantasie und verbindet Werte, Skills, Talentpfade und Story-Status.
- **Grinding minimieren:** Wiederholkämpfe dürfen lohnen, aber der Hauptfortschritt soll aus Questfortschritt, taktisch guten Kämpfen, Entwicklung, Beziehungen und Erkundung entstehen.
- **Talentbäume statt Rollen (Spielerwunsch 2026-06-27):** Der Charakter-Build entsteht über **Talentbäume** (das bestehende `SKILL_TREES`-System), nicht über wählbare/umschaltbare Rollen. Frühere Rollen-/Job-Auswahl und innere Klassen sind in Basiswerte, Startskills und gated Talentknoten aufgegangen.

## Technische Entscheidungen
- **Engine:** **Phaser 4** (4.2.0, neuer GPU-Renderer) mit **TypeScript**. *(Migration von Phaser 3.90 am 2026-06-28: praktisch Drop-in — null Quellcode-Änderungen, öffentliche API kompatibel; einziger Effekt ein ~220 KB größeres Bundle, daher `chunkSizeWarningLimit` 1700→1900. Branch-Experiment grün getestet, dann nach `main` übernommen.)*
- **Build/Dev:** **Vite** (schneller Dev-Server, HMR, optimierter Build). Bewusste Abkehr vom „kein Build"-Prinzip des Vorgängers, um Typsicherheit, Module und Tests zu gewinnen.
- **Ziel-Plattform:** **Browser & Handy** (mobile-first), Touch- **und** Tastatur-/Gamepad-Steuerung. Auslieferung als **statische Web-App** über GitHub Pages. **Kein Offline-Betrieb / kein Service Worker / keine PWA-Installation** — bewusst weggelassen, um Komplexität zu sparen.
- **Sprache (UI/Story):** **Deutsch**.
- **Tests:** **Vitest** für die **engine-/DOM-freie Spiellogik** (Werte, Kampf, Inventar, Save, Datenintegrität). Phaser-Szenen bleiben dünn; die Logik liegt in reinen, headless testbaren Modulen — wie im Vorgängerprojekt bewährt.
- **CI:** GitHub Actions: Typecheck + Tests bei Push/PR; Deploy (z. B. GitHub Pages) nur bei grün.
- **Abhängigkeiten schlank halten:** außer Phaser nur das Nötigste; nichts hinzufügen, was wenige Zeilen selbst erledigen.
- **Speichern:** `localStorage`, **versioniertes Schema** mit `migrate()`/`normalize()`, Export/Import als JSON, Reset.
- **Determinismus:** Kampf-/Zufallslogik über seedbaren RNG → reproduzierbare Tests.

## Architektur (Zielbild)
```
index.html              Mount-Punkt (#game) + Meta/Favicon
src/
  main.ts               Phaser-Game-Config, Szenen-Registrierung, Skalierung (mobile-first)
  scenes/               Phaser-Szenen (dünn — nur Darstellung & Eingabe)
    BootScene.ts          Init, Skalierung, Input-Setup
    PreloadScene.ts       Asset-Laden mit Ladebalken
    OverworldScene.ts     Tilemap-Welt, Spielerbewegung, Kamera, Begegnungen
    BattleScene.ts        Darstellung des Rundenkampfs (treibt nur die Engine an)
    MenuScene.ts          Party/Inventar/Ausrüstung/Status (Overlay)
    DialogueScene.ts      Dialoge, Auswahl, Cutscenes
  systems/              Reine Logik (KEIN Phaser/DOM) → headless testbar
    rng.ts                seedbarer RNG
    stats.ts              Werte, Level, EP-Kurven, Schadensformeln
    battle.ts             Rundenkampf-Engine (Zugreihenfolge, Aktionen, Status, KI, Terminierung)
    party.ts              Party-/Charakterzustand, Entwicklung/Namensgebung
    progression.ts        Evolution, Talentbäume, Bindungen, Story-Gates, Reserve-EP, Aufhol-/Skalierungsregeln
    inventory.ts          Items, Ausrüsten, Verbrauch
    save.ts               Serialisieren/Laden/Migration
  data/                Inhaltstabellen (typisiert): Helden/Monster, Talentbäume, Beziehungen, Skills, Items, Gegner, Karten, Dialoge, Quests
  ui/                  Wiederverwendbare HUD-/Menü-Bausteine
  assets/              Tilesets, Sprites, Portraits, Audio (zunächst Platzhalter)
test/                  Vitest-Suiten gegen src/systems & src/data
```

### Architektur-Prinzipien
- **Logik strikt von Phaser trennen.** Alles unter `src/systems/` und `src/data/` ist frei von Phaser/DOM und damit headless testbar. Szenen rufen nur die Logik-API auf und rendern deren View-Modell — wie die bewährte „Renderer verändert nie den Zustand"-Trennung des Vorgängers.
- **Datengetrieben.** Inhalte (Gegner, Skills, Items, Karten, Dialoge) liegen als typisierte Daten, nicht im Code verstreut.
- **Mobile-first.** Große Tap-Ziele, Touch-Steuerkreuz/-Buttons, kein Hover-Zwang; skaliert auf Desktop.
- **Tempo ist ein Feature.** Menüwege, Kampfanimationen, Übergänge und Wiederholaktionen werden aktiv auf kurze Interaktionsschleifen optimiert.
- **Grinding ist Fallback, nicht Kernloop.** Systeme müssen Reserve-EP, Aufholmechaniken oder Quest-/Erkundungsfortschritt unterstützen, damit Progression ohne XP-Padding funktioniert.
- **Story und Mechanik greifen ineinander.** Beziehungen, Talentpfade, Namensgebung, Entwicklung und Kampfboni sollen über dieselben Datenmodelle erklärbar und testbar sein.
- **Lazy/minimal.** Erst wenn ein System spielbar gebraucht wird, wird es gebaut; keine spekulativen Abstraktionen.
- **Jede nicht-triviale Logik bekommt einen Test.** Mindestens ein laufender Check, der bricht, wenn die Logik bricht.

## Status / Fortschritt

[x] **Phase 0 – Projekt-Setup & Tooling (fertig 2026-06-26)**
- Vite + Phaser 3 + TypeScript aufgesetzt: `package.json` (Scripts `dev`/`build`/`preview`/`typecheck`/`test`), `tsconfig.json` (strict), `vite.config.ts` (`base: '/tempest-jrpg/'` für Pages, Vitest-Node-Umgebung), `index.html` (Mount `#game`, `100dvh`, `touch-action:none`).
- Szenen-Grundgerüst: `src/main.ts` (Game-Config, Referenz 960×540, `Scale.FIT` + Center → Handy & Desktop), `BootScene` → `PreloadScene` (Ladebalken) → `TitleScene` (Platzhalter-Titel + Tap-/Tasten-Eingabe-Smoke-Test).
- Reine Logik begonnen: `src/systems/rng.ts` (seedbarer mulberry32-RNG, `makeRng`/`randomInt`/`pick`) — Phaser-/DOM-frei. `test/rng.test.ts`: 5 Vitest-Checks (Determinismus, Bereich, randomInt, pick).
- `.gitignore` (node_modules/dist). GitHub Actions (CI + Pages-Deploy) bereits aus dem Vorgänger portiert und auf Bun/Vite angepasst.
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **5/5** grün, `bun run build` → `dist/` erzeugt (Phaser-Bundle ~1,5 MB / 339 kB gzip — Bundle-Warnung unkritisch). Damit sind alle drei CI-Schritte (typecheck/test/build) lokal grün.
- *Hinweis: Phase 0 (Bootstrapping) direkt im Haupt-Checkout erstellt; ab Phase 1 gilt die Worktree-Disziplin.*

[x] **Phase 1 – Spielbarer Kern: Oberwelt (fertig 2026-06-27, Worktree `worktree/tempest-phase-1-overworld`)**
- **Reine Logik `src/systems/overworld.ts`** (Phaser-/DOM-frei): Kachelraster (`TileMap`), `isWalkable`, rasterbasierter `tryStep` (Schritt oder blockiert), `parseMap` (ASCII → Raster) — headless testbar.
- **Datengetriebenes Testgebiet `src/data/maps.ts`:** programmatisch erzeugtes 24×16-Feld mit geschlossenem Wandrand und Innenhindernissen, freier Spawn.
- **`src/scenes/OverworldScene.ts`:** rendert das Raster, bewegt den Spieler **rasterweise** (Tween) über die reine Logik, **folgende Kamera** mit Kartenbegrenzung. Eingabe: **Pfeiltasten + WASD** und ein **Touch-Steuerkreuz** (4 Buttons, `scrollFactor 0`). `TitleScene` startet die Oberwelt per Tipp/Taste; Szene in `main.ts` registriert.
- **Test `test/overworld.test.ts`:** 4 Checks (parseMap Wände/Boden/Breite, isWalkable inkl. außerhalb, tryStep Bewegung/Blockieren, Feld-Rand + begehbarer Spawn).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **9/9** grün (5 RNG + 4 Oberwelt), `bun run build` → `dist/` erzeugt. *Live-Browser-Smoke (Bewegung/Kamera/Touch) noch manuell zu prüfen — Logik & Build sind grün.*

[x] **Phase 2 – Datenmodell & Speichern (fertig 2026-06-26)**
- Typisierte Datenstruktur ergänzt: `src/data/types.ts` plus erstes Content-Set für Helden/Monster, Skills, Items und Gegner (`characters.ts`, `skills.ts`, `items.ts`, `enemies.ts`).
- Datenintegrität zentral prüfbar: `src/data/index.ts` exportiert `GAME_DATA`; die Testvalidierung `test/dataValidation.ts` prüft eindeutige IDs, Skill-/Item-/Equipment-Referenzen, Drop-Chancen und Basiswerte.
- Erste reine Systemmodule ergänzt: `stats.ts` (Level/EP/Werte), `party.ts` (Initialparty/PartyMember-State), `inventory.ts` (Stacks/Startinventar/Normalisierung).
- `save.ts`: versioniertes Schema (aktuell `SaveGameV3`), `createNewSave()`, `normalize()`, `migrate()`, `exportSave()`, `importSave()`, `loadSave()`, `writeSave()`, `autoSave()`, `resetSave()` über eine testbare `StorageLike`-Abstraktion.
- Migration eines alten v1-Formats abgedeckt: alte Party-/Inventar-/Positionsdaten werden ins aktuelle Schema überführt, unbekannte Figuren werden verworfen, ungültige Werte normalisiert.
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **10/10** grün, `bun run build` grün (Phaser-Bundle-Warnung unverändert/unkritisch). Roundtrip, Migration, Auto-Save/Load/Reset und Datenintegrität sind getestet.
- *Hinweis: `/worktree` war auf dieser Maschine read-only; der Phase-2-Worktree liegt deshalb unter `/private/tmp/worktree/tempest-phase-2-data-save` auf Branch `phase/2-data-save`.*

[x] **Phase 3 – Rundenkampf-Engine (fertig 2026-06-27, Worktree `worktree/tempest-phase-3-battle`)**
- **Reine Engine `src/systems/battle.ts`** (Phaser-/DOM-frei, seedbar): **CT-Initiative** (geschwindigkeitsbasiert), Aktionen **Angriff / Skill / Item / Verteidigen / Fliehen**, Elemente + Schwächen (×1,75) / Resistenzen (×0,5), Status **Gift** (DoT) und **Verteidigt** (halber Schaden), AoE-Skills (`all-enemies`), einfache **Gegner-KI** (Skills/Ziele nach Effektivität), **Beute** (EP/Gold/Item-Drops), garantierte Terminierung (Sieg/Niederlage/Flucht oder LP-Anteil nach 300 Zügen). `renderView` liefert ein kopiertes View-Modell.
- **Datenintegration:** Phase 3 nutzt die Phase-2-Datenmodelle statt eigener Demo-Daten: `characters.ts`, `enemies.ts`, `items.ts`, `skills.ts`. Ergänzt wurden u. a. AoE-Skill `storm-gust`, Gift-Skill `venom-spit`, Gegner `spore-moth` und validierte `SkillStatusEffect`-Daten.
- **`src/scenes/BattleScene.ts`:** treibt nur die Engine an — Gegner-/Party-Reihen mit LP/MP-Balken, Befehlsmenü (Angriff/Skills/Items/Verteidigen/Fliehen), Skill-/Itemlisten, Ziel-Antippen, automatische Gegnerzüge mit kurzer Pause, Ergebnis (EP/Gold/Beute) → zurück zur Oberwelt. Auslösung aus der Oberwelt per **Enter/Knopf**; in `main.ts` registriert.
- **Test `test/battle.test.ts`:** 9 Checks (Aufbau, Determinismus inkl. Log/Rewards, Sieg+Beute, Niederlage/Terminierung, Szenariomatrix 15×, Verteidigen, Item-Heilung/Verbrauch, Giftstatus, Flucht).
- **Abnahme (lokal verifiziert):** `bun install --frozen-lockfile` sauber, `bun run typecheck` sauber, `bun run test` → **23/23** grün (9 Kampf + 5 RNG + 4 Oberwelt + 3 Save + 2 Datenintegrität), `bun run build` → `dist/`. *Live-Browser-Smoke noch manuell; Logik/Build grün.*

[x] **Phase 4 – Menüs: Party, Inventar, Ausrüstung, Status, Rollen (fertig 2026-06-27, Worktree `worktree/tempest-phase-4-menus`)**
- **Reine Menülogik `src/systems/menu.ts`** (Phaser-/DOM-frei): Party-Summaries, sortierte Inventaransicht, Item-Nutzung, Ausrüsten/Ablegen mit Inventar-Slot-Tausch, berechnete Werte aus Level + Job + Ausrüstung, Skilllisten aus Charakter + Rolle. Touch-Zielkonstante `MENU_TOUCH_TARGET_PX = 44`.
- **Rollen-/Job-Daten `src/data/jobs.ts`:** erste Rollen `adaptive-hero`, `vanguard`, `mystic`, `scout`, `support-priest` mit Stat-Multiplikatoren, Skill-Zugriff und Charakterbeschränkungen; Datenintegrität validiert Job-Skills, erlaubte Charaktere und positive Multiplikatoren.
- **`src/scenes/MenuScene.ts`:** Overlay-Menü über der Oberwelt mit Tabs **Party / Inventar / Ausrüstung / Status / Rollen**, Party-Liste, Item-Nutzung, Ausrüstungswechsel, Status-/Skillanzeige, Rollenwahl und Auto-Save bei Zustandsänderungen. Öffnen/Schließen per **M** und Touch-Button; Oberwelt pausiert im Overlay.
- **Test `test/menu.test.ts`:** 6 Checks (Ausrüsten/Ablegen verändert Werte und Inventar, Heilitem-Verbrauch, Inventarsortierung, Rollenwerte + Skillzugriff, ungültige Rollenwahl, Touch-Zielgröße ≥44 px).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **29/29** grün (6 Menü + 9 Kampf + 5 RNG + 4 Oberwelt + 3 Save + 2 Datenintegrität), `bun run build` → `dist/`. *Live-Browser-Smoke noch manuell; Logik/Build grün.*

[x] **Phase 5 – Welt: NPCs, Dialoge, Städte, Shops, Begegnungen (fertig 2026-06-27, Worktree `worktree/tempest-phase-5-world`)**
- **Datengetriebene Welt `src/data/world.ts`:** NPC `Rigurd`, Dialogbaum mit Auswahl-/Requirement-/Effect-Daten, Quest `first-patrol`, Shop `tempest-supply`, Trigger-Encounter `training-clearing` und Random-Encounter-Zone `east-grass`.
- **Reine Weltlogik `src/systems/world.ts`** (Phaser-/DOM-frei): Dialogauswertung mit Flags/Quests/Belohnungen, Shop-Kauf/-Verkauf, NPC-/Shop-Nähe, Trigger-/Zufallsbegegnungen, Save-Adapter (`createWorldState`/`applyWorldState`) und Headless-Mini-Flow.
- **UI-Anbindung:** `OverworldScene` rendert NPC/Shop/Encounter-Marker, Interaktion per **E/Leertaste/Touch-Button**, Encounter führt in `BattleScene`; `DialogueScene` und `ShopScene` sind dünne Overlays, pausieren die Oberwelt und speichern Änderungen per Auto-Save.
- **Beziehung/Quest:** Dialoge setzen erste Bindungsflags (`bond.rigurd.met`, `bond.rigurd.trust-1`) und Queststatus/Queststeps; Abschlussbelohnung gibt Gold + Item.
- **Test `test/world.test.ts`:** 7 Checks (Welt-Datenintegrität, Dialog→Quest/Flag, Report-Freischaltung+Belohnung, Shop-Kauf/-Verkauf, Interaktionsnähe, einmaliger Trigger-Encounter, kompletter Headless-Smoke-Flow Stadt → NPC/Quest → Shop → Begegnung → Belohnung → Speichern).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **36/36** grün (7 Welt + 6 Menü + 9 Kampf + 5 RNG + 4 Oberwelt + 3 Save + 2 Datenintegrität), `bun run build` → `dist/`. *Live-Browser-Smoke noch manuell; Logik/Build grün.*

[x] **Phase 6 – Inhalt & Progression: Entwicklung, Namensgebung, Jobs, Beziehungen (fertig 2026-06-27, Worktree `worktree/tempest-phase-6-progression`)**
- **Progressionsdaten `src/data/progression.ts`:** 3 Regionen (`tempest-grove`, `marsh-border`, `spirit-shrine`), 3 Helden-/Monsterlinien, 3 benannte Entwicklungen, 3 Beziehungsketten, Job-Unlocks und Catch-up-Konfiguration.
- **Content-Erweiterung:** Neue Skills (`predator-aura`, `direwolf-rush`, `sacred-weave`), neue Gegner (`orc-scout`, `lizardman-acolyte`) und zusätzliche Encounter (`marsh-border-watch`, `shrine-approach`) erweitern das erste Content-Set über Startgebiet und Trainingskampf hinaus.
- **Reine Progression-Engine `src/systems/progression.ts`:** Namensgebung, Entwicklung/Evolution, Skill-/Stat-Boni, Beziehungsstufen, Beziehungsszenen, Regionsentdeckung, Job-Freischaltungen, Reserve-Catch-up und Balance-Heuristik sind Phaser-/DOM-frei testbar.
- **Rollenfreischaltung:** Fortgeschrittene Jobs bleiben im Menü gesperrt, bis `getUnlockedJobIds` sie über Evolution (`predator-sage`), Beziehung (`tempest-knight`), Story-Flag (`spirit-weaver`) oder Erkundung (`marsh-runner`) freigibt.
- **Namensgebung sichtbar:** `createBattlePartyFromMembers` übernimmt gespeicherte Partynamen, sodass benannte Figuren auch im Kampf korrekt erscheinen.
- **Balance/Catch-up:** Kapitel-Baselines und max. Level-Abstand holen Reservefiguren auf; `analyzeProgressionBalance` prüft monotone Heldenkurven, Evolutionen, Beziehungen, Job-Multiplikator-Bänder und Regionen.
- **Test `test/progression.test.ts`:** 5 Checks (Namensgebung→Evolution→Skill/Stats/Job, Job-Unlocks über Beziehung/Story/Erkundung, Beziehungsboni, Reserve-Catch-up, Content-/Balance-Abnahme).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **41/41** grün (5 Progression + 7 Welt + 6 Menü + 9 Kampf + 5 RNG + 4 Oberwelt + 3 Save + 2 Datenintegrität), `bun run build` → `dist/`. *Build zeigt weiterhin nur die bekannte Vite-Chunkgrößenwarnung.*

[x] **Phase 7 – Feinschliff: Audio, Übergänge, Tutorial, Optionen (fertig 2026-06-27, Worktree `worktree/tempest-phase-7-polish`)**
- **Einstellungen `src/systems/settings.ts`** (rein, headless testbar, eigener localStorage-Key `tempest-settings-v1`, getrennt vom Save-Schema): Lautstärken (Master/Musik/SFX), reduzierte Bewegung, `seenTutorial`; mit Klemmung + Migration kaputter/teilweiser Daten. `test/settings.test.ts`: 5 Checks (Defaults, Roundtrip, Klemmung, Migration, effektive Lautstärke).
- **Prozedurale Audio `src/audio/sfx.ts`** (WebAudio, **ohne Asset-Dateien**): kurze SFX (select/confirm/cancel/hit/magic/heal/victory/defeat) respektieren die SFX-Lautstärke; `resumeAudio()` nach erster Nutzergeste.
- **Szenenübergänge `src/scenes/transition.ts`:** sanftes Kamera-Fade (`fadeToScene`/`fadeIn`), respektiert „reduzierte Bewegung" (sofortiger Schnitt).
- **`src/scenes/OptionsScene.ts`:** Lautstärke-Regler (−/+ mit Balken), Reduzierte-Bewegung-Umschalter — **sofort persistiert**, mit SFX-Feedback und Fade.
- **`TitleScene` überarbeitet:** Menü „Spiel starten" / „Optionen" mit Fade-Übergängen + SFX, Audio-Freischaltung bei erster Geste, **einmaliges Tutorial-Overlay** (Steuerung/Kampf/Optionen) über `seenTutorial`. `OptionsScene` in `main.ts` registriert.
- **Bewusst isoliert** (mostly neue Dateien + Title/main.ts), um nicht mit der parallel laufenden Phase 6 zu kollidieren. Fade/SFX in Battle/Overworld/Menu sind ein trivialer Folgeschritt (Helfer liegen bereit).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **41/41** grün (inkl. 5 neue Settings-Checks), `bun run build` → `dist/`. Keine Konsolenfehler erwartet; Live-Browser-Smoke noch manuell.

[x] **Phase 8 – Release & Auslieferung (fertig 2026-06-27, Worktree `worktree/tempest-phase-8-release`)** — *Offline/PWA bewusst gestrichen (Spielerwunsch: Komplexität sparen).*
- **Statische Web-App über GitHub Pages:** `.github/workflows/deploy.yml` installiert mit Bun, führt Typecheck + Tests aus, baut `dist/` und deployed per `actions/deploy-pages`; CI für Branches/PRs bleibt separat.
- **Release-Metadaten:** `index.html` hat deutsche Sprache, Beschreibung, App-/OpenGraph-Metadaten und ein statisches SVG-Favicon aus `public/favicon.svg`; kein Manifest, kein Service Worker.
- **Build-Größenbudget:** `vite.config.ts` setzt `base: '/tempest-jrpg/'` und dokumentiert `chunkSizeWarningLimit: 1700`, weil Phaser bewusst als Single-Bundle-Runtime ausgeliefert wird.
- **README:** Überblick, aktueller No-PWA-Release-Scope, Dev-/Verifikationsbefehle, Projektstruktur und GitHub-Pages-Deployablauf.
- **Test `test/release.test.ts`:** 4 Checks (Pages-Base/Deploy-Workflow, Release-Metadaten ohne PWA-Artefakte, keine Service-Worker-Registrierung, dokumentiertes Bundle-Budget).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **50/50** grün, `bun run build` → `dist/` ohne Vite-Chunkgrößenwarnung. Live-GitHub-Pages-Deploy läuft nach Push auf `main`.

## Ausbau zu einer herausragenden Produktion (Phasen 9–15)
**Ziel:** ambitioniertes Hobby-JRPG mit echtem Produktionswert. Das Gerüst (Phasen 0–8) steht und ist getestet; jetzt zählt **Präsentation, Spielgefühl, Tiefe und Inhalt**. Reihenfolge-Empfehlung: **9 → 10 → 11** (verwandeln das vorhandene Spiel sofort, voll autonom), **13** früh als Stilrichtung klären (größter sichtbarer Sprung), **12** sobald eine Story-Richtung steht.

**Asset-Strategie (verbindlich für alle Art/Audio-Arbeiten):**
- **Entscheidung (2026-06-27): ausschließlich CC0-Assets.** Quellen: **Kenney.nl** (durchgehend CC0), **OpenGameArt mit CC0-Filter**, einzelne itch.io-CC0-Packs. *Nicht* CC0 (z. B. LPC = CC-BY-SA/GPL) bleibt draußen. Jede Quelle wird trotzdem in **`ASSETS.md`** mit Link + „CC0" dokumentiert. KI-Erzeugung ist nicht der Weg.
- **Zielstil (CC0-tauglich): Top-down-Pixel-Art (16×16 oder 32×32).** Beste CC0-Abdeckung für Tiles, Charaktere, Gegner, UI. Bis kohärente CC0-Sets eingepflegt sind, liefert ein prozedurales Platzhalter-Modul denselben Stil (später 1:1 austauschbar).
- **Keine 1:1-Übernahme urheberrechtlich geschützter Tensura-Originalfiguren** (auch nicht per KI) — eigene/generische Designs im Tempest-Geist. Schützt das Hobby-Projekt rechtlich.
- **Stilkohärenz vor Quantität:** verbindliche **Art Bible** (Palette, Auflösung/Tile-Größe, Perspektive, Outline-Regeln). Bis echte Assets vorliegen, ein **kohärenter prozeduraler/Pixel-Platzhalterstil**, den der Automode selbst erzeugt — später 1:1 austauschbar.
- **Budget:** Gesamtgröße der Auslieferung im Blick behalten (Lazy-Loading je Szene möglich), damit der Pages-Build schlank bleibt.

[x] **Phase 9 – Game Feel & Kampf-Juice (fertig 2026-06-27, Worktree `worktree/tempest-phase-9-juice`)** *(autonom, höchster ROI)*
- **Reine Ableitung `src/systems/feedback.ts`** (Phaser-/DOM-frei, getestet): `snapshot`/`diffFeedback`/`totalDamage` errechnen aus Vorher/Nachher-Zuständen die LP-/MP-Deltas + Tod-Events — **ohne Eingriff in die Kampf-Engine** (bewusst, damit es nicht mit der parallelen Engine-Phase kollidiert).
- **`BattleScene` aufgewertet (nur Darstellung):** eigene, nicht-gelöschte **FX-Ebene** für aufsteigende **Schadens-/Heilzahlen**, **Treffer-Flash**, **Tod-Partikel (Poof)** und **Kamera-Shake** (Stärke ∝ Schaden); **Szenen-Fade-in** (`transition.ts`); Sieg/Niederlage-Flourish (Kamera-Flash/Shake, einmalig); **SFX** (Treffer/Heilung/Sieg/Niederlage) aus dem Phase-7-Audio. Spieler- **und** Gegnerzüge lösen Feedback über Zustands-Diff aus.
- **Bewegungsoption respektiert:** bei „reduzierte Bewegung" entfallen Shake/Flash/Partikel; Zahlen bleiben (informativ). Engine bleibt headless-rein.
- **Test `test/feedback.test.ts`:** 5 Checks (Snapshot, Schaden/Heilung, Tod-Übergang, unveränderte Einheiten/MP, totalDamage).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **55/55** grün, `bun run build` → `dist/`. Live-Browser-Smoke noch manuell. *Angriffs-Lunge/Cast-Pose bewusst zurückgestellt (würde das Render-Modell der Szene umbauen) — Folgeschritt.*
- **Nachschliff Feel (2026-06-27):** markanter **Begegnungsübergang** Oberwelt→Kampf (`battleWipe`: Blitz + Shake + Fade) an beiden Kampfeinstiegen, sanftes **Oberwelt-Fade-in** bei Rückkehr aus dem Kampf, gerichtete **Angriffsbewegung** (Geschoss/Klinge Angreifer→Ziel) bei Spieleraktionen — alles reine Szenen-Ebene, „reduzierte Bewegung" respektiert. `bun run test` → 63/63 grün. *Leichter UI-Skin-Pass zurückgestellt, um nicht mit parallelen Szenenänderungen (Phase 11) zu kollidieren.*

[x] **Phase 10 – Kampftiefe (moderne JRPG-Pfeiler) (fertig 2026-06-27, Worktree `worktree/tempest-phase-10-battle-depth`)**
- **Aktive Reaktionsfenster:** `queueReaction` unterstützt Timing-Block und Konter mit `perfect`/`success`/`miss`; perfekte Reaktionen reduzieren Schaden stark, Konter verursachen Gegenschaden und perfekte Blocks bauen Team-Meter auf.
- **Rollen-/Job-Wechsel im Kampf:** `switch-job` validiert freigeschaltete Rollen, wendet Job-Multiplikatoren auf Basiswerte an, aktualisiert HP/MP-Grenzen und Skillzugriff; `CombatantView.jobId` macht den Zustand lesbar.
- **Schwäche-/Break-System:** Schwächentreffer und Debuffs senken eine Break-Leiste; bei Break setzt die Engine `guard-break`, setzt CT zurück, erhöht Team-Meter und macht Gegner verwundbarer. `CombatantView.breakGauge`/`breakGaugeMax` expose die Phasenleiste.
- **Team-/Synergie-Angriffe:** `team-attack` benötigt volle Team-Leiste und eine aktive Synergiebeziehung (`synergyPartnerIds`), kombiniert Werte beider Figuren, verbraucht Meter und erzeugt zusätzlichen Break-Druck.
- **Gegnerphasen:** Gegner wechseln unter 50 % LP in Phase 2 (`phaseIndex`), priorisieren verwundete Ziele stärker und verwenden Skills aggressiver; der Zustand ist im View-Modell sichtbar.
- **Status-/Buff-/Debuff-Satz:** Status-IDs erweitert um `attack-up`, `defense-up`, `magic-up`, `spirit-down`, `haste`, `guard-break`; neue Skills `battle-cry`, `quick-step`, `spirit-bind` hängen an Rollen.
- **Test `test/battle.test.ts`:** 6 neue Checks (Reaktion/Konter, Jobwechsel, Break, Team-Angriff, Gegnerphase, deterministische Matrix Rollen × Gegnerphasen × Seeds); Battle-Suite jetzt 15 Checks.
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **56/56** grün, `bun run build` → `dist/` ohne Vite-Warnung.

[x] **Phase 11 – Progression & Kernfantasie (fertig 2026-06-27, Worktree `worktree/tempest-phase-11-progression`)** *(autonom)*
- **Namensgebung → Evolution:** benannte Figuren können nach erfüllten Bedingungen sichtbar evolvieren; Formname, Werte, Skills, Rollenfreischaltungen und Skillpunkte fließen aus einem gemeinsamen Progressionszustand in Menü und Kampf.
- **Skill-Bäume:** drei verzweigte, datengetriebene Bäume mit Voraussetzungen und Skillpunktkosten; Freischaltungen sind validiert, persistent und erweitern den realen Kampfbau.
- **Ausrüstungstiefe:** Setzugehörigkeiten, Setboni und mehrstufige Verzauberungen verändern die berechneten Werte; Material- und Goldkosten werden beim Verbessern verbraucht.
- **Bindungen mit Spielwert:** Beziehungspunkte/-stufen schalten Szenen, passive Partnerboni, Kampfbeginn-Buffs, Team-Meter und einen Synergieangriff frei; die Battle-UI zeigt Form, Rollen und Synergie.
- **Anti-Grinding:** Kampfbelohnungen vergeben Skill- und Beziehungspunkte; Reservemitglieder erhalten begrenzte Aufhol-EP. Ergebnisse und Jobwechsel werden in `SaveGameV3` persistiert; Migrationen von v1, v2 und dem alten Storage-Key sind getestet.
- **Abnahme (lokal verifiziert):** `tsc --noEmit` sauber, `vitest run` → **66/66** grün, `vite build` → `dist/`; Desktop- und 390×844-Browser-Smoke für Titel und Progressionsmenüs ohne überlappende Bedienelemente. Balance-Bänder, Evolution, Skill-Pfade, Sets/Verzauberung, Bindungsboni, Team-Angriff und Save-Migration sind headless getestet.

[x] **Phase 12 – Welt, Story & Quests** *(fertig 2026-06-27, Worktree `worktree/tempest-phase-12-world-story`; Story-Design akzeptiert 2026-06-27, verfeinerbar)*
- Erzählbogen + denkwürdige Figuren, **Quest-/Flag-System**, mehrere **Städte & Dungeons mit eigener Identität** (Mechanik + Optik), Lore-/Codex, Cutscene-Bausteine in `DialogueScene`.
- **Abnahme:** durchgängiger Story-Slice (Intro → Stadt → Quest → Dungeon → Boss → Belohnung) headless durchspielbar; Quests/Flags persistiert.
- **Story-Slice umgesetzt:** Hauptquest **„Bindung der Ahnen"** mit Sora, Vael und Lyrre; gated Rat-Schritt → Flüsterhain-Dungeon → Ahnensiegel-Boss gegen **Mordrahns Echo** → Abschlussbelohnung und Act-1-Flag.
- **Welt-/Quest-Daten erweitert:** neue Orte (`tempest-hollow`, `border-camp`, `whispering-grove`, `ancestor-seal`) mit spielerischer Identität, Lore-/Codex-Einträge, zusätzlicher Grenzshop, Key-Item `ancestor-seal-fragment`, Boss-Gegner `mordrahn-echo`.
- **Reine Weltlogik erweitert:** Questlog-/Codex-Views, `notFlag`-/Quest-Step-Requirements, sichtbare Location-/Encounter-Gates, idempotenter `completeEncounter()`; Trigger gelten erst nach Sieg als abgeschlossen. `BattleScene` schreibt Encounter-Victory-Effekte nach gewonnenem Kampf in den Save.
- **UI-Anbindung:** Oberwelt zeigt freigeschaltete Story-Orte und gated Trigger; Menü hat neue Tabs **Quests** und **Codex**.
- **Abnahme (lokal verifiziert):** `npx --yes bun@latest run typecheck` sauber, `npx --yes bun@latest run test` → **78/78** grün, `npx --yes bun@latest run build` → `dist/`. Headless-Story-Slice Intro → Stadt → Quest → Dungeon → Boss → Belohnung + Save-Roundtrip ist in `test/world.test.ts` abgedeckt.

  **Story-Design „Tempest – Chronik" (akzeptiert, eigene Figuren — keine 1:1-Tensura-Originale):**
  - **Logline:** Als gestaltwandelnder **Schleimkern ohne Erinnerung** (Fähigkeit: *verschlingen & benennen*) einst du im Großen Jura-Wald zerstrittene Monstervölker zur Nation **Tempest** — während die uralte Versiegelung **„Bindung der Ahnen"** zerfällt und ein Krieg Mensch ↔ Monster droht.
  - **Ton:** ernst mit Wärme, charaktergetrieben, Prisen Humor (kein Grimdark). **Themen:** Zugehörigkeit, „Namen geben = Identität & Verantwortung", Vorurteile überwinden.
  - **Figuren (an Systeme gekoppelt):** *Du / „der Namenlose"* (Schleim, Verschlinger/Analyse → Namensgebung & Evolution als Kernfantasie); **Sora** (Oger-Kriegerin, Wächter/Berserker; Bindung → Teamangriff); **Vael** (Kobold-Tüftler, Arkanist/Support, baut Schmiede/Akademie); **Lyrre** (menschliche Späherin/Diplomatin, Fernkampf/Debuff, trägt das Mensch-↔-Monster-Thema).
  - **Antagonist:** **Mordrahn**, Hüter der zerfallenden Bindung — will sie per Massenopfer neu schmieden „um die Welt zu retten" (Grauzone).
  - **3 Akte (an Regionen/Schwierigkeit gekoppelt):** 1) Erwachen & Gründung Tempests; 2) Wachstum & Misstrauen, Grenzeskalation, Verlust/Verrat, Entdeckung der zerfallenden Bindung; 3) Bündnis (Monster + gemäßigte Menschen) gegen Mordrahn, finale **Wahl**: Bindung **zerstören** (Freiheit/Risiko) vs. **neu schmieden** (Ordnung/Opfer) → 2 Enden + *True Ending* über erfüllte Bindungen.
  - **System-Verzahnung:** Namensgebung löst Bond-Szenen aus; Regionen = Akt-Tore; Beziehungen schalten Teamangriffe & Story frei.
  - *Status: vom Spieler grundsätzlich abgesegnet („mach erstmal so"), Detail-Verfeinerung (Namen/Enden/Ton) jederzeit möglich.*

[x] **Phase 13 – Art- & Audio-Produktion** *(fertig 2026-06-27 — Abnahmekriterien erfüllt: kohärenter Look, CC0-Lizenzen in `ASSETS.md`, Bundle im Budget, Beep-SFX/Rechtecke ersetzt; optionale Politur als „offen" notiert)*
- **Art Bible** + Pipeline (Tilesets, Charakter-Sprites/Portraits, Gegner, VFX-Atlas, UI-Skin) — **CC0**, mit `ASSETS.md`-Attribution. **Musik + echte SFX** ersetzen die prozeduralen Töne (Lautstärke-System steht bereits). Lazy-Load je Szene.
- **Abnahme:** kohärenter Look über Oberwelt/Kampf/Menü; alle Lizenzen dokumentiert; Bundle im Budget; Rechtecke/Beep-SFX vollständig ersetzt.
  - **✅ Grundlage (2026-06-27, Worktree `worktree/tempest-phase-13-art`):** `docs/ART_BIBLE.md` (Top-down-Pixel, 32px, Palette, 1px-Outline, Figuren-Akzente, CC0-Beschaffung), `ASSETS.md` (CC0-only Attributions-Gerüst), Phaser-freier **`src/render/artSpec.ts`** (Palette/Maße/deterministische Specs, getestet) + Phaser-Generator **`src/render/placeholderArt.ts`** (`generatePlaceholderTextures` → kohärente `ph-<kind>`-Texturen). `test/artSpec.test.ts` (5 Checks). `bun run typecheck`/`test` (**73/73**)/`build` grün.
  - **✅ Verdrahtung + erste echte CC0-Kacheln (2026-06-27, Worktree `worktree/tempest-phase-13-wire`):** `PreloadScene` erzeugt die `ph-<kind>`-Texturen (`generatePlaceholderTextures`) und lädt **echte CC0-Kacheln aus Kenney „Tiny Town"** (CC0, in `ASSETS.md` belegt). Aus dem Pack wurden Boden/Wand/Pfad **per Farb-Klassifizierung** ausgewählt (z. B. `tile_0000`=Gras, `tile_0104`=Stein) und einzeln ins Repo gelegt (`src/assets/tiles/`). `OverworldScene` rendert Kacheln nun als Sprites: **echt → Platzhalter → Rechteck-Fallback**; Spieler als `ph-hero`. `BattleScene` zeichnet Einheiten-Token (`ph-<kind>` je Seite/Name) über der Karte. Reine Darstellung, Logik unberührt. `bun run typecheck`/`test` (**76/76**)/`build` grün.
  - **✅ Echte CC0-Charakter-/Gegner-Sprites (2026-06-27, Worktree `worktree/tempest-phase-13-sprites`):** aus **Kenney „Tiny Dungeon"** (CC0) per **Inhalts-Klassifizierung** ausgewählt (Hautton-Cluster → Held `tile_0088`, Grün-Blob → Schleim `tile_0108`, weitere distinkte Kreaturen für Wolf/Imp/Oger). Einzeln ins Repo (`src/assets/sprites/`), in `ASSETS.md` belegt, in `PreloadScene` geladen. **Spieler** (OverworldScene) und **Kampf-Einheiten-Token** (BattleScene) bevorzugen jetzt **echtes Sprite → Platzhalter → Rechteck**. `bun run typecheck`/`test` (**78/78**)/`build` grün. *Offen: mehr Kachel-/Charaktervielfalt, Gegner-Spiegelung/Animation.*
  - **✅ Echte CC0-SFX (2026-06-27, Worktree `worktree/tempest-phase-13-audio`):** aus **Kenney „RPG Audio"** (CC0, 50 Dateien) wurden acht kleine OGG-SFX übernommen (`ui-select`, `ui-confirm`, `ui-cancel`, `battle-hit`, `battle-magic`, `battle-heal`, `result-victory`, `result-defeat`) und in `ASSETS.md` belegt. `src/audio/sfx.ts` nutzt jetzt echte Audio-Dateien mit Settings-Lautstärke statt WebAudio-Oszillator-Beep-Sounds. Neuer Asset-Test prüft Dokumentation aller `src/assets`-Dateien und verhindert Rückfall auf `createOscillator`. `npx --yes bun@latest run typecheck` sauber, `test` → **80/80** grün, `build` grün (Audio im `dist` ~123 KB). *Offen: längere Background-Loops, mehr Kachel-/Charaktervielfalt, Gegner-Spiegelung/Animation.*
  - **✅ Echte CC0-Musik-Motive (2026-06-27, Worktree `worktree/tempest-phase-13-music`):** aus **Kenney „Music Jingles"** (CC0, 85 Dateien) wurden drei kurze OGG-Motive übernommen (`title-theme`, `field-theme`, `battle-theme`) und in `ASSETS.md` belegt. Neues `src/audio/music.ts` spielt Titel/Oberwelt/Kampf als leise Loops, folgt `masterVolume × musicVolume`, wird nach erster Nutzergeste resumed und aktualisiert sich sofort in `OptionsScene`. Asset-Test prüft Musik-Wiring. `npx --yes bun@latest run typecheck` sauber, `test` → **81/81** grün, `build` grün (Musik im `dist` zusätzlich ~82 KB); Desktop-/390×844-Smoke lädt ohne sichtbaren Renderfehler. *Offen: längere CC0-Background-Loops, mehr Sprite-/Tile-Varianz.*
  - **✅ Prozeduraler Pixel-VFX-Atlas (2026-06-27, Worktree `worktree/tempest-phase-13-vfx`):** `src/render/artSpec.ts` definiert sechs testbare VFX-Specs (`hit-burst`, `heal-spark`, `death-poof`, `physical-bolt`, `magic-bolt`, `target-ring`) aus der Art-Bible-Palette; `src/render/vfxAtlas.ts` erzeugt globale `vfx-<kind>`-Texturen im `PreloadScene`. `BattleScene` nutzt diese Texturen für Trefferburst, Heil-Spark, Tod-Poofs und gerichtete physische/magische Geschosse statt primitiver Kreis-/Rechteck-FX, mit Fallbacks bei fehlenden Texturen. `npx --yes bun@latest run typecheck` sauber, `test` → **82/82** grün, `build` grün; Desktop-/390×844-Smoke lädt ohne sichtbaren Renderfehler. *Offen: längere Background-Loops, mehr Sprite-/Tile-Varianz und Animation.*
  - **✅ Prozedurale Portrait- & UI-Skin-Grundlage (2026-06-27, Worktree `worktree/tempest-phase-13-ui-portraits`):** `src/render/artSpec.ts` definiert testbare `PORTRAIT_KINDS` (Rimuru/Gobta/Shuna/Sora/Vael/Lyrre/Rigurd/Mordrahn) und `UI_SKIN_KINDS`; `src/render/portraitAtlas.ts` generiert globale `portrait-<kind>`-Texturen, `src/render/uiSkin.ts` liefert einheitliche Panel-/Button-/Portraitrahmen. `PreloadScene` erzeugt Portraits global; `DialogueScene`, `MenuScene`, `ShopScene` und Battle-Buttons nutzen den Skin, Party-/Statusmenü und Dialoge zeigen Portraits. `npx --yes bun@latest run typecheck` sauber, `test` → **88/88** grün. *Offen: längere Background-Loops, mehr Tile-/Charakter-/Gegner-Varianz, Animation/Spiegelung und spätere echte CC0-Portraits.*
  - **✅ Kampf-Sprite-Politur: Spiegelung + Idle-Animation (2026-06-27, direkt auf `main`, alleiniger Loop):** Gegner-Sprites werden in `BattleScene.drawUnit` zur Party gespiegelt (`setFlipX`); lebende Einheiten bekommen eine **dezente Idle-Bob-Animation** über den neuen, testbaren `idleBobSpec`-Helfer in `artSpec.ts` (deterministische Dauer/Amplitude + ID-basierter Phasenversatz, damit nichts im Gleichschritt wippt). Respektiert **reduzierte Bewegung** (kein Bob) und besiegte Einheiten (ruhig); Idle-Tweens (`repeat:-1`) werden beim Neuzeichnen sauber beendet, bevor ihre Sprites zerstört werden. `test/artSpec.test.ts` +1 Check. `tsc --noEmit` sauber, `vitest run` → **89/89** grün, `vite build` → `dist/`.
  - **✅ Gegner-Vielfalt (2026-06-27, direkt auf `main`):** Bisher rendern 4 von 6 Gegnern (Motte, Ork, Echse und **Boss Mordrahns Echo**) als identischer Schleim. Vier distinkte prozedurale Arten ergänzt (`enemy-moth`/`-orc`/`-lizard`/`-boss` mit eigener Palette in `artSpec.ts`); `BattleScene.phKindFor` mappt Motte/Ork/Echse/Mordrahn jetzt korrekt. Texturen werden über `PLACEHOLDER_KINDS` automatisch generiert + getestet. Echte CC0-Sprites (Held/Schleim/Wolf) bleiben bevorzugt. `tsc` sauber, **89/89** grün, `build` ok.
  - *Optional/zurückgestellt (kein Abnahme-Blocker): längere CC0-Background-Loops statt kurzer Jingles, echte CC0-Portraits statt prozeduraler Busts, mehr Tile-Varianz. Bei Bedarf als eigene kleine Politur-Iteration.*

[x] **Phase 14 – Zugänglichkeit, Schwierigkeit & Tempo (fertig 2026-06-27, Worktree `worktree/tempest-phase-14-accessibility`)** *(bewusst settings-isoliert, kollisionsfrei zur parallelen Engine-Arbeit)*
- **`systems/settings.ts` erweitert** (rein, getestet): `difficulty` (leicht/normal/schwer), `textSpeed` (langsam/normal/schnell/sofort), `highContrast`, `colorblind` (aus/protan/deutan/tritan) mit Enum-Validierung + abwärtskompatibler Migration. Abgeleitete Helfer `textCharDelayMs`, `enemyDamageMultiplier`, `playerDamageMultiplier` (Letztere für die Kampf-Engine bereitgestellt).
- **`OptionsScene` neu aufgebaut:** kompakte Reihen für Lautstärken + alle Zugänglichkeitsoptionen (Cycler/Toggle), sofort persistiert, SFX-Feedback, ≥38 px Tap-Ziele.
- **`DialogueScene` Schreibmaschineneffekt:** Text erscheint nach `textSpeed` (Tippen/Klick vervollständigt sofort; „sofort"/reduzierte Bewegung = ganzer Text); **hoher Kontrast** schaltet auf reinweiße Schrift.
- *Wiring offen (kollisionsbewusst): `difficulty`-Multiplikatoren in die Kampf-Engine und `colorblind`-Palette ins globale Rendering — Helfer/Settings stehen bereit, Einbau wenn die Engine-/Render-Phasen nicht mehr parallel laufen.*
- **Test `test/settings.test.ts` erweitert:** Defaults, Enum-Validierung, abgeleitete Werte (zusätzlich zu den bestehenden Lautstärke-/Migrationschecks).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **63/63** grün, `bun run build` → `dist/`. Optionen persistiert & wirksam (Tempo/Kontrast sichtbar im Dialog).

[x] **Bugfix Bewegung nach Kampf + Auto-Kampf (2026-06-27, Worktree `worktree/tempest-fix-autobattle`)**
- **Bugfix:** Nach einem Kampf war keine Bewegung mehr möglich. **Ursache:** Phaser nutzt **dieselbe Szenen-Instanz** wieder; Klassenfeld-Initialwerte laufen bei `scene.start` nicht erneut → `OverworldScene.moving` blieb von vor dem Kampf auf `true` hängen, `update()` brach dauerhaft früh ab. **Fix:** transiente Zustände (`moving`, `touchDir`) in `create()` zurücksetzen (gleiches Muster wie `BattleScene.resultAnnounced`). Wurzelfix, kein Symptom-Patch.
- **Auto-Kampf:** neues reines, getestetes `src/systems/autoBattle.ts` (`chooseAutoAction`: Heilung bei niedrigem LP → günstigste Schadensfähigkeit → Standardangriff aufs LP-schwächste Ziel). `BattleScene` bekommt einen **„⚡ Auto"-Umschalter**; bei aktivem Auto wählt und spielt die Szene die Spielerzüge automatisch (kurze Pause für Lesbarkeit). `test/autoBattle.test.ts`: gültige Aktion, deterministischer Sieg, Terminierungs-Stichprobe.
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **76/76** grün (autoBattle +3), `bun run build` → `dist/`.

[x] **Talentbäume statt Rollen – Pivot (Stage 1+2 fertig 2026-06-27, Worktrees `worktree/tempest-talent-trees`, `worktree/tempest-talent-fold`)** *(autonom, Spielerwunsch)*
- **Stage 1 (fertig):** Das **spielerseitige Rollensystem** entfernt — Talentbäume (Menü-Tab **„Talente"**, vormals „Entwicklung") sind die einzige Build-Achse.
  - `battle.ts`: In-Kampf-Rollenwechsel raus (`switch-job`-Aktion, `availableJobIds`, `resolveJobSwitch`, `applyCombatantJob`). `jobId` bleibt als **fixe innere Klasse** (einmaliger Stat-Basiswert beim Aufbau).
  - `menu.ts`/`progression.ts`: Rollen-**Auswahl** raus (`selectJob`, `selectProgressionJob`); `getSelectedJobId` liefert nur noch die Standard-Klasse. `jobIdsByCharacterId` bleibt für Save-Kompatibilität.
  - `MenuScene.ts`: Tab **„Rollen"** entfernt; `drawJobs` weg. Kampf-Party-Aufbau ohne `flags`-Param.
  - **Abnahme (lokal verifiziert):** `tsc --noEmit` sauber, `vitest run` → **77/77** grün (−1 Rollenauswahl-Test, switch-job-Test → Baseline-Test umgebaut), `vite build` → `dist/`.
- **Stage 2 (fertig):** Innere Klassen vollständig in **Basiswerte, Wachstum und Startskills** gefaltet; `src/data/jobs.ts`, `JobDefinition`, `JOBS`, `getUnlockedJobIds`, `jobIdsByCharacterId`, `getSelectedJobId`, `CombatantView.jobId` und Job-Datenvalidierung entfernt.
  - **Rollen-Inhalte erhalten:** Frühere Advanced-Rollen wurden als gated Talentknoten modelliert: `rimuru-predator-sage` (Evolution), `gobta-tempest-knight` (Bindung), `gobta-marsh-runner`/`rimuru-marsh-runner` (Erkundung) und `shuna-spirit-weaver` (Story-Flag). Skills/Boni bleiben so über Talentbäume erreichbar statt über Rollenwechsel.
  - **Save-Kompatibilität:** Legacy-Import normalisiert alte Saves weiter, übernimmt `jobIdsByCharacterId` aber nicht mehr in den aktuellen `ProgressionState`.
  - **Tests angepasst:** Kampfmatrix läuft über Talent-/Skill-Loadouts statt Rollen; Progression testet Bindungs-/Erkundungs-/Story-Gates auf Talentknoten; Menü berechnet Werte/Skills ohne Job-Parameter.
  - **Abnahme (lokal verifiziert):** `npx --yes bun@latest run typecheck` sauber, `test` → **81/81** grün, `build` grün.

[x] **Phase 15 – Balance, QA & Mobile-Politur** *(fertig 2026-06-27, Worktree `worktree/tempest-phase-15-qa`)*
- **Erweiterte QA-Gates:** reines Testmodul `test/qaGates.ts` prüft Phase-15-Balance (`analyzePhase15Balance`), ein mobiles Overworld-Renderbudget (`estimateOverworldBudget`/`analyzeOverworldBudget`) und einen vollständigen **Headless-Act-1-Durchspieltest** (`runHeadlessActOnePlaythrough`) mit Dialogen, Shop-Käufen, drei Story-Encountern, Auto-Kampf, Rewards, Progression, Questabschluss und Save-Export/Import.
- **Mobile-Layout-Politur:** `src/systems/mobileLayout.ts` macht das Overworld-HUD testbar. `OverworldScene` nutzt dieselbe Layoutquelle; der Kampfbutton wurde von 38px auf ≥44px korrigiert, und das D-Pad liegt auf 390×844 innerhalb sicherer Bounds ohne überlappende Touch-Ziele.
- **Auto-Kampf robuster:** `chooseAutoAction` nutzt jetzt Heilitems und MP-Items aus dem Kampf-Inventar, damit QA-/Auto-Durchläufe nicht an fehlender manueller Item-Nutzung hängen.
- **Test `test/qa.test.ts`:** 4 neue Checks (390×844/960×540 HUD-Layout, mobiles Renderbudget, erweiterte Balance, kompletter Headless-Act-1-Playthrough). `test/autoBattle.test.ts` prüft zusätzlich automatische Heilitem-Nutzung.
- **Abnahme (lokal verifiziert):** `npx --yes bun@latest run typecheck` sauber, `test` → **86/86** grün, `build` grün. Chrome-/Browser-Smokes auf Nutzerwunsch ausgelassen; mobile Abnahme erfolgt über headless 390×844-Layout- und Budget-Gates.

[x] **Bugfix: Quests/Codex „nicht abschließbar" + Story-Wegführung (fertig 2026-06-27, direkt auf `main`)** *(Spielermeldung mit Screenshots)*
- **Symptom (Spieler):** Hauptquest „Bindung der Ahnen" bleibt „Offen", Codex komplett „nicht entdeckt"; `first-patrol`/Rigurd dagegen abschließbar.
- **Diagnose (vollständig auditiert — KEIN Logik-/Daten-Defekt):** Flags werden alle gesetzt+verlangt, alle Quest-Steps haben Abschluss-Effekte, beide Quests werden abgeschlossen+belohnt, Codex-Unlock-Flags (`story.intro.seen`/`council.ready`/`grove.cleared`/`boss.echo-defeated`) sind korrekt verdrahtet, alle Story-NPCs/Encounter sind auf der Map erreichbar, und der **bestehende `runHeadlessActOnePlaythrough` (Phase 15) ist grün** — d. h. der ganze Story-Flow ist API-seitig nachweislich abschließbar. Die Wurzel ist **UX/Szene**: (1) keine In-Game-Wegführung zur Reihenfolge Sora→Vael→Lyrre→Sora→Hain→Schrein→Sora; (2) Overworld lädt den Save nach Dialog nicht neu → gated „!"-Encounter-Marker erscheinen erst nach Szenenneustart; (3) Dialog-Choices liegen horizontal und laufen bei 3–4 Optionen aus dem 960er-Bild (Layout-Overlaps wie in den Screenshots).
- **Umgesetzt (direkt auf `main`):**
  1. **Szenentreuer Konsistenz-Playthrough** `test/playthrough.test.ts` (+2 Checks): spiegelt exakt den Szenen-Fluss (Save laden → `createWorldState` → `startDialogForNpc` → nur **requirement-gefilterte** Choices → `applyWorldState`/Save → neu laden) durch die komplette `binding-of-ancestors`-Quest; asserted Questabschluss **und** alle 4 Codex-Einträge entsperrt; plus **Erreichbarkeits-Assertion** (Flood-Fill ab Spawn) für jeden Quest-NPC + Story-Encounter (fängt künftige „NPC/Trigger in Wand"-Regressionen). Bestätigt: die Quest ist über den echten Spielerpfad vollständig abschließbar.
  2. **Overworld-Refresh:** `drawWorldObjects` zeichnet jetzt in einen `worldLayer`-Container; ein `RESUME`-Listener lädt beim Rückkehren aus Dialog/Shop/Menü den Save neu und zeichnet die Marker neu → freigeschaltete „!"-Encounter erscheinen sofort.
  3. **DialogueScene:** Choices als 2-Spalten-Raster (bis 4 gefilterte Optionen sichtbar/klickbar) statt überlaufender horizontaler Reihe.
  4. **Quest-Log-Wegführung:** aktive Quests zeigen statt der generischen Beschreibung den **aktuellen Schritt** als Hinweis (z. B. „→ Hole Vaels Analyse und Lyrres Grenzbericht ein").
- **Abnahme (lokal verifiziert):** `tsc --noEmit` sauber, `vitest run` → **91/91** grün (Playthrough +2), `vite build` → `dist/`. Logik war nachweislich korrekt; die Fixes machen die abschließbare Quest auch im Spiel folgbar.

[x] **Bugfix: Menü-Layout-Overlaps (fertig 2026-06-27, direkt auf `main`)** *(Spieler-Screenshots)*
- **Symptom:** In der Party-Seitenleiste lief die Unterzeile (`Adaptiver Magiekämpfer · LP … · MP …`) durch die Button-Border („durchgestrichen") **und** horizontal in den Content-Bereich (x≥300) über; Menü-Hintergrund ließ den Overworld stark durchscheinen.
- **Fix (`MenuScene`):** Party-Einträge auf 70px Höhe; die LP/MP-Zeile steht **unter** dem 44px-Button (kreuzt keine Border mehr) und ist auf `LP x/y · MP x/y` gekürzt (kein Überlauf in den Content; die Klassenbezeichnung steht weiter in Party-/Status-Tab). Menü-Backdrop von Alpha 0.82 → 0.93 für klarere Lesbarkeit.
- **Fix (`BattleScene.drawUnit`):** Einheiten-Kasten 62→84px; Name/Form oben, Sprite mittig, **HP-Leiste + LP/MP-Text unter den Sprite** verschoben (lag vorher mittig über dem Token und verdeckte es). Reihenabstände kollisionsfrei (Gegner y=145, Party y=360).
- **Abnahme:** `tsc` sauber, **91/91** grün, `build` ok.

[x] **Bugfix: Schrein-Marker fehlt nach Hain → „für immer stuck" (fertig 2026-06-27, direkt auf `main`)** *(Spielermeldung)*
- **Symptom:** Nach gewonnenem Flüsterhain-Kampf erscheint der „!"-Schrein-Marker nicht; Spieler kommt nicht weiter.
- **Wurzel (Regression aus dem Marker-Refresh):** Der Rückweg Kampf→Overworld ist `scene.start('Overworld')`; Phaser nutzt die **Szenen-Instanz wieder**, daher zeigte `this.worldLayer` auf den **zerstörten** Container der Vorsitzung → `drawWorldObjects` zeichnete in einen toten Container → keine Marker. Die Encounter-**Logik** war korrekt (Schrein wird nach `story.grove.cleared` sichtbar), nur das Rendern brach.
- **Fix (`OverworldScene`):** `this.worldLayer = undefined` im transienten Reset von `create()` (gleiches Muster wie `moving`/`touchDir`); RESUME-Listener via `off`+`on` mit benannter `onResume`-Methode (kein Listener-Leak über scene.start-Zyklen).
- **Test:** `test/playthrough.test.ts` prüft jetzt die **Marker-Sichtbarkeit** über die Story (nach Rat → Hain sichtbar/Schrein nicht; nach Hain → Schrein sichtbar/Hain nicht; nach Schrein → keiner) — fängt künftige „Marker fehlt"-Regressionen auf der Logikseite.
- **Abnahme:** `tsc` sauber, **91/91** grün, `build` ok.

[x] **Feature: Quest-Marker über NPCs (fertig 2026-06-27, direkt auf `main`)** *(Spielerwunsch — schwer erkennbar, welche Elemente interaktiv/relevant sind)*
- **Datengetriebener Helfer `npcHasQuestMarker(state, npcId)` (rein, getestet):** wahr, wenn der **requirement-gefilterte** Startdialog des NPCs gerade eine quest-vorantreibende Option hat (`start-quest`/`complete-quest-step`/`complete-quest` oder gesetztes `story.*`-Flag). Kein Hardcoding von „Questgebern".
- **`OverworldScene`:** zeichnet ein **goldenes „❗"** über NPCs mit aktiver Quest-Aktion (deutlich vom pinken Encounter-„!" auf der Kachel unterscheidbar); statisch (kein Tween-Leak beim `worldLayer`-Neuzeichnen). Leuchtet automatisch Sora→Vael→Lyrre→Sora zur richtigen Zeit und erlischt, wenn dort nichts zu tun ist.
- **Test `test/playthrough.test.ts`:** prüft die Marker-Reihenfolge (Start: Sora+Rigurd; nach Sora-Start: Vael+Lyrre, Sora aus; nach Vael+Lyrre: Sora wieder an).
- **Abnahme:** `tsc` sauber, **92/92** grün, `build` ok.

[x] **Act 2 – Wachstum & Misstrauen (fertig 2026-06-28, direkt auf `main`)** *(Story-Content, Phase-12-Fortsetzung)*
- **Thema (lt. Story-Design):** Grenzeskalation Mensch↔Monster, Verlust/Verrat, Entdeckung der **beschleunigt zerfallenden Bindung**. Getragen von **Lyrre** (Grenze/Diplomatie) + **Vael** (Magiestruktur). Region **marsh-border** (Kapitel 2). Gated durch `story.act1.completed`.
- **Quest `border-escalation` („Grenzfeuer", actId `act-2`), 5 Schritte (spiegelt Act-1-Struktur: 2 Dialoge + 2 Encounter + Bericht):**
  1. `muster` (Lyrre, gated `act1.completed`+Quest inaktiv) → `story.act2.started`.
  2. `border-clash` — Trigger-Encounter Sumpfgrenze (gated `act2.started`, ¬`border.cleared`) → `story.border.cleared` + Codex.
  3. `read-fracture` (Vael, gated `border.cleared`, ¬`fracture.read`) → `story.fracture.read` + Codex; enthüllt den Verrat/Defektor narrativ.
  4. `break-vanguard` — Trigger-Encounter „Mordrahns Vorhut" (gated `fracture.read`, ¬`vanguard.broken`) → `story.vanguard.broken` + Codex.
  5. `report-act2` (Lyrre, gated `vanguard.broken`) → `complete-quest` + `story.act2.completed` + Reward.
- **Neuer Content (umgesetzt):** 2 Gegner (`human-lancer`, `mordrahn-vanguard`), 2 Locations (`marsh-frontier`/`border-rift` mit unlockFlags), 3 Codex-Einträge (`border-fires`/`second-fracture`/`mordrahn-vanguard`), 2 Trigger-Encounter (`marsh-frontier-clash`@(5,13), `border-rift-vanguard`@(22,7)), Act-2-Optionen an Lyrre- (`muster`/`report-act2`) und Vael-Startdialog (`read-fracture`). Quest-Marker + Encounter-Marker greifen automatisch (datengetrieben).
- **Abnahme (lokal verifiziert):** Datenintegrität grün; `test/playthrough.test.ts` um einen Act-2-Durchlauf erweitert (Lyrre→Sumpfgrenze→Vael→Grenzriss→Lyrre, Questabschluss + 3 Codex-Unlocks; Marker-/Erreichbarkeits-Tests decken die neuen Encounter automatisch ab). `tsc` sauber, **93/93** grün, `build` ok.

[x] **Act 3 – Finale: Die Wahl der Ahnen (fertig 2026-06-28, direkt auf `main`)** *(Story-Content, Abschluss des akzeptierten 3-Akt-Bogens)*
- **Thema (lt. Story-Design):** Bündnis (Monster + gemäßigte Menschen) gegen **Mordrahn**; finale **Wahl** an der Bindung: **zerstören** (Freiheit/Risiko) vs. **neu schmieden** (Ordnung/Opfer) → **2 Enden + True Ending** über erfüllte Bindungen. Gated durch `story.act2.completed`.
- **Quest `ancestors-choice` („Die Wahl der Ahnen", actId `act-3`), 4 Schritte (1 Dialog + 2 Encounter + Wahl-Dialog):**
  1. `rally` (Sora, gated `act2.completed`+Quest inaktiv) → `story.act3.started`.
  2. `breach` — Trigger-Encounter „Mordrahns Linie" (gated `act3.started`, ¬`breach.cleared`) → `story.breach.cleared`.
  3. `confront` — Trigger-Encounter Boss **Mordrahn** (gated `breach.cleared`, ¬`mordrahn.defeated`) → `story.mordrahn.defeated` + Codex.
  4. `the-choice` — Wahl-Dialog (Sora, gated `mordrahn.defeated`): **3 verzweigte Optionen** → `complete-quest` + `story.act3.completed` + genau ein Ende-Flag:
     - `destroy` → `ending.freedom`; `reforge` → `ending.order`; `true-path` (gated `bond.sora.trust-1`+`bond.lyrre.trust-1`) → `ending.true`. Jedes Ende entsperrt einen eigenen Codex-Eintrag.
- **Neuer Content (umgesetzt):** Boss `mordrahn` (Lv. 10), 2 Locations (`alliance-march`@(12,7)/`ancestor-heart`@(15,2)), 2 Trigger-Encounter (`alliance-breach`, `mordrahn-confrontation`), 4 Codex-Einträge (`mordrahn-keeper` + `ending-freedom`/`ending-order`/`ending-true`), Act-3-Optionen an Soras Startdialog (`rally` + verzweigte `choose-destroy`/`choose-reforge`/`choose-true`).
- **Abnahme (lokal verifiziert):** Datenintegrität grün; `test/playthrough.test.ts` testet **alle drei Ende-Pfade** (Freiheit/Ordnung/True) inkl. Questabschluss, Ende-Flag und Codex-Unlock, plus dass `choose-true` ohne erfüllte Bindungen unsichtbar bleibt. `tsc` sauber, **96/96** grün, `build` ok. **→ Der gesamte 3-Akt-Bogen ist jetzt durchspielbar.**

[x] **Ende-Bildschirm (fertig 2026-06-28, direkt auf `main`)** *(Abschluss-Payoff für die drei Enden)*
- **Problem:** Die drei Enden zeigten sich bisher nur als Sora-Dialogzeile + Codex — kein echter Abschluss nach 3 Akten.
- **Umsetzung:** Reiner, getesteter Helfer `getActiveEnding(state)` in `world.ts` (leitet aus `ending.*`-Flags ab, Priorität True > Ordnung > Freiheit, Titel/Text aus denselben Codex-Einträgen). Neue `EndingScene` (Titel + Ende-Text + „Weiterspielen") in `main.ts` registriert. `OverworldScene.onResume` zeigt sie **einmalig** nach gesetzter Wahl (`ending.shown`-Guard) und kehrt danach in die Welt zurück (Postgame bleibt spielbar).
- **Abnahme (lokal verifiziert):** `tsc` sauber, **97/97** grün (`getActiveEnding`-Test: Priorität + null + Titel), `build` ok. *(Visuelles Rendern der Szene wie üblich noch im Browser zu sichten.)*

[x] **Mehr Content: optionale Nebenquests (fertig 2026-06-28, direkt auf `main`)** *(Spielerwunsch „mehr Content")*
- **Idee:** Optionale Kopfgeld-/Erkundungsquests, die die vorhandenen Systeme (Quest/Marker/Codex/Encounter) wiederverwenden → robust + automatische Wegführung. Jede: 3 Schritte (Annahme-Dialog → gated Trigger-Encounter mit neuem Gegner → Bericht-Dialog), neuer Gegner + Bestiarium-Codex-Eintrag + Gold/Item-Belohnung.
  - **`bounty-bog` („Kopfgeld: Sumpfschrecken", Rigurd):** gated `first-patrol` abgeschlossen. Neuer Gegner `bog-terror`, Encounter @(2,8), Codex `bestiary-bog-terror`.
  - **`relic-echoes` („Streunende Echos", Vael):** gated `story.act1.completed`. Neuer Gegner `stray-echo`, Encounter @(8,2), Codex `bestiary-stray-echo`.
- **Abnahme (lokal verifiziert):** Datenintegrität grün; `test/playthrough.test.ts` testet beide Nebenquests (Annahme→Kampf→Bericht, Questabschluss + Bestiarium-Codex); Marker-/Erreichbarkeitstests decken die neuen Encounter @(2,8)/(8,2) automatisch. `tsc` sauber, **99/99** grün, `build` ok. Quest-Marker + Encounter-Marker leiten automatisch (datengetrieben).

[x] **Mehr Content: Nebenquests Welle 2 (fertig 2026-06-28, direkt auf `main`)** *(Spielerwunsch „mehr Content")*
- **`border-runner` („Grenzgänger", Lyrre):** gated `story.act1.completed`. Neuer Gegner `human-deserter` (Deserteurstrupp), Encounter @(20,5), Codex `bestiary-human-deserter`, setzt zusätzlich `bond.lyrre`-Flag (thematisch).
- **`apex-bounty` („Apex: Urdirewolf", Rigurd, Postgame):** gated `story.act3.completed`. Superboss `elder-direwolf` (Lv. 12), Encounter @(13,13), große Belohnung + Codex `bestiary-elder-direwolf` — Anreiz nach dem Finale.
- **Abnahme (lokal verifiziert):** Datenintegrität grün; `test/playthrough.test.ts` testet beide Quests (inkl. Postgame-Gate: Apex erst nach Act 3 sichtbar); Marker-/Erreichbarkeit @(20,5)/(13,13) automatisch. `tsc` sauber, **101/101** grün, `build` ok.

[x] **Zweite Region: Geistmoor (fertig 2026-06-28, direkt auf `main`)** *(erster Multi-Map-Schritt)*
- **Engine:** `maps.ts` bekommt eine **Map-Registry** (`MAPS` + `getMap(mapId)`) und eine zweite, programmatisch erzeugte Karte `spirit-marsh`. `OverworldScene` wird **map-dynamisch**: rendert/bewegt über `getMap(save.location.mapId)` statt der fest verdrahteten `JURA_FIELD`/`MAP_ID`.
- **Reise:** neues optionales `travelTo` an `WorldLocationDefinition` + `getAdjacentTravel`. Bidirektionale **Gateways** (Pfad ins Geistmoor ↔ zurück) wechseln `save.location` und laden die Zielkarte (`scene.restart`).
- **Content (modest):** Geistmoor mit eigenem Spawn/Landmark, einem Shop, 2–3 Encountern (vorhandene Gegner) und einem Rückweg-Gateway; weiterer Ausbau später.
- **Umgesetzt:** `maps.ts` mit generischem Builder, `SPIRIT_MARSH` (22×14), `MAPS`/`getMap`. `OverworldScene` rendert/bewegt/interagiert komplett über `this.mapId`+`this.map` (= `getMap(save.location.mapId)`); `travelTo` an Locations + `getAdjacentTravel`; bidirektionale Gateways (⇄-Symbol, eigene Farbe) wechseln per sanftem Fade. Geistmoor: Spawn, Landmark `marsh-mire`, Shop `marsh-trader`, 1 Zufalls- + 1 Landmark-Trigger-Encounter, Codex `geistmoor`. Positions-Walkability beim Laden abgesichert.
- **Abnahme (lokal verifiziert):** Datenintegrität grün; `playthrough.test` prüft Erreichbarkeit von NPCs/Shops/Gateways/Triggern **je gegen ihre eigene Karte** (beide Maps) + Travel-Konsistenz (jedes `travelTo` → existierende Karte + begehbare Zielkachel). `tsc` sauber, **102/102** grün, `build` ok. *(Visuelles Reisen/2. Karte noch im Browser zu sichten.)*

[x] **Dritte Region: Geisterschrein (fertig 2026-06-28, direkt auf `main`)** *(Multi-Map-Erweiterung — reine Daten, dank fertiger Engine)*
- **Kette:** `tempest-start ↔ spirit-marsh ↔ spirit-highlands`. Neues Gateway-Paar Geistmoor↔Geisterschrein (Ostrand des Moors).
- **Karte:** `SPIRIT_HIGHLANDS` (24×14) über den vorhandenen Builder/`MAPS`-Registry; keine Szenen-/Systemänderung (Overworld ist bereits map-dynamisch).
- **Content:** Geisterschrein mit Spawn, Landmark `shrine-summit`, Shop, 2 Encountern (spätere Gegner) und Codex `geisterschrein`.
- **Umgesetzt:** `SPIRIT_HIGHLANDS` (24×14) in `MAPS`; Gateway-Paar Geistmoor↔Geisterschrein (Moor-Ostrand @(20,7) ↔ Hochland @(1,7)); Geisterschrein mit Spawn, Landmark `shrine-summit`, Shop `shrine-rest`, 1 Zufalls- + 1 Trigger-Encounter (`shrine-summit-guardian` mit `mordrahn-vanguard`), Codex `geisterschrein`. **Keine Code-Änderung** — alles über die fertige map-dynamische Engine.
- **Abnahme (lokal verifiziert):** Reachability-/Travel-Tests greifen automatisch über alle **3 Karten** (NPCs/Shops/Gateways/Trigger erreichbar; jedes `travelTo` → existierende Karte + begehbare Zielkachel); Datenintegrität grün; `tsc` sauber, **105/105** grün, `build` ok. *(Visuelles Hochland im Browser noch zu sichten.)*

## Verifikation (Methodik)
- **Headless-Logik:** `bun run test` (Vitest) gegen `src/systems` & `src/data` — Kampf-Determinismus, Save-Roundtrip/Migration, Datenintegrität, Talentbäume, Beziehungen, Aufholmechaniken, Balance-Bänder.
- **Typsicherheit:** `tsc --noEmit` in CI.
- **Manuell/Browser:** `bun run dev`, Prüfung in Handygröße (390×844) und Desktop; optional Playwright-Screenshots.
- **Smoke-Flow:** Oberwelt bewegen → Begegnung → Kampf gewinnen → Menü/Ausrüstung → Speichern → neu laden (Stand bleibt) → Reset.

## Verbesserungs-Backlog (Ideen, priorisiert — 2026-06-28)
Reflexion über den aktuellen Stand (3-Akt-Story + Enden, 4 Nebenquests + Postgame-Boss, 3 Regionen/Multi-Map, Phaser 4, Talentbäume). Geordnet nach Wert, nicht nach Aufwand.

**Priorität HOCH — Korrektheit/QA (genau die Bug-Klasse, die uns mehrfach getroffen hat)**
1. **Browser-Smoke in CI (Playwright):** bootet das Spiel headless im Browser, schießt Screenshots von Title/Overworld/Battle/Menü/Dialog/Ende und prüft auf Konsolenfehler. → fängt **Szenen-/Render-Regressionen**, die unsere Headless-Vitest-Tests prinzipiell nicht sehen können (z. B. der `worldLayer`-Stale-Container-Bug, Menü-Overlaps, HP-Leiste über dem Sprite, fehlende Marker). Größter ROI, weil fast jeder gemeldete Bug visueller/szenischer Natur war.
2. **Save-Kompatibilitäts-Test** ✅ *(2026-06-28)*: `playthrough.test` migriert einen alten v1-Stand auf v3 und spielt den kompletten Act-1-Bogen darauf durch (Questabschluss + Codex + `story.act1.completed`) → kein Soft-Lock durch Schema-/Content-Drift. Künftig pro großem Content-Schritt erweiterbar.

**Priorität MITTEL — Welt lebendiger machen (die neuen Regionen sind aktuell reine Kampfzonen)**
3. **Pro-Karte-Tile-Theming:** Geistmoor/Geisterschrein nutzen dasselbe Tileset wie der Hain → sie sehen identisch aus. Eigene Paletten/Tiles je Region (Moor = dunkler/Wasser, Hochland = Stein/Wind) → die Regionen fühlen sich wie eigene Orte an.
4. **Regionale NPCs + kleine Quests** in Geistmoor/Geisterschrein → Orte mit Eigenleben statt nur Encounter-Feldern.
5. **Minimap/Regions-Anzeige:** bei jetzt 3 Karten fehlt eine „Wo bin ich / wohin"-Orientierung.

**Priorität MITTEL — Spielgefühl & Onboarding**
6. **Kampftiefe sichtbar machen:** Break-Leiste, Team-Meter und Reaktionsfenster existieren mechanisch, werden aber kaum erklärt/hervorgehoben → optionales Kampf-Tutorial + klarere HUD-Hinweise.
7. **Quest-Log:** „aktive Quest verfolgen"/Sortierung, sobald viele Quests offen sind (aktuell 5 Quests + Nebenquests).

**Priorität MITTEL — Progression & Replay**
8. **NG+ / Ende-Galerie:** andere Enden ohne Komplett-Replay erlebbar; Bonus/Anerkennung fürs True Ending.
9. **Begleiter rekrutieren:** Sora/Vael/Lyrre sind nur Story-NPCs — eine(n) spielbar machen (eigener Talentbaum) = echte Party-Tiefe.

**Priorität NIEDRIG — Technik/Wartbarkeit/Politur**
10. **`src/data/world.ts` (~1500 Z.) in Module splitten** (quests/dialogs/encounters/locations/lore) → Wartbarkeit + weniger Merge-Konflikte bei Parallelarbeit.
11. **Asset-/Szenen-Lazy-Loading je Region** (Bundle ~1,85 MB nach Phaser 4) — bewusst aufgeschoben; bei wachsendem Content sinnvoll.
12. **Offene Phase-13-Politur:** längere CC0-Musik-Loops statt kurzer Jingles, echte CC0-Portraits statt prozeduraler Busts, mehr Tile-/Sprite-Varianz.
13. **Balance-Pass mit neuem Content:** Levelkurve über 3 Regionen + Postgame-Superboss + Act-2/3-Bosse formal gegen ein Level-/Schwierigkeitsband testen (erweitert `analyzePhase15Balance`).
