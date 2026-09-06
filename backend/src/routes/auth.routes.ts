import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePreferences,
  getPreferences
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { loginRateLimiter, forgotPasswordRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPasswordRateLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);

export default router;
