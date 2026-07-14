/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// Safe access to process.env (works at config evaluation time in Vite/Vitest
// without requiring @types/node in the project).
const env = (globalThis as any)?.process?.env ?? {};
const isCI = Boolean(env.CI);

// base: Unterpfad für GitHub Pages (https://<user>.github.io/tempest-jrpg/).
// Lokal (bun run dev) ist base egal.
export default defineConfig({
  base: '/tempest-jrpg/',
  build: {
    outDir: 'dist',
    target: 'es2020',
    // Phaser bleibt die zentrale Runtime-Abhängigkeit, wird aber als stabiler
    // Vendor-Chunk ausgeliefert. Dadurch wächst der eigentliche Spielcode mit
    // neuen Bänden weiter, ohne das mobile Chunkbudget zu überschreiten.
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    },
    chunkSizeWarningLimit: 1900
  },
  test: {
    // Spiellogik (src/systems, src/data) ist Phaser-/DOM-frei → schnelle Node-Tests.
    environment: 'node',
    include: ['test/**/*.test.ts'],

    // === Parallel execution tuning ===
    // Vitest runs test *files* concurrently by default using a thread pool.
    // We make it explicit + add safe limits so CI doesn't get overloaded.
    pool: 'threads',
    poolOptions: {
      threads: {
        // Limit concurrency especially in CI (GitHub runners have limited cores/RAM).
        // Locally we let Vitest use available cores.
        maxThreads: isCI ? 3 : undefined,
        minThreads: 1,
      },
    },

    // Per-test-file isolation (default) keeps tests independent and safe to parallelize.
    // Use `test.concurrent(...)` or `describe.concurrent` inside a file for
    // truly independent cases when you want even more intra-file parallelism.
    isolate: true,

    // Stop early in CI on first failure for faster feedback loops.
    bail: isCI ? 1 : 0,
  }
});
