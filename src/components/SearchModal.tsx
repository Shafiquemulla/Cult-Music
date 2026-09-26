import React, { useState } from 'react';
import { X, Search, Calendar, User, BookOpen, ArrowRight } from 'lucide-react';
import { Artist, EventItem, BlogItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  artists: Artist[];
  events: EventItem[];
  blogs: BlogItem[];
  onSelectArtist: (artist: Artist) => void;
  onSelectEvent: (event: EventItem) => void;
  onSelectBlog: (blog: BlogItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  artists,
  events,
  blogs,
  onSelectArtist,
  onSelectEvent,
  onSelectBlog
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredArtists = q
    ? artists.filter(a => a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
    : artists.slice(0, 3);

  const filteredEvents = q
    ? events.filter(e => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
    : events.slice(0, 3);

  const filteredBlogs = q
    ? blogs.filter(b => b.title.toLowerCase().includes(q) || b.subtitle.toLowerCase().includes(q))
    : blogs.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#101015] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#0d0d12]">
          <Search className="w-5 h-5 text-neutral-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artists, BMX jams, music showcases, or articles..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          
          {/* Artists */}
          {filteredArtists.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5 text-[#ff2a6d]" />
                <span>Artists & Performers</span>
              </div>
              <div className="space-y-1.5">
                {filteredArtists.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { onSelectArtist(a); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={a.image} alt={a.name} className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#ff2a6d] transition-colors">{a.name}</h4>
                        <p className="text-[11px] text-neutral-400">{a.role}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {filteredEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 text-[#ff2a6d]" />
                <span>Upcoming Events</span>
              </div>
              <div className="space-y-1.5">
                {filteredEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { onSelectEvent(e); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#ff2a6d] transition-colors">{e.title}</h4>
                      <p className="text-[11px] text-neutral-400">{e.date} · {e.location}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/5 font-mono">
                      {e.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Blogs */}
          {filteredBlogs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5 text-[#ff2a6d]" />
                <span>Culture & Stories</span>
              </div>
              <div className="space-y-1.5">
                {filteredBlogs.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { onSelectBlog(b); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#ff2a6d] transition-colors">{b.title}</h4>
                      <p className="text-[11px] text-neutral-400">{b.date} · {b.readTime}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
