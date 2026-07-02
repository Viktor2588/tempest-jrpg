# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- Keine laufende Phase.

## Integrationswarteschlange

- Keine offenen Integrationen.

## Story-Roadmap

- Keine offene Story-Roadmap-Phase.

## Balance-Roadmap (TODO.md: Kaempfe zu leicht, Grind-Gefuehl, kein Schwung)

Befund (Headless-Sim, Auto-Battle, 5 Seeds, ohne Talente/Ausruestung):
Gleichlevel-Normalkaempfe enden 5/5 mit 100 % Party-HP (reiner Filler);
Mordrahn (L10) faellt einer L6-Party in 7 Zuegen per Verschlingen-Instant-Kill;
Geld (L16) verliert 5/5 gegen eine ausgeruhte L8-Party bei ~100 % Rest-HP.
Kernproblem: Heilung/Action-Economy >> Gegnerdruck; Devour entwertet Bosse;
Leveln ist dadurch bedeutungslos, Kaempfe fuehlen sich nach Pflicht-Grind an.

- [ ] Phase 53 — Druck vor Sustain: Gegner-Stat-Pass in `enemies.ts`
  (Boss-Angriff/Magie +30–50 %, Trash etwas mehr Schaden, weniger HP),
  Heilskalierung senken (`soothing-prayer`/`sacred-weave`: power + magic*0.6
  statt magic*1.1), MP-Kosten der Heilungen anheben; Harness-Korridore
  aktivieren und einpendeln.
- [ ] Phase 54 — Boss-Integritaet: `boss: true`-Flag in `EnemyDefinition`
  (mordrahn, orc-disaster, ifrit, elder-direwolf, gabiru, masked-majin, milim);
  Verschlingen gegen Bosse nur bei aktivem `guard-break` UND Phase 2, sonst
  %-Schaden statt Instant-Kill; Bosse nutzen in Phase 2 ein erweitertes
  Skill-Set (AoE/Debuff) statt nur hoeherer Skill-Chance.
- [ ] Phase 55 — Kurve & Anti-Grind: XP-Belohnungen so setzen, dass der
  Hauptpfad ohne Grind die Ziellevel erreicht (≈L9–10 vor Mordrahn, ≈L13 vor
  Geld/Ifrit); Zufalls-Encounter aufwerten (2–3er-Gruppen, mehr XP, seltene
  Drops), damit optionale Kaempfe sich lohnen statt zu fuellen; Harness-Sim
  „ohne Grind" muss alle Pflichtkaempfe knapp, aber sicher gewinnen.
- [ ] Phase 56 — Schwung im Kampf: Break/Team/Devour in Normalkaempfen relevant
  machen (Trash-HP niedrig, Schaden hoch → Schwaeche schnell loesen oder echten
  Schaden nehmen); Telegraph-/Reaktionsfenster gegen haertere Gegnerzuege
  praesentieren; Sim-Metrik: mittlere Zuganzahl sinkt, Rest-HP-Streuung steigt.

## UI- & Grafik-Roadmap (TODO: UI-Bugs, unscharfe Grafik auf 4K)

Befund (Code-Analyse): `main.ts` fixiert den Canvas auf 960x540 mit
`Scale.FIT` — auf 4K streckt der Browser das Backing ~4x per CSS, alles wird
unscharf (auch Text; nirgends wird eine Text-`resolution` gesetzt). Global
erzwingt `pixelArt: true` NEAREST-Filterung auch fuer die malerischen
128x128-KI-Tiles, die auf TILE=48 dezimiert werden (Aliasing); einzelne
Stellen (battleBackgroundAtlas, PreloadScene:353) stellen bereits manuell auf
LINEAR um. Generierte Texturen (Battle-BGs 960x540, Portraits, VFX) sind nur
in 1x-Aufloesung erzeugt; Kenney-Sprites sind 16x16 (12x-Upscale auf 4K).

- [ ] Phase 57 — HiDPI-Rendering: kurzer Spike, ob Phaser 4.2 native
  DPR-/Resolution-Unterstuetzung im ScaleManager hat; sonst Canvas-Backing
  DPR-bewusst dimensionieren (Spielgroesse = 960x540 * min(devicePixelRatio, 2–3),
  FIT beibehalten) und die logischen Koordinaten ueber einen zentralen
  Kamera-Zoom-Helper je Szene erhalten (Szenen bleiben auf 960x540-Layout);
  Text-Factory-Helper mit `resolution: dpr` als Default; E2E-Screenshot-Smoke
  mit deviceScaleFactor 2 als Schaerfe-Regression (Canvas-Backing-Groesse
  asserten); Performance auf Mobile pruefen (DPR-Kappung).
- [ ] Phase 58 — Texturfilter & Asset-Schaerfe: global `pixelArt: false`;
  NEAREST nur gezielt fuer die 16x16-Pixel-Sprites setzen, LINEAR fuer
  malerische Tiles/Banner/Portraits (bestehende Einzelfaelle konsolidieren);
  generierte Texturen (placeholderArt, portraitAtlas, vfxAtlas,
  battleBackgroundAtlas) in DPR-facher Groesse erzeugen; `roundPixels`/
  `autoRound` gegen Subpixel-Schmieren pruefen.
- [ ] Phase 59 — Menue-/HUD-Bugs: Menue-Bodies scrollbar; Quest-/Codexlisten
  filtern und Detailansichten statt ueberlanger Uebersichtskarten; Party nicht
  redundant auf jeder Menue-Seite; Ueberlappungen in Status, Ausruestung,
  Verzauberung, Inventar und mobilen Textlayouts korrigieren; Namensgebung,
  Entwicklungen und Bindungen unter Status konsolidieren; Layout-Validierung
  nach dem `HudLayoutIssue`-Muster aus `mobileLayout.ts` auf Menue-Seiten
  ausweiten, damit Ueberlappungen testbar werden.
- [ ] Phase 60 — Welt-Interaktion & Sieg-Praesentation: NPC-Kollisionen und
  Gateway-Ausloesung erst auf dem Zielfeld; Siegesergebnis und Rueckkehr zur
  Welt klarer praesentieren (klare Beute-/XP-Zusammenfassung, sauberer
  Szenenuebergang).
- [ ] Phase 61 — Asset-Aufloesungs-Pass (Imagegen bevorzugt): 16x16-Kenney-
  Sprites durch hoeher aufgeloeste, artSpec-konforme generierte Sprites
  ersetzen (Overworld-Figuren, Gegner-Cutouts zuerst), Provenienz in
  `ASSETS.md`; Ziel: kein sichtbarer 12x-Upscale mehr auf 4K.

## UX- und Welt-Backlog

- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
