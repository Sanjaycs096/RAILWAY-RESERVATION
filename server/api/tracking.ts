import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { LiveTracking, StationStop } from '../../src/types';

const router = Router();

// GET /api/tracking/live/:trainId - Get live status simulation for a train
router.get('/live/:trainId', async (req: Request, res: Response) => {
  try {
    const train = await db.getTrainByNumber(req.params.trainId);

    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Train record not found',
        errors: [`No active train record found for ID or number '${req.params.trainId}'`]
      });
    }

    const route = await db.getRouteById(train.routeId);
    const stops = route ? route.stops : [];

    // Look up coordinates for origin & destination
    const originStn = await db.getStationByCode(train.originCode);
    const destStn = await db.getStationByCode(train.destinationCode);

    const originCoords = {
      lat: originStn?.latitude || 28.6431,
      lng: originStn?.longitude || 77.2197
    };

    const destinationCoords = {
      lat: destStn?.latitude || 18.9696,
      lng: destStn?.longitude || 72.8193
    };

    // Enrich all stops with lat/lng
    const enrichedStops: StationStop[] = [];
    for (const stop of stops) {
      const stn = await db.getStationByCode(stop.stationCode);
      enrichedStops.push({
        ...stop,
        latitude: stn?.latitude || (stop.stationCode === train.originCode ? originCoords.lat : destinationCoords.lat),
        longitude: stn?.longitude || (stop.stationCode === train.originCode ? originCoords.lng : destinationCoords.lng)
      });
    }

  // Dynamic simulation values based on train number
  const hash = parseInt(train.trainNumber, 10) || 1234;
  const progressPercent = (hash * 13) % 100 || 15;
  
  const stopsPassedCount = Math.max(1, Math.floor(enrichedStops.length * (progressPercent / 100)));
  const stopsPassed = enrichedStops.slice(0, stopsPassedCount);
  const upcomingStops = enrichedStops.slice(stopsPassedCount);

  // Calculate train live GPS position along route segment
  let currentLat = originCoords.lat;
  let currentLng = originCoords.lng;

  if (enrichedStops.length >= 2) {
    const maxDist = enrichedStops[enrichedStops.length - 1].distanceKm || 1000;
    const currentDist = (progressPercent / 100) * maxDist;

    let segmentIndex = 0;
    for (let i = 0; i < enrichedStops.length - 1; i++) {
      if (currentDist >= enrichedStops[i].distanceKm && currentDist <= enrichedStops[i + 1].distanceKm) {
        segmentIndex = i;
        break;
      }
    }

    const s1 = enrichedStops[segmentIndex];
    const s2 = enrichedStops[segmentIndex + 1] || s1;
    const segDist = Math.max(1, s2.distanceKm - s1.distanceKm);
    const ratio = Math.min(1, Math.max(0, (currentDist - s1.distanceKm) / segDist));

    const lat1 = s1.latitude || originCoords.lat;
    const lng1 = s1.longitude || originCoords.lng;
    const lat2 = s2.latitude || destinationCoords.lat;
    const lng2 = s2.longitude || destinationCoords.lng;

    currentLat = lat1 + ratio * (lat2 - lat1);
    currentLng = lng1 + ratio * (lng2 - lng1);
  }

  const liveData: LiveTracking = {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    originCode: train.originCode,
    originName: train.originName,
    originCoords,
    destinationCode: train.destinationCode,
    destinationName: train.destinationName,
    destinationCoords,
    currentStation: train.currentStationCode || train.originCode,
    nextStation: train.nextStationCode || train.destinationCode,
    status: train.status,
    delayMinutes: train.delayMinutes,
    speedKmh: train.speedKmh || (60 + ((hash * 7) % 70)),
    progressPercent,
    lastUpdated: new Date().toISOString(),
    coordinates: {
      lat: Number(currentLat.toFixed(5)),
      lng: Number(currentLng.toFixed(5))
    },
    stopsPassed,
    upcomingStops
  };

    return res.json({
      success: true,
      message: 'Live train tracking telemetry calculated',
      data: { tracking: liveData }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
