import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { verifyTokenMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Apply admin protection to all routes in this file
router.use(verifyTokenMiddleware, requireRole(['admin']));

// GET /api/admin/metrics - Enterprise System Overview
router.get('/metrics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = await db.getMetrics();
    return res.json({
      success: true,
      message: 'Admin metrics loaded',
      data: {
        metrics
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load metrics', errors: [err.message] });
  }
});

// GET /api/admin/users - Get user management directory
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await db.getUsers();
    return res.json({
      success: true,
      message: `Retrieved ${users.length} users.`,
      data: { users }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load users' });
  }
});

// PATCH /api/admin/users/:id/status - Toggle user status
router.patch('/users/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (!status || !['active', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: ['Status must be either "active" or "suspended".']
    });
  }

  const updated = await db.updateUser(req.params.id, { status });
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      errors: ['User record not found.']
    });
  }

  await db.addAuditLog('USER_STATUS_CHANGE', 'USERS', req.ip || '', `Changed status of user ${updated.email} to ${status}`, req.user);

  return res.json({
    success: true,
    message: `User status updated to ${status}`,
    data: { user: updated }
  });
});

// PATCH /api/admin/users/:id/role - Toggle user role
router.patch('/users/:id/role', async (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  if (!role || !['passenger', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: ['Role must be either "passenger" or "admin".']
    });
  }

  const updated = await db.updateUser(req.params.id, { role });
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      errors: ['User record not found.']
    });
  }

  await db.addAuditLog('USER_ROLE_CHANGE', 'USERS', req.ip || '', `Changed role of user ${updated.email} to ${role}`, req.user);

  return res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: { user: updated }
  });
});

// GET /api/admin/audit-logs - View security audit logs
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await db.getAuditLogs();
    return res.json({
      success: true,
      message: `Retrieved ${logs.length} audit log entries.`,
      data: { auditLogs: logs }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load audit logs' });
  }
});

export default router;
