import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Calendar, Ticket, Check, Share2, Users, AlertCircle } from 'lucide-react';
import { EventItem } from '../types';
import { fetchEventById } from '../services/api';

interface EventDetailProps {
  event?: EventItem | null;
  events?: EventItem[];
  onOpenRegister: (event?: EventItem) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  event: propEvent,
  events = [],
  onOpenRegister
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(propEvent || null);
  const [activeTab, setActiveTab] = useState<'ABOUT' | 'SCHEDULE' | 'VENUE' | 'GALLERY' | 'FAQ'>('ABOUT');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (propEvent) {
      setCurrentEvent(propEvent);
      return;
    }
    if (id) {
      const found = events.find(e => e.id === id);
      if (found) {
        setCurrentEvent(found);
      } else {
        fetchEventById(id).then(setCurrentEvent).catch(console.error);
      }
    }
  }, [id, propEvent, events]);

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold font-display">Loading Event Details...</h2>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 px-4 py-2 bg-white/10 rounded-xl text-xs font-semibold"
        >
          Return to Events
        </button>
      </div>
    );
  }

  const event = currentEvent;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(event.title);
    const location = encodeURIComponent(event.venue);
    const details = encodeURIComponent(event.description);
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO EVENTS</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-neutral-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Event'}</span>
            </button>
          </div>
        </div>

        {/* Hero Section (matching mockup panel 6) */}
        <div className="relative aspect-[16/8] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 mb-10 shadow-2xl">
          <img
            src={event.image}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Date Badge */}
          <div className="absolute top-6 left-6 bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[64px]">
            <span className="block text-2xl font-black text-white leading-none">{event.day}</span>
            <span className="block text-xs font-mono font-bold text-[#ff2a6d] uppercase">{event.month}</span>
            <span className="block text-[10px] text-neutral-400 font-mono">{event.year}</span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#ff2a6d]/20 border border-[#ff2a6d]/40 text-[#ff2a6d] text-[11px] font-mono font-semibold uppercase mb-2">
                {event.category}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-300 mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#ff2a6d]" />
                  {event.location}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  {event.time}
                </span>
              </div>
            </div>

            {/* CTAs matching mockup */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenRegister?.(event)}
                className="px-6 py-3.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#ff2a6d]/25 hover-sheen hover-glow-pink cursor-pointer flex items-center gap-2"
              >
                <span>REGISTER NOW</span>
                <Ticket className="w-4 h-4" />
              </button>

              <button
                onClick={handleAddToCalendar}
                className="px-4 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs uppercase tracking-wider rounded-xl border border-white/10 hover:border-[#ff2a6d]/40 transition-all cursor-pointer hidden sm:flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Add to Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation (ABOUT, SCHEDULE, VENUE, GALLERY, FAQ) */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {(['ABOUT', 'SCHEDULE', 'VENUE', 'GALLERY', 'FAQ'] as const).map((tab) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'ABOUT' && (
              <div className="space-y-6 text-sm text-neutral-300 leading-relaxed bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold font-display text-white">Event Overview</h3>
                <p>{event.description}</p>
                <p>
                  Bringing together the underground community with professional ramps, sound systems, live DJs, and street food. All riders and enthusiasts of extreme sports and music culture are welcome.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <span className="text-neutral-400 text-xs block mb-1">Pricing & Passes:</span>
                    <span className="text-base font-bold text-white font-mono">{event.price}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <span className="text-neutral-400 text-xs block mb-1">Capacity & Availability:</span>
                    <span className="text-base font-bold text-[#ff2a6d] font-mono">{event.registeredCount} of {event.capacity} Filled</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SCHEDULE' && (
              <div className="bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-bold font-display text-white mb-4">Official Event Itinerary</h3>
                {event.schedule && event.schedule.length > 0 ? (
                  <div className="space-y-4">
                    {event.schedule.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 bg-white/5 rounded-xl">
                        <span className="px-2.5 py-1 bg-[#ff2a6d]/20 text-[#ff2a6d] font-mono text-xs font-bold rounded">
                          {item.time}
                        </span>
                        <span className="text-sm text-neutral-200 font-medium">{item.activity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">Detailed timeline will be broadcast to registered attendees 48 hours prior.</p>
                )}
              </div>
            )}

            {activeTab === 'VENUE' && (
              <div className="bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-bold font-display text-white">Location & Transit</h3>
                <p className="text-sm text-neutral-300">{event.venue}</p>
                <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#ff2a6d] shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-white">Directions:</span> Accessible via local train and ride-shares. Free bike parking provided for riders.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'GALLERY' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/5">
                  <img src={event.image} alt="Gallery" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/5">
                  <img src={event.image} alt="Gallery" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {activeTab === 'FAQ' && (
              <div className="bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-bold font-display text-white mb-2">Frequently Asked Questions</h3>
                {event.faqs && event.faqs.length > 0 ? (
                  event.faqs.map((f, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-white">{f.q}</p>
                      <p className="text-neutral-400">{f.a}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400">All questions can be emailed directly to hello@cultmusic.com.</p>
                )}
              </div>
            )}
          </div>

          {/* Right Card: Ethos Badge & Fast Registration Widget */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-[#101016] border border-white/5 rounded-2xl space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff2a6d] block">
                Instant RSVP Pass
              </span>
              <h4 className="text-lg font-bold font-display text-white">
                Reserve Your Spot
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tickets are managed via our real-time MongoDB backend. Live pass verification on entry.
              </p>
              <button
                onClick={() => onOpenRegister?.(event)}
                className="w-full py-3 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#ff2a6d]/20 hover-sheen hover-glow-pink cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Confirm Pass RSVP</span>
                <Ticket className="w-4 h-4" />
              </button>
            </div>

            {/* GOOD MUSIC BETTER PEOPLE (matching mockup badge in panel 6) */}
            <div className="p-6 bg-gradient-to-br from-neutral-900 via-[#180a18] to-neutral-950 border border-white/10 rounded-2xl text-center">
              <span className="text-2xl font-black font-display uppercase tracking-tight text-white block">
                GOOD MUSIC<br />BETTER PEOPLE
              </span>
              <span className="text-[10px] font-mono text-[#ff2a6d] tracking-widest uppercase block mt-1">
                CULTMUSIC Movement
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
