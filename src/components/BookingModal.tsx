import React, { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, Send, CheckCircle } from 'lucide-react';
import { Artist, User } from '../types';
import { bookArtist } from '../services/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist | null;
  user: User | null;
  onBookingSuccess?: (msg: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  artist,
  user,
  onBookingSuccess
}) => {
  const [clientName, setClientName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('₹1,50,000 - ₹3,00,000');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !artist) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await bookArtist(artist.id, {
        clientName,
        email,
        date,
        location,
        budget,
        details
      });
      setSuccess(true);
      onBookingSuccess?.(res.message);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#101015] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold font-display text-white mb-2">Inquiry Received!</h3>
            <p className="text-sm text-neutral-300">
              Your booking proposal for <span className="text-[#ff2a6d] font-semibold">{artist.name}</span> has been logged to MongoDB. Management will respond within 24 hours.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#ff2a6d] uppercase">
                Direct Artist Booking
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-1">
                Book {artist.name}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Concerts, festivals, brand activations, masterclasses, and corporate showcases.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Your Name / Organization</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Red Bull Events / Organizer"
                    className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@brand.com"
                    className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Proposed Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#181820] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Venue / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Mumbai Arena, India"
                      className="w-full bg-[#181820] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Estimated Budget Range</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[#181820] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                  >
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000 (Local Club / College)</option>
                    <option value="₹1,50,000 - ₹3,00,000">₹1,50,000 - ₹3,00,000 (Major Gig / Stunt Show)</option>
                    <option value="₹3,50,000 - ₹8,00,000">₹3,50,000 - ₹8,00,000 (Festival Headline / Tour)</option>
                    <option value="₹10,00,000+">₹10,00,000+ (Multi-City Campaign / Global)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Event Details & Specific Requirements</label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Stage size, BMX ramp requirements, sound system specs, or brand activation brief..."
                  className="w-full bg-[#181820] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#ff2a6d]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#ff2a6d]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting Proposal...' : 'Submit Booking Request'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
