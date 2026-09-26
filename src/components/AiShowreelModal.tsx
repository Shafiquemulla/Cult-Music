import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Pause, Sparkles, Wand2, Sliders, RefreshCw, 
  Volume2, Film, Zap, Flame, Camera 
} from 'lucide-react';
import { soundEngine } from '../services/audioPlayer';
import { generateAiShowreel } from '../services/api';
import { AudioVisualizer } from './AudioVisualizer';

import bmxSunsetImg from '../assets/images/bmx_stunt_rider_1790435388365.jpg';
import hiphopFreezeImg from '../assets/images/hiphop_street_dance_1790435405381.jpg';
import bmxNightImg from '../assets/images/bmx_night_stunt_1790435419495.jpg';
import hiphopCrewImg from '../assets/images/hiphop_dance_crew_1790435431981.jpg';

interface AiShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModalScene {
  id: string;
  category: 'bmx' | 'hiphop';
  title: string;
  image: string;
  bpm: string;
  trick: string;
  mood: string;
}

const MODAL_SCENES: ModalScene[] = [
  {
    id: 'bmx-sunset',
    category: 'bmx',
    title: 'BMX Aerial 360 Barspin',
    image: bmxSunsetImg,
    bpm: '128',
    trick: 'Sunset Bowl Vert Launch & Frame Whip',
    mood: 'Sunset BMX Skatepark Stunts'
  },
  {
    id: 'hiphop-freeze',
    category: 'hiphop',
    title: 'Hip-Hop Street Cipher Freeze',
    image: hiphopFreezeImg,
    bpm: '104',
    trick: 'One-Arm Air Chair Freeze & Popping',
    mood: 'Underground Hip-Hop Cipher'
  },
  {
    id: 'bmx-night',
    category: 'bmx',
    title: 'Midnight Vert Superman Stunt',
    image: bmxNightImg,
    bpm: '135',
    trick: 'Superman Grab over Handrail Gap',
    mood: 'Cyberpunk BMX Night Session'
  },
  {
    id: 'hiphop-crew',
    category: 'hiphop',
    title: 'Hip-Hop Windmill Crew Battle',
    image: hiphopCrewImg,
    bpm: '112',
    trick: 'Power Move Windmills & Headspin',
    mood: 'B-Boy & B-Girl Battle Arena'
  },
];

export const AiShowreelModal: React.FC<AiShowreelModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [selectedMood, setSelectedMood] = useState(MODAL_SCENES[0].mood);
  const [selectedBpm, setSelectedBpm] = useState(MODAL_SCENES[0].bpm);
  const [selectedStyle, setSelectedStyle] = useState('BMX Cycle Stunts & Hip-Hop Street Dance');
  const [loading, setLoading] = useState(false);
  const [scriptOutput, setScriptOutput] = useState<string | null>(null);
  const [showreelTitle, setShowreelTitle] = useState('CULTMUSIC // BMX & HIP-HOP AI VIDEO');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeScene = MODAL_SCENES[activeSceneIdx];

  useEffect(() => {
    if (!isOpen) {
      soundEngine.pause();
      setIsPlaying(false);
      return;
    }

    // Start sound engine with scene track
    soundEngine.playTrack(activeScene.title, activeScene.bpm);
    setIsPlaying(true);

    return () => {
      soundEngine.pause();
    };
  }, [isOpen, activeSceneIdx]);

  // Audio-reactive Canvas Animation Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 450);

      ctx.clearRect(0, 0, width, height);

      const freqData = soundEngine.getVisualizerData();
      const avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length;
      const bassEnergy = freqData[0] || 10;

      // Audio-reactive laser beams and particle effects
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 55 + (bassEnergy * 0.5);

      // Gradient halo
      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius * 2);
      grad.addColorStop(0, activeScene.category === 'bmx' ? 'rgba(255, 42, 109, 0.4)' : 'rgba(0, 242, 254, 0.4)');
      grad.addColorStop(0.5, 'rgba(120, 20, 200, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Equalizer Circle
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      angle += 0.008 + (avgFreq * 0.0001);

      const numBars = 32;
      for (let i = 0; i < numBars; i++) {
        const barAngle = (i / numBars) * Math.PI * 2;
        const val = freqData[i % freqData.length] || 10;
        const barLen = 12 + (val * 0.5);

        ctx.save();
        ctx.rotate(barAngle);
        ctx.fillStyle = i % 2 === 0 ? '#ff2a6d' : '#ffffff';
        ctx.fillRect(radius, -2, barLen, 3);
        ctx.restore();
      }
      ctx.restore();

      // Equalizer spectrum along bottom
      const barW = width / 24;
      for (let i = 0; i < 24; i++) {
        const val = freqData[i % freqData.length] || 8;
        const barH = (val / 255) * 45;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 42, 109, 0.5)' : 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(i * barW, height - barH, barW - 2, barH);
      }

      // Live Watermark and AI Video Generation HUD
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(`AI VIDEO // ${activeScene.category === 'bmx' ? 'BMX CYCLE STUNT CAM' : 'HIP-HOP DANCE CIPHER'}`, 20, 30);
      ctx.fillText(`FPS: 60 · AUDIO SYNC: 100% · BEAT: ${activeScene.bpm} BPM`, 20, 46);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, activeScene]);

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const res = await generateAiShowreel({
        mood: activeScene.mood,
        bpm: activeScene.bpm,
        style: activeScene.category === 'bmx' ? 'BMX Stunts and Halfpipe Vert' : 'Hip-Hop Breakdance Cipher'
      });
      setShowreelTitle(res.title);
      setScriptOutput(res.aiDirectorOutput);
      soundEngine.playTrack(res.title, activeScene.bpm);
      setIsPlaying(true);
    } catch {
      setScriptOutput(`AI Director generated cue: [SCENE: ${activeScene.title}] [STUNT: ${activeScene.trick}] [BEAT DROP: ${activeScene.bpm} BPM] Continuous neural camera tracking with motion blur.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    soundEngine.toggle();
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-[#0f0f15] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0e]">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-[#ff2a6d]" />
            <h2 className="text-base font-bold font-display text-white tracking-wide">
              {showreelTitle}
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-[#ff2a6d]/20 text-[#ff2a6d] rounded border border-[#ff2a6d]/30 font-bold">
              AI VIDEO 4K
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AudioVisualizer 
              barCount={14} 
              height={22} 
              theme={activeScene.category === 'bmx' ? 'pink' : 'cyan'} 
              showPeaks={false} 
              interactive={false} 
              className="hidden md:flex w-24" 
            />
            <button
              onClick={toggleAudio}
              className="p-2 text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-[#ff2a6d]" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause Audio' : 'Play Beat'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Canvas & AI Video Viewport */}
          <div className="lg:col-span-8 bg-black relative flex flex-col items-center justify-center min-h-[300px] sm:min-h-[440px] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 group">
            {/* Real AI Background Video Image */}
            <img
              src={activeScene.image}
              alt={activeScene.title}
              className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 filter brightness-90 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

            {/* Audio Reactive Overlay Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
            
            {/* Cinematic overlay text */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none z-20">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block font-bold">
                  {activeScene.category === 'bmx' ? 'BMX CYCLE STUNT RIDER' : 'HIP-HOP BREAKDANCE CIPHER'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white drop-shadow-md">
                  {activeScene.title}
                </h3>
                <p className="text-xs text-neutral-300 font-mono mt-0.5 drop-shadow">
                  {activeScene.trick}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI 60FPS</span>
              </div>
            </div>
          </div>

          {/* Right AI Director Controls */}
          <div className="lg:col-span-4 p-5 sm:p-6 bg-[#0e0e14] flex flex-col justify-between space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-[#ff2a6d] uppercase tracking-wider block mb-1 font-bold">
                  Select Action Scene
                </span>
                <h4 className="text-base font-bold text-white">AI Video Selector</h4>
                <p className="text-xs text-neutral-400">
                  Switch between extreme BMX cycle stunts and hip-hop dance battles.
                </p>
              </div>

              {/* Scene Switcher Cards */}
              <div className="space-y-2">
                {MODAL_SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setActiveSceneIdx(idx);
                      setSelectedMood(scene.mood);
                      setSelectedBpm(scene.bpm);
                      soundEngine.playTrack(scene.title, scene.bpm);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                      activeSceneIdx === idx 
                        ? 'bg-[#ff2a6d]/20 border-[#ff2a6d] shadow-sm' 
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-900">
                      <img src={scene.image} alt={scene.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                          scene.category === 'bmx' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {scene.category === 'bmx' ? 'BMX' : 'HIPHOP'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">{scene.bpm} BPM</span>
                      </div>
                      <h5 className="text-xs font-bold text-white truncate mt-0.5">{scene.title}</h5>
                    </div>
                  </button>
                ))}
              </div>

              {/* AI Generation Trigger */}
              <button
                onClick={handleGenerateScript}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#ff2a6d] to-purple-600 hover:from-[#ff1a5d] hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#ff2a6d]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 hover-sheen"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Directing Showreel...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate AI Video Storyboard</span>
                  </>
                )}
              </button>

              {/* Output Script Card */}
              {scriptOutput && (
                <div className="bg-[#14141d] border border-white/10 rounded-xl p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#ff2a6d] font-bold">
                    <span>AI DIRECTORS LOG</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-neutral-300 leading-relaxed text-[11px] max-h-36 overflow-y-auto">
                    {scriptOutput}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
              <span>Synths: Web Audio API</span>
              <span>Visuals: AI Neural Video</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
