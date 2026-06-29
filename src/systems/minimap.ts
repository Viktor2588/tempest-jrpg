// Headless-Modell für die Overworld-Minimap: skaliert eine Tile-Karte auf ein
// kleines Panel und projiziert Marker (Spieler/Gateway/NPC/Landmark) auf
// Pixelkoordinaten. Die Szene rendert daraus nur noch Rechtecke/Punkte.

export type MinimapMarkerKind = 'player' | 'gateway' | 'npc' | 'landmark' | 'objective';

export interface MinimapMarker {
  readonly x: number;
  readonly y: number;
  readonly kind: MinimapMarkerKind;
}

export interface MinimapDot {
  readonly px: number;
  readonly py: number;
  readonly kind: MinimapMarkerKind;
}

export interface MinimapModel {
  readonly width: number;
  readonly height: number;
  readonly cell: number;
  readonly dots: readonly MinimapDot[];
}

/** Skaliert die Karte auf ein Panel ≤ maxExtent px (Zelle ≥ 2px) und clamped Marker ins Panel. */
export function buildMinimap(
  mapWidth: number,
  mapHeight: number,
  markers: readonly MinimapMarker[],
  maxExtent = 120
): MinimapModel {
  const span = Math.max(1, mapWidth, mapHeight);
  const cell = Math.max(2, Math.floor(maxExtent / span));
  const width = mapWidth * cell;
  const height = mapHeight * cell;
  const dots = markers.map((marker) => ({
    px: clamp(marker.x * cell + cell / 2, 0, width),
    py: clamp(marker.y * cell + cell / 2, 0, height),
    kind: marker.kind
  }));
  return { width, height, cell, dots };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
