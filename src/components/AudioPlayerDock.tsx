import React, { useEffect, useState, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Sparkles, Disc, ListMusic, ChevronUp, Music2, Sliders
} from 'lucide-react';
import { soundEngine, AUDIO_TRACKS, AudioTrack } from '../services/audioPlayer';
import { AudioVisualizer, VisualizerTheme } from './AudioVisualizer';

interface AudioPlayerDockProps {
  onOpenAiStudio: () => void;
}

export const AudioPlayerDock: React.FC<AudioPlayerDockProps> = ({ onOpenAiStudio }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(soundEngine.getCurrentTrack());
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showTrackList, setShowTrackList] = useState(false);
  const [vizTheme, setVizTheme] = useState<VisualizerTheme>('pink');
  const trackListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    soundEngine.setListener((playing, _trackTitle, trackObj) => {
      setIsPlaying(playing);
      if (trackObj) {
        setCurrentTrack(trackObj);
      }
    });

    // Close track list on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (trackListRef.current && !trackListRef.current.contains(e.target as Node)) {
        setShowTrackList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    soundEngine.toggle();
  };

  const handleNext = () => {
    soundEngine.nextTrack();
  };

  const handlePrev = () => {
    soundEngine.prevTrack();
  };

  const handleSelectTrack = (track: AudioTrack) => {
    soundEngine.selectTrackById(track.id);
    if (!isPlaying) {
      soundEngine.resume();
    }
    setShowTrackList(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      soundEngine.setVolume(0);
    } else {
      setIsMuted(false);
      soundEngine.setVolume(val);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      soundEngine.setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      soundEngine.setVolume(0);
    }
  };

  return (
    <>
      {/* Track Selection Drop-Up Menu */}
      {showTrackList && (
        <div 
          ref={trackListRef}
          className="fixed bottom-20 left-4 sm:left-8 z-40 w-80 sm:w-96 bg-[#101018]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-[#ff2a6d]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Soundtrack Library</h3>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">{AUDIO_TRACKS.length} Tracks</span>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {AUDIO_TRACKS.map((t) => {
              const isSelected = t.id === currentTrack.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTrack(t)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#ff2a6d]/20 border border-[#ff2a6d]/40 text-white' 
                      : 'hover:bg-white/5 border border-transparent text-neutral-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">{t.title}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 text-[8px] font-bold text-[#ff2a6d] bg-[#ff2a6d]/20 rounded">
                          PLAYING
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">{t.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-medium text-neutral-300 bg-white/5 rounded border border-white/5">
                      {t.bpm} BPM
                    </span>
                    <p className="text-[9px] text-[#ff2a6d] font-semibold mt-0.5">{t.genre}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Persistent Audio Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/10 px-3 sm:px-6 py-2.5 transition-transform">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Track Info & Quick Switch Drop-Up Button */}
          <div className="flex items-center gap-3 min-w-0 flex-1 max-w-[280px] sm:max-w-xs">
            <button
              onClick={() => setShowTrackList(!showTrackList)}
              className={`relative w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-[#ff2a6d]/60 transition-colors group ${
                isPlaying ? 'shadow-[0_0_12px_rgba(255,42,109,0.35)]' : ''
              }`}
              title="Click to change soundtrack"
            >
              <Disc className={`w-5 h-5 text-[#ff2a6d] group-hover:scale-110 transition-transform ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ChevronUp className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span 
                  onClick={() => setShowTrackList(!showTrackList)}
                  className="text-xs font-semibold text-white truncate cursor-pointer hover:text-[#ff2a6d] transition-colors"
                  title="Click to change soundtrack"
                >
                  {currentTrack.title}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#ff2a6d] bg-[#ff2a6d]/15 border border-[#ff2a6d]/30 rounded shrink-0">
                  VIDEO AUDIO • {currentTrack.bpm} BPM
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-neutral-400 truncate">
                  AI Video Soundtrack • {currentTrack.genre}
                </p>
                <button
                  onClick={() => setShowTrackList(!showTrackList)}
                  className="text-[9px] text-[#ff2a6d] hover:underline font-semibold cursor-pointer shrink-0 hidden sm:inline"
                >
                  Change Audio
                </button>
              </div>
            </div>
          </div>

          {/* Center: Controls + Web Audio API AudioVisualizer Frequency Bars */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Previous Track */}
            <button
              onClick={handlePrev}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Previous Track"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={handleToggle}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white flex items-center justify-center shadow-lg shadow-[#ff2a6d]/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              aria-label={isPlaying ? 'Pause track' : 'Play track'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={handleNext}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Next Track"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Real-time Reactive Frequency Bars using Web Audio API */}
            <div className="hidden md:flex items-center">
              <AudioVisualizer 
                barCount={22}
                height={32}
                theme={vizTheme}
                showPeaks={true}
                interactive={true}
                onThemeChange={setVizTheme}
                className="w-44 lg:w-56"
              />
            </div>
          </div>

          {/* Right: Soundtrack Selector Trigger, Volume & AI Video link */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-[280px]">
            {/* Soundtrack Selector Pill */}
            <button
              onClick={() => setShowTrackList(!showTrackList)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
              title="Browse sound library"
            >
              <ListMusic className="w-3.5 h-3.5 text-[#ff2a6d]" />
              <span>Tracks</span>
            </button>

            {/* AI Video trigger button */}
            <button
              onClick={onOpenAiStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#ff2a6d] to-purple-600 hover:from-[#ff1a5d] hover:to-purple-500 text-white rounded-xl transition-all shadow-md shadow-[#ff2a6d]/20 hover:scale-102 active:scale-98 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Video Experience</span>
              <span className="sm:hidden">AI Video</span>
            </button>

            {/* Volume Control with Mute */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-white/10">
              <button
                onClick={toggleMute}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff2a6d]"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

