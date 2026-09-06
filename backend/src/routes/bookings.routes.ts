import { Router } from 'express';
import { createBooking, getBookings, cancelBooking, createPaymentIntent } from '../controllers/bookings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);
router.post('/:id/cancel', authenticate, cancelBooking);
router.post('/payment-intent', authenticate, createPaymentIntent);

export default router;
