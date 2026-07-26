import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

import authRouter from './server/api/auth.js';
import trainsRouter from './server/api/trains.js';
import stationsRouter from './server/api/stations.js';
import routesRouter from './server/api/routes.js';
import bookingsRouter from './server/api/bookings.js';
import paymentsRouter from './server/api/payments.js';
import notificationsRouter from './server/api/notifications.js';
import trackingRouter from './server/api/tracking.js';
import adminRouter from './server/api/admin.js';

import analyticsRouter from './server/api/analytics.js';
import { rateLimiter } from './server/middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

  // 1. JSON Body Parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 2. Security Headers (Helmet Equivalent)
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // 3. Global Rate Limiting for API routes
  app.use('/api', rateLimiter(120, 60000));

  // 4. API Endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/trains', trainsRouter);
  app.use('/api/stations', stationsRouter);
  app.use('/api/routes', routesRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/tracking', trackingRouter);
  app.use('/api/admin', adminRouter);

  app.use('/api/analytics', analyticsRouter);

  // 5. Health Check Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Railway Reservation API Service Operational',
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  });

  // 6. Global 404 for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'API Route Not Found',
      errors: [`The endpoint '${req.originalUrl}' does not exist.`]
    });
  });

  // 7. Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      errors: [err.message || 'An unexpected error occurred on the server.']
    });
  });

  // Export app for Vercel Serverless
  export default app;

  // Local Server Initialization
  if (!process.env.VERCEL) {
    async function startServer() {
      // 8. Vite Middleware for Frontend Serving
      if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Railway Platform Enterprise Server listening on http://0.0.0.0:${PORT}`);
    });
  }

  startServer();
}
