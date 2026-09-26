import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundEngine } from '../services/audioPlayer';
import { Sparkles, Activity, Palette } from 'lucide-react';

export type VisualizerTheme = 'pink' | 'cyan' | 'sunset' | 'matrix' | 'violet';
export type VisualizerMode = 'bars' | 'mirrored' | 'wave';

export interface AudioVisualizerProps {
  className?: string;
  barCount?: number;
  height?: number;
  theme?: VisualizerTheme;
  mode?: VisualizerMode;
  showPeaks?: boolean;
  interactive?: boolean;
  onThemeChange?: (theme: VisualizerTheme) => void;
}

const THEME_GRADIENTS: Record<VisualizerTheme, { top: string; mid: string; bottom: string; glow: string; name: string }> = {
  pink: {
    top: '#ff0055',
    mid: '#ff2a6d',
    bottom: '#7928ca',
    glow: 'rgba(255, 42, 109, 0.45)',
    name: 'Cyber Pink'
  },
  cyan: {
    top: '#00f2fe',
    mid: '#05d9e8',
    bottom: '#0056fd',
    glow: 'rgba(5, 217, 232, 0.45)',
    name: 'Neon Cyan'
  },
  sunset: {
    top: '#ff7700',
    mid: '#ffaa00',
    bottom: '#ff0055',
    glow: 'rgba(255, 170, 0, 0.45)',
    name: 'Solar Flare'
  },
  matrix: {
    top: '#00ff88',
    mid: '#10b981',
    bottom: '#047857',
    glow: 'rgba(16, 185, 129, 0.45)',
    name: 'Acid Lime'
  },
  violet: {
    top: '#d946ef',
    mid: '#a855f7',
    bottom: '#6366f1',
    glow: 'rgba(168, 85, 247, 0.45)',
    name: 'Hyper Violet'
  }
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  className = '',
  barCount = 20,
  height = 32,
  theme: controlledTheme,
  mode: initialMode = 'bars',
  showPeaks = true,
  interactive = true,
  onThemeChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [internalTheme, setInternalTheme] = useState<VisualizerTheme>(controlledTheme || 'pink');
  const [currentMode, setCurrentMode] = useState<VisualizerMode>(initialMode);
  const [isHovered, setIsHovered] = useState(false);
  const [peakDb, setPeakDb] = useState<number>(-36);

  const activeTheme = controlledTheme || internalTheme;
  const peaksRef = useRef<number[]>([]);
  const peakDecayRef = useRef<number[]>([]);
  const animFrameId = useRef<number | null>(null);

  // Initialize peak tracker arrays
  useEffect(() => {
    peaksRef.current = new Array(barCount).fill(0);
    peakDecayRef.current = new Array(barCount).fill(0);
  }, [barCount]);

  const cycleTheme = useCallback(() => {
    if (!interactive) return;
    const themes: VisualizerTheme[] = ['pink', 'cyan', 'sunset', 'matrix', 'violet'];
    const currentIdx = themes.indexOf(activeTheme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    setInternalTheme(nextTheme);
    onThemeChange?.(nextTheme);
  }, [activeTheme, interactive, onThemeChange]);

  const cycleMode = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive) return;
    const modes: VisualizerMode[] = ['bars', 'mirrored', 'wave'];
    const currentIdx = modes.indexOf(currentMode);
    setCurrentMode(modes[(currentIdx + 1) % modes.length]);
  }, [currentMode, interactive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let idlePhase = 0;
    const rawDataArray = new Uint8Array(64);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const targetHeight = height;

      if (width === 0 || targetHeight === 0) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      // Sync canvas dimensions with DPR
      if (canvas.width !== width * dpr || canvas.height !== targetHeight * dpr) {
        canvas.width = width * dpr;
        canvas.height = targetHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, targetHeight);

      // Analyze Web Audio API
      const status = soundEngine.getStatus();
      const isPlaying = status.isPlaying;
      soundEngine.getByteFrequencyData(rawDataArray);

      // Compute musical frequency bands with logarithmic / perceptually-weighted grouping
      const bands: number[] = [];
      const numBars = barCount;
      const themeColors = THEME_GRADIENTS[activeTheme];

      let maxEnergy = 0;

      if (isPlaying) {
        for (let i = 0; i < numBars; i++) {
          // Logarithmic binning: lower bars get closer frequencies (bass / sub), upper bars get wide presence
          const p = i / (numBars - 1);
          // Scale from bin 1 to bin 48
          const lowBin = Math.floor(Math.pow(p, 1.8) * 32);
          const highBin = Math.min(63, lowBin + Math.max(1, Math.floor(p * 5)));
          
          let sum = 0;
          let count = 0;
          for (let b = lowBin; b <= highBin; b++) {
            sum += rawDataArray[b] || 0;
            count++;
          }
          const avg = count > 0 ? sum / count : 0;
          // Apply slight high-frequency boost to balance visual spectrum
          const boost = 1 + p * 0.7;
          const weightedVal = Math.min(255, avg * boost);
          bands.push(weightedVal);

          if (weightedVal > maxEnergy) maxEnergy = weightedVal;
        }
      } else {
        // Idle gentle waveform pulse when audio is paused
        idlePhase += 0.04;
        for (let i = 0; i < numBars; i++) {
          const wave = Math.sin(idlePhase + (i * 0.35)) * 0.5 + 0.5;
          const ambientHeight = 12 + wave * 18;
          bands.push(ambientHeight);
        }
      }

      // Update peak dB readout
      if (isPlaying) {
        const db = Math.round(-48 + (maxEnergy / 255) * 48);
        setPeakDb(db);
      } else {
        setPeakDb(-48);
      }

      // Create linear color gradient for frequency bars
      const barGrad = ctx.createLinearGradient(0, targetHeight, 0, 0);
      barGrad.addColorStop(0, themeColors.bottom);
      barGrad.addColorStop(0.5, themeColors.mid);
      barGrad.addColorStop(1, themeColors.top);

      if (currentMode === 'wave') {
        // Waveform / Oscilloscope line view
        ctx.beginPath();
        const sliceWidth = width / (numBars - 1);
        for (let i = 0; i < numBars; i++) {
          const val = bands[i] / 255;
          const y = targetHeight - val * (targetHeight - 4) - 2;
          const x = i * sliceWidth;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (i - 1) * sliceWidth;
            const prevVal = bands[i - 1] / 255;
            const prevY = targetHeight - prevVal * (targetHeight - 4) - 2;
            const cX = (prevX + x) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cX, (prevY + y) / 2);
          }
        }
        ctx.strokeStyle = barGrad;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = themeColors.glow;
        ctx.shadowBlur = 10;
        ctx.stroke();
      } else if (currentMode === 'mirrored') {
        // Symmetric Mirrored Center-Out DJ EQ
        const totalSpacing = 2;
        const barWidth = Math.max(2, (width - (numBars - 1) * totalSpacing) / numBars);
        const centerY = targetHeight / 2;

        for (let i = 0; i < numBars; i++) {
          // Map index symmetrically from center
          const distFromCenter = Math.abs(i - (numBars - 1) / 2) / (numBars / 2);
          const mappedIdx = Math.floor((1 - distFromCenter) * (numBars - 1));
          const val = bands[mappedIdx] || 0;
          const barHeight = Math.max(3, (val / 255) * (centerY - 2));

          const x = i * (barWidth + totalSpacing);

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, [barWidth / 2]);
          ctx.fill();
        }
      } else {
        // Standard Frequency Spectrum Bars with Peak-Hold Caps
        const totalSpacing = 2.5;
        const barWidth = Math.max(2, (width - (numBars - 1) * totalSpacing) / numBars);

        for (let i = 0; i < numBars; i++) {
          const val = bands[i] || 0;
          const normVal = Math.min(1, val / 255);
          const minH = 3;
          const barH = Math.max(minH, normVal * (targetHeight - 4));
          const x = i * (barWidth + totalSpacing);
          const y = targetHeight - barH;

          // Peak hold logic
          if (showPeaks) {
            if (barH >= (peaksRef.current[i] || 0)) {
              peaksRef.current[i] = barH;
              peakDecayRef.current[i] = 0;
            } else {
              peakDecayRef.current[i] = (peakDecayRef.current[i] || 0) + 0.18;
              peaksRef.current[i] = Math.max(minH, peaksRef.current[i] - peakDecayRef.current[i]);
            }
          }

          // Draw main reactive frequency bar
          ctx.fillStyle = barGrad;
          ctx.shadowColor = isPlaying ? themeColors.glow : 'transparent';
          ctx.shadowBlur = isPlaying ? 6 : 0;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, [barWidth / 2, barWidth / 2, 1, 1]);
          ctx.fill();

          // Draw Peak Hold Cap
          if (showPeaks && isPlaying) {
            const peakY = targetHeight - (peaksRef.current[i] || 0) - 2;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 4;
            ctx.fillRect(x, Math.max(0, peakY), barWidth, 1.5);
          }
        }
      }

      ctx.restore();
      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [activeTheme, barCount, currentMode, height, showPeaks]);

  return (
    <div
      className={`relative group flex items-center gap-2 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={interactive ? `AudioVisualizer (${THEME_GRADIENTS[activeTheme].name}) • Click to cycle neon theme • Mode: ${currentMode}` : 'AudioVisualizer'}
    >
      {/* Canvas Spectrum Display */}
      <div 
        onClick={cycleTheme}
        className={`relative rounded-xl p-1.5 bg-black/40 backdrop-blur-sm border transition-all duration-300 ${
          isHovered ? 'border-white/30 bg-black/60 shadow-lg cursor-pointer' : 'border-white/10'
        }`}
        style={{
          boxShadow: isHovered ? `0 0 16px ${THEME_GRADIENTS[activeTheme].glow}` : 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ height: `${height}px` }}
        />

        {/* Live dB meter / mode chip overlay on hover */}
        {interactive && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#12121a] border border-white/15 text-[10px] font-mono text-white/90 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap flex items-center gap-1.5 z-40">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME_GRADIENTS[activeTheme].mid }} />
            <span>{THEME_GRADIENTS[activeTheme].name}</span>
            <span className="text-white/40">|</span>
            <span className="text-emerald-400 font-bold">{peakDb > -45 ? `${peakDb} dB` : 'IDLE'}</span>
          </div>
        )}
      </div>

      {/* Mini Interactive Controls when hovered */}
      {interactive && (
        <div className="hidden lg:flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={cycleTheme}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Switch Neon Color Theme"
            aria-label="Switch Neon Color Theme"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={cycleMode}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={`Mode: ${currentMode} (Click to switch to ${currentMode === 'bars' ? 'mirrored' : currentMode === 'mirrored' ? 'wave' : 'bars'})`}
            aria-label="Switch Visualizer Mode"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
