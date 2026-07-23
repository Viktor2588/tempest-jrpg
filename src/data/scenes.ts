import type { SceneScript } from '../systems/sceneScript';

// Inszenierte Oberwelt-Beats (Cutscene-light). Rein datengetrieben; die
// OverworldScene spielt sie Schritt fuer Schritt ab. Die `summary` erscheint
// erst NACH dem Beat als kurze Zusammenfassung — der Moment selbst wird gezeigt,
// nicht vorab erzaehlt. Deutsches Originalwording, canon-first.

export const SCENE_SCRIPTS = [
  {
    id: 'cave-awakening',
    steps: [
      { kind: 'text', line: 'Kalter Stein. Kein Auge, das sich oeffnet — und doch: Wahrnehmung.' },
      { kind: 'emote', actor: 'rimuru', emote: '…' },
      { kind: 'wait', ms: 500 },
      { kind: 'emote', actor: 'sealed-storm-dragon', emote: '!' },
      { kind: 'text', speaker: 'Veldora', line: 'Endlich. Etwas Neues in dieser Einsamkeit. Hoerst du mich, kleiner Schleim?' },
      { kind: 'face', actor: 'rimuru', dir: 'up' },
      { kind: 'text', speaker: 'Rimuru', line: 'Ich hoere dich. Dann bin ich also nicht allein hier unten.' }
    ],
    summary: {
      title: 'Erwacht in der Hoehle',
      body: 'Rimuru erwacht in der versiegelten Hoehle und nimmt zum ersten Mal Veldoras Gegenwart wahr.'
    }
  },
  {
    id: 'direwolf-pact',
    steps: [
      { kind: 'camera', to: { x: 9, y: 5 } },
      { kind: 'face', actor: 'ranga', dir: 'down' },
      { kind: 'emote', actor: 'ranga', emote: '…' },
      { kind: 'text', speaker: 'Rimuru', line: 'Kein Kampf mehr. Steh auf — an meiner Seite bist du staerker als allein.' },
      { kind: 'emote', actor: 'ranga', emote: '!' },
      { kind: 'text', line: 'Der Leitwolf senkt den Kopf. Ein Name macht das Band sichtbar.' },
      { kind: 'text', speaker: 'Rimuru', line: 'Von jetzt an heisst du Ranga.' },
      { kind: 'emote', actor: 'ranga', emote: '♥' }
    ],
    summary: {
      title: 'Pakt mit dem Rudel',
      body: 'Rimuru benennt den Leitwolf Ranga; das Direwolf-Rudel schliesst den Pakt.'
    }
  },
  {
    id: 'tempest-naming',
    steps: [
      { kind: 'camera', to: { x: 12, y: 8 } },
      { kind: 'face', actor: 'rigurd', dir: 'down' },
      { kind: 'text', speaker: 'Rigurd', line: 'Meister — die Huetten stehen, doch der Ort hat keinen Namen. Ein Name gibt uns Halt.' },
      { kind: 'face', actor: 'rimuru', dir: 'up' },
      { kind: 'wait', ms: 400 },
      { kind: 'text', speaker: 'Rimuru', line: 'Dann nennen wir ihn Tempest. Aus Sturm wird Heimat.' },
      { kind: 'emote', actor: 'rigurd', emote: '!' },
      { kind: 'text', line: 'Ein Raunen geht durch die Menge. Aus verstreuten Huetten wird der Kern von Tempest.' }
    ],
    summary: {
      title: 'Tempest gegruendet',
      body: 'Die Siedlung erhaelt ihren Namen und wird zum ersten Kern von Tempest.'
    }
  },
  {
    id: 'first-council',
    steps: [
      { kind: 'camera', to: { x: 8, y: 8 } },
      { kind: 'text', line: 'Auf der noch leeren Ratstafel liegen drei Zeichen: Shunas Faden, Gobtas Kerbe und Rangas Spur.' },
      { kind: 'text', speaker: 'Shuna', line: 'Keines davon ist ein Befehl. Zusammen zeigen sie uns, wo das Siegel offenliegt.' },
      { kind: 'face', actor: 'gobta', dir: 'right' },
      { kind: 'text', speaker: 'Gobta', line: 'Dann nehme ich die kurzen Wege. Aber diesmal kommt niemand allein zurueck.' },
      { kind: 'emote', actor: 'ranga-tempest', emote: '!' },
      { kind: 'text', speaker: 'Rimuru', line: 'Gut. Tempest schickt keinen Trupp aus — Tempest handelt gemeinsam.' }
    ],
    summary: {
      title: 'Erster Rat versammelt',
      body: 'Shuna, Gobta und Ranga verbinden ihre Hinweise zu Tempests erstem gemeinsamen Auftrag.'
    }
  },
  {
    id: 'grove-afterglow',
    steps: [
      { kind: 'text', line: 'Als die Sporen zu Boden sinken, bleibt der Flüsterhain ungewoehnlich still.' },
      { kind: 'text', speaker: 'Ranga', line: 'Der Geruch ist nicht fort. Er zieht sich zusammen, weiter oestlich.' },
      { kind: 'face', actor: 'rimuru', dir: 'right' },
      { kind: 'text', speaker: 'Rimuru', line: 'Dann haben wir keinen Wald besiegt. Wir haben nur gelernt, wohin die Spur fuehrt.' },
      { kind: 'wait', ms: 350 },
      { kind: 'text', speaker: 'Shuna', line: 'Der Schrein antwortet bereits. Ich halte die Zeichen bereit.' }
    ],
    summary: {
      title: 'Spur zum Ahnensiegel',
      body: 'Der Hain ist gesichert, doch Shuna erkennt eine verdichtete Siegelspur am alten Schrein.'
    }
  },
  {
    id: 'ancestor-seal-liberated',
    steps: [
      { kind: 'text', line: 'Das Echo zerreisst nicht mit einem Schrei, sondern mit einem langen Ausatmen.' },
      { kind: 'emote', actor: 'rimuru', emote: '…' },
      { kind: 'text', speaker: 'Rimuru', line: 'Es war keine Bestie. Jemand hat ihm nur beigebracht, vor allem Neuen Angst zu haben.' },
      { kind: 'text', speaker: 'Shuna', line: 'Die Bindung ist nicht geheilt. Aber sie hoert uns jetzt zu.' },
      { kind: 'text', speaker: 'Rigurd', line: 'Dann nehmen wir diese Stille mit nach Hause. Sie ist kein Ende, sondern eine Verantwortung.' }
    ],
    summary: {
      title: 'Ahnensiegel beruhigt',
      body: 'Das namenlose Echo ist gebrochen; Tempest gewinnt Zeit, die alte Bindung zu verstehen.'
    }
  },
  {
    id: 'border-mercy',
    steps: [
      { kind: 'text', line: 'Zwischen zerbrochenen Schilden hebt Rimuru die Hand. Kein weiterer Schlag faellt.' },
      { kind: 'text', speaker: 'Grenzspäherin', line: 'Warum helft ihr uns? Wir kamen, um euch zu pruefen.' },
      { kind: 'text', speaker: 'Rimuru', line: 'Weil jemand wollte, dass wir einander fuer Feinde halten. Das reicht als Grund, es nicht zu werden.' },
      { kind: 'wait', ms: 350 },
      { kind: 'text', line: 'Eine der Spaeherinnen legt einen kalten Siegelspan in Shunas Hand. Die Spur fuehlt sich fremd an.' }
    ],
    summary: {
      title: 'Grenze ohne Blut',
      body: 'Tempest versorgt die besiegte Patrouille und erhaelt einen ersten Hinweis auf die fremde Siegelmacht.'
    }
  },
  {
    id: 'vanguard-trace',
    steps: [
      { kind: 'text', line: 'Der gebrochene Siegelanker dampft noch. Ranga zieht einen engen Kreis darum.' },
      { kind: 'text', speaker: 'Ranga', line: 'Kein Lager. Kein Name. Nur ein Weg, der andere in den Kampf stoesst.' },
      { kind: 'face', actor: 'rimuru', dir: 'left' },
      { kind: 'text', speaker: 'Rimuru', line: 'Dann jagen wir nicht blind hinterher. Wir sichern erst die, die er zurueckgelassen hat.' },
      { kind: 'emote', actor: 'ranga-tempest', emote: '!' },
      { kind: 'text', line: 'Ranga schlaegt zwei Kerben in einen Pfosten: eine fuer den Rueckweg, eine fuer die offene Frage.' }
    ],
    summary: {
      title: 'Spur gesichert',
      body: 'Ranga findet keinen Gegnernamen, aber einen sicheren Rueckweg und das Muster einer gelenkten Vorhut.'
    }
  },
  {
    id: 'geld-victory',
    steps: [
      { kind: 'text', line: 'Die Orkflut bricht. Wo eben noch „Geld" wuetete, liegt nur Stille ueber dem Schlachtfeld.' },
      { kind: 'face', actor: 'treyni-battlefield', dir: 'down' },
      { kind: 'text', speaker: 'Treyni', line: 'Der Hunger ist gebrochen, Rimuru von Tempest. Der Jura-Wald wird sich erinnern.' },
      { kind: 'emote', actor: 'rimuru', emote: '…' },
      { kind: 'text', speaker: 'Rimuru', line: 'Kein Triumph. Aber ein Ende — und ein Anfang fuer die, die bleiben.' }
    ],
    summary: {
      title: 'Sieg ueber Geld',
      body: 'Die Ork-Katastrophe „Geld" ist besiegt; der Jura-Wald atmet auf.'
    }
  },
  {
    id: 'tempest-invasion-repelled',
    steps: [
      { kind: 'camera', to: { x: 15, y: 6 } },
      { kind: 'text', line: 'Die letzte Menschenwelle zerfaellt am Rand des Schlachtfelds. Rauch zieht von Tempests Palisade fort.' },
      { kind: 'face', actor: 'rigurd-established', dir: 'down' },
      { kind: 'text', speaker: 'Rigurd', line: 'Die Wache haelt. Heute hat Tempest nicht nur gebaut — Tempest hat sich selbst verteidigt.' },
      { kind: 'emote', actor: 'rimuru', emote: '…' },
      { kind: 'text', speaker: 'Rimuru', line: 'Dann sichern wir die Wege. Niemand soll glauben, diese Stadt sei Beute.' }
    ],
    summary: {
      title: 'Tempest verteidigt',
      body: 'Die Strafkolonne ist zurueckgeschlagen; Tempests Wache sichert die Handelswege.'
    }
  },
  {
    id: 'harvest-festival',
    steps: [
      { kind: 'text', line: 'Die gesammelten Magicules steigen wie ein stiller Sturm ueber Tempest auf.' },
      { kind: 'wait', ms: 600 },
      { kind: 'text', speaker: 'Rimuru', line: 'Das ist kein Opfer. Es ist ein Versprechen: Tempest erwacht gemeinsam.' },
      { kind: 'text', line: 'Die benannten Offiziere antworten mit neuer Kraft. Aus einer Nation wird ein Schwur.' }
    ],
    summary: {
      title: 'Erntefest vollzogen',
      body: 'Rimuru verbraucht den Magicule-Pool und erweckt Tempests Offiziere dauerhaft.'
    }
  },
  {
    id: 'bog-hunt-aftermath',
    steps: [
      { kind: 'text', line: 'Der Morast beruhigt sich. Zwischen Schilf und Wasser bleibt eine breite, nun harmlose Spur zurueck.' },
      { kind: 'text', speaker: 'Rimuru', line: 'Ein Kopfgeld ist schnell ausgerufen. Wichtig ist, dass die Karren morgen wieder hier entlangkoennen.' },
      { kind: 'text', line: 'Aus der Ferne antwortet eine Glocke aus Tempest. Der Westpfad ist wieder offen.' }
    ],
    summary: {
      title: 'Westsumpf gesichert',
      body: 'Der Sumpfschrecken ist besiegt; die Handelsroute kann wieder genutzt werden.'
    }
  },
  {
    id: 'echo-banishment',
    steps: [
      { kind: 'text', line: 'Das streunende Echo verliert seine scharfen Kanten und wird zu einem leisen Licht zwischen den Steinen.' },
      { kind: 'text', speaker: 'Rimuru', line: 'Nicht alles, was aus einem Riss kommt, will kaempfen.' },
      { kind: 'text', line: 'Shunas Messzeichen glimmen einmal auf, dann schweigen sie. Die Bruchkante ist fuer heute still.' }
    ],
    summary: {
      title: 'Echo zur Ruhe gebracht',
      body: 'Die Messdaten zeigen: Die Bruchkante kann beruhigt werden, statt nur weitere Kaempfe zu erzeugen.'
    }
  },
  {
    id: 'deserter-standstill',
    steps: [
      { kind: 'text', line: 'Die Waffen der Deserteure liegen im Staub. Niemand greift nach ihnen, obwohl noch Angst in allen Gesichtern steht.' },
      { kind: 'text', speaker: 'Rimuru', line: 'Ihr bekommt eine Entscheidung. Nutzt sie besser als derjenige, der euch hierhergeschickt hat.' },
      { kind: 'text', line: 'Der Weg nach Tempest bleibt offen — fuer einen Bericht, ein Urteil und vielleicht eine zweite Chance.' }
    ],
    summary: {
      title: 'Grenzgänger gestellt',
      body: 'Der Deserteurstrupp ist besiegt. In Tempest entscheidet sich nun, ob aus der Route ein Zeichen der Gnade oder der Härte wird.'
    }
  },
  {
    id: 'marsh-cleansed',
    steps: [
      { kind: 'text', line: 'Die schwärende Blüte zerfaellt zu dunklem Staub. Darunter sammelt sich klares Wasser.' },
      { kind: 'text', speaker: 'Rimuru', line: 'Das Moor muss nicht zahm werden. Es soll nur wieder selbst atmen duerfen.' },
      { kind: 'text', line: 'Ein Reiher landet am Rand der Pfütze. Zum ersten Mal seit Stunden ist kein Echo zu hoeren.' }
    ],
    summary: {
      title: 'Nebelmoor gereinigt',
      body: 'Die Fäulnis ist getilgt; Eirs Moorhüterkreis kann die Tiefe wieder schützen.'
    }
  },
  {
    id: 'shrine-vigil-kept',
    steps: [
      { kind: 'text', line: 'Das Heulen auf der Westterrasse bricht ab. Wind faehrt durch die Banner, ohne an ihnen zu zerren.' },
      { kind: 'text', speaker: 'Rimuru', line: 'Ein Schrein braucht keine stumme Wache. Er braucht jemanden, der zuhoert, wenn er warnt.' },
      { kind: 'text', line: 'Der klare Ton einer kleinen Glocke begleitet den Rueckweg zu Kael.' }
    ],
    summary: {
      title: 'Schreinwache entlastet',
      body: 'Das Sturmecho ist gebannt; der Geisterschrein kann wieder als verlässlicher Orientierungspunkt dienen.'
    }
  }
] as const satisfies readonly SceneScript[];

export type SceneScriptId = (typeof SCENE_SCRIPTS)[number]['id'];

export function getSceneScript(id: string): SceneScript | undefined {
  return SCENE_SCRIPTS.find((script) => script.id === id);
}

// Der Hauptpfad bleibt chronologisch; optionale Aufträge haben je einen eigenen
// Track. Dadurch kann ein später erledigter Nebenauftrag keinen ungesehenen
// Hauptbeat (oder einen anderen Nebenauftrag) als erledigt markieren.
const SCENE_TRIGGERS: readonly {
  readonly sceneId: SceneScriptId;
  readonly flag: string;
  readonly track: string;
}[] = [
  { sceneId: 'cave-awakening', flag: 'story.storm-dragon.oath', track: 'main' },
  { sceneId: 'direwolf-pact', flag: 'story.direwolf.pact', track: 'main' },
  { sceneId: 'tempest-naming', flag: 'story.tempest.named', track: 'main' },
  { sceneId: 'first-council', flag: 'story.council.ready', track: 'main' },
  { sceneId: 'grove-afterglow', flag: 'story.grove.cleared', track: 'main' },
  { sceneId: 'ancestor-seal-liberated', flag: 'story.boss.echo-defeated', track: 'main' },
  { sceneId: 'border-mercy', flag: 'story.border.deescalated', track: 'main' },
  { sceneId: 'vanguard-trace', flag: 'story.vanguard.trace-read', track: 'main' },
  { sceneId: 'geld-victory', flag: 'story.geld.devoured', track: 'main' },
  { sceneId: 'tempest-invasion-repelled', flag: 'story.tempest-invasion.repulsed', track: 'main' },
  { sceneId: 'harvest-festival', flag: 'story.harvest-festival.awakened', track: 'main' },
  { sceneId: 'bog-hunt-aftermath', flag: 'sidequest.bog.cleared', track: 'bog' },
  { sceneId: 'echo-banishment', flag: 'sidequest.echo.cleared', track: 'echo' },
  { sceneId: 'deserter-standstill', flag: 'sidequest.deserter.cleared', track: 'deserter' },
  { sceneId: 'marsh-cleansed', flag: 'sidequest.cleanse.cleared', track: 'cleanse' },
  { sceneId: 'shrine-vigil-kept', flag: 'sidequest.vigil.cleared', track: 'vigil' }
];

export function scenePlayedFlag(sceneId: string): string {
  return `scene.${sceneId}.played`;
}

// Neueste ausgeloeste, noch nicht gespielte Szene (oder null). Rueckwaerts wie
// bei den Meilensteinen: bei normalem Fortschritt kippt je ein Trigger-Flag und
// genau dieser Beat spielt; ein aelterer Save (mehrere Flags gesetzt, noch keine
// played-Marker) spielt nur den juengsten Beat statt alle nachzuholen.
export function getPendingScene(flags: Readonly<Record<string, boolean>>): SceneScript | null {
  // Der Hauptpfad hat Vorrang, damit die Erzählung dort chronologisch bleibt.
  const tracks = ['main', ...SCENE_TRIGGERS.map((trigger) => trigger.track)
    .filter((track, index, all) => track !== 'main' && all.indexOf(track) === index)];
  for (const track of tracks) {
    for (let index = SCENE_TRIGGERS.length - 1; index >= 0; index -= 1) {
      const trigger = SCENE_TRIGGERS[index]!;
      if (
        trigger.track === track
        && flags[trigger.flag] === true
        && flags[scenePlayedFlag(trigger.sceneId)] !== true
      ) {
        return getSceneScript(trigger.sceneId) ?? null;
      }
    }
  }
  return null;
}

// Markiert die Szene UND alle frueheren Beats desselben Tracks als gespielt.
// Hauptpfad-Saves holen so keine alte Szene nach; unabhängige Nebenpfade bleiben
// dagegen jeweils sichtbar.
export function acknowledgeScene(
  flags: Readonly<Record<string, boolean>>,
  sceneId: string
): Readonly<Record<string, boolean>> {
  const index = SCENE_TRIGGERS.findIndex((trigger) => trigger.sceneId === sceneId);
  if (index < 0) return flags;
  const next = { ...flags };
  let changed = false;
  const track = SCENE_TRIGGERS[index]!.track;
  for (let current = 0; current <= index; current += 1) {
    const trigger = SCENE_TRIGGERS[current]!;
    if (trigger.track !== track) continue;
    const flag = scenePlayedFlag(trigger.sceneId);
    if (next[flag] !== true) { next[flag] = true; changed = true; }
  }
  return changed ? next : flags;
}
