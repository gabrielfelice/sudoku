// Sound manager for game audio feedback
// Uses Web Audio API with graceful fallback

type SoundType = "select" | "correct" | "error" | "hint";

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    // Initialize sounds lazily on first interaction
    if (typeof window !== "undefined") {
      this.initSounds();
    }
  }

  private initSounds() {
    if (this.initialized) return;

    try {
      // Create minimal sound effects using data URIs (base64 encoded short audio)
      // These are placeholder - in production, use actual sound files

      // For now, we'll use the Web Audio API to generate simple tones
      // This avoids needing external files
      this.initialized = true;
    } catch (error) {
      console.warn("Sound initialization failed:", error);
    }
  }

  private createBeep(
    frequency: number,
    duration: number,
    volume: number = 0.3,
  ): void {
    if (!this.enabled || typeof window === "undefined") return;

    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      // Silently fail if audio is blocked
      console.debug("Audio playback blocked:", error);
    }
  }

  public playSound(type: SoundType) {
    if (!this.enabled) return;

    this.initSounds();

    switch (type) {
      case "select":
        this.createBeep(800, 0.05, 0.2); // Short, high click
        break;
      case "correct":
        this.createBeep(1200, 0.15, 0.25); // Pleasant chime
        break;
      case "error":
        this.createBeep(300, 0.2, 0.2); // Low buzz
        break;
      case "hint":
        this.createBeep(1000, 0.1, 0.2); // Notification
        break;
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
let soundManager: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManager) {
    soundManager = new SoundManager();
  }
  return soundManager;
}

export function playSound(type: SoundType) {
  getSoundManager().playSound(type);
}

export function setSoundEnabled(enabled: boolean) {
  getSoundManager().setEnabled(enabled);
}

export function isSoundEnabled(): boolean {
  return getSoundManager().isEnabled();
}
