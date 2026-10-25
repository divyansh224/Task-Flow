import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, me, updateMe, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateMeSchema } from '../validators/authValidator.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts. Try again later.' } });
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, validate(updateMeSchema), updateMe);
router.post('/logout', authenticate, logout);
export default router;
