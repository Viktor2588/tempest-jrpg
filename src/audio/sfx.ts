// Asset-basierte SFX (Kenney „RPG Audio", CC0 — siehe ASSETS.md).
// Browser-only; Tests importieren dieses Modul bewusst nicht direkt.
import { loadSettings, effectiveSfxVolume } from '../systems/settings';

import selectUrl from '../assets/audio/ui-select.ogg';
import confirmUrl from '../assets/audio/ui-confirm.ogg';
import cancelUrl from '../assets/audio/ui-cancel.ogg';
import hitUrl from '../assets/audio/battle-hit.ogg';
import magicUrl from '../assets/audio/battle-magic.ogg';
import healUrl from '../assets/audio/battle-heal.ogg';
import victoryUrl from '../assets/audio/result-victory.ogg';
import defeatUrl from '../assets/audio/result-defeat.ogg';

export const SFX_ASSETS = {
  select: selectUrl,
  confirm: confirmUrl,
  cancel: cancelUrl,
  hit: hitUrl,
  magic: magicUrl,
  heal: healUrl,
  victory: victoryUrl,
  defeat: defeatUrl
} as const;

export type SfxName = keyof typeof SFX_ASSETS;

const baseAudio = new Map<SfxName, HTMLAudioElement>();

function canUseAudio(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}

function getBaseAudio(name: SfxName): HTMLAudioElement | null {
  if (!canUseAudio()) return null;
  const cached = baseAudio.get(name);
  if (cached) return cached;

  const audio = new Audio(SFX_ASSETS[name]);
  audio.preload = 'auto';
  baseAudio.set(name, audio);
  return audio;
}

/** Nach der ersten Nutzergeste aufrufen, damit Browser Audio-Playback erlauben. */
export function resumeAudio(): void {
  if (!canUseAudio()) return;
  for (const name of Object.keys(SFX_ASSETS) as SfxName[]) {
    getBaseAudio(name)?.load();
  }
}

export function playSfx(name: SfxName): void {
  const base = getBaseAudio(name);
  if (!base) return;

  const volume = effectiveSfxVolume(loadSettings(window.localStorage));
  if (volume <= 0) return;

  const instance = base.cloneNode(true) as HTMLAudioElement;
  instance.volume = Math.min(1, Math.max(0, volume));
  instance.currentTime = 0;
  void instance.play().catch(() => {
    // Browser blockiert Audio, bis eine Nutzergeste erfolgt. In dem Fall still
    // fehlschlagen; die nächste Eingabe ruft resumeAudio() erneut auf.
  });
}
