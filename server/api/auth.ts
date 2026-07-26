import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/db.js';
import { generateToken, generateRefreshToken, verifyTokenMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../../src/types/index.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: ['Name, email, and password are required fields.']
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: ['Password must be at least 6 characters long.']
      });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Registration Failed',
        errors: ['An account with this email address already exists.']
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name,
      email: email.toLowerCase(),
      role: 'passenger',
      phone: phone || '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      preferences: { notifications: true, darkMode: false, preferredClass: '2A' }
    };

    await db.createUser(newUser, passwordHash);
    await db.addAuditLog('USER_REGISTER', 'USERS', req.ip || '', `New user registered: ${email}`, { id: newUser.id, email: newUser.email });

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
    const refreshToken = generateRefreshToken({ id: newUser.id });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: {
        user: newUser,
        token,
        refreshToken
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      errors: [err.message]
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: ['Email and password are required.']
      });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      await db.addAuditLog('USER_LOGIN_FAIL', 'AUTH', req.ip || '', `Failed login attempt for non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Authentication Failed',
        errors: ['Invalid email or password credentials.']
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account Suspended',
        errors: ['Your account has been suspended by an administrator.']
      });
    }

    const isValidPassword = await db.checkUserPassword(user.password_hash, password);
    if (!isValidPassword) {
      await db.addAuditLog('USER_LOGIN_FAIL', 'AUTH', req.ip || '', `Invalid password for email: ${email}`, { id: user.id, email: user.email });
      return res.status(401).json({
        success: false,
        message: 'Authentication Failed',
        errors: ['Invalid email or password credentials.']
      });
    }

    await db.addAuditLog('USER_LOGIN_SUCCESS', 'AUTH', req.ip || '', `User logged in successfully: ${email}`, { id: user.id, email: user.email });

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken({ id: user.id });

    return res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user,
        token,
        refreshToken
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      errors: [err.message]
    });
  }
});

// GET /api/auth/me
router.get('/me', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = await db.getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      errors: ['Current user account could not be found.']
    });
  }

  return res.json({
    success: true,
    message: 'User profile retrieved',
    data: { user }
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: ['Email address is required.']
    });
  }

  await db.addAuditLog('FORGOT_PASSWORD_REQUEST', 'AUTH', req.ip || '', `Password reset requested for: ${email}`);
  return res.json({
    success: true,
    message: 'If the email exists in our system, password reset instructions have been dispatched.',
    data: { status: 'RESET_LINK_SENT' }
  });
});

export default router;
