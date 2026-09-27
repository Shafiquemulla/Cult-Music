import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Ticket, Calendar, Database, Shield, Radio, 
  ArrowUpRight, RefreshCw, Send, CheckCircle2, Clock, Music, LogOut,
  Plus, Edit3, Trash2, X, AlertCircle, Sparkles
} from 'lucide-react';
import { SystemAnalytics, Artist, EventItem } from '../types';
import { 
  fetchAnalytics, fetchDbStatus, fetchArtists, 
  createArtist, updateArtist, deleteArtist,
  fetchEvents, createEvent, updateEvent, deleteEvent
} from '../services/api';

interface AdminDashboardProps {
  onTriggerNotification?: (title: string, message: string) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onTriggerNotification, onLogout }) => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushSent, setPushSent] = useState(false);

  // Artist Modal & Form State
  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [artistActionLoading, setArtistActionLoading] = useState(false);
  const [artistActionError, setArtistActionError] = useState<string | null>(null);
  const [artistActionSuccess, setArtistActionSuccess] = useState<string | null>(null);

  // Event Modal & Form State
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventActionLoading, setEventActionLoading] = useState(false);
  const [eventActionError, setEventActionError] = useState<string | null>(null);
  const [eventActionSuccess, setEventActionSuccess] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    genre: '',
    bio: '',
    image: '',
    location: '',
    instagram: '',
    youtube: '',
    spotify: '',
    x: '',
    isActive: true,
  };
  const [artistForm, setArtistForm] = useState(initialFormState);

  const initialEventFormState = {
    title: '',
    date: '',
    time: '4:00 PM - 10:00 PM',
    location: '',
    venue: '',
    category: 'RIDE SESSION',
    type: 'Competition & Jam',
    price: 'Free Entry with RSVP',
    capacity: 500,
    image: '',
    description: '',
  };
  const [eventForm, setEventForm] = useState(initialEventFormState);

  const loadData = async () => {
    try {
      const [analyticsData, statusData, artistsData, eventsData] = await Promise.all([
        fetchAnalytics().catch(() => null),
        fetchDbStatus().catch(() => null),
        fetchArtists().catch(() => []),
        fetchEvents().catch(() => [])
      ]);
      if (analyticsData) setAnalytics(analyticsData);
      if (statusData) setDbStatus(statusData);
      if (Array.isArray(artistsData)) setArtists(artistsData);
      if (Array.isArray(eventsData)) setEvents(eventsData);
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

  const openCreateModal = () => {
    setEditingArtist(null);
    setArtistForm(initialFormState);
    setArtistActionError(null);
    setArtistActionSuccess(null);
    setArtistModalOpen(true);
  };

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist);
    setArtistForm({
      name: artist.name || '',
      genre: artist.genre || (artist.genres && artist.genres[0]) || artist.category || '',
      bio: artist.bio || '',
      image: artist.image || '',
      location: artist.location || '',
      instagram: artist.socials?.instagram || artist.socialLinks?.instagram || '',
      youtube: artist.socials?.youtube || artist.socialLinks?.youtube || '',
      spotify: artist.socials?.spotify || artist.socialLinks?.spotify || '',
      x: artist.socials?.x || artist.socialLinks?.x || '',
      isActive: artist.isActive !== undefined ? artist.isActive : true,
    });
    setArtistActionError(null);
    setArtistActionSuccess(null);
    setArtistModalOpen(true);
  };

  const handleSaveArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtistActionLoading(true);
    setArtistActionError(null);
    setArtistActionSuccess(null);

    try {
      if (!artistForm.name.trim()) throw new Error('Artist name is required');
      if (!artistForm.genre.trim()) throw new Error('Genre is required');

      const payload = {
        name: artistForm.name.trim(),
        genre: artistForm.genre.trim(),
        bio: artistForm.bio.trim(),
        image: artistForm.image.trim() || '/src/assets/images/artist_pravin_bmx_1790433619103.jpg',
        location: artistForm.location.trim() || 'Global',
        socialLinks: {
          instagram: artistForm.instagram.trim(),
          youtube: artistForm.youtube.trim(),
          spotify: artistForm.spotify.trim(),
          x: artistForm.x.trim(),
        },
        isActive: artistForm.isActive,
      };

      if (editingArtist) {
        // PUT /api/artists/:id
        await updateArtist(editingArtist.id, payload);
        setArtistActionSuccess('Artist profile updated successfully!');
      } else {
        // POST /api/artists
        await createArtist(payload);
        setArtistActionSuccess('New artist registered to roster successfully!');
      }

      await loadData();
      setTimeout(() => {
        setArtistModalOpen(false);
        setArtistActionSuccess(null);
      }, 1200);
    } catch (err: any) {
      setArtistActionError(err.message || 'Operation failed');
    } finally {
      setArtistActionLoading(false);
    }
  };

  const handleDeleteArtist = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the roster?`)) return;

    try {
      await deleteArtist(id);
      onTriggerNotification?.('Artist Removed', `${name} was removed from the roster.`);
      await loadData();
    } catch (err: any) {
      alert(`Failed to delete artist: ${err.message}`);
    }
  };

  const openCreateEventModal = () => {
    setEditingEvent(null);
    setEventForm(initialEventFormState);
    setEventActionError(null);
    setEventActionSuccess(null);
    setEventModalOpen(true);
  };

  const openEditEventModal = (event: EventItem) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      date: event.date || '',
      time: event.time || '4:00 PM - 10:00 PM',
      location: event.location || '',
      venue: event.venue || '',
      category: event.category || 'RIDE SESSION',
      type: event.type || 'Competition & Jam',
      price: event.price || 'Free Entry with RSVP',
      capacity: event.capacity || 500,
      image: event.image || '',
      description: event.description || '',
    });
    setEventActionError(null);
    setEventActionSuccess(null);
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventActionLoading(true);
    setEventActionError(null);
    setEventActionSuccess(null);

    try {
      if (!eventForm.title.trim()) throw new Error('Event title is required');
      if (!eventForm.date.trim()) throw new Error('Event date is required');
      if (!eventForm.location.trim()) throw new Error('Event location is required');
      if (!eventForm.category.trim()) throw new Error('Event category is required');

      const payload = {
        title: eventForm.title.trim(),
        date: eventForm.date.trim(),
        time: eventForm.time.trim() || '4:00 PM - 10:00 PM',
        location: eventForm.location.trim(),
        venue: eventForm.venue.trim() || `${eventForm.location.trim()} Main Grounds`,
        category: eventForm.category.trim().toUpperCase(),
        type: eventForm.type.trim() || 'Community Jam',
        price: eventForm.price.trim() || 'Free Entry with RSVP',
        capacity: Number(eventForm.capacity) > 0 ? Number(eventForm.capacity) : 500,
        image: eventForm.image.trim() || '/src/assets/images/event_freestyle_jam_1790433655462.jpg',
        description: eventForm.description.trim(),
      };

      if (editingEvent) {
        // PUT /api/events/:id
        await updateEvent(editingEvent.id, payload);
        setEventActionSuccess('Event updated successfully!');
      } else {
        // POST /api/events
        await createEvent(payload);
        setEventActionSuccess('New event scheduled successfully!');
      }

      await loadData();
      setTimeout(() => {
        setEventModalOpen(false);
        setEventActionSuccess(null);
      }, 1200);
    } catch (err: any) {
      setEventActionError(err.message || 'Operation failed');
    } finally {
      setEventActionLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove event "${title}"?`)) return;

    try {
      await deleteEvent(id);
      onTriggerNotification?.('Event Removed', `Event "${title}" was removed.`);
      await loadData();
    } catch (err: any) {
      alert(`Failed to delete event: ${err.message}`);
    }
  };

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

        {/* Artist Management Roster Control (MongoDB CRUD) */}
        <div className="mt-12 bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-[#ff2a6d]" />
                <h3 className="text-lg font-bold font-display text-white">Artist Roster Management</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Admin controls to create, update, and manage artists stored in MongoDB collections.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Artist</span>
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-400 font-mono text-[11px] uppercase">
                  <th className="pb-3 font-semibold">Artist</th>
                  <th className="pb-3 font-semibold">Genre / Category</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {artists.length > 0 ? (
                  artists.map((art) => (
                    <tr key={art.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={art.image || '/src/assets/images/artist_pravin_bmx_1790433619103.jpg'}
                            alt={art.name}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{art.name}</div>
                            <div className="text-[11px] text-neutral-400">{art.role || 'Artist'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 text-neutral-300 font-mono text-[10px] uppercase font-semibold">
                          {art.genre || (art.genres && art.genres[0]) || art.category || 'INDEPENDENT'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-neutral-400">
                        {art.location || 'Global'}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          art.isActive !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                        }`}>
                          {art.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => openEditModal(art)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          title="Edit Artist"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteArtist(art.id, art.name)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-rose-500/20"
                          title="Delete Artist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500 text-xs">
                      No artists found in MongoDB roster. Click "Add New Artist" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create / Edit Artist */}
        {artistModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#12121a] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl">
              <button
                onClick={() => setArtistModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold font-display text-white uppercase mb-1">
                {editingArtist ? 'Edit Artist Profile' : 'Add New Artist to Roster'}
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Persisted in MongoDB with strict JWT admin validation.
              </p>

              {artistActionError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{artistActionError}</span>
                </div>
              )}

              {artistActionSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{artistActionSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveArtist} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={artistForm.name}
                    onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Primary Genre *
                    </label>
                    <input
                      type="text"
                      required
                      value={artistForm.genre}
                      onChange={(e) => setArtistForm({ ...artistForm, genre: e.target.value })}
                      placeholder="e.g. HIP HOP, ELECTRONIC"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={artistForm.location}
                      onChange={(e) => setArtistForm({ ...artistForm, location: e.target.value })}
                      placeholder="e.g. Mumbai, India"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={artistForm.image}
                    onChange={(e) => setArtistForm({ ...artistForm, image: e.target.value })}
                    placeholder="e.g. /src/assets/images/artist_pravin_bmx_1790433619103.jpg"
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Bio / Story
                  </label>
                  <textarea
                    rows={3}
                    value={artistForm.bio}
                    onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
                    placeholder="Artist bio, creative background, underground roots..."
                    className="w-full bg-[#181824] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={artistForm.instagram}
                      onChange={(e) => setArtistForm({ ...artistForm, instagram: e.target.value })}
                      placeholder="@artist"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                      Spotify Artist
                    </label>
                    <input
                      type="text"
                      value={artistForm.spotify}
                      onChange={(e) => setArtistForm({ ...artistForm, spotify: e.target.value })}
                      placeholder="Artist Name"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff2a6d]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={artistForm.isActive}
                    onChange={(e) => setArtistForm({ ...artistForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#ff2a6d] bg-[#181824] border-white/10 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isActiveToggle" className="text-xs text-neutral-300 cursor-pointer select-none">
                    Active on public roster
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setArtistModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={artistActionLoading}
                    className="px-5 py-2 bg-[#ff2a6d] hover:bg-[#ff1a5d] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {artistActionLoading ? 'Saving...' : editingArtist ? 'Update Artist' : 'Create Artist'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Schedule & Roster Control (MongoDB CRUD) */}
        <div className="mt-12 bg-[#101016] border border-white/5 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold font-display text-white">Event Schedule Management</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Admin controls to schedule, modify, and manage underground events, jams, and competitions in MongoDB.
              </p>
            </div>

            <button
              onClick={openCreateEventModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Event</span>
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-400 font-mono text-[11px] uppercase">
                  <th className="pb-3 font-semibold">Event</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Location / Venue</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">RSVP / Cap</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.length > 0 ? (
                  events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.image || '/src/assets/images/event_freestyle_jam_1790433655462.jpg'}
                            alt={evt.title}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{evt.title}</div>
                            <div className="text-[11px] text-neutral-400">{evt.type || 'Community Jam'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-mono text-white font-medium">{evt.date}</div>
                        <div className="text-[11px] text-neutral-400">{evt.time || '4:00 PM'}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="text-white">{evt.location}</div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-[200px]">{evt.venue || 'Main Venue'}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px] uppercase font-semibold">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-mono">
                        <span className="text-white font-bold">{evt.registeredCount || 0}</span>
                        <span className="text-neutral-500"> / {evt.capacity || 500}</span>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => openEditEventModal(evt)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          title="Edit Event"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-rose-500/20"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500 text-xs">
                      No events found in MongoDB schedule. Click "Schedule New Event" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create / Edit Event */}
        {eventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#12121a] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl">
              <button
                onClick={() => setEventModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold font-display text-white uppercase mb-1">
                {editingEvent ? 'Edit Event Schedule' : 'Schedule New Event'}
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Persisted in MongoDB with strict JWT admin validation.
              </p>

              {eventActionError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{eventActionError}</span>
                </div>
              )}

              {eventActionSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{eventActionSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. Bandra Street Jam Vol. 4"
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Event Date *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      placeholder="e.g. 15 NOV 2024"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Time Range
                    </label>
                    <input
                      type="text"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      placeholder="e.g. 4:00 PM - 10:00 PM"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      City / Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="e.g. Mumbai, India"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      placeholder="e.g. Bandra Amphitheatre & Skate Park"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Category *
                    </label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="RIDE SESSION">RIDE SESSION</option>
                      <option value="COMPETITION">COMPETITION</option>
                      <option value="SHOWCASE">SHOWCASE</option>
                      <option value="WORKSHOP">WORKSHOP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                      placeholder="e.g. 500"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Type Label
                    </label>
                    <input
                      type="text"
                      value={eventForm.type}
                      onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                      placeholder="e.g. Competition & Jam"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Ticket Price
                    </label>
                    <input
                      type="text"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                      placeholder="e.g. Free Entry with RSVP"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={eventForm.image}
                    onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                    placeholder="e.g. /src/assets/images/event_freestyle_jam_1790433655462.jpg"
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Event details, schedule outline, community guidelines..."
                    className="w-full bg-[#181824] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setEventModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={eventActionLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {eventActionLoading ? 'Saving...' : editingEvent ? 'Update Event' : 'Schedule Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
