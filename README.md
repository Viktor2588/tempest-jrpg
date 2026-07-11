# Tempest - Chronik

Ein deutsches, mobile-first Browser-JRPG mit Phaser 4.2, TypeScript, Bun und
Vite. Der spielbare Build verbindet deterministische, headless testbare
Spiellogik mit datengetriebenem Content und duennen Phaser-Szenen.

## Start

```bash
bun install --frozen-lockfile
bun run dev
```

## Verifikation

```bash
bun run typecheck
bun run test          # oder: bun run test:unit
bun run build
bun run test:e2e      # oder: bun run test:e2e:smoke
```

### Schnellster Workflow (empfohlen für tägliche Arbeit)

- **Watch-Modus** (schnellstes Feedback):
  ```bash
  bun run test:watch
  # oder direkt:
  bunx vitest
  ```
  Nur geänderte Tests werden neu ausgeführt. Das ist die beste Art, während der Entwicklung zu arbeiten.

- Spezifische Tests/Dateien:
  ```bash
  bunx vitest run test/battle.test.ts
  bunx vitest run test/playthrough.test.ts -t "Band 2"
  ```

- Schneller E2E-Smoke (nur Desktop):
  ```bash
  bun run test:e2e --project=desktop-chromium -g "Title → Overworld"
  ```

### Weitere nützliche Commands

| Command                    | Zweck                                      |
|----------------------------|--------------------------------------------|
| `bun run test:unit`        | Nur Unit-Tests                             |
| `bun run test:ci`          | Mit `--bail=1` (stoppt bei erstem Fehler)  |
| `bun run test:shard 1/4`   | Unit-Tests sharden (für große Runs / CI)   |
| `bun run test:e2e:shard 1/2` | E2E sharden                              |
| `bun run typecheck`        | Nur Typenprüfung (schnell)                 |

### Parallelität & Performance-Erkenntnisse

- **Unit-Tests (Vitest)**: Laufen standardmäßig parallel über Threads. In CI wird die Parallelität auf 3 Threads limitiert, um Runner nicht zu überlasten. Sharding (`--shard`) spaltet die Sammlung und Ausführung auf mehrere Jobs.
- **E2E (Playwright)**: `fullyParallel: true` + in CI 2 Worker. Für schnelle lokale Checks nur 1–2 Projekte nutzen (Desktop + Mobile). HiDPI-Projekte sind teurer und nur bei Bedarf.
- **Wartezeiten in E2E**: Viele feste `waitForTimeout` wurden durch einen `settle()`-Helper ersetzt (kurze Wartezeit + `expectCanvasContent`). Das macht Tests schneller und stabiler.
- **CI-Optimierungen**:
  - Bun- und Playwright-Browser-Cache
  - 4 parallele Unit-Shards + reduzierte E2E-Projekte
  - Docs-Änderungen (`.md`, `PLAN.md`, `docs/`) überspringen die meisten Jobs

### Tipps für schnelle Iteration

- Bei parallelen Worktrees: `PLAYWRIGHT_PORT=4174 bun run test:e2e ...` verwenden.
- Bei flaky E2E: Traces mit `trace: 'retain-on-failure'` in `playwright.config.ts` anschauen.
- Volle Suite nur bei Bedarf oder vor Commit/PR. Im Daily-Drive reicht Watch-Mode + gezielte Smokes.

Der Build erzeugt `dist/`. Die statische Web-App wird ohne Backend, PWA oder
Service Worker unter `/tempest-jrpg/` fuer GitHub Pages gebaut.

Der Build erzeugt `dist/`. Die statische Web-App wird ohne Backend, PWA oder
Service Worker unter `/tempest-jrpg/` fuer GitHub Pages gebaut.

## Dokumentation

- [`PLAN.md`](PLAN.md): ausschliesslich offene und laufende Aufgaben
- [`docs/PROJECT_KNOWLEDGE.md`](docs/PROJECT_KNOWLEDGE.md): kanonischer,
  LLM-freundlicher Projektkontext
- [`ASSETS.md`](ASSETS.md): Asset-, Lizenz- und Generierungsprovenienz
- [`AGENTS.md`](AGENTS.md): verbindlicher Phasen-/Worktree-Ablauf
- [`llms.txt`](llms.txt): kompakter Einstieg fuer LLMs und Agenten
