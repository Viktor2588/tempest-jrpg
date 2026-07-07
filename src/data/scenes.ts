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
  }
] as const satisfies readonly SceneScript[];

export type SceneScriptId = (typeof SCENE_SCRIPTS)[number]['id'];

export function getSceneScript(id: string): SceneScript | undefined {
  return SCENE_SCRIPTS.find((script) => script.id === id);
}

// Jeder grosse Beat wird von genau einem Story-Flag ausgeloest; in Story-
// Reihenfolge. Die Szene spielt (zeigt) den Moment, sobald das Flag gesetzt ist;
// danach folgt die Zusammenfassung (Toast/Meilenstein) — nicht mehr vorab.
const SCENE_TRIGGERS: readonly { readonly sceneId: SceneScriptId; readonly flag: string }[] = [
  { sceneId: 'cave-awakening', flag: 'story.storm-dragon.oath' },
  { sceneId: 'direwolf-pact', flag: 'story.direwolf.pact' },
  { sceneId: 'tempest-naming', flag: 'story.tempest.named' },
  { sceneId: 'geld-victory', flag: 'story.geld.devoured' },
  { sceneId: 'harvest-festival', flag: 'story.harvest-festival.awakened' }
];

export function scenePlayedFlag(sceneId: string): string {
  return `scene.${sceneId}.played`;
}

// Neueste ausgeloeste, noch nicht gespielte Szene (oder null). Rueckwaerts wie
// bei den Meilensteinen: bei normalem Fortschritt kippt je ein Trigger-Flag und
// genau dieser Beat spielt; ein aelterer Save (mehrere Flags gesetzt, noch keine
// played-Marker) spielt nur den juengsten Beat statt alle nachzuholen.
export function getPendingScene(flags: Readonly<Record<string, boolean>>): SceneScript | null {
  for (let index = SCENE_TRIGGERS.length - 1; index >= 0; index -= 1) {
    const trigger = SCENE_TRIGGERS[index]!;
    if (flags[trigger.flag] === true && flags[scenePlayedFlag(trigger.sceneId)] !== true) {
      return getSceneScript(trigger.sceneId) ?? null;
    }
  }
  return null;
}

// Markiert die Szene UND alle frueheren als gespielt (verhindert das Nachholen
// aelterer Beats nach dem Abspielen eines spaeteren).
export function acknowledgeScene(
  flags: Readonly<Record<string, boolean>>,
  sceneId: string
): Readonly<Record<string, boolean>> {
  const index = SCENE_TRIGGERS.findIndex((trigger) => trigger.sceneId === sceneId);
  if (index < 0) return flags;
  const next = { ...flags };
  let changed = false;
  for (let current = 0; current <= index; current += 1) {
    const flag = scenePlayedFlag(SCENE_TRIGGERS[current]!.sceneId);
    if (next[flag] !== true) { next[flag] = true; changed = true; }
  }
  return changed ? next : flags;
}
