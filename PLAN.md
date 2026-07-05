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
Fundament: Phase 80 (Eskalation) ist gemergt; #1 verzahnt sich direkt damit.

- [ ] Phase 82 — Gegner-Archetypen, die das dominante Muster bestrafen: wenige,
  datengetriebene Archetypen, die je eine andere Antwort erzwingen und den
  Talentbaeumen + devourten Skills Zweck geben — Heiler-Bestrafer (kontert/
  reflektiert Heilung), Element-Reflektor (zwingt zum Umschalten), Teiler/
  Beschwoerer (zwingt zu AoE/Priorisierung), "gepanzert bis Break"-Tank (zwingt
  in den Break-Loop). Ueber vorhandene Status-/Skill-Felder; Sim muss zeigen,
  dass die Standardtaktik hier messbar schlechter abschneidet.
- [ ] Phase 83 — Ressourcen-Bogen ueber einen Dungeon (Sustain-Wurzel): heute
  heilt die Party zwischen Kaempfen gratis auf voll (`restore-party`, MP billig)
  → kein Attritions-Bogen, kein "Schwung" ueber eine Kartensequenz. Knapperes
  MP / weniger Gratis-Voll-Restores, sodass die Kampf-*Folge* zum Ressourcen-
  Puzzle wird ("bursten oder sparen?"). Groesster Design-Aufwand; Balance-
  Harness um Carryover-Ressourcen ueber die Story-Route erweitern.
- [ ] Phase 84 — Verschlingen als gerichtete Jagd (Codex): die Devour-Map (jeder
  Gegner lehrt Rimuru einen Skill) im Codex sichtbar machen ("dieser Gegner
  lehrt X"), damit der Spieler gezielt Gegner sucht, um Rimuru zu formen —
  verwandelt Grind in gerichtete Neugier. Codex existiert bereits; kleiner
  Aufwand, hoher Sog.
- [ ] Phase 85 — Reaktionen als sichtbare, lehrbare aktive Verteidigung: die
  Timing-Block/Konter-Fenster (`perfect` = 0.25×/0.45×) existieren, sind dem
  Spieler aber kaum vermittelt. Sichtbar + lehrbar machen (Tutorial-Beat, HUD-
  Fenster), sodass Verteidigung ein Koennens-Moment wird. Verzahnt mit Phase 81
  (telegraphierter Big-Hit → perfektes Block-Fenster).
- [ ] Phase 86 (Cluster) — Out-of-Combat-Tiefe (knuepft an die Story-Roadmap
  oben an): Story-Konsequenzen vertiefen (mehr Verzweigungen mit sichtbarer
  Welt-/Shop-/Kampf-Folge, Richtung Phase 64) + Weltreaktivitaet/Entdeckung
  (Karten-Events jenseits von Kaempfen, sichtbar veraenderte Welt nach Bossen,
  Richtung Phase 65). Niedriger als Kampf-Tiefe, weil Kampf ~80 % der Spielzeit
  ist — aber der naechste Schritt, sobald die Kampfschleife traegt.

## UX- und Welt-Backlog

- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
