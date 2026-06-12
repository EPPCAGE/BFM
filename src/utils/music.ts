/**
 * Procedural ambient background music via Web Audio.
 * No external files needed (the sandbox blocks downloads / CORS audio),
 * so we synthesize a slow, looping chord-pad progression with a gentle arpeggio.
 * Starts on first user gesture (browsers block audio before interaction).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let started = false;
let stopped = false;
let schedTimer: number | null = null;

// Chord progression (semitone offsets from base A2 = 110Hz), pleasant minor-ish pad
const BASE = 110; // A2
const PROGRESSION = [
  [0, 7, 12, 16],    // Am-ish
  [-2, 5, 10, 14],   // G
  [3, 10, 15, 19],   // C
  [-4, 3, 8, 12],    // F
];

function midiToFreq(semis: number): number {
  return BASE * Math.pow(2, semis / 12);
}

function playPad(freqs: number[], time: number, dur: number) {
  if (!ctx || !master) return;
  freqs.forEach((f) => {
    const osc = ctx!.createOscillator();
    const g = ctx!.createGain();
    const filt = ctx!.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 900;
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    osc.connect(filt);
    filt.connect(g);
    g.connect(master!);
    const peak = 0.05;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(peak, time + dur * 0.3);
    g.gain.linearRampToValueAtTime(0.0001, time + dur);
    osc.start(time);
    osc.stop(time + dur + 0.1);
  });
}

function playArpNote(freq: number, time: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq * 2;
  osc.connect(g);
  g.connect(master);
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.04, time + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);
  osc.start(time);
  osc.stop(time + 0.55);
}

let chordIndex = 0;
const CHORD_DUR = 4.0; // seconds per chord

function scheduleLoop() {
  if (!ctx || stopped) return;
  const now = ctx.currentTime;
  const chord = PROGRESSION[chordIndex % PROGRESSION.length];
  const freqs = chord.map(midiToFreq);
  playPad(freqs, now + 0.05, CHORD_DUR);

  // arpeggio over the chord
  for (let i = 0; i < 8; i++) {
    const note = freqs[i % freqs.length] * (i >= 4 ? 2 : 1);
    playArpNote(note, now + 0.05 + i * (CHORD_DUR / 8));
  }

  chordIndex++;
  schedTimer = window.setTimeout(scheduleLoop, CHORD_DUR * 1000);
}

export function startMusic() {
  if (started) return;
  if (localStorage.getItem('lorkemon-muted') === '1') return;
  try {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
    // gentle fade-in
    master.gain.setValueAtTime(0.0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
    started = true;
    stopped = false;
    scheduleLoop();
  } catch {
    // ignore
  }
}

export function setMusicMuted(muted: boolean) {
  if (muted) {
    stopMusic();
  } else {
    startMusic();
  }
}

export function stopMusic() {
  stopped = true;
  if (schedTimer) { clearTimeout(schedTimer); schedTimer = null; }
  started = false;
  if (ctx) { ctx.close(); ctx = null; master = null; }
}
