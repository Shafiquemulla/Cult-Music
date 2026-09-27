import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Play, Sparkles } from 'lucide-react';
import { Artist } from '../types';
import { fetchArtists } from '../services/api';

interface ArtistsProps {
  artists: Artist[];
  onSelectArtist?: (artist: Artist) => void;
  onNavigate?: (tab: string) => void;
  onPlayTrack: (title: string, bpm?: string) => void;
}

export const Artists: React.FC<ArtistsProps> = ({
  artists: initialArtists = [],
  onSelectArtist,
  onNavigate,
  onPlayTrack
}) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [artistsList, setArtistsList] = useState<Artist[]>(initialArtists);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchArtists(activeCategory, searchQuery)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setArtistsList(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch artists:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (initialArtists.length > 0 && artistsList.length === 0) {
      setArtistsList(initialArtists);
    }
  }, [initialArtists]);

  const categories = [
    'ALL',
    'HIP HOP',
    'ELECTRONIC',
    'ROCK',
    'INDIE',
    'POP',
    'BMX',
    'COLLECTIVE'
  ];

  const handleArtistClick = (artist: Artist) => {
    if (onSelectArtist) onSelectArtist(artist);
    navigate(`/artists/${artist.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyClick = () => {
    navigate('/contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentDisplayArtists = artistsList.length > 0 ? artistsList : initialArtists;
  const filteredArtists = currentDisplayArtists.filter((artist) => {
    const matchesCategory =
      activeCategory === 'ALL' ||
      (artist.category && artist.category.toUpperCase() === activeCategory) ||
      (artist.genre && artist.genre.toUpperCase() === activeCategory) ||
      (Array.isArray(artist.genres) && artist.genres.some((g) => g.toUpperCase() === activeCategory));

    const matchesSearch =
      searchQuery === '' ||
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.role && artist.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (artist.location && artist.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (artist.genre && artist.genre.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (matching mockup panel 3) */}
        <div className="mb-12">
          <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block mb-2">
            The Roster
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white uppercase">
            OUR ARTISTS
          </h1>
          <p className="text-base text-neutral-300 mt-2">
            Real talent. Real stories. Real music.
          </p>
        </div>

        {/* Filter Controls Bar & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5">
          {/* Categories Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#ff2a6d] text-white shadow-sm'
                    : 'bg-[#121218] text-neutral-400 hover:text-white hover:bg-[#181822]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artist name or genre..."
              className="w-full bg-[#121218] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d]"
            />
          </div>
        </div>

        {/* Artists Grid (9 artists from mockup) */}
        {filteredArtists.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 text-sm">
            No artists found matching your criteria. Try switching categories or clearing search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
            {filteredArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleArtistClick(artist)}
                className="group bg-[#101016] border border-white/5 hover-card-neon rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover-zoom-img"
                  />
                  
                  {/* Subtle Badge with hover shimmer */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-neutral-300 border border-white/10 group-hover:border-[#ff2a6d]/60 group-hover:text-white transition-all">
                    {artist.badge}
                  </div>

                  {/* Play snippet quick hover icon */}
                  {artist.tracks.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(artist.tracks[0].title, artist.tracks[0].bpm);
                      }}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white flex items-center justify-center opacity-90 group-hover:opacity-100 hover-play-pulse cursor-pointer shadow-lg"
                      title={`Play ${artist.tracks[0].title}`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-display text-white group-hover:text-rose-400 group-hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.4)] transition-all">
                      {artist.name}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                      {artist.role}
                    </p>
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                      {artist.bio}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-mono text-[11px] text-neutral-400">
                      {artist.location}
                    </span>
                    <span className="text-[#ff2a6d] font-semibold flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                      <span>View Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BECOME A PART OF CULTMUSIC CTA (matching mockup panel 3) */}
        <div className="bg-gradient-to-r from-neutral-950 via-[#150a15] to-neutral-950 border border-white/10 hover:border-[#ff2a6d]/30 transition-all rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden group">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block">
              Talent Roster Auditions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white uppercase group-hover:text-rose-400 transition-colors">
              BECOME A PART OF CULTMUSIC
            </h2>
            <p className="text-sm text-neutral-300">
              Are you an independent producer, vocalist, BMX rider, or street collective? We provide career strategy, stage bookings, and global distribution.
            </p>
            <div className="pt-2">
              <button
                onClick={handleApplyClick}
                className="px-6 py-3.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] hover:shadow-[0_0_20px_rgba(255,42,109,0.5)] hover:-translate-y-0.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>APPLY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
