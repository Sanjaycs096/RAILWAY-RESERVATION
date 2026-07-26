import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { verifyTokenMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { Train } from '../../src/types';

const router = Router();

// GET /api/trains - Search trains with filters, sorting, and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { from, to, search, type, sortBy, sortOrder } = req.query;

    let trains = await db.getTrains({
      fromCode: from as string,
      toCode: to as string,
      search: search as string,
      type: type as string
    });

    // Sorting
    if (sortBy === 'departure') {
      trains.sort((a, b) => (sortOrder === 'desc' ? b.departureTime.localeCompare(a.departureTime) : a.departureTime.localeCompare(b.departureTime)));
    } else if (sortBy === 'duration') {
      trains.sort((a, b) => (sortOrder === 'desc' ? b.duration.localeCompare(a.duration) : a.duration.localeCompare(b.duration)));
    }

    return res.json({
      success: true,
      message: `Found ${trains.length} trains matching criteria.`,
      data: {
        trains,
        total: trains.length
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to search trains',
      errors: [err.message]
    });
  }
});

// GET /api/trains/:id - Get specific train details including route and coach information
router.get('/:id', async (req: Request, res: Response) => {
  const train = await db.getTrainByNumber(req.params.id);
  if (!train) {
    return res.status(404).json({
      success: false,
      message: 'Train not found',
      errors: [`No train found matching identifier '${req.params.id}'`]
    });
  }

  const route = await db.getRouteById(train.routeId);

  return res.json({
    success: true,
    message: 'Train details retrieved successfully',
    data: {
      train,
      route
    }
  });
});

// POST /api/trains - Create new train (Admin only)
router.post('/', verifyTokenMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { trainNumber, trainName, type, originCode, originName, destinationCode, destinationName, departureTime, arrivalTime, duration, runsOn, coaches, routeId } = req.body;

    if (!trainNumber || !trainName || !originCode || !destinationCode) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: ['trainNumber, trainName, originCode, and destinationCode are required.']
      });
    }

    const existing = await db.getTrainByNumber(trainNumber);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Conflict Error',
        errors: [`Train number '${trainNumber}' already exists.`]
      });
    }

    const now = new Date().toISOString();
    const newTrain: Train = {
      id: 'trn_' + Date.now(),
      trainNumber,
      trainName,
      type: type || 'Superfast',
      originCode,
      originName: originName || originCode,
      destinationCode,
      destinationName: destinationName || destinationCode,
      departureTime: departureTime || '08:00',
      arrivalTime: arrivalTime || '20:00',
      duration: duration || '12h 00m',
      runsOn: runsOn || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      routeId: routeId || 'rt_ndls_mmct',
      status: 'On Time',
      delayMinutes: 0,
      coaches: coaches || [
        { type: '2A', name: 'AC 2-Tier', totalSeats: 48, availableSeats: 20, fare: 80 },
        { type: '3A', name: 'AC 3-Tier', totalSeats: 64, availableSeats: 30, fare: 50 },
        { type: 'SL', name: 'Sleeper', totalSeats: 72, availableSeats: 45, fare: 25 }
      ],
      createdAt: now,
      updatedAt: now
    };

    await db.createTrain(newTrain);
    await db.addAuditLog('TRAIN_CREATE', 'TRAINS', req.ip || '', `Created train ${trainNumber} (${trainName})`, req.user);

    return res.status(201).json({
      success: true,
      message: `Train ${trainNumber} created successfully!`,
      data: { train: newTrain }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create train',
      errors: [err.message]
    });
  }
});

// PUT /api/trains/:id - Update train details (Admin only)
router.put('/:id', verifyTokenMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const updated = await db.updateTrain(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Train not found',
      errors: ['Cannot update non-existent train record.']
    });
  }

  await db.addAuditLog('TRAIN_UPDATE', 'TRAINS', req.ip || '', `Updated train ${updated.trainNumber}`, req.user);

  return res.json({
    success: true,
    message: 'Train updated successfully!',
    data: { train: updated }
  });
});

// DELETE /api/trains/:id - Soft delete train (Admin only)
router.delete('/:id', verifyTokenMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const success = await db.deleteTrain(req.params.id);
  if (!success) {
    return res.status(404).json({
      success: false,
      message: 'Train not found',
      errors: ['Cannot delete non-existent train record.']
    });
  }

  await db.addAuditLog('TRAIN_DELETE', 'TRAINS', req.ip || '', `Soft deleted train ID ${req.params.id}`, req.user);

  return res.json({
    success: true,
    message: 'Train deleted successfully!',
    data: { id: req.params.id }
  });
});

export default router;
