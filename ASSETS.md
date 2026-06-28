# Assets & Lizenzen

**Regel: externe Assets ausschließlich CC0; projektgenerierte Originale separat dokumentieren.**
Jedes Bild-/Audio-Asset im Repo muss hier mit Quelle und Lizenz beziehungsweise
Generierungsprovenienz stehen. Kein Asset ohne Eintrag.

## Erlaubte Quellen (CC0)
- **Kenney.nl** — durchgehend CC0 (Tiles, Charaktere, UI, Audio).
- **OpenGameArt.org** — nur mit Lizenzfilter **CC0**.
- **itch.io** — nur ausgewiesene CC0-Packs.

## Aktuell verwendete Assets
**Kenney „Tiny Town"** (Kacheln), **Kenney „Tiny Dungeon"** (Charaktere/Gegner),
**Kenney „RPG Audio"** (SFX) und **Kenney „Music Jingles"** (kurze Musik-Motive) —
alle **CC0** (License.txt: „Creative Commons Zero, CC0").
Einzelne 16×16-Sprites wurden per Inhalts-/Farb-Klassifizierung (Hautton-Cluster → Held,
Grün-Blob → Schleim usw.) ausgewählt und einzeln ins Repo übernommen. Die SFX wurden aus
dem RPG-Audio-Pack passend auf UI/Kampf/Resultat gemappt; die Musik-Motive laufen als
leise Titel-/Oberwelt-/Kampf-Loops. Übrige Elemente nutzen weiter **prozedurale
Platzhalter** und repo-eigene generierte UI-/Portrait-Texturen
(`src/render/placeholderArt.ts`, `src/render/portraitAtlas.ts`, `src/render/uiSkin.ts`).
Diese werden zur Laufzeit aus der Art-Bible-Palette erzeugt und benötigen keine externe
Lizenzzeile.

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
| `sprites/kingdom-board-units.png` | 5×4-Kampfatlas mit 20 Kreaturenlinien | lokales Schwesterprojekt `/kingdom/assets/battle/board-units.png` | Projektgeneriert | Projektintern generiertes Original |
| `sprites/enemy-human-lancer.png` | Menschen-Lanzenträger, transparenter Kampf-Cutout | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28 | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `sprites/enemy-human-deserter.png` | Deserteur-Söldner, transparenter Kampf-Cutout | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28 | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `sprites/enemy-mordrahn.png` | Mordrahn-Boss, transparenter Kampf-Cutout | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28 | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `sprites/party-rimuru.png` | Rimuru, transparenter Party-Kampf-Cutout | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28; gemalter adaptiver Schleimmagier, Dreiviertelperspektive, grüner Chroma-Key | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `sprites/party-gobta.png` | Gobta, transparenter Party-Kampf-Cutout | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28; gemalter Goblin-Frontkämpfer, Dreiviertelperspektive, magentafarbener Chroma-Key | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `sprites/party-shuna.png` | Shuna, transparenter Party-Kampf-Cutout | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28; gemalte Oger-Heilerin, Dreiviertelperspektive, grüner Chroma-Key | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `backgrounds/battle-tempest-grove.jpg` | Kampfarena Tempest-Hain, 1280×720 | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28; lichte Waldlichtung mit freier Kampfmitte | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `backgrounds/battle-spirit-marsh.jpg` | Kampfarena Geistmoor, 1280×720 | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28; magische Moorlichtung mit freier Kampfmitte | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `backgrounds/battle-spirit-highlands.jpg` | Kampfarena Geisterschrein, 1280×720 | OpenAI Bildgenerierung, Built-in-Modus, 2026-06-28; Bergschrein-Terrasse mit freier Kampfmitte | Projektgeneriert | Generierungsbedingungen des verwendeten Dienstes |
| `audio/ui-select.ogg` | UI-Auswahl-SFX (RPG Audio `metalClick.ogg`) | https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| `audio/ui-confirm.ogg` | UI-Bestätigen-SFX (RPG Audio `metalLatch.ogg`) | https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| `audio/ui-cancel.ogg` | UI-Abbrechen-SFX (RPG Audio `cloth1.ogg`) | https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| `audio/battle-hit.ogg` | Treffer-SFX (RPG Audio `knifeSlice.ogg`) | https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| `audio/battle-magic.ogg` | Magie-SFX (RPG Audio `bookOpen.ogg`) | https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| `audio/battle-heal.ogg` | Heilungs-SFX (RPG Audio `bookFlip2.ogg`) | https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| `audio/result-victory.ogg` | Sieg-/Belohnungs-SFX (RPG Audio `handleCoins.ogg`) | https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| `audio/result-defeat.ogg` | Niederlage-SFX (RPG Audio `doorClose_3.ogg`) | https://kenney.nl/assets/rpg-audio | Kenney | CC0 |
| `music/title-theme.ogg` | Titel-Motiv (Music Jingles `jingles_PIZZI07.ogg`) | https://kenney.nl/assets/music-jingles | Kenney | CC0 |
| `music/field-theme.ogg` | Oberwelt-Motiv (Music Jingles `jingles_NES00.ogg`) | https://kenney.nl/assets/music-jingles | Kenney | CC0 |
| `music/battle-theme.ogg` | Kampf-Motiv (Music Jingles `jingles_STEEL07.ogg`) | https://kenney.nl/assets/music-jingles | Kenney | CC0 |

## Vorgehen beim Hinzufügen
1. Externe Lizenz prüfen: **muss CC0 sein**. Projektgenerierte Originale mit Provenienz dokumentieren.
2. Datei nach `src/assets/<kategorie>/` legen; an die Art Bible angleichen (Palette/32px).
3. Zeile in der Tabelle oben ergänzen (Datei, Typ, URL, Autor, „CC0").
4. Platzhalter-Schlüssel (`ph-<kind>`) durch das echte Asset ersetzen.
