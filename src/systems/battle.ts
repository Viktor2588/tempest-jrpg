// Rundenkampf-Engine (Phaser-/DOM-frei, deterministisch über Seed).
// CT-Initiative (geschwindigkeitsbasiert), Aktionen (Angriff/Magie/Heilung/
// Verteidigen/Fliehen), Elemente/Schwächen, Status (Gift/Verteidigt), Gegner-KI
// und garantierte Terminierung. Die Szene rendert nur das View-Modell.
import { makeRng, type Rng } from './rng';
import { getSkill, type Element, type Skill, type StatusId } from '../data/skills';
import { getEnemy, type UnitStats } from '../data/units';

export type Side = 'party' | 'enemy';
export type BattleStatus = 'active' | 'won' | 'lost' | 'fled';

export interface StatusInstance {
  id: StatusId;
  turns: number;
}

export interface Combatant {
  id: string;
  name: string;
  side: Side;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  mag: number;
  spd: number;
  element: Element;
  weakness: Element | null;
  skills: string[];
  statuses: StatusInstance[];
  ct: number;
  guarding: boolean;
  dead: boolean;
  exp: number;
  gold: number;
}

export interface BattleState {
  combatants: Combatant[];
  status: BattleStatus;
  activeId: string | null;
  round: number;
  turns: number;
  seed: number;
  rng: Rng;
  log: string[];
  rewards: { exp: number; gold: number };
}

export type BattleAction =
  | { type: 'attack'; targetId: string }
  | { type: 'skill'; skillId: string; targetId?: string }
  | { type: 'guard' }
  | { type: 'flee' };

const CT_THRESHOLD = 100;
const MAX_TURNS = 300;
const POISON_FRAC = 0.06;

// ---------- Aufbau ----------
function fromStats(stats: UnitStats, id: string, side: Side, exp: number, gold: number): Combatant {
  return {
    id, name: stats.name, side,
    hp: stats.maxHp, maxHp: stats.maxHp, mp: stats.maxMp, maxMp: stats.maxMp,
    atk: stats.atk, def: stats.def, mag: stats.mag, spd: Math.max(1, stats.spd),
    element: stats.element, weakness: stats.weakness, skills: stats.skills.slice(),
    statuses: [], ct: 0, guarding: false, dead: false, exp, gold
  };
}

export function startBattle(party: readonly UnitStats[], enemyIds: readonly string[], seed: number): BattleState {
  const rng = makeRng(seed);
  const combatants: Combatant[] = [];
  party.forEach((p, i) => combatants.push(fromStats(p, 'p' + i, 'party', 0, 0)));
  enemyIds.forEach((eid, i) => {
    const def = getEnemy(eid);
    if (def) combatants.push(fromStats(def, 'e' + i, 'enemy', def.exp, def.gold));
  });
  // leicht gestaffelte Start-CT nach Geschwindigkeit
  combatants.forEach((c) => { c.ct = Math.floor(c.spd * (0.3 + rng() * 0.4)); });

  const state: BattleState = {
    combatants, status: 'active', activeId: null, round: 1, turns: 0,
    seed, rng, log: ['Ein Kampf beginnt!'], rewards: { exp: 0, gold: 0 }
  };
  advance(state);
  return state;
}

// ---------- Helfer ----------
function living(state: BattleState, side?: Side): Combatant[] {
  return state.combatants.filter((c) => !c.dead && (side ? c.side === side : true));
}
function byId(state: BattleState, id: string | null | undefined): Combatant | undefined {
  return id ? state.combatants.find((c) => c.id === id) : undefined;
}
export function currentActor(state: BattleState): Combatant | undefined {
  return byId(state, state.activeId);
}
function log(state: BattleState, text: string): void {
  state.log.unshift(text);
  state.log = state.log.slice(0, 8);
}

// ---------- Initiative (CT) ----------
function advance(state: BattleState): void {
  let guard = 0;
  while (guard++ < 100000) {
    if (checkEnd(state)) return;
    const alive = living(state);
    const ready = alive
      .filter((c) => c.ct >= CT_THRESHOLD)
      .sort((a, b) => b.ct - a.ct || (a.side === 'party' ? -1 : 1));
    if (ready.length) {
      const actor = ready[0]!;
      startOfTurn(state, actor);
      if (checkEnd(state)) return;
      if (actor.dead) continue; // an Gift gestorben
      state.activeId = actor.id;
      return;
    }
    alive.forEach((c) => { c.ct += c.spd; });
    state.round++;
  }
}

function startOfTurn(state: BattleState, actor: Combatant): void {
  actor.guarding = false;
  const poison = actor.statuses.find((s) => s.id === 'gift');
  if (poison) {
    const dmg = Math.max(1, Math.round(actor.maxHp * POISON_FRAC));
    actor.hp = Math.max(0, actor.hp - dmg);
    log(state, `${actor.name} erleidet ${dmg} Giftschaden.`);
    if (actor.hp <= 0) { actor.dead = true; log(state, `${actor.name} fällt.`); }
  }
  actor.statuses.forEach((s) => { s.turns--; });
  actor.statuses = actor.statuses.filter((s) => s.turns > 0);
}

// ---------- Schaden ----------
function elementMult(skill: Skill, target: Combatant): number {
  if (target.weakness === skill.element) return 1.75;
  if (target.element === skill.element) return 0.5;
  return 1;
}
function applyDamage(target: Combatant, raw: number): number {
  let dmg = Math.max(1, Math.round(raw));
  if (target.guarding) dmg = Math.max(1, Math.round(dmg * 0.5));
  target.hp = Math.max(0, target.hp - dmg);
  return dmg;
}
function checkDeath(state: BattleState, target: Combatant): void {
  if (target.hp <= 0 && !target.dead) {
    target.dead = true;
    log(state, `${target.name} wurde besiegt.`);
    if (target.side === 'enemy') {
      state.rewards.exp += target.exp;
      state.rewards.gold += target.gold;
    }
  }
}

// ---------- Aktionen (für beide Seiten) ----------
function endTurn(state: BattleState, actor: Combatant): void {
  actor.ct -= CT_THRESHOLD;
  if (actor.ct < 0) actor.ct = 0;
  state.turns++;
  if (checkEnd(state)) return;
  if (state.turns >= MAX_TURNS) { resolveByCap(state); return; }
  advance(state);
}

function resolveAction(state: BattleState, actor: Combatant, action: BattleAction): { ok: boolean; reason?: string } {
  if (action.type === 'guard') {
    actor.guarding = true;
    log(state, `${actor.name} geht in Verteidigung.`);
    endTurn(state, actor);
    return { ok: true };
  }
  if (action.type === 'flee') {
    const chance = actor.side === 'party' ? 0.45 + actor.spd * 0.01 : 0.2;
    if (state.rng() < chance) {
      state.status = 'fled';
      state.activeId = null;
      log(state, `${actor.name} flieht aus dem Kampf.`);
      return { ok: true };
    }
    log(state, `${actor.name} kann nicht fliehen.`);
    endTurn(state, actor);
    return { ok: true };
  }
  if (action.type === 'attack') {
    const t = byId(state, action.targetId);
    if (!t || t.dead || t.side === actor.side) return { ok: false, reason: 'Ungültiges Ziel.' };
    const raw = (actor.atk * 2 - t.def) * (0.9 + state.rng() * 0.2);
    const dmg = applyDamage(t, raw);
    log(state, `${actor.name} greift ${t.name} an: ${dmg} Schaden.`);
    checkDeath(state, t);
    endTurn(state, actor);
    return { ok: true };
  }
  // skill
  const skill = getSkill(action.skillId);
  if (!skill || actor.skills.indexOf(skill.id) < 0) return { ok: false, reason: 'Fähigkeit nicht verfügbar.' };
  if (actor.mp < skill.mp) return { ok: false, reason: 'Nicht genug MP.' };
  actor.mp -= skill.mp;

  if (skill.kind === 'heilung') {
    const ally = byId(state, action.targetId) ?? actor;
    if (ally.side !== actor.side || ally.dead) return { ok: false, reason: 'Ungültiges Ziel.' };
    const heal = Math.round(actor.mag * skill.power);
    ally.hp = Math.min(ally.maxHp, ally.hp + heal);
    log(state, `${actor.name} heilt ${ally.name} um ${heal}.`);
    endTurn(state, actor);
    return { ok: true };
  }

  // Magie (Schaden), evtl. AoE
  const targets = skill.target === 'alle-gegner'
    ? living(state, actor.side === 'party' ? 'enemy' : 'party')
    : [byId(state, action.targetId)].filter((t): t is Combatant => !!t && !t.dead && t.side !== actor.side);
  if (!targets.length) return { ok: false, reason: 'Ungültiges Ziel.' };
  targets.forEach((t) => {
    const raw = (actor.mag * skill.power) * elementMult(skill, t) * (0.9 + state.rng() * 0.2);
    const dmg = applyDamage(t, raw);
    const tag = t.weakness === skill.element ? ' (Schwäche!)' : '';
    log(state, `${actor.name} wirkt ${skill.name} auf ${t.name}: ${dmg}${tag}.`);
    if (skill.status && !t.dead && !t.statuses.some((s) => s.id === skill.status)) {
      t.statuses.push({ id: skill.status, turns: 3 });
    }
    checkDeath(state, t);
  });
  endTurn(state, actor);
  return { ok: true };
}

/** Spieleraktion (nur wenn eine Party-Einheit am Zug ist). */
export function act(state: BattleState, action: BattleAction): { ok: boolean; reason?: string } {
  const actor = currentActor(state);
  if (state.status !== 'active' || !actor || actor.side !== 'party') return { ok: false, reason: 'Nicht am Zug.' };
  return resolveAction(state, actor, action);
}

/** Führt den Zug der aktiven Gegner-Einheit aus (einfache KI). */
export function enemyTurn(state: BattleState): { ok: boolean } {
  const actor = currentActor(state);
  if (state.status !== 'active' || !actor || actor.side !== 'enemy') return { ok: false };
  const foes = living(state, 'party');
  if (!foes.length) { checkEnd(state); return { ok: true } }

  // Magier nutzen ab und zu eine Fähigkeit, bevorzugt auf Schwäche.
  const usableSkills = actor.skills.map(getSkill).filter((s): s is Skill => !!s && s.kind !== 'heilung' && actor.mp >= s.mp);
  if (usableSkills.length && state.rng() < 0.5) {
    const skill = usableSkills[Math.floor(state.rng() * usableSkills.length)]!;
    const weak = foes.find((f) => f.weakness === skill.element);
    const target = weak ?? foes[Math.floor(state.rng() * foes.length)]!;
    resolveAction(state, actor, { type: 'skill', skillId: skill.id, targetId: target.id });
    return { ok: true };
  }
  const target = foes[Math.floor(state.rng() * foes.length)]!;
  resolveAction(state, actor, { type: 'attack', targetId: target.id });
  return { ok: true };
}

// ---------- Ende ----------
function checkEnd(state: BattleState): boolean {
  if (state.status !== 'active') return true;
  if (!living(state, 'enemy').length) { state.status = 'won'; state.activeId = null; log(state, 'Sieg!'); return true; }
  if (!living(state, 'party').length) { state.status = 'lost'; state.activeId = null; log(state, 'Niederlage …'); return true; }
  return false;
}
function hpFraction(list: Combatant[]): number {
  let cur = 0, max = 0;
  list.forEach((c) => { cur += Math.max(0, c.hp); max += c.maxHp; });
  return max > 0 ? cur / max : 0;
}
function resolveByCap(state: BattleState): void {
  const pf = hpFraction(living(state, 'party'));
  const ef = hpFraction(living(state, 'enemy'));
  state.status = pf >= ef ? 'won' : 'lost';
  state.activeId = null;
  log(state, `Der Kampf endet nach ${MAX_TURNS} Zügen.`);
}

/** Ist gerade eine Party-Einheit am Zug (Spielereingabe nötig)? */
export function isPlayerTurn(state: BattleState): boolean {
  const a = currentActor(state);
  return state.status === 'active' && !!a && a.side === 'party';
}

// ---------- Render-View (Kopie für die UI) ----------
export interface CombatantView {
  id: string; name: string; side: Side; hp: number; maxHp: number; mp: number; maxMp: number;
  dead: boolean; guarding: boolean; statuses: StatusId[]; active: boolean;
}
export interface BattleView {
  status: BattleStatus;
  party: CombatantView[];
  enemies: CombatantView[];
  activeId: string | null;
  log: string[];
  rewards: { exp: number; gold: number };
}
function viewOf(c: Combatant, activeId: string | null): CombatantView {
  return {
    id: c.id, name: c.name, side: c.side, hp: c.hp, maxHp: c.maxHp, mp: c.mp, maxMp: c.maxMp,
    dead: c.dead, guarding: c.guarding, statuses: c.statuses.map((s) => s.id), active: c.id === activeId
  };
}
export function renderView(state: BattleState): BattleView {
  return {
    status: state.status,
    party: state.combatants.filter((c) => c.side === 'party').map((c) => viewOf(c, state.activeId)),
    enemies: state.combatants.filter((c) => c.side === 'enemy').map((c) => viewOf(c, state.activeId)),
    activeId: state.activeId,
    log: state.log.slice(),
    rewards: { ...state.rewards }
  };
}
