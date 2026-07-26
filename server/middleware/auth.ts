import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../src/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-enterprise-railway-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export function generateToken(payload: { id: string; email: string; role: UserRole; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function generateRefreshToken(payload: { id: string }): string {
  return jwt.sign(payload, JWT_SECRET + '_refresh', { expiresIn: '7d' });
}

export function verifyTokenMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed. Bearer token missing.',
      errors: ['No authorization token supplied']
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      errors: [err.message]
    });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized access',
        errors: ['User context not found']
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access forbidden. Insufficient permissions.',
        errors: [`Role '${req.user.role}' is not authorized for this resource`]
      });
      return;
    }

    next();
  };
}

// Simple rate limiter implementation
const requestCounts = new Map<string, { count: number; resetTime: number }>();
export function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Rate limit exceeded.',
        errors: ['Please slow down your request rate.']
      });
      return;
    }

    next();
  };
}
