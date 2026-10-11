/**
 * Sound Manager for Skill Quest AI
 * Howler.js-backed jungle audio engine replacing the synthesized oscillator beeps.
 * Real audio samples stream from /sounds/*.mp3; a Web Audio synth fallback keeps
 * gameplay intact if an asset is ever missing or fails to decode.
 */

import { Howl, Howler } from 'howler';

const SOUND_BASE = '/sounds';

// Per-effect volumes (0..1). Ambient sits lowest so it never masks SFX.
const VOLUMES = {
  ambient: 0.28,
  vineSwing: 0.55,
  coinPickup: 0.6,
  levelVictory: 0.7,
  heartLoss: 0.6,
} as const;

type SfxKey = 'vineSwing' | 'coinPickup' | 'levelVictory' | 'heartLoss';

const SFX_FILES: Record<SfxKey, string> = {
  vineSwing: 'vine_swing.mp3',
  coinPickup: 'coin_pickup.mp3',
  levelVictory: 'level_complete.mp3',
  heartLoss: 'heart_loss.mp3',
};

class SoundManager {
  private howls: Partial<Record<keyof typeof VOLUMES, Howl>> = {};
  private isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private isUnlocked: boolean = false;

  // Web Audio synth fallback, used only when a sample fails to load/decode.
  private ctx: AudioContext | null = null;

  private initContext() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  /**
   * Unlocks the audio engine on the first user gesture to satisfy browser
   * autoplay policies, then starts the ambient loop if not muted.
   */
  public unlockOnFirstInteraction() {
    if (this.isUnlocked || typeof window === 'undefined') return;
    this.isUnlocked = true;
    this.initContext();
    try {
      const howlerCtx = (Howler as any).ctx as AudioContext | undefined;
      if (howlerCtx && howlerCtx.state === 'suspended') {
        howlerCtx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('Howler unlock skipped:', e);
    }
    if (!this.isMuted) this.startAmbient();
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  private buildHowl(key: keyof typeof VOLUMES, file: string, loop = false): Howl {
    return new Howl({
      src: [`${SOUND_BASE}/${file}`],
      volume: VOLUMES[key],
      loop,
      html5: false,
      preload: true,
      // Autoplay/unlock guard: degrade to synth instead of throwing.
      onloaderror: () => this.fallbackSynth(key),
      onplayerror: () => this.fallbackSynth(key),
    });
  }

  private getHowl(key: SfxKey): Howl {
    if (!this.howls[key]) {
      this.howls[key] = this.buildHowl(key, SFX_FILES[key]);
    }
    return this.howls[key]!;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    if (this.howls.ambient) {
      this.howls.ambient.volume(this.isMuted ? 0 : VOLUMES.ambient);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Continuous jungle ambience loop (soft breeze + distant bird chirps).
   */
  public startAmbient() {
    // Defer until the first user gesture unlocks audio (browser autoplay policy).
    if (typeof window === 'undefined' || this.isMuted || !this.isUnlocked) return;
    if (!this.howls.ambient) {
      this.howls.ambient = this.buildHowl('ambient', 'jungle_ambient.mp3', true);
    }
    if (!this.isAmbientPlaying) {
      this.howls.ambient.play();
      this.isAmbientPlaying = true;
    }
  }

  public stopAmbient() {
    if (this.howls.ambient) {
      this.howls.ambient.stop();
    }
    this.isAmbientPlaying = false;
  }

  private playSample(key: SfxKey) {
    if (this.isMuted) return;
    try {
      this.getHowl(key).play();
    } catch (e) {
      // Audio playback skipped safely
    }
  }

  private fallbackSynth(key: keyof typeof VOLUMES) {
    if (key === 'ambient') return; // Missing ambience degrades to silence.
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = key === 'heartLoss' ? 140 : key === 'coinPickup' ? 990 : 520;
      osc.type = key === 'heartLoss' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.5), t + 0.18);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      // Audio playback skipped safely
    }
  }

  /** Vine swing / step click on 3D level drums. */
  public playVineSwing() {
    this.playSample('vineSwing');
  }

  /** Spark coin reward chime. */
  public playCoinPickup() {
    this.playSample('coinPickup');
  }

  /** Heart loss / electrical fault thud. */
  public playHeartLoss() {
    this.playSample('heartLoss');
  }

  /** Level complete victory fanfare. */
  public playLevelVictory() {
    this.playSample('levelVictory');
  }
}

export const soundManager = new SoundManager();
