import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'user' | 'admin';
    [key: string]: any;
  };
}

/**
 * Authentication Middleware
 * Reads Authorization: Bearer <token>
 * Verifies JWT using JWT_SECRET
 * Attaches user ID and role to request
 */
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Missing token: Authorization header is required'
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Invalid token format: Must be Bearer <token>'
    });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'Missing token: Bearer token is empty'
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('❌ [Auth Middleware] JWT_SECRET is not configured in the environment.');
    return res.status(500).json({
      error: 'Server/database error: JWT authentication is not configured. Missing JWT_SECRET.'
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: string; role: 'user' | 'admin' };
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Expired JWT: Token has expired, please log in again' });
    }
    return res.status(401).json({ error: 'Invalid JWT: Token verification failed' });
  }
};

/**
 * Authorization Middleware: Checks if authenticated user has 'admin' role
 * Requires authenticateJWT to run first.
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token is required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required for this operation' });
  }

  next();
};

export default authenticateJWT;
