import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Calendar, Instagram, Youtube, Twitter, Music, Check, Share2, Sparkles, MapPin, Award } from 'lucide-react';
import { Artist } from '../types';
import { fetchArtistById } from '../services/api';

interface ArtistDetailProps {
  artist?: Artist | null;
  artists?: Artist[];
  onOpenBooking: () => void;
  onOpenAiShowreel: () => void;
  onPlayTrack: (title: string, bpm?: string) => void;
}

export const ArtistDetail: React.FC<ArtistDetailProps> = ({
  artist: propArtist,
  artists = [],
  onOpenBooking,
  onOpenAiShowreel,
  onPlayTrack
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(propArtist || null);
  const [activeTab, setActiveTab] = useState<'ABOUT' | 'GALLERY' | 'EVENTS' | 'MEDIA' | 'COLLABORATIONS'>('ABOUT');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      const found = artists.find(a => a.id === id);
      if (found) setCurrentArtist(found);

      fetchArtistById(id)
        .then((fetched) => {
          if (fetched) setCurrentArtist(fetched);
        })
        .catch((err) => {
          console.error('Failed to load artist from /api/artists/:id:', err);
        });
    } else if (propArtist) {
      setCurrentArtist(propArtist);
    }
  }, [id, propArtist, artists]);

  if (!currentArtist) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold font-display">Loading Artist Profile...</h2>
        <button
          onClick={() => navigate('/artists')}
          className="mt-4 px-4 py-2 bg-white/10 rounded-xl text-xs font-semibold"
        >
          Return to Artists
        </button>
      </div>
    );
  }

  const artist = currentArtist;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <button
            onClick={() => navigate('/artists')}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ARTISTS</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-neutral-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share Profile'}</span>
          </button>
        </div>

        {/* Hero Section (matching mockup panel 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Media Box */}
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl">
            <img
              src={artist.image}
              alt={artist.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-xs font-mono text-[#ff2a6d] border border-[#ff2a6d]/30">
              {artist.badge}
            </div>
          </div>

          {/* Right Profile Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#ff2a6d] uppercase block mb-1">
                {artist.category} ARTIST // {artist.location}
              </span>
              <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
                {artist.name}
              </h1>
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-neutral-400 mt-2 uppercase">
                {artist.role}
              </p>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {artist.bio}
            </p>

            {/* CTAs matching mockup */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenAiShowreel}
                className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#ff2a6d]" />
                <span>WATCH VIDEO</span>
              </button>

              <button
                onClick={onOpenBooking}
                className="px-6 py-3 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-[#ff2a6d]/25 cursor-pointer flex items-center gap-2"
              >
                <span>BOOK FOR EVENT</span>
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* Social channels */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/5 text-neutral-400">
              <span className="text-xs text-neutral-500 font-mono">Connect:</span>
              <a href="#" className="p-2 hover:text-[#ff2a6d] hover:bg-white/5 rounded-lg transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 hover:text-[#ff2a6d] hover:bg-white/5 rounded-lg transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 hover:text-[#ff2a6d] hover:bg-white/5 rounded-lg transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>

        {/* Pull Quote Box (matching mockup panel 4) */}
        <div className="p-8 sm:p-12 bg-gradient-to-r from-[#140a14] via-[#101016] to-[#0a0a0e] border border-white/10 rounded-2xl mb-16 relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-3xl text-[#ff2a6d] font-serif leading-none block mb-2">“</span>
            <p className="text-xl sm:text-2xl font-serif italic text-neutral-200 leading-snug">
              {artist.quote}
            </p>
            <span className="text-xs font-mono uppercase text-[#ff2a6d] tracking-widest block mt-4">
              — {artist.name}
            </span>
          </div>
        </div>

        {/* Tab Navigation (ABOUT, GALLERY, EVENTS, MEDIA, COLLABORATIONS) */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {(['ABOUT', 'GALLERY', 'EVENTS', 'MEDIA', 'COLLABORATIONS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap rounded-lg ${
                activeTab === tab
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'ABOUT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6 text-sm text-neutral-300 leading-relaxed">
              <h3 className="text-lg font-bold font-display text-white">About {artist.name}</h3>
              <p>
                {artist.bio} Pravin has participated in numerous international BMX jams, live warehouse ciphers, and youth development clinics across India and Southeast Asia.
              </p>
              <p>
                Bridging street sport with underground music, his showcases blend live percussive soundtracking with aerial bicycle mastery.
              </p>
            </div>

            {/* Performance Stats */}
            <div className="p-6 bg-[#101016] border border-white/5 rounded-2xl space-y-4">
              <h4 className="text-xs font-mono text-[#ff2a6d] uppercase tracking-wider">Metrics & Reach</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                  <span className="text-neutral-400">Live Showcases:</span>
                  <span className="font-mono text-white font-bold">{artist.stats.shows}+</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                  <span className="text-neutral-400">Community Riders:</span>
                  <span className="font-mono text-white font-bold">{artist.stats.communityMembers}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                  <span className="text-neutral-400">Audience Impressions:</span>
                  <span className="font-mono text-white font-bold">{artist.stats.reach}</span>
                </div>
              </div>

              {/* Tracks Section */}
              {artist.tracks.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <h5 className="text-[11px] font-mono text-neutral-400 uppercase mb-2">Original Audio Releases</h5>
                  <div className="space-y-2">
                    {artist.tracks.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => onPlayTrack(t.title, t.bpm)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-3.5 h-3.5 text-[#ff2a6d]" />
                          <span className="text-xs text-white group-hover:text-rose-400 truncate max-w-[140px]">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">{t.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'GALLERY' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[artist.image, artist.image, artist.image].map((img, idx) => (
              <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5">
                <img src={img} alt="Gallery shot" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'EVENTS' && (
          <div className="p-8 bg-[#101016] border border-white/5 rounded-2xl text-center space-y-4">
            <h4 className="text-base font-bold text-white">Upcoming Showcases</h4>
            <p className="text-xs text-neutral-400">
              Catch {artist.name} live at the BMX Freestyle Jam & Cultmusic Fest 2024.
            </p>
            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Book for Private Gig
            </button>
          </div>
        )}

        {activeTab === 'MEDIA' && (
          <div className="p-8 bg-[#101016] border border-white/5 rounded-2xl text-center space-y-3">
            <h4 className="text-base font-bold text-white">Press & Media Kit</h4>
            <p className="text-xs text-neutral-400">
              High-resolution press photos, tech riders, and official bio documentation available for festival curators.
            </p>
          </div>
        )}

        {activeTab === 'COLLABORATIONS' && (
          <div className="p-8 bg-[#101016] border border-white/5 rounded-2xl text-center space-y-3">
            <h4 className="text-base font-bold text-white">Brand & Creative Partnerships</h4>
            <p className="text-xs text-neutral-300">
              Endorsed by Vans, Monster Energy, and Cultmusic Street Syndicate.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
