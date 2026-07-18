import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
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
    command: `node_modules/.bin/vite --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/tempest-jrpg/`,
    reuseExistingServer: !process.env.CI,
    timeout: 45_000
  }
});
