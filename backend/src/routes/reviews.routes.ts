import { Router } from 'express';
import { getPropertyReviews, createReview } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/property/:propertyId', getPropertyReviews);
router.post('/', authenticate, createReview);

export default router;
