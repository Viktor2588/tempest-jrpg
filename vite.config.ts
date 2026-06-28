/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// base: Unterpfad für GitHub Pages (https://<user>.github.io/tempest-jrpg/).
// Lokal (bun run dev) ist base egal.
export default defineConfig({
  base: '/tempest-jrpg/',
  build: {
    outDir: 'dist',
    target: 'es2020',
    // Phaser ist absichtlich die zentrale Runtime-Abhängigkeit. Für dieses
    // kleine Spiel ist ein einzelner statischer Bundle-Load pragmatischer als
    // künstliche Code-Splittung über Szenen hinweg.
    // Phaser 4 (4.2.0) ist ~220 KB größer als Phaser 3.90 → Limit angehoben.
    chunkSizeWarningLimit: 1900
  },
  test: {
    // Spiellogik (src/systems, src/data) ist Phaser-/DOM-frei → schnelle Node-Tests.
    environment: 'node',
    include: ['test/**/*.test.ts']
  }
});
