# Assets & Lizenzen

**Regel: ausschließlich CC0.** Jedes Bild-/Audio-Asset im Repo muss hier mit Quelle und
Lizenz stehen. Kein Asset ohne Eintrag, keine Nicht-CC0-Lizenz (z. B. LPC = CC-BY-SA/GPL → **nicht** verwenden).

## Erlaubte Quellen (CC0)
- **Kenney.nl** — durchgehend CC0 (Tiles, Charaktere, UI, Audio).
- **OpenGameArt.org** — nur mit Lizenzfilter **CC0**.
- **itch.io** — nur ausgewiesene CC0-Packs.

## Aktuell verwendete Assets
**Kenney „Tiny Town"** (Kacheln) und **Kenney „Tiny Dungeon"** (Charaktere/Gegner) — beide
**CC0** (License.txt: „Creative Commons Zero, CC0"). Einzelne 16×16-Sprites wurden per
Inhalts-/Farb-Klassifizierung (Hautton-Cluster → Held, Grün-Blob → Schleim usw.) ausgewählt
und einzeln ins Repo übernommen. Übrige Elemente nutzen weiter **prozedurale Platzhalter**
(`src/render/placeholderArt.ts`).

| Datei (in `src/assets/…`) | Typ | Quelle (URL) | Autor | Lizenz |
|---|---|---|---|---|
| `tiles/grass.png` | Boden-Kachel (Tiny Town `tile_0000`) | https://kenney.nl/assets/tiny-town | Kenney | CC0 |
| `tiles/wall.png` | Wand-/Stein-Kachel (Tiny Town `tile_0104`) | https://kenney.nl/assets/tiny-town | Kenney | CC0 |
| `tiles/path.png` | Pfad-/Erd-Kachel (Tiny Town `tile_0025`) | https://kenney.nl/assets/tiny-town | Kenney | CC0 |
| `sprites/hero.png` | Held/Spieler (Tiny Dungeon `tile_0088`) | https://kenney.nl/assets/tiny-dungeon | Kenney | CC0 |
| `sprites/enemy-slime.png` | Gegner Schleim (Tiny Dungeon `tile_0108`) | https://kenney.nl/assets/tiny-dungeon | Kenney | CC0 |
| `sprites/enemy-wolf.png` | Gegner Bestie (Tiny Dungeon `tile_0065`) | https://kenney.nl/assets/tiny-dungeon | Kenney | CC0 |
| `sprites/enemy-imp.png` | Gegner Imp (Tiny Dungeon `tile_0106`) | https://kenney.nl/assets/tiny-dungeon | Kenney | CC0 |
| `sprites/enemy-ogre.png` | Gegner Oger (Tiny Dungeon `tile_0121`) | https://kenney.nl/assets/tiny-dungeon | Kenney | CC0 |

## Vorgehen beim Hinzufügen
1. Lizenz prüfen: **muss CC0 sein**. Im Zweifel nicht verwenden.
2. Datei nach `src/assets/<kategorie>/` legen; an die Art Bible angleichen (Palette/32px).
3. Zeile in der Tabelle oben ergänzen (Datei, Typ, URL, Autor, „CC0").
4. Platzhalter-Schlüssel (`ph-<kind>`) durch das echte Asset ersetzen.
