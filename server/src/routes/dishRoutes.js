import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  listDishes,
  getDishById,
  getCuisines,
  addReview,
  createDish,
  updateDish,
  deleteDish,
} from '../controllers/dishController.js';
import {
  listDishesQuerySchema,
  createDishSchema,
  updateDishSchema,
  reviewSchema,
  idParamSchema,
} from '../validators/dishValidators.js';

const router = Router();

// Public, read-only endpoints.
router.get('/', validate({ query: listDishesQuerySchema }), listDishes);
router.get('/meta/cuisines', getCuisines);
router.get('/:id', validate({ params: idParamSchema }), getDishById);

// Authenticated user actions.
router.post(
  '/:id/reviews',
  protect,
  validate({ params: idParamSchema, body: reviewSchema }),
  addReview
);

// Admin-only CRUD.
router.post('/', protect, authorize('admin'), validate({ body: createDishSchema }), createDish);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  validate({ params: idParamSchema, body: updateDishSchema }),
  updateDish
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate({ params: idParamSchema }),
  deleteDish
);

export default router;
