import React, { useState } from 'react';
import { X, Ticket, CheckCircle2, QrCode } from 'lucide-react';
import { EventItem, User } from '../types';
import { registerForEvent } from '../services/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  user: User | null;
  onRegisteredSuccess?: (msg: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  user,
  onRegisteredSuccess
}) => {
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [tier, setTier] = useState('General RSVP');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passCode, setPassCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await registerForEvent(event.id, {
        userName,
        userEmail,
        tier
      });
      setPassCode('CULT-' + Math.floor(100000 + Math.random() * 900000));
      setSuccess(true);
      onRegisteredSuccess?.(res.message);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#101015] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Pass Confirmed & Issued
            </span>
            <h3 className="text-xl font-bold font-display text-white mt-1 mb-1">
              You're Going to {event.title}!
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Saved to your CULTMUSIC profile and synchronized in real-time.
            </p>

            {/* Visual Digital Ticket Badge */}
            <div className="bg-[#181822] border border-[#ff2a6d]/30 rounded-xl p-4 text-left relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff2a6d]/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Event</span>
                  <h4 className="text-sm font-bold text-white leading-tight">{event.title}</h4>
                </div>
                <QrCode className="w-9 h-9 text-[#ff2a6d]" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
                <div>
                  <span className="text-[10px] text-neutral-500">Attendee</span>
                  <p className="text-neutral-200 font-medium truncate">{userName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500">Pass Code</span>
                  <p className="text-[#ff2a6d] font-mono font-bold">{passCode}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500">Date</span>
                  <p className="text-neutral-200 font-medium">{event.date}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500">Venue</span>
                  <p className="text-neutral-200 font-medium truncate">{event.location}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-white text-black font-semibold text-xs tracking-wider uppercase rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#ff2a6d] uppercase">
                {event.category} · {event.date}
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-1">
                RSVP for {event.title}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                {event.venue}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Shafique Mulla"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="shafiquemulla8@gmail.com"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Ticket / Entry Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                >
                  <option value="General RSVP">General RSVP (Free Access)</option>
                  <option value="VIP Backstage & Ramp Access">VIP Pit & Ramp Access ({event.price})</option>
                  <option value="Artist Jam Pass">Rider / Performer Masterclass Pass</option>
                </select>
              </div>

              <div className="p-3 bg-white/5 rounded-xl text-xs text-neutral-400 flex items-center justify-between">
                <span>Current Attendees Registered:</span>
                <span className="font-mono text-white font-bold">{event.registeredCount} / {event.capacity}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#ff2a6d]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing RSVP...' : 'Confirm RSVP Ticket'}
                <Ticket className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
