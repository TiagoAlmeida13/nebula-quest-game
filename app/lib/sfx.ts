// Efeitos sonoros e trilha chiptune gerados por código via Web Audio API,
// sem depender de nenhum arquivo de áudio externo.

type NoteEvent = { freq: number; duration: number };

const MUSIC_SEQUENCE: NoteEvent[] = [
  { freq: 220, duration: 0.18 },
  { freq: 261.63, duration: 0.18 },
  { freq: 329.63, duration: 0.18 },
  { freq: 261.63, duration: 0.18 },
  { freq: 220, duration: 0.18 },
  { freq: 196, duration: 0.18 },
  { freq: 220, duration: 0.36 },
  { freq: 293.66, duration: 0.18 },
  { freq: 349.23, duration: 0.18 },
  { freq: 293.66, duration: 0.18 },
  { freq: 246.94, duration: 0.18 },
  { freq: 220, duration: 0.36 },
];

export class SFX {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicStep = 0;
  private muted = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  // precisa ser chamado a partir de um gesto do usuário (tecla ou clique),
  // por causa da política de autoplay dos navegadores
  unlock() {
    const ctx = this.getContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.musicGain) {
      this.musicGain.gain.value = muted ? 0 : 0.05;
    }
  }

  isMuted() {
    return this.muted;
  }

  private beep(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    freqSlideTo?: number
  ) {
    if (this.muted) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freqSlideTo) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(freqSlideTo, 1),
        ctx.currentTime + duration
      );
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  shoot() {
    this.beep(880, 0.08, "square", 0.05, 660);
  }

  enemyExplode() {
    this.beep(180, 0.25, "sawtooth", 0.08, 40);
  }

  bossExplode() {
    this.beep(140, 0.5, "sawtooth", 0.12, 30);
  }

  crystalPickup() {
    this.beep(660, 0.1, "triangle", 0.06, 990);
  }

  shieldBlock() {
    this.beep(440, 0.15, "sine", 0.08, 220);
  }

  playerHit() {
    this.beep(120, 0.4, "sawtooth", 0.1, 40);
  }

  win() {
    this.beep(523.25, 0.15, "square", 0.08);
    setTimeout(() => this.beep(659.25, 0.15, "square", 0.08), 150);
    setTimeout(() => this.beep(783.99, 0.3, "square", 0.08), 300);
  }

  startMusic() {
    if (this.musicTimer) return;
    const ctx = this.getContext();
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = this.muted ? 0 : 0.05;
    this.musicGain.connect(ctx.destination);

    this.musicStep = 0;
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const note = MUSIC_SEQUENCE[this.musicStep % MUSIC_SEQUENCE.length];
      this.playMusicNote(note.freq, note.duration);
      this.musicStep++;
    }, 200);
  }

  private playMusicNote(freq: number, duration: number) {
    if (!this.musicGain) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = freq;

    noteGain.gain.setValueAtTime(1, ctx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}