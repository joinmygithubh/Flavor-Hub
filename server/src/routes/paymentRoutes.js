import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  createPayment,
  mockPay,
  verifyPaymentController,
} from '../controllers/paymentController.js';
import {
  createPaymentSessionSchema,
  verifyPaymentSchema,
} from '../validators/orderValidators.js';

const router = Router();

// All payment endpoints require an authenticated user.
router.use(protect);

router.post('/create', validate({ body: createPaymentSessionSchema }), createPayment);

// Mock-only: simulate the gateway widget completing payment (test mode).
router.post('/mock-pay', mockPay);

router.post('/verify', validate({ body: verifyPaymentSchema }), verifyPaymentController);

export default router;
