import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, KeyRound, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
import { loginUser, registerUser, verifyMfa, setStoredToken } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  currentUser,
  onLogout 
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'mfa'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enableMfa, setEnableMfa] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaHint, setMfaHint] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.requireMfa) {
        setTempToken(res.tempToken);
        setMfaHint(res.mfaHint || 'Enter your 6-digit security code');
        setMode('mfa');
      } else {
        setStoredToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await verifyMfa(tempToken, mfaCode);
      setStoredToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'MFA code verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerUser(name, email, password, enableMfa);
      setStoredToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (userType: 'admin' | 'listener') => {
    if (userType === 'admin') {
      setEmail('admin@cultmusic.com');
      setPassword('admin123');
    } else {
      setEmail('shafiquemulla8@gmail.com');
      setPassword('cultmusic2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#101015] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#ff2a6d]/10 text-[#ff2a6d] border border-[#ff2a6d]/20 text-[11px] font-semibold tracking-wider mb-3">
            <Lock className="w-3 h-3" />
            <span>JWT + MFA SECURE ACCESS</span>
          </div>

          <h2 className="text-2xl font-bold font-display text-white">
            {currentUser ? 'Authenticated Account' : (
              mode === 'login' ? 'Sign in to CULTMUSIC' :
              mode === 'register' ? 'Create your account' : 'Two-Factor Verification'
            )}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {currentUser 
              ? 'You are currently signed in. You can log out or switch to another account below.'
              : mode === 'login' ? 'Access exclusive artist bookings, tickets, and community perks.'
              : mode === 'register' ? 'Join the independent music, art, and extreme culture movement.'
              : 'For enhanced privacy and security, enter your 6-digit MFA code.'}
          </p>
        </div>

        {/* User Session Info Card & Direct Logout Option */}
        {currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff2a6d] to-purple-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{currentUser.name}</h4>
                <p className="text-xs text-neutral-400 truncate">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-[#ff2a6d]/20 text-[#ff2a6d] text-[10px] font-mono font-bold rounded uppercase">
                    Role: {currentUser.role}
                  </span>
                  {currentUser.mfaEnabled && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>MFA Active</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs rounded-xl border border-rose-500/30 hover:border-rose-500 transition-all cursor-pointer hover-glow-logout group shadow-sm"
                >
                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Log Out of CULTMUSIC</span>
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Mode Selector Tabs (only when not in MFA step and not logged in) */}
        {!currentUser && mode !== 'mfa' && (
          <div className="flex border-b border-white/10 mb-6">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`pb-2 text-xs font-semibold tracking-wider border-b-2 mr-6 transition-colors cursor-pointer ${
                mode === 'login' ? 'border-[#ff2a6d] text-white' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              LOG IN
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`pb-2 text-xs font-semibold tracking-wider border-b-2 transition-colors cursor-pointer ${
                mode === 'register' ? 'border-[#ff2a6d] text-white' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              REGISTER
            </button>
          </div>
        )}

        {/* Form: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#ff2a6d]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In With JWT'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Fill Buttons */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-neutral-400 block mb-2">Quick One-Click Test Logins:</span>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[11px] text-neutral-300 transition-colors cursor-pointer"
                >
                  Admin (with MFA)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('listener')}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[11px] text-neutral-300 transition-colors cursor-pointer"
                >
                  Member (Direct)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Form: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Shafique Mulla"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                />
              </div>
            </div>

            {/* MFA Option Toggle */}
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
              <input
                type="checkbox"
                id="mfaToggle"
                checked={enableMfa}
                onChange={(e) => setEnableMfa(e.target.checked)}
                className="w-4 h-4 text-[#ff2a6d] rounded bg-[#181820] border-neutral-600 focus:ring-[#ff2a6d] cursor-pointer"
              />
              <label htmlFor="mfaToggle" className="text-xs text-neutral-300 cursor-pointer">
                Enable Multi-Factor Authentication (MFA / 2FA)
                <span className="block text-[10px] text-neutral-400">Requires a 6-digit one-time code upon login.</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#ff2a6d]/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}

        {/* Form: MFA CODE VERIFICATION */}
        {mode === 'mfa' && (
          <form onSubmit={handleMfaVerify} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <p className="font-semibold">MFA Challenge Triggered</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{mfaHint}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="839210"
                  className="w-full bg-[#181820] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-base tracking-widest font-mono text-center text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2a6d] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Code...' : 'Confirm MFA & Login'}
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="w-full text-center text-xs text-neutral-400 hover:text-white pt-2 cursor-pointer"
            >
              Back to Sign In
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
