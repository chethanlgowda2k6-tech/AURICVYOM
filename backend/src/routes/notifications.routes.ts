import { Router } from 'express';
import {
  testEngagementNotification,
  broadcastDailyInspiration,
  getNotificationSchedule,
} from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/schedule', getNotificationSchedule);
router.post('/test-engagement', authenticate, testEngagementNotification);
router.post('/broadcast', broadcastDailyInspiration);

export default router;
