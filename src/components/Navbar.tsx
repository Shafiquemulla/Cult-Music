import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User as UserIcon, Menu, X, Shield, Sparkles, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { User, PushNotification } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAiStudio: () => void;
  notifications: PushNotification[];
  onOpenNotifications: () => void;
  onSearchOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onOpenAiStudio,
  notifications,
  onOpenNotifications,
  onSearchOpen
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/services', label: 'SERVICES' },
    { path: '/artists', label: 'ARTISTS' },
    { path: '/events', label: 'EVENTS' },
    { path: '/blog', label: 'BLOG' },
    { path: '/contact', label: 'CONTACT' },
  ];

  const handleLinkClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutClick = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08080a]/90 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Zone 1: Wordmark with new hover neon glow */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-1.5 group text-left cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-105"
          >
            <span className="font-display font-extrabold text-2xl tracking-tight text-white group-hover:text-rose-300 group-hover:drop-shadow-[0_0_16px_rgba(255,42,109,0.7)] transition-all">
              CULT<span className="text-[#ff2a6d] group-hover:text-[#ff4081]">MUSIC</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links with new tactile hover underline, pill glow, and lift */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = link.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(link.path);
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`text-xs font-semibold tracking-wider py-1.5 px-2.5 rounded-lg cursor-pointer relative group transition-all duration-200 ${
                  isActive 
                    ? 'text-white bg-white/5 drop-shadow-[0_0_10px_rgba(255,42,109,0.5)]' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 hover:-translate-y-0.5'
                }`}
              >
                <span className="relative z-10 group-hover:text-white transition-colors">{link.label}</span>
                {/* Active and Hover Indicator */}
                <span
                  className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#ff2a6d] shadow-[0_0_10px_#ff2a6d]' 
                      : 'bg-transparent group-hover:bg-[#ff2a6d] group-hover:shadow-[0_0_8px_#ff2a6d]'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Showreel Generator Button with new hover glow */}
          <button
            onClick={onOpenAiStudio}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#ff2a6d]/15 text-[#ff2a6d] border border-[#ff2a6d]/30 rounded-full hover:bg-[#ff2a6d] hover:text-white hover-sheen hover-glow-pink cursor-pointer shadow-sm shadow-[#ff2a6d]/10"
            title="Open AI Music Video & Visualizer Studio"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden lg:inline">AI Studio</span>
          </button>

          {/* Search Trigger with new hover pop */}
          <button
            onClick={onSearchOpen}
            className="p-2 text-neutral-400 hover:text-[#ff2a6d] hover:bg-white/10 hover:scale-115 active:scale-95 rounded-xl transition-all cursor-pointer hover:shadow-[0_0_12px_rgba(255,42,109,0.3)]"
            aria-label="Search artists and events"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Real-Time Push Notifications with hover */}
          <button
            onClick={onOpenNotifications}
            className="p-2 text-neutral-400 hover:text-[#ff2a6d] hover:bg-white/10 hover:scale-115 active:scale-95 rounded-xl transition-all relative cursor-pointer hover:shadow-[0_0_12px_rgba(255,42,109,0.3)]"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff2a6d] rounded-full ring-2 ring-[#08080a] animate-ping" />
            )}
          </button>

          {/* Admin Dashboard link if user is admin */}
          {user?.role === 'admin' && (
            <button
              onClick={() => handleLinkClick('/admin')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all hover:scale-105 cursor-pointer ${
                location.pathname === '/admin'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : 'text-neutral-300 border-neutral-700/60 hover:bg-white/10 hover:text-white hover:border-neutral-500'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {/* User Profile & Prominent Logout Option */}
          {user ? (
            <div className="flex items-center gap-2" ref={userDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 hover:bg-white/15 hover:border-[#ff2a6d]/50 rounded-xl text-xs font-medium text-neutral-200 transition-all border border-white/10 cursor-pointer shadow-sm group hover-glow-pink"
                  aria-label="User Account Menu"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ff2a6d] to-purple-600 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shadow-inner group-hover:ring-2 group-hover:ring-[#ff2a6d] transition-all">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-[85px] truncate font-semibold">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${userDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {/* User Dropdown Menu with New Hover States */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#121218] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff2a6d] to-purple-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                        <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="px-1.5 py-0.2 bg-[#ff2a6d]/20 text-[#ff2a6d] text-[9px] font-mono font-bold rounded uppercase">
                            {user.role}
                          </span>
                          {user.mfaEnabled && (
                            <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-mono">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>MFA</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleLinkClick('/admin')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer text-left group"
                        >
                          <Shield className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleLinkClick('/events')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer text-left group"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#ff2a6d] group-hover:scale-110 transition-transform" />
                        <span>My Event Passes</span>
                      </button>
                    </div>

                    {/* Prominent Log Out button inside dropdown */}
                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs rounded-xl border border-rose-500/30 hover:border-rose-500 transition-all cursor-pointer group shadow-sm hover-glow-logout"
                      >
                        <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>Log Out of CULTMUSIC</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Prominent, Instant Logout Option (Visible directly in navbar) */}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl border border-rose-500/30 hover:border-rose-500 transition-all cursor-pointer text-xs font-semibold hover-glow-logout shadow-sm group"
                title="Log out of CULTMUSIC"
                aria-label="Log Out"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-white text-black rounded-xl hover:bg-[#ff2a6d] hover:text-white hover-sheen hover-glow-pink transition-all cursor-pointer shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 rounded-xl transition-all cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Logout Option */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c10] border-b border-white/10 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = link.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#ff2a6d]/20 text-[#ff2a6d]'
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            
            <button
              onClick={() => {
                onOpenAiStudio();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-[#ff2a6d] hover:bg-[#ff2a6d]/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Video Studio & Visualizer</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => handleLinkClick('/admin')}
                className="flex items-center gap-2 text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-400 hover:bg-white/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Analytics Dashboard</span>
              </button>
            )}

            {/* Mobile Logout Button */}
            {user && (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Log Out ({user.name})</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-rose-500/20 px-2 py-0.5 rounded">
                    Sign Out
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

