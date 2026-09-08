/**
 * Audio Module
 * Generates typewriter key click sounds using Web Audio API
 * Soft volume, slight pitch variation, mute support, no overlap
 */

export class TypewriterAudio {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;

  private static readonly VOLUME = 0.25;
  private static readonly BASE_PITCH = 800;

  /**
   * Initialize audio context (must be called after user interaction)
   */
  private initAudio(): void {
    if (!this.audioContext) {
      const AudioContextClass = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  /**
   * Check if sound should play
   */
  private canPlay(): boolean {
    return !this.isPlaying;
  }

  /**
   * Play a typewriter key click sound
   * Creates a short percussive sound with noise burst and high-frequency click
   */
  public play(pitch: number = TypewriterAudio.BASE_PITCH): void {
    // Check if already playing (no overlap)
    if (!this.canPlay()) {
      return;
    }

    // Initialize audio on first user interaction
    if (!this.audioContext) {
      this.initAudio();
    }

    if (!this.audioContext) {
      return; // Audio not supported
    }

    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlaying = true;

    const now = this.audioContext.currentTime;
    const duration = 0.05; // 50ms click

    // Slight pitch variation (±10%)
    const pitchVariation = pitch * (0.9 + Math.random() * 0.2);

    // Create noise buffer for the mechanical sound
    const bufferSize = Math.floor(this.audioContext.sampleRate * duration);
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // White noise with exponential decay envelope
      const t = i / this.audioContext.sampleRate;
      const decay = Math.exp(-t * 80);
      noiseData[i] = (Math.random() * 2 - 1) * decay * 0.6;
    }

    // Create noise source
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // High-pass filter to make it sound more like a key click
    const highpassFilter = this.audioContext.createBiquadFilter();
    highpassFilter.type = 'highpass';
    highpassFilter.frequency.value = 2000;

    // Band-pass filter for the metallic "ting"
    const bandpassFilter = this.audioContext.createBiquadFilter();
    bandpassFilter.type = 'bandpass';
    bandpassFilter.frequency.value = 3500;
    bandpassFilter.Q.value = 1;

    // Create gain node for envelope - softer volume
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(TypewriterAudio.VOLUME, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Create oscillator for the high-frequency click
    const clickOscillator = this.audioContext.createOscillator();
    clickOscillator.type = 'square';
    clickOscillator.frequency.setValueAtTime(pitchVariation * 5, now);
    clickOscillator.frequency.exponentialRampToValueAtTime(pitchVariation * 2.5, now + 0.02);

    // Click envelope - softer
    const clickGain = this.audioContext.createGain();
    clickGain.gain.setValueAtTime(TypewriterAudio.VOLUME * 0.6, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    // Create a second oscillator for body/mechanism sound
    const bodyOscillator = this.audioContext.createOscillator();
    bodyOscillator.type = 'triangle';
    bodyOscillator.frequency.setValueAtTime(pitchVariation * 0.5, now);
    bodyOscillator.frequency.exponentialRampToValueAtTime(pitchVariation * 0.25, now + 0.04);

    const bodyGain = this.audioContext.createGain();
    bodyGain.gain.setValueAtTime(TypewriterAudio.VOLUME * 0.8, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    // Connect noise path
    noiseSource
      .connect(highpassFilter)
      .connect(bandpassFilter)
      .connect(noiseGain)
      .connect(this.audioContext.destination);

    // Connect click oscillator
    clickOscillator
      .connect(clickGain)
      .connect(this.audioContext.destination);

    // Connect body oscillator
    bodyOscillator
      .connect(bodyGain)
      .connect(this.audioContext.destination);

    // Start all sources
    noiseSource.start(now);
    clickOscillator.start(now);
    bodyOscillator.start(now);

    // Stop all sources
    noiseSource.stop(now + duration);
    clickOscillator.stop(now + 0.03);
    bodyOscillator.stop(now + 0.04);

    // Reset playing flag after duration
    setTimeout(() => {
      this.isPlaying = false;
    }, duration * 1000);
  }

  /**
   * Clean up audio context
   */
  public dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}