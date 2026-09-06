import { Router } from 'express';
import { trackEvent, getAIConversionMetrics } from '../controllers/analytics.controller';

const router = Router();

router.post('/track', trackEvent);
router.get('/ai-conversion', getAIConversionMetrics);

export default router;
