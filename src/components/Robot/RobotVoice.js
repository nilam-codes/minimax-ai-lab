/**
 * MINI ROBOT AUDIO ENGINE — Web Speech API & Web Audio Synthesizer
 * 100% self-contained with ZERO external audio files. Guaranteed offline seminar reliability.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Cache loaded voices
let cachedVoices = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

let activeSpeechTimer = null;

export const RobotAudio = {
  voiceEnabled: true,
  sfxEnabled: true,

  /**
   * Selects the most friendly, clear English voice dynamically
   */
  getBestVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prefer cheerful, clear English voices
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google US English') ||
          v.name.includes('Jenny') ||
          v.name.includes('Zira') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen'))
    ) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0];

    return preferred;
  },

  /**
   * Speak a line using Web Speech Synthesis with cute robotic tuning
   * Returns a Promise that resolves when speech completes, and triggers onEnd callback.
   */
  speak(text, { pitch = 1.28, rate = 0.96, onEnd } = {}) {
    return new Promise((resolve) => {
      let isDone = false;
      const handleFinish = () => {
        if (isDone) return;
        isDone = true;
        if (activeSpeechTimer) {
          clearTimeout(activeSpeechTimer);
          activeSpeechTimer = null;
        }
        if (onEnd) onEnd();
        resolve();
      };

      // If voice is disabled or speechSynthesis is unavailable:
      if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        // Fallback delay so subtitles can be read before next action
        const fallbackDelay = Math.min(1600, Math.max(650, text.length * 40));
        activeSpeechTimer = setTimeout(handleFinish, fallbackDelay);
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Stop prior utterance

        // Play subtle electronic start chirp if SFX is enabled
        if (this.sfxEnabled) {
          this.playSfx('chirp');
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = pitch; // Slightly elevated for cute robotic personality
        utterance.rate = rate;   // Measured, cheerful speaking rate
        utterance.volume = 1.0;

        const voice = this.getBestVoice();
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = () => handleFinish();
        utterance.onerror = () => handleFinish();

        // Safety timeout to prevent browser speech synthesis hangs
        const maxDuration = Math.max(1400, text.length * 95);
        activeSpeechTimer = setTimeout(handleFinish, maxDuration);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis unavailable, using fallback:', e);
        handleFinish();
      }
    });
  },

  /**
   * Immediately cancel any active speech
   */
  stopSpeaking() {
    if (activeSpeechTimer) {
      clearTimeout(activeSpeechTimer);
      activeSpeechTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  },

  /**
   * Synthesize real-time futuristic sound effects using Web Audio API
   */
  playSfx(type) {
    if (!this.sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    try {
      if (type === 'click' || type === 'chirp') {
        // Cute robotic chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'think' || type === 'scan') {
        // Soft digital scanner warble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(460, now);
        osc.frequency.linearRampToValueAtTime(680, now + 0.07);
        osc.frequency.linearRampToValueAtTime(900, now + 0.14);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'draw' || type === 'scribble') {
        // High-tech digital stylus drawing stroke sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.15);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.32);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'optimal' || type === 'fanfare') {
        // Glorious futuristic victory chord: Major triad arpeggio
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0.15, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.35);
        });
      } else if (type === 'execute') {
        // Energetic laser energy beam whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'loss') {
        // Adorable sad descending minor chime
        [440, 370, 293].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.12, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.3);
        });
      } else if (type === 'draw-game') {
        // Friendly warm two-tone chime
        [523.25, 659.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.14);

          gain.gain.setValueAtTime(0.14, now + idx * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.14);
          osc.stop(now + idx * 0.14 + 0.35);
        });
      }
    } catch (e) {
      // AudioContext policy fallback
    }
  },
};
