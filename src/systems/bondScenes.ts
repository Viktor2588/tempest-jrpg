import {
  RELATIONSHIPS,
  type RelationshipDefinition,
  type RelationshipLevelDefinition,
  type RelationshipSceneDefinition
} from '../data';
import type { SceneScript } from './sceneScript';
import { getRelationshipLevelNumber, type ProgressionState } from './progression';

// Phase 98 — Bande: die Bindungs-Szenen (Daten in data/progression) werden ueber den
// vorhandenen sceneScript-Interpreter (Phase 62) gespielt. Reine Regeln, Phaser-frei
// und headless testbar; die OverworldScene spielt eine faellige Szene bei Gelegenheit
// (z. B. an der Rast) und quittiert sie danach. Der mechanische Freischalt-Payoff
// (Team-Mix-Partner + Bond-Perk) haengt an der erreichten Bindungsstufe (progression),
// die Szene ist das *Zeigen* des Moments — kein zweiter Zustand.

// Eigener Quittungs-Flag-Namensraum, damit er nicht mit den (heute inerten)
// szeneneigenen `flagId`-Feldern kollidiert.
export function bondScenePlayedFlag(sceneId: string): string {
  return `bond.scene.${sceneId}.played`;
}

export interface PendingBondScene {
  readonly relationship: RelationshipDefinition;
  readonly scene: RelationshipSceneDefinition;
}

// Naechste faellige Bindungs-Szene (oder null): erreichte Bindungsstufe deckt die
// geforderte Stufe, die Szene ist noch nicht gespielt, und — falls angegeben — der
// Hauptcharakter der Beziehung ist verfuegbar (im Roster). Stabile Reihenfolge:
// Beziehungs-Reihenfolge, dann niedrigste geforderte Stufe zuerst.
export function getPendingBondScene(
  state: ProgressionState,
  flags: Readonly<Record<string, boolean>>,
  availableCharacterIds?: ReadonlySet<string>
): PendingBondScene | null {
  for (const relationship of RELATIONSHIPS as readonly RelationshipDefinition[]) {
    if (availableCharacterIds && !availableCharacterIds.has(relationship.characterId)) {
      continue;
    }
    const level = getRelationshipLevelNumber(state, relationship.id);
    const scenes = [...relationship.scenes].sort((a, b) => a.requiredLevel - b.requiredLevel);
    for (const scene of scenes) {
      if (level >= scene.requiredLevel && flags[bondScenePlayedFlag(scene.id)] !== true) {
        return { relationship, scene };
      }
    }
  }
  return null;
}

// Markiert eine Bindungs-Szene als gespielt (idempotent).
export function acknowledgeBondScene(
  flags: Readonly<Record<string, boolean>>,
  sceneId: string
): Readonly<Record<string, boolean>> {
  const flag = bondScenePlayedFlag(sceneId);
  if (flags[flag] === true) return flags;
  return { ...flags, [flag]: true };
}

function levelForScene(
  relationship: RelationshipDefinition,
  scene: RelationshipSceneDefinition
): RelationshipLevelDefinition {
  const level = relationship.levels.find((candidate) => candidate.level === scene.requiredLevel);
  if (!level) {
    throw new Error(`Bindungs-Szene ${scene.id} verweist auf eine unbekannte Stufe.`);
  }
  return level;
}

function mechanicalUnlockText(level: RelationshipLevelDefinition): string {
  const unlocks: string[] = [];
  if (level.combatBonus?.startingTeamMeter) {
    unlocks.push(`+${level.combatBonus.startingTeamMeter} Teamleiste zum Kampfbeginn`);
  }
  if (level.combatBonus?.teamAttack) unlocks.push('Team-Angriff bereit');
  if (level.combatBonus?.openingStatusId) unlocks.push('Kampfvorteil beim ersten Zug');
  if (level.skillIds && level.skillIds.length > 0) unlocks.push('neue Fähigkeit verfügbar');
  if (level.perk) unlocks.push('Bindungsperk aktiv');
  return unlocks.length > 0 ? unlocks.join(' · ') : 'passive Werte gestärkt';
}

// Der Toast bestätigt nachvollziehbar sowohl die erreichte Stufe als auch ihren
// konkreten spielerischen Nutzen. Das Feld ist aus den bestehenden Beziehungsdaten
// ableitbar und erweitert keinen Save-Zustand.
export function bondSceneUnlockText(
  relationship: RelationshipDefinition,
  scene: RelationshipSceneDefinition
): string {
  const level = levelForScene(relationship, scene);
  const detail = scene.unlockText ?? mechanicalUnlockText(level);
  return `Bindungsstufe ${level.level} erreicht: ${level.title}. Freigeschaltet: ${detail}.`;
}

// Erzeugt aus einer Bindungs-Szene ein abspielbares SceneScript. Bewusst schlank:
// dialogische Daten haben Vorrang; ältere Szenen behalten ihren erzählerischen
// Fallback. Die Zusammenfassung erscheint danach als klarer Freischalt-Toast.
export function bondSceneToScript(
  relationship: RelationshipDefinition,
  scene: RelationshipSceneDefinition
): SceneScript {
  const dialogue = scene.dialogue?.map((step) => ({
    kind: 'text' as const,
    speaker: step.speaker,
    line: step.line
  }));
  return {
    id: `bond-${scene.id}`,
    steps: dialogue && dialogue.length > 0
      ? dialogue
      : [
          { kind: 'text', line: scene.summary },
          { kind: 'text', speaker: relationship.partnerName, line: 'Unser Band wird staerker.' }
        ],
    summary: {
      title: scene.title,
      body: bondSceneUnlockText(relationship, scene)
    }
  };
}
