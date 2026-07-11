// Phase 144 — prozedurale WebAudio-SFX (KEIN Asset-Import).
// Bewusst getrennt von sfx.ts (das .ogg-Dateien statisch importiert): reine
// Logik-Module wie systems/battle.ts nutzen nur diese Schicht und ziehen so
// keine Binaer-Assets in Nicht-Vite-Transformer (z. B. den Playwright-E2E-Bundler).
import { loadSettings, effectiveSfxVolume } from '../systems/settings';

function canUseAudio(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!canUseAudio()) return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playProcedural(type: 'hit' | 'crit' | 'break' | 'heal' | 'devour' | 'victory' | 'menu'): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const volume = effectiveSfxVolume(loadSettings(window.localStorage));
  if (volume <= 0) return;

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.value = volume * 0.8;
  gain.connect(ctx.destination);

  switch (type) {
    case 'hit': {
      // Kurzer Noise-Burst für Treffer
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      const env = ctx.createGain();
      env.gain.value = 1;
      env.gain.linearRampToValueAtTime(0, now + 0.1);
      noise.connect(filter).connect(env).connect(gain);
      noise.start(now);
      break;
    }
    case 'crit': {
      // Höherer, schärferer Hit
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 1200;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      const env = ctx.createGain();
      env.gain.value = 0.8;
      env.gain.linearRampToValueAtTime(0, now + 0.15);
      osc.connect(filter).connect(env).connect(gain);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }
    case 'break': {
      // Tiefer, knallender Break
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      const env = ctx.createGain();
      env.gain.value = 1;
      env.gain.linearRampToValueAtTime(0, now + 0.3);
      noise.connect(filter).connect(env).connect(gain);
      noise.start(now);
      break;
    }
    case 'heal': {
      // Sanfter Aufstieg
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 600;
      const env = ctx.createGain();
      env.gain.value = 0.5;
      env.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.connect(env).connect(gain);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }
    case 'devour': {
      // Tiefes, saugendes Geräusch
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 80;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      const env = ctx.createGain();
      env.gain.value = 0.7;
      env.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.connect(filter).connect(env).connect(gain);
      osc.start(now);
      osc.stop(now + 0.7);
      break;
    }
    case 'victory': {
      // Kurze Fanfare (zwei Töne)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800;
      const env = ctx.createGain();
      env.gain.value = 0.6;
      env.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.connect(env).connect(gain);
      osc.start(now);
      osc.stop(now + 0.4);
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 1000;
      const env2 = ctx.createGain();
      env2.gain.value = 0.6;
      env2.gain.linearRampToValueAtTime(0, now + 0.5);
      osc2.connect(env2).connect(gain);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.6);
      break;
    }
    case 'menu': {
      // Kurzer Cursor-Ton
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 1200;
      const env = ctx.createGain();
      env.gain.value = 0.3;
      env.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.connect(env).connect(gain);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    }
  }
}

export function playSfxProcedural(type: 'hit' | 'crit' | 'break' | 'heal' | 'devour' | 'victory' | 'menu'): void {
  playProcedural(type);
}
