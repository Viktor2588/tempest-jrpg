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
    // Weltveraenderung: nach Rangas Pakt hinterlaesst das Rudel sichtbare,
    // freundliche Spuren am Tempest-Rand statt nur als Questflag zu existieren.
    mapId: 'tempest-start',
    x: 5,
    y: 5,
    requiresFlag: 'story.direwolf.pact',
    flag: 'discovery.tempest-start.ranga-pack-trail',
    title: 'Rangas Rudelspur',
    body: 'Frische Pfotenabdrücke führen nicht mehr auf ein Jagdrevier, sondern um Tempest herum Wache.',
    rewardItemId: 'healing-herb',
    rewardLabel: 'Heilkraut'
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
  },
  {
    // Weltveraenderung: nachdem Rimuru dem Land einen Namen gab, markieren die
    // Goblins die neue Nation sichtbar mit einem ersten Grenzstein.
    mapId: 'tempest-start',
    x: 12,
    y: 8,
    requiresFlag: 'story.tempest.named',
    flag: 'discovery.tempest-start.founding-stone',
    title: 'Der erste Namensstein',
    body: 'Seit das Land einen Namen trägt, haben die Goblins hier einen Stein aufgerichtet — die erste Grenzmarke von Tempest.',
    rewardItemId: 'tempest-charm',
    rewardLabel: 'Tempest-Talisman'
  },
  {
    mapId: 'dwargon',
    x: 12,
    y: 7,
    flag: 'discovery.dwargon.forge-relic',
    title: 'Vergessenes Schmiedestück',
    body: 'In einer Nische der Zwergenfestung liegt ein halbfertiges Werkstück aus Magistahl, von einem Meister zurückgelassen.',
    rewardItemId: 'magisteel',
    rewardLabel: 'Magistahl'
  },
  {
    mapId: 'spirit-highlands',
    x: 11,
    y: 8,
    flag: 'discovery.spirit-highlands.wind-shrine',
    title: 'Windgeist-Schrein',
    body: 'Ein kleiner Schrein zwischen den Hochlandfelsen bündelt die Windgeister; ein Tropfen ihrer Mana bleibt zurück.',
    rewardItemId: 'mana-drop',
    rewardLabel: 'Manatropfen'
  },
  {
    mapId: 'blumund',
    x: 9,
    y: 7,
    flag: 'discovery.blumund.lost-cache',
    title: 'Verlorene Händlertruhe',
    body: 'Am Rand der Handelsstadt Blumund steckt eine von einem Karren gefallene Truhe voller Reisevorrat.',
    rewardItemId: 'healing-herb',
    rewardLabel: 'Heilkraut'
  },
  {
    // Weltfolge: nach dem Fall der Ork-Katastrophe (Geld verschlungen) ruht das
    // Schlachtfeld; die Ueberlebenden schichten ein Mahnmal, wo die Horde fiel.
    mapId: 'jura-battlefield',
    x: 12,
    y: 7,
    requiresFlag: 'story.geld.devoured',
    flag: 'discovery.jura-battlefield.war-memorial',
    title: 'Mahnmal der Orkschlacht',
    body: 'Wo die Ork-Katastrophe zu Fall kam, haben die Ueberlebenden einen Steinhaufen errichtet. Ein Hauer der Horde ruht darauf.',
    rewardItemId: 'orc-tusk',
    rewardLabel: 'Ork-Hauer'
  },
  {
    // Weltfolge: sobald die Kijin benannt sind, entzuenden sie im Goblindorf die
    // erste richtige Esse — sichtbarer Wohlstand statt bloss eines Questflags.
    mapId: 'goblin-village',
    x: 9,
    y: 7,
    requiresFlag: 'story.kijin.named',
    flag: 'discovery.goblin-village.first-forge',
    title: 'Erste Kijin-Esse',
    body: 'Seit die Kijin ihren Namen tragen, gluht im Dorf die erste ordentliche Schmiedeesse. Ein Brocken Roherz liegt bereit.',
    rewardItemId: 'magic-ore',
    rewardLabel: 'Magisches Erz'
  },
  {
    // Weltfolge: nachdem der erste Geistkern eines Kindes stabilisiert wurde,
    // beruhigt sich der Krankenfluegel der Freiheitsakademie sichtbar.
    mapId: 'freedom-academy',
    x: 12,
    y: 7,
    requiresFlag: 'story.children.first-core',
    flag: 'discovery.freedom-academy.calm-ward',
    title: 'Beruhigter Krankenfluegel',
    body: 'Seit der erste Kern eines Kindes haelt, glimmt der Ward der Akademie ruhig. Ein Buendel Hipokte-Kraut wurde vergessen.',
    rewardItemId: 'hipokte-herb',
    rewardLabel: 'Hipokte-Kraut'
  },
  {
    // Weltfolge: nach dem Pakt markiert das Rudel seinen alten Bau als
    // Tempest-Aussenposten — aus dem Jagdrevier wird ein Wachtplatz.
    mapId: 'direwolf-den',
    x: 8,
    y: 6,
    requiresFlag: 'story.direwolf.pact',
    flag: 'discovery.direwolf-den.pact-totem',
    title: 'Pakt-Totem des Rudels',
    body: 'Am alten Bau steht seit dem Pakt ein Totem: der Sturmwolf-Bau gehoert nun zu Tempest.',
    rewardItemId: 'healing-herb',
    rewardLabel: 'Heilkraut'
  },
  {
    // Weltfolge: nachdem Veldora seinen Schwur geleistet hat, kristallisiert an
    // seiner alten Siegelstelle ein Rest seiner Sturm-Magicule — die versiegelte
    // Hoehle traegt seinen Nachhall sichtbar.
    mapId: 'sealed-cave',
    x: 7,
    y: 6,
    requiresFlag: 'story.storm-dragon.oath',
    flag: 'discovery.sealed-cave.veldora-echo',
    title: 'Nachhall des Sturmdrachen',
    body: 'Wo Veldora versiegelt war, gerinnt seit seinem Schwur ein Funke seiner Sturm-Magicule zu einem klaren Tropfen.',
    rewardItemId: 'mana-drop',
    rewardLabel: 'Manatropfen'
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
