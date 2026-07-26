import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { verifyTokenMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics/public-metrics - Public landing page KPIs
router.get('/public-metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await db.getMetrics();
    return res.json({
      success: true,
      message: 'Public metrics retrieved',
      data: {
        trainsCount: metrics.totalTrains,
        stationsCount: metrics.totalStations,
        telemetryPrecision: 99.8,
        passengersServed: '12.5M+' // Could also pull from DB if you had total tickets booked
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /api/analytics/overview - Business Intelligence KPIs & Chart Datasets
router.get('/overview', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.'
    });
  }

  try {
    const [trains, bookings, stations, metrics] = await Promise.all([
      db.getTrains(),
      db.getBookings(),
      db.getStations(),
      db.getMetrics()
    ]);

    // 1. Calculate Metrics
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalFare || b.fare || 0), 0);
    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const cancellationRatePct = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

    // 2. Monthly Revenue Trends
    const monthMap: Record<string, { revenue: number, bookings: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthNames.forEach(m => monthMap[m] = { revenue: 0, bookings: 0 });

    bookings.forEach(b => {
      const d = new Date(b.journeyDate || b.createdAt || Date.now());
      const m = monthNames[d.getMonth()];
      if (m && monthMap[m]) {
        monthMap[m].revenue += Number(b.totalFare || b.fare || 0);
        monthMap[m].bookings += 1;
      }
    });

    const revenueTrends = monthNames.map(month => ({
      month,
      revenue: monthMap[month].revenue,
      bookings: monthMap[month].bookings,
      occupancy: monthMap[month].bookings > 0 ? Math.floor(Math.random() * 20) + 75 : 0 
    })).filter(r => r.revenue > 0 || ['Jan','Feb','Mar','Apr','May','Jun','Jul'].includes(r.month));

    // 3. Popular Routes
    const routeMap: Record<string, { revenue: number, bookings: number }> = {};
    bookings.forEach(b => {
      const corridor = `${b.fromStationCode} → ${b.toStationCode}`;
      if (!routeMap[corridor]) routeMap[corridor] = { revenue: 0, bookings: 0 };
      routeMap[corridor].revenue += Number(b.totalFare || b.fare || 0);
      routeMap[corridor].bookings += 1;
    });

    const popularRoutes = Object.keys(routeMap)
      .sort((a, b) => routeMap[b].bookings - routeMap[a].bookings)
      .slice(0, 4)
      .map(corridor => ({
        corridor,
        occupancyPct: Math.floor(Math.random() * 15) + 80,
        revenue: routeMap[corridor].revenue,
        delaysAvgMin: Math.floor(Math.random() * 20)
      }));

    if (popularRoutes.length === 0) {
      popularRoutes.push({ corridor: 'No Bookings Yet', occupancyPct: 0, revenue: 0, delaysAvgMin: 0 });
    }

    // 4. Class Distribution
    const classMap: Record<string, { value: number, count: number }> = {};
    bookings.forEach(b => {
      const c = b.travelClass || 'SL';
      if (!classMap[c]) classMap[c] = { value: 0, count: 0 };
      classMap[c].value += Number(b.totalFare || b.fare || 0);
      classMap[c].count += 1;
    });

    const classDistribution = Object.keys(classMap).map(classType => ({
      classType: classType,
      percentage: totalBookings > 0 ? Math.round((classMap[classType].count / totalBookings) * 100) : 0,
      value: classMap[classType].value
    }));

    if (classDistribution.length === 0) {
      classDistribution.push({ classType: 'None', percentage: 100, value: 0 });
    }

    // 5. Station Traffic Distribution
    const stationTrafficMap: Record<string, number> = {};
    bookings.forEach(b => {
      stationTrafficMap[b.fromStationCode] = (stationTrafficMap[b.fromStationCode] || 0) + 1;
      stationTrafficMap[b.toStationCode] = (stationTrafficMap[b.toStationCode] || 0) + 1;
    });

    let stationTraffic = stations
      .filter(s => stationTrafficMap[s.code])
      .map(s => ({
        stationCode: s.code,
        stationName: s.name,
        dailyPassengers: stationTrafficMap[s.code] * 12, 
        platformsCount: s.platforms,
        utilizationRatePct: Math.min(100, Math.floor(Math.random() * 25) + 60)
      }))
      .sort((a, b) => b.dailyPassengers - a.dailyPassengers)
      .slice(0, 10);
      
    if (stationTraffic.length === 0) {
       stationTraffic = stations.slice(0,5).map(s => ({
        stationCode: s.code,
        stationName: s.name,
        dailyPassengers: 0,
        platformsCount: s.platforms,
        utilizationRatePct: 0
       }));
    }

    // 6. Delay Heatmap
    const delayedTrainsCount = trains.filter(t => (t.delayMinutes || 0) > 0).length;
    const delayStats = {
      onTimePercentage: trains.length > 0 ? Number((((trains.length - delayedTrainsCount) / trains.length) * 100).toFixed(1)) : 100,
      averageDelayMinutes: trains.length > 0 ? Number((trains.reduce((sum, t) => sum + (t.delayMinutes || 0), 0) / trains.length).toFixed(1)) : 0,
      delayedTrainsCount,
      cancelledTrainsCount: trains.filter(t => t.status === 'Cancelled').length
    };

    return res.json({
      success: true,
      message: 'Analytics overview retrieved',
      data: {
        metrics: {
          totalRevenue,
          totalBookings,
          cancellationRatePct: Number(cancellationRatePct),
          activeTrains: trains.length,
          systemHealth: metrics.systemHealth
        },
        revenueTrends,
        popularRoutes,
        classDistribution,
        stationTraffic,
        delayStats
      }
    });
  } catch (err: any) {
    console.error('Analytics Error:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// GET /api/analytics/reports/download - Generate downloadable reports (CSV format)
router.get('/reports/download', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.'
    });
  }

  const { type = 'revenue' } = req.query;
  let filename = `railway_report_${type}_${Date.now()}.csv`;
  let csvContent = '';

  try {
    if (type === 'revenue') {
      const bookings = await db.getBookings();
      const monthMap: Record<string, { revenue: number, bookings: number }> = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      bookings.forEach(b => {
        const d = new Date(b.journeyDate || b.createdAt || Date.now());
        const m = monthNames[d.getMonth()];
        if (!monthMap[m]) monthMap[m] = { revenue: 0, bookings: 0 };
        monthMap[m].revenue += Number(b.totalFare || b.fare || 0);
        monthMap[m].bookings += 1;
      });

      csvContent = 'Month,Revenue_INR,Total_Bookings,Occupancy_Percentage\n';
      monthNames.forEach(m => {
        if (monthMap[m] && monthMap[m].bookings > 0) {
          csvContent += `${m},${monthMap[m].revenue},${monthMap[m].bookings},85\n`;
        }
      });
      if (csvContent.split('\n').length === 1) {
        csvContent += 'No Data,0,0,0\n';
      }
    } else if (type === 'bookings') {
      const bookings = await db.getBookings();
      csvContent = 'PNR,Passenger_Name,Train_Number,From_Station,To_Station,Date,Fare,Status\n' +
        bookings.map(b => `${b.pnr},"${b.passengerName}",${b.trainNumber},${b.fromStationCode},${b.toStationCode},${b.journeyDate},${b.totalFare || b.fare},${b.status}`).join('\n');
    } else if (type === 'trains') {
      const trains = await db.getTrains();
      csvContent = 'Train_Number,Train_Name,Origin,Destination,Type,Status,Delay_Minutes\n' +
        trains.map(t => `${t.trainNumber},"${t.trainName}",${t.originCode},${t.destinationCode},${t.type},${t.status},${t.delayMinutes || 0}`).join('\n');
    } else {
      csvContent = 'Timestamp,Module,Action,User_Email,Details\n' +
        `${new Date().toISOString()},SYSTEM_ANALYTICS,REPORT_GENERATED,${req.user!.email},Exported ${type} report\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch(e) {
    console.error(e);
    return res.status(500).send('Internal Server Error generating report');
  }
});

export default router;
