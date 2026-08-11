import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { verifyTokenMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications/my-notifications - Get logged-in user's notifications
router.get('/my-notifications', verifyTokenMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const notifications = db.getUserNotifications(userId);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return res.json({
    success: true,
    message: 'Notifications fetched successfully',
    data: { notifications, unreadCount }
  });
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', verifyTokenMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.markNotificationRead(req.params.id);
  return res.json({
    success,
    message: success ? 'Marked as read' : 'Notification not found'
  });
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', verifyTokenMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.markAllNotificationsRead(req.user!.id);
  return res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// POST /api/notifications/broadcast - Admin broadcast alert
router.post('/broadcast', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.'
    });
  }

  const { title, message, priority, type } = req.body;
  const users = await db.getUsers();

  users.forEach(u => {
    db.createNotification({
      userId: u.id,
      title: title || 'System Announcement',
      message: message || 'Notice from Railway Authority',
      priority: priority || 'NORMAL',
      type: type || 'SYSTEM_ALERT',
      channel: 'In-App'
    });
  });

  return res.json({
    success: true,
    message: `Broadcast sent to ${users.length} users.`
  });
});

export default router;
