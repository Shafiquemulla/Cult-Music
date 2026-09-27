import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Artist } from '../models/Artist';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../data/cultmusic_mongodb.json');

const router = express.Router();

// Fallback helper for local persistent replica store
const getLocalDb = (): any => {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading local fallback database:', err);
  }
  return { artists: [] };
};

const saveLocalDb = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local fallback database:', err);
  }
};

/**
 * 1. GET /api/artists
 * Public endpoint
 * Fetches all artists, with optional category/genre and search query filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, genre, search } = req.query;

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const filter: any = {};

      const targetGenre = (genre || category) as string | undefined;
      if (targetGenre && targetGenre !== 'ALL') {
        const regex = new RegExp(`^${targetGenre}$`, 'i');
        filter.$or = [
          { genre: regex },
          { category: regex },
          { genres: regex }
        ];
      }

      if (search && typeof search === 'string' && search.trim()) {
        const sRegex = new RegExp(search.trim(), 'i');
        const searchConditions = [
          { name: sRegex },
          { genre: sRegex },
          { location: sRegex },
          { bio: sRegex },
          { role: sRegex }
        ];

        if (filter.$or) {
          filter.$and = [
            { $or: filter.$or },
            { $or: searchConditions }
          ];
          delete filter.$or;
        } else {
          filter.$or = searchConditions;
        }
      }

      const artists = await Artist.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({
        artists: artists.map((a) => a.toJSON())
      });
    }

    // Fallback store when MongoDB is not connected
    const localDb = getLocalDb();
    let list = Array.isArray(localDb.artists) ? localDb.artists : [];

    const targetFilter = (genre || category) as string | undefined;
    if (targetFilter && targetFilter !== 'ALL') {
      const tfUpper = targetFilter.toUpperCase();
      list = list.filter((a: any) =>
        (a.genre && a.genre.toUpperCase() === tfUpper) ||
        (a.category && a.category.toUpperCase() === tfUpper) ||
        (Array.isArray(a.genres) && a.genres.some((g: string) => g.toUpperCase() === tfUpper))
      );
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((a: any) =>
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.genre && a.genre.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.role && a.role.toLowerCase().includes(q)) ||
        (a.bio && a.bio.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({ artists: list });
  } catch (error: any) {
    console.error('Error fetching artists:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to fetch artists',
      details: error.message
    });
  }
});

/**
 * 2. GET /api/artists/:id
 * Public endpoint
 * Fetches an artist by MongoDB ID (or legacy id)
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    // Validate ID format if not matching ObjectId or alphanumeric slug
    const isValidObjectId = mongoose.isValidObjectId(id);
    const isAlphanumericSlug = /^[a-zA-Z0-9_\-]+$/.test(id);

    if (!isValidObjectId && !isAlphanumericSlug) {
      return res.status(400).json({ error: 'Invalid artist ID: Please provide a valid MongoDB ID format' });
    }

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      let artist = null;

      if (isValidObjectId) {
        artist = await Artist.findById(id);
      }

      // If not found by ObjectId, attempt match by slug/id field
      if (!artist) {
        artist = await Artist.findOne({
          $or: [
            { id: id },
            { name: new RegExp(`^${id}$`, 'i') }
          ]
        });
      }

      if (!artist) {
        return res.status(404).json({ error: 'Artist not found' });
      }

      return res.status(200).json({ artist: artist.toJSON() });
    }

    // Fallback store
    const localDb = getLocalDb();
    const artist = (localDb.artists || []).find((a: any) => a.id === id || a._id === id);

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    return res.status(200).json({ artist });
  } catch (error: any) {
    console.error('Error fetching artist by ID:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to retrieve artist',
      details: error.message
    });
  }
});

/**
 * 3. POST /api/artists
 * Protected endpoint: Requires JWT authentication + Admin role
 * Validates: name is required, genre is required
 */
router.post('/', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      genre,
      genres,
      bio,
      image,
      location,
      socialLinks,
      socials,
      isActive,
      role,
      badge,
      quote,
      stats,
      tracks,
      featured
    } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Artist name is required' });
    }

    const determinedGenre = (genre || (Array.isArray(genres) && genres.length > 0 ? genres[0] : '')) as string;
    if (!determinedGenre || typeof determinedGenre !== 'string' || !determinedGenre.trim()) {
      return res.status(400).json({ error: 'Genre is required' });
    }

    const artistData = {
      name: name.trim(),
      genre: determinedGenre.trim(),
      category: determinedGenre.trim().toUpperCase(),
      genres: Array.isArray(genres) && genres.length > 0 ? genres : [determinedGenre.trim().toUpperCase()],
      bio: bio ? String(bio).trim() : '',
      image: image ? String(image).trim() : '/src/assets/images/artist_pravin_bmx_1790433619103.jpg',
      location: location ? String(location).trim() : 'Global',
      socialLinks: socialLinks || socials || {
        instagram: '',
        youtube: '',
        spotify: '',
        x: ''
      },
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      role: role ? String(role).trim() : 'Independent Artist',
      badge: badge ? String(badge).trim() : 'ROSTER',
      quote: quote ? String(quote).trim() : '',
      stats: stats || { shows: 0, communityMembers: '10K+', reach: '100K+' },
      tracks: Array.isArray(tracks) ? tracks : [],
      featured: Boolean(featured)
    };

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const newArtist = new Artist(artistData);
      await newArtist.save();

      return res.status(201).json({
        message: 'Artist created successfully',
        artist: newArtist.toJSON()
      });
    }

    // Fallback store
    const localDb = getLocalDb();
    if (!Array.isArray(localDb.artists)) {
      localDb.artists = [];
    }

    const newLocalArtist = {
      id: 'art_' + Date.now(),
      ...artistData,
      socials: artistData.socialLinks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localDb.artists.unshift(newLocalArtist);
    saveLocalDb(localDb);

    return res.status(201).json({
      message: 'Artist created successfully',
      artist: newLocalArtist
    });
  } catch (error: any) {
    console.error('Error creating artist:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to create artist',
      details: error.message
    });
  }
});

/**
 * 4. PUT /api/artists/:id
 * Protected endpoint: Requires JWT authentication + Admin role
 * Updates an artist by ID
 */
router.put('/:id', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    const isValidObjectId = mongoose.isValidObjectId(id);
    const isAlphanumericSlug = /^[a-zA-Z0-9_\-]+$/.test(id);

    if (!isValidObjectId && !isAlphanumericSlug) {
      return res.status(400).json({ error: 'Invalid artist ID: Please provide a valid MongoDB ID format' });
    }

    const {
      name,
      genre,
      genres,
      bio,
      image,
      location,
      socialLinks,
      socials,
      isActive,
      role,
      badge,
      quote,
      stats,
      tracks,
      featured
    } = req.body;

    const updateFields: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Artist name cannot be empty' });
      }
      updateFields.name = name.trim();
    }
    if (genre !== undefined) {
      if (typeof genre !== 'string' || !genre.trim()) {
        return res.status(400).json({ error: 'Genre cannot be empty' });
      }
      updateFields.genre = genre.trim();
      updateFields.category = genre.trim().toUpperCase();
      if (!genres) {
        updateFields.genres = [genre.trim().toUpperCase()];
      }
    }
    if (genres !== undefined) {
      updateFields.genres = Array.isArray(genres) ? genres : [genres];
    }
    if (bio !== undefined) updateFields.bio = String(bio).trim();
    if (image !== undefined) updateFields.image = String(image).trim();
    if (location !== undefined) updateFields.location = String(location).trim();
    if (socialLinks !== undefined || socials !== undefined) {
      updateFields.socialLinks = socialLinks || socials;
    }
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
    if (role !== undefined) updateFields.role = String(role).trim();
    if (badge !== undefined) updateFields.badge = String(badge).trim();
    if (quote !== undefined) updateFields.quote = String(quote).trim();
    if (stats !== undefined) updateFields.stats = stats;
    if (tracks !== undefined) updateFields.tracks = tracks;
    if (featured !== undefined) updateFields.featured = Boolean(featured);

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      let updatedArtist = null;

      if (isValidObjectId) {
        updatedArtist = await Artist.findByIdAndUpdate(
          id,
          { $set: updateFields },
          { new: true, runValidators: true }
        );
      }

      if (!updatedArtist) {
        updatedArtist = await Artist.findOneAndUpdate(
          { $or: [{ id: id }, { name: new RegExp(`^${id}$`, 'i') }] },
          { $set: updateFields },
          { new: true, runValidators: true }
        );
      }

      if (!updatedArtist) {
        return res.status(404).json({ error: 'Artist not found' });
      }

      return res.status(200).json({
        message: 'Artist updated successfully',
        artist: updatedArtist.toJSON()
      });
    }

    // Fallback store
    const localDb = getLocalDb();
    const index = (localDb.artists || []).findIndex((a: any) => a.id === id || a._id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    localDb.artists[index] = {
      ...localDb.artists[index],
      ...updateFields,
      socials: updateFields.socialLinks || localDb.artists[index].socials,
      updatedAt: new Date().toISOString()
    };
    saveLocalDb(localDb);

    return res.status(200).json({
      message: 'Artist updated successfully',
      artist: localDb.artists[index]
    });
  } catch (error: any) {
    console.error('Error updating artist:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to update artist',
      details: error.message
    });
  }
});

/**
 * 5. DELETE /api/artists/:id
 * Protected endpoint: Requires JWT authentication + Admin role
 * Deletes an artist by ID
 */
router.delete('/:id', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    const isValidObjectId = mongoose.isValidObjectId(id);
    const isAlphanumericSlug = /^[a-zA-Z0-9_\-]+$/.test(id);

    if (!isValidObjectId && !isAlphanumericSlug) {
      return res.status(400).json({ error: 'Invalid artist ID: Please provide a valid MongoDB ID format' });
    }

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      let deleted = null;

      if (isValidObjectId) {
        deleted = await Artist.findByIdAndDelete(id);
      }

      if (!deleted) {
        deleted = await Artist.findOneAndDelete({
          $or: [{ id: id }, { name: new RegExp(`^${id}$`, 'i') }]
        });
      }

      if (!deleted) {
        return res.status(404).json({ error: 'Artist not found' });
      }

      return res.status(200).json({
        message: 'Artist deleted successfully',
        id
      });
    }

    // Fallback store
    const localDb = getLocalDb();
    const initialLen = (localDb.artists || []).length;
    localDb.artists = (localDb.artists || []).filter((a: any) => a.id !== id && a._id !== id);

    if (localDb.artists.length === initialLen) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    saveLocalDb(localDb);

    return res.status(200).json({
      message: 'Artist deleted successfully',
      id
    });
  } catch (error: any) {
    console.error('Error deleting artist:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to delete artist',
      details: error.message
    });
  }
});

export default router;
