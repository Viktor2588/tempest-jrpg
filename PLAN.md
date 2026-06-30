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

### Verbindliche Inhaltslinie: Canon-first

- Das Projekt ist ein privates Hobbyprojekt. Sichtbare Figuren und Begleiter verwenden deshalb die originalen Tensura-Namen, damit Story und Party eindeutig bleiben.
- Für Band 1 und 2 sind Rimuru, Veldora, Rigurd, Gobta, Ranga und Shuna die sichtbaren Kernfiguren. Neue erfundene Haupt-NPCs werden für ihre Funktionen nicht angelegt.
- Eigene Dialogformulierungen und eine eigenständige JRPG-Struktur bleiben Pflicht; Manga-/Anime-Texte und Szenen werden nicht wörtlich übernommen.
- Bestehende interne IDs dürfen aus Gründen der Save-Kompatibilität vorerst bestehen bleiben. Sichtbare Namen, Questtexte, NPC-Auftritte und Codex-Einträge müssen jedoch der Canon-first-Linie folgen.
- Die früheren sichtbaren Figuren Sora, Vael, Lyrre und Mordrahn gehören nicht mehr zum Canon-Hauptpfad. Historische Einträge in abgeschlossenen Phasen bleiben als Entwicklungsprotokoll bestehen; diese neue Regel überschreibt deren damalige Story-Richtung.
- Der Original-Arc `ancestors-choice` bleibt technisch erhalten, wird aber als optionale Nebenhandlung vom Canon-Hauptpfad getrennt.
- Figuren dürfen originale Namen tragen; Grafiken bleiben eigenständig bzw. prozedural und übernehmen keine geschützten Manga-/Anime-Artworks.

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

[x] **Phase 16 – Kampfpräsentation: Party-Art, regionale Arenen & HUD (fertig 2026-06-28, direkt auf `main`)**
- **Neue Imagegen-Assets:** drei eigenständige, freigestellte Kampfillustrationen für Rimuru, Gobta und Shuna sowie drei breite Arenen für Tempest-Hain, Geistmoor und Geisterschrein. Stil und Blickrichtung orientieren sich an den bereits integrierten Kingdom-Kreaturen; alle Quellen und Generierungsangaben werden in `ASSETS.md` dokumentiert.
- **Datengetriebene Art-Zuordnung:** Party-Art wird über `sourceId`, Arena-Art über die aktuelle `mapId` gewählt; beide Pfade behalten bestehende Sprite-/Farb-Fallbacks. Mapping und Vollständigkeit werden headless getestet.
- **Battle-HUD-Politur:** regionale Vollbild-Arena mit lesbarer Abdunklung, klarer Zuganzeige, grafischer Team-Leiste, ruhigerer Einheitenhierarchie und kompakter Aktionsleiste. Touch-Ziele bleiben mindestens 44 px hoch; Gegner-/Party-Karten, Log und Befehle dürfen sich bei 960×540 nicht überdecken.
- **Umgesetzt:** `battleArt.ts` ordnet alle drei Partyfiguren und Karten-Arenen mit robustem Tempest-Fallback zu; `PreloadScene` lädt und filtert die sechs neuen Assets. `BattleScene` rendert die aktuelle regionale Arena, größere individuelle Party-Cutouts, transparente Einheitenkarten, eine grafische Team-Leiste und eine horizontale 44px-Aktionsleiste; Skills/Items nutzen ein kompaktes Raster.
- **WebP-Optimierung (2026-06-28):** alle zehn gemalten Kampfassets (Kreaturenatlas, drei Gegner-Cutouts, drei Party-Cutouts, drei Arenen) von PNG/JPG auf WebP umgestellt; Cutouts behalten ihren Alpha-Kanal. Assetblock von ca. **6,7 MB auf 1,4 MB** reduziert (rund **79 %**); Browser-Smoke bestätigt identisches Rendering.
- **Abnahme:** `bun run typecheck` sauber, `bun run test` → **123/123** grün, `bun run build` grün; Desktop- und 390×844-Playwright-Smoke ohne Konsolenfehler oder Layout-Überlappung.

[x] **Phase 17 – Browser-Smoke in CI (fertig 2026-06-28, direkt auf `main`)**
- **Projektlokaler E2E-Smoke:** Playwright startet den Vite-Server selbst und prüft Title → Overworld → Battle sowie Menü-Öffnen/-Schließen über echte Canvas-Eingaben.
- **Render-Gates:** Desktop (1440×900) und Mobil (390×844), keine `pageerror`-/Console-Errors, sichtbares Canvas mit nichtleerem Pixelinhalt und Screenshots als Fehlerartefakte.
- **CI-Wiring:** Chromium wird in CI installiert; Smoke läuft auf Pull Requests/Feature-Branches und vor dem Pages-Deploy auf `main`.
- **Abnahme:** Typecheck, **135/135** Vitest-Tests und **4/4** Playwright-Smokes (Desktop/Mobil) grün; CI-/Deploy-Workflows führen den Browser-Smoke aus.

## Integration von Band 1 und Band 2

**Ziel:** `erstes_band.md` und `zweites_band.md` bilden einen zusammenhängenden, speicherbaren Canon-Hauptpfad: Rimuru startet allein, Gobta und Ranga treten story-gesteuert bei, Band 1 endet mit Tempests erster Benennung und Band 2 führt ohne erfundene Haupt-NPCs durch Rat, Aufbau, Flüsterhain und namenloses Echo. `border-escalation` bleibt am Ende eine freiwillige Überleitung; `ancestors-choice` bleibt optionaler Alt-/Nebencontent.

### Bestandsabgleich vom 2026-06-28, aktualisiert nach Band-2-Slices

| Bereich | Aktueller Stand | Offen |
| --- | --- | --- |
| Band-1-Quest | `slime-awakening` ist canonisiert: Veldora sichtbar, Gobta über die Goblin-Bitte, Ranga über den Pakt-Dialog, Benennung startet Band 2. | Nur Politur/Rekrutierungsinszenierung. |
| Party | Neuer Save startet allein mit Rimuru; Gobta und Ranga werden idempotent rekrutiert und per Save-Backfill kompatibel ergänzt. | Gabiru/weitere Canon-Figuren gehören zu späteren Bänden. |
| Band-2-Quest | `binding-of-ancestors` läuft sichtbar über Rigurd, Shuna, Gobta und Ranga; Flüsterhain, Ahnensiegel, Namenloses Echo und Abschluss sind durchspielbar. Quest-/Step-IDs bleiben save-kompatibel. | `border-escalation`/Band-3+-Canonisierung separat. |
| Tempest-Hub | Post-Prolog-Hubmarker, Ratsplatz/Namensstein/Palisade, Band-2-Titelhinweis, Codex-NEU-Signal und Canon-NPC-Sichtbarkeit sind umgesetzt. | Weitere Hub-Politur: Sound, Partygespräche, Ruhepunkt. |
| Ranga-Systeme | Ranga ist Held, Portrait-/Battle-Zuordnung existiert; Band-2-Scoutbeat, Scout-/Reisemenü, entdeckte sichere Schnellreiseziele und Gobta/Ranga-Talent-/Bindungsbezug sind umgesetzt. | Reiseanimation/Politur bleibt Phase 23. |
| Altcontent | Sora/Vael/Lyrre treiben neue Band-2-Hauptsaves nicht mehr sichtbar; alte Originalbogen-/Ending-Saves bekommen ein Compat-Flag; `ancestors-choice` ist nicht mehr Canon-Hauptquest-priorisiert; gesperrte Legacy-Codexnamen werden verdeckt. | Spätere inhaltliche Neubewertung von `border-escalation`/Band 3+ bleibt separat. |
| QA | Headless-Band-1→Band-2-Flow, Checkpoint-Roundtrips, Migrationsmatrix, Daten-Gates, Questmarker, Save-/Codex-Gates, Ranga-Reise-/Legacy-Tests, Browser-E2E Desktop/Mobil, Build und Flüsterhain-Kampfzone sind getestet. | Nächster offener Block ist Phase 23 Erlebnis-Politur. |

[x] **Phase 18 – Story-gesteuerte Party und Save-Grundlage** *(vollständig, 2026-06-28)*

> **Teil 1:** Ranga als spielbarer Held in `HEROES` (Direwolf-Werte, Skills `direwolf-rush`/`predator-aura`/`quick-step`, Battle-Art bereits verdrahtet). Wiederverwendbares Rekrutierungssystem: neuer `recruit-character`-`WorldEffect` + optionaler `WorldState.roster`; `applyEffects` ist öffentlich/idempotent, `applyWorldState` übernimmt Rekrutierte voll geheilt in die aktive Party **ohne** Bestehende zu entfernen. `recruit-character`-Referenzen werden datenseitig validiert.
>
> **Teil 2:** `gobta.startsInParty=false` → ein frischer Spielstand enthält ausschließlich Rimuru (`createInitialParty()` und der Default-Kampf identisch). Gobta tritt über die Dialogoption „Goblindorf schützen" (`hear-goblin-plea`) bei, Ranga über den Direwolf-Sieg (`direwolf-pack-leader`). Save-Rückwärtskompatibilität: `normalize` trägt Story-Rekruten anhand `story.goblin.plea`/`story.direwolf.pact` nach, ohne vorhandene Mitglieder (aktiv ODER Reserve) zu entfernen oder zu duplizieren. Headless-Tests: frischer Save = nur Rimuru, Canon-Rekrutierungsfluss, Backfill, Doppel-Schutz, Roundtrip/NG+; Battle-/Menü-Fixtures auf den neuen Startzustand angepasst.

- **Startzustand korrigieren:** `gobta.startsInParty` auf `false` setzen; ein neuer Spielstand enthält ausschließlich Rimuru. `createInitialParty()` und der Default-Kampf müssen denselben Startzustand liefern.
- **Ranga als Charakter:** Ranga in `HEROES` mit eigenen Basiswerten, Wachstum, Startskills und Ausrüstung ergänzen. Fehlende Ranga-Skills datengetrieben anlegen und durch Datenintegritätstests absichern.
- **Rekrutierung als echter Zustand:** `WorldEffect` um einen idempotenten Effekt wie `recruit-character` erweitern. Der Effekt darf keine Duplikate erzeugen und muss aktive Party/Reserve korrekt persistieren. Für Band 1 gilt eine aktive Dreierparty: Rimuru, Gobta, Ranga.
- **World-/Save-Verknüpfung:** Partyinformationen so in die reine World-Logik einbinden, dass Dialog- und Encounter-Effekte nicht nur ein Flag setzen, sondern tatsächlich den Save-Roster ändern. Szenen bleiben reine Anwender dieser Logik.
- **Kompatibilität bestehender Saves:** vorhandene Mitglieder niemals entfernen. Beim Laden werden Storyflags rückwärtskompatibel ergänzt: `story.goblin.plea` kann fehlenden Gobta, `story.direwolf.pact` fehlenden Ranga nachtragen. Alte Saves, in denen Gobta bereits zu früh vorhanden ist, bleiben spielbar.
- **Party-/Save-Tests:** frischer Save = nur Rimuru; doppelte Rekrutierung bleibt einmalig; aktive Mitglieder überleben Export/Import und New Game+; alte v1/v2/v3-Stände bleiben ladbar.
- **Abnahme:** Der Partybeitritt ist ein wiederverwendbares System und nicht als Sonderfall in `DialogueScene` oder `BattleScene` verdrahtet.

[x] **Phase 19 – Band 1 vollständig canonisieren und abschließen** *(vollständig, 2026-06-28)*

> **Umgesetzt (Teil A):** Veldora ist überall sichtbar (NPC-Name, Dialog-Sprecher, Questtext, Codex-Titel/-Body, Reisepunkt-Text) — interne ID `sealed-storm-dragon` + Flags bleiben; `portraitKindForSpeaker` mappt „Veldora" auf das `storm-dragon`-Portrait. Abnahme-Tests: Canon-Partyfolge Rimuru → +Gobta → +Ranga und Ranga am Rekrutierungszeitpunkt direkt kampftauglich; Veldora-Benennungstest.
>
> **Umgesetzt (Teil B):** Prozedurales **Ranga-Portrait** — neuer `PortraitKind`/`PORTRAIT_KINDS`-Eintrag + `portraitSpec` (Stahl/Gold, Motiv `scout`), `portraitKindForSpeaker('Ranga')` und `isPortraitKind` (Menü-Party-Portrait) ergänzt; Battle-Sprite war bereits verdrahtet. Tests aktualisiert. („Direwolf-Begleiter"-Resttexte existieren nicht — Punkt entfällt.)
>
> **Umgesetzt (Teil C):** Rangas **Pakt-Dialog** auf der Direwolf-Lichtung: Der Sieg unterwirft das Rudel (`story.direwolf.defeated`), erst der Ranga-Dialog `ranga-pact` rekrutiert Ranga sichtbar und setzt `story.direwolf.pact` + Fraktions-/Mount-/Gobta-Progressionsflags. Die Benennung ist zusätzlich hinter `story.direwolf.pact` gegated → der Pakt-Beat ist zwingend, kein Soft-Skip. Marker-/qaGates-/Smoke-Flüsse + Recruit-Test auf den neuen Pakt-Schritt umgestellt. Die Soft-Lock-Kette (Veldora→Rigurd→Lichtung→Pakt→Benennung) ist im Marker- + Reachability-Test abgedeckt; Browser-Smoke-Infra existiert (Playwright, Backlog #1).

- **Veldora sichtbar machen:** NPC-Name, Sprecher, Dialoge, Questtexte, Codex und Portrait-Zuordnung zeigen „Veldora“. Die interne ID `sealed-storm-dragon` darf bestehen bleiben.
- **Gobtas Beitritt:** Die Dialogoption „Goblindorf schützen“ rekrutiert Gobta nach der Goblin-Bitte. Vor diesem Beat darf Gobta weder im Menü noch im Kampf erscheinen.
- **Rangas Beitritt:** Der Direwolf-Kampf setzt zunächst Sieg/Unterwerfung. Ein anschließender Ranga-Dialog schließt den Pakt, benennt Ranga sichtbar und rekrutiert ihn; erst dann gelten `story.direwolf.pact`, Fraktions-, Mount- und Gobta-Progressionsflags.
- **Ranga präsentieren:** prozedurales Portrait, Overworld-/Menü-Fallback und Kampf-Sprite/-Fallback ergänzen. Keine fremden Original-Artworks übernehmen.
- **Prologtexte bereinigen:** generische Formulierungen wie „versiegelter Sturmdrache“ und „Direwolf-Begleiter“ dort durch Veldora/Ranga ersetzen, wo die Figur bereits bekannt ist.
- **Soft-Lock-Schutz:** Gateway und Questmarker führen zwingend Höhle → Goblindorf → Direwolf-Lichtung → Rigurd/Benennung. Der Benennungsabschluss startet `binding-of-ancestors` genau einmal.
- **Abnahme-Tests:** Partyfolge Rimuru → Rimuru+Gobta → Rimuru+Gobta+Ranga; Ranga kann am Rekrutierungszeitpunkt in einem Kampf eingesetzt werden; vollständiger Headless-Prolog und Browser-Smoke auf Desktop/Mobil.
- **Definition of Done Band 1:** alle offenen Punkte aus `erstes_band.md` sind erledigt, der neue Save startet allein und der Prolog endet ohne externe Anleitung in Tempest.

[x] **Phase 20 – Band 2 auf den Canon-Hauptpfad umbauen** *(vollständig für den aktuellen Canon-Hauptpfad, 2026-06-28)*

> **Umgesetzt (Slice 1 — Fundament):** Datengetriebene **NPC-Sichtbarkeit**: `NpcDefinition.requirements` (optional) + `getMapNpcs(mapId, state?)`/`getAdjacentNpc(…, state?)` filtern Story-Anforderungen (analog `getMapLocations`); OverworldScene rendert/interagiert state-gefiltert. Erste Nutzung: Ranga-NPC erscheint erst nach `story.direwolf.defeated` (nicht vor dem Kampf). Ohne State (Reachability) bleiben alle NPCs sichtbar. Headless-Test. **Diese Infrastruktur ermöglicht** Legacy-Isolation (Sora/Vael/Lyrre ausblenden) und „Tempest als Zustand" (Canon-NPCs zur richtigen Zeit) für die folgenden Slices.
>
> **Umgesetzt (Slice 2 — Namenloses Echo):** Der Siegel-Gegner `mordrahn-echo` erscheint im Kampf sichtbar als **„Namenloses Echo"** (interne ID stabil); Battle-View-Test. Quest-/Codex-Texte im Band-2-Hauptfluss vermeiden die alte Figur als sichtbaren Hauptgegner.
>
> **Umgesetzt (Slice 3 — Canon-Re-Route):** Der sichtbare Band-2-Hauptfluss läuft nicht mehr über Sora/Vael/Lyrre, sondern über **Rigurd → Shuna/Gobta/Ranga → Rigurd**. `binding-of-ancestors` und die bestehenden Step-IDs bleiben stabil (`awakening`, `gather-council`, `clear-grove`, `defeat-mordrahn-echo`, `report-sora`); Legacy-Flags (`story.vael.ready`, `story.lyrre.ready`, `bond.sora.*`, `bond.lyrre.*`) werden intern weiter gesetzt, aber von Canon-Dialogen ausgelöst. Tests/Smokes laufen über die Canon-Route.
>
> **Umgesetzt (Slice 4 — Präsentation/Orientierung):** Band-2-Titelhinweis **„Eine Stadt braucht mehr als einen Namen."**, Post-Prolog-Hubmarker (`tempest-council-plaza`, `tempest-name-stone`, `tempest-palisade`), Rigurd-Reaktion auf die sichtbare Siedlungsstruktur und Codex-NEU-Signal für frisch freigeschaltete Einträge.
>
> **Umgesetzt (Slice 5 — Flüsterhain):** Der Flüsterhain hat einen klar abgegrenzten Overworld-Bereich (`bounds`), die Overworld zeichnet Dungeon-Zonen sichtbar, der Pflichtkampf `whispering-grove-ambush` ist testseitig gegen Level-Ausreißer abgesichert, und der Rat schaltet den Tutorial-Codex **Status, Schwächen und Teamleiste** frei.
>
> **Abnahme (lokal verifiziert und nach `origin/main` gepusht):** `tsc --noEmit`, `vitest run` (**158/158**) und `playwright test` (**6/6**) grün; `main` synchron mit `origin/main` nach `401e4e2`.

- [x] **Stabile IDs beibehalten:** Quest-ID `binding-of-ancestors` und bestehende Step-IDs bleiben für alte Saves bestehen. Titel, Beschreibungen, Dialogquellen und sichtbare Gegnernamen wurden inhaltlich neu zugeordnet.
- [x] **Canon-Rollen festlegen:** Rigurd führt Verwaltung/Versorgung und den Abschluss; Gobta und Ranga übernehmen Grenz-/Scoutbericht; Shuna ist Rat-/Ritualfigur und liest die Ahnenzeichen. Rimuru bzw. der Große Weise bleibt innerer Analyseanker, kein neuer erfundener NPC.
- [x] **Band-2-Flow umsetzen:**
  1. Nach der Benennung führt ein klarer Marker zu Rigurd oder Shuna in Tempest.
  2. Der erste Rat zeigt Rigurd, Gobta, Ranga und Shuna als Beteiligte.
  3. Drei kurze Pflichtbeats setzen getrennte Flags: Gründer-/Vorratshilfe, Gobta-/Ranga-Scout und Shunas Ritual-/Ahnenzeichen.
  4. Erst nach diesen Beats öffnet sich der Pflichtkampf im Flüsterhain.
  5. Danach folgt der Kampf gegen ein sichtbar namenloses Echo am Siegel.
  6. Der Bericht bei Rigurd/Shuna schließt `binding-of-ancestors` und markiert Band 2 als abgeschlossen.
- [x] **Keine erfundenen Hauptfiguren:** Sora, Vael und Lyrre treiben keinen Schritt der Canon-Hauptquest mehr voran. `mordrahn-echo` bleibt interne Gegner-ID, erscheint im Band-2-Hauptpfad aber sichtbar als „Namenloses Echo“.
- [x] **Tempest als Zustand:** NPCs, Marker, Texte und sichtbare Hub-Dekorationen wechseln nach `story.slime-prologue.completed` zur jungen Siedlung.
- [x] **NPC-Sichtbarkeit datengetrieben:** `NpcDefinition`/World-Queries filtern Story-Anforderungen, damit Canon-Figuren zum richtigen Zeitpunkt sichtbar sind.
- [x] **Freiwilliger Folge-Hook:** Nach Band 2 startet `border-escalation` nicht automatisch, sondern freiwillig über Gobtas Grenzlage-Dialog.
- [x] **Abnahme:** `binding-of-ancestors` ist von einem Band-1-Save aus ohne Sora/Vael/Lyrre vollständig abschließbar; Questmarker, Codex und Save/Load bilden jeden Schritt korrekt ab.

[x] **Phase 21 – Ranga-Scout, Schnellreise und Legacy-Isolation** *(vollständig, 2026-06-28)*

> **Umgesetzt:** Neues reines System `src/systems/rangaTravel.ts` für Ranga-Reiseziele, Scoutbericht, Statusgründe und Zielauflösung. Die Szenen rendern nur das View-Modell; Schnellreise wird nur für sichere, entdeckte und freigeschaltete Ziele erlaubt.
>
> **Abnahme (lokal verifiziert):** `npx --yes bun@latest run typecheck`, `npx --yes bun@latest run test` (**165/165**), `npx --yes bun@latest run build` und `npx --yes bun@latest run test:e2e` (**6/6**) grün.

- [x] **Entdeckte Reisepunkte:** Sichere Punkte werden erst beim realen Besuch als `travel.ranga.discovered.*` im Save persistiert. Zu unbekannten, gesperrten oder aktuell unsicheren Zielen ist keine Schnellreise möglich.
- [x] **Ranga-Zugang:** Menü-Tab **Ranga** zeigt Scoutbericht, entdeckte Ziele, Gefahrenstufe, blockierte Routen und Reisebutton nur für verfügbare Ziele.
- [x] **Scout-Nutzen in Band 2:** Rangas Scout-Beat markiert Flüsterhain, Grenzroute und möglichen Hain-Hinterhalt. `revealFlag` macht gescoutete Orte auf Karte/Minimap sichtbar, ohne Encounter/Gateways freizuschalten.
- [x] **Legacy-Arc isolieren:** Neue Saves erhalten kein Legacy-Compat-Flag; alte Originalbogen-/Ending-Saves bekommen beim Normalisieren `compat.legacyArc.visible` + `story.original-arc.optional`.
- [x] **Optionale Nebenhandlung:** `ancestors-choice` bleibt technisch erhalten, wird im Questlog aber nicht mehr als Canon-Hauptquest priorisiert.
- [x] **Codex-/Portrait-Bereinigung:** Gesperrte Legacy-Codex-Einträge können eigene `lockedTitle` verwenden; `mordrahn-keeper` verrät im gesperrten Canon-Modus keinen alten Eigennamen. Sichtbare Canon-Figuren von Band 1/2 sind weiterhin in Portrait-/Sprecher-Mapping enthalten.
- [x] **Abnahme:** Neuer Canon-Save enthält keine sichtbare Legacy-Hauptfigur; alter Originalbogen-Save erhält Compat-Flag; Schnellreise funktioniert nur über mit Ranga entdeckte sichere Ziele.

[x] **Phase 22 – Band-1-/Band-2-Integrations-Gate** *(vollständig, 2026-06-28)*

> **Umgesetzt:** Explizites Phase-22-Testfile `test/phase22Integration.test.ts` mit frischem Band-1→Band-2-Gesamtflow, Save/Load-Checkpoints und Migrationsmatrix; Browser-Smoke erweitert auf ersten Flüsterhain-Kampf und Band-2-Abschlussdialog.
>
> **Abnahme (lokal verifiziert):** `npx --yes bun@latest run typecheck`, `npx --yes bun@latest run test` (**170/170**), `npx --yes bun@latest run build` und `npx --yes bun@latest run test:e2e` (**10/10**) grün.

- [x] **Headless-Gesamtflow:** neuer Save → Veldora → Gobta-Beitritt → Direwolf-Boss → Ranga-Pakt/Beitritt → Tempest-Benennung → Rat → drei Aufbauaufgaben → Flüsterhain → namenloses Echo → Band-2-Abschluss.
- [x] **Checkpoint-Tests:** Save/Load jeweils vor und nach Gobta-Beitritt, Ranga-Pakt, Rat, Hain und Echo; keine doppelten Belohnungen, Mitglieder oder Questschritte.
- [x] **Migrationsmatrix:** alter Save ohne Prologflags, alter Save mitten in `binding-of-ancestors`, abgeschlossener alter Act-1-Save und New Game+ werden migriert und bleiben spielbar.
- [x] **Daten-Gates:** jeder Queststep besitzt eine erreichbare Abschlussquelle; alle sichtbaren NPCs/Encounter/Gateways liegen auf begehbaren Kacheln; alle Charakter-, Skill-, Portrait-, Codex- und Gegnerreferenzen sind gültig.
- [x] **Browser-E2E:** Desktop und 390×844 prüfen frischen Start/Party, Band-1-Abschluss, Canon-Rat, ersten Band-2-Kampf und Questabschluss ohne Console-/Renderfehler.
- [x] **Release-Gates:** `typecheck`, `test`, `build` und `test:e2e` grün.
- [x] **Dokumentation:** erledigte Punkte in `erstes_band.md` und `zweites_band.md` abgehakt; verbleibende Aufgaben liegen bei Band 3+ oder optionaler Politur.
- [x] **Definition of Done:** Band 1 und 2 sind in einem frischen Durchlauf zusammenhängend spielbar, verwenden im sichtbaren Hauptpfad nur die festgelegten Canon-Figuren und bleiben mit bestehenden Spielständen kompatibel.

[x] **Phase 23 – Erlebnis-Politur für Band 1 und Band 2** *(vollständig, 2026-06-29)*

**Ziel:** Nach der technischen Integration sollen beide Bände wie ein zusammenhängendes JRPG-Kapitel wirken. Priorität: Tempest-Wachstum → Rekrutierungsszenen → Partygespräche → Kapitelübergänge → Boss-Nachspiel.

**Bereits aus Phase 20 vorgezogen:** Band-2-Titelzeile, erstes sichtbares Tempest-Wachstum (Ratsplatz/Namensstein/Palisade), Codex-NEU-Signal, Hain-Zonenanzeige und Flüsterhain-Kampf-Tutorial.

> **Slice 1 umgesetzt (2026-06-29):** Tempest-Lager als Post-Prolog-Ruhepunkt, aktive Party-Heilung, erste optionale Partygespräche nach Ranga-Pakt/Rat/Hain/Echo sowie `getChapterSummary` für Rückblick, nächstes Ziel, Party-/Rat-/Scout-Highlights und Boss-/Belohnungsnachspiel.
>
> **Abnahme (Slice 1 lokal verifiziert):** `npx --yes bun@latest run typecheck`, `npx --yes bun@latest run test` (**181/181**), `npx --yes bun@latest run build` und `npx --yes bun@latest run test:e2e` (**10/10**) grün.
>
> **Slice 2 umgesetzt (2026-06-29):** Das Kapitel-Summary ist im Quest-/Story-Tab sichtbar: Bandtitel, Rückblick, nächstes Ziel und bis zu drei Highlights werden aus dem Menü-Viewmodel gezeichnet. Der Browser-Smoke öffnet den Quest-/Story-Tab explizit.
>
> **Abnahme (Slice 2 lokal verifiziert):** `npx --yes bun@latest run typecheck`, `npx --yes bun@latest run test` (**182/182**), `npx --yes bun@latest run build` und `npx --yes bun@latest run test:e2e` (**10/10**) grün.
>
> **Slice 3 umgesetzt (2026-06-29):** Aktives Hauptziel wird datengetrieben aus dem aktuellen Queststep abgeleitet (`getTrackedQuestObjective`) und als Zieltext unter der Minimap sowie als violetter Objective-Marker auf Minimap/Weltkarte angezeigt. Gesperrte Zielorte bleiben im Hinweis sichtbar, bekommen aber erst nach Unlock/Scout einen Marker.
>
> **Abnahme (Slice 3 lokal verifiziert):** `npx --yes bun@latest run typecheck`, `npx --yes bun@latest run test` (**184/184**), `npx --yes bun@latest run build` und `npx --yes bun@latest run test:e2e` (**10/10**) grün.
>
> **Slice 4 umgesetzt (2026-06-29):** Dialoge zeigen kurze Story-Moment-Panels für Rekrutierung, Benennung, Pakt, Rast und Questabschluss. Ergänzend inszeniert ein persistentes Meilenstein-System Gobtas Beitritt, Direwolf-Sieg, Rangas Pakt, Tempests Benennung, ersten Rat, namenloses Echo und Band-2-Abschluss.
>
> **Slice 5 umgesetzt (2026-06-29):** Ranga-Schnellreise läuft über eine eigene, überspringbare Reiseszene mit Ranga-Cutout, Bewegungsreduktion und drei einmaligen optionalen Routenfunden. Desktop-/Mobil-E2E prüft Reise, Fund, Belohnung und Zielort.
>
> **Slice 6 umgesetzt (2026-06-29):** Adaptive Codexanker und direkte Direwolf-/Hain-/Echo-Kampftipps, aktive Dreiergruppe plus Reserveverwaltung, automatischer Reserveüberlauf, Menütausch, expliziter Lager-Speicherpunkt und drei Tempest-Wachstumsstufen.
>
> **Finale Abnahme:** `bun run typecheck`, `bun run test` (**207/207**), `bun run build` ohne Chunkwarnung und `bun run test:e2e` (**16/16**) grün. Phaser wird als stabiler Vendor-Chunk ausgeliefert.

- [x] **Kapitelübergänge:** Bandtitel, Rückblick, nächstes Ziel, Meilenstein-Overlay und persistenter Bandabschluss.
- [x] **Tempest sichtbar wachsen lassen:** Marker, Rigurd-Positionen/-Dialoge und Vorratssortiment reagieren auf Prolog, Rat, Kijin-Benennung und Band-2-Abschluss.
- [x] **Rekrutierungs- und Benennungsszenen:** Gobta, Ranga und Tempests Name erhalten eigene kurze audiovisuelle Meilensteine.
- [x] **Partygespräche:** optionale, einmalige Lagerdialoge nach Pakt, Rat, Hain und Echo.
- [x] **Wegführung:** aktive Hauptquest, Zieltext, Minimap-/Weltmarker, gesperrte Zielhinweise und Questlog-Priorisierung.
- [x] **Boss-Nachspiel:** Direwolf und namenloses Echo erhalten Abschluss-Meilenstein, nächste Aufgabe und Hub-Reaktion.
- [x] **Ranga-Reisegefühl:** überspringbare Reiseinszenierung, reduzierte Bewegung und optionale einmalige Entdeckungen.
- [x] **Adaptive Tutorials:** Direwolf-, Hain- und Echo-Hinweise erscheinen einmalig beim tatsächlichen Encounter; Scout-/Reisehinweise erst nach Rangas Pakt.
- [x] **Ruhepunkt:** Heilen, explizit speichern, Partygespräche und aktive Gruppe/Reserve verwalten.
- [x] **Bandabschluss:** Summary und Meilenstein zeigen Rekruten, Fortschritt, Belohnung und freiwilligen Band-3-Hook.
- [x] **Präsentationsregeln:** Sequenzen sind kurz, überspringbar, touch-tauglich und respektieren reduzierte Bewegung.
- [x] **Abnahme:** Desktop und 390×844 prüfen Meilenstein, Reise, Partytausch und Storyflows ohne Console-/Renderfehler; Headless-Tests sichern Zustandswechsel und Einmaligkeit.


[x] **Phase 24 – Userfeedback: Bild-Assets** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-24-assets`)*
> **✅ Status (2026-06-29):** Alle Nicht-Asset-Punkte waren bereits umgesetzt; die verbliebenen Bild-Asset-Punkte sind jetzt integriert: Rimuru nutzt in der Oberwelt das blaue Schleim-Asset, der Waldschleim nutzt das grüne Spezialasset, und Veldora ersetzt das prozedurale Sturmdrachen-Portrait durch ein dediziertes Imagegen-Portrait. Provenienz steht in `ASSETS.md`. Abnahme: `bun run typecheck`, `bun run test` (211/211), `bun run build`, `bun run test:e2e` (16/16 Desktop+Mobil). **Separat offen:** Shuna-Pacing-Frage (Story-Design).

[x] **Phase 25 – Imagegen-Portrait-Pass Kerncast** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-25-portraits`)*
> **✅ Status (2026-06-29):** Der offene Phase-13-Politurpunkt „echte Portraits statt prozeduraler Busts" ist für den aktuellen Canon-Kerncast geschlossen: Rimuru, Gobta, Shuna, Rigurd und Ranga haben projektgenerierte, auf 512×512-WebP optimierte Portraits unter den bestehenden `portrait-<kind>`-Keys. Veldora kam bereits in Phase 24 dazu; historische Nicht-Canon-Figuren bleiben prozedurale Fallbacks. Provenienz steht in `ASSETS.md`. Abnahme: `bun run typecheck`, `bun run test` (212/212), `bun run build`, `bun run test:e2e` (16/16 Desktop+Mobil).

[x] **Phase 26 – Regionale Imagegen-Overworld-Tiles** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-26-region-tiles`)*
> **✅ Status (2026-06-29):** Der Backlog-Punkt „Pro-Karte-Tile-Theming" ist für Geistmoor und Geisterschrein-Hochland geschlossen: beide Regionen nutzen eigene, auf 128×128-WebP optimierte Imagegen-Boden-/Wandtiles statt Jura-Gras/Jura-Wand. Die Auswahl läuft über ein reines Mapping mit Fallbacks auf Legacy-Kenney-Tiles und prozedurale Platzhalter. Provenienz steht in `ASSETS.md`. Abnahme: `bun run typecheck`, `bun run test` (216/216), `bun run build`, `bun run test:e2e` (16/16 Desktop+Mobil).

[x] **Phase 27 – Dwargon-Arc (Canon Band 1/2, Arc A2)** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-27-dwargon`)*
> **✅ Status (2026-06-29):** Der bislang nur als Datenblatt vorhandene Dwargon-Inhalt ist jetzt spielbar — reine Daten-/Welt-Phase ohne Szenen-/Render-Änderungen (kollisionsfrei zu den parallelen Asset-Worktrees 24–26).
> - **Neue Region `dwargon`** (`maps.ts`): sichere Schmiedestadt (24×14, Werkstattviertel + Thronterrasse), in `MAPS`/`MAP_NAMES` registriert. Keine Zufallskämpfe → der Encounter-Balance-Gate überspringt die Region; Erreichbarkeit über Gateways ist gewährleistet.
> - **Gateways** (`world.ts`): `gate-to-dwargon` vom Jura-Wald (gated über `story.kijin.named` — Kurobes Schmiedekunst weckt das Interesse) + Rücktor `dwargon-gate-tempest`.
> - **Questline `dwargon-craft`**: Gazels Urteil schaltet `craft.smithing.unlocked` frei → Kaijin und seine Brüder treten Tempest bei (`recruit-character kaijin`), Belohnung 120 Gold + Magisteel.
> - **Kaijin** als rekrutierbare Heldenfigur (`characters.ts`, Zwerg-Meisteringenieur, defensiv); NPCs Gazel Dwargo + Kaijin mit eigenen Dialogen; Codex „Dwargon"/„Gazel Dwargo".
> - **Drei Dwargon-Shops** (`dwargon-smithy`/`-apothecary`/`-trader`) auf begehbaren Kacheln; Premium-Magisteel-Ausrüstung erst nach `craft.smithing.unlocked`.
> - **Abnahme:** `bun run typecheck`, `bun run test` (**222/222**, inkl. 6 neue Dwargon-Checks), `bun run build` (nur bekannter Phaser-Vendor-Chunk). Branch auf aktuellen `main` (Phase 26) rebased.

[x] **Phase 28 – Orc-Disaster-Arc (Canon Band 2, Arc A3)** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-28-orc-disaster`)*
> **✅ Status (2026-06-29):** Reine Daten-/Welt-Phase. Neue Trigger-Region `jura-battlefield` (keine Zufallskämpfe → Balance-Gate überspringt sie), Gateway vom Jura-Wald (gated über `faction.kijin.sworn`) + Rücktor. Questline `geld-disaster`: Treynis Warnung → Ork-Vorhut brechen (`orc-general`/`orc-soldier`) → Boss `orc-disaster` „Geld" → Jura-Tempest-Föderation gründen (320 Gold + Hungeramulett). Verkabelt die verwaisten Bossgegner. NPCs Treyni, Föderations-Rigurd, **Milim** (Honig-Pakt, kein Bosskampf — Canon-treu); Codex Treyni/Föderation/Dämonenlords. Abnahme: `typecheck`, `test` (221/221, 5 neue), `build`.

[x] **Phase 29 – Echsenmenschen/Gabiru-Allianz (Canon Band 2, Arc A3 `lizard-alliance`)** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-29-lizard-alliance`)*
> **✅ Status (2026-06-29):** Reine Daten-/Welt-Phase. Neue Trigger-Region `lizardman-marsh` (Echsen-Sumpf), Gateway vom Jura-Wald (gated über `faction.kijin.sworn`) + Rücktor. Questline `lizard-alliance`: Soukas Warnung → den überheblichen **Gabiru** im Schilfkessel demütigen (Boss `gabiru` + `lizardman-warrior`) → Bündnis besiegeln (200 Gold + Tempest-Charm). Gabirus spielbarer Beitritt bleibt canon-treu „spätere Läuterung". NPC Souka (zweistufiger Dialog); Codex Echsenmenschen/Sumpf-Bündnis. Abnahme: `typecheck`, `test` (221/221, 5 neue), `build`.

[x] **Phase 30 – Shizu & Ifrit (Canon Band 1)** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-30-shizu-ifrit`)*
> **✅ Status (2026-06-29):** Reine Daten-/Welt-Phase. Neue Trigger-Region `ember-hollow` (Glutgrotte), Gateway vom Jura-Wald (gated über `story.kijin.named`) + Rücktor. Questline `shizu-vow`: Shizu treffen → maskierten **Majin** vertreiben → **Ifrit** bezwingen → Shizus Schwur tragen (Rimuru gewinnt menschliche Gestalt + Ifrit-Flamme, symbolisiert durch die Geistglut `spirit-ember`; 260 Gold). Verkabelt die letzten verwaisten Bossgegner. NPC Shizu (zweistufiger Dialog); Codex Shizu/Ifrit/Andersweltler. Abnahme: `typecheck`, `test` (221/221, 5 neue), `build`.

> **Integration (2026-06-29):** Phasen 27–30 in `main` gemergt. Konflikte (additive Array-Enden in `world.ts`/`maps.ts`) sauber aufgelöst; Gesamtsuite **237/237** grün, `build` ok. Der Jura-Wald-Hub verzweigt nun zu vier Band-1/2-Regionen → `analyzeOverworldBudget`-Markercap von 80 auf 96 rekalibriert (gated, gegenseitig exklusive Marker).

[x] **Phase 31 – Imagegen-Battle-Arenen für kommende Canon-Arcs** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-31-canon-arenas`)*
> **✅ Status (2026-06-29):** Die nächsten Story-Arcs aus dem Plan haben jetzt wiederverwendbare Battle-Arena-Assets: Oger/Kijin-Ruine, Ork-Schlachtfeld, Echsen-Sumpf, Geisterhöhle und Milim-Ankunft. Die fünf 1280×720-WebPs sind über `battleArt.ts` per geplanter Map-/Encounter-IDs verdrahtet, in `PreloadScene` geladen und in `ASSETS.md` dokumentiert. Abnahme: `bun run typecheck`, `bun run test` (217/217), `bun run build`, `bun run test:e2e` (16/16 Desktop+Mobil), Contact-Sheet-Review der Arenen.

[x] **Phase 32 – Blumund & Free-Guild-Assets** *(abgeschlossen 2026-06-30, Worktree `worktree/tempest-phase-32-blumund`)*
> **✅ Status (2026-06-30):** Der erste geordnete Menschenkontakt ist als sicherer Content-Slice spielbar: Region `blumund`, nach der Föderationsgründung freigeschaltete Handelsstraße, dreistufige Free-Guild-Quest mit Fuze sowie Kaval/Eren/Gido, Gildenbedarf, zwei Codexeinträge und ein idempotentes Handelsabkommen. Blumund nutzt eigene projektgenerierte 128×128-WebP-Tiles für warmes Stadtpflaster und klar blockierende rotbraune Dächer/Gebäude; Provenienz steht in `ASSETS.md`. Abnahme: `bun run typecheck`, `bun run test` (**243/243**), `bun run build` und `bun run test:e2e` (**18/18**, einschließlich Blumund-Gate/Assets auf Desktop und 390×844) grün.

[x] **Asset-Slice 27B – Regionale Imagegen-Gegner-Cutouts** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-27-enemy-cutouts`)*
> **✅ Status (2026-06-29):** Vier vormals generische Gegnerlinien nutzen jetzt eigene, auf 512×512-WebP optimierte Imagegen-Cutouts mit Alpha: Sporenmotte, Orkspäher, Echsenakolyth und Sumpfschrecken. Die Auswahl läuft über exportierte Texture-Keys in `enemyArt.ts`, wird in `PreloadScene` geladen und behält pro Gegner einen prozeduralen Fallback. Provenienz steht in `ASSETS.md`. Abnahme: `bun run typecheck`, `bun run test` (217/217), `bun run build`, `bun run test:e2e` (16/16 Desktop+Mobil).

[x] **Asset-Slice 28B – Imagegen-Gebietsindikator** *(abgeschlossen 2026-06-29, Worktree `worktree/tempest-phase-28-region-banners`)*
> **✅ Status (2026-06-29):** Der offene Wunsch nach einem sichtbaren Gebietsindikator ist als Asset-Slice umgesetzt: jede Hauptkarte bekommt ein kompaktes, regionales 512×128-Imagegen-Banner unter der Minimap plus klare Text-/Fallback-Zuordnung. Die Banner werden ueber `regionBannerArt.ts` gemappt, in `PreloadScene` geladen und im Overworld-HUD mit lesbarer Textauflage gerendert. Provenienz steht in `ASSETS.md`. Abnahme: `bun run typecheck`, `bun run test` (219/219), `bun run build`, `bun run test:e2e` (16/16 Desktop+Mobil), gezielter Visual-Smoke Desktop+Mobil.

[x] **Phase 33 – Imagegen-Storyportraits I: Shizu & Fuze** *(abgeschlossen 2026-06-30, Worktree `worktree/tempest-phase-33-story-portraits`)*
> **✅ Status (2026-06-30):** Der erste Portrait-Slice nach dem Kerncast schließt die sichtbarsten Dialoglücken der neuen Regionen: Shizu als emotionaler Anker der Glutgrotten-Quest und Gildenmeister Fuze als Ansprechpartner des Blumund-Arcs nutzen eigene projektgenerierte 512×512-WebPs statt portraitloser Dialoge. Sprecherzuordnung, prozedurale Fallback-Specs, Preload-Wiring und Provenienz sind ergänzt. Abnahme: `bun run typecheck`, `bun run test` (**249/249**), `bun run build` und gezielter `bun run test:e2e`-Asset-Smoke (**2/2**, Desktop + 390×844) grün.

[x] **Phase 34 – Imagegen-Gebietsbanner II: Canon-Regionen** *(abgeschlossen 2026-06-30, Worktree `worktree/tempest-phase-34-region-banners`)*
> **✅ Status (2026-06-30):** Dwargon, Jura-Schlachtfeld, Echsen-Sumpf, Glutgrotte und Blumund besitzen jetzt eigene projektgenerierte 512×128-WebP-Gebietsbanner statt visueller Fallbacks auf ältere Regionen. Das Banner-Mapping ist damit für alle elf Karten eindeutig; Preload-Wiring, Provenienz und Asset-Abdeckung sind getestet. Abnahme: `bun run typecheck`, `bun run test` (**250/250**), `bun run build` und `bun run test:e2e` (**18/18**, Desktop + 390×844) grün; alle fünf finalen HUD-Crops wurden visuell geprüft.

[x] **Phase 35 – Imagegen-Party-Cutouts I: Kijin & Kaijin** *(abgeschlossen 2026-06-30, Worktree `worktree/tempest-phase-35-canon-party-art`)*
> **✅ Status (2026-06-30):** Benimaru, Shion, Hakurou, Kurobe, Souei und Kaijin besitzen jetzt eigene transparente 512×512-WebP-Kampf-Cutouts. Damit deckt `PARTY_BATTLE_ART` alle zehn aktuell spielbaren Figuren ab; Preload-Wiring, Provenienz, Dateiformat und transparente Ecken sind geprüft. Soueis erste Faden-Variante wurde wegen unsauberer Freistellung verworfen und durch eine klare Ein-Waffen-Silhouette ersetzt. Abnahme: `bun run typecheck`, `bun run test` (**250/250**), `bun run build` und gezielter `bun run test:e2e -- --grep "Kijin- und Kaijin"` (**2/2**, Desktop + 390×844) grün. Ein zusätzlicher Gesamtlauf wurde nach fünf grünen Desktop-Fällen extern per SIGTERM beendet; der phasenspezifische Browser-Gate blieb vollständig grün.

[x] **Phase 36 – Imagegen-Rosterportraits II: Kijin & Kaijin** *(abgeschlossen 2026-06-30, Worktree `worktree/tempest-phase-36-canon-portraits`)*
> **✅ Status (2026-06-30):** Benimaru, Shion, Hakurou, Kurobe, Souei und Kaijin besitzen jetzt eigene 512×512-WebP-Menü-/Dialogportraits auf Basis der freigegebenen Kampf-Cutouts. `PORTRAIT_KINDS`, Sprecherzuordnung, Menüvalidierung und Preload-Wiring decken damit alle zehn spielbaren Figuren ab; Provenienz ist in `ASSETS.md` dokumentiert. Abnahme: `bun run typecheck`, `bun run test` (**251/251**), `bun run build` und gezielter `bun run test:e2e -- --grep "Kijin- und Kaijin"` (**2/2**, Desktop + 390×844) grün.

Tutorial: Die steuerung sollte anfangs mit einem tutorial erklärt werden wie man läuft, interagiert & das menu aufruft. Die schaltflächen oben rechts sollten nur noch menu enthalten & unter der minimap sein. Ausserdem sollte rangas schnellreisen gegated werden & erst verfügbar sein, wenns soweit ist. Auch die pfeiltasten machen nur im tutorial Sinn. später stören diese nur.
- Menu: Die menu pages sollten scrollcontainer haben für ihren body und overflowing content wie quests & codex einträge scrollbar anzeigen. Am besten abgeschlossenen Quets & codex einträge hinter einem Filter verstecken. 
- Menu: Status headline,Sowie Questeintrag 1, codex eintrag 1, Ranga noch nicht im pakt, ausrüstung, inventar & party  overlapped "Quests & Story Aktiv 1 * Abgeschlossen 0
- Menu: Die Breite eines Questeintrags ist zu gering Belohnung ist auf der kannte ganz unten. Ausserdem sollte es eine möglichkeit geben sich die quest genau anzeigen zu lassen mit weiteren details. so kann in der übersicht nur eine summary stehen & kein ganzes buch
- Menu: Namensgebung Entwicklungen & Bindungen sollten unter status stehen
- Menu: Das ablegen & verzaubern im menu ist ebenfalls verrutscht & sieht nicht gut aus.
- Menu: party wird in jeder menu page angezeigt. das ist vergäudeter platz.
- Menu: eine kurze beschreibung für jeden menu eintrag wäre gut, dann weiß man was jeder menupunkt machen soll. 
- Avatar: Es fehlt ein rimuru assets (blauer schleim als hauptfigur zum steuern) ausserdem sollten waldschleime auch grün sein. & andere schleime entsprechene Farben haben (imagegen)
- Tutorial: Veldora braucht auch noch assets damit alles nicht so generisch aussieht (imagegen)
- Rigurd sollte nach dem tutorial nicht sagen willkommen am Rand von tempest sondern willkommen am rand vom jurawald (so heißt das gebit, tempest gibt es ja am anfang noch garnicht, muss erst später gegründet werden). 
- Gebietsindikator: ✅ *(2026-06-29, Phase 28)* Imagegen-Banner plus Gebietsname werden direkt unter der Minimap angezeigt (z. B. Goblin-Dorf, Jura-Wald, Geistmoor).
- Nach einem Sieg: Zurück zur welt & das ergebniss sind noch verbesserungwürdig es fehtl eine sichtbare dialogbox oder alles gleich richtig umsetzten.
- Kommt shuna erst ab Band 2 vor? mir kommt es vor das es zu schnell geht???
- die npcs brauchen kollisionen. & grenzübergänge in andere gebiete dürfen nur wenn man auf denen steht in die nächste ebene übergehen nicht ein feld vorher schon.


## Verifikation (Methodik)
- **Headless-Logik:** `bun run test` (Vitest) gegen `src/systems` & `src/data` — Kampf-Determinismus, Save-Roundtrip/Migration, Datenintegrität, Talentbäume, Beziehungen, Aufholmechaniken, Balance-Bänder.
- **Typsicherheit:** `tsc --noEmit` in CI.
- **Manuell/Browser:** `bun run dev`, Prüfung in Handygröße (390×844) und Desktop; optional Playwright-Screenshots.
- **Smoke-Flow:** Oberwelt bewegen → Begegnung → Kampf gewinnen → Menü/Ausrüstung → Speichern → neu laden (Stand bleibt) → Reset.

## Verbesserungs-Backlog (Ideen, priorisiert — 2026-06-28)
Reflexion über den aktuellen Stand (3-Akt-Story + Enden, 4 Nebenquests + Postgame-Boss, 3 Regionen/Multi-Map, Phaser 4, Talentbäume). Geordnet nach Wert, nicht nach Aufwand.

**Priorität HOCH — Korrektheit/QA (genau die Bug-Klasse, die uns mehrfach getroffen hat)**
1. **Browser-Smoke in CI (Playwright)** ✅ *(2026-06-28, Phase 17)*: bootet das Spiel headless im Browser auf Desktop und Mobil, prüft Canvas-Inhalt sowie Console-/Page-Errors und läuft in CI und vor dem Pages-Deploy.
2. **Save-Kompatibilitäts-Test** ✅ *(2026-06-28)*: `playthrough.test` migriert einen alten v1-Stand auf v3 und spielt den kompletten Act-1-Bogen darauf durch (Questabschluss + Codex + `story.act1.completed`) → kein Soft-Lock durch Schema-/Content-Drift. Künftig pro großem Content-Schritt erweiterbar.

**Priorität MITTEL — Welt lebendiger machen (die neuen Regionen sind aktuell reine Kampfzonen)**
3. **Pro-Karte-Tile-Theming:** ✅ *(2026-06-29, Phase 26)* Geistmoor und Geisterschrein-Hochland nutzen eigene Imagegen-Boden-/Wandtiles (Moor = dunkel/wasserig, Hochland = Stein/Wind) mit Legacy-/Platzhalter-Fallbacks.
4. **Regionale NPCs + kleine Quests** in Geistmoor/Geisterschrein → Orte mit Eigenleben statt nur Encounter-Feldern. ✅ *(2026-06-28, Geistmoor)*: Moorhüterin Eir + Quest „Fäulnis im Moor" (Fäulnis-Encounter reinigen → Gold + Tempest-Charm + Codex `marsh-keeper`); map-aware Playthrough-Test. ✅ *(2026-06-28, Geisterschrein)*: Schreinwächter Kael + Quest „Wache am Schrein" (Sturmecho `shrine-windecho` bannen → Gold + Tempest-Charm + Codex `shrine-watcher`). Alle 3 Regionen haben jetzt eine eigene Quest/NPC.
5. **Minimap/Regions-Anzeige:** ✅ *(2026-06-29, Phase 28)* Der Gebietsname steht als Imagegen-Region-Banner direkt unter der Minimap; jede Hauptkarte besitzt ein eigenes kompaktes Banner mit Fallback auf das Startgebiet.

**Priorität MITTEL — Spielgefühl & Onboarding**
6. **Kampftiefe sichtbar machen:** Break-Leiste, Team-Meter und Reaktionsfenster existieren mechanisch, werden aber kaum erklärt/hervorgehoben → optionales Kampf-Tutorial + klarere HUD-Hinweise. ✅ *(2026-06-28, Band-2-Flüsterhain-Slice teilweise umgesetzt)*: Rat vor dem Flüsterhain schaltet einen Codex-Tutorialeintrag zu Status, Schwächen und Teamleiste frei; offen bleiben HUD-Hervorhebung/Break-Reaktionsfenster direkt im Kampf.
7. **Quest-Log:** „aktive Quest verfolgen"/Sortierung, sobald viele Quests offen sind. ✅ *(2026-06-28)*: `buildQuestLog` sortiert jetzt aktiv→abgeschlossen→offen (stabil); das Menü blendet unentdeckte Quests aus (kein Flut/Spoiler), zeigt aktive als volle Panels mit Wegführung + abgeschlossene kompakt einzeilig als Archiv und einen „Aktiv N · Abgeschlossen M"-Zähler. Behebt zugleich den Overflow (Canvas nur 540px, das alte Layout lief ab der 3. Quest aus dem Bild).

**Priorität MITTEL — Progression & Replay**
8. **NG+ / Ende-Galerie:** ✅ *(2026-06-28)* Persistentes `PlayerProfile` speichert gesehene Enden und NG+-Durchläufe unabhängig vom Spielstand. Der Ende-Bildschirm zeigt eine spoilerfreie 3-Enden-Galerie und startet optional New Game+; dabei bleiben Party-Level/-Skills, Ausrüstung, Inventar, Gold und Progression erhalten, während Story, Quests und Ort zurückgesetzt und die Party voll geheilt werden. Headless getestet.
9. **Canon-Begleiter rekrutieren:** Gobta und Ranga werden in Phase 18/19 story-gesteuert zu aktiven Mitgliedern; Gabiru folgt laut Band-4-Plan später. Sora/Vael/Lyrre werden nicht als Canon-Party ausgebaut.

**Priorität NIEDRIG — Technik/Wartbarkeit/Politur**
10. **`src/data/world.ts` (~1500 Z.) in Module splitten** (quests/dialogs/encounters/locations/lore) → Wartbarkeit + weniger Merge-Konflikte bei Parallelarbeit.
11. **Asset-/Szenen-Lazy-Loading je Region** (Bundle ~1,85 MB nach Phaser 4) — bewusst aufgeschoben; bei wachsendem Content sinnvoll.
12. **Offene Phase-13-Politur:** längere CC0-Musik-Loops statt kurzer Jingles, mehr Sprite-Varianz. ✅ *(2026-06-29, Phase 25)* Echte Imagegen-Portraits für den aktuellen Canon-Kerncast Rimuru/Gobta/Shuna/Rigurd/Ranga plus Veldora aus Phase 24 sind integriert; nur historische/future Figuren nutzen weiter prozedurale Fallbacks. ✅ *(2026-06-29, Phase 26)* Regionale Tile-Varianz für Geistmoor/Geisterschrein-Hochland ist umgesetzt.
13. **Balance-Pass mit neuem Content:** Levelkurve über 3 Regionen + Postgame-Superboss + Act-2/3-Bosse formal gegen ein Level-/Schwierigkeitsband testen (erweitert `analyzePhase15Balance`). ✅ *(2026-06-28)*: `analyzeEncounterBalance` (in `analyzePhase15Balance` eingefaltet) prüft (1) jeder Encounter referenziert echte Gegner mit Level ≥ 1 und (2) die ambiente Zufallsschwierigkeit steigt entlang der Reisekette (BFS über den Gateway-Graphen ab `tempest-start`) monoton — keine Region ist ein Rückschritt. Story-Trigger/Bosse dürfen spiken. Daten sind aktuell stimmig (tempest 1–4 → marsh 2–5 → highlands 5–8); der Gate sichert das gegen künftigen Content-Drift.

## QoL-Änderungen (Userwunsch, 2026-06-28)
[x] **A — Überlevel-Schutz** ✅: Wenn die Party signifikant über dem Gebietslevel liegt, greifen Zufallsmonster nicht mehr an.
- **Umsetzung:** `WorldState.partyLevel` (optional) aus `max(active party level)` in `createWorldState`. In `resolveEncounter` werden **nur Zufallsbegegnungen** übersprungen, wenn `partyLevel − maxEnemyLevel(encounter) ≥ OVERLEVEL_AVOIDANCE_GAP` (=5). Trigger-/Story-Encounter bleiben immer aktiv. Headless-Test in `world.test`.
[x] **B — Minimap** ✅: Karten scrollen (Kamera folgt, Map > Screen) → fixiertes Marker-Radar oben rechts.
- **Umsetzung:** `src/systems/minimap.ts` `buildMinimap(mapW, mapH, marker[])` → testbares Pixel-Modell (Zellgröße/Scaling/Clamping). Marker-Radar (Spieler/Gateway/NPC/Landmark) als fixiertes Panel oben rechts in der `OverworldScene`; Spieler-Punkt folgt der Bewegung. Keine Wand-Tiles (Renderbudget).
[x] **C — Grenzriss-Gate** ✅: Der `gate-to-marsh` (Pfad ins Geistmoor) öffnet erst nach Abschluss von „Grenzfeuer" (border-escalation, Höhepunkt am Grenzriss).
- **Umsetzung:** `unlockFlag: 'story.act2.completed'` an `gate-to-marsh`. `getMapLocations` filtert bereits per Flag (Marker verschwindet); `getAdjacentTravel` bekommt denselben Flag-Filter (Reise blockiert bis freigeschaltet). Rückweg-Gateways bleiben offen.

## Canon-Content aus Tensura LN Band 1 & 2 (Lore-Recherche & Content-Vorschlag, 2026-06-28)

> **Quelle:** die ersten beiden Light Novels von „Tensei shitara Slime Datta Ken". Die
> bestehenden „Bänder" sind bewusst ein eigenständiger JRPG-Bogen (keine 1:1-Adaption) und
> haben mehrere zentrale LN-Arcs noch **nicht** abgedeckt. Die folgenden Arcs/Figuren sind
> LN-treu und lassen sich modular als Regionen, Quests, Begleiter und Bosse ergänzen.
> **Mechanik-Anker (alles vorhanden):** `recruit-character`, Naming/Evolution als sichtbarer
> Story-Beat, Maps/Gateways, Encounter+`victoryEffects`, Codex, NPC-Sichtbarkeit, Schnellreise.
> **Stabile IDs beibehalten**, sichtbare Namen Canon (Projektregel der Band-Docs).

### Band 1 (LN Vol 1) — noch offene Canon-Beats
1. **Zwergenkönigreich Dwargon** *(neue Region + Begleiter)* — Rimuru reist ins Bewaffnete
   Königreich Dwargon (Handel/Handwerk). Beats: Markt/Schmiede, ein Zwischenfall am Tor/in der
   Taverne, Minister **Vesta** als Intrigant, König **Gazel Dwargo** (Schwertheld). **Kaijin**
   (Meisterhandwerker) und die drei Brüder **Garm/Dord/Myrd** schließen sich Tempest an →
   schaltet **Schmieden/Bau/Ausrüstungstier** frei. Spielhook: neue Map `dwargon`, Gateway vom
   Jura-Wald, recruit-character `kaijin`, Shop/Crafting-Erweiterung, Codex „Dwargon", Vesta als
   späterer optionaler Forscher.
2. **Shizu (Shizue Izawa) & Ifrit** *(emotionaler Hauptbeat + Mechanik)* — ✅ **umgesetzt in Phase 30** (Region `ember-hollow`, Quest `shizu-vow`: Majin → Ifrit → Schwur, Geistglut-Belohnung; 5 Schüler-Kinder als späterer Arc offen). Begegnung mit der
   Andersweltlerin Shizu (A-Rang, Wirtin des Flammengeists **Ifrit**, Maske zur Kontrolle).
   Beat: Ifrit-Konflikt, Shizus Ende, Rimuru nimmt sie auf ihren Wunsch auf → erhält die
   **menschliche Form** (Rimurus Menschengestalt nach Shizu) und Ifrits Flamme; **Schwur**,
   ihre Schüler zu schützen. Spielhook: Story-Encounter `ifrit`, `recruit`/Form-Unlock für
   Rimuru (menschliche Gestalt als Skin/Form), Quest „Shizus Schwur", die 5 Schüler-Kinder als
   späterer Care-/Eskort-Arc (Vol 3+).
3. **Gründung & Aufbau von Tempest** *(Hub-Wachstum)* — vom geretteten Goblindorf zur jungen
   Stadt: Benennung der Nation, Wasser/Infrastruktur, erste Händler. Knüpft an den vorhandenen
   Hub-State an (mehr Stufen: nach Dwargon-Handel, nach Kijin-Beitritt).

### Band 2 (LN Vol 2) — der große Bogen
4. **Die Oger → Kijin** *(Begleiter-Arc, Naming als Beat)* — sechs Oger-Überlebende (ihr Dorf
   von einer Ork-Armee unter einem **maskierten Majin** ausgelöscht) greifen Tempest aus einem
   Missverständnis an. Nach Klärung benennt Rimuru sie → **Kijin** (Naming-Evolution, fast
   erschöpfend): **Benimaru** (General, Flamme), **Shion** (Sekretärin/Leibwache, Kraft),
   **Hakurou** (Schwertmeister/Trainer), **Kurobe** (Schmied), **Souei** (Späher/Verdeckt) —
   **Shuna** ist bereits als Held im Spiel. Spielhook: Story-Encounter „Missverständnis",
   recruit-character `benimaru`/`shion`/`hakurou`/`kurobe`/`souei`, sichtbarer Naming-Beat
   (Oger→Kijin, analog Goblin→Hobgoblin), Codex-Einträge.
5. **Orc-Disaster** *(großer Boss-Arc)* — eine Hungersnot treibt ~200.000 Orks in den Jura-Wald.
   Der **Orc-Lord** trägt die Fähigkeit „Ausgehungerte" (alles fressen → Macht). Hintergrund:
   **Gelmud**, der Namen verteilt, um Dämonenlords zu erzwingen. Der Orc-Lord wird zum
   **Orc-Disaster (Geld)** — Katastrophenklasse — und frisst Gelmud. Höhepunkt: Rimuru
   **prädiert** Geld (Power-Spike Richtung Dämonenlord-Seed). Spielhook: neue Gegner (`orc-*`,
   `orc-lord`, `orc-disaster`), Pflicht-Bosskampf mit `victoryEffects` = Story-Flag + große
   Belohnung; ein überlebender Hoch-Ork erbt „Geld" und tritt Tempest bei.
6. **Die Echsenmenschen** *(Allianz)* — der Häuptling, seine fähige Tochter **Souka** und der
   ruhmsüchtige Sohn **Gabiru** (überhebt sich, wird besiegt, später Läuterung). Allianz gegen
   die Orks. Spielhook: Sumpf-Region/-NPCs (knüpft thematisch an das vorhandene Geistmoor an),
   recruit/ally `gabiru`/`souka` (Gabiru war in den Band-Docs ohnehin für später vorgesehen).
7. **Treyni & die Wald-Allianz** *(Bündnis + Schlacht)* — die Dryade **Treyni** (Hüterin des
   Jura-Walds) bittet Rimuru um Hilfe; Tempest + Echsenmenschen + Waldgeister bilden die
   Allianz für die große Schlacht gegen die Ork-Armee. Spielhook: Allianz-NPC `treyni`,
   mehrstufiger Schlacht-Encounter, sichtbares „Bündnis schmieden".
8. **Gründung der Jura-Tempest-Föderation + Milim Nava** *(Bandabschluss)* — nach dem Sieg
   vereinen sich die Waldvölker zur **Jura-Tempest-Föderation**. Die uralte Dämonenlordin
   **Milim Nava** (immense Macht, kindliches Wesen) taucht auf, prüft Rimuru und wird zur
   Verbündeten — Aufhänger für die Dämonenlord-Politik späterer Bänder. Spielhook: Föderations-
   Hub-State, `milim` als mächtiger Story-NPC/optionaler Übungs-Boss, Codex „Dämonenlords".

### Umsetzungs-Reihenfolge (Vorschlag, kollisionsarm)
- Pro Arc eine eigene Phase/Slice (eigener Worktree), zuerst **Daten** (Map, NPCs, Dialoge,
  Encounter, Codex) + headless Tests, dann dünne Szenen-Integration.
- Reihenfolge nach Abhängigkeit: **Kijin-Begleiter** (nutzt bestehendes recruit-System) →
  **Orc-Disaster** (Boss + Gegner) → **Echsenmenschen/Allianz** → **Treyni/Schlacht** →
  **Föderation/Milim**; Dwargon + Shizu als parallele Band-1-Ergänzungen.
- Naming/Evolution überall als sichtbaren Beat zeigen (Goblin→Hobgoblin, Oger→Kijin).

## Vertiefung: mehr Detail-Content aus LN Band 1 & 2 (2026-06-28)

### Erweiterte Canon-Figuren (Roster + Rollen)
- **Kijin (Ex-Oger):** **Benimaru** (Samurai-General, Schwarzflamme) · **Shuna** (Priesterin,
  Analyse/Weben/Kochen — bereits im Spiel) · **Shion** (Sekretärin/Leibwache, monströse Kraft,
  berüchtigt schlechte Köchin) · **Hakurou** (alter Schwertmeister, Rimurus Trainer) ·
  **Kurobe** (Meisterschmied, schmiedet Rimurus Katana) · **Souei** (Verdeckt/Spionage).
- **Zwerge (Dwargon):** **Kaijin** (Meisterhandwerker) · **Garm** (Waffenschmied) · **Dord**
  (Rüstung/Holz) · **Myrd** (ältester Bruder/Maurer) · König **Gazel Dwargo** (Schwertheld,
  späterer Sparringspartner/Verbündeter) · Minister **Vesta** (Intrigant → spätere Läuterung
  als Forscher).
- **Echsenmenschen:** der **Häuptling** · **Souka** (loyale, fähige Kommandantin) · **Gabiru**
  (ruhmsüchtiger Sohn, Fall + Läuterung, tritt später als Tempest-Offizier bei).
- **Wald/Geister:** **Treyni** (Dryade, Hüterin des Jura-Walds; weitere Dryaden-Schwestern als
  Flavor).
- **Andersweltler:** **Shizu (Shizue Izawa)** + ihre fünf Schüler **Kenya, Ryota, Gale, Alice,
  Chloe** (späterer Care-/Eskort-Arc; Chloe ist langfristig storyrelevant).
- **Menschen-Kontakte:** die drei Abenteurer **Kaval** (Schwert), **Eren/Elen** (Magierin, verdeckt
  von Adel) und **Gido** (Axt) · **Fuze** (Gildenmeister der Free Guild in **Blumund**) → erster
  geordneter Menschen-/Handelskontakt.
- **Orks:** **Gelmud** (Namensgeber-Intrigant) · der **Orc-Lord → Orc-Disaster „Geld"** (tragisch,
  Hungersnot — kein simpler Bösewicht) · ein überlebender **Hoch-Ork** erbt den Namen „Geld" und
  führt die Orks als Aufbauhelfer in Tempest.
- **Dämonenlords:** **Milim Nava** (uralt, „Zerstörerin", Drachenblut, kindlich, honigsüchtig →
  über Honig zur Freundin).

### Zusätzliche Beats / Sub-Arcs (über die 8 Haupt-Arcs hinaus)
- **Veldora-Freundschaft + Predator-Versiegelung:** Manga-/Erzähl-Gag, Namensbund („Tempest" als
  Veldoras Nachname, den Rimuru übernimmt → später Jura-Tempest-Föderation); Veldora wird in
  Rimuru analysiert/freigelesen (langfristiger Hook).
- **Free-Guild/Blumund + die drei Abenteurer:** erster Menschenkontakt, Eskort-/Erkundungsquest,
  Handelsabkommen — Tempest tritt aus der Isolation.
- **Crafting-Strang:** **Hipokte-Heilkraut** (aus der Höhle) → **Vollheiltrank** (Spitzen-Heilung,
  wird Tempests Handelsgut) · **Magic-Ore → Magisteel** · Kurobes **Katana** für Rimuru.
- **Spirit-Cave (Elementargeister):** Rimuru bringt Shizus todkranke Kinder zu den Geistern, damit
  je ein Elementargeist ihren Körper stabilisiert (beginnt hier, reicht in Band 3+).
- **Orks als Aufbauhelfer:** nach Geld werden die verschonten Orks zu unermüdlichen Bauarbeitern —
  sichtbares Hub-Wachstum + neuer Begleit-/Fraktionsstrang.

### Konkrete Content-Bausteine (Daten, an Bestehendes angeknüpft)
- **Regionen/Maps:** `dwargon` (Zwergenstadt/Schmiede) · `blumund` (Menschenstadt + Free Guild) ·
  `lizardman-marsh` (Echsen-Sumpf — thematisch nah am Geistmoor) · `spirit-cave` (Geisterhöhle) ·
  `jura-battlefield` (Ork-Schlacht).
- **Gegner:** `orc-grunt`/`orc-soldier`/`orc-lord`/`orc-disaster` (Boss) · `ifrit` (Flammengeist,
  Story-Boss) · weitere `direwolf`-/Wald-Varianten · maskierter Majin (vorgeschoben für Gelmud).
- **Items:** `hipokte-herb` · `magic-ore`/`magisteel` · `full-potion` (Vollheiltrank) ·
  `kurobe-katana` (Rimuru-Waffe).
- **Skills/Formen:** Rimurus **menschliche Form** (Shizu, als Skin/Form-Unlock) + **Ifrit-Flamme**
  (Feuer-Skill) · Naming-Evolution als Mechanik-Beat (Oger→Kijin, Goblin→Hobgoblin, Ork→Hoch-Ork).
- **Codex/Lore-Einträge:** „Die Wahren Drachen" (Veldora=Sturm, Velzard=Eis, Velgrynd=Glut,
  Veldanava=Sternkönig/Ursprung) · „Dämonenlords & das Benennen" (Gelmuds Schema) · „Andersweltler
  & Beschwörung" (Shizu, die Kinder, Leon als ferner Haken) · „Die Free Guild" · „Magicule & Magie".

### Treue-Hinweise (für die Umsetzung)
- **Naming kostet Magicules** → als dramatischer, sichtbarer Beat zeigen (Rimuru erschöpft sich,
  muss „schlafen"/regenerieren) — passt zum vorhandenen Recruit/Evolution-System.
- **Geld** ist tragisch (Hungersnot der Orks), kein reiner Antagonist; Rimuru übernimmt ihre Bürde.
- **Milim** ist Test + Freundschaft, kein klassischer Bosskampf-Sieg.
- **Eigenständig bleiben:** keine 1:1-Adaption — Beats/Figuren als datengetriebene JRPG-Bausteine,
  sichtbare Canon-Namen, stabile interne IDs (Projektregel der Band-Docs).

## Noch mehr Band 1 & 2: Detail-Questketten & Welt-Tiefe (2026-06-29)

### A) Fertige Questketten-Entwürfe (beat-für-beat, am Datenmodell)
> Format wie im Spiel: Quest mit `steps` (locationId), Dialog-`effects` (`start-quest`,
> `complete-quest-step`, `recruit-character`, `set-flag`, `add-item`), Encounter mit
> `victoryEffects`, Codex `unlockFlag`. Sichtbare Canon-Namen, stabile interne IDs.

**A1 — Oger → Kijin** *(Begleiter-Arc; nutzt recruit-character + Naming-Beat)*
- Quest `ogre-pact` „Die Oger und das Missverständnis":
  1. `ogre-assault` — sechs Oger greifen Tempest an (Benimaru voraus): Trigger-Encounter
     `ogre-vanguard` (Benimaru-Oger + 2 Oger) → `set-flag story.ogre.clash`.
  2. `clear-misunderstanding` — Dialog: die **Orks** (nicht Tempest) zerstörten ihr Dorf →
     `set-flag story.ogre.truce` + Codex „Die Oger".
  3. `name-the-six` — Rimuru benennt sie (Naming-Beat: Magicule-Erschöpfung als Text/Effekt):
     `recruit-character` benimaru/shion/hakurou/kurobe/souei (Shuna ist da) + `set-flag story.kijin.named`.
  4. `kurobe-katana` — Kurobe schmiedet eine Katana → `add-item kurobe-katana`.
  - Belohnung: 6 Kijin, Codex „Kijin", Katana. Folge-Hook: Hakurou-Training (Talentknoten).

**A2 — Zwergenkönigreich Dwargon** *(neue Region `dwargon` + Handwerk)* — ✅ **umgesetzt in Phase 27** (vereinfachte, kollisionsarme Variante: Gazels Urteil schaltet die Schmiede frei und Kaijin tritt bei; Garm/Dord/Myrd als Flavor, Vesta später).
- Quest `dwargon-craft` „Handwerk aus Dwargon":
  1. `enter-dwargon` — Gateway vom Jura-Wald, Markt/Schmiede, Codex „Dwargon".
  2. `tavern-incident` — Vesta-Faktion provoziert Kaijin → `set-flag story.kaijin.trouble`.
  3. `gazel-judgment` — König **Gazel Dwargo**, Kompromiss/Exil → `set-flag story.kaijin.exiled`.
  4. `recruit-smiths` — `recruit-character kaijin` (+ Garm/Dord/Myrd als Helfer/Fraktion) +
     `set-flag craft.smithing.unlocked` → Shop/Crafting-Tier frei, Magisteel-Rezepte.
  - Belohnung: Schmieden/Bau, Codex „Gazel Dwargo".

**A3 — Orc-Disaster** *(großer Bogen: Allianz → Schlacht → Predation → Föderation)* — ✅ **umgesetzt in Phase 28 + 29** (Treyni → Vorhut → Geld-Boss → Föderation + Milim-Honig-Pakt; Echsenmenschen/Gabiru-Allianz als `lizard-alliance`-Slice).
- Quest `orc-disaster` „Die Hungersnot der Orks" (Regionen `lizardman-marsh`, `jura-battlefield`):
  1. `treyni-plea` — **Treyni** warnt vor der Ork-Armee + Gelmuds Namen-Schema → Codex „Treyni".
  2. `lizard-alliance` — ✅ **umgesetzt in Phase 29** (Region `lizardman-marsh`, Souka-Parley, Gabiru-Duell, Bündnis) — Echsen-Sumpf: Gabirus Hochmut korrigieren, Souka/Häuptling →
     `set-flag story.lizard.allied` (Gabiru fällt, spätere Läuterung).
  3. `march-of-orcs` — Pflicht-Encounter Ork-Vorhut (`orc-soldier` × n) → `set-flag story.orc.engaged`.
  4. `geld-disaster` — **Boss** `orc-disaster` (Geld; frisst Gelmud im Vorspann). victory →
     Rimuru **prädiert** Geld: `set-flag story.geld.devoured` + großer Power-Spike/Belohnung.
  5. `found-federation` — Gründung der **Jura-Tempest-Föderation** (Hub-State-Wechsel); ein
     Hoch-Ork erbt „Geld", Orks treten bei (`set-flag faction.orcs.joined`).
  6. `milim-arrives` — **Milim Nava** prüft Rimuru → Freundschaft (Honig!), Codex „Dämonenlords".
  - Belohnung: Föderation, Orks als Aufbauhelfer, Milim als Story-NPC.

### B) Weitere Canon-Figuren & Welt-Details (Flavor/Codex)
- **Goblin-Hierarchie:** Rigurd (Patriarch) + benannte Goblins (Rigur als Wache, Gobta, Gobichi,
  Gobtsu, Gobzo); die Hobgoblin-Wachen.
- **Dryaden-Schwestern:** Treyni, Trya, Triah (Hüterinnen des Walds).
- **Gabirus Gefolge:** „Gabirus Hundert" (loyale Echsenmenschen, später komödiantisch wiederkehrend).
- **Vesta-Läuterung:** der Dwargon-Minister wird später reuiger Forscher in Tempest.
- **Veldora-Flavor:** Manga-Begeisterung, „Kuaaaa-ha-ha!"-Lachen, der Namensbund als echte Freundschaft.
- **Ranga & die Tempest-Wölfe:** Rangas Rudel als Reit-/Späher-Einheit (knüpft an Schnellreise an).

### C) Systeme & Lore aus den LN (Codex + Mechanik-Inspiration)
- **Magicule (Magie-Energie):** Grundlage für Naming/Evolution/Magie; Naming **kostet** viel →
  dramatischer Beat (Rimuru erschöpft sich).
- **Monster-Evolution:** durch Benennen ODER durch Fressen/Besiegen starker Gegner → neue Form
  (passt zum vorhandenen Evolution-System).
- **Rimurus Skills:** **Predator/Gula** (speichern, analysieren, nachahmen, abtrennen) + **Großer
  Weiser** (Analyse, Paralleldenken, Auto-Kampf) — als Flavor/Codex und optionale Mechanik.
- **Die Wahren Drachen:** Veldora (Sturm), Velzard (Eis), Velgrynd (Glut), Veldanava (Sternkönig/Ursprung).
- **Dämonenlords & Walpurgis:** das „Benennen" erschafft Maous (Gelmuds Ziel); Milim als eine der
  ältesten — Aufhänger für eine spätere Dämonenlord-Versammlung.
- **Andersweltler & Beschwörung:** Shizu, die Kinder, **Leon Cromwell** (beschwor Shizu als Kind) als
  fernes Rimuru-Ziel.

### D) Wirtschaft & Diplomatie (Hub-Tiefe)
- **Vollheiltrank** (aus Hipokte-Kraut) als Tempests Killer-Handelsgut; **Magisteel** als
  Premium-Werkstoff; Shunas Seide/Kleidung als weitere Güter.
- **Föderations-Mitglieder:** Hobgoblins, Kijin, Tempest-Wölfe, Echsenmenschen, Dryaden, Orks.
- **Außenbeziehungen (Diplomatie-Stufen im Hub):** Dwargon (Handel), Blumund (kleiner Verbündeter,
  Free Guild/Fuze), Englesia (Akademie + Shizus Kinder) → schrittweise freischaltbar.

## Band 1 & 2: konkrete Datenblätter (Gegner + Skills) + mehr Figuren/Systeme (2026-06-29)

> Schema-valide (Elemente: neutral/water/wind/fire/earth/shadow/holy; Status: poison/attack-up/
> defense-up/magic-up/spirit-down/haste/guard-break; Target: single-enemy/all-enemies/single-ally/
> self; Tags: physical/magical/heal/buff/debuff). Level über das bisherige 1–12-Band hinaus =
> neuer **Band-2-Tier** (~13–20). Mit `*` markierte Items sind neue Vorschläge.

### Neue Skills (`src/data/skills.ts`)
```ts
{ id: 'black-flame', name: 'Schwarzflamme', description: 'Benimarus konzentrierte Schwarzflamme verbrennt ein Ziel.', element: 'fire', target: 'single-enemy', costMp: 9, power: 38, tags: ['magical'] },
{ id: 'ifrit-inferno', name: 'Ifrits Inferno', description: 'Eine Feuerwand erfasst alle Gegner.', element: 'fire', target: 'all-enemies', costMp: 14, power: 30, tags: ['magical'] },
{ id: 'orc-cleave', name: 'Ork-Spalter', description: 'Brutaler Hieb mit grobem Schlachtbeil.', element: 'neutral', target: 'single-enemy', costMp: 5, power: 26, tags: ['physical'] },
{ id: 'war-cry', name: 'Kriegsschrei', description: 'Anstachelnder Ruf — eigener Angriff steigt.', element: 'neutral', target: 'self', costMp: 6, power: 0, tags: ['buff'], statusEffect: { id: 'attack-up', chance: 1, turns: 3 } },
{ id: 'iron-guard', name: 'Eisenwall', description: 'Verschanzt sich — eigene Verteidigung steigt.', element: 'neutral', target: 'self', costMp: 5, power: 0, tags: ['buff'], statusEffect: { id: 'defense-up', chance: 1, turns: 3 } },
{ id: 'famished-bite', name: 'Hungerbiss', description: 'Der Hunger der „Ausgehungerten" reißt Fleisch und Kraft heraus.', element: 'shadow', target: 'single-enemy', costMp: 8, power: 34, tags: ['physical'] },
{ id: 'calamity-roar', name: 'Katastrophenbrüllen', description: 'Ein Brüllen bricht die Deckung aller Gegner.', element: 'shadow', target: 'all-enemies', costMp: 12, power: 0, tags: ['debuff'], statusEffect: { id: 'guard-break', chance: 0.9, turns: 3 } },
{ id: 'ogre-smash', name: 'Oger-Wucht', description: 'Erderschütternder Hieb roher Ogerkraft.', element: 'earth', target: 'single-enemy', costMp: 7, power: 32, tags: ['physical'] },
{ id: 'spear-charge', name: 'Speersturm', description: 'Schneller Vorstoß mit der Wasserklinge.', element: 'wind', target: 'single-enemy', costMp: 5, power: 24, tags: ['physical'] },
{ id: 'tide-lance', name: 'Flutlanze', description: 'Ein Wasserdruckstoß durchbohrt das Ziel.', element: 'water', target: 'single-enemy', costMp: 7, power: 26, tags: ['magical'] },
{ id: 'drago-nova', name: 'Drago Nova', description: 'Milims überwältigende Drachenenergie — ein Schlag wie ein Sternenfall.', element: 'fire', target: 'all-enemies', costMp: 20, power: 60, tags: ['magical'] }
```

### Neue Gegner (`src/data/enemies.ts`)
```ts
{ id: 'orc-grunt', name: 'Ork-Plänkler', level: 5, element: 'earth', stats: { maxHp: 70, maxMp: 6, attack: 14, defense: 11, magic: 4, spirit: 6, agility: 8 }, skillIds: ['orc-cleave'], weaknesses: ['fire','holy'], resistances: [], experienceReward: 28, goldReward: 12, drops: [{ itemId: 'healing-herb', chance: 0.2 }] },
{ id: 'orc-soldier', name: 'Ork-Soldat', level: 7, element: 'earth', stats: { maxHp: 104, maxMp: 10, attack: 19, defense: 15, magic: 5, spirit: 8, agility: 9 }, skillIds: ['orc-cleave','war-cry'], weaknesses: ['fire','holy'], resistances: [], experienceReward: 48, goldReward: 20, drops: [{ itemId: 'magic-ore', chance: 0.25 }] },
{ id: 'orc-general', name: 'Ork-General', level: 10, element: 'earth', stats: { maxHp: 170, maxMp: 16, attack: 25, defense: 20, magic: 8, spirit: 12, agility: 11 }, skillIds: ['orc-cleave','iron-guard','war-cry'], weaknesses: ['holy'], resistances: ['earth'], experienceReward: 110, goldReward: 60, drops: [{ itemId: 'magisteel', chance: 0.3 }] },
{ id: 'orc-lord', name: 'Ork-Lord', level: 13, element: 'shadow', stats: { maxHp: 240, maxMp: 30, attack: 30, defense: 22, magic: 16, spirit: 16, agility: 14 }, skillIds: ['famished-bite','orc-cleave','iron-guard'], weaknesses: ['holy'], resistances: ['earth','shadow'], experienceReward: 260, goldReward: 140, drops: [{ itemId: 'full-potion', chance: 0.4 }] },
{ id: 'orc-disaster', name: 'Orc-Disaster „Geld"', level: 16, element: 'shadow', stats: { maxHp: 520, maxMp: 60, attack: 38, defense: 30, magic: 26, spirit: 24, agility: 16 }, skillIds: ['famished-bite','calamity-roar','ogre-smash'], weaknesses: ['holy'], resistances: ['earth','shadow','neutral'], experienceReward: 600, goldReward: 320, drops: [{ itemId: 'geld-core', chance: 1 }] },
{ id: 'ifrit', name: 'Ifrit, Flammengeist', level: 14, element: 'fire', stats: { maxHp: 300, maxMp: 80, attack: 22, defense: 18, magic: 40, spirit: 26, agility: 22 }, skillIds: ['ifrit-inferno','black-flame'], weaknesses: ['water'], resistances: ['fire'], experienceReward: 340, goldReward: 160, drops: [{ itemId: 'spirit-ember', chance: 1 }] },
{ id: 'ogre-warrior', name: 'Oger-Krieger', level: 9, element: 'fire', stats: { maxHp: 150, maxMp: 18, attack: 24, defense: 18, magic: 14, spirit: 12, agility: 14 }, skillIds: ['ogre-smash','black-flame'], weaknesses: ['water'], resistances: [], experienceReward: 95, goldReward: 40, drops: [{ itemId: 'magic-ore', chance: 0.3 }] },
{ id: 'masked-majin', name: 'Maskierter Majin', level: 12, element: 'shadow', stats: { maxHp: 210, maxMp: 48, attack: 24, defense: 18, magic: 30, spirit: 22, agility: 20 }, skillIds: ['black-flame','spirit-bind'], weaknesses: ['holy'], resistances: ['shadow'], experienceReward: 220, goldReward: 120, drops: [] },
{ id: 'lizardman-warrior', name: 'Echsenkrieger', level: 6, element: 'water', stats: { maxHp: 92, maxMp: 14, attack: 16, defense: 13, magic: 9, spirit: 10, agility: 12 }, skillIds: ['spear-charge','tide-lance'], weaknesses: ['wind'], resistances: ['water'], experienceReward: 38, goldReward: 16, drops: [] },
{ id: 'gabiru', name: 'Gabiru', level: 11, element: 'wind', stats: { maxHp: 180, maxMp: 28, attack: 26, defense: 18, magic: 14, spirit: 14, agility: 22 }, skillIds: ['spear-charge','war-cry','tide-lance'], weaknesses: ['shadow'], resistances: ['wind','water'], experienceReward: 140, goldReward: 70, drops: [{ itemId: 'wolf-fang-token', chance: 0.5 }] },
{ id: 'milim', name: 'Milim Nava', level: 20, element: 'fire', stats: { maxHp: 999, maxMp: 200, attack: 60, defense: 50, magic: 70, spirit: 50, agility: 60 }, skillIds: ['drago-nova','ogre-smash','black-flame'], weaknesses: [], resistances: ['fire','earth','shadow','neutral'], experienceReward: 0, goldReward: 0, drops: [] }
```
Neue Items dazu (Vorschlag): `magic-ore`, `magisteel`, `full-potion`*, `geld-core`* (Quest/Evolution), `spirit-ember`* (Ifrit-Flamme/Form), `hipokte-herb`*, `kurobe-katana`* (Waffe).

### Mehr Nebenfiguren & Welt
- **Tempest-Ämterstruktur (Hub-NPCs):** Rigurd (Ältester/Verwaltung) · Rigur (Wachhauptmann) ·
  Benimaru (Samurai-General) · Souei (Geheimdienst) · Shion (Sekretärin/Leibwache) · Shuna
  (Priesterin/Diplomatie) · Hakurou (Ausbilder) · Kurobe (Schmied) · Kaijin (Chefingenieur/Bau) ·
  Geld (Hoch-Ork, Bautrupp) · Vesta (später Forscher).
- **Goblin-Riege:** Gobta (Hakurous chaotischster Schüler, Wolfsreiter), Gobichi/Gobtsu/Gobzo
  (Wachen) — komödiantischer Alltag.
- **Echsenmenschen:** Häuptling, Souka (loyal), Gabiru + „Gabirus Hundert".
- **Dwargon:** König Gazel Dwargo + seine Leibgarde (Heldenkönig-Entourage), Vesta-Faktion.
- **Blumund/Englesia:** Gildenmeister Fuze; die drei Abenteurer Kaval/Eren(Elen, verdeckt adlig)/Gido;
  Shizus Schüler Kenya/Ryota/Gale/Alice/Chloe (je ein Elementargeist).
- **Wald/Geister:** Treyni + Schwestern Trya/Triah; Greater Spirit **Ifrit**; kleine Elementargeister.
- **Orte (Detail):** Versiegelte Höhle (Veldoras Gefängnis, Untersee, Hipokte-Kraut) · Jura-Großwald
  (Zentrum, Echsen-Sumpf, Oger-Dorf-Ruine, Ork-Marschroute) · Dwargon (Tor, Werkstattviertel,
  Thron-/Gerichtssaal) · Blumund (Gildenfiliale) · Geisterhöhle (Spirit-Cave).

### Mehr Systeme & Lore (Codex + optionale Mechanik)
- **Rang-System (Monster):** D–C–B–A–Spezial-A–Katastrophe–**Desaster** (Geld = Desaster, Veldora =
  Katastrophe/„Sturmdrache") — als Gefahren-/Codex-Stufe nutzbar.
- **Abenteurer-Ränge:** F→E→D→C→B→A→S (Shizu = A-Rang) — für Free-Guild-Quests/Belohnungsstufen.
- **Skill-Ränge:** Allgemeine Skills → Extra-Skills → **Unique Skills** (Predator, Großer Weiser) →
  Ultimative Skills (Fernziel) — als Talent-/Evolutionsstufen denkbar.
- **Veldoras Siegel:** „Unendlicher Kerker" (vom Helden gewirkt); Rimuru analysiert/„liest" es über
  viele Schritte frei → langfristiger Story-Anker (Veldora-Rückkehr).
- **Dämonenlord-Erwachen:** „Saat" durch genug Macht/Predation (Geld); volle Erweckung über das
  **Erntefest**-Ritual (Opfer/Festmahl) — Band-3-Aufhänger, hier vorbereitet.
- **Wahre Drachen & Ursprung:** Veldora (Sturm), Velzard (Eis), Velgrynd (Glut), **Veldanava**
  (Sternkönig, Schöpfer, Milims Vater) — kosmische Codex-Tiefe.
- **Andersweltler & Beschwörung:** Magie ruft Menschen aus „unserer" Welt; sie tragen Skills/Hunger
  nach Magie; **Leon Cromwell** (beschwor Shizu als Kind) als fernes Rimuru-Ziel; die Westliche
  Heilige Kirche/Hinata als Foreshadow für spätere Bänder.

## Band 1 & 2: Item-Datenblätter + Kijin-Talentbäume (2026-06-29)

> Schema-valide. Items: `category` consumable/weapon/armor/accessory/key, optional
> `equipmentSlot`/`equipmentSetId`/`enchantment`/`statBonus`/`effect`. Talentknoten: `cost`,
> `requiredLevel` (aufsteigend entlang `requiredNodeIds`), optional `skillId`/`statBonus`/
> `requiredFlag`. Die Kijin-Bäume setzen die fünf Kijin als HEROES voraus (Oger→Kijin-Arc).

### Neue Items (`src/data/items.ts`)
```ts
{ id: 'hipokte-herb', name: 'Hipokte-Kraut', description: 'Heilkraut aus der versiegelten Höhle; Grundlage für stärkere Tränke.', category: 'consumable', price: 30, stackable: true, effect: { kind: 'heal-hp', amount: 80 } },
{ id: 'full-potion', name: 'Vollheiltrank', description: 'Tempests Spitzenheilung aus destilliertem Hipokte-Kraut — stellt alle LP wieder her.', category: 'consumable', price: 220, stackable: true, effect: { kind: 'heal-hp', amount: 999 } },
{ id: 'magic-ore', name: 'Magisches Erz', description: 'Magicule-getränktes Roherz; Rohstoff für Magisteel und Magiewerkzeuge.', category: 'key', price: 45, stackable: true },
{ id: 'magisteel', name: 'Magisteel', description: 'Aus magischem Erz und Magicules veredelt; überlegener Schmiedewerkstoff.', category: 'key', price: 140, stackable: true },
{ id: 'geld-core', name: 'Geld-Kern', description: 'Verdichteter Kern des Orc-Disasters — Beweis und Evolutionsmaterial.', category: 'key', price: 0, stackable: false },
{ id: 'spirit-ember', name: 'Geistglut', description: 'Ifrits gebändigte Flamme; entzündet eine Feuer-Affinität/-Form.', category: 'key', price: 0, stackable: false },
{ id: 'kurobe-katana', name: 'Kurobes Katana', description: 'Von Meister Kurobe aus Magisteel geschmiedet — scharf wie ein Schwur.', category: 'weapon', price: 0, stackable: false, equipmentSlot: 'weapon', enchantment: { maxLevel: 5, goldCostPerLevel: 120, statBonusPerLevel: { attack: 2 } }, statBonus: { attack: 14, agility: 3 } },
{ id: 'kijin-haori', name: 'Kijin-Haori', description: 'Von Shuna gewebte Kampfrobe der Kijin — leicht und widerstandsfähig.', category: 'armor', price: 260, stackable: false, equipmentSlot: 'armor', statBonus: { defense: 8, spirit: 4, magic: 2 } },
{ id: 'oni-mask', name: 'Oni-Maske', description: 'Eine Maske im Erbe Shizus — schärft den Geist im Kampf.', category: 'accessory', price: 300, stackable: false, equipmentSlot: 'accessory', statBonus: { magic: 4, spirit: 4, maxMp: 8 } }
```

### Kijin-Talentbäume (`src/data/progression.ts` → `SKILL_TREES`)
> Nutzen die neuen Skills (`black-flame`, `war-cry`, `iron-guard`, `ogre-smash`) und vorhandene
> (`quick-step`, `battle-cry`, `venom-spit`). `requiredLevel` steigt entlang der Ketten (Balance-Gate).
```ts
{ id: 'benimaru-tree', characterId: 'benimaru', name: 'Schwarzflammen-General', nodes: [
  { id: 'benimaru-flame-core', name: 'Flammenkern', description: 'Grundlage der Schwarzflamme.', cost: 1, requiredLevel: 2, requiredNodeIds: [], statBonus: { magic: 2, attack: 1 } },
  { id: 'benimaru-black-flame', name: 'Schwarzflamme', description: 'Erlernt die konzentrierte Schwarzflamme.', cost: 1, requiredLevel: 4, requiredNodeIds: ['benimaru-flame-core'], skillId: 'black-flame' },
  { id: 'benimaru-general-aura', name: 'Generals-Aura', description: 'Anführerpräsenz stärkt den Angriff.', cost: 1, requiredLevel: 6, requiredNodeIds: ['benimaru-flame-core'], skillId: 'war-cry' },
  { id: 'benimaru-hellfire', name: 'Höllenbrand', description: 'Meisterschaft über die Flamme.', cost: 2, requiredLevel: 9, requiredNodeIds: ['benimaru-black-flame'], statBonus: { magic: 4, attack: 3 } }
] },
{ id: 'shion-tree', characterId: 'shion', name: 'Stahlfaust-Leibwache', nodes: [
  { id: 'shion-iron-body', name: 'Eisenkörper', description: 'Monströse Konstitution.', cost: 1, requiredLevel: 2, requiredNodeIds: [], statBonus: { maxHp: 18, defense: 2 } },
  { id: 'shion-ogre-smash', name: 'Oger-Wucht', description: 'Erlernt den erderschütternden Hieb.', cost: 1, requiredLevel: 4, requiredNodeIds: ['shion-iron-body'], skillId: 'ogre-smash' },
  { id: 'shion-bulwark', name: 'Bollwerk', description: 'Verschanzte Verteidigung.', cost: 1, requiredLevel: 6, requiredNodeIds: ['shion-iron-body'], skillId: 'iron-guard' },
  { id: 'shion-titan-grip', name: 'Titanengriff', description: 'Rohe Kraft am Limit.', cost: 2, requiredLevel: 9, requiredNodeIds: ['shion-ogre-smash'], statBonus: { attack: 5, maxHp: 20 } }
] },
{ id: 'hakurou-tree', characterId: 'hakurou', name: 'Schwertheiliger', nodes: [
  { id: 'hakurou-stance', name: 'Stille Haltung', description: 'Grundlage der Schwertkunst.', cost: 1, requiredLevel: 2, requiredNodeIds: [], statBonus: { agility: 2, attack: 2 } },
  { id: 'hakurou-flash-step', name: 'Blitzschritt', description: 'Erlernt das schnelle Vorstoßen.', cost: 1, requiredLevel: 4, requiredNodeIds: ['hakurou-stance'], skillId: 'quick-step' },
  { id: 'hakurou-mentor', name: 'Lehrmeister', description: 'Anleitung stählt das Team.', cost: 1, requiredLevel: 6, requiredNodeIds: ['hakurou-stance'], skillId: 'battle-cry' },
  { id: 'hakurou-god-speed', name: 'Götterschnelle', description: 'Vollendung des Schwertwegs.', cost: 2, requiredLevel: 9, requiredNodeIds: ['hakurou-flash-step'], statBonus: { agility: 5, attack: 4 } }
] },
{ id: 'kurobe-tree', characterId: 'kurobe', name: 'Meisterschmied', nodes: [
  { id: 'kurobe-forge-arm', name: 'Schmiedearm', description: 'Schmiedekraft und Härte.', cost: 1, requiredLevel: 2, requiredNodeIds: [], statBonus: { attack: 2, defense: 2 } },
  { id: 'kurobe-tempered', name: 'Gehärtet', description: 'Verschanzte Verteidigung.', cost: 1, requiredLevel: 4, requiredNodeIds: ['kurobe-forge-arm'], skillId: 'iron-guard' },
  { id: 'kurobe-magisteel-edge', name: 'Magisteel-Schneide', description: 'Magisteel schärft den Hieb.', cost: 1, requiredLevel: 6, requiredNodeIds: ['kurobe-forge-arm'], skillId: 'ogre-smash' },
  { id: 'kurobe-masterwork', name: 'Meisterwerk', description: 'Vollendete Schmiedekunst.', cost: 2, requiredLevel: 9, requiredNodeIds: ['kurobe-tempered'], statBonus: { defense: 5, attack: 3 } }
] },
{ id: 'souei-tree', characterId: 'souei', name: 'Schattenklinge', nodes: [
  { id: 'souei-silent-step', name: 'Lautloser Schritt', description: 'Verdeckte Beweglichkeit.', cost: 1, requiredLevel: 2, requiredNodeIds: [], statBonus: { agility: 3 } },
  { id: 'souei-venom', name: 'Giftklinge', description: 'Erlernt den vergifteten Stoß.', cost: 1, requiredLevel: 4, requiredNodeIds: ['souei-silent-step'], skillId: 'venom-spit' },
  { id: 'souei-shadow-strike', name: 'Schattenstoß', description: 'Schneller Vorstoß aus dem Schatten.', cost: 1, requiredLevel: 6, requiredNodeIds: ['souei-silent-step'], skillId: 'quick-step' },
  { id: 'souei-assassinate', name: 'Meucheln', description: 'Tödliche Präzision.', cost: 2, requiredLevel: 9, requiredNodeIds: ['souei-venom'], statBonus: { agility: 4, attack: 4 } }
] }
```
**Hinweis Datenintegrität:** `validateGameData` prüft `skillTrees.characterId ∈ heroIds` und das
Balance-Gate verlangt `requiredLevel(Vorgänger) ≤ requiredLevel(Knoten)` — beides hier eingehalten,
sobald die fünf Kijin als HEROES existieren. Items wie `kurobe-katana` können als
Quest-/Talent-Belohnung (Oger→Kijin) vergeben werden.

## Band 1 & 2: Equipment-Sets, Oger→Kijin-Evolutionen, Dwargon-/Ork-Items (2026-06-29)

### Equipment-Sets (`src/data/progression.ts` → `EQUIPMENT_SETS`)
> Die referenzierten Items brauchen das passende `equipmentSetId`.
```ts
{ id: 'kijin-regalia', name: 'Kijin-Kriegsornat', itemIds: ['kurobe-katana', 'kijin-haori', 'oni-mask'], tiers: [
  { pieces: 2, statBonus: { attack: 3, defense: 2 } },
  { pieces: 3, statBonus: { maxHp: 12, magic: 3, spirit: 3 } }
] },
{ id: 'dwargon-forged', name: 'Dwargon-Schmiedewerk', itemIds: ['magisteel-blade', 'dwarf-plate', 'forge-band'], tiers: [
  { pieces: 2, statBonus: { defense: 3, maxHp: 8 } },
  { pieces: 3, statBonus: { attack: 4, defense: 4, maxMp: 4 } }
] }
```

### Progression-Lines (`PROGRESSION_LINES`) — Voraussetzung für die Evolutionen
```ts
{ id: 'benimaru-ogre-line', characterId: 'benimaru', name: 'Kijin-General', speciesLine: 'Oger → Kijin-General', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior','orc-soldier'], description: 'Benimarus Linie verbindet Ogerkraft mit der Schwarzflamme zum Generalsrang.' },
{ id: 'shion-ogre-line', characterId: 'shion', name: 'Kijin-Leibwache', speciesLine: 'Oger → Kijin-Leibwache', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior','orc-general'], description: 'Shions Linie maximiert Konstitution und rohe Kraft.' },
{ id: 'hakurou-ogre-line', characterId: 'hakurou', name: 'Kijin-Schwertheiliger', speciesLine: 'Oger → Kijin-Schwertheiliger', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior','lizardman-warrior'], description: 'Hakurous Linie verfeinert Geschwindigkeit und Schwertkunst.' },
{ id: 'kurobe-ogre-line', characterId: 'kurobe', name: 'Kijin-Schmied', speciesLine: 'Oger → Kijin-Schmied', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior','orc-general'], description: 'Kurobes Linie stählt Verteidigung und Schmiedekraft.' },
{ id: 'souei-ogre-line', characterId: 'souei', name: 'Kijin-Schatten', speciesLine: 'Oger → Kijin-Schatten', regionId: 'tempest-grove', rivalEnemyIds: ['ogre-warrior','masked-majin'], description: 'Soueis Linie schärft Tempo, Verdeckung und Präzision.' }
```

### Evolutionen Oger → Kijin (`EVOLUTIONS`)
> `requiresCustomName: true` = die **Benennung durch Rimuru** ist der Evolutions-Trigger (Canon-Beat);
> `requiredLevel: 1` → die Verwandlung passiert beim Beitritt. Shuna nutzt ihre bestehende Linie.
```ts
{ id: 'benimaru-kijin', lineId: 'benimaru-ogre-line', characterId: 'benimaru', formName: 'Kijin-General', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 18, attack: 4, magic: 5 }, skillIds: ['black-flame'], skillPointReward: 2, description: 'Rimurus Benennung verwandelt den Oger in einen Kijin-General mit Schwarzflamme.' },
{ id: 'shion-kijin', lineId: 'shion-ogre-line', characterId: 'shion', formName: 'Kijin-Leibwache', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 26, attack: 5, defense: 3 }, skillIds: ['ogre-smash'], skillPointReward: 2, description: 'Die Benennung formt die monströse Kraft der Oger-Leibwache.' },
{ id: 'hakurou-kijin', lineId: 'hakurou-ogre-line', characterId: 'hakurou', formName: 'Kijin-Schwertheiliger', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 14, attack: 4, agility: 5 }, skillIds: ['quick-step'], skillPointReward: 2, description: 'Der alte Schwertmeister steigt durch die Benennung zum Kijin auf.' },
{ id: 'kurobe-kijin', lineId: 'kurobe-ogre-line', characterId: 'kurobe', formName: 'Kijin-Schmied', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 20, attack: 3, defense: 5 }, skillIds: ['iron-guard'], skillPointReward: 2, description: 'Die Benennung verleiht dem Schmied Kijin-Härte.' },
{ id: 'souei-kijin', lineId: 'souei-ogre-line', characterId: 'souei', formName: 'Kijin-Schatten', rank: 2, requiredLevel: 1, requiresCustomName: true, statBonus: { maxHp: 14, agility: 6, attack: 3 }, skillIds: ['venom-spit'], skillPointReward: 2, description: 'Der stille Oger wird durch die Benennung zum Kijin-Schatten.' }
```

### Dwargon-Items + Ork-Items (`src/data/items.ts`)
```ts
// Dwargon — „Dwargon-Schmiedewerk"-Set
{ id: 'magisteel-blade', name: 'Magisteel-Klinge', description: 'Eine in Dwargon aus Magisteel geschmiedete Klinge.', category: 'weapon', price: 360, stackable: false, equipmentSlot: 'weapon', equipmentSetId: 'dwargon-forged', enchantment: { maxLevel: 5, goldCostPerLevel: 100, statBonusPerLevel: { attack: 2 } }, statBonus: { attack: 12 } },
{ id: 'dwarf-plate', name: 'Zwergenplatte', description: 'Schwere, perfekt gefügte Magisteel-Rüstung.', category: 'armor', price: 320, stackable: false, equipmentSlot: 'armor', equipmentSetId: 'dwargon-forged', statBonus: { defense: 12, maxHp: 10 } },
{ id: 'forge-band', name: 'Schmiedereif', description: 'Ein zwergischer Ring, der Hieb und Deckung schärft.', category: 'accessory', price: 280, stackable: false, equipmentSlot: 'accessory', equipmentSetId: 'dwargon-forged', statBonus: { attack: 3, defense: 3 } },
// Ork — Beute & Material
{ id: 'orc-tusk', name: 'Ork-Hauer', description: 'Trophäe der Ork-Horde; bei Händlern begehrt.', category: 'key', price: 25, stackable: true },
{ id: 'orc-cleaver', name: 'Ork-Schlachtbeil', description: 'Grobes, schweres Beil — viel Wucht, wenig Finesse.', category: 'weapon', price: 150, stackable: false, equipmentSlot: 'weapon', enchantment: { maxLevel: 3, goldCostPerLevel: 70, statBonusPerLevel: { attack: 2 } }, statBonus: { attack: 11 } },
{ id: 'famine-charm', name: 'Hungeramulett', description: 'Aus dem Geld-Kern gefertigt; nährt Zähigkeit aus dem Hunger.', category: 'accessory', price: 0, stackable: false, equipmentSlot: 'accessory', statBonus: { maxHp: 16, attack: 2 } }
```

**Abhängigkeiten (für gültige Daten):** Kijin als HEROES (Oger→Kijin-Arc) · neue Skills
(`black-flame`/`ogre-smash`/`iron-guard`/… aus dem Skill-Datenblatt) · neue Gegner
(`ogre-warrior`/`orc-soldier`/`orc-general`/`masked-majin`/`lizardman-warrior` als `rivalEnemyIds`) ·
Items mit `equipmentSetId` für die Set-Boni. Alles greift sauber ineinander, sobald der
Oger→Kijin- und der Dwargon-/Orc-Arc umgesetzt sind.

## Band 1 & 2: Bindungen (Relationships) + Dwargon-Shops (2026-06-29)

### Das Bindungs-System (bereits vorhanden — Funktionsweise)
> Es muss **nicht neu gebaut** werden; es existiert als datengetriebenes System:
- **Daten:** `RELATIONSHIPS` (`src/data/progression.ts`) — pro Bindung `levels` (mit
  `requiredPoints`, `title`, `passiveBonus`, `partnerPassiveBonus?`, `combatBonus?`) und `scenes`.
- **Speicherung:** `progression.relationshipPoints[relationshipId]` im Save.
- **Logik:** `getProgressionRelationships(characterId)`, `getRelationshipLevelNumber(...)` →
  Stufe aus Punkten; `passiveBonus` fließt in die Figurwerte, `combatBonus.startingTeamMeter`/
  `teamAttack` in den Kampf (Team-Meter/-Angriff).
- **UI:** Menü-Tab **Status** zeigt „Bindungen" (Partner · Stufe · Bindungspunkte).
- **Erweitern = nur Daten:** neue `RELATIONSHIPS`-Einträge hinzufügen. Balance-Gate verlangt
  **nicht-fallende** `passiveBonus`/`partnerPassiveBonus`/`startingTeamMeter` über die Stufen.

### Neue Bindungen (`RELATIONSHIPS`)
```ts
{ id: 'rimuru-veldora', characterId: 'rimuru', partnerId: 'sealed-storm-dragon', partnerName: 'Veldora', partnerKind: 'monster', levels: [
  { level: 1, requiredPoints: 20, title: 'Namensbund', passiveBonus: { magic: 2 }, combatBonus: { startingTeamMeter: 20 } },
  { level: 2, requiredPoints: 60, title: 'Sturmfreund', passiveBonus: { magic: 3, maxMp: 6 }, combatBonus: { startingTeamMeter: 35 } },
  { level: 3, requiredPoints: 120, title: 'Geteilte Seele', passiveBonus: { magic: 5, maxMp: 12, spirit: 3 }, combatBonus: { startingTeamMeter: 50, teamAttack: true } }
], scenes: [
  { id: 'veldora-manga', requiredLevel: 1, title: 'Veldoras Manga', summary: 'Veldora schwärmt von menschlichen Geschichten — die Freundschaft vertieft sich.' },
  { id: 'veldora-vow', requiredLevel: 3, title: 'Das Versprechen der Befreiung', summary: 'Rimuru gelobt, das Siegel eines Tages zu lösen.', flagId: 'bond.veldora.deep' }
] },
{ id: 'rimuru-benimaru', characterId: 'rimuru', partnerId: 'benimaru', partnerName: 'Benimaru', partnerKind: 'party', levels: [
  { level: 1, requiredPoints: 25, title: 'Treueschwur', passiveBonus: { attack: 1 }, partnerPassiveBonus: { magic: 1 }, combatBonus: { startingTeamMeter: 20 } },
  { level: 2, requiredPoints: 70, title: 'General und Herr', passiveBonus: { attack: 2, magic: 2 }, partnerPassiveBonus: { attack: 2, magic: 2 }, combatBonus: { startingTeamMeter: 35, teamAttack: true } },
  { level: 3, requiredPoints: 130, title: 'Schwarzflammen-Bund', passiveBonus: { attack: 3, magic: 3 }, partnerPassiveBonus: { attack: 3, magic: 4 }, combatBonus: { startingTeamMeter: 50, teamAttack: true } }
], scenes: [
  { id: 'benimaru-oath', requiredLevel: 1, title: 'Der Schwur des Generals', summary: 'Benimaru stellt sein Schwert in Rimurus Dienst.' }
] },
{ id: 'rimuru-shion', characterId: 'rimuru', partnerId: 'shion', partnerName: 'Shion', partnerKind: 'party', levels: [
  { level: 1, requiredPoints: 25, title: 'Leibwache', passiveBonus: { defense: 1 }, partnerPassiveBonus: { maxHp: 8 }, combatBonus: { startingTeamMeter: 20 } },
  { level: 2, requiredPoints: 70, title: 'Unerschütterlich', passiveBonus: { defense: 2, maxHp: 8 }, partnerPassiveBonus: { attack: 3, maxHp: 12 }, combatBonus: { startingTeamMeter: 35 } },
  { level: 3, requiredPoints: 130, title: 'Stahlfaust-Treue', passiveBonus: { defense: 3, maxHp: 14 }, partnerPassiveBonus: { attack: 5, maxHp: 18 }, combatBonus: { startingTeamMeter: 50, teamAttack: true } }
], scenes: [
  { id: 'shion-cooking', requiredLevel: 2, title: 'Shions Kochkünste', summary: 'Ein gut gemeintes (gefährliches) Festmahl — die Bindung hält trotzdem.' }
] },
{ id: 'rimuru-milim', characterId: 'rimuru', partnerId: 'milim', partnerName: 'Milim Nava', partnerKind: 'npc', levels: [
  { level: 1, requiredPoints: 30, title: 'Honig-Freundschaft', passiveBonus: { attack: 2 }, combatBonus: { startingTeamMeter: 25 } },
  { level: 2, requiredPoints: 80, title: 'Spielgefährtin', passiveBonus: { attack: 3, magic: 3 }, combatBonus: { startingTeamMeter: 40 } },
  { level: 3, requiredPoints: 150, title: 'Dämonenlord-Bund', passiveBonus: { attack: 4, magic: 4, agility: 3 }, combatBonus: { startingTeamMeter: 60, teamAttack: true } }
], scenes: [
  { id: 'milim-honey', requiredLevel: 1, title: 'Der Honig-Pakt', summary: 'Milim wird mit Honig besänftigt — aus dem Test wird Freundschaft.' }
] }
```
Weitere mögliche Bindungen (analog): `rimuru-kaijin`, `rimuru-treyni`, `benimaru-souei`,
`gobta-ranga` (existiert bereits), `souka-gabiru`.

### Dwargon-Shops (`SHOPS` in `src/data/world.ts`, mapId `dwargon`)
```ts
{ id: 'dwargon-smithy', name: 'Dwargon-Schmiede', mapId: 'dwargon', position: { x: 6, y: 4 }, itemIds: ['magisteel-blade', 'dwarf-plate', 'forge-band', 'magisteel'], buyMultiplier: 1.1, sellMultiplier: 0.5 },
{ id: 'dwargon-apothecary', name: 'Dwargon-Apotheke', mapId: 'dwargon', position: { x: 11, y: 4 }, itemIds: ['healing-herb', 'mana-drop', 'hipokte-herb', 'full-potion'], buyMultiplier: 1, sellMultiplier: 0.5 },
{ id: 'dwargon-trader', name: 'Dwargon-Handelskontor', mapId: 'dwargon', position: { x: 8, y: 9 }, itemIds: ['magic-ore', 'magisteel', 'tempest-charm'], buyMultiplier: 1, sellMultiplier: 0.55 }
```
**Abhängigkeiten:** Map `dwargon` (Dwargon-Arc) · die Items aus den Item-Datenblättern müssen
existieren · Shops liegen auf begehbaren Kacheln (Reachability-Test). Die Schmiede kauft etwas
teurer (`buyMultiplier: 1.1`) → Premium-Handwerk; Hipokte/Vollheiltrank als Heil-Versorgung.
