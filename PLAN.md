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

- [ ] Phase 52 — Balance-Harness: Headless-Playthrough-Sim (Auto-Battle ueber
  alle Story-Trigger-Encounter, HP/MP/Item-Carryover) als Vitest-Suite mit
  Zielkorridoren: Normalkampf auf Gleichlevel 4–7 Zuege und 55–85 % Rest-HP;
  Boss auf Ziellevel 10–20 Zuege, 25–60 % Rest-HP, Sieg 5/5 ausgeruht;
  Boss 4 Level unter Ziel < 50 % Siegquote. Korridore zunaechst als Report
  (nicht assertierend), ab Phase 53 als harte Assertions.
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

## UX- und Welt-Backlog

- [ ] Menue-Bodies scrollbar machen; Quest- und Codexlisten filtern und
  Detailansichten statt ueberlanger Uebersichtskarten anbieten.
- [ ] Party nicht redundant auf jeder Menue-Seite anzeigen.
- [ ] Status, Ausruestung, Verzauberung, Inventar und mobile Textlayouts auf
  Ueberlappungen pruefen und korrigieren.
- [ ] Namensgebung, Entwicklungen und Bindungen unter Status konsolidieren.
- [ ] NPC-Kollisionen und Gateway-Ausloesung erst auf dem Zielfeld umsetzen.
- [ ] Siegesergebnis und Rueckkehr zur Welt klarer praesentieren.
- [ ] Shunas Einstiegstempo vor neuem Band-Content bewusst entscheiden.
