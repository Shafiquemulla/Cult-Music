import { Artist, EventItem, BlogItem, ServiceItem, SystemAnalytics, User } from '../types';

const TOKEN_KEY = 'cultmusic_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchArtists(category?: string, search?: string): Promise<Artist[]> {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (search) params.append('search', search);

  const res = await fetch(`/api/artists?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch artists');
  const data = await res.json();
  return data.artists;
}

export async function fetchArtistById(id: string): Promise<Artist> {
  const res = await fetch(`/api/artists/${id}`);
  if (!res.ok) throw new Error('Artist not found');
  const data = await res.json();
  return data.artist;
}

export async function createArtist(payload: Partial<Artist> & { name: string; genre: string }): Promise<Artist> {
  const res = await fetch('/api/artists', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create artist');
  return data.artist;
}

export async function updateArtist(id: string, payload: Partial<Artist>): Promise<Artist> {
  const res = await fetch(`/api/artists/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update artist');
  return data.artist;
}

export async function deleteArtist(id: string): Promise<{ message: string; id: string }> {
  const res = await fetch(`/api/artists/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete artist');
  return data;
}

export async function bookArtist(artistId: string, payload: {
  clientName: string;
  email: string;
  date: string;
  location?: string;
  budget?: string;
  details?: string;
}) {
  const res = await fetch(`/api/artists/${artistId}/book`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit booking inquiry');
  }
  return res.json();
}

export async function fetchEvents(category?: string): Promise<EventItem[]> {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);

  const res = await fetch(`/api/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data.events;
}

export async function fetchEventById(id: string): Promise<EventItem> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error('Event not found');
  const data = await res.json();
  return data.event;
}

export async function createEvent(payload: Partial<EventItem> & { title: string; date: string; location: string; category: string }): Promise<EventItem> {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create event');
  return data.event;
}

export async function updateEvent(id: string, payload: Partial<EventItem>): Promise<EventItem> {
  const res = await fetch(`/api/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update event');
  return data.event;
}

export async function deleteEvent(id: string): Promise<{ message: string; id: string }> {
  const res = await fetch(`/api/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete event');
  return data;
}

export async function registerForEvent(eventId: string, payload: {
  userName: string;
  userEmail: string;
  tier?: string;
}) {
  const res = await fetch(`/api/events/${eventId}/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to register for event');
  }
  return res.json();
}

export async function fetchBlogs(category?: string): Promise<BlogItem[]> {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);

  const res = await fetch(`/api/blogs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch blogs');
  const data = await res.json();
  return data.blogs;
}

export async function fetchBlogById(id: string): Promise<BlogItem> {
  const res = await fetch(`/api/blogs/${id}`);
  if (!res.ok) throw new Error('Blog post not found');
  const data = await res.json();
  return data.blog;
}

export async function addBlogComment(blogId: string, payload: { name: string; text: string }) {
  const res = await fetch(`/api/blogs/${blogId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to post comment');
  }
  return res.json();
}

export async function fetchServices(): Promise<ServiceItem[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to fetch services');
  const data = await res.json();
  return data.services;
}

export async function sendContact(payload: { name: string; email: string; subject?: string; message: string }) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send message');
  }
  return res.json();
}

export async function fetchAnalytics(): Promise<SystemAnalytics> {
  const res = await fetch('/api/admin/analytics', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch system analytics');
  const data = await res.json();
  return data.analytics;
}

export async function fetchDbStatus() {
  const res = await fetch('/api/db/status');
  if (!res.ok) throw new Error('Failed to check DB status');
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function verifyMfa(tempToken: string, mfaCode: string) {
  const res = await fetch('/api/auth/verify-mfa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, mfaCode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'MFA verification failed');
  return data;
}

export async function registerUser(name: string, email: string, password: string, enableMfa: boolean = false) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, enableMfa })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function fetchMe(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      setStoredToken(null);
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function generateAiShowreel(params: { mood?: string; bpm?: string; style?: string; theme?: string }) {
  const res = await fetch('/api/ai/generate-showreel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('AI showreel generation failed');
  return res.json();
}

export function subscribeToRealtimeStream(onEvent: (event: { type: string; data: any }) => void): () => void {
  try {
    const eventSource = new EventSource('/api/realtime/stream');
    
    eventSource.addEventListener('user_joined', (e) => onEvent({ type: 'user_joined', data: JSON.parse(e.data) }));
    eventSource.addEventListener('booking_created', (e) => onEvent({ type: 'booking_created', data: JSON.parse(e.data) }));
    eventSource.addEventListener('event_registration', (e) => onEvent({ type: 'event_registration', data: JSON.parse(e.data) }));
    eventSource.addEventListener('blog_comment', (e) => onEvent({ type: 'blog_comment', data: JSON.parse(e.data) }));
    eventSource.addEventListener('new_inquiry', (e) => onEvent({ type: 'new_inquiry', data: JSON.parse(e.data) }));

    return () => {
      eventSource.close();
    };
  } catch (err) {
    console.warn('Realtime SSE connection could not be established:', err);
    return () => {};
  }
}
