// Web Audio API ethereal chime synthesizer for Encarto

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a gentle mystical crystal chime
  playChime(pitch: 'high' | 'mid' | 'low' | 'complete' = 'mid') {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqs = {
        high: 880,      // A5
        mid: 659.25,    // E5
        low: 523.25,    // C5
        complete: 1046.5 // C6
      };

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs[pitch], now);
      if (pitch === 'complete') {
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
      }

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio not permitted or suspended, ignore silently
    }
  }
}

export const soundManager = new SoundManager();
