import { Router } from 'express';
import { 
  generateItinerary, 
  saveTrip, 
  getSavedTrips,
  checkTripDisruptions,
  generateRebuildPlan,
  confirmRebuildPlan,
  getRevisionHistory,
  photoToTrip,
  budgetToItinerary
} from '../controllers/planner.controller';
import { authenticate } from '../middleware/auth';
import { photoTripRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Standard Itinerary Generation & Storage
router.post('/generate', generateItinerary);
router.post('/save', authenticate, saveTrip);
router.get('/saved', authenticate, getSavedTrips);

// 1. Rebuild My Trip (Disruption Monitoring & Re-planning)
router.post('/rebuild/check-disruptions', checkTripDisruptions);
router.post('/rebuild/generate', generateRebuildPlan);
router.post('/rebuild/confirm', confirmRebuildPlan);
router.get('/rebuild/history/:tripId', getRevisionHistory);

// 2. Photo-to-Trip (Gemini Vision Landmark Identification with Rate Limiting)
router.post('/photo-to-trip', photoTripRateLimiter, photoToTrip);

// 3. Budget-to-Itinerary (Reverse Planning Engine)
router.post('/budget-to-itinerary', budgetToItinerary);

export default router;
