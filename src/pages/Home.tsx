import React, { useRef } from 'react';
import { ArrowRight, Play, Sparkles, MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { Artist, EventItem } from '../types';
import { HomeVideoPlayer } from '../components/HomeVideoPlayer';
import heroImage from '../assets/images/cultmusic_hero_crowd_1790433606263.jpg';

interface HomeProps {
  artists: Artist[];
  events: EventItem[];
  onNavigate: (tab: string) => void;
  onSelectArtist: (artist: Artist) => void;
  onSelectEvent: (event: EventItem) => void;
  onOpenAiShowreel: () => void;
  onPlayTrack: (title: string, bpm?: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  artists,
  events,
  onNavigate,
  onSelectArtist,
  onSelectEvent,
  onOpenAiShowreel,
  onPlayTrack
}) => {
  const featuredArtists = artists.filter(a => a.featured).slice(0, 4);
  const upcomingEvents = events.slice(0, 3);
  const videoSectionRef = useRef<HTMLDivElement | null>(null);

  const quickServices = [
    { num: '01', title: 'TALENT MANAGEMENT', id: 'services' },
    { num: '02', title: 'LIVE MUSIC MANAGEMENT', id: 'services' },
    { num: '03', title: 'ARTIST COMMUNITY', id: 'services' },
    { num: '04', title: 'EVENTS & EXPERIENCES', id: 'services' },
  ];

  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden border-b border-white/5">
        
        {/* Background Image with dark vignette and gradient scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="CULTMUSIC Festival Crowd"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/70 to-[#08080a]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider text-rose-400">
                <span className="w-2 h-2 rounded-full bg-[#ff2a6d] animate-ping" />
                <span>UNDERGROUND MOVEMENT</span>
              </div>

              {/* Bold Hero Typography matching exact mockup */}
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-display tracking-tight leading-[0.95]">
                MUSIC<br />
                <span className="text-[#ff2a6d]">PEOPLE</span><br />
                <span className="text-[#ff2a6d]">CULTURE</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 max-w-xl font-normal leading-relaxed">
                Connecting artists, events and communities to build a stronger music culture.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('artists')}
                  className="px-6 py-3.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-[#ff2a6d]/25 hover-sheen hover-glow-pink flex items-center gap-2 cursor-pointer group"
                >
                  <span>Explore Artists</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>

                <button
                  onClick={scrollToVideo}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase rounded-xl border border-white/10 hover:border-[#ff2a6d]/50 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer group hover:shadow-[0_0_15px_rgba(255,42,109,0.3)] hover:-translate-y-0.5"
                >
                  <div className="w-6 h-6 rounded-full bg-[#ff2a6d] flex items-center justify-center text-white group-hover:scale-120 group-hover:shadow-[0_0_12px_#ff2a6d] transition-all">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <span>Watch AI Video (BMX & Hip-Hop)</span>
                </button>
              </div>
            </div>

            {/* Right Side Ethos Pillar Tags (matching mockup) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col items-end justify-center space-y-4 text-right">
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 space-y-3 hover:border-white/15 transition-all">
                {['MUSIC', 'ART', 'SPORT', 'COMMUNITY', 'BEYOND BORDERS'].map((pillar, idx) => (
                  <div key={pillar} className="text-xs font-mono font-bold tracking-widest text-neutral-400 hover:text-[#ff2a6d] hover:translate-x-1 hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.6)] transition-all cursor-default">
                    0{idx + 1} // {pillar}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FOUR NUMBERED QUICK SERVICE CARDS (matching mockup panel 1) */}
      <section className="border-b border-white/5 bg-[#0a0a0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickServices.map((card) => (
              <div
                key={card.num}
                onClick={() => onNavigate(card.id)}
                className="group p-5 bg-[#101016] hover-card-neon border border-white/5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <span className="text-xs font-mono text-neutral-500 group-hover:text-[#ff2a6d] transition-colors">
                  {card.num}
                </span>
                <div className="mt-6 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white tracking-wider group-hover:text-rose-400 group-hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.3)] transition-all uppercase">
                    {card.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#ff2a6d] group-hover:translate-x-1.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. GOOD MUSIC BETTER PEOPLE BANNER & LIVE AI VIDEO PLAYER */}
      <section ref={videoSectionRef} id="home-video-player" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-neutral-950 via-[#120a14] to-neutral-950 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff2a6d] block mb-1">
                AI Video Showcase // Action & Culture
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight uppercase">
                BMX Cycle Stunts & Hip-Hop Dance
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
                Watch AI-synthesized action footage of extreme BMX cycle riders performing 360 barspins, aerial halfpipe vert stunts, and underground hip-hop breakdance cipher battles.
              </p>
            </div>

            <button
              onClick={onOpenAiShowreel}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-xl border border-white/10 hover:border-[#ff2a6d]/50 hover:shadow-[0_0_12px_rgba(255,42,109,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff2a6d]" />
              <span>Open AI Director Studio</span>
            </button>
          </div>

          {/* Embedded On-Page AI Video Player */}
          <div className="w-full">
            <HomeVideoPlayer />
          </div>
        </div>
      </section>

      {/* 4. FEATURED ARTISTS (matching mockup) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff2a6d] block mb-1">
              Curated Roster
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              FEATURED ARTISTS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('artists')}
            className="text-xs font-semibold tracking-wider text-neutral-400 hover:text-[#ff2a6d] hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.5)] transition-all flex items-center gap-1 cursor-pointer group"
          >
            <span>VIEW ALL ARTISTS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => onSelectArtist(artist)}
              className="group bg-[#101016] border border-white/5 hover-card-neon rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                <img
                  src={artist.image}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover-zoom-img"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-neutral-300 border border-white/10 group-hover:border-[#ff2a6d]/40 group-hover:text-white transition-all">
                  {artist.badge}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-400 group-hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.4)] transition-all">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">
                    {artist.role}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono text-[11px]">{artist.category}</span>
                  <span className="text-[#ff2a6d] font-semibold group-hover:translate-x-1.5 transition-transform">
                    Explore Profile →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. UPCOMING EVENTS (matching mockup) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff2a6d] block mb-1">
              Live Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              UPCOMING EVENTS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-semibold tracking-wider text-neutral-400 hover:text-[#ff2a6d] hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.5)] transition-all flex items-center gap-1 cursor-pointer group"
          >
            <span>VIEW ALL EVENTS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="group bg-[#101016] border border-white/5 hover-card-neon rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] bg-neutral-900 overflow-hidden">
                <img
                  src={evt.image}
                  alt={evt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover-zoom-img"
                />
                
                {/* Date Badge */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 group-hover:border-[#ff2a6d]/60 group-hover:shadow-[0_0_12px_rgba(255,42,109,0.4)] rounded-xl px-2.5 py-1 text-center transition-all">
                  <span className="block text-sm font-bold text-white leading-none">{evt.day}</span>
                  <span className="block text-[9px] font-mono text-[#ff2a6d] font-semibold">{evt.month}</span>
                </div>

                <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-neutral-300">
                  {evt.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-400 group-hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.4)] transition-all">
                    {evt.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono text-[11px]">{evt.price}</span>
                  <span className="font-semibold text-[#ff2a6d] group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                    <span>View & RSVP</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
