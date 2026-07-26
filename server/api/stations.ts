import { Router, Request, Response } from 'express';
import { db } from '../database/db.js';
import { verifyTokenMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { Station } from '../../src/types/index.js';

const router = Router();

// GET /api/stations - Search station directory with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, zone } = req.query;
    const stations = await db.getStations({
      search: search as string,
      zone: zone as string
    });

    return res.json({
      success: true,
      message: `Retrieved ${stations.length} stations.`,
      data: {
        stations,
        total: stations.length
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /api/stations/:code - Get station by code
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const station = await db.getStationByCode(req.params.code);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found',
        errors: [`No active station found with code '${req.params.code}'`]
      });
    }

    return res.json({
      success: true,
      message: 'Station details retrieved',
      data: { station }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/stations - Create station (Admin only)
router.post('/', verifyTokenMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, name, city, state, zone, platforms, latitude, longitude, amenities } = req.body;

    if (!code || !name || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: ['code, name, city, and state are required fields.']
      });
    }

    const upperCode = code.toUpperCase();
    const existing = await db.getStationByCode(upperCode);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Conflict Error',
        errors: [`Station code '${upperCode}' already exists.`]
      });
    }

    const now = new Date().toISOString();
    const newStation: Station = {
      id: 'stn_' + upperCode.toLowerCase(),
      code: upperCode,
      name,
      city,
      state,
      zone: zone || 'NR',
      platforms: Number(platforms) || 4,
      latitude: Number(latitude) || 28.6139,
      longitude: Number(longitude) || 77.2090,
      amenities: amenities || ['Wi-Fi', 'Food Court', 'ATM'],
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    await db.createStation(newStation);
    await db.addAuditLog('STATION_CREATE', 'STATIONS', req.ip || '', `Created station ${upperCode} (${name})`, req.user);

    return res.status(201).json({
      success: true,
      message: `Station ${upperCode} created successfully!`,
      data: { station: newStation }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create station',
      errors: [err.message]
    });
  }
});

// PUT /api/stations/:id - Update station (Admin only)
router.put('/:id', verifyTokenMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await db.updateStation(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Station not found',
        errors: ['Station record not found for update.']
      });
    }

    await db.addAuditLog('STATION_UPDATE', 'STATIONS', req.ip || '', `Updated station ${updated.code}`, req.user);

    return res.json({
      success: true,
      message: 'Station updated successfully!',
      data: { station: updated }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// DELETE /api/stations/:id - Delete station (Admin only)
router.delete('/:id', verifyTokenMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await db.deleteStation(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Station not found',
        errors: ['Station record not found for deletion.']
      });
    }

    await db.addAuditLog('STATION_DELETE', 'STATIONS', req.ip || '', `Deleted station ID ${req.params.id}`, req.user);

    return res.json({
      success: true,
      message: 'Station deleted successfully!',
      data: { id: req.params.id }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
