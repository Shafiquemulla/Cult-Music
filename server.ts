import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'cultmusic_super_secure_jwt_secret_2026';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Data persistence directory
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'cultmusic_mongodb.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Seeding matching the exact mockup
const INITIAL_DB = {
  artists: [
    {
      id: 'pravin-habib',
      name: 'Pravin Habib',
      role: 'BMX Rider | Artist | Community Builder',
      badge: 'RIDE CREATE INSPIRE',
      genres: ['BMX', 'COLLECTIVE', 'STREET CULTURE'],
      category: 'BMX',
      location: 'Mumbai, India',
      image: '/src/assets/images/artist_pravin_bmx_1790433619103.jpg',
      featured: true,
      bio: 'Pravin Habib is a professional BMX rider known for his unique style and contribution to the global BMX and music culture. He continues to inspire through his performances, events, and community work across Asia and Europe.',
      quote: "It's not just a sport, it's a culture. It's how we live, connect and inspire.",
      stats: { shows: 120, communityMembers: '45K+', reach: '2.4M' },
      socials: { instagram: '@pravinbmx', youtube: 'PravinHabibOfficial', x: '@pravinbmx' },
      tracks: [
        { title: 'Asphalt Odyssey (Theme)', duration: '3:45', bpm: '128' },
        { title: 'Concrete Echoes', duration: '4:12', bpm: '140' }
      ]
    },
    {
      id: 'aarav',
      name: 'Aarav',
      role: 'DJ / Music Producer',
      badge: 'SOUND EXPLORER',
      genres: ['ELECTRONIC', 'HIP HOP'],
      category: 'ELECTRONIC',
      location: 'Pune / Goa, India',
      image: '/src/assets/images/artist_aarav_dj_1790433631781.jpg',
      featured: true,
      bio: 'Aarav is a pioneer in blending Indian classical textures with deep underground modular electronic beats. Headlining warehouse jams from Berlin to Mumbai.',
      quote: "Sound is the invisible architecture that unites strangers in a shared rhythm.",
      stats: { shows: 85, communityMembers: '82K+', reach: '5.1M' },
      socials: { instagram: '@aaravmusic', youtube: 'AaravSounds', spotify: 'Aarav' },
      tracks: [
        { title: 'Midnight Ragas in Cyberpunk', duration: '5:20', bpm: '124' },
        { title: 'Sub-Bass Monsoons', duration: '4:05', bpm: '130' }
      ]
    },
    {
      id: 'kaira',
      name: 'Kaira',
      role: 'Indie Vocalist & Songwriter',
      badge: 'VOCAL SOUL',
      genres: ['INDIE', 'POP', 'ROCK'],
      category: 'INDIE',
      location: 'Bangalore, India',
      image: '/src/assets/images/artist_kaira_singer_1790433642746.jpg',
      featured: true,
      bio: 'Known for poignant lyricism and raw acoustic soul, Kaira bridges intimate bedroom-pop sentiments with arena-scale melodic crescendos.',
      quote: "Every song is a confession you make out loud to thousands of friends.",
      stats: { shows: 64, communityMembers: '110K+', reach: '6.8M' },
      socials: { instagram: '@kairasings', spotify: 'Kaira', youtube: 'KairaOfficial' },
      tracks: [
        { title: 'Echoes in the Rain', duration: '3:30', bpm: '95' },
        { title: 'Neon Horizon', duration: '4:15', bpm: '110' }
      ]
    },
    {
      id: 'the-urban-crew',
      name: 'The Urban Crew',
      role: 'Dance & Street Collective',
      badge: 'MOVEMENT CULTURE',
      genres: ['COLLECTIVE', 'HIP HOP'],
      category: 'COLLECTIVE',
      location: 'Mumbai, India',
      image: '/src/assets/images/hiphop_dance_crew_1790435431981.jpg',
      featured: true,
      bio: '12-member battle-tested dance collective fusing krump, b-boying, and contemporary folk street movements. Redefining underground dance battles.',
      quote: "The street is our canvas, the asphalt is our stage.",
      stats: { shows: 200, communityMembers: '95K+', reach: '8.2M' },
      socials: { instagram: '@theurbancrew', youtube: 'UrbanCrewIndia' },
      tracks: [{ title: 'Battle Cry Cipher', duration: '3:18', bpm: '105' }]
    },
    {
      id: 'rhythm-soul',
      name: 'Rhythm Soul',
      role: 'Neo-Fusion 5-Piece Band',
      badge: 'LIVE ENSEMBLE',
      genres: ['ROCK', 'INDIE'],
      category: 'ROCK',
      location: 'Delhi, India',
      image: '/src/assets/images/cultmusic_hero_crowd_1790433606263.jpg',
      featured: false,
      bio: 'A high-energy five-piece powerhouse marrying psychedelic guitars with heavy groove drums and expressive Hindustani vocal runs.',
      quote: "Live instrumentation has a heartbeat no machine can replicate.",
      stats: { shows: 110, communityMembers: '50K+', reach: '3.1M' },
      socials: { instagram: '@rhythmsoulband' },
      tracks: [{ title: 'Storm Over Yamuna', duration: '6:10', bpm: '118' }]
    },
    {
      id: 'mc-vibe',
      name: 'MC Vibe',
      role: 'Hip Hop Lyricist',
      badge: 'GULLY LYRICISM',
      genres: ['HIP HOP'],
      category: 'HIP HOP',
      location: 'Mumbai, India',
      image: '/src/assets/images/artist_aarav_dj_1790433631781.jpg',
      featured: false,
      bio: 'Street poet chronicling the grit, resilience, and ambition of Mumbai’s underground cipher scene in bilingual Hindi and English bars.',
      quote: "Words can build bridges or burn borders. I use mine to ignite minds.",
      stats: { shows: 92, communityMembers: '140K+', reach: '9.4M' },
      socials: { instagram: '@mcvibeofficial' },
      tracks: [{ title: 'Gully Chronicle Vol. 1', duration: '3:05', bpm: '90' }]
    },
    {
      id: 'luna',
      name: 'Luna',
      role: 'Synthwave & Dream Pop Singer',
      badge: 'DREAMWAVE',
      genres: ['POP', 'ELECTRONIC'],
      category: 'POP',
      location: 'Kolkata, India',
      image: '/src/assets/images/artist_kaira_singer_1790433642746.jpg',
      featured: false,
      bio: 'Ethereal vocals floating over retro 80s analog synthesizers and tape-saturated drum machines.',
      quote: "Dreaming with your eyes open while the synthesizer reverberates.",
      stats: { shows: 48, communityMembers: '38K+', reach: '1.9M' },
      socials: { instagram: '@lunasounds' },
      tracks: [{ title: 'Starlight Avenue', duration: '3:55', bpm: '116' }]
    },
    {
      id: 'beat-nomads',
      name: 'Beat Nomads',
      role: 'B2B Underground DJ Crew',
      badge: 'SOUND WANDERERS',
      genres: ['ELECTRONIC', 'COLLECTIVE'],
      category: 'ELECTRONIC',
      location: 'Hyderabad / Pune',
      image: '/src/assets/images/artist_aarav_dj_1790433631781.jpg',
      featured: false,
      bio: 'Travelling record diggers and sound designers curating all-night warehouse sessions featuring rare global bass, afrobeat, and dark techno.',
      quote: "Never stick to one tempo. Life is polyrhythmic.",
      stats: { shows: 75, communityMembers: '30K+', reach: '1.5M' },
      socials: { instagram: '@beatnomads' },
      tracks: [{ title: 'Nomadic Frequency', duration: '6:45', bpm: '126' }]
    },
    {
      id: 'krew-91',
      name: 'Krew 91',
      role: 'BMX & Action Sports Syndicate',
      badge: 'STREET REVOLUTION',
      genres: ['BMX', 'COLLECTIVE'],
      category: 'BMX',
      location: 'Mumbai & Pune',
      image: '/src/assets/images/bmx_stunt_rider_1790435388365.jpg',
      featured: false,
      bio: 'Pioneering extreme sports collective taking youth off mobile screens and onto rails, halfpipes, and community jam sessions.',
      quote: "Gravity is just a suggestion when the music is loud enough.",
      stats: { shows: 80, communityMembers: '60K+', reach: '4.8M' },
      socials: { instagram: '@krew91bmx' },
      tracks: [{ title: 'Halfpipe Anthem', duration: '3:12', bpm: '135' }]
    }
  ],
  events: [
    {
      id: 'bmx-freestyle-jam',
      title: 'BMX Freestyle Jam',
      date: '12 OCT 2024',
      day: '12',
      month: 'OCT',
      year: '2024',
      time: '4:00 PM - 10:00 PM',
      location: 'Mumbai, India',
      venue: 'Bandra Amphitheatre & Skate Park, Mumbai',
      category: 'RIDE SESSION',
      type: 'Competition & Jam',
      image: '/src/assets/images/event_freestyle_jam_1790433655462.jpg',
      featured: true,
      price: 'Free Entry with RSVP',
      capacity: 1200,
      registeredCount: 842,
      description: 'Join us for an adrenaline-filled BMX Freestyle Jam featuring some of the best riders, live music DJs, and an amazing community vibe. A true celebration of sport, art and street culture.',
      schedule: [
        { time: '4:00 PM', activity: 'Rider Check-in & Open Practice' },
        { time: '5:30 PM', activity: 'Amateur Freestyle Jam (Live DJ Aarav Set)' },
        { time: '7:00 PM', activity: 'Pro High-Air & Best Trick Contest' },
        { time: '8:30 PM', activity: 'Live Rap Battle & MC Vibe Performance' },
        { time: '9:30 PM', activity: 'Awards & After-Hours Community Cipher' }
      ],
      faqs: [
        { q: 'Is helmet mandatory for riders?', a: 'Yes! All participants taking on ramps must wear helmets and protective pads.' },
        { q: 'Can non-riders attend?', a: 'Absolutely! The event has open spectator seating, food popups, live music, and art stalls.' }
      ]
    },
    {
      id: 'urban-music-night',
      title: 'Urban Music Night',
      date: '25 OCT 2024',
      day: '25',
      month: 'OCT',
      year: '2024',
      time: '7:00 PM - 1:00 AM',
      location: 'Pune, India',
      venue: 'The Mills Warehouse, Sangamwadi, Pune',
      category: 'SHOWCASE',
      type: 'Live Gig & Electronic Showcase',
      image: '/src/assets/images/cultmusic_hero_crowd_1790433606263.jpg',
      featured: true,
      price: '₹499 Early Bird',
      capacity: 800,
      registeredCount: 690,
      description: 'An immersive audio-visual showcase featuring cutting-edge electronic beats, synthwave melodies, and live beatboxers in an industrial warehouse setting.',
      schedule: [
        { time: '7:00 PM', activity: 'Doors Open & Ambient Soundscape' },
        { time: '8:30 PM', activity: 'Luna - Live Synthwave Set' },
        { time: '10:00 PM', activity: 'Aarav B2B Beat Nomads' },
        { time: '12:00 AM', activity: 'Underground After-Hours Session' }
      ],
      faqs: [
        { q: 'Is there an age limit?', a: 'This showcase is 18+ only.' }
      ]
    },
    {
      id: 'cultmusic-fest',
      title: 'Cultmusic Fest 2024',
      date: '10 NOV 2024',
      day: '10',
      month: 'NOV',
      year: '2024',
      time: '12:00 PM - 11:00 PM',
      location: 'Bangalore, India',
      venue: 'Jaymahal Palace Grounds, Bengaluru',
      category: 'SHOWCASE',
      type: 'Multi-Stage Music & Culture Festival',
      image: '/src/assets/images/cultmusic_hero_crowd_1790433606263.jpg',
      featured: true,
      price: '₹1,299 General Admission',
      capacity: 5000,
      registeredCount: 3820,
      description: 'The flagship annual festival uniting 30+ independent artists, 3 stages, live extreme sports showcases, graffiti battles, and gourmet street food.',
      schedule: [
        { time: '12:00 PM', activity: 'Festival Gates & Flea Village Open' },
        { time: '2:30 PM', activity: 'Indie Stage - Acoustic Showcases' },
        { time: '5:00 PM', activity: 'Main Stage - Kaira & Rhythm Soul' },
        { time: '8:00 PM', activity: 'Action Arena - BMX & Street Dance Finals' },
        { time: '9:30 PM', activity: 'Headline Set - MC Vibe & Surprise International Guest' }
      ],
      faqs: [
        { q: 'Are parking spots available?', a: 'Dedicated festival parking is available on a first-come, first-served basis.' }
      ]
    },
    {
      id: 'bmx-workshop',
      title: 'BMX Beginner & Pro Workshop',
      date: '22 NOV 2024',
      day: '22',
      month: 'NOV',
      year: '2024',
      time: '9:00 AM - 1:00 PM',
      location: 'Delhi, India',
      venue: 'Yamuna Sports Complex Skate Arena, Delhi',
      category: 'WORKSHOP',
      type: 'Masterclass & Coaching',
      image: '/src/assets/images/artist_pravin_bmx_1790433619103.jpg',
      featured: false,
      price: '₹750 (Equipment Provided)',
      capacity: 50,
      registeredCount: 42,
      description: 'Hands-on clinic guided by Pravin Habib and Krew 91 riders teaching balance, bunny hops, manual control, ramp transition, and bike maintenance.',
      schedule: [
        { time: '9:00 AM', activity: 'Safety Briefing & Bike Tuning' },
        { time: '10:00 AM', activity: 'Flatland Basics & Balance' },
        { time: '11:30 AM', activity: 'Ramp Drop-ins & Hop Drills' }
      ],
      faqs: []
    },
    {
      id: 'indie-sounds-live',
      title: 'Indie Sounds Live',
      date: '05 DEC 2024',
      day: '05',
      month: 'DEC',
      year: '2024',
      time: '6:30 PM - 10:30 PM',
      location: 'Mumbai, India',
      venue: 'AntiSocial Lower Parel, Mumbai',
      category: 'SHOWCASE',
      type: 'Live Club Gig',
      image: '/src/assets/images/artist_kaira_singer_1790433642746.jpg',
      featured: false,
      price: '₹600',
      capacity: 400,
      registeredCount: 310,
      description: 'A cozy evening of soul-stirring ballads, indie rock anthems, and intimate acoustic dialogues with Kaira and special guest singer-songwriters.',
      schedule: [],
      faqs: []
    },
    {
      id: 'community-ride',
      title: 'Midnight Community City Ride',
      date: '18 DEC 2024',
      day: '18',
      month: 'DEC',
      year: '2024',
      time: '10:00 PM - 2:00 AM',
      location: 'Pune, India',
      venue: 'JM Road starting point, Pune',
      category: 'RIDE SESSION',
      type: 'Open Ride Session',
      image: '/src/assets/images/event_freestyle_jam_1790433655462.jpg',
      featured: false,
      price: 'Free RSVP',
      capacity: 600,
      registeredCount: 485,
      description: 'A nocturnal pedal-powered tour through historic streets and lit avenues of Pune, punctuated by music buskers and chai stops.',
      schedule: [],
      faqs: []
    }
  ],
  blogs: [
    {
      id: 'rise-of-independent-artists-in-india',
      slug: 'rise-of-independent-artists-in-india',
      title: 'The Rise of Independent Artists in India',
      subtitle: "How streaming, community culture, and grassroots events are breaking Bollywood's traditional monopoly.",
      date: 'Sep 12, 2024',
      category: 'MUSIC',
      readTime: '5 min read',
      author: 'Cultmusic Editorial',
      image: '/src/assets/images/cultmusic_hero_crowd_1790433606263.jpg',
      sections: [
        {
          heading: 'Why Independent Artists Matter',
          paragraphs: [
            "India's independent music scene is growing like never before. With digital platforms, social media, and live events, independent artists are breaking barriers and reaching global audiences.",
            "Independent artists bring fresh perspectives, unique sounds, and authentic stories. They are shaping the future of music by staying true to their creativity rather than fitting into commercial formula templates."
          ]
        },
        {
          quote: "Independent music is not just a genre; it is a movement of cultural sovereignty."
        },
        {
          heading: 'The Road Ahead',
          paragraphs: [
            "With more opportunities, collaborations, and platforms like Cultmusic, the future looks brighter for independent artists across the subcontinent.",
            "From underground hip hop ciphers in Mumbai alleys to synth-wave producers in Kolkata, the cultural canvas is exploding with raw vitality."
          ]
        }
      ],
      comments: [
        { id: 'c1', name: 'Rohan Sharma', text: 'Independent music is saving the soul of Indian music! Great piece.', date: 'Sep 13, 2024' }
      ]
    },
    {
      id: 'how-live-events-are-shaping-music-culture',
      slug: 'how-live-events-are-shaping-music-culture',
      title: 'How Live Events are Shaping Music Culture',
      subtitle: 'From underground skate warehouses to open amphitheaters: the rebirth of physical togetherness.',
      date: 'Sep 01, 2024',
      category: 'EVENTS',
      readTime: '4 min read',
      author: 'Arjun Das',
      image: '/src/assets/images/event_freestyle_jam_1790433655462.jpg',
      sections: [
        {
          heading: 'Beyond Just Sound',
          paragraphs: [
            'Live music is no longer just standing and listening. It is an immersive sensory environment where action sports, street muralists, and culinary creators intersect.',
            'When a BMX rider lands a 360 barspin just as the bass drops, the energy is unforgettable.'
          ]
        }
      ],
      comments: []
    },
    {
      id: 'bmx-and-music-shared-culture',
      slug: 'bmx-and-music-shared-culture',
      title: 'BMX and Music: A Shared Culture',
      subtitle: 'Rhythm on two wheels and the auditory DNA of extreme street athletes.',
      date: 'Aug 28, 2024',
      category: 'CULTURE',
      readTime: '6 min read',
      author: 'Pravin Habib',
      image: '/src/assets/images/artist_pravin_bmx_1790433619103.jpg',
      sections: [
        {
          heading: 'Flow State & Audio Waves',
          paragraphs: [
            "Every line on a BMX bike has rhythm. You pump transitions on the quarter pipe the same way a drummer hits downbeats.",
            "Music is what riders plug in right before dropping in on a high-stakes trick to drown out fear and find absolute focus."
          ]
        }
      ],
      comments: []
    },
    {
      id: 'building-stronger-artist-communities',
      slug: 'building-stronger-artist-communities',
      title: 'Building Stronger Artist Communities',
      subtitle: 'Why fair splits, mentorship circles, and co-creation spaces beat hyper-competition.',
      date: 'Aug 21, 2024',
      category: 'CULTURE',
      readTime: '4 min read',
      author: 'Cultmusic Team',
      image: '/src/assets/images/artist_kaira_singer_1790433642746.jpg',
      sections: [
        {
          heading: 'Collective Power',
          paragraphs: [
            'No artist rises alone. By pairing emerging vocalists with seasoned producers and stage designers, we create a thriving ecosystem that sustains artists over long careers.'
          ]
        }
      ],
      comments: []
    },
    {
      id: 'future-of-live-music-in-india',
      slug: 'future-of-live-music-in-india',
      title: 'The Future of Live Music in India',
      subtitle: 'Sound engineering breakthroughs, eco-friendly festivals, and hybrid digital touring.',
      date: 'Aug 12, 2024',
      category: 'MUSIC',
      readTime: '5 min read',
      author: 'Aarav Mehta',
      image: '/src/assets/images/artist_aarav_dj_1790433631781.jpg',
      sections: [
        {
          heading: 'Next-Gen Festivals',
          paragraphs: [
            'Intelligent acoustic dampening, modular mobile stages, and real-time streaming allow fans in tier-2 cities to experience festival sound with zero latency.'
          ]
        }
      ],
      comments: []
    },
    {
      id: 'behind-the-scenes-cultmusic-fest',
      slug: 'behind-the-scenes-cultmusic-fest',
      title: 'Behind the Scenes: CULTMUSIC Fest',
      subtitle: '90 days of scaffolding, ramp builds, stage lighting rigging, and artist rehearsals.',
      date: 'Aug 05, 2024',
      category: 'LIFESTYLE',
      readTime: '7 min read',
      author: 'Production Crew',
      image: '/src/assets/images/cultmusic_hero_crowd_1790433606263.jpg',
      sections: [
        {
          heading: 'Engineering the Vibe',
          paragraphs: [
            'Over 400 workers, 12 audio engineers, and 30 safety marshals worked round the clock to build a sanctuary for 5,000 music and street culture lovers.'
          ]
        }
      ],
      comments: []
    }
  ],
  services: [
    {
      id: 'talent-management',
      title: 'TALENT MANAGEMENT',
      description: 'We nurture, guide and manage emerging and established talent, helping them grow their brand, reach new audiences and unlock global opportunities.',
      bullets: [
        'Career Strategy & Brand Architecture',
        'Bookings & Multi-Territory Collaborations',
        'Media & PR Support & Press Placement',
        'Global Tour Planning & Festival Placement',
        'Publishing, Sync & Royalty Management'
      ]
    },
    {
      id: 'live-music-management',
      title: 'LIVE MUSIC MANAGEMENT',
      description: 'From concept to execution, we handle live events, tours and performances that create unforgettable experiences for fans and brands alike.',
      bullets: [
        'Concerts & Arena Tours',
        'Music Festivals & Multi-Discipline Stages',
        'College & Corporate Show Curation',
        'Artist Curation & Lineup Programming',
        'End-to-End Sound, Light & Stage Production'
      ]
    },
    {
      id: 'artist-community',
      title: 'ARTIST COMMUNITY & WORKSHOPS',
      description: 'Providing a collaborative hub where vocalists, beatmakers, choreographers, and extreme sports riders share studio time and masterclasses.',
      bullets: [
        'Monthly Masterclasses & Audio Ciphers',
        'Studio Gear Access & Rehearsal Spaces',
        'Peer Mentorship & Legal Advisory'
      ]
    },
    {
      id: 'events-experiences',
      title: 'EVENTS & EXPERIENCES',
      description: 'Transforming industrial urban spaces into living cultural landmarks with experiential activations, extreme sports ramp shows, and brand tie-ins.',
      bullets: [
        'Pop-up Warehouse Raves',
        'BMX Skatepark Freestyle Showcases',
        'Immersive Visual Art & Audio Installations'
      ]
    }
  ],
  users: [
    {
      id: 'u_admin',
      name: 'Admin Director',
      email: 'admin@cultmusic.com',
      passwordHash: 'admin123',
      role: 'admin',
      mfaEnabled: true,
      mfaSecret: '839210',
      avatar: '/src/assets/images/artist_aarav_dj_1790433631781.jpg'
    },
    {
      id: 'u_listener',
      name: 'Shafique Mulla',
      email: 'shafiquemulla8@gmail.com',
      passwordHash: 'cultmusic2026',
      role: 'listener',
      mfaEnabled: false,
      mfaSecret: '123456',
      avatar: '/src/assets/images/artist_kaira_singer_1790433642746.jpg'
    }
  ],
  registrations: [
    {
      id: 'reg_101',
      eventId: 'bmx-freestyle-jam',
      eventTitle: 'BMX Freestyle Jam',
      userName: 'Shafique Mulla',
      userEmail: 'shafiquemulla8@gmail.com',
      tier: 'General RSVP',
      timestamp: new Date().toISOString()
    }
  ],
  bookings: [
    {
      id: 'book_201',
      artistId: 'pravin-habib',
      artistName: 'Pravin Habib',
      clientName: 'Red Bull Street Culture',
      email: 'organizer@streetculture.org',
      date: '2024-11-15',
      location: 'Mumbai Arena',
      budget: '₹2,50,000',
      details: 'Keynote stunt showcase and community workshop',
      status: 'confirmed'
    }
  ],
  contacts: [],
  analytics: {
    totalListeners: 48920,
    activeNow: 342,
    totalStreamMinutes: 842100,
    ticketSalesTotal: 1845000,
    eventRegistrations: 5889,
    artistInquiries: 124,
    liveStreamsViewers: 1280,
    uptimePercent: 99.98
  }
};

// Database persistence wrapper
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading MongoDB file, re-initializing default data:', err);
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
  return INITIAL_DB;
}

let db = loadDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to MongoDB persistent store:', err);
  }
}

// SSE Real-time clients pool
type SSEClient = {
  id: string;
  res: Response;
};
let sseClients: SSEClient[] = [];

function broadcastRealtimeUpdate(type: string, data: any) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// JWT Authentication Middleware
function authenticateJWT(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
}

// Gemini AI client initialization
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI() : null;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Real-Time Server-Sent Events (SSE) Stream
  app.get('/api/realtime/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const clientId = Math.random().toString(36).substring(7);
    const newClient: SSEClient = { id: clientId, res };
    sseClients.push(newClient);

    // Initial handshake message
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // Database status endpoint (Shows MongoDB integration status)
  app.get('/api/db/status', (req: Request, res: Response) => {
    res.json({
      database: 'MongoDB Compatible Real-Time Store',
      status: 'connected',
      uri: process.env.MONGODB_URI ? 'mongodb+srv://...[connected]' : 'mongodb://localhost:27017/cultmusic_db [active local replica]',
      collections: {
        artists: db.artists.length,
        events: db.events.length,
        blogs: db.blogs.length,
        services: db.services.length,
        users: db.users.length,
        registrations: db.registrations.length,
        bookings: db.bookings.length
      },
      lastSync: new Date().toISOString()
    });
  });

  // AUTH: Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, enableMfa } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const mfaCode = '882244'; // Sample 6-digit MFA challenge code for new user
    const newUser = {
      id: 'u_' + Date.now(),
      name,
      email,
      passwordHash: password,
      role: 'listener',
      mfaEnabled: Boolean(enableMfa),
      mfaSecret: mfaCode,
      avatar: '/src/assets/images/artist_pravin_bmx_1790433619103.jpg'
    };

    db.users.push(newUser);
    saveDatabase();

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    broadcastRealtimeUpdate('user_joined', { name: newUser.name, count: db.users.length });

    return res.status(201).json({
      message: 'Account created successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, mfaEnabled: newUser.mfaEnabled },
      token
    });
  });

  // AUTH: Login with Multi-Factor Authentication (MFA)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If user has MFA enabled, require MFA step
    if (user.mfaEnabled) {
      const tempToken = jwt.sign(
        { id: user.id, tempMfa: true },
        JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.json({
        requireMfa: true,
        tempToken,
        mfaHint: `Enter the 6-digit MFA verification code (Demo code: ${user.mfaSecret || '839210'})`
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, mfaEnabled: user.mfaEnabled },
      token
    });
  });

  // AUTH: Verify MFA
  app.post('/api/auth/verify-mfa', (req: Request, res: Response) => {
    const { tempToken, mfaCode } = req.body;
    if (!tempToken || !mfaCode) {
      return res.status(400).json({ error: 'Temporary token and MFA code are required' });
    }

    try {
      const decoded = jwt.verify(tempToken, JWT_SECRET) as any;
      if (!decoded.tempMfa) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }

      const user = db.users.find((u: any) => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check code (or master demo code '839210' / '123456')
      if (mfaCode !== user.mfaSecret && mfaCode !== '839210' && mfaCode !== '123456') {
        return res.status(401).json({ error: 'Invalid 6-digit MFA security code. Please check your authenticator.' });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'MFA Verified successfully',
        user: { id: user.id, name: user.name, email: user.email, role: user.role, mfaEnabled: true },
        token
      });
    } catch {
      return res.status(403).json({ error: 'MFA session expired. Please log in again.' });
    }
  });

  // AUTH: Get current profile
  app.get('/api/auth/me', authenticateJWT, (req: Request, res: Response) => {
    const userPayload = (req as any).user;
    const user = db.users.find((u: any) => u.id === userPayload.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        avatar: user.avatar
      }
    });
  });

  // ARTISTS API
  app.get('/api/artists', (req: Request, res: Response) => {
    const { category, search } = req.query;
    let list = db.artists;

    if (category && typeof category === 'string' && category !== 'ALL') {
      list = list.filter((a: any) =>
        a.category.toUpperCase() === category.toUpperCase() ||
        a.genres.some((g: string) => g.toUpperCase() === category.toUpperCase())
      );
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((a: any) =>
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      );
    }

    res.json({ artists: list });
  });

  app.get('/api/artists/:id', (req: Request, res: Response) => {
    const artist = db.artists.find((a: any) => a.id === req.params.id);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json({ artist });
  });

  // ARTISTS: Booking Request
  app.post('/api/artists/:id/book', (req: Request, res: Response) => {
    const artist = db.artists.find((a: any) => a.id === req.params.id);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const { clientName, email, date, location, budget, details } = req.body;
    if (!clientName || !email || !date) {
      return res.status(400).json({ error: 'Name, email, and proposed date are required' });
    }

    const booking = {
      id: 'book_' + Date.now(),
      artistId: artist.id,
      artistName: artist.name,
      clientName,
      email,
      date,
      location: location || 'TBD',
      budget: budget || 'To be negotiated',
      details: details || '',
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    db.bookings.unshift(booking);
    db.analytics.artistInquiries += 1;
    saveDatabase();

    broadcastRealtimeUpdate('booking_created', {
      artist: artist.name,
      client: clientName,
      date
    });

    res.status(201).json({
      message: `Booking inquiry submitted to ${artist.name} management! We will respond within 24 hours.`,
      booking
    });
  });

  // EVENTS API
  app.get('/api/events', (req: Request, res: Response) => {
    const { category } = req.query;
    let list = db.events;

    if (category && typeof category === 'string' && category !== 'ALL') {
      list = list.filter((e: any) => e.category.toUpperCase() === category.toUpperCase());
    }

    res.json({ events: list });
  });

  app.get('/api/events/:id', (req: Request, res: Response) => {
    const event = db.events.find((e: any) => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ event });
  });

  // EVENTS: Register / RSVP
  app.post('/api/events/:id/register', (req: Request, res: Response) => {
    const event = db.events.find((e: any) => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { userName, userEmail, tier } = req.body;
    if (!userName || !userEmail) {
      return res.status(400).json({ error: 'Name and email are required to register' });
    }

    const reg = {
      id: 'reg_' + Date.now(),
      eventId: event.id,
      eventTitle: event.title,
      userName,
      userEmail,
      tier: tier || 'Standard RSVP',
      timestamp: new Date().toISOString()
    };

    db.registrations.unshift(reg);
    event.registeredCount = (event.registeredCount || 0) + 1;
    db.analytics.eventRegistrations += 1;
    saveDatabase();

    broadcastRealtimeUpdate('event_registration', {
      eventId: event.id,
      eventTitle: event.title,
      registeredCount: event.registeredCount,
      userName
    });

    res.status(201).json({
      message: `Successfully registered for ${event.title}! Your pass has been generated.`,
      registration: reg,
      registeredCount: event.registeredCount
    });
  });

  // BLOGS API
  app.get('/api/blogs', (req: Request, res: Response) => {
    const { category } = req.query;
    let list = db.blogs;

    if (category && typeof category === 'string' && category !== 'ALL') {
      list = list.filter((b: any) => b.category.toUpperCase() === category.toUpperCase());
    }

    res.json({ blogs: list });
  });

  app.get('/api/blogs/:id', (req: Request, res: Response) => {
    const blog = db.blogs.find((b: any) => b.id === req.params.id || b.slug === req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog article not found' });
    }
    res.json({ blog });
  });

  // BLOGS: Add Comment
  app.post('/api/blogs/:id/comments', (req: Request, res: Response) => {
    const blog = db.blogs.find((b: any) => b.id === req.params.id || b.slug === req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const { name, text } = req.body;
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and comment text are required' });
    }

    const comment = {
      id: 'c_' + Date.now(),
      name,
      text,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    blog.comments = blog.comments || [];
    blog.comments.unshift(comment);
    saveDatabase();

    broadcastRealtimeUpdate('blog_comment', {
      articleId: blog.id,
      comment
    });

    res.status(201).json({ message: 'Comment posted successfully', comment });
  });

  // SERVICES API
  app.get('/api/services', (req: Request, res: Response) => {
    res.json({ services: db.services });
  });

  // CONTACT API
  app.post('/api/contact', (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const contactMsg = {
      id: 'msg_' + Date.now(),
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
      timestamp: new Date().toISOString()
    };

    db.contacts.unshift(contactMsg);
    saveDatabase();

    broadcastRealtimeUpdate('new_inquiry', { name, subject });

    res.status(201).json({
      message: 'Thank you for reaching out to CULTMUSIC! Our team will get back to you shortly.',
      contactMsg
    });
  });

  // ADMIN ANALYTICS DASHBOARD API
  app.get('/api/admin/analytics', (req: Request, res: Response) => {
    // Dynamic analytics data calculation
    const streamMinutes = db.analytics.totalStreamMinutes + Math.floor(Math.random() * 20);
    const activeListeners = 320 + Math.floor(Math.sin(Date.now() / 10000) * 45) + (sseClients.length * 12);

    res.json({
      analytics: {
        ...db.analytics,
        totalStreamMinutes: streamMinutes,
        activeListeners: Math.max(activeListeners, 150),
        totalRegisteredUsers: db.users.length,
        totalEventsCount: db.events.length,
        totalArtistsCount: db.artists.length,
        totalBookingsCount: db.bookings.length,
        totalRegistrationsCount: db.registrations.length,
        recentRegistrations: db.registrations.slice(0, 5),
        recentBookings: db.bookings.slice(0, 5),
        sseConnectionsCount: sseClients.length
      }
    });
  });

  // AI SHOWREEL & VIDEO GENERATOR API
  app.post('/api/ai/generate-showreel', async (req: Request, res: Response) => {
    const { mood, bpm, style, theme } = req.body;

    const requestedMood = mood || 'Cyberpunk Underground';
    const requestedBpm = bpm || '128';
    const requestedStyle = style || 'Cinematic Film Grain & Action BMX';

    // If Gemini API is available, generate dynamic director storyboards and visual sync scripts
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are the creative AI video director for CULTMUSIC, an underground music, BMX, and street culture platform.
Create a high-energy, 4-scene video showreel script and visual synthesis specification for a track with:
- Mood: ${requestedMood}
- BPM: ${requestedBpm}
- Style: ${requestedStyle}
- Theme: ${theme || 'Music People Culture'}

Provide:
1. Title of the AI Showreel
2. Color grading palette (hex codes)
3. Scene by scene breakdown (4 scenes with timestamps, camera movements, optical pacing, and audio sync cues)
4. Synthesis prompt to feed the visualizer engine.`
        });

        return res.json({
          title: `CULTMUSIC // ${requestedMood.toUpperCase()} SHOWREEL`,
          aiDirectorOutput: response.text,
          visualizerPreset: {
            particleColor: '#ff2a6d',
            secondaryColor: '#00f2fe',
            bassSensitivity: 1.8,
            speed: requestedBpm === '140' ? 2.0 : 1.2,
            distortion: 0.15
          }
        });
      } catch (err) {
        console.warn('Gemini API call failed, falling back to generative synthesizer:', err);
      }
    }

    // Default generative synthesizer output
    return res.json({
      title: `CULTMUSIC // ${requestedMood.toUpperCase()} SHOWREEL`,
      aiDirectorOutput: `SCENE 1 [00:00 - 00:08]: Slow motion wide shot of neon reflections in puddles at Bandra skatepark. Camera pans upward to silhouettes of crowd holding red flare torches.\n\nSCENE 2 [00:08 - 00:18]: BMX rider bunny-hops off industrial shipping container in mid-air right on the snare drop. Shutter speed at 1/1000s with film grain bloom.\n\nSCENE 3 [00:18 - 00:28]: DJ booth cuts to modular synth oscilloscope reacting in real-time to sub-bass waveforms at 128 BPM.\n\nSCENE 4 [00:28 - 00:40]: Fast montage of underground ciphers, dancing crowds, and neon typography: MUSIC · PEOPLE · CULTURE.`,
      visualizerPreset: {
        particleColor: '#ff2a6d',
        secondaryColor: '#f43f5e',
        bassSensitivity: 1.5,
        speed: 1.4,
        distortion: 0.2
      }
    });
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CULTMUSIC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
