import type { Rng } from '../src/systems/rng';
import {
  buyItem,
  chooseDialogOption,
  completeEncounter,
  resolveEncounter,
  startDialogForNpc,
  type WorldState
} from '../src/systems/world';

export function runMiniFlowSmoke(seedRng: Rng): WorldState {
  let state: WorldState = {
    flags: { 'story.slime-prologue.completed': true },
    quests: {},
    inventory: [],
    gold: 120
  };

  const intro = startDialogForNpc(state, 'rigurd');
  const accepted = chooseDialogOption(state, intro.dialogId, intro.nodeId, 'accept');
  state = accepted.state.world;

  const bought = buyItem(state, 'tempest-supply', 'healing-herb', 1);
  if (!bought.ok) throw new Error(bought.message);
  state = bought.state;

  const encounter = resolveEncounter(state, 'tempest-start', { x: 20, y: 12 }, seedRng);
  if (!encounter.state.encounter) throw new Error('Expected trigger encounter.');
  const completedEncounter = completeEncounter(encounter.state.world, encounter.state.encounter.id);
  state = completedEncounter.state;

  const report = startDialogForNpc(state, 'rigurd');
  const completed = chooseDialogOption(state, report.dialogId, report.nodeId, 'report');
  state = completed.state.world;

  return state;
}

export function runActOneStorySliceSmoke(seedRng: Rng): WorldState {
  let state: WorldState = {
    flags: { 'story.slime-prologue.completed': true },
    quests: { 'binding-of-ancestors': { status: 'active', completedStepIds: [] } },
    inventory: [],
    gold: 120
  };

  state = chooseNpcOptionOrThrow(state, 'rigurd-tempest', 'after-prologue');
  state = chooseNpcOptionOrThrow(state, 'shuna', 'analyze');
  state = chooseNpcOptionOrThrow(state, 'gobta', 'briefing');
  state = chooseNpcOptionOrThrow(state, 'ranga-tempest', 'scout-route');
  state = chooseNpcOptionOrThrow(state, 'rigurd-tempest', 'council');

  const grove = resolveEncounter(state, 'tempest-start', { x: 14, y: 8 }, seedRng);
  if (!grove.state.encounter) throw new Error('Expected whispering-grove encounter.');
  state = completeEncounter(grove.state.world, grove.state.encounter.id).state;

  const shrine = resolveEncounter(state, 'tempest-start', { x: 21, y: 13 }, seedRng);
  if (!shrine.state.encounter) throw new Error('Expected ancestor-seal encounter.');
  state = completeEncounter(shrine.state.world, shrine.state.encounter.id).state;

  return chooseNpcOptionOrThrow(state, 'rigurd-tempest', 'report-act1');
}

export function runSlimePrologueSmoke(seedRng: Rng): WorldState {
  let state: WorldState = {
    flags: {},
    quests: {},
    inventory: [],
    gold: 120
  };

  const dragonIntro = startDialogForNpc(state, 'sealed-storm-dragon');
  const awakened = chooseDialogOption(state, dragonIntro.dialogId, dragonIntro.nodeId, 'begin');
  if (!awakened.ok || !awakened.state.next) throw new Error(awakened.message);
  state = awakened.state.world;

  const oath = chooseDialogOption(state, awakened.state.next.dialogId, awakened.state.next.nodeId, 'oath');
  if (!oath.ok) throw new Error(oath.message);
  state = oath.state.world;

  state = chooseNpcOptionOrThrow(state, 'rigurd', 'hear-goblin-plea');

  const pack = resolveEncounter(state, 'direwolf-den', { x: 9, y: 5 }, seedRng);
  if (!pack.state.encounter) throw new Error('Expected direwolf-pack encounter.');
  state = completeEncounter(pack.state.world, pack.state.encounter.id).state;

  // Pakt mit Ranga: rekrutiert Ranga und schaltet die Benennung frei.
  state = chooseNpcOptionOrThrow(state, 'ranga', 'seal-pact');

  return chooseNpcOptionOrThrow(state, 'rigurd', 'name-village');
}

export function runPrologueIntoActOneSmoke(seedRng: Rng): WorldState {
  let state = runSlimePrologueSmoke(seedRng);

  state = chooseNpcOptionOrThrow(state, 'rigurd-tempest', 'after-prologue');
  state = chooseNpcOptionOrThrow(state, 'shuna', 'analyze');
  state = chooseNpcOptionOrThrow(state, 'gobta', 'briefing');
  state = chooseNpcOptionOrThrow(state, 'ranga-tempest', 'scout-route');
  state = chooseNpcOptionOrThrow(state, 'rigurd-tempest', 'council');

  const grove = resolveEncounter(state, 'tempest-start', { x: 14, y: 8 }, seedRng);
  if (!grove.state.encounter) throw new Error('Expected whispering-grove encounter after prologue.');
  state = completeEncounter(grove.state.world, grove.state.encounter.id).state;

  const shrine = resolveEncounter(state, 'tempest-start', { x: 21, y: 13 }, seedRng);
  if (!shrine.state.encounter) throw new Error('Expected ancestor-seal encounter after prologue.');
  state = completeEncounter(shrine.state.world, shrine.state.encounter.id).state;

  return chooseNpcOptionOrThrow(state, 'rigurd-tempest', 'report-act1');
}

function chooseNpcOptionOrThrow(state: WorldState, npcId: string, choiceId: string): WorldState {
  const dialog = startDialogForNpc(state, npcId);
  const result = chooseDialogOption(state, dialog.dialogId, dialog.nodeId, choiceId);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.state.world;
}
