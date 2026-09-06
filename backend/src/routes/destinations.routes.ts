import { Router } from 'express';
import { getStates, getStateByCode, getDestinations, getDestinationById, getNearbyDestinations } from '../controllers/destinations.controller';

const router = Router();

router.get('/states', getStates);
router.get('/states/:code', getStateByCode);
router.get('/nearby', getNearbyDestinations);
router.get('/', getDestinations);
router.get('/:id', getDestinationById);

export default router;
