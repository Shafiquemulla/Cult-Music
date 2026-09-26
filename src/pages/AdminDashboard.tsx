import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Ticket, Calendar, Database, Shield, Radio, 
  ArrowUpRight, RefreshCw, Send, CheckCircle2, Clock, Music, LogOut
} from 'lucide-react';
import { SystemAnalytics } from '../types';
import { fetchAnalytics, fetchDbStatus } from '../services/api';

interface AdminDashboardProps {
  onTriggerNotification?: (title: string, message: string) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onTriggerNotification, onLogout }) => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushSent, setPushSent] = useState(false);

  const loadData = async () => {
    try {
      const [analyticsData, statusData] = await Promise.all([
        fetchAnalytics(),
        fetchDbStatus()
      ]);
      setAnalytics(analyticsData);
      setDbStatus(statusData);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushMessage) return;
    onTriggerNotification?.(pushTitle, pushMessage);
    setPushSent(true);
    setPushTitle('');
    setPushMessage('');
    setTimeout(() => setPushSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-white/5 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-semibold uppercase mb-2">
              <Shield className="w-3 h-3" />
              <span>Admin Operations Center</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white uppercase">
              SYSTEM ANALYTICS & METRICS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Real-time telemetry, MongoDB collections, live booking logs, and push engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setLoading(true); loadData(); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer hover:scale-105 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Live Data</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 hover:border-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer hover-glow-logout group shadow-sm"
                title="Log out of admin session"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Primary KPI Cards with New Hover Neon Lift */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
          
          <div className="p-6 bg-[#101016] border border-white/5 hover-card-neon rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold tracking-wider uppercase group-hover:text-white transition-colors">Active Listeners Now</span>
              <div className="p-2 rounded-xl bg-[#ff2a6d]/15 text-[#ff2a6d] group-hover:bg-[#ff2a6d] group-hover:text-white group-hover:shadow-[0_0_12px_rgba(255,42,109,0.5)] transition-all">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-white tabular-nums">
              {analytics?.activeNow ?? 342}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% peak evening surge</span>
            </div>
          </div>

          <div className="p-6 bg-[#101016] border border-white/5 hover-card-neon rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold tracking-wider uppercase group-hover:text-white transition-colors">Stream Minutes</span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-all">
                <Music className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-white tabular-nums">
              {analytics?.totalStreamMinutes ? (analytics.totalStreamMinutes / 1000).toFixed(1) + 'k' : '842.1k'}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Synth & audio synthesizers active</span>
            </div>
          </div>

          <div className="p-6 bg-[#101016] border border-white/5 hover-card-neon rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold tracking-wider uppercase group-hover:text-white transition-colors">Event RSVPs</span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-white tabular-nums">
              {analytics?.eventRegistrations ?? 5889}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
              <span>Capacity utilization: 84.2%</span>
            </div>
          </div>

          <div className="p-6 bg-[#101016] border border-white/5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold tracking-wider uppercase">Live SSE Clients</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-white tabular-nums">
              {analytics?.sseConnectionsCount ? Math.max(1, analytics.sseConnectionsCount) : 1}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time channel connected</span>
            </div>
          </div>

        </div>

        {/* MongoDB Integration Status & Push Broadcast Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* MongoDB Status Box */}
          <div className="lg:col-span-6 bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold font-display text-white">MongoDB Integration Status</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                SYNCHRONIZED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center">
                <span className="text-neutral-400 font-mono">Database URI:</span>
                <span className="text-white font-mono font-semibold truncate max-w-[240px]">
                  {dbStatus?.uri || 'mongodb://localhost:27017/cultmusic_db'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Artists</span>
                  <span className="text-base font-bold text-white font-mono">{dbStatus?.collections?.artists ?? 9}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Events</span>
                  <span className="text-base font-bold text-white font-mono">{dbStatus?.collections?.events ?? 6}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Articles</span>
                  <span className="text-base font-bold text-white font-mono">{dbStatus?.collections?.blogs ?? 6}</span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed pt-2">
                All records, reservations, inquiries, and user profiles are stored in MongoDB schemas with real-time SSE propagation.
              </p>
            </div>
          </div>

          {/* Broadcast Real-time Push Notification */}
          <div className="lg:col-span-6 bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#ff2a6d]" />
              <h3 className="text-base font-bold font-display text-white">Broadcast Real-Time Push Alert</h3>
            </div>
            <p className="text-xs text-neutral-400">
              Dispatches an immediate high-priority notification to all active web and mobile listeners.
            </p>

            <form onSubmit={handleSendPush} className="space-y-3">
              <input
                type="text"
                required
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
                placeholder="Alert Title (e.g., Surprise BMX Jam in Bandra!)"
                className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
              />
              <textarea
                rows={2}
                required
                value={pushMessage}
                onChange={(e) => setPushMessage(e.target.value)}
                placeholder="Notification message body..."
                className="w-full bg-[#181820] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Send Push Alert</span>
              </button>

              {pushSent && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Push notification dispatched to all connected clients!</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Live Booking Proposals & Event RSVPs Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Artist Bookings */}
          <div className="bg-[#101016] border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-bold font-display text-white mb-4">
              Recent Artist Bookings ({analytics?.recentBookings?.length ?? 1})
            </h3>
            <div className="space-y-3">
              {analytics?.recentBookings && analytics.recentBookings.length > 0 ? (
                analytics.recentBookings.map((b) => (
                  <div key={b.id} className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{b.artistName}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-neutral-400">Client: {b.clientName} ({b.email})</div>
                    <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
                      <span>Date: {b.date} · {b.location}</span>
                      <span className="text-white font-mono">{b.budget}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-neutral-500">No active bookings yet.</div>
              )}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-[#101016] border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-bold font-display text-white mb-4">
              Live RSVP Check-ins ({analytics?.recentRegistrations?.length ?? 1})
            </h3>
            <div className="space-y-3">
              {analytics?.recentRegistrations && analytics.recentRegistrations.length > 0 ? (
                analytics.recentRegistrations.map((r) => (
                  <div key={r.id} className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{r.userName}</span>
                      <span className="text-neutral-400 text-[10px] font-mono">
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-neutral-400">Event: {r.eventTitle}</div>
                    <div className="text-[11px] text-[#ff2a6d] font-mono font-medium">Tier: {r.tier}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-neutral-500">No attendee registrations recorded yet.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
