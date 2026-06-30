import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/orderValidators.js';
import { idParamSchema } from '../validators/dishValidators.js';

const router = Router();

// All order routes require authentication.
router.use(protect);

router.post('/', validate({ body: createOrderSchema }), createOrder);
router.get('/me', getMyOrders);

// Admin: list all orders. Defined before /:id so "/" stays unambiguous.
router.get('/', authorize('admin'), getAllOrders);

router.get('/:id', validate({ params: idParamSchema }), getOrderById);
router.patch(
  '/:id/status',
  authorize('admin'),
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  updateOrderStatus
);

export default router;
