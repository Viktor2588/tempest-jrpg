# Assets & Lizenzen

**Regel: ausschließlich CC0.** Jedes Bild-/Audio-Asset im Repo muss hier mit Quelle und
Lizenz stehen. Kein Asset ohne Eintrag, keine Nicht-CC0-Lizenz (z. B. LPC = CC-BY-SA/GPL → **nicht** verwenden).

## Erlaubte Quellen (CC0)
- **Kenney.nl** — durchgehend CC0 (Tiles, Charaktere, UI, Audio).
- **OpenGameArt.org** — nur mit Lizenzfilter **CC0**.
- **itch.io** — nur ausgewiesene CC0-Packs.

## Aktuell verwendete Assets
Noch keine externen Assets eingepflegt. Die Darstellung nutzt vorerst **prozedurale
Platzhalter** (`src/render/placeholderArt.ts`, kein externes Asset, keine Lizenzpflicht).

| Datei (in `src/assets/…`) | Typ | Quelle (URL) | Autor | Lizenz |
|---|---|---|---|---|
| — | — | — | — | CC0 |

## Vorgehen beim Hinzufügen
1. Lizenz prüfen: **muss CC0 sein**. Im Zweifel nicht verwenden.
2. Datei nach `src/assets/<kategorie>/` legen; an die Art Bible angleichen (Palette/32px).
3. Zeile in der Tabelle oben ergänzen (Datei, Typ, URL, Autor, „CC0").
4. Platzhalter-Schlüssel (`ph-<kind>`) durch das echte Asset ersetzen.
