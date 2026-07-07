// Kurze, loopende Musik-Motive (Kenney „Music Jingles", CC0 — siehe ASSETS.md).
// Browser-only; folgt Master×Musik-Lautstärke aus den Einstellungen.
import { effectiveMusicVolume, loadSettings } from '../systems/settings';

import titleThemeUrl from '../assets/music/title-theme.ogg';
import fieldThemeUrl from '../assets/music/field-theme.ogg';
import battleThemeUrl from '../assets/music/battle-theme.ogg';

export const MUSIC_ASSETS = {
  title: titleThemeUrl,
  overworld: fieldThemeUrl,
  battle: battleThemeUrl
} as const;

export type MusicTrack = keyof typeof MUSIC_ASSETS;

let currentTrack: MusicTrack | null = null;
let currentAudio: HTMLAudioElement | null = null;

function canUseAudio(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}

function currentVolume(): number {
  if (!canUseAudio()) return 0;
  return Math.min(1, Math.max(0, effectiveMusicVolume(loadSettings(window.localStorage)) * 0.55));
}

export function playMusic(track: MusicTrack): void {
  if (!canUseAudio()) return;

  if (currentTrack === track && currentAudio) {
    currentAudio.volume = currentVolume();
    void currentAudio.play().catch(() => {});
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentTrack = track;
  currentAudio = new Audio(MUSIC_ASSETS[track]);
  currentAudio.loop = true;
  currentAudio.preload = 'auto';
  currentAudio.volume = currentVolume();
  void currentAudio.play().catch(() => {
    // Autoplay kann bis zur ersten Nutzergeste blockiert sein.
  });
}

export function resumeMusic(): void {
  if (!currentAudio) return;
  currentAudio.volume = currentVolume();
  void currentAudio.play().catch(() => {});
}

export function updateMusicVolume(): void {
  if (currentAudio) currentAudio.volume = currentVolume();
}
