import { Router } from 'express';
import { 
  getEnvironmentalGoals, 
  createEnvironmentalGoal, 
  updateEnvironmentalGoal, 
  deleteEnvironmentalGoal 
} from '../controllers/environmentalGoal.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

router.get('/', getEnvironmentalGoals);
router.post('/', createEnvironmentalGoal);
router.patch('/:id', updateEnvironmentalGoal);
router.delete('/:id', deleteEnvironmentalGoal);

export default router;
