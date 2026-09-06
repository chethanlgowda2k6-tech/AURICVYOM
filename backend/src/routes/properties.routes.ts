import { Router } from 'express';
import { getProperties, getPropertyById, getNearbyProperties } from '../controllers/properties.controller';

const router = Router();

router.get('/nearby', getNearbyProperties);
router.get('/', getProperties);
router.get('/:id', getPropertyById);

export default router;
