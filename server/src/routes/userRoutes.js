import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
} from '../controllers/userController.js';
import { dishIdParamSchema } from '../validators/dishValidators.js';

const router = Router();

// All user routes require authentication.
router.use(protect);

router.get('/me/favorites', getFavorites);
router.get('/me/favorites/ids', getFavoriteIds);
router.post('/me/favorites/:dishId', validate({ params: dishIdParamSchema }), addFavorite);
router.delete('/me/favorites/:dishId', validate({ params: dishIdParamSchema }), removeFavorite);

export default router;
