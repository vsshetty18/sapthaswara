import { Router } from 'express';
import {
  getOverview,
  getUsers,
  getRevenue,
  getSupportTickets,
  getBugReports,
  getCrashReports,
  getReviews,
  getSystemHealth,
} from '../controllers/ownerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireOwner } from '../middleware/roleMiddleware';
import { standardLimiter } from '../middleware/rateLimiter';

const router = Router();

// All owner routes require authentication + owner role
router.use(authMiddleware, requireOwner, standardLimiter);

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.get('/revenue', getRevenue);
router.get('/support-tickets', getSupportTickets);
router.get('/bug-reports', getBugReports);
router.get('/crash-reports', getCrashReports);
router.get('/reviews', getReviews);
router.get('/system-health', getSystemHealth);

export default router;
