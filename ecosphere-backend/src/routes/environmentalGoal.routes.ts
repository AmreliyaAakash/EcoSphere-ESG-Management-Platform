import { Router } from 'express';
import { getEnvironmentalGoals } from '../controllers/environmentalGoal.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);
router.get('/', getEnvironmentalGoals);

export default router;
