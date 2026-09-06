import { Router } from 'express';
import { searchFlights, searchTrains } from '../controllers/transport.controller';

const router = Router();

router.get('/flights', searchFlights);
router.get('/trains', searchTrains);

export default router;
