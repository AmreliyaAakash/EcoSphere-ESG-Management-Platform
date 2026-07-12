import { Router } from 'express';
import { 
  getChallenges, 
  getChallengeById, 
  createChallenge, 
  updateChallenge, 
  deleteChallenge 
} from '../controllers/challenge.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

router.get('/', getChallenges);
router.get('/:id', getChallengeById);
router.post('/', createChallenge);
router.patch('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);

export default router;
