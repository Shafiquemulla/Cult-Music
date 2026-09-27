import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Event } from '../models/Event';
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
  return { events: [], registrations: [] };
};

const saveLocalDb = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local fallback database:', err);
  }
};

let eventBroadcaster: ((type: string, data: any) => void) | null = null;
export const setEventBroadcaster = (fn: (type: string, data: any) => void) => {
  eventBroadcaster = fn;
};

/**
 * Helper to extract day, month, year from date string if not given
 */
const parseDateParts = (dateStr: string) => {
  if (!dateStr) return { day: '', month: '', year: '' };
  const parts = dateStr.trim().split(/[\s,/-]+/);
  if (parts.length >= 3) {
    return {
      day: parts[0],
      month: parts[1].toUpperCase(),
      year: parts[2]
    };
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      day: String(d.getDate()),
      month: months[d.getMonth()],
      year: String(d.getFullYear())
    };
  }
  return { day: '', month: '', year: '' };
};

/**
 * 1. GET /api/events
 * Public endpoint
 * Fetches all events, with optional category and search query filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const filter: any = {};

      if (category && typeof category === 'string' && category !== 'ALL') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }

      if (search && typeof search === 'string' && search.trim()) {
        const sRegex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { title: sRegex },
          { location: sRegex },
          { venue: sRegex },
          { category: sRegex },
          { description: sRegex }
        ];
      }

      const events = await Event.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({
        events: events.map((e) => e.toJSON())
      });
    }

    // Fallback store when MongoDB is in replica mode
    const localDb = getLocalDb();
    let list = Array.isArray(localDb.events) ? localDb.events : [];

    if (category && typeof category === 'string' && category !== 'ALL') {
      const catUpper = category.toUpperCase();
      list = list.filter((e: any) => e.category && e.category.toUpperCase() === catUpper);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e: any) =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({ events: list });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to fetch events',
      details: error.message
    });
  }
});

/**
 * 2. GET /api/events/:id
 * Public endpoint
 * Fetches an event by MongoDB ID or custom slug
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const isValidObjectId = mongoose.isValidObjectId(id);
    const isAlphanumericSlug = /^[a-zA-Z0-9_\-]+$/.test(id);

    if (!isValidObjectId && !isAlphanumericSlug) {
      return res.status(400).json({ error: 'Invalid event ID: Please provide a valid MongoDB ID format' });
    }

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      let event = null;

      if (isValidObjectId) {
        event = await Event.findById(id);
      }

      if (!event) {
        event = await Event.findOne({
          $or: [
            { id: id },
            { title: new RegExp(`^${id.replace(/-/g, ' ')}$`, 'i') }
          ]
        });
      }

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.status(200).json({ event: event.toJSON() });
    }

    // Fallback store
    const localDb = getLocalDb();
    const event = (localDb.events || []).find((e: any) => e.id === id || e._id === id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ event });
  } catch (error: any) {
    console.error('Error fetching event by ID:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to retrieve event',
      details: error.message
    });
  }
});

/**
 * 3. POST /api/events
 * Protected endpoint: Requires JWT authentication + Admin role
 * Validates: title, date, location, category are required
 */
router.post('/', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      date,
      day,
      month,
      year,
      time,
      location,
      venue,
      category,
      type,
      image,
      featured,
      price,
      capacity,
      description,
      schedule,
      faqs,
      isActive
    } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Event title is required' });
    }

    if (!date || typeof date !== 'string' || !date.trim()) {
      return res.status(400).json({ error: 'Event date is required' });
    }

    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({ error: 'Event location is required' });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ error: 'Event category is required' });
    }

    const dateParts = parseDateParts(date.trim());

    const eventData = {
      title: title.trim(),
      date: date.trim(),
      day: day || dateParts.day,
      month: month || dateParts.month,
      year: year || dateParts.year,
      time: time ? String(time).trim() : '4:00 PM - 10:00 PM',
      location: location.trim(),
      venue: venue ? String(venue).trim() : `${location.trim()} Main Grounds`,
      category: category.trim().toUpperCase(),
      type: type ? String(type).trim() : 'Live Showcase',
      image: image ? String(image).trim() : '/src/assets/images/event_freestyle_jam_1790433655462.jpg',
      featured: Boolean(featured),
      price: price ? String(price).trim() : 'Free Entry with RSVP',
      capacity: Number(capacity) > 0 ? Number(capacity) : 500,
      registeredCount: 0,
      description: description ? String(description).trim() : '',
      schedule: Array.isArray(schedule) ? schedule : [
        { time: '4:00 PM', activity: 'Doors Open & Check-in' },
        { time: '5:30 PM', activity: 'Live Sets & Performances' },
        { time: '8:30 PM', activity: 'Community Showcase & Wrap-up' }
      ],
      faqs: Array.isArray(faqs) ? faqs : [
        { q: 'Is RSVP required for entry?', a: 'Yes, reservations are required to guarantee venue entry.' }
      ],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const newEvent = new Event(eventData);
      await newEvent.save();

      return res.status(201).json({
        message: 'Event created successfully',
        event: newEvent.toJSON()
      });
    }

    // Fallback store
    const localDb = getLocalDb();
    if (!Array.isArray(localDb.events)) {
      localDb.events = [];
    }

    const newLocalEvent = {
      id: 'evt_' + Date.now(),
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localDb.events.unshift(newLocalEvent);
    saveLocalDb(localDb);

    return res.status(201).json({
      message: 'Event created successfully',
      event: newLocalEvent
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to create event',
      details: error.message
    });
  }
});

/**
 * 4. PUT /api/events/:id
 * Protected endpoint: Requires JWT authentication + Admin role
 * Updates an event by ID
 */
router.put('/:id', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const isValidObjectId = mongoose.isValidObjectId(id);
    const isAlphanumericSlug = /^[a-zA-Z0-9_\-]+$/.test(id);

    if (!isValidObjectId && !isAlphanumericSlug) {
      return res.status(400).json({ error: 'Invalid event ID: Please provide a valid MongoDB ID format' });
    }

    const {
      title,
      date,
      day,
      month,
      year,
      time,
      location,
      venue,
      category,
      type,
      image,
      featured,
      price,
      capacity,
      registeredCount,
      description,
      schedule,
      faqs,
      isActive
    } = req.body;

    const updateFields: any = {};
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Event title cannot be empty' });
      }
      updateFields.title = title.trim();
    }
    if (date !== undefined) {
      if (typeof date !== 'string' || !date.trim()) {
        return res.status(400).json({ error: 'Event date cannot be empty' });
      }
      updateFields.date = date.trim();
      const parts = parseDateParts(date.trim());
      if (!day) updateFields.day = parts.day;
      if (!month) updateFields.month = parts.month;
      if (!year) updateFields.year = parts.year;
    }
    if (day !== undefined) updateFields.day = String(day).trim();
    if (month !== undefined) updateFields.month = String(month).trim().toUpperCase();
    if (year !== undefined) updateFields.year = String(year).trim();
    if (time !== undefined) updateFields.time = String(time).trim();
    if (location !== undefined) {
      if (typeof location !== 'string' || !location.trim()) {
        return res.status(400).json({ error: 'Event location cannot be empty' });
      }
      updateFields.location = location.trim();
    }
    if (venue !== undefined) updateFields.venue = String(venue).trim();
    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) {
        return res.status(400).json({ error: 'Event category cannot be empty' });
      }
      updateFields.category = category.trim().toUpperCase();
    }
    if (type !== undefined) updateFields.type = String(type).trim();
    if (image !== undefined) updateFields.image = String(image).trim();
    if (featured !== undefined) updateFields.featured = Boolean(featured);
    if (price !== undefined) updateFields.price = String(price).trim();
    if (capacity !== undefined) updateFields.capacity = Number(capacity);
    if (registeredCount !== undefined) updateFields.registeredCount = Number(registeredCount);
    if (description !== undefined) updateFields.description = String(description).trim();
    if (schedule !== undefined) updateFields.schedule = schedule;
    if (faqs !== undefined) updateFields.faqs = faqs;
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      let updatedEvent = null;

      if (isValidObjectId) {
        updatedEvent = await Event.findByIdAndUpdate(
          id,
          { $set: updateFields },
          { new: true, runValidators: true }
        );
      }

      if (!updatedEvent) {
        updatedEvent = await Event.findOneAndUpdate(
          { $or: [{ id: id }, { title: new RegExp(`^${id.replace(/-/g, ' ')}$`, 'i') }] },
          { $set: updateFields },
          { new: true, runValidators: true }
        );
      }

      if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.status(200).json({
        message: 'Event updated successfully',
        event: updatedEvent.toJSON()
      });
    }

    // Fallback store
    const localDb = getLocalDb();
    const index = (localDb.events || []).findIndex((e: any) => e.id === id || e._id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    localDb.events[index] = {
      ...localDb.events[index],
      ...updateFields,
      updatedAt: new Date().toISOString()
    };
    saveLocalDb(localDb);

    return res.status(200).json({
      message: 'Event updated successfully',
      event: localDb.events[index]
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to update event',
      details: error.message
    });
  }
});

/**
 * 5. DELETE /api/events/:id
 * Protected endpoint: Requires JWT authentication + Admin role
 * Deletes an event by ID
 */
router.delete('/:id', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const isValidObjectId = mongoose.isValidObjectId(id);
    const isAlphanumericSlug = /^[a-zA-Z0-9_\-]+$/.test(id);

    if (!isValidObjectId && !isAlphanumericSlug) {
      return res.status(400).json({ error: 'Invalid event ID: Please provide a valid MongoDB ID format' });
    }

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      let deleted = null;

      if (isValidObjectId) {
        deleted = await Event.findByIdAndDelete(id);
      }

      if (!deleted) {
        deleted = await Event.findOneAndDelete({
          $or: [{ id: id }, { title: new RegExp(`^${id.replace(/-/g, ' ')}$`, 'i') }]
        });
      }

      if (!deleted) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.status(200).json({
        message: 'Event deleted successfully',
        id
      });
    }

    // Fallback store
    const localDb = getLocalDb();
    const initialLen = (localDb.events || []).length;
    localDb.events = (localDb.events || []).filter((e: any) => e.id !== id && e._id !== id);

    if (localDb.events.length === initialLen) {
      return res.status(404).json({ error: 'Event not found' });
    }

    saveLocalDb(localDb);

    return res.status(200).json({
      message: 'Event deleted successfully',
      id
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to delete event',
      details: error.message
    });
  }
});

/**
 * 6. POST /api/events/:id/register
 * Public / User endpoint: Register / RSVP for an event
 */
router.post('/:id/register', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userName, userEmail, tier } = req.body;

    if (!userName || !userName.trim() || !userEmail || !userEmail.trim()) {
      return res.status(400).json({ error: 'Name and email are required to register' });
    }

    let targetEvent: any = null;
    let registeredCount = 0;

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      if (mongoose.isValidObjectId(id)) {
        targetEvent = await Event.findById(id);
      }
      if (!targetEvent) {
        targetEvent = await Event.findOne({
          $or: [{ id: id }, { title: new RegExp(`^${id.replace(/-/g, ' ')}$`, 'i') }]
        });
      }

      if (!targetEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      targetEvent.registeredCount = (targetEvent.registeredCount || 0) + 1;
      await targetEvent.save();
      registeredCount = targetEvent.registeredCount;
    } else {
      // Fallback store
      const localDb = getLocalDb();
      targetEvent = (localDb.events || []).find((e: any) => e.id === id || e._id === id);

      if (!targetEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      targetEvent.registeredCount = (targetEvent.registeredCount || 0) + 1;
      registeredCount = targetEvent.registeredCount;
      saveLocalDb(localDb);
    }

    const reg = {
      id: 'reg_' + Date.now(),
      eventId: targetEvent.id || id,
      eventTitle: targetEvent.title,
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      tier: tier || 'Standard RSVP',
      timestamp: new Date().toISOString()
    };

    // Save registration to local log
    const localDb = getLocalDb();
    if (!Array.isArray(localDb.registrations)) localDb.registrations = [];
    localDb.registrations.unshift(reg);
    if (localDb.analytics) {
      localDb.analytics.eventRegistrations = (localDb.analytics.eventRegistrations || 0) + 1;
    }
    saveLocalDb(localDb);

    // Broadcast SSE
    if (eventBroadcaster) {
      eventBroadcaster('event_registration', {
        eventId: targetEvent.id || id,
        eventTitle: targetEvent.title,
        registeredCount,
        userName: userName.trim()
      });
    }

    return res.status(201).json({
      message: `Successfully registered for ${targetEvent.title}! Your pass has been generated.`,
      registration: reg,
      registeredCount
    });
  } catch (error: any) {
    console.error('Error registering for event:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to register for event',
      details: error.message
    });
  }
});

export default router;
