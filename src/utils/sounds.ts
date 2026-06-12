let ctx: AudioContext | null = null;

export function isMuted(): boolean {
  return localStorage.getItem('lorkemon-muted') === '1';
}

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.25) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.connect(g);
  g.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

export type SoundId = 'card' | 'energy' | 'summon' | 'attack' | 'evolve' | 'ko' | 'win' | 'error' | 'trainer';

export function playSound(id: SoundId) {
  if (isMuted()) return;
  try {
    switch (id) {
      case 'card':
        tone(700, 0.07, 'square', 0.12);
        break;
      case 'energy':
        tone(900, 0.08, 'sine', 0.18);
        setTimeout(() => tone(1200, 0.1, 'sine', 0.14), 55);
        break;
      case 'summon':
        tone(440, 0.12, 'sine', 0.22);
        setTimeout(() => tone(660, 0.18, 'sine', 0.18), 90);
        break;
      case 'attack':
        tone(180, 0.04, 'sawtooth', 0.3);
        setTimeout(() => tone(130, 0.09, 'sawtooth', 0.22), 45);
        break;
      case 'evolve':
        [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'sine', 0.2), i * 75));
        break;
      case 'ko':
        tone(280, 0.04, 'sawtooth', 0.28);
        setTimeout(() => tone(180, 0.08, 'sawtooth', 0.22), 55);
        setTimeout(() => tone(90, 0.18, 'sawtooth', 0.18), 120);
        break;
      case 'win':
        [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'sine', 0.22), i * 90));
        break;
      case 'trainer':
        tone(520, 0.06, 'triangle', 0.18);
        setTimeout(() => tone(780, 0.12, 'triangle', 0.14), 60);
        break;
      case 'error':
        tone(220, 0.12, 'square', 0.18);
        break;
    }
  } catch {
    // AudioContext blocked (e.g. no user gesture yet) — silently ignore
  }
}
