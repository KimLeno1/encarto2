import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/authController.js';
import { authenticate, requireRole } from '../middlewares/auth.js';

export const authRouter = Router();

// Rate limiting: prevent brute-force attacks on login and registration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

// Authentication endpoints
authRouter.post('/register', authLimiter, AuthController.register);
authRouter.post('/login', authLimiter, AuthController.login);
authRouter.post('/logout', AuthController.logout);
authRouter.get('/me', authenticate, AuthController.me);

// Profile endpoints (with ownership validation)
authRouter.put('/profile/:userId', authenticate, AuthController.updateProfile);

// Admin-only endpoints
authRouter.get('/admin/audit-logs', authenticate, requireRole(['ADMIN']), AuthController.adminAuditLogs);
