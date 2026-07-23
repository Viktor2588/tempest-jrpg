// Kurze, loopende Musik-Motive (Kenney „Music Jingles", CC0 — siehe ASSETS.md).
// Browser-only; folgt Master×Musik-Lautstärke aus den Einstellungen.
import { effectiveMusicVolume, loadSettings } from '../systems/settings';

import titleThemeUrl from '../assets/music/title-theme.ogg';
import fieldThemeUrl from '../assets/music/field-theme.ogg';
import battleThemeUrl from '../assets/music/battle-theme.ogg';
import menuThemeUrl from '../assets/music/menu-theme.ogg';
import settlementThemeUrl from '../assets/music/settlement-theme.ogg';
import wildsThemeUrl from '../assets/music/wilds-theme.ogg';
import bossThemeUrl from '../assets/music/boss-theme.ogg';

export const MUSIC_ASSETS = {
  title: titleThemeUrl,
  overworld: fieldThemeUrl,
  battle: battleThemeUrl,
  menu: menuThemeUrl,
  settlement: settlementThemeUrl,
  wilds: wildsThemeUrl,
  boss: bossThemeUrl
} as const;

export type MusicTrack = keyof typeof MUSIC_ASSETS;

const SETTLEMENT_MAPS = new Set(['tempest-start', 'goblin-village', 'dwargon', 'blumund', 'freedom-academy']);
const WILDS_MAPS = new Set(['sealed-cave', 'direwolf-den', 'ember-hollow', 'ramiris-labyrinth']);

export function overworldMusicTrack(mapId: string): MusicTrack {
  if (SETTLEMENT_MAPS.has(mapId)) return 'settlement';
  if (WILDS_MAPS.has(mapId)) return 'wilds';
  return 'overworld';
}

export function battleMusicTrack(hasBoss: boolean): MusicTrack {
  return hasBoss ? 'boss' : 'battle';
}

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
