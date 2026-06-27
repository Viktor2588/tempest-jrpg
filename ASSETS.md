# Assets & Lizenzen

**Regel: ausschließlich CC0.** Jedes Bild-/Audio-Asset im Repo muss hier mit Quelle und
Lizenz stehen. Kein Asset ohne Eintrag, keine Nicht-CC0-Lizenz (z. B. LPC = CC-BY-SA/GPL → **nicht** verwenden).

## Erlaubte Quellen (CC0)
- **Kenney.nl** — durchgehend CC0 (Tiles, Charaktere, UI, Audio).
- **OpenGameArt.org** — nur mit Lizenzfilter **CC0**.
- **itch.io** — nur ausgewiesene CC0-Packs.

## Aktuell verwendete Assets
**Kenney „Tiny Town"** (CC0). Aus dem Pack wurden einzelne 16×16-Kacheln per Farb-
Klassifizierung ausgewählt und einzeln ins Repo übernommen (Boden/Wand/Pfad). Für Einheiten
und übrige Kacheln greifen weiterhin die **prozeduralen Platzhalter** (`src/render/placeholderArt.ts`,
kein externes Asset). License.txt des Packs: „Creative Commons Zero, CC0".

| Datei (in `src/assets/…`) | Typ | Quelle (URL) | Autor | Lizenz |
|---|---|---|---|---|
| `tiles/grass.png` | Boden-Kachel (Tiny Town `tile_0000`) | https://kenney.nl/assets/tiny-town | Kenney | CC0 |
| `tiles/wall.png` | Wand-/Stein-Kachel (Tiny Town `tile_0104`) | https://kenney.nl/assets/tiny-town | Kenney | CC0 |
| `tiles/path.png` | Pfad-/Erd-Kachel (Tiny Town `tile_0025`) | https://kenney.nl/assets/tiny-town | Kenney | CC0 |

## Vorgehen beim Hinzufügen
1. Lizenz prüfen: **muss CC0 sein**. Im Zweifel nicht verwenden.
2. Datei nach `src/assets/<kategorie>/` legen; an die Art Bible angleichen (Palette/32px).
3. Zeile in der Tabelle oben ergänzen (Datei, Typ, URL, Autor, „CC0").
4. Platzhalter-Schlüssel (`ph-<kind>`) durch das echte Asset ersetzen.
