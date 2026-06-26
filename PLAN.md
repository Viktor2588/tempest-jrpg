# Plan: „Tempest – Chronik" (JRPG, Phaser, Browser & Handy)

## Arbeitsweise
- Dieser Plan ist die **verbindliche Referenz** für das Projekt. Alle künftigen Änderungen am Konzept werden in **dieser Datei** (`PLAN.md`) nachgezogen.
- Umsetzung erfolgt **autonom (Automode)**: die jeweils nächste offene Phase wird durchgebaut, headless getestet und im Browser/auf Handy-Größe geprüft; Rückmeldung bei echten Entscheidungen oder am Phasenende.
- Fortschritt steht unten unter **Status / Fortschritt**.
- **Phasen-Disziplin:** Eine Phase, die gerade bearbeitet wird, wird hier als `[~] … (in Bearbeitung)` markiert. Beim Lesen dieses Plans nur Phasen übernehmen, die **nicht** in Bearbeitung sind, damit parallele Arbeit nicht kollidiert.

## Kontext / Vision
Ein klassisches **JRPG** im Universum von *That Time I Got Reincarnated as a Slime* (Tensura) bzw. der „Tempest"-Welt: eine erkundbare Oberwelt mit Städten und NPCs, eine Party reisender Helden/Monster, **rundenbasierte Kämpfe**, ein Fertigkeits-/Magiesystem, Ausrüstung und Inventar, eine fortschreitende Geschichte mit Dialogen und Quests sowie das markante **Kreaturen-Entwicklungs-/Namensgebungs-System** der Vorlage als Party-Progression.

Bewusster Neuanfang (Clean Slate) statt Migration des bestehenden Königreich-Builders: die Architektur soll von Beginn an zum JRPG-Genre passen.

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
    inventory.ts          Items, Ausrüsten, Verbrauch
    save.ts               Serialisieren/Laden/Migration
  data/                Inhaltstabellen (typisiert): Helden/Monster, Skills, Items, Gegner, Karten, Dialoge, Quests
  ui/                  Wiederverwendbare HUD-/Menü-Bausteine
  assets/              Tilesets, Sprites, Portraits, Audio (zunächst Platzhalter)
test/                  Vitest-Suiten gegen src/systems & src/data
```

### Architektur-Prinzipien
- **Logik strikt von Phaser trennen.** Alles unter `src/systems/` und `src/data/` ist frei von Phaser/DOM und damit headless testbar. Szenen rufen nur die Logik-API auf und rendern deren View-Modell — wie die bewährte „Renderer verändert nie den Zustand"-Trennung des Vorgängers.
- **Datengetrieben.** Inhalte (Gegner, Skills, Items, Karten, Dialoge) liegen als typisierte Daten, nicht im Code verstreut.
- **Mobile-first.** Große Tap-Ziele, Touch-Steuerkreuz/-Buttons, kein Hover-Zwang; skaliert auf Desktop.
- **Lazy/minimal.** Erst wenn ein System spielbar gebraucht wird, wird es gebaut; keine spekulativen Abstraktionen.
- **Jede nicht-triviale Logik bekommt einen Test.** Mindestens ein laufender Check, der bricht, wenn die Logik bricht.

## Status / Fortschritt

[ ] **Phase 0 – Projekt-Setup & Tooling**
- Vite + Phaser 3 + TypeScript aufsetzen; `index.html`, `src/main.ts`, leere Boot/Preload-Szene; auf Handy-Größe und Desktop lauffähig.
- Skalierungsstrategie (FIT/RESIZE, Referenzauflösung) und Eingabe-Grundgerüst (Touch + Tastatur).
- Vitest einrichten; erster Beispiel-Test (`systems/rng`) grün. GitHub Actions (Typecheck + Test). `.gitignore`, README-Stub.
- **Abnahme:** `npm run dev` startet, `npm test` grün, leere Szene erscheint auf 390×844 und Desktop ohne Konsolenfehler.

[ ] **Phase 1 – Spielbarer Kern: Oberwelt**
- Tilemap-Oberwelt (Tiled-JSON oder datengetrieben), Spielerfigur mit 4-Richtungs-Bewegung + Kollision, folgende Kamera.
- Touch-Steuerkreuz und Tastatur (WASD/Pfeile); ein begehbares Testgebiet mit Hindernissen und einem Übergang.
- **Abnahme:** Spieler bewegt sich flüssig auf Handy & Desktop, Kollision/Übergänge funktionieren; Bewegungslogik (Kollisionsprüfung) headless getestet.

[ ] **Phase 2 – Datenmodell & Speichern**
- Typisierte Daten für Party-Charaktere (Werte, Level, EP, Skills, Ausrüstung) und ein erstes Gegner-/Skill-/Item-Set.
- `save.ts`: versioniertes Schema, `migrate()`, Export/Import, Reset; Auto-Save.
- **Abnahme:** Zustand übersteht Speichern→Laden (Roundtrip-Test); Migration eines „alten" Stands getestet; Datenintegrität (eindeutige IDs, gültige Referenzen) als Test.

[ ] **Phase 3 – Rundenkampf-Engine**
- DOM/Phaser-freie `battle.ts`: Zugreihenfolge (Geschwindigkeit/ATB), Aktionen (Angriff, Skill, Magie, Item, Verteidigen, Fliehen), Elemente/Schwächen, Statuseffekte, einfache Gegner-KI, garantierte Terminierung, seedbar.
- `BattleScene.ts` rendert das View-Modell, Befehlsmenü, Trefferanzeigen; Sieg → EP/Beute, Niederlage → Game-Over/Rückkehr.
- **Abnahme:** Szenariomatrix (mehrere Partys × Gegner × Seeds) terminiert deterministisch; Sieg/Niederlage/Beute getestet; auf Handy & Desktop spielbar.

[ ] **Phase 4 – Menüs: Party, Inventar, Ausrüstung, Status**
- Menü-Overlay: Party-Übersicht, Inventar (nutzen/sortieren), Ausrüstung (Slots, Werteänderung), Status/Skills.
- **Abnahme:** Ausrüsten/Verbrauch verändern Werte korrekt (Logiktests); Menü auf Touch bedienbar (≥44 px).

[ ] **Phase 5 – Welt: NPCs, Dialoge, Städte, Shops, Begegnungen**
- Dialogsystem (datengetrieben, Auswahlen, Flags/Quests), NPCs, eine Stadt mit Shop (Kauf/Verkauf), Zufalls-/Trigger-Begegnungen, die in den Kampf führen.
- **Abnahme:** Ein durchgängiger Mini-Spielfluss (Stadt → NPC/Quest → Shop → Begegnung → Kampf → Belohnung → Speichern) ist spielbar und in einem Headless-Durchspieltest abgedeckt.

[ ] **Phase 6 – Inhalt & Progression: Kreaturen-Entwicklung & Namensgebung**
- Marquee-Feature der Vorlage als Party-Progression: Namensgebung → Entwicklung/Evolution, Skill-Erwerb, Ränge/Level; mehrere Helden-/Monsterlinien, Gegner und Regionen als Inhalt.
- Balance-Analyse (Kraftkurven je Rang/Level) als Test/Heuristik.
- **Abnahme:** Entwicklung/Namensgebung verändert Werte/Skills nachvollziehbar; Balance-Bänder monoton; Inhalt deckt mehrere Linien/Regionen ab.

[ ] **Phase 7 – Feinschliff: Audio, Übergänge, Tutorial, Polish**
- Szenenübergänge, Trefferfeedback/Partikel, Musik/SFX (lokale Assets), kurzes Tutorial/Onboarding, Optionen (Lautstärke, Effektstufe, Steuerung).
- **Abnahme:** Spielfluss fühlt sich rund an; Optionen persistiert; keine Konsolenfehler.

[ ] **Phase 8 – PWA/Offline & Release**
- Service Worker (App-Shell + Assets), Web-App-Manifest, installierbar; Build-Größenbudget; Deploy (GitHub Pages) via CI bei grün.
- **Abnahme:** installierbar, nach erstem Laden offline lauffähig; Lighthouse-PWA grün; Deploy automatisiert.

## Verifikation (Methodik)
- **Headless-Logik:** `npm test` (Vitest) gegen `src/systems` & `src/data` — Kampf-Determinismus, Save-Roundtrip/Migration, Datenintegrität, Balance-Bänder.
- **Typsicherheit:** `tsc --noEmit` in CI.
- **Manuell/Browser:** `npm run dev`, Prüfung in Handygröße (390×844) und Desktop; optional Playwright-Screenshots.
- **Smoke-Flow:** Oberwelt bewegen → Begegnung → Kampf gewinnen → Menü/Ausrüstung → Speichern → neu laden (Stand bleibt) → Reset.
