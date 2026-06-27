# Tempest – Chronik

Ein mobile-first JRPG-Prototyp mit Phaser 3, TypeScript, Bun und Vite. Der Fokus liegt auf taktischem Kampf, datengetriebenem Content, Party-Progression, Beziehungen, Jobs und dünnen Szenen über headless testbarer Spiellogik.

## Aktueller Release-Scope

- Statische Web-App für GitHub Pages unter `/tempest-jrpg/`
- Kein Offline-Betrieb, kein Service Worker, keine PWA-Installation
- CI/Deploy mit Bun: Typecheck, Tests, Build, danach Upload von `dist/`
- Deutschsprachige UI/Story und mobile-first Skalierung

## Entwicklung

```bash
bun install --frozen-lockfile
bun run dev
```

## Verifikation

```bash
bun run typecheck
bun run test
bun run build
```

Der Build erzeugt `dist/`. Phaser bleibt bewusst im Hauptbundle; die Vite-Chunk-Warnschwelle ist entsprechend dokumentiert und angehoben.

## Struktur

- `src/data`: Charaktere, Gegner, Skills, Items, Jobs, Welt- und Progressionsdaten
- `src/systems`: reine Spiellogik für Kampf, Save, Menü, Welt, Progression und Settings
- `src/scenes`: Phaser-Szenen für Darstellung und Eingabe
- `src/audio`: prozedurale WebAudio-SFX
- `test`: Vitest-Suiten gegen Systeme, Datenintegrität und Release-Konfiguration
- `.github/workflows`: CI und GitHub-Pages-Deploy

## Deployment

Pushes auf `main` starten `.github/workflows/deploy.yml`. Der Workflow installiert mit Bun, führt Typecheck und Tests aus, baut mit Vite und deployed `dist/` über GitHub Pages.
