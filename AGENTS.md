## Arbeitsweise fuer Plan-Phasen

Wenn der Nutzer sagt "mach weiter mit den naechsten Phasen des Plans" oder
aehnlich, arbeite autonom an der naechsten sinnvollen offenen Phase in
`PLAN.md`.

Priorisiere dabei, wenn moeglich, Imagegen-/Asset-Erzeugungsaufgaben vor reinen
UI-, Text- oder Refactor-Aufgaben.

Pflichtablauf fuer jede Phase:

1. Immer in einem eigenen Git-Worktree arbeiten, niemals direkt im
   Haupt-Checkout.
   - Worktree-Schema: `/worktree/tempest-phase-<nr>-<kurzname>`
   - Branch-Schema: `phase-<nr>-<kurzname>`

2. Vor Beginn der Umsetzung `PLAN.md` aktualisieren:
   - die begonnene Phase als `[~] ... (in Bearbeitung)` markieren
   - den verwendeten Worktree nennen
   - keine Phase uebernehmen, die bereits als `[~]` markiert ist

3. Waehrend der Umsetzung:
   - bestehende Projektmuster verwenden
   - Imagegen-/Asset-Provenienz in `ASSETS.md` dokumentieren
   - projektgebundene generierte Assets ins Repo uebernehmen, nicht nur im
     Codex-Generated-Images-Ordner liegen lassen
   - passende Tests ergaenzen oder aktualisieren

4. Vor Abschluss:
   - relevante Checks ausfuehren, mindestens Typecheck, Tests und Build
   - Browser-/E2E-Smoke ausfuehren, wenn Rendering oder Assets betroffen sind
   - `PLAN.md` von `[~]` auf `[x]` setzen und Abnahme/Checks dokumentieren
   - Aenderungen committen und den Phase-Branch pushen

5. Worktree-Aufraeumen:
   - beim Merge nach `main` den Abschluss in
     `docs/PROJECT_KNOWLEDGE.md`/Git-Historie archivieren und die erledigte
     Phase aus `PLAN.md` entfernen; `PLAN.md` enthaelt auf `main` nur offene
     oder laufende Arbeit
   - Worktrees erst entfernen, nachdem die jeweilige Phase in `main` gemerged
     wurde
   - vor dem Entfernen pruefen, dass der Worktree keine uncommitted
     tracked/untracked Aenderungen enthaelt
   - nicht gemergte Worktrees oder Branches nicht loeschen
   - nach bestaetigtem Merge den Worktree entfernen und nur ignorierte
     Build-/Dependency-Artefakte verwerfen
