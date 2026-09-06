import { Router } from 'express';
import { acquireHold, releaseHold, getHoldStatus } from '../controllers/holds.controller';

const router = Router();

router.post('/acquire', acquireHold);
router.post('/release', releaseHold);
router.get('/status/:holdId', getHoldStatus);

export default router;
