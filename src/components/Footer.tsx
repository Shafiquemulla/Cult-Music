import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Youtube, Twitter, Linkedin, Database, Wifi, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface FooterProps {
  dbStatus?: { database: string; status: string; uri: string } | null;
  user?: User | null;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ dbStatus, user, onLogout, onOpenAuth }) => {
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050507] border-t border-white/5 py-12 text-neutral-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top bar with brand and motto */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-white/5 gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <button
              onClick={() => handleNav('/')}
              className="font-display font-extrabold text-2xl tracking-tight text-white hover:text-rose-400 hover:drop-shadow-[0_0_12px_rgba(255,42,109,0.5)] transition-all cursor-pointer text-left group"
            >
              CULT<span className="text-[#ff2a6d] group-hover:text-[#ff4081]">MUSIC</span>
            </button>
            <span className="hidden sm:inline text-neutral-600">|</span>
            <span className="text-xs text-neutral-400 font-medium">
              Music Brings People Together
            </span>
          </div>

          {/* Social Links with New Hover Pop */}
          <div className="flex items-center gap-4 text-neutral-400">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:text-[#ff2a6d] hover:bg-white/10 hover:scale-115 hover:shadow-[0_0_12px_rgba(255,42,109,0.4)] rounded-full transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:text-[#ff2a6d] hover:bg-white/10 hover:scale-115 hover:shadow-[0_0_12px_rgba(255,42,109,0.4)] rounded-full transition-all"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:text-[#ff2a6d] hover:bg-white/10 hover:scale-115 hover:shadow-[0_0_12px_rgba(255,42,109,0.4)] rounded-full transition-all"
              aria-label="X / Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:text-[#ff2a6d] hover:bg-white/10 hover:scale-115 hover:shadow-[0_0_12px_rgba(255,42,109,0.4)] rounded-full transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation & System Status */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold tracking-wider text-neutral-400">
            <button onClick={() => handleNav('/')} className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.5)] transition-all cursor-pointer">HOME</button>
            <button onClick={() => handleNav('/services')} className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.5)] transition-all cursor-pointer">SERVICES</button>
            <button onClick={() => handleNav('/artists')} className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.5)] transition-all cursor-pointer">ARTISTS</button>
            <button onClick={() => handleNav('/events')} className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.5)] transition-all cursor-pointer">EVENTS</button>
            <button onClick={() => handleNav('/blog')} className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.5)] transition-all cursor-pointer">BLOG</button>
            <button onClick={() => handleNav('/contact')} className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,42,109,0.5)] transition-all cursor-pointer">CONTACT</button>
          </div>

          {/* Database, Auth & Real-time indicators with quick Logout */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-md">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>MongoDB Engine: Connected</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-md">
              <Wifi className="w-3.5 h-3.5 text-[#ff2a6d]" />
              <span>Real-Time SSE Live</span>
            </div>

            {/* User Account / Logout Option in Footer */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <span className="text-[11px] text-neutral-300">
                  Logged in as <strong className="text-white">{user.name}</strong>
                </span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all cursor-pointer hover-glow-logout group"
                    title="Sign out of account"
                  >
                    <LogOut className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            ) : (
              onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                >
                  <UserIcon className="w-3 h-3 text-[#ff2a6d]" />
                  <span>Sign In</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-3">
          <p>© {new Date().getFullYear()} CULTMUSIC. All rights reserved. Music, People, Culture.</p>
          <p className="flex items-center gap-3">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>JWT + MFA Secured</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

