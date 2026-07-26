import { Router, Response } from 'express';
import { db } from '../database/db';
import { verifyTokenMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { Booking, Passenger, Payment } from '../../src/types';

const router = Router();

// GET /api/bookings/my-bookings - Get current logged in user's bookings
router.get('/my-bookings', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const bookings = await db.getBookingsByUser(userId);

  return res.json({
    success: true,
    message: `Retrieved ${bookings.length} passenger bookings.`,
    data: { bookings }
  });
});

// GET /api/bookings/pnr/:pnr - Public PNR Status Lookup
router.get('/pnr/:pnr', async (req: AuthenticatedRequest, res: Response) => {
  const pnr = req.params.pnr;
  const booking = await db.getBookingByPNR(pnr);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'PNR Record Not Found',
      errors: [`No reservation record found for PNR '${pnr}'. Please check the 10-digit number.`]
    });
  }

  const payment = await db.getPaymentByPNR(pnr);

  return res.json({
    success: true,
    message: 'PNR Status retrieved successfully',
    data: { booking, payment }
  });
});

// GET /api/bookings/seats/:trainNumber/:classType - Fetch interactive seat map layout
router.get('/seats/:trainNumber/:classType', async (req, res: Response) => {
  const { trainNumber, classType } = req.params;
  const coaches = await db.getTrainCoaches(trainNumber, classType);

  return res.json({
    success: true,
    message: `Fetched coach layout for Train #${trainNumber} Class ${classType}`,
    data: { coaches }
  });
});

// POST /api/bookings/create - Create booking reservation with multi-passengers & payment simulation
router.post('/create', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      trainNumber,
      trainName,
      fromStationCode,
      fromStationName,
      toStationCode,
      toStationName,
      journeyDate,
      travelClass,
      passengers,
      selectedSeatIds,
      paymentMethod,
      couponCode,
      fare
    } = req.body;

    if (!trainNumber || !journeyDate || !travelClass) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: ['trainNumber, journeyDate, and travelClass are required fields.']
      });
    }

    const passengerList: Passenger[] = Array.isArray(passengers) && passengers.length > 0
      ? passengers
      : [{ name: req.user!.name, age: 30, gender: 'Male', berthPreference: 'Lower' }];

    const count = passengerList.length;
    const train = await db.getTrainByNumber(trainNumber);
    const coachMeta = train?.coaches?.find((c: any) => c.type === travelClass);
    if (!train || !coachMeta || typeof coachMeta.fare !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: ['Invalid train or travel class specified, or fare cannot be determined.']
      });
    }
    const unitFare = coachMeta.fare;
    const baseTotalFare = unitFare * count;

    // Apply Coupon discount if present
    let discountAmount = 0;
    if (couponCode) {
      const couponRes = db.validateCoupon(couponCode, baseTotalFare);
      if (couponRes.valid) {
        discountAmount = couponRes.discount;
      }
    }

    const taxAmount = Math.round((baseTotalFare - discountAmount) * 0.05 * 100) / 100; // 5% GST/Tax
    const finalTotalFare = Math.round((baseTotalFare - discountAmount + taxAmount) * 100) / 100;

    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const now = new Date().toISOString();
    const primaryCoach = `${travelClass[0]}${Math.floor(Math.random() * 3) + 1}`;

    // Assign seats
    const assignedSeatsList: string[] = [];
    passengerList.forEach((p, idx) => {
      const seatNum = selectedSeatIds && selectedSeatIds[idx] ? selectedSeatIds[idx] : `${Math.floor(Math.random() * 55) + 1}`;
      p.seatAssigned = seatNum;
      p.coachAssigned = primaryCoach;
      p.status = 'CONFIRMED';
      assignedSeatsList.push(`${primaryCoach}-${seatNum}`);
    });

    const paymentId = 'pay_' + Date.now();
    const newBooking: Booking = {
      id: 'bkg_' + Date.now(),
      pnr,
      userId: req.user!.id,
      passengerName: passengerList[0].name,
      passengerEmail: req.user!.email,
      passengers: passengerList,
      trainNumber,
      trainName: trainName || train?.trainName || `Express ${trainNumber}`,
      fromStationCode,
      fromStationName: fromStationName || fromStationCode,
      toStationCode,
      toStationName: toStationName || toStationCode,
      journeyDate,
      travelClass,
      seatNumber: assignedSeatsList.join(', '),
      coachNumber: primaryCoach,
      fare: baseTotalFare,
      taxAmount,
      discountAmount,
      totalFare: finalTotalFare,
      paymentId,
      paymentMethod: paymentMethod || 'UPI',
      couponCode,
      status: 'CONFIRMED',
      qrCodeData: `RAILNET|PNR:${pnr}|TRAIN:${trainNumber}|PASSENGERS:${count}|FARE:${finalTotalFare}|CONFIRMED`,
      barcodeData: pnr,
      platformNumber: Math.floor(Math.random() * 8) + 1,
      bookingDate: now,
      createdAt: now
    };

    // Store Payment
    const newPayment: Payment = {
      id: paymentId,
      bookingId: newBooking.id,
      pnr,
      amount: baseTotalFare,
      taxAmount,
      discountAmount,
      finalAmount: finalTotalFare,
      currency: 'INR',
      paymentMethod: paymentMethod || 'UPI',
      status: 'SUCCESS',
      transactionId: 'TXN_' + Math.floor(1000000000 + Math.random() * 9000000000),
      couponCode,
      createdAt: now,
      updatedAt: now
    };

    await db.createPayment(newPayment);
    await db.createBooking(newBooking);
    db.addAuditLog('BOOKING_CREATE', 'BOOKINGS', req.ip || '', `Created booking for ${count} passenger(s) with PNR ${pnr}`, req.user);

    return res.status(201).json({
      success: true,
      message: 'Reservation and Payment Confirmed!',
      data: { booking: newBooking, payment: newPayment }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      errors: [err.message]
    });
  }
});

// POST /api/bookings/cancel/:id - Cancel Booking & Calculate Refund
router.post('/cancel/:id', verifyTokenMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const { reason } = req.body;

  const result = await db.cancelBooking(bookingId, reason, req.user!.id);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message,
      errors: [result.message]
    });
  }

  return res.json({
    success: true,
    message: result.message,
    data: {
      refundAmount: result.refundAmount,
      cancellationFee: result.cancellationFee,
      booking: result.booking
    }
  });
});

export default router;

