import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { verifyTokenMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { Route } from '../../src/types';

const router = Router();

// GET /api/routes - List all active routes
router.get('/', (req: Request, res: Response) => {
  const routes = db.getRoutes();
  return res.json({
    success: true,
    message: `Retrieved ${routes.length} railway routes.`,
    data: { routes }
  });
});

// GET /api/routes/:id - Get route details
router.get('/:id', (req: Request, res: Response) => {
  const route = db.getRouteById(req.params.id);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
      errors: [`No route found with ID '${req.params.id}'`]
    });
  }

  return res.json({
    success: true,
    message: 'Route retrieved successfully',
    data: { route }
  });
});

// POST /api/routes - Create route (Admin only)
router.post('/', verifyTokenMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, originCode, destinationCode, totalDistanceKm, stops } = req.body;

    if (!name || !originCode || !destinationCode) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: ['name, originCode, and destinationCode are required.']
      });
    }

    const now = new Date().toISOString();
    const newRoute: Route = {
      id: 'rt_' + Date.now(),
      name,
      originCode,
      destinationCode,
      totalDistanceKm: Number(totalDistanceKm) || 1000,
      stops: stops || [],
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    db.createRoute(newRoute);
    db.addAuditLog('ROUTE_CREATE', 'ROUTES', req.ip || '', `Created route: ${name}`, req.user);

    return res.status(201).json({
      success: true,
      message: 'Route created successfully!',
      data: { route: newRoute }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create route',
      errors: [err.message]
    });
  }
});

export default router;
