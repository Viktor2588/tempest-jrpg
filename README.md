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

**Parallel & schnelle Ausführung:**

- Unit-Tests (Vitest) laufen standardmäßig parallel (Thread-Pool mit Limits in CI).
- E2E (Playwright) nutzt `fullyParallel: true` + Worker.
- Für sehr große Runs / PRs sharden:

  ```bash
  bun run test:shard 1/4
  bun run test:shard 2/4
  # oder E2E: bun run test:e2e:shard 1/2
  ```

- CI cached Bun + Playwright-Browser + verwendet 4 parallele Unit-Shards + reduzierte E2E-Projekte → schnelles Feedback.

Der Build erzeugt `dist/`. Die statische Web-App wird ohne Backend, PWA oder
Service Worker unter `/tempest-jrpg/` fuer GitHub Pages gebaut.

## Dokumentation

- [`PLAN.md`](PLAN.md): ausschliesslich offene und laufende Aufgaben
- [`docs/PROJECT_KNOWLEDGE.md`](docs/PROJECT_KNOWLEDGE.md): kanonischer,
  LLM-freundlicher Projektkontext
- [`ASSETS.md`](ASSETS.md): Asset-, Lizenz- und Generierungsprovenienz
- [`AGENTS.md`](AGENTS.md): verbindlicher Phasen-/Worktree-Ablauf
- [`llms.txt`](llms.txt): kompakter Einstieg fuer LLMs und Agenten
