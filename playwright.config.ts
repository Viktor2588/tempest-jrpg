import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);

export default defineConfig({
  testDir: './e2e',
  // 45s is the strict CI budget. Local dev boxes run every worker on shared
  // cores, so the boot-heavy smoke flows contend and can take ~50s wall-time
  // for the same ~25s of work; with retries:0 locally that briefly-slow run
  // would false-fail. Give non-CI runs headroom so `test:e2e` stays usable for
  // pre-push verification without weakening the CI gate.
  timeout: process.env.CI ? 45_000 : 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Parallel workers:
  // - Locally: let Playwright decide (uses available cores).
  // - CI: allow a small number (GitHub ubuntu-latest has ~2 vCPU). 2 workers gives
  //   good speedup on the smoke specs × projects without overloading the runner.
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}/tempest-jrpg/`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'desktop-chromium',
      testIgnore: /hidpi\.smoke\.spec\.ts/,
      use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } }
    },
    {
      name: 'mobile-chromium',
      testIgnore: /hidpi\.smoke\.spec\.ts/,
      use: { browserName: 'chromium', viewport: { width: 844, height: 390 } }
    },
    {
      name: 'hidpi-desktop-chromium',
      testMatch: /hidpi\.smoke\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2
      }
    },
    {
      name: 'hidpi-mobile-chromium',
      testMatch: /hidpi\.smoke\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 844, height: 390 },
        deviceScaleFactor: 3
      }
    }
  ],
  webServer: {
    // Prod-Build statt Dev-Server: der Dev-Server liefert jedes Modul einzeln aus
    // (~450 Requests) und braucht bis zum spielbaren Titelbild ~15 s, der Build
    // ~6 s. Bei ~130 boot-schweren Smoke-Tests entscheidet das darueber, ob ein
    // Lauf ins 45-s-Budget passt. `reuseExistingServer` ist aus, weil ein
    // weiterlaufender Preview-Server sonst einen veralteten Build ausliefert.
    command: `bun run build && node_modules/.bin/vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/tempest-jrpg/`,
    reuseExistingServer: false,
    timeout: 120_000
  }
});
