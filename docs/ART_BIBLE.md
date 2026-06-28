# Art Bible — „Tempest – Chronik"

Verbindliche Stilrichtlinie für alle visuellen Assets. Ziel: **kohärenter Look** trotz
zusammengesuchter **CC0**- und projektgenerierter Assets. Quelle der Wahrheit für Maße/Palette ist
`src/render/artSpec.ts` (Code) — dieses Dokument erklärt das Warum.

## Grundsätze
- **Stil:** Top-down-Pixel-Art, freundlich-fantasievoll, lesbar vor hübsch.
- **Perspektive:** Vogel-/Schrägdraufsicht (top-down), konsistent über Oberwelt & Kampf.
- **Auflösung:** **32×32 px** für Kacheln **und** Charaktere/Gegner. (16×16-CC0-Assets werden auf 32 hochskaliert oder gepaart.)
- **Lesbarkeit:** markante Silhouetten, **1px dunkle Outline** (`PALETTE.ink`) an Figuren/Objekten, klarer Figur-Hintergrund-Kontrast.
- **Rendering:** `pixelArt: true`, nearest-neighbor; keine Halbtransparenz-Kanten.

## Palette
Bewusst **klein** für Kohärenz (siehe `PALETTE` in `artSpec.ts`). Dunkelster Ton =
`ink` (Outlines), hellster = `bone` (Highlights). Akzentfarben sind figuren-/
elementgebunden: `gold` (Held/Heilig), `ember` (Feuer), `arcane` (Magie),
`water`, `grass`, `enemy`. Neue Assets werden farblich an diese Palette angeglichen
(notfalls nachkoloriert), statt fremde Paletten zu mischen.

## Kategorien & Maße
| Kategorie | Größe | Form | Hinweise |
|---|---|---|---|
| Boden-Kacheln (Gras/Pfad/Wasser) | 32×32 | block | nahtlos kachelbar, geringe Binnenkontraste |
| Wände/Hindernisse | 32×32 | block | klare Oberkante, dunkler Sockel |
| Held/Party | 32×32 | round | Akzentfarbe je Figur (siehe Story-Cast) |
| Gegner | 32×32 | round | Silhouette muss Typ verraten |
| UI/Icons | 16/24 | — | einheitliche Strichstärke, gleiche Palette |

## Figuren-Akzente (Story-Cast)
- **Der Namenlose** (Held): `hp`-grün + `bone`.
- **Sora** (Oger-Kriegerin): `ember` + `gold`.
- **Vael** (Kobold-Magier): `arcane` + `bone`.
- **Lyrre** (menschl. Späherin): `mist` + `gold`.

## Animation (später)
- Idle: 2 Frames (leichtes „Atmen"); Lauf: 4 Frames; Treffer: 1 Flash-Frame.
- Bis echte Animationen existieren, reichen Einzelframes + Engine-Tweens (Phase 9).

## Asset-Beschaffung
- **Externe Assets nur CC0.** Quellen: **Kenney.nl**, **OpenGameArt (Lizenzfilter CC0)**, CC0-Packs auf itch.io.
- **Nicht** verwenden: LPC (CC-BY-SA/GPL), „CC-BY ohne Freigabe", unklare Lizenzen.
- Projektgenerierte Original-Assets sind erlaubt, wenn Quelle, Prompt-Zweck und Generierungsweg in `ASSETS.md` dokumentiert sind.
- Jede eingepflegte Datei wird in **`ASSETS.md`** mit Quelle/Autor/Lizenz/URL dokumentiert.
- Bis Assets da sind: prozedurale Platzhalter aus `src/render/placeholderArt.ts`
  (gleiche Palette/Größe) — später 1:1 durch CC0-Sprites ersetzbar.

## Abnahme „Look kohärent"
- Oberwelt, Kampf und Menü teilen Palette, Outline-Regel und 32px-Raster.
- Keine fremdfarbigen Ausreißer; jede Figur/Gegner auf einen Blick unterscheidbar.
