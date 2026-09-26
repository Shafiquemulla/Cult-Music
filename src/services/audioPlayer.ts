// Web Audio API Synthesizer & Audio Engine with Multi-Track BMX & Hip-Hop Soundscapes

export interface AudioTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  artist: string;
  style: 'bmx' | 'hiphop' | 'synthwave' | 'breakbeat' | 'drill' | 'lofi';
  description: string;
  key: string;
}

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'bmx-vert',
    title: 'Asphalt Odyssey (BMX Stunt Cut)',
    genre: 'BMX Trap & Bass',
    bpm: 132,
    artist: 'DJ Vertigo & Krew-91',
    style: 'bmx',
    description: 'Heavy 808 sub-bass glides, rapid trap hats, and punchy kick for high-flying skatepark vert ramps.',
    key: 'F Minor'
  },
  {
    id: 'hiphop-boom',
    title: 'Concrete Cipher (Boom Bap Beat)',
    genre: 'Classic Boom-Bap',
    bpm: 92,
    artist: 'The Urban B-Boy Crew',
    style: 'hiphop',
    description: 'Crisp MPC vinyl snare, warm acoustic thumping kick, groovy walking bass, and mellow Rhodes jazz chords.',
    key: 'C Minor'
  },
  {
    id: 'bmx-night',
    title: 'Neon Overdrive (Electro Bass)',
    genre: 'Cyberpunk Synthwave',
    bpm: 128,
    artist: 'Street Glitcher',
    style: 'synthwave',
    description: 'Pumping four-on-the-floor kick, arpeggiated sawtooth synth, and filtered acid bass for midnight rail grinds.',
    key: 'A Minor'
  },
  {
    id: 'hiphop-break',
    title: 'Subway Break (Funky Breakbeat)',
    genre: 'Breakbeat & B-Boy Funk',
    bpm: 116,
    artist: 'Underground Rhythm Union',
    style: 'breakbeat',
    description: 'Syncopated funk breaks, snappy rim claps, and energetic basslines tailored for continuous windmill spins.',
    key: 'D Minor'
  },
  {
    id: 'drill-flow',
    title: 'Underground Drill Flow',
    genre: 'UK/NY 808 Drill',
    bpm: 140,
    artist: 'Asphalt Syndicate',
    style: 'drill',
    description: 'Sliding 808 pitch glides, triplet hi-hat rolls, syncopated claps, and haunting minor arpeggios.',
    key: 'G Minor'
  },
  {
    id: 'sunset-ride',
    title: 'Golden Hour BMX Cruise',
    genre: 'Lo-Fi Chill & Cruise',
    bpm: 98,
    artist: 'Velodrome Chillout',
    style: 'lofi',
    description: 'Warm tape saturation, vinyl crackle resonance, mellow electric keys, and relaxed chill riding groove.',
    key: 'E Flat'
  }
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timer: any = null;
  private currentTrackIndex: number = 0;
  private tempo: number = 132;
  private step: number = 0;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private volume: number = 0.8;
  private dataArray: Uint8Array | null = null;
  private onStateChange: ((isPlaying: boolean, track: string, trackObj?: AudioTrack) => void) | null = null;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(14000, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Connect graph: nodes -> filterNode -> analyser -> masterGain -> destination
      this.filterNode.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Generate 2 seconds of pink/white noise buffer for realistic snares & hi-hats
      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getTracks(): AudioTrack[] {
    return AUDIO_TRACKS;
  }

  public getCurrentTrack(): AudioTrack {
    return AUDIO_TRACKS[this.currentTrackIndex] || AUDIO_TRACKS[0];
  }

  public getAudioContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setListener(cb: (isPlaying: boolean, track: string, trackObj?: AudioTrack) => void) {
    this.onStateChange = cb;
  }

  public selectTrackById(id: string) {
    const idx = AUDIO_TRACKS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.setTrackIndex(idx);
    }
  }

  public nextTrack() {
    const nextIdx = (this.currentTrackIndex + 1) % AUDIO_TRACKS.length;
    this.setTrackIndex(nextIdx);
  }

  public prevTrack() {
    const prevIdx = (this.currentTrackIndex - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length;
    this.setTrackIndex(prevIdx);
  }

  private setTrackIndex(idx: number) {
    this.currentTrackIndex = idx;
    const track = AUDIO_TRACKS[idx];
    this.tempo = track.bpm;
    this.step = 0;
    if (this.isPlaying) {
      this.restartTimer();
    }
    this.onStateChange?.(this.isPlaying, track.title, track);
  }

  public playTrack(title: string, bpm?: string) {
    this.initContext();
    
    // Check if title matches one of our tracks
    const matchedIdx = AUDIO_TRACKS.findIndex(
      (t) => t.title.toLowerCase().includes(title.toLowerCase()) || 
             title.toLowerCase().includes(t.title.toLowerCase()) ||
             t.id === title
    );

    if (matchedIdx !== -1) {
      this.currentTrackIndex = matchedIdx;
      this.tempo = AUDIO_TRACKS[matchedIdx].bpm;
    } else {
      if (bpm) {
        this.tempo = parseInt(bpm, 10) || 120;
      }
    }

    const currentTrack = this.getCurrentTrack();
    this.isPlaying = true;
    this.onStateChange?.(true, currentTrack.title, currentTrack);

    this.step = 0;
    this.restartTimer();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const currentTrack = this.getCurrentTrack();
    this.onStateChange?.(false, currentTrack.title, currentTrack);
  }

  public resume() {
    this.initContext();
    this.isPlaying = true;
    const currentTrack = this.getCurrentTrack();
    this.tempo = currentTrack.bpm;
    this.onStateChange?.(true, currentTrack.title, currentTrack);
    this.restartTimer();
  }

  public toggle(title?: string, bpm?: string) {
    if (title && title !== this.getCurrentTrack().title) {
      this.playTrack(title, bpm);
      return;
    }

    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private restartTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    const interval = (60 / this.tempo / 4) * 1000;
    this.timer = setInterval(() => this.tick(), interval);
  }

  private tick() {
    if (!this.ctx || !this.filterNode) return;

    const s = this.step % 16;
    const now = this.ctx.currentTime;
    const currentTrack = this.getCurrentTrack();
    const style = currentTrack.style;

    // Pattern orchestration based on style
    switch (style) {
      case 'bmx':
        // Fast, aggressive trap beat: heavy 808 sub, hi-hat rolls, hard clap
        if (s === 0 || s === 7 || s === 10) {
          this.play808Kick(now, 52, 0.45);
        }
        if (s === 4 || s === 12) {
          this.playSnareTrap(now);
        }
        // Rolling trap hi-hats with occasional 32nd note rolls
        if (s % 2 === 0 || s === 11 || s === 15) {
          this.playHiHat(now, s % 4 === 0 ? 0.08 : 0.04, 9000);
        }
        // Synth Brass Stab
        if (s === 0 || s === 3 || s === 6 || s === 12) {
          const notes = [130.81, 155.56, 174.61, 196.0]; // C3, Eb3, F3, G3
          this.playSynthBrass(now, notes[s % notes.length]);
        }
        break;

      case 'hiphop':
        // Boom-Bap groove: swung 90s hip-hop kick & acoustic snare crack
        if (s === 0 || s === 2 || s === 8 || s === 11) {
          this.playBoomBapKick(now);
        }
        if (s === 4 || s === 12) {
          this.playBoomBapSnare(now);
        }
        // Swung off-beat hats with vinyl feel
        if (s % 2 === 0) {
          this.playHiHat(now, s % 4 === 2 ? 0.07 : 0.03, 7500);
        }
        // Warm jazz Rhodes electric piano chords
        if (s === 0 || s === 8) {
          this.playJazzKeys(now, s === 0 ? [130.81, 164.81, 196.0, 246.94] : [110.0, 146.83, 174.61, 220.0]);
        }
        // Funky walking bass
        if (s % 2 === 0) {
          const bass = [65.41, 65.41, 77.78, 87.31, 65.41, 58.27, 73.42, 65.41];
          this.playBass(now, bass[(s / 2) % bass.length], 0.28, 'triangle');
        }
        break;

      case 'synthwave':
        // Pumping 4-on-the-floor electro synthwave
        if (s % 4 === 0) {
          this.playElectroKick(now);
        }
        if (s === 4 || s === 12) {
          this.playElectroSnare(now);
        }
        // Driving 16th hats
        this.playHiHat(now, s % 4 === 2 ? 0.06 : 0.02, 10000);
        // Arpeggiated 16th sawtooth synth
        {
          const arpNotes = [220.0, 261.63, 329.63, 440.0, 329.63, 261.63, 196.0, 293.66];
          this.playSynthLead(now, arpNotes[s % arpNotes.length]);
        }
        // Pumping sidechain bass
        if (s % 2 === 1) {
          this.playBass(now, 55.0, 0.22, 'sawtooth');
        }
        break;

      case 'breakbeat':
        // Funky B-Boy breakbeat: syncopated kicks & snappy acoustic breaks
        if (s === 0 || s === 3 || s === 6 || s === 10) {
          this.playBoomBapKick(now);
        }
        if (s === 4 || s === 12 || s === 15) {
          this.playSnareTrap(now);
        }
        if (s % 2 === 0 || s === 7 || s === 13) {
          this.playHiHat(now, 0.05, 8500);
        }
        if (s === 2 || s === 8 || s === 14) {
          this.playBass(now, 73.42, 0.2, 'square');
        }
        break;

      case 'drill':
        // 808 Drill with pitch sliding bass & offset claps
        if (s === 0 || s === 6 || s === 9) {
          this.playSliding808(now, 46.25, 61.74);
        }
        if (s === 4 || s === 12) {
          this.playSnareTrap(now);
        }
        // Triplet drill hi-hats
        this.playHiHat(now, (s === 2 || s === 5 || s === 11) ? 0.08 : 0.03, 11000);
        if (s === 0 || s === 8) {
          this.playSynthBrass(now, 174.61);
        }
        break;

      case 'lofi':
      default:
        // Relaxed chill groove
        if (s === 0 || s === 7 || s === 10) {
          this.playBoomBapKick(now);
        }
        if (s === 4 || s === 12) {
          this.playBoomBapSnare(now);
        }
        if (s % 2 === 0) {
          this.playHiHat(now, 0.03, 6000);
        }
        if (s === 0 || s === 8) {
          this.playJazzKeys(now, [155.56, 196.0, 233.08]);
        }
        break;
    }

    this.step++;
  }

  // Instrument Synthesizers

  private play808Kick(time: number, startFreq = 160, decay = 0.35) {
    if (!this.ctx || !this.filterNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);
    osc.frequency.exponentialRampToValueAtTime(32, time + decay);

    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + decay);
  }

  private playBoomBapKick(time: number) {
    if (!this.ctx || !this.filterNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.08);

    gain.gain.setValueAtTime(0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private playElectroKick(time: number) {
    if (!this.ctx || !this.filterNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.07);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playSnareTrap(time: number) {
    if (!this.ctx || !this.filterNode) return;
    // Tonal snap + noise rattle
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.07);

    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + 0.12);

    // Noise component
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1200, time);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.filterNode);

      noise.start(time);
      noise.stop(time + 0.18);
    }
  }

  private playBoomBapSnare(time: number) {
    if (!this.ctx || !this.filterNode) return;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(85, time + 0.06);

    oscGain.gain.setValueAtTime(0.45, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(oscGain);
    oscGain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + 0.14);

    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2200, time);
      noiseFilter.Q.setValueAtTime(1.0, time);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.38, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.19);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.filterNode);

      noise.start(time);
      noise.stop(time + 0.19);
    }
  }

  private playElectroSnare(time: number) {
    if (!this.ctx || !this.filterNode) return;
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      noise.connect(noiseGain);
      noiseGain.connect(this.filterNode);
      noise.start(time);
      noise.stop(time + 0.15);
    }
  }

  private playHiHat(time: number, volume: number, freq = 9000) {
    if (!this.ctx || !this.filterNode) return;
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(freq, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.filterNode);

      noise.start(time);
      noise.stop(time + 0.05);
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }

  private playBass(time: number, freq: number, decay = 0.28, type: OscillatorType = 'sawtooth') {
    if (!this.ctx || !this.filterNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + decay);
  }

  private playSliding808(time: number, startFreq: number, targetFreq: number) {
    if (!this.ctx || !this.filterNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.linearRampToValueAtTime(targetFreq, time + 0.16);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + 0.4);
  }

  private playSynthBrass(time: number, freq: number) {
    if (!this.ctx || !this.filterNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.16, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  private playSynthLead(time: number, freq: number) {
    if (!this.ctx || !this.filterNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  private playJazzKeys(time: number, freqs: number[]) {
    if (!this.ctx || !this.filterNode) return;
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain);
      gain.connect(this.filterNode!);

      osc.start(time);
      osc.stop(time + 0.35);
    });
  }

  public getByteFrequencyData(targetArray?: Uint8Array): Uint8Array {
    if (!this.analyser) {
      return targetArray || new Uint8Array(32).fill(0);
    }
    const arr = targetArray || this.dataArray || new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(arr as any);
    return arr;
  }

  public getVisualizerData(bins: number = 16): number[] {
    if (!this.analyser || !this.dataArray) {
      return Array(bins).fill(4);
    }
    this.analyser.getByteFrequencyData(this.dataArray as any);
    const result: number[] = [];
    const step = Math.max(1, Math.floor(this.dataArray.length / bins));
    for (let i = 0; i < bins; i++) {
      const val = this.dataArray[Math.min(i * step, this.dataArray.length - 1)] || 0;
      result.push(val);
    }
    return result;
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTrackTitle: this.getCurrentTrack().title,
      currentTrack: this.getCurrentTrack(),
      tempo: this.tempo
    };
  }
}

export const soundEngine = new AudioEngine();

