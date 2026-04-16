/**
 * Plays a quick synthesised "boing/plop" sound when a shape is spawned.
 * Creates and immediately disposes an AudioContext so there is no persistent state.
 */
export function playSpawnSound(): void {
  // Guard against SSR
  if (typeof window === 'undefined' || !window.AudioContext) return;

  const ctx = new AudioContext();
  const now = ctx.currentTime;

  // Oscillator 1: descending pitch "boing"
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(600, now);
  osc1.frequency.exponentialRampToValueAtTime(180, now + 0.25);
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.18, now + 0.01);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.3);

  // Oscillator 2: quick high transient click (impact feel)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1200, now);
  osc2.frequency.exponentialRampToValueAtTime(300, now + 0.06);
  gain2.gain.setValueAtTime(0.1, now);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.07);

  // Close context after sound finishes
  setTimeout(() => ctx.close(), 500);
}
