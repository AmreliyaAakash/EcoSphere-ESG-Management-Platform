import { Router } from 'express';
import { 
  getCSRActivities, 
  createCSRActivity, 
  updateCSRActivity, 
  deleteCSRActivity 
} from '../controllers/csrActivity.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

router.get('/', getCSRActivities);
router.post('/', createCSRActivity);
router.patch('/:id', updateCSRActivity);
router.delete('/:id', deleteCSRActivity);

export default router;
