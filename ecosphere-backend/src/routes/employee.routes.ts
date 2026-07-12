import { Router } from 'express';
import { getEmployees, getEmployeeById, getLeaderboard } from '../controllers/employee.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);
router.get('/', getEmployees);
router.get('/leaderboard', getLeaderboard); // Define this before /:id to prevent route clash
router.get('/:id', getEmployeeById);

export default router;
