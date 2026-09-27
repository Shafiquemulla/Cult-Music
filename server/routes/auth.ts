import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { mongoose } from '../config/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../data/cultmusic_mongodb.json');

const router = express.Router();

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in the environment variables');
  }
  return secret;
};

// Strict email regex validation helper
const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Local storage fallback helpers for development and offline mode
const getLocalDb = (): any => {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading local fallback database:', err);
  }
  return { users: [] };
};

const saveLocalDb = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local fallback database:', err);
  }
};

/**
 * 1. User Registration
 * POST /api/auth/register
 * 
 * Request body:
 * {
 *   "name": "User Name",
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "role": "user" | "admin" (optional, default: "user")
 * }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate missing fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Missing fields: Name is required' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Missing fields: Email is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Missing fields: Password is required' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email: Please provide a valid email address' });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Invalid password: Password must be at least 6 characters long' });
    }

    // Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    // 1. Primary: Mongoose + MongoDB when connected
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: trimmedEmail });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered: An account with this email already exists' });
      }

      const newUser = new User({
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        role: assignedRole,
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id.toString(), role: newUser.role },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
        token,
      });
    }

    // 2. Secondary fallback: Local persistent replica store (e.g. dev mode without Atlas network access)
    const localDb = getLocalDb();
    if (!Array.isArray(localDb.users)) {
      localDb.users = [];
    }

    const existingInLocal = localDb.users.find((u: any) => u.email?.toLowerCase() === trimmedEmail);
    if (existingInLocal) {
      return res.status(409).json({ error: 'Email already registered: An account with this email already exists' });
    }

    const newLocalUser = {
      id: 'u_' + Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: assignedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localDb.users.push(newLocalUser);
    saveLocalDb(localDb);

    const token = jwt.sign(
      { id: newLocalUser.id, role: newLocalUser.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newLocalUser.id,
        name: newLocalUser.name,
        email: newLocalUser.email,
        role: newLocalUser.role,
        createdAt: newLocalUser.createdAt,
        updatedAt: newLocalUser.updatedAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res.status(500).json({
      error: 'Server/database error: Failed to register user',
      details: error.message,
    });
  }
});

/**
 * 2. User Login
 * POST /api/auth/login
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate missing fields
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Missing fields: Email is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Missing fields: Password is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email: Please provide a valid email format' });
    }

    // 1. Primary: Mongoose + MongoDB when connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: trimmedEmail });
      if (!user) {
        return res.status(401).json({ error: 'Invalid login credentials: Email or password is incorrect' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid login credentials: Email or password is incorrect' });
      }

      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }

    // 2. Secondary fallback: Local persistent replica store
    const localDb = getLocalDb();
    const user = Array.isArray(localDb.users)
      ? localDb.users.find((u: any) => u.email?.toLowerCase() === trimmedEmail)
      : null;

    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials: Email or password is incorrect' });
    }

    // Support both bcrypt-hashed passwords and legacy seeded passwords
    const isMatch = user.password?.startsWith('$2')
      ? await bcrypt.compare(password, user.password)
      : user.password === password || user.passwordHash === password;

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials: Email or password is incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role || 'user' },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to process login',
      details: error.message,
    });
  }
});

/**
 * 3. Current User Profile
 * GET /api/auth/me
 * Protected by JWT Authentication Middleware
 */
router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid/expired JWT: Token payload is invalid' });
    }

    // 1. Primary: Mongoose + MongoDB when connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id).select('-password');
      if (user) {
        return res.status(200).json({
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
      }
    }

    // 2. Secondary fallback: Local persistent replica store
    const localDb = getLocalDb();
    const user = Array.isArray(localDb.users)
      ? localDb.users.find((u: any) => u.id === req.user?.id)
      : null;

    if (!user) {
      return res.status(404).json({ error: 'User not found: Account no longer exists' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Auth /me error:', error);
    return res.status(500).json({
      error: 'Server/database error: Failed to fetch authenticated user',
      details: error.message,
    });
  }
});

export default router;
