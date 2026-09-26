import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayerDock } from './components/AudioPlayerDock';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';
import { RegistrationModal } from './components/RegistrationModal';
import { AiShowreelModal } from './components/AiShowreelModal';
import { NotificationCenter } from './components/NotificationCenter';
import { SearchModal } from './components/SearchModal';

import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Artists } from './pages/Artists';
import { ArtistDetail } from './pages/ArtistDetail';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Blog } from './pages/Blog';
import { BlogArticle } from './pages/BlogArticle';
import { Contact } from './pages/Contact';
import { AdminDashboard } from './pages/AdminDashboard';

import { 
  Artist, EventItem, BlogItem, ServiceItem, User, PushNotification 
} from './types';
import { 
  fetchArtists, fetchEvents, fetchBlogs, fetchServices, fetchMe, 
  setStoredToken, subscribeToRealtimeStream, fetchDbStatus 
} from './services/api';
import { soundEngine } from './services/audioPlayer';
import { WifiOff, Sparkles } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingArtist, setBookingArtist] = useState<Artist | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [registrationEvent, setRegistrationEvent] = useState<EventItem | null>(null);
  const [aiShowreelModalOpen, setAiShowreelModalOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Real-time toast alert state
  const [toastAlert, setToastAlert] = useState<{ title: string; message: string } | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Notifications
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'n_welcome',
      title: 'Welcome to CULTMUSIC',
      message: 'Explore independent artists, underground BMX jams, and live audio synthesizers.',
      timestamp: 'Just now',
      type: 'system',
      read: false
    },
    {
      id: 'n_event',
      title: 'BMX Freestyle Jam Announced',
      message: 'RSVP is now open for Mumbai Amphitheatre. Register for your free pass!',
      timestamp: '10m ago',
      type: 'event',
      read: false
    }
  ]);

  // Load initial data
  useEffect(() => {
    async function init() {
      try {
        const [artistsData, eventsData, blogsData, servicesData, meUser, db] = await Promise.allSettled([
          fetchArtists(),
          fetchEvents(),
          fetchBlogs(),
          fetchServices(),
          fetchMe(),
          fetchDbStatus()
        ]);

        if (artistsData.status === 'fulfilled') setArtists(artistsData.value);
        if (eventsData.status === 'fulfilled') setEvents(eventsData.value);
        if (blogsData.status === 'fulfilled') setBlogs(blogsData.value);
        if (servicesData.status === 'fulfilled') setServices(servicesData.value);
        if (meUser.status === 'fulfilled' && meUser.value) setUser(meUser.value);
        if (db.status === 'fulfilled') setDbStatus(db.value);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();

    // Listen to network status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to Server-Sent Events (SSE)
    const unsubscribeSSE = subscribeToRealtimeStream((event) => {
      if (event.type === 'event_registration') {
        const title = 'New Event Registration';
        const msg = `${event.data.userName} reserved a pass for ${event.data.eventTitle}!`;
        addPushNotification(title, msg, 'event');
        // Update local event count
        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.data.eventId
              ? { ...e, registeredCount: event.data.registeredCount }
              : e
          )
        );
      } else if (event.type === 'booking_created') {
        const title = 'Artist Booking Proposal';
        const msg = `${event.data.client} requested booking for ${event.data.artist}`;
        addPushNotification(title, msg, 'booking');
      } else if (event.type === 'new_inquiry') {
        const title = 'New Message Received';
        const msg = `${event.data.name}: ${event.data.subject}`;
        addPushNotification(title, msg, 'system');
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSSE();
    };
  }, []);

  const addPushNotification = (title: string, message: string, type: 'event' | 'music' | 'system' | 'booking') => {
    const newNotif: PushNotification = {
      id: 'notif_' + Date.now(),
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Show floating toast
    setToastAlert({ title, message });
    setTimeout(() => {
      setToastAlert(null);
    }, 4500);
  };

  const handleLogout = () => {
    setStoredToken(null);
    setUser(null);
    addPushNotification('Logged Out', 'You have been successfully logged out of CULTMUSIC.', 'system');
    navigate('/');
  };

  const handleOpenBooking = (artist?: Artist) => {
    setBookingArtist(artist || (artists.length > 0 ? artists[0] : null));
    setBookingModalOpen(true);
  };

  const handleOpenRegister = (event?: EventItem) => {
    setRegistrationEvent(event || (events.length > 0 ? events[0] : null));
    setRegistrationModalOpen(true);
  };

  // Enforce strictly: Audio will ONLY play on the video, NOT other pages
  useEffect(() => {
    const isVideoPage = location.pathname === '/' || location.pathname === '';
    if (!isVideoPage && !aiShowreelModalOpen) {
      soundEngine.pause();
    }
  }, [location.pathname, aiShowreelModalOpen]);

  const handlePlayTrack = (title: string, bpm: string = '128') => {
    // Audio plays exclusively on video: open AI Video Player with soundtrack
    soundEngine.playTrack(title, bpm);
    setAiShowreelModalOpen(true);
    addPushNotification('Video Soundtrack', `Playing "${title}" in AI Video Experience`, 'music');
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col font-sans selection:bg-[#ff2a6d] selection:text-white pb-20">
      
      {/* Offline Status Ribbon */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs py-1 px-4 text-center font-semibold flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You are currently offline. Running in cached offline mode with local synthesizers.</span>
        </div>
      )}

      {/* Floating Push Notification Toast with new glowing hover effect */}
      {toastAlert && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm bg-[#181824] border border-[#ff2a6d]/50 rounded-2xl p-4 shadow-2xl shadow-[#ff2a6d]/20 animate-in slide-in-from-right-4 fade-in duration-200 hover:border-[#ff2a6d] transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#ff2a6d]/20 text-[#ff2a6d] shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{toastAlert.title}</h4>
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug">{toastAlert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar with dedicated Logout option & hover states */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenAiStudio={() => setAiShowreelModalOpen(true)}
        notifications={notifications}
        onOpenNotifications={() => setNotificationCenterOpen(!notificationCenterOpen)}
        onSearchOpen={() => setSearchModalOpen(true)}
      />

      {/* Separate Page Routes */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                artists={artists}
                events={events}
                onNavigate={(tab) => {
                  navigate(tab === 'home' ? '/' : `/${tab}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectArtist={(artist) => {
                  navigate(`/artists/${artist.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectEvent={(event) => {
                  navigate(`/events/${event.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAiShowreel={() => setAiShowreelModalOpen(true)}
                onPlayTrack={handlePlayTrack}
              />
            }
          />

          <Route
            path="/services"
            element={
              <Services
                services={services}
                onNavigate={(tab) => {
                  navigate(tab === 'home' ? '/' : `/${tab}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenBooking={() => handleOpenBooking()}
              />
            }
          />

          <Route
            path="/artists"
            element={
              <Artists
                artists={artists}
                onPlayTrack={handlePlayTrack}
              />
            }
          />

          <Route
            path="/artists/:id"
            element={
              <ArtistDetail
                artists={artists}
                onOpenBooking={() => handleOpenBooking()}
                onOpenAiShowreel={() => setAiShowreelModalOpen(true)}
                onPlayTrack={handlePlayTrack}
              />
            }
          />

          <Route
            path="/events"
            element={
              <Events
                events={events}
              />
            }
          />

          <Route
            path="/events/:id"
            element={
              <EventDetail
                events={events}
                onOpenRegister={(evt) => handleOpenRegister(evt)}
              />
            }
          />

          <Route
            path="/blog"
            element={
              <Blog
                blogs={blogs}
              />
            }
          />

          <Route
            path="/blog/:id"
            element={
              <BlogArticle
                allBlogs={blogs}
              />
            }
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/admin"
            element={
              <AdminDashboard
                onTriggerNotification={(title, msg) => addPushNotification(title, msg, 'system')}
                onLogout={handleLogout}
              />
            }
          />

          {/* Catch-all fallback */}
          <Route
            path="*"
            element={
              <Home
                artists={artists}
                events={events}
                onNavigate={(tab) => {
                  navigate(tab === 'home' ? '/' : `/${tab}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectArtist={(artist) => {
                  navigate(`/artists/${artist.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectEvent={(event) => {
                  navigate(`/events/${event.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAiShowreel={() => setAiShowreelModalOpen(true)}
                onPlayTrack={handlePlayTrack}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer with user session & logout option */}
      <Footer 
        dbStatus={dbStatus} 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setAuthModalOpen(true)} 
      />

      {/* Audio / Video Synthesizer Dock - strictly active only on video (Home video section or AI video modal) */}
      {(location.pathname === '/' || aiShowreelModalOpen) && (
        <AudioPlayerDock onOpenAiStudio={() => setAiShowreelModalOpen(true)} />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onLogout={handleLogout}
        onSuccess={(newUser) => {
          setUser(newUser);
          addPushNotification('Welcome', `Signed in as ${newUser.name}`, 'system');
        }}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        artist={bookingArtist || (artists.length > 0 ? artists[0] : null)}
        user={user}
        onBookingSuccess={(msg) => addPushNotification('Booking Request', msg, 'booking')}
      />

      <RegistrationModal
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        event={registrationEvent || (events.length > 0 ? events[0] : null)}
        user={user}
        onRegisteredSuccess={(msg) => addPushNotification('Pass Confirmed', msg, 'event')}
      />

      <AiShowreelModal
        isOpen={aiShowreelModalOpen}
        onClose={() => setAiShowreelModalOpen(false)}
      />

      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        artists={artists}
        events={events}
        blogs={blogs}
        onSelectArtist={(artist) => {
          navigate(`/artists/${artist.id}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectEvent={(event) => {
          navigate(`/events/${event.id}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectBlog={(blog) => {
          navigate(`/blog/${blog.slug || blog.id}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}
