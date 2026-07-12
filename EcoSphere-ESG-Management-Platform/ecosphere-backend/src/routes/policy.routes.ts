import { Router } from 'express';
import { 
  getPolicies, 
  createPolicy, 
  updatePolicy, 
  deletePolicy 
} from '../controllers/policy.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

router.get('/', getPolicies);
router.post('/', createPolicy);
router.patch('/:id', updatePolicy);
router.delete('/:id', deletePolicy);

export default router;
