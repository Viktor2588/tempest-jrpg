import { describe, expect, it } from 'vitest';
import deployWorkflow from '../.github/workflows/deploy.yml?raw';
import indexHtml from '../index.html?raw';
import mainSource from '../src/main.ts?raw';
import viteConfigSource from '../vite.config.ts?raw';

describe('release configuration', () => {
  it('liefert die statische App unter dem GitHub-Pages-Unterpfad aus', () => {
    expect(viteConfigSource).toContain("base: '/tempest-jrpg/'");
    expect(deployWorkflow).toContain('actions/upload-pages-artifact@v3');
    expect(deployWorkflow).toContain('actions/deploy-pages@v4');
    expect(deployWorkflow).toContain('bun install --frozen-lockfile');
    expect(deployWorkflow).toContain('bun run build');
  });

  it('setzt Release-Metadaten ohne PWA-/Offline-Artefakte', () => {
    expect(indexHtml).toContain('lang="de"');
    expect(indexHtml).toContain('name="description"');
    expect(indexHtml).toContain('rel="icon"');
    expect(indexHtml).not.toContain('rel="manifest"');
    expect(indexHtml).not.toContain('manifest.json');
  });

  it('registriert bewusst keinen Service Worker', () => {
    expect(mainSource).not.toMatch(/serviceWorker/i);
    expect(indexHtml).not.toMatch(/serviceWorker/i);
    expect(viteConfigSource).not.toMatch(/serviceWorker/i);
  });

  it('dokumentiert das Build-Größenbudget und trennt Phaser als Vendor-Chunk', () => {
    expect(viteConfigSource).toContain('chunkSizeWarningLimit: 1900');
    expect(viteConfigSource).toContain("phaser: ['phaser']");
  });
});
