// Auto-Kampf: wählt eine sinnvolle Aktion für die aktive Party-Einheit.
// Phaser-/DOM-frei → headless testbar. Heuristik: erst Heilung bei niedrigem LP,
// sonst günstigste verfügbare Schadensfähigkeit, sonst normaler Angriff — Ziel
// ist der Gegner mit den wenigsten LP.
import { act, currentActor, renderView, type BattleState } from './battle';
import { ITEMS, SKILLS } from '../data';
import type { ItemDefinition, SkillDefinition } from '../data';
import { getItemCount } from './inventory';

export type BattleAction = Parameters<typeof act>[1];

const HEAL_THRESHOLD = 0.4;
const MP_RESTORE_THRESHOLD = 0.35;
const itemDefinitions: readonly ItemDefinition[] = ITEMS;

function skillsOf(ids: readonly string[]): SkillDefinition[] {
  return ids.flatMap((id) => {
    const s = SKILLS.find((sk) => sk.id === id);
    return s ? [s] : [];
  });
}

/** Liefert die nächste Auto-Aktion oder null (nicht am Zug / kein Ziel). */
export function chooseAutoAction(state: BattleState): BattleAction | null {
  const actor = currentActor(state);
  if (!actor || actor.side !== 'party') return null;

  const view = renderView(state);
  const enemies = view.enemies.filter((e) => !e.dead);
  const allies = view.party.filter((p) => !p.dead);
  if (!enemies.length) return null;

  const known = skillsOf(actor.skillIds).filter((s) => actor.mp >= s.costMp);
  const allKnownSkills = skillsOf(actor.skillIds);

  // 1) Heilung, wenn ein Verbündeter unter der Schwelle liegt.
  const heal = known.find((s) => s.tags.includes('heal'));
  const lowAlly = allies.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  if (heal && lowAlly && lowAlly.hp / lowAlly.maxHp < HEAL_THRESHOLD) {
    return { type: 'skill', skillId: heal.id, targetId: lowAlly.id };
  }
  const healItem = consumableItem(state, 'heal-hp');
  if (healItem && lowAlly && lowAlly.hp / lowAlly.maxHp < HEAL_THRESHOLD) {
    return { type: 'item', itemId: healItem.id, targetId: lowAlly.id };
  }

  const target = enemies.slice().sort((a, b) => a.hp - b.hp)[0]!;

  // 2) Günstigste Schadensfähigkeit (kein Heal), falls bezahlbar.
  const damage = known
    .filter((s) => !s.tags.includes('heal') && s.target !== 'self' && s.target !== 'single-ally')
    .sort((a, b) => a.costMp - b.costMp)[0];
  if (damage) {
    if (damage.target === 'all-enemies') return { type: 'skill', skillId: damage.id };
    return { type: 'skill', skillId: damage.id, targetId: target.id };
  }

  const nextDamageSkill = allKnownSkills
    .filter((s) => !s.tags.includes('heal') && s.target !== 'self' && s.target !== 'single-ally')
    .sort((a, b) => a.costMp - b.costMp)[0];
  const mpItem = consumableItem(state, 'restore-mp');
  if (mpItem
    && nextDamageSkill
    && actor.mp < nextDamageSkill.costMp
    && actor.mp / Math.max(1, actor.maxMp) < MP_RESTORE_THRESHOLD) {
    return { type: 'item', itemId: mpItem.id, targetId: actor.id };
  }

  // 3) Standardangriff.
  return { type: 'attack', targetId: target.id };
}

function consumableItem(
  state: BattleState,
  kind: NonNullable<ItemDefinition['effect']>['kind']
): ItemDefinition | undefined {
  return itemDefinitions
    .filter((item) =>
      item.category === 'consumable'
      && item.effect?.kind === kind
      && getItemCount(state.inventory, item.id) > 0
    )
    .sort((a, b) => (a.effect?.amount ?? 0) - (b.effect?.amount ?? 0))[0];
}
