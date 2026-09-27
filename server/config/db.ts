import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 */
export const connectDB = async (): Promise<typeof mongoose | null> => {
  const rawMongoURI = process.env.MONGODB_URI?.trim();

  if (!rawMongoURI) {
    console.warn('⚠️  [MongoDB] MONGODB_URI is not set in environment variables. MongoDB connection skipped.');
    return null;
  }

  // Validate scheme: must start with mongodb:// or mongodb+srv:// and not be an unconfigured placeholder
  const isValidScheme = rawMongoURI.startsWith('mongodb://') || rawMongoURI.startsWith('mongodb+srv://');
  const isPlaceholder = rawMongoURI.includes('<username>') || rawMongoURI.includes('<password>') || !isValidScheme;

  if (isPlaceholder || !isValidScheme) {
    console.warn('⚠️  [MongoDB] MONGODB_URI is not a valid MongoDB connection string. Expected a URI starting with "mongodb://" or "mongodb+srv://". MongoDB connection skipped.');
    return null;
  }

  try {
    const conn = await mongoose.connect(rawMongoURI);
    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    
    // Seed initial users if they don't exist
    await seedInitialUsers();
    // Seed initial artists if they don't exist
    await seedInitialArtists();
    // Seed initial events if they don't exist
    await seedInitialEvents();

    return conn;
  } catch (error) {
    console.error('❌ [MongoDB] Connection error:', error);
    return null;
  }
};

/**
 * Seed default admin and user if not already existing
 */
export const seedInitialUsers = async () => {
  try {
    const { User } = await import('../models/User');
    const bcrypt = (await import('bcryptjs')).default;

    const adminExists = await User.findOne({ email: 'admin@cultmusic.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin CultMusic',
        email: 'admin@cultmusic.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ [MongoDB] Seeded default admin account (admin@cultmusic.com / admin123)');
    }

    const demoUserExists = await User.findOne({ email: 'shafiquemulla8@gmail.com' });
    if (!demoUserExists) {
      const hashedPassword = await bcrypt.hash('cultmusic2026', 10);
      await User.create({
        name: 'Shafique Mulla',
        email: 'shafiquemulla8@gmail.com',
        password: hashedPassword,
        role: 'user',
      });
      console.log('✅ [MongoDB] Seeded default user account (shafiquemulla8@gmail.com / cultmusic2026)');
    }
  } catch (err) {
    // Non-fatal if seeding has minor conflict
    console.warn('⚠️  [MongoDB] User seeding note:', err);
  }
};

/**
 * Seed initial artists into MongoDB if collection is empty
 */
export const seedInitialArtists = async () => {
  try {
    const { Artist } = await import('../models/Artist');
    const count = await Artist.countDocuments();
    if (count === 0) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const dbFile = path.resolve(__dirname, '../../data/cultmusic_mongodb.json');

      if (fs.existsSync(dbFile)) {
        const localData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
        if (Array.isArray(localData.artists) && localData.artists.length > 0) {
          const formatted = localData.artists.map((a: any) => ({
            name: a.name,
            genre: (a.genres && a.genres[0]) || a.category || 'INDEPENDENT',
            category: a.category || (a.genres && a.genres[0]) || 'INDEPENDENT',
            genres: a.genres || [a.genre || 'INDEPENDENT'],
            bio: a.bio || '',
            image: a.image || '',
            location: a.location || 'Global',
            socialLinks: a.socials || a.socialLinks || {},
            isActive: a.isActive !== undefined ? a.isActive : true,
            role: a.role || 'Independent Artist',
            badge: a.badge || 'ROSTER',
            quote: a.quote || '',
            stats: a.stats || { shows: 10, communityMembers: '10K+', reach: '100K+' },
            tracks: a.tracks || [],
            featured: Boolean(a.featured)
          }));
          await Artist.insertMany(formatted);
          console.log(`✅ [MongoDB] Seeded ${formatted.length} initial artists into MongoDB`);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️  [MongoDB] Artist seeding note:', err);
  }
};

/**
 * Seed initial events into MongoDB if collection is empty
 */
export const seedInitialEvents = async () => {
  try {
    const { Event } = await import('../models/Event');
    const count = await Event.countDocuments();
    if (count === 0) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const dbFile = path.resolve(__dirname, '../../data/cultmusic_mongodb.json');

      if (fs.existsSync(dbFile)) {
        const localData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
        if (Array.isArray(localData.events) && localData.events.length > 0) {
          const formatted = localData.events.map((e: any) => ({
            title: e.title,
            date: e.date,
            day: e.day || '',
            month: e.month || '',
            year: e.year || '',
            time: e.time || '4:00 PM - 10:00 PM',
            location: e.location || 'Mumbai, India',
            venue: e.venue || `${e.location || 'Mumbai'} Grounds`,
            category: (e.category || 'LIVE SESSION').toUpperCase(),
            type: e.type || 'Community Jam',
            image: e.image || '',
            featured: Boolean(e.featured),
            price: e.price || 'Free Entry with RSVP',
            capacity: e.capacity || 500,
            registeredCount: e.registeredCount || 0,
            description: e.description || '',
            schedule: Array.isArray(e.schedule) ? e.schedule : [],
            faqs: Array.isArray(e.faqs) ? e.faqs : [],
            isActive: e.isActive !== undefined ? e.isActive : true,
          }));
          await Event.insertMany(formatted);
          console.log(`✅ [MongoDB] Seeded ${formatted.length} initial events into MongoDB`);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️  [MongoDB] Event seeding note:', err);
  }
};

export { mongoose };
export default connectDB;

