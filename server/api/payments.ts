import { Router, Response } from 'express';
import { db } from '../database/db';
import { verifyTokenMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/payments/coupons - List all available promo coupons
router.get('/coupons', (req, res: Response) => {
  const coupons = db.getCoupons();
  return res.json({
    success: true,
    message: 'Coupons list retrieved',
    data: { coupons }
  });
});

// POST /api/payments/coupon/validate - Validate promo code
router.post('/coupon/validate', (req, res: Response) => {
  const { code, fare } = req.body;
  if (!code || typeof fare !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Code and fare are required fields.'
    });
  }

  const result = db.validateCoupon(code, fare);
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: result.message,
      data: { valid: false, discount: 0 }
    });
  }

  return res.json({
    success: true,
    message: result.message,
    data: { valid: true, discount: result.discount, coupon: result.coupon }
  });
});

// GET /api/payments/receipt/:paymentId - Get detailed receipt
router.get('/receipt/:paymentId', verifyTokenMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const payment = db.getPaymentByBooking(req.params.paymentId) || db.getPaymentByPNR(req.params.paymentId);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment receipt not found'
    });
  }

  return res.json({
    success: true,
    message: 'Payment receipt retrieved',
    data: { payment }
  });
});

export default router;
