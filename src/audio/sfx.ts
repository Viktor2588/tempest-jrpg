// Prozedurale WebAudio-SFX (ohne Asset-Dateien). Respektiert die SFX-Lautstärke
// aus den Einstellungen. Browser-only — wird in Tests nicht importiert.
import { loadSettings, effectiveSfxVolume } from '../systems/settings';

interface Tone {
  freq: number;
  dur: number;
  type?: OscillatorType;
  slideTo?: number;
}

const SFX: Record<string, Tone[]> = {
  select: [{ freq: 440, dur: 0.06, type: 'square' }],
  confirm: [{ freq: 540, dur: 0.07, type: 'square' }, { freq: 760, dur: 0.09, type: 'square' }],
  cancel: [{ freq: 360, dur: 0.08, type: 'square', slideTo: 240 }],
  hit: [{ freq: 200, dur: 0.09, type: 'sawtooth', slideTo: 90 }],
  magic: [{ freq: 320, dur: 0.18, type: 'sine', slideTo: 760 }],
  heal: [{ freq: 520, dur: 0.16, type: 'sine', slideTo: 900 }],
  victory: [{ freq: 523, dur: 0.12, type: 'square' }, { freq: 659, dur: 0.12, type: 'square' }, { freq: 784, dur: 0.22, type: 'square' }],
  defeat: [{ freq: 300, dur: 0.22, type: 'sawtooth', slideTo: 120 }]
};

let ctx: AudioContext | null = null;
let unavailable = false;

function audioCtx(): AudioContext | null {
  if (unavailable || typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) { unavailable = true; return null; }
    ctx = new Ctor();
  }
  return ctx;
}

/** Nach der ersten Nutzergeste aufrufen, damit Audio erlaubt ist. */
export function resumeAudio(): void {
  void audioCtx()?.resume?.();
}

export type SfxName = keyof typeof SFX;

export function playSfx(name: SfxName): void {
  const ac = audioCtx();
  if (!ac) return;
  const volume = effectiveSfxVolume(loadSettings(window.localStorage));
  if (volume <= 0) return;

  let t = ac.currentTime;
  for (const tone of SFX[name] ?? []) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = tone.type ?? 'square';
    osc.frequency.setValueAtTime(tone.freq, t);
    if (tone.slideTo) osc.frequency.linearRampToValueAtTime(tone.slideTo, t + tone.dur);
    // kurze Hüllkurve gegen Klicks
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25 * volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + tone.dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + tone.dur + 0.02);
    t += tone.dur * 0.9;
  }
}
