import { Router } from 'express';
import {
  getAdminStats,
  getAdminProperties,
  updatePropertyDetails,
  updateRoomPricing,
  getAdminBookings,
  updateBookingStatus,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// 🔒 All Admin Routes are Gated by ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

router.get('/stats', getAdminStats);
router.get('/properties', getAdminProperties);
router.put('/properties/:id', updatePropertyDetails);
router.put('/properties/:id/rooms/:roomId', updateRoomPricing);
router.get('/bookings', getAdminBookings);
router.put('/bookings/:id/status', updateBookingStatus);

export default router;
