import { Router } from 'express';
import { getBadges } from '../controllers/badge.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);
router.get('/', getBadges);

export default router;
