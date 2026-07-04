# Tempest - Chronik: Offene Aufgaben

Diese Datei enthaelt ausschliesslich noch nicht abgeschlossene Arbeit.

Status:

- `[~]` wird bereits in dem genannten Worktree bearbeitet.
- `[ ]` ist offen und darf gemaess `AGENTS.md` uebernommen werden.

## Laufende Arbeit

- [x] Phase 72 — Spec-Baum-UI (Worktree
  `/worktree/tempest-phase-72-spec-ui`): 3-Spalten-Spec-Layout mit
  Eltern-Kanten, Vorschau, Sperrgruenden, bestaetigter Strangwahl und
  begrenztem Touch-/Mausrad-Panning. Abnahme/Checks: `git diff --check`;
  `bun run typecheck`; `bun run test` (387 Tests); `bun run build`;
  `bun run test:e2e -- game.smoke.spec.ts --grep "Spec-Baum bestätigt"`
  (Desktop + Mobile, 2 Tests).

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

- [ ] Phase 64 — Entscheidungen mit Konsequenz: 2–3 Mittelspiel-Entscheidungen
  ueber vorhandene Flag-/Requirement-Mechanik (z. B. Deserteure: Gnade →
  neuer Dorf-NPC + Haendlerrabatt, Haerte → Folge-Encounter + Codexeintrag;
  Gabiru nach dem Duell: demuetigen vs. respektieren → andere Echsen-Dialoge
  und Bündnis-Bonus). Konsequenzen muessen in Welt, Shop oder Kampf sichtbar
  sein, nicht nur im Text; Verzahnung mit den Ende-Bedingungen aus Band 4.
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

- [x] Phase 70b — Spec-Straenge fuer die story-gegateten Baeume (gobta, shuna).
  Worktree: /worktree/tempest-phase-70b-spec-strands (Branch phase-70b-spec-strands).
  Umgesetzt: gobta und shuna in je 3 exklusive Straenge (Branch-Lock ueber die
  Phase-70-Engine) umgebaut, bestehende Skills + alle Gates unveraendert:
  - gobta: Reiter (story-gegatete Wolfsreiter-Kette: quick-step/storm-gust/
    direwolf-rush + Ausdauer/Physisch, Capstone-Kette direwolf-rush→orc-cleave)
    ODER Goblin-List (Ausweichen/Konter, goblin-feint→orc-cleave) ODER
    Sturmklinge (rohe physische Offensive + Konter).
  - shuna: Geistgewebe (story-gegatete Heil-/Barrierekette: barrier-prayer/
    sacred-weave + Team-Buffdauer/Schadensreduktion) ODER Analyse (magische
    Offensive, spirit-bind→umbral-burst) ODER Gnade (Ausweichen/Zaehigkeit).
  Alle Evolutions-/Beziehungs-/Flag-/Regions-Gates + die zugehoerigen Tests
  (progression/world/playthrough) bleiben gruen; specTree.test.ts um gobta/shuna
  (3 Straenge, ≥4 Knoten/Strang, Branch-Lock) erweitert. Balance-Hinweis:
  Ausweichperks auf gobtas Reiter-Einstiegsknoten kippten den Sim-Korridor der
  masked-majin-Ambush (Auto-Battler beendet den Kampf trivial → Rest-HP > 0.85) —
  daher fuehrt der Reiter-Strang Ausdauer/Physisch statt Dodge; Dodge ist bewusst
  der Goblin-List-Strang. Checks: typecheck ✓, npm test 388/388 ✓ (inkl.
  balanceHarness), build ✓. Rimurus Straenge folgen in Phase 71.
  Follow-up (Balance): masked-majin-Ambush sitzt schon ohne Specs bei Rest-HP
  0.821 (Korridor-Decke 0.85) — der Boss ist fuer eine spec-ausgeruestete Party
  knapp; eine spaetere Gegner-Nachjustierung (ausserhalb gobta/shuna-Scope) sollte
  den Beat wieder straffen.
- [ ] Phase 71 — Rimuru: Verschlingen als Progressionskern (inkl. seiner 3 Spec-
  Straenge, die sich mit Verschlingen verzahnen): Startskills auf
  `predator`, `great-sage`, `slime-strike` (+ `water-jet` als angeborene
  Schleimform-Faehigkeit) reduzieren; `water-blade`/`storm-gust` u. a. werden
  ueber Verschlingen erbeutet — Devour-Map-Pass ueber `enemies.ts`, damit
  jeder fruehe Gegner Rimuru etwas Neues beibringt (forest-slime lehrt aktuell
  `slime-strike`, das er schon kann → totes Verschlingen).
  `RIMURU_CORE_LOADOUT_SKILLS` (battle.ts) und Onboarding-Texte anpassen;
  Balance-Harness neu einpendeln, da Rimurus Fruehspiel schwaecher wird
  (Abstimmung mit Phasen 53–56/67).

## UX- und Welt-Backlog

- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
