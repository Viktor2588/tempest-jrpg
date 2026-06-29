/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

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
    include: ['test/**/*.test.ts']
  }
});
