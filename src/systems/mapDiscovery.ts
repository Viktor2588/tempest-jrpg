// Weltereignisse & Entdeckungen: datengetriebene Fundstellen auf begehbaren
// Karten (das RangaJourney-Entdeckungsmuster auf die Oberwelt verallgemeinert).
// Ein Glitzerpunkt traegt Lore + Belohnung, wird einmal eingesammelt (flag-
// gegatet) und kann per `requiresFlag` erst nach einer Weltveraenderung
// (z. B. nach einem Boss) erscheinen — so wird Erkundung belohnt und die Welt
// reagiert sichtbar. Rein/funktional, Phaser-frei, headless testbar.

export interface MapDiscovery {
  readonly flag: string;
  readonly title: string;
  readonly body: string;
  readonly rewardItemId: string;
  readonly rewardLabel: string;
}

interface MapDiscoveryDefinition extends MapDiscovery {
  readonly mapId: string;
  readonly x: number;
  readonly y: number;
  // Erscheint erst, wenn dieses Flag gesetzt ist (Weltveraenderung, z. B. Post-Boss).
  readonly requiresFlag?: string;
}

const DISCOVERIES: readonly MapDiscoveryDefinition[] = [
  {
    mapId: 'spirit-marsh',
    x: 4,
    y: 11,
    flag: 'discovery.spirit-marsh.moor-bloom',
    title: 'Schimmernde Moorblüte',
    body: 'Zwischen den Schilfhalmen glüht eine seltene Blüte, die nur im Geistmoor gedeiht.',
    rewardItemId: 'hipokte-herb',
    rewardLabel: 'Hipokte-Kraut'
  },
  {
    mapId: 'lizardman-marsh',
    x: 4,
    y: 11,
    flag: 'discovery.lizardman-marsh.scale-amulet',
    title: 'Versunkenes Schuppenamulett',
    body: 'Ein altes Amulett der Echsenmenschen glitzert im flachen Wasser am Uferrand.',
    rewardItemId: 'mana-drop',
    rewardLabel: 'Manatropfen'
  },
  {
    mapId: 'ember-hollow',
    x: 3,
    y: 9,
    flag: 'discovery.ember-hollow.cooled-vein',
    title: 'Erkaltete Glutader',
    body: 'Eine abgekühlte Lavaader legt magiegetränktes Roherz frei.',
    rewardItemId: 'magic-ore',
    rewardLabel: 'Magisches Erz'
  },
  {
    // Weltveraenderung: erst nach dem Sieg über das namenlose Echo (Siegelbruch)
    // ist der Hain im Geistmoor sichtbar geheilt und gibt seinen Segen frei.
    mapId: 'spirit-marsh',
    x: 18,
    y: 11,
    requiresFlag: 'story.boss.echo-defeated',
    flag: 'discovery.spirit-marsh.healed-grove',
    title: 'Geheilter Siegelhain',
    body: 'Wo das Echo gebannt wurde, treibt der Hain wieder aus. Ein klarer Tautropfen bündelt seine Kraft.',
    rewardItemId: 'full-potion',
    rewardLabel: 'Vollheiltrank'
  }
] as const;

function isVisible(def: MapDiscoveryDefinition, flags: Readonly<Record<string, boolean>>): boolean {
  if (flags[def.flag] === true) return false; // schon eingesammelt
  return def.requiresFlag === undefined || flags[def.requiresFlag] === true;
}

function toView(def: MapDiscoveryDefinition): MapDiscovery {
  const { mapId: _m, x: _x, y: _y, requiresFlag: _r, ...view } = def;
  return view;
}

// Noch nicht eingesammelte, aktuell sichtbare Fundstellen der Karte (für Marker).
export function getMapDiscoveries(
  mapId: string,
  flags: Readonly<Record<string, boolean>>
): readonly (MapDiscovery & { readonly x: number; readonly y: number })[] {
  return DISCOVERIES
    .filter((def) => def.mapId === mapId && isVisible(def, flags))
    .map((def) => ({ ...toView(def), x: def.x, y: def.y }));
}

// Sichtbare Fundstelle exakt auf einer Kachel (oder null).
export function getMapDiscoveryAt(
  mapId: string,
  x: number,
  y: number,
  flags: Readonly<Record<string, boolean>>
): MapDiscovery | null {
  const def = DISCOVERIES.find(
    (candidate) => candidate.mapId === mapId && candidate.x === x && candidate.y === y && isVisible(candidate, flags)
  );
  return def ? toView(def) : null;
}

// Nur für Tests/Datenintegrität: alle Definitionen (inkl. Position) einsehbar.
export function allMapDiscoveryDefinitions(): readonly MapDiscoveryDefinition[] {
  return DISCOVERIES;
}
