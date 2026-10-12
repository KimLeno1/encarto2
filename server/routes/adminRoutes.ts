import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middlewares/auth.js';

export const adminRouter = Router();

// All admin routes require authentication and ADMIN role
adminRouter.use(authenticate, requireRole(['ADMIN']));

// System health and stats
adminRouter.get('/stats', AdminController.getSystemStats);

// User account management & inspection
adminRouter.get('/users', AdminController.getUsers);
adminRouter.put('/users/:userId/role', AdminController.updateUserRole);
adminRouter.put('/users/:userId/status', AdminController.updateUserStatus);

// Match records & audit logs
adminRouter.get('/matches', AdminController.getMatches);
adminRouter.get('/audit-logs', AdminController.getAuditLogs);

// Platform & game configuration
adminRouter.post('/config/games', AdminController.configureGame);
adminRouter.post('/config/bots', AdminController.configureBots);
