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
- **Taktische Rollenvielfalt:** Jobs/Klassen/Rollen sollen nicht nur außerhalb des Kampfes relevant sein. Ein späteres Ziel ist das **schnelle Wechseln von Rollen im Kampf**, um Gegnerphasen, Schwächen und Party-Synergien taktisch auszunutzen.
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
- **Namensgebung & Entwicklung als Kernfantasie:** Das Tempest-typische Kreaturen-Entwicklungs-/Namensgebungssystem bleibt die zentrale Progressionsfantasie und verbindet Werte, Skills, Rollen und Story-Status.
- **Grinding minimieren:** Wiederholkämpfe dürfen lohnen, aber der Hauptfortschritt soll aus Questfortschritt, taktisch guten Kämpfen, Entwicklung, Beziehungen und Erkundung entstehen.

## Technische Entscheidungen
- **Engine:** **Phaser 3** (Canvas/WebGL) mit **TypeScript**.
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
    jobs.ts               Rollen-/Klassenmodell, Freischaltungen, Wechselkosten, Kampf-Synergien
    relationships.ts      Bindungen/Freundschaft, Story-Flags, Kampf-/Quest-Boni
    progression.ts        Levelkurven, Reserve-EP, Aufhol-/Skalierungsregeln
    inventory.ts          Items, Ausrüsten, Verbrauch
    save.ts               Serialisieren/Laden/Migration
  data/                Inhaltstabellen (typisiert): Helden/Monster, Jobs, Beziehungen, Skills, Items, Gegner, Karten, Dialoge, Quests
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
- **Story und Mechanik greifen ineinander.** Beziehungen, Jobs/Rollen, Namensgebung, Entwicklung und Kampfboni sollen über dieselben Datenmodelle erklärbar und testbar sein.
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
- Datenintegrität zentral prüfbar: `src/data/index.ts` exportiert `GAME_DATA` und `validateGameData()` für eindeutige IDs, Skill-/Item-/Equipment-Referenzen, Drop-Chancen und Basiswerte.
- Erste reine Systemmodule ergänzt: `stats.ts` (Level/EP/Werte), `party.ts` (Initialparty/PartyMember-State), `inventory.ts` (Stacks/Startinventar/Normalisierung).
- `save.ts`: versioniertes Schema `SaveGameV2`, `createNewSave()`, `normalize()`, `migrate()`, `exportSave()`, `importSave()`, `loadSave()`, `writeSave()`, `autoSave()`, `resetSave()` über eine testbare `StorageLike`-Abstraktion.
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
- Assets sind **KI-erzeugt oder frei** (bevorzugt **CC0**, sonst CC-BY/OGA-BY). Jede Quelle + Lizenz wird in **`ASSETS.md`/`CREDITS`** mit Attribution geführt; nichts ohne klare Lizenz ins Repo.
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

[ ] **Phase 11 – Progression & Kernfantasie** *(autonom)*
- **Namensgebung → Evolution** als Herzstück (Werte-/Skill-/Rollen-Schub, sichtbare Formen), **Skill-Bäume**, tiefere **Ausrüstung/Sets/Verzauberung**, **Bindungen/Beziehungen** mit Spielwert (Team-Angriffe, Buffs, Szenen). Anti-Grinding/Aufholmechaniken aus Phase 6 verzahnen.
- **Abnahme:** Entwicklung/Namensgebung verändert Werte/Skills nachvollziehbar; Bindungs-Boni greifen im Kampf; Save-Migration getestet; Balance-Bänder monoton.

[ ] **Phase 12 – Welt, Story & Quests** *(teils autonom; Story-Richtung von dir)*
- Erzählbogen + denkwürdige Figuren, **Quest-/Flag-System**, mehrere **Städte & Dungeons mit eigener Identität** (Mechanik + Optik), Lore-/Codex, Cutscene-Bausteine in `DialogueScene`.
- **Abnahme:** durchgängiger Story-Slice (Intro → Stadt → Quest → Dungeon → Boss → Belohnung) headless durchspielbar; Quests/Flags persistiert.

[ ] **Phase 13 – Art- & Audio-Produktion** *(braucht Asset-Pipeline; siehe Asset-Strategie)*
- **Art Bible** + Pipeline (Tilesets, Charakter-Sprites/Portraits, Gegner, VFX-Atlas, UI-Skin) — KI/frei, mit `ASSETS.md`-Attribution. **Musik + echte SFX** ersetzen die prozeduralen Töne (Lautstärke-System steht bereits). Lazy-Load je Szene.
- **Abnahme:** kohärenter Look über Oberwelt/Kampf/Menü; alle Lizenzen dokumentiert; Bundle im Budget; Rechtecke/Beep-SFX vollständig ersetzt.

[x] **Phase 14 – Zugänglichkeit, Schwierigkeit & Tempo (fertig 2026-06-27, Worktree `worktree/tempest-phase-14-accessibility`)** *(bewusst settings-isoliert, kollisionsfrei zur parallelen Engine-Arbeit)*
- **`systems/settings.ts` erweitert** (rein, getestet): `difficulty` (leicht/normal/schwer), `textSpeed` (langsam/normal/schnell/sofort), `highContrast`, `colorblind` (aus/protan/deutan/tritan) mit Enum-Validierung + abwärtskompatibler Migration. Abgeleitete Helfer `textCharDelayMs`, `enemyDamageMultiplier`, `playerDamageMultiplier` (Letztere für die Kampf-Engine bereitgestellt).
- **`OptionsScene` neu aufgebaut:** kompakte Reihen für Lautstärken + alle Zugänglichkeitsoptionen (Cycler/Toggle), sofort persistiert, SFX-Feedback, ≥38 px Tap-Ziele.
- **`DialogueScene` Schreibmaschineneffekt:** Text erscheint nach `textSpeed` (Tippen/Klick vervollständigt sofort; „sofort"/reduzierte Bewegung = ganzer Text); **hoher Kontrast** schaltet auf reinweiße Schrift.
- *Wiring offen (kollisionsbewusst): `difficulty`-Multiplikatoren in die Kampf-Engine und `colorblind`-Palette ins globale Rendering — Helfer/Settings stehen bereit, Einbau wenn die Engine-/Render-Phasen nicht mehr parallel laufen.*
- **Test `test/settings.test.ts` erweitert:** Defaults, Enum-Validierung, abgeleitete Werte (zusätzlich zu den bestehenden Lautstärke-/Migrationschecks).
- **Abnahme (lokal verifiziert):** `bun run typecheck` sauber, `bun run test` → **63/63** grün, `bun run build` → `dist/`. Optionen persistiert & wirksam (Tempo/Kontrast sichtbar im Dialog).

[ ] **Phase 15 – Balance, QA & Mobile-Politur**
- Balance-Heuristiken als Tests, vollständiger Headless-Durchspieltest, Performance/Akku auf dem Handy (Render-/Tick-Budget), Eingabe-/Layout-Politur, Bugfix-Durchlauf.
- **Abnahme:** `bun run test` grün inkl. Balance-/Durchspielmatrix; flüssig auf 390×844; keine Konsolen-/Layoutfehler.

## Verifikation (Methodik)
- **Headless-Logik:** `bun run test` (Vitest) gegen `src/systems` & `src/data` — Kampf-Determinismus, Save-Roundtrip/Migration, Datenintegrität, Jobs/Rollen, Beziehungen, Aufholmechaniken, Balance-Bänder.
- **Typsicherheit:** `tsc --noEmit` in CI.
- **Manuell/Browser:** `bun run dev`, Prüfung in Handygröße (390×844) und Desktop; optional Playwright-Screenshots.
- **Smoke-Flow:** Oberwelt bewegen → Begegnung → Kampf gewinnen → Menü/Ausrüstung → Speichern → neu laden (Stand bleibt) → Reset.
