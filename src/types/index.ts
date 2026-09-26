export interface Track {
  title: string;
  duration: string;
  bpm: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  badge: string;
  genres: string[];
  category: string;
  location: string;
  image: string;
  featured: boolean;
  bio: string;
  quote: string;
  stats: {
    shows: number;
    communityMembers: string;
    reach: string;
  };
  socials: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    x?: string;
  };
  tracks: Track[];
}

export interface EventScheduleItem {
  time: string;
  activity: string;
}

export interface EventFaq {
  q: string;
  a: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  year: string;
  time: string;
  location: string;
  venue: string;
  category: string;
  type: string;
  image: string;
  featured: boolean;
  price: string;
  capacity: number;
  registeredCount: number;
  description: string;
  schedule: EventScheduleItem[];
  faqs: EventFaq[];
}

export interface BlogComment {
  id: string;
  name: string;
  text: string;
  date: string;
}

export interface BlogSection {
  heading?: string;
  paragraphs?: string[];
  quote?: string;
}

export interface BlogItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
  image: string;
  sections: BlogSection[];
  comments: BlogComment[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  bullets: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'listener' | 'artist' | 'admin';
  mfaEnabled: boolean;
  avatar?: string;
}

export interface Booking {
  id: string;
  artistId: string;
  artistName: string;
  clientName: string;
  email: string;
  date: string;
  location: string;
  budget: string;
  details: string;
  status: string;
  timestamp: string;
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  userName: string;
  userEmail: string;
  tier: string;
  timestamp: string;
}

export interface SystemAnalytics {
  totalListeners: number;
  activeNow: number;
  totalStreamMinutes: number;
  ticketSalesTotal: number;
  eventRegistrations: number;
  artistInquiries: number;
  liveStreamsViewers: number;
  uptimePercent: number;
  totalRegisteredUsers: number;
  totalEventsCount: number;
  totalArtistsCount: number;
  totalBookingsCount: number;
  totalRegistrationsCount: number;
  recentRegistrations: Registration[];
  recentBookings: Booking[];
  sseConnectionsCount: number;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'event' | 'music' | 'system' | 'booking';
  read: boolean;
}
