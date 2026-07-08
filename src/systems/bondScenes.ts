import { RELATIONSHIPS, type RelationshipDefinition, type RelationshipSceneDefinition } from '../data';
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

// Erzeugt aus einer Bindungs-Szene ein abspielbares SceneScript. Bewusst schlank:
// ein Erzaehler-Beat plus ein herzlicher Emote-Schlusspunkt; die Zusammenfassung
// erscheint danach als Toast (wie bei den Story-Beats).
export function bondSceneToScript(
  relationship: RelationshipDefinition,
  scene: RelationshipSceneDefinition
): SceneScript {
  return {
    id: `bond-${scene.id}`,
    steps: [
      { kind: 'text', line: scene.summary },
      { kind: 'text', speaker: relationship.partnerName, line: 'Unser Band wird staerker.' }
    ],
    summary: {
      title: scene.title,
      body: `Bindung mit ${relationship.partnerName} vertieft.`
    }
  };
}
