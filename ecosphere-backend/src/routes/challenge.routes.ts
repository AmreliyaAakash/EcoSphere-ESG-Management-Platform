import { Router } from 'express';
import { getChallenges, getChallengeById } from '../controllers/challenge.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);
router.get('/', getChallenges);
router.get('/:id', getChallengeById);

export default router;
