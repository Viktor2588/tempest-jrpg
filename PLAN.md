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
Raserei) und 88 (build-relevante Kategorie-Resistenz) sind gemergt.

- [ ] Phase 85 — Reaktionen als sichtbare, lehrbare aktive Verteidigung: die
  Timing-Block/Konter-Fenster (`perfect` = 0.25×/0.45×) existieren, sind dem
  Spieler aber kaum vermittelt. Sichtbar + lehrbar machen (Tutorial-Beat, HUD-
  Fenster), sodass Verteidigung ein Koennens-Moment wird. Verzahnt mit Phase 81
  (telegraphierter Big-Hit → perfektes Block-Fenster).
- [ ] Phase 88b — Build-relevante Encounter, Folge-Inkrement (Inkrement 1
  `resistsCategory` ist gemergt): Magie-Reflect als ganze Kategorie + expliziter
  Support-Check (ein Add, das ohne Kontrolle/Silence den Kampf kippt); die
  Kategorie-Resistenz zusaetzlich on-route platzieren, sobald die Harness-Party
  beide Damage-Typen sicher traegt.
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

## UX- und Welt-Backlog

- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
- [ ] Content-Breite fuer "Schwung": 25 Gegner/25 Encounter fuer 4 Baende ist
  duenn, ebenso 3 Musik-Motive + 8 SFX. Mehr Region-Gegner (Vielfalt) und mehr
  CC0-Musik/SFX pro Region heben das Feel spuerbar — durch den CC0-Zwang aber
  begrenzt und niedrigerer Hebel als die Kampf-Tiefe-Roadmap.
