import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import { sendContact } from '../services/api';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendContact({ name, email, subject, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (matching mockup panel 9) */}
        <div className="max-w-3xl mb-16">
          <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block mb-2">
            Connect
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white uppercase">
            GET IN TOUCH
          </h1>
          <p className="text-base text-neutral-300 mt-2">
            Let's build a stronger music culture together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Form: SEND US A MESSAGE (matching mockup) */}
          <div className="lg:col-span-7 bg-[#101016] border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <h2 className="text-lg font-bold font-display uppercase tracking-wider text-white mb-6">
              SEND US A MESSAGE
            </h2>

            {success ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Message Dispatched!</h3>
                <p className="text-xs text-neutral-300">
                  Thank you for reaching out to CULTMUSIC. Our artist management team will contact you shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/15 text-xs text-white rounded-lg transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-[#181822] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-[#181822] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Artist Booking / Festival Collaboration / Sponsorship"
                    className="w-full bg-[#181822] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your event, venue specs, or artist collaboration proposal..."
                    className="w-full bg-[#181822] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#ff2a6d]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Transmitting...' : 'SEND MESSAGE'}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right Info: CONTACT INFO (matching mockup) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#101016] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-6">
              <h2 className="text-lg font-bold font-display uppercase tracking-wider text-white">
                CONTACT INFO
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3 text-neutral-300">
                  <div className="p-2.5 rounded-xl bg-white/5 text-[#ff2a6d]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-mono">Email Us</span>
                    <a href="mailto:hello@cultmusic.com" className="hover:text-white transition-colors">
                      hello@cultmusic.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-neutral-300">
                  <div className="p-2.5 rounded-xl bg-white/5 text-[#ff2a6d]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-mono">Call / WhatsApp</span>
                    <a href="tel:+919876543210" className="hover:text-white transition-colors">
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-neutral-300">
                  <div className="p-2.5 rounded-xl bg-white/5 text-[#ff2a6d]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-mono">Headquarters</span>
                    <span>Mumbai, India</span>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-6 border-t border-white/5">
                <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-3">FOLLOW US</span>
                <div className="flex items-center gap-3">
                  <a href="#" className="p-2.5 bg-white/5 hover:bg-[#ff2a6d] hover:text-white rounded-xl transition-all">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2.5 bg-white/5 hover:bg-[#ff2a6d] hover:text-white rounded-xl transition-all">
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2.5 bg-white/5 hover:bg-[#ff2a6d] hover:text-white rounded-xl transition-all">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2.5 bg-white/5 hover:bg-[#ff2a6d] hover:text-white rounded-xl transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Core Values Badge (matching mockup footer: CREATE · COLLABORATE · CELEBRATE) */}
            <div className="p-8 bg-gradient-to-br from-[#160a16] via-[#101016] to-[#0a0a0e] border border-white/10 rounded-3xl text-center space-y-2">
              <span className="text-xl sm:text-2xl font-black font-display tracking-wider text-white block">
                CREATE · COLLABORATE · CELEBRATE
              </span>
              <p className="text-xs text-neutral-400">
                Empowering independent artists, street sports riders, and passionate listeners.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
