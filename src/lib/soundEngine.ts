// High-performance Zero-Latency Web Audio Synthesizer
// Eliminates remote audio download stalls, buffering, and mobile audio lag.

class ZeroLatencySoundEngine {
  private ctx: AudioContext | null = null;
  private volumes: Record<string, number> = {
    click: 0.3,
    correct: 0.5,
    wrong: 0.5,
    win: 0.6,
    levelup: 0.6,
  };

  setVolume(type: string, volume: number) {
    this.volumes[type] = Math.max(0, Math.min(1, volume));
  }

  private getVolume(type: string, baseMultiplier: number = 1): number {
    const userVol = this.volumes[type] ?? 0.5;
    return userVol * baseMultiplier;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pre-warm audio context on first user interaction
  warmup() {
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  play(type: 'click' | 'correct' | 'wrong' | 'win' | 'levelup') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      switch (type) {
        case 'click': {
          // Instant crisp 25ms tactile tick
          const vol = this.getVolume('click', 0.15);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(850, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.025);
          break;
        }

        case 'correct': {
          // Cheerful, instant harmonic two-tone chime (587Hz -> 880Hz)
          const vol = this.getVolume('correct', 0.22);
          [587.33, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const startTime = now + i * 0.07;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(vol, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.16);
          });
          break;
        }

        case 'wrong': {
          // Soft low buzz
          const vol = this.getVolume('wrong', 0.16);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.linearRampToValueAtTime(140, now + 0.16);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
          break;
        }

        case 'win': {
          // Ascending victory chord
          const vol = this.getVolume('win', 0.2);
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const t = now + idx * 0.08;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.24);
          });
          break;
        }

        case 'levelup': {
          const vol = this.getVolume('levelup', 0.2);
          [659.25, 830.61, 987.77, 1318.51].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = now + idx * 0.06;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.22);
          });
          break;
        }
      }
    } catch {
      // AudioContext failure recovery
    }
  }
}

export const instantAudio = new ZeroLatencySoundEngine();
