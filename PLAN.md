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
- **Ziel-Plattform:** **Browser & Handy** (mobile-first). Touch- **und** Tastatur-/Gamepad-Steuerung. **PWA** (installierbar, offline) via Service Worker.
- **Sprache (UI/Story):** **Deutsch**.
- **Tests:** **Vitest** für die **engine-/DOM-freie Spiellogik** (Werte, Kampf, Inventar, Save, Datenintegrität). Phaser-Szenen bleiben dünn; die Logik liegt in reinen, headless testbaren Modulen — wie im Vorgängerprojekt bewährt.
- **CI:** GitHub Actions: Typecheck + Tests bei Push/PR; Deploy (z. B. GitHub Pages) nur bei grün.
- **Abhängigkeiten schlank halten:** außer Phaser nur das Nötigste; nichts hinzufügen, was wenige Zeilen selbst erledigen.
- **Speichern:** `localStorage`, **versioniertes Schema** mit `migrate()`/`normalize()`, Export/Import als JSON, Reset.
- **Determinismus:** Kampf-/Zufallslogik über seedbaren RNG → reproduzierbare Tests.

## Architektur (Zielbild)
```
index.html              Mount-Punkt + PWA-Registrierung
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
- **Reine Engine `src/systems/battle.ts`** (Phaser-/DOM-frei, seedbar): **CT-Initiative** (geschwindigkeitsbasiert), Aktionen **Angriff / Magie / Heilung / Verteidigen / Fliehen**, Elemente + Schwächen (×1,75) / Resistenzen (×0,5), Status **Gift** (DoT) und **Verteidigt** (halber Schaden), AoE-Magie (`alle-gegner`), einfache **Gegner-KI** (Caster bevorzugt Schwächen), **Beute** (EP/Gold beim Besiegen), garantierte Terminierung (Sieg/Niederlage/Flucht oder LP-Anteil nach 300 Zügen). `renderView` liefert ein kopiertes View-Modell.
- **Daten:** `src/data/skills.ts` (6 Fähigkeiten, typisiert) und `src/data/units.ts` (Demo-Party + 4 Gegner mit Statblock/Beute) — bis das Party-/Progressionssystem aus Phase 2 angebunden ist.
- **`src/scenes/BattleScene.ts`:** treibt nur die Engine an — Gegner-/Party-Reihen mit LP/MP-Balken, Befehlsmenü (Angriff/Magie/Verteidigen/Fliehen), Fähigkeitsliste, Ziel-Antippen, automatische Gegnerzüge mit kurzer Pause, Ergebnis (Beute) → zurück zur Oberwelt. Auslösung aus der Oberwelt per **Enter/Knopf**; in `main.ts` registriert.
- **Test `test/battle.test.ts`:** 7 Checks (Aufbau, Determinismus inkl. Log, Sieg+Beute, Niederlage/Terminierung, Szenariomatrix 12×, Verteidigen, Flucht).
- **Abnahme (lokal verifiziert):** `npm run typecheck` sauber, `npm test` → **16/16** grün (7 Kampf + 5 RNG + 4 Oberwelt), `npm run build` → `dist/`. *Live-Browser-Smoke noch manuell; Logik/Build grün. Item-Aktion bewusst zurückgestellt, bis das Inventar (Phase 2/4) steht.*

[ ] **Phase 4 – Menüs: Party, Inventar, Ausrüstung, Status, Rollen**
- Menü-Overlay: Party-Übersicht, Inventar (nutzen/sortieren), Ausrüstung (Slots, Werteänderung), Status/Skills.
- Erste Rollen-/Job-Ansicht: verfügbare Rollen, Werteauswirkung, Skill-Zugriff, klare Erklärung der taktischen Funktion.
- Streamlining: häufige Aktionen brauchen kurze Wege; Sortieren, Vergleichen, Ausrüsten und Item-Nutzung müssen auf Touch schnell funktionieren.
- **Abnahme:** Ausrüsten/Verbrauch verändern Werte korrekt (Logiktests); Rollenwerte werden korrekt berechnet; Menü auf Touch bedienbar (≥44 px) und ohne verschachtelte Sackgassen.

[ ] **Phase 5 – Welt: NPCs, Dialoge, Städte, Shops, Begegnungen**
- Dialogsystem (datengetrieben, Auswahlen, Flags/Quests), NPCs, eine Stadt mit Shop (Kauf/Verkauf), Zufalls-/Trigger-Begegnungen, die in den Kampf führen.
- Stadt als sicherer Spielraum: Lore-Hub, Quest-Knoten, leichte Puzzle-/Erkundungsinteraktionen und Vorbereitung auf den nächsten Kampfabschnitt.
- Erste Beziehungspunkte/Bindungsflags aus Dialogen oder Quests setzen; Boni zunächst klein und testbar halten.
- **Abnahme:** Ein durchgängiger Mini-Spielfluss (Stadt → NPC/Quest → Shop/Puzzle → Begegnung → Kampf → Belohnung/Bindungsfortschritt → Speichern) ist spielbar und in einem Headless-Durchspieltest abgedeckt.

[ ] **Phase 6 – Inhalt & Progression: Entwicklung, Namensgebung, Jobs, Beziehungen**
- Marquee-Feature der Vorlage als Party-Progression: Namensgebung → Entwicklung/Evolution, Skill-Erwerb, Ränge/Level; mehrere Helden-/Monsterlinien, Gegner und Regionen als Inhalt.
- Job-/Rollen-System ausbauen: Freischaltungen über Story, Entwicklung, Beziehungen oder Erkundung; späterer Zielpunkt ist kontrollierter Rollenwechsel im Kampf.
- Beziehungen ausbauen: Bindungsstufen, kurze Szenen, Team-/Passiveffekte und nachvollziehbare Boni.
- Aufhol-/Skalierungsregeln: Reserve-EP, Party-weites Level-Aufholen oder Kapitel-Baselines verhindern repetitive Nachlevel-Phasen.
- Balance-Analyse (Kraftkurven je Rang/Level/Rolle/Bindungsbonus) als Test/Heuristik.
- **Abnahme:** Entwicklung/Namensgebung verändert Werte/Skills nachvollziehbar; Rollen- und Bindungsboni sind testbar; Balance-Bänder monoton; ungenutzte Figuren können ohne Grinding wieder sinnvoll eingesetzt werden; Inhalt deckt mehrere Linien/Regionen ab.

[ ] **Phase 7 – Feinschliff: Audio, Übergänge, Tutorial, Polish**
- Szenenübergänge, Trefferfeedback/Partikel, Musik/SFX (lokale Assets), kurzes Tutorial/Onboarding, Optionen (Lautstärke, Effektstufe, Steuerung).
- **Abnahme:** Spielfluss fühlt sich rund an; Optionen persistiert; keine Konsolenfehler.

[ ] **Phase 8 – PWA/Offline & Release**
- Service Worker (App-Shell + Assets), Web-App-Manifest, installierbar; Build-Größenbudget; Deploy (GitHub Pages) via CI bei grün.
- **Abnahme:** installierbar, nach erstem Laden offline lauffähig; Lighthouse-PWA grün; Deploy automatisiert.

## Verifikation (Methodik)
- **Headless-Logik:** `bun run test` (Vitest) gegen `src/systems` & `src/data` — Kampf-Determinismus, Save-Roundtrip/Migration, Datenintegrität, Jobs/Rollen, Beziehungen, Aufholmechaniken, Balance-Bänder.
- **Typsicherheit:** `tsc --noEmit` in CI.
- **Manuell/Browser:** `bun run dev`, Prüfung in Handygröße (390×844) und Desktop; optional Playwright-Screenshots.
- **Smoke-Flow:** Oberwelt bewegen → Begegnung → Kampf gewinnen → Menü/Ausrüstung → Speichern → neu laden (Stand bleibt) → Reset.
