import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { signup, login, getMe, updateMe } from '../controllers/authController.js';
import { signupSchema, loginSchema, updateProfileSchema } from '../validators/authValidators.js';

const router = Router();

// Tighter rate limit on auth endpoints to slow brute-force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later', data: null },
});

router.post('/signup', authLimiter, validate({ body: signupSchema }), signup);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);

router.get('/me', protect, getMe);
router.put('/me', protect, validate({ body: updateProfileSchema }), updateMe);

export default router;
