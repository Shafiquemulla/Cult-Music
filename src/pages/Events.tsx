import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Clock, Users, Ticket } from 'lucide-react';
import { EventItem } from '../types';

interface EventsProps {
  events: EventItem[];
  onSelectEvent?: (event: EventItem) => void;
  onNavigate?: (tab: string) => void;
}

export const Events: React.FC<EventsProps> = ({ events, onSelectEvent, onNavigate }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = ['ALL', 'COMPETITION', 'RIDE SESSION', 'SHOWCASE', 'WORKSHOP'];

  const filteredEvents = events.filter((evt) => {
    if (activeCategory === 'ALL') return true;
    return evt.category.toUpperCase() === activeCategory;
  });

  const handleEventClick = (evt: EventItem) => {
    if (onSelectEvent) onSelectEvent(evt);
    navigate(`/events/${evt.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMovementClick = () => {
    navigate('/contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (matching mockup panel 5) */}
        <div className="mb-12">
          <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block mb-2">
            Live Calendar
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white uppercase">
            UPCOMING EVENTS
          </h1>
          <p className="text-base text-neutral-300 mt-2">
            Music brings people together.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-white/5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#ff2a6d] text-white shadow-sm'
                  : 'bg-[#121218] text-neutral-400 hover:text-white hover:bg-[#181822]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid (6 events matching mockup with enhanced hover) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => handleEventClick(evt)}
              className="group bg-[#101016] border border-white/5 hover:border-[#ff2a6d]/60 hover:shadow-[0_0_30px_rgba(255,42,109,0.22)] hover:-translate-y-2 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                <img
                  src={evt.image}
                  alt={evt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />

                {/* Calendar Date Badge (Day + Month) */}
                <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md border border-white/10 group-hover:border-[#ff2a6d]/40 rounded-xl px-3 py-1.5 text-center min-w-[50px] transition-all">
                  <span className="block text-base font-extrabold text-white leading-none">{evt.day}</span>
                  <span className="block text-[10px] font-mono text-[#ff2a6d] font-bold uppercase">{evt.month}</span>
                </div>

                <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-neutral-300">
                  {evt.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display text-white group-hover:text-rose-400 group-hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.4)] transition-all">
                    {evt.title}
                  </h2>

                  <div className="mt-2 space-y-1 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#ff2a6d] shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 mt-3 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                {/* Registration count progress */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1.5">
                    <span>RSVP Status</span>
                    <span className="font-mono text-white font-medium">{evt.registeredCount} / {evt.capacity}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff2a6d] to-purple-600 rounded-full"
                      style={{ width: `${Math.min(100, (evt.registeredCount / evt.capacity) * 100)}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-neutral-200">{evt.price}</span>
                    <span className="text-[#ff2a6d] font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                      <span>RSVP Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MORE THAN EVENTS - A MOVEMENT BANNER (matching mockup panel 5) */}
        <div className="bg-gradient-to-r from-neutral-950 via-[#160a14] to-neutral-950 border border-white/10 hover:border-[#ff2a6d]/30 transition-all rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden group">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block">
              MORE THAN EVENTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white uppercase group-hover:text-rose-400 transition-colors">
              A MOVEMENT
            </h2>
            <p className="text-sm text-neutral-300">
              We create experiences that inspire, connect and empower the next generation. Join 45,000+ creators, riders, and listeners across India.
            </p>
            <div className="pt-2">
              <button
                onClick={handleMovementClick}
                className="px-6 py-3.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] hover:shadow-[0_0_20px_rgba(255,42,109,0.5)] hover:-translate-y-0.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>BE PART OF IT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
