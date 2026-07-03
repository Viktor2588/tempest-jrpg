import type { Vec2 } from './overworld';

// Cutscene-light: ein kleines, datengetriebenes Skriptsystem fuer inszenierte
// Oberwelt-Momente. Rein/funktional und Phaser-frei — der Interpreter (Runner)
// laeuft headless testbar; die OverworldScene fuehrt jeden Schritt visuell aus
// und ruft `advance`, wenn der Schritt fertig ist.

export type Facing = 'up' | 'down' | 'left' | 'right';

export type SceneStep =
  // Akteur zu einer Kachel bewegen (Scene fuehrt die Wegbewegung aus).
  | { readonly kind: 'move'; readonly actor: string; readonly to: Vec2 }
  // Akteur drehen.
  | { readonly kind: 'face'; readonly actor: string; readonly dir: Facing }
  // Emote-Blase ueber einem Akteur (z. B. '!', '?', '♥', '…').
  | { readonly kind: 'emote'; readonly actor: string; readonly emote: string }
  // Kamera-Schwenk auf eine Kachel.
  | { readonly kind: 'camera'; readonly to: Vec2 }
  // Textbeat; ohne `speaker` als Erzaehlerzeile.
  | { readonly kind: 'text'; readonly speaker?: string; readonly line: string }
  // Item-Uebergabe an die Party.
  | { readonly kind: 'give'; readonly itemId: string; readonly quantity: number }
  // Reine Pause (Millisekunden).
  | { readonly kind: 'wait'; readonly ms: number };

export interface SceneScript {
  readonly id: string;
  readonly steps: readonly SceneStep[];
  // Kurze Zusammenfassung, die NACH der Szene als Toast/Milestone erscheint
  // (statt den Beat vorab per Text zu „erzaehlen").
  readonly summary?: { readonly title: string; readonly body: string };
}

export interface SceneRunner {
  /** Aktueller Schritt oder null, wenn die Szene durch ist. */
  current(): SceneStep | null;
  /** Rueckt einen Schritt vor und liefert den neuen aktuellen Schritt. */
  advance(): SceneStep | null;
  done(): boolean;
  /** 0-basierter Index des aktuellen Schritts (== steps.length wenn fertig). */
  index(): number;
}

export function createSceneRunner(script: SceneScript): SceneRunner {
  let i = 0;
  const steps = script.steps;
  return {
    current: () => (i < steps.length ? steps[i]! : null),
    advance: () => {
      if (i < steps.length) i += 1;
      return i < steps.length ? steps[i]! : null;
    },
    done: () => i >= steps.length,
    index: () => i
  };
}

export interface SceneScriptContext {
  readonly actorIds: ReadonlySet<string>;
  readonly itemIds: ReadonlySet<string>;
}

// Validiert ein Skript gegen die bekannten Akteure/Items und liefert eine Liste
// menschenlesbarer Probleme (leer = ok). Wird in der Datenintegritaet genutzt,
// damit fehlerhafte Skripte den Build brechen statt erst zur Laufzeit.
export function validateSceneScript(script: SceneScript, context: SceneScriptContext): string[] {
  const issues: string[] = [];
  const where = (index: number, message: string): string =>
    `Szene '${script.id}' Schritt ${index} (${script.steps[index]?.kind}): ${message}`;

  if (script.steps.length === 0) {
    issues.push(`Szene '${script.id}': keine Schritte.`);
  }

  script.steps.forEach((step, index) => {
    switch (step.kind) {
      case 'move':
      case 'face':
      case 'emote':
        if (!context.actorIds.has(step.actor)) {
          issues.push(where(index, `unbekannter Akteur '${step.actor}'.`));
        }
        if (step.kind === 'emote' && step.emote.trim() === '') {
          issues.push(where(index, 'leeres Emote.'));
        }
        break;
      case 'text':
        if (step.line.trim() === '') issues.push(where(index, 'leerer Textbeat.'));
        break;
      case 'give':
        if (!context.itemIds.has(step.itemId)) {
          issues.push(where(index, `unbekanntes Item '${step.itemId}'.`));
        }
        if (step.quantity <= 0) issues.push(where(index, 'Menge muss > 0 sein.'));
        break;
      case 'wait':
        if (step.ms < 0) issues.push(where(index, 'negative Wartezeit.'));
        break;
      case 'camera':
        break;
    }
  });

  return issues;
}
