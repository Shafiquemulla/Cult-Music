import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  RotateCcw, Sparkles, Film, Disc, Activity, Zap, Camera, 
  Sliders, Gauge, ChevronRight, Video, Flame
} from 'lucide-react';
import { soundEngine } from '../services/audioPlayer';
import { AudioVisualizer } from './AudioVisualizer';

// Import AI-generated stunt and hip-hop dance imagery
import bmxSunsetImg from '../assets/images/bmx_stunt_rider_1790435388365.jpg';
import hiphopFreezeImg from '../assets/images/hiphop_street_dance_1790435405381.jpg';
import bmxNightImg from '../assets/images/bmx_night_stunt_1790435419495.jpg';
import hiphopCrewImg from '../assets/images/hiphop_dance_crew_1790435431981.jpg';

export interface AiVideoScene {
  id: string;
  category: 'bmx' | 'hiphop';
  title: string;
  subtitle: string;
  image: string;
  trick: string;
  difficulty: string;
  airTime: string;
  bpm: string;
  trackName: string;
  description: string;
  tags: string[];
}

const AI_SCENES: AiVideoScene[] = [
  {
    id: 'bmx-1',
    category: 'bmx',
    title: 'BMX Sunset Aerial 360 Barspin',
    subtitle: 'Extreme Skatepark Bowl Vert Stunt',
    image: bmxSunsetImg,
    trick: '360 Barspin to Tailwhip',
    difficulty: 'Pro Level 9.8',
    airTime: '2.14s Air Time',
    bpm: '128',
    trackName: 'Asphalt Odyssey (BMX Stunt Cut)',
    description: 'High-altitude vertical launch defying gravity with mid-air handlebar spin and tailwhip frame catch over the concrete deep bowl.',
    tags: ['BMX Cycle', 'Aerial Stunt', 'Barspin', 'Vert Ramp']
  },
  {
    id: 'hiphop-1',
    category: 'hiphop',
    title: 'Underground Hip-Hop Freeze & Popping',
    subtitle: 'Street Cipher Power Move & B-Boy Battle',
    image: hiphopFreezeImg,
    trick: 'One-Arm Air Chair Freeze',
    difficulty: 'Master Breaker',
    airTime: '104 BPM Groove',
    bpm: '104',
    trackName: 'Concrete Cipher (Boom Bap Beat)',
    description: 'Explosive one-hand floor balance freeze against glowing boombox bass with cheering street dance crew hyping the underground battle.',
    tags: ['Hip-Hop Dance', 'Breakdance', 'Air Chair Freeze', 'Cipher']
  },
  {
    id: 'bmx-2',
    category: 'bmx',
    title: 'Midnight Vert Superman & Rail Grind',
    subtitle: 'Neon City Street Stunt Session',
    image: bmxNightImg,
    trick: 'Superman Grab over Handrail Gap',
    difficulty: 'Extreme X-Games',
    airTime: '2.40s Hang Time',
    bpm: '135',
    trackName: 'Neon Overdrive (Electro Bass)',
    description: 'Rider fully extends legs off pedals mid-air over a 15-stair handrail gap under neon cyberpunk city floodlights.',
    tags: ['BMX Cycle', 'Superman Grab', 'Street Stunts', 'Night Session']
  },
  {
    id: 'hiphop-2',
    category: 'hiphop',
    title: 'Hip-Hop Windmill Crew Power Battle',
    subtitle: 'Warehouse B-Boy & B-Girl Championship',
    image: hiphopCrewImg,
    trick: 'Continuous Windmills to Headspin',
    difficulty: 'Elite Power Move',
    airTime: '112 BPM Flow',
    bpm: '112',
    trackName: 'Subway Break (Funky Breakbeat)',
    description: 'Fluid, high-velocity ground windmills transitioning into a spinning headfreeze surrounded by hyped dancers and smoke flares.',
    tags: ['Hip-Hop Dance', 'Windmill Spin', 'Street Battle', 'Crew Jam']
  },
];

export const HomeVideoPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [cameraMode, setCameraMode] = useState<'cinematic' | 'slowmo' | 'stuntcam'>('cinematic');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(120); // 2 minutes AI loop
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'bmx' | 'hiphop'>('all');

  // AI Prompt Generation simulation
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeOffsetRef = useRef<number>(0);

  const activeScene = AI_SCENES[activeSceneIndex];

  // Filter scenes by category
  const filteredScenes = activeTab === 'all' 
    ? AI_SCENES 
    : AI_SCENES.filter(s => s.category === activeTab);

  // Play / Pause toggle
  const togglePlay = () => {
    if (isPlaying) {
      soundEngine.pause();
      setIsPlaying(false);
    } else {
      soundEngine.playTrack(activeScene.trackName, activeScene.bpm);
      setIsPlaying(true);
    }
  };

  // Switch Scene
  const selectScene = (scene: AiVideoScene) => {
    const idx = AI_SCENES.findIndex(s => s.id === scene.id);
    if (idx !== -1) {
      setActiveSceneIndex(idx);
      setCurrentTime(idx * 30);
      if (isPlaying) {
        soundEngine.playTrack(scene.trackName, scene.bpm);
      }
    }
  };

  // Switch to next scene
  const nextScene = () => {
    const nextIdx = (activeSceneIndex + 1) % AI_SCENES.length;
    setActiveSceneIndex(nextIdx);
    if (isPlaying) {
      soundEngine.playTrack(AI_SCENES[nextIdx].trackName, AI_SCENES[nextIdx].bpm);
    }
  };

  // Switch to previous scene
  const prevScene = () => {
    const prevIdx = (activeSceneIndex - 1 + AI_SCENES.length) % AI_SCENES.length;
    setActiveSceneIndex(prevIdx);
    if (isPlaying) {
      soundEngine.playTrack(AI_SCENES[prevIdx].trackName, AI_SCENES[prevIdx].bpm);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Auto-progress timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.2 * playbackSpeed;
        if (next >= duration) {
          return 0;
        }
        // Auto-switch scenes every 30 seconds
        const sceneIdx = Math.floor(next / 30) % AI_SCENES.length;
        if (sceneIdx !== activeSceneIndex) {
          setActiveSceneIndex(sceneIdx);
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, duration, activeSceneIndex]);

  // Pause audio when unmounting so audio only plays on video and not other pages
  useEffect(() => {
    return () => {
      soundEngine.pause();
    };
  }, []);

  // AI Prompt Generator simulation
  const handleGenerateCustomScene = (promptText?: string) => {
    const textToUse = promptText || aiPrompt || 'BMX cycle backflip over fire pit';
    setIsGeneratingAi(true);
    setAiStatusMessage(`Synthesizing AI Video: "${textToUse}"...`);

    setTimeout(() => {
      setAiStatusMessage('Rendering neural motion vectors & stunt physics...');
    }, 900);

    setTimeout(() => {
      setAiStatusMessage('Synchronizing audio beat drops...');
    }, 1800);

    setTimeout(() => {
      setIsGeneratingAi(false);
      setAiStatusMessage(null);
      // Toggle between BMX and Hip-Hop
      if (textToUse.toLowerCase().includes('dance') || textToUse.toLowerCase().includes('hiphop') || textToUse.toLowerCase().includes('break')) {
        setActiveSceneIndex(1);
      } else {
        setActiveSceneIndex(0);
      }
      if (!isPlaying) {
        setIsPlaying(true);
        soundEngine.playTrack(activeScene.trackName, activeScene.bpm);
      }
    }, 2600);
  };

  // Canvas visual effects & particle sync loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const render = () => {
      const w = (canvas.width = canvas.parentElement?.clientWidth || 960);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 540);

      ctx.clearRect(0, 0, w, h);

      const freqData = soundEngine.getVisualizerData();
      const bass = (freqData[0] || 10) / 255;
      const mid = (freqData[4] || 15) / 255;

      if (isPlaying) {
        t += 0.04 * playbackSpeed;
        timeOffsetRef.current = t;
      } else {
        t = timeOffsetRef.current;
      }

      // Camera shake on heavy bass hit
      const shakeX = isPlaying && bass > 0.4 ? (Math.random() - 0.5) * 6 * bass : 0;
      const shakeY = isPlaying && bass > 0.4 ? (Math.random() - 0.5) * 6 * bass : 0;

      // 1. Neon Stunt Rim Glow & Flash
      if (isPlaying && bass > 0.35) {
        ctx.strokeStyle = activeScene.category === 'bmx' 
          ? `rgba(255, 42, 109, ${bass * 0.4})` 
          : `rgba(0, 242, 254, ${bass * 0.4})`;
        ctx.lineWidth = 6 * bass;
        ctx.strokeRect(10, 10, w - 20, h - 20);
      }

      // 2. Dynamic Speed Lines / Stunt Sparks
      if (isPlaying) {
        const numSparks = activeScene.category === 'bmx' ? 14 : 8;
        for (let i = 0; i < numSparks; i++) {
          const sparkX = ((i * 120 + t * 400 * playbackSpeed) % w);
          const sparkY = (h * 0.3) + Math.sin(t * 3 + i) * (h * 0.35);
          const sparkLength = 15 + bass * 35;

          ctx.strokeStyle = activeScene.category === 'bmx' ? 'rgba(255, 220, 100, 0.8)' : 'rgba(255, 42, 109, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sparkX, sparkY);
          ctx.lineTo(sparkX + (activeScene.category === 'bmx' ? sparkLength : Math.cos(i) * sparkLength), sparkY + (Math.sin(i) * 5));
          ctx.stroke();
        }
      }

      // 3. Audio Equalizer Waveform overlay on the bottom
      if (isPlaying) {
        const barWidth = w / 32;
        for (let i = 0; i < 32; i++) {
          const val = freqData[i % freqData.length] || 10;
          const barH = (val / 255) * 60;
          const x = i * barWidth;
          const y = h - barH;

          ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 42, 109, 0.35)' : 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(x, y, barWidth - 2, barH);
        }
      }

      // 4. Subtle film scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, activeScene]);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
      ref={containerRef} 
      className="bg-[#0b0b10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative select-none"
    >
      {/* Top Bar: Scene Mode & Filter Tabs */}
      <div className="bg-[#12121a] px-4 sm:px-6 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#ff2a6d]/20 border border-[#ff2a6d]/40 rounded-lg text-xs font-mono text-[#ff2a6d] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ff2a6d] animate-ping" />
            <span>AI VIDEO // 4K 60FPS</span>
          </div>

          <span className="hidden sm:inline text-xs font-semibold text-neutral-300">
            {activeScene.title}
          </span>
        </div>

        {/* Category Filters: All, BMX Stunts, Hip-Hop Dance */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-[#ff2a6d] text-white shadow-sm' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Action
          </button>
          <button
            onClick={() => {
              setActiveTab('bmx');
              const firstBmx = AI_SCENES.find(s => s.category === 'bmx');
              if (firstBmx) selectScene(firstBmx);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'bmx' 
                ? 'bg-[#ff2a6d] text-white shadow-sm' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>BMX Stunt Rider</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('hiphop');
              const firstHiphop = AI_SCENES.find(s => s.category === 'hiphop');
              if (firstHiphop) selectScene(firstHiphop);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'hiphop' 
                ? 'bg-[#ff2a6d] text-white shadow-sm' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Hip-Hop Dance</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative aspect-[16/9] w-full bg-black overflow-hidden group">
        
        {/* Animated AI Video Background Image (Ken Burns & Motion Simulation) */}
        <img
          src={activeScene.image}
          alt={activeScene.title}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isPlaying 
              ? (cameraMode === 'slowmo' 
                  ? 'scale-110 translate-y-1' 
                  : cameraMode === 'stuntcam' 
                    ? 'scale-120 -translate-x-2' 
                    : 'scale-105') 
              : 'scale-100'
          }`}
          style={{
            filter: isPlaying ? 'contrast(1.08) saturate(1.15) brightness(1.02)' : 'brightness(0.85)',
            transformOrigin: activeScene.category === 'bmx' ? 'center 40%' : 'center 60%',
          }}
        />

        {/* Interactive Vignette and Gradient Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />

        {/* Real-Time Interactive Canvas FX Layer (Lasers, Sparks, EQ) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* AI Generating Overlay */}
        {isGeneratingAi && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full border-4 border-[#ff2a6d]/30 border-t-[#ff2a6d] animate-spin mb-4 shadow-[0_0_25px_#ff2a6d]" />
            <h3 className="text-xl font-bold font-display text-white mb-2">
              GENERATING AI VIDEO SCENE
            </h3>
            <p className="text-xs font-mono text-[#ff2a6d] animate-pulse">
              {aiStatusMessage || 'Synthesizing neural frame sequences...'}
            </p>
          </div>
        )}

        {/* Top Overlay: Live Telemetry & HUD */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between pointer-events-none">
          {/* Left: Stunt / Dance Telemetry */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl text-white text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
              <span className="font-bold text-[#ff2a6d]">{activeScene.category === 'bmx' ? 'BMX STUNT TELEMETRY' : 'HIP-HOP DANCE FLOW'}</span>
              <span className="text-neutral-500">|</span>
              <span>{activeScene.trick}</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-300">
              <span className="px-2 py-0.5 bg-black/60 backdrop-blur rounded border border-white/5">
                {activeScene.airTime}
              </span>
              <span className="px-2 py-0.5 bg-black/60 backdrop-blur rounded border border-white/5">
                {activeScene.difficulty}
              </span>
              <span className="px-2 py-0.5 bg-black/60 backdrop-blur rounded border border-white/5 text-rose-300">
                {activeScene.bpm} BPM BEAT
              </span>
            </div>
          </div>

          {/* Right: Camera Mode Switcher (Interactive) */}
          <div className="pointer-events-auto flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setCameraMode('cinematic')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-colors cursor-pointer ${
                cameraMode === 'cinematic' ? 'bg-[#ff2a6d] text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Wide Angle Cinematic Track"
            >
              Wide Stunt
            </button>
            <button
              onClick={() => setCameraMode('slowmo')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-colors cursor-pointer ${
                cameraMode === 'slowmo' ? 'bg-[#ff2a6d] text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Action Zoom Slow-Motion"
            >
              Slow-Mo
            </button>
            <button
              onClick={() => setCameraMode('stuntcam')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-colors cursor-pointer ${
                cameraMode === 'stuntcam' ? 'bg-[#ff2a6d] text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Rider/B-Boy Dynamic Follow Cam"
            >
              Action POV
            </button>
          </div>
        </div>

        {/* Center: Big Play Button (when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white flex items-center justify-center shadow-[0_0_35px_rgba(255,42,109,0.8)] hover:scale-110 active:scale-95 transition-all cursor-pointer group hover-sheen"
              aria-label="Play AI Video"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Overlay: Current Scene Title & Description */}
        <div className="absolute bottom-16 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#ff2a6d] text-white text-[10px] font-mono font-bold rounded uppercase">
                {activeScene.category === 'bmx' ? 'Rider Stunt Cam' : 'Hip-Hop Breakdance'}
              </span>
              <span className="text-xs text-neutral-300 font-mono">
                Audio Sync: {activeScene.trackName}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white drop-shadow-md">
              {activeScene.title}
            </h3>
            <p className="text-xs text-neutral-300 line-clamp-2 mt-0.5 drop-shadow">
              {activeScene.description}
            </p>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={prevScene}
              className="px-3 py-1.5 bg-black/60 hover:bg-[#ff2a6d] text-white rounded-xl border border-white/10 text-xs font-mono transition-all cursor-pointer"
            >
              ◀ Prev Stunt
            </button>
            <button
              onClick={nextScene}
              className="px-3 py-1.5 bg-black/60 hover:bg-[#ff2a6d] text-white rounded-xl border border-white/10 text-xs font-mono transition-all cursor-pointer"
            >
              Next Scene ▶
            </button>
          </div>
        </div>

        {/* Bottom Video Progress Scrub Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-6">
          <div 
            className="w-full h-2 bg-white/20 hover:h-3 rounded-full overflow-hidden cursor-pointer transition-all relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              setCurrentTime(ratio * duration);
            }}
          >
            <div 
              className="h-full bg-gradient-to-r from-[#ff2a6d] to-purple-500 shadow-[0_0_12px_#ff2a6d]"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Controls Strip */}
          <div className="flex items-center justify-between mt-3 text-neutral-300 text-xs font-mono">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-1.5 bg-white/10 hover:bg-[#ff2a6d] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={() => {
                  if (isMuted) {
                    soundEngine.setVolume(0.8);
                    setIsMuted(false);
                  } else {
                    soundEngine.setVolume(0);
                    setIsMuted(true);
                  }
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="text-neutral-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Embedded AudioVisualizer */}
              <div className="hidden md:flex items-center pl-2 border-l border-white/10">
                <AudioVisualizer 
                  barCount={14} 
                  height={20} 
                  theme={activeScene.category === 'bmx' ? 'pink' : 'cyan'} 
                  showPeaks={false}
                  interactive={false}
                  className="w-28"
                />
              </div>
            </div>

            {/* Playback Speed Controls (0.5x, 1x, 1.5x) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-500 uppercase mr-1 hidden sm:inline">Speed:</span>
              {([0.5, 1, 1.5] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                    playbackSpeed === spd 
                      ? 'bg-[#ff2a6d] text-white font-bold' 
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {spd}x {spd === 0.5 ? 'Slow-Mo' : ''}
                </button>
              ))}

              <button
                onClick={toggleFullscreen}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg ml-2 transition-colors cursor-pointer"
                title="Fullscreen Toggle"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Scene Thumbnails & Quick Switcher */}
      <div className="p-4 sm:p-6 bg-[#0e0e14] border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-neutral-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-[#ff2a6d]" />
            <span>SELECT AI STUNT & HIP-HOP SCENE ({filteredScenes.length} Clips)</span>
          </span>
          <span className="text-[11px] text-[#ff2a6d] font-mono">
            Synced with Live Audio Engine
          </span>
        </div>

        {/* Scene Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredScenes.map((scene) => {
            const isCurrent = AI_SCENES[activeSceneIndex].id === scene.id;
            return (
              <div
                key={scene.id}
                onClick={() => selectScene(scene)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center group relative overflow-hidden ${
                  isCurrent
                    ? 'bg-white/10 border-[#ff2a6d] shadow-[0_0_15px_rgba(255,42,109,0.35)] -translate-y-1'
                    : 'bg-[#14141e] border-white/5 hover:border-white/20 hover:bg-[#181824]'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-900">
                  <img
                    src={scene.image}
                    alt={scene.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${isCurrent ? 'bg-[#ff2a6d]' : 'bg-black/60 group-hover:bg-[#ff2a6d]'} transition-colors`}>
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                      scene.category === 'bmx' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {scene.category === 'bmx' ? 'BMX' : 'HIPHOP'}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {scene.bpm} BPM
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-rose-300 transition-colors">
                    {scene.title}
                  </h4>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {scene.trick}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Video Prompt Generator Studio Section */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter prompt (e.g., 'Rider stunting on BMX cycle over mega ramp' or 'Hip-hop dance battle in Tokyo street')..."
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateCustomScene();
                }}
              />
            </div>

            <button
              onClick={() => handleGenerateCustomScene()}
              disabled={isGeneratingAi}
              className="px-5 py-2.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#ff2a6d]/25 hover-glow-pink cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? 'Synthesizing...' : 'Generate AI Video Clip'}</span>
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-neutral-400">
            <span className="font-mono text-neutral-500">Quick AI Prompts:</span>
            {[
              'BMX cycle backflip & 360 tailwhip stunt',
              'Hip-hop breaker windmill & power move cipher',
              'Rider stunting on BMX cycle on neon halfpipe',
              'Underground street dance popping battle'
            ].map((promptText) => (
              <button
                key={promptText}
                onClick={() => {
                  setAiPrompt(promptText);
                  handleGenerateCustomScene(promptText);
                }}
                className="px-2.5 py-1 bg-white/5 hover:bg-[#ff2a6d]/20 hover:text-rose-300 border border-white/5 hover:border-[#ff2a6d]/40 rounded-lg text-neutral-300 text-[10px] font-mono transition-all cursor-pointer"
              >
                + {promptText}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
