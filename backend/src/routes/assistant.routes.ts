import { Router } from 'express';
import { askAssistant } from '../controllers/assistant.controller';
import { assistantRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// POST /api/v1/assistant/ask
router.post('/ask', assistantRateLimiter, askAssistant);

export default router;
