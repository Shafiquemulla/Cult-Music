import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mic2, Calendar, Users, Trophy } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesProps {
  services: ServiceItem[];
  onNavigate?: (tab: string) => void;
  onOpenBooking: () => void;
}

export const Services: React.FC<ServicesProps> = ({ services, onNavigate, onOpenBooking }) => {
  const navigate = useNavigate();

  const handleGoContact = () => {
    navigate('/contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (matching mockup panel 2) */}
        <div className="max-w-3xl mb-16">
          <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block mb-2">
            OUR SERVICES
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white uppercase leading-tight">
            TURNING TALENT INTO OPPORTUNITY
          </h1>
          <p className="text-base sm:text-lg text-neutral-300 mt-4 leading-relaxed">
            From artist management to live experiences, we help shape the future of music culture.
          </p>
        </div>

        {/* Services Grid with enhanced hover states */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {services.map((srv, idx) => (
            <div
              key={srv.id}
              className="bg-[#101016] border border-white/5 hover-card-neon rounded-2xl p-8 flex flex-col justify-between group cursor-pointer"
              onClick={handleGoContact}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-neutral-500 group-hover:text-[#ff2a6d] transition-colors">0{idx + 1}</span>
                  <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#ff2a6d]/20 text-[#ff2a6d] group-hover:scale-115 group-hover:shadow-[0_0_15px_rgba(255,42,109,0.5)] transition-all">
                    {idx === 0 && <Mic2 className="w-5 h-5" />}
                    {idx === 1 && <Calendar className="w-5 h-5" />}
                    {idx === 2 && <Users className="w-5 h-5" />}
                    {idx === 3 && <Trophy className="w-5 h-5" />}
                  </div>
                </div>

                <h2 className="text-xl font-bold font-display text-white uppercase group-hover:text-rose-400 group-hover:drop-shadow-[0_0_10px_rgba(255,42,109,0.4)] transition-all">
                  {srv.title}
                </h2>

                <p className="text-sm text-neutral-300 mt-3 leading-relaxed">
                  {srv.description}
                </p>

                {/* Bullets */}
                <div className="mt-6 space-y-2.5 pt-6 border-t border-white/5">
                  {srv.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2.5 text-xs text-neutral-400">
                      <CheckCircle2 className="w-4 h-4 text-[#ff2a6d] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-white/5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoContact();
                  }}
                  className="text-xs font-bold text-white group-hover:text-[#ff2a6d] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>LEARN MORE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner: LET'S CREATE EXTRAORDINARY EXPERIENCES TOGETHER (matching mockup) */}
        <div className="bg-gradient-to-r from-neutral-950 via-[#160c16] to-neutral-950 border border-white/10 hover-card-neon rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden group">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#ff2a6d] uppercase block">
              Collaborate With Cultmusic
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white uppercase group-hover:text-rose-400 transition-colors">
              LET'S CREATE EXTRAORDINARY EXPERIENCES TOGETHER
            </h2>
            <p className="text-sm text-neutral-300">
              Whether you are an event organizer looking for top-tier talent or a brand building authentic subculture activations.
            </p>
            <div className="pt-2">
              <button
                onClick={handleGoContact}
                className="px-6 py-3.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] hover-sheen hover-glow-pink text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-[#ff2a6d]/25"
              >
                <span>GET IN TOUCH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

