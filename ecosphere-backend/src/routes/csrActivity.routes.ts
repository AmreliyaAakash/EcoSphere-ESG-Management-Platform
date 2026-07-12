import { Router } from 'express';
import { getCSRActivities } from '../controllers/csrActivity.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);
router.get('/', getCSRActivities);

export default router;
