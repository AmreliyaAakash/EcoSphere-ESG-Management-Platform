import { Router } from 'express';
import { 
  getChallengeParticipations, 
  approveChallengeParticipation, 
  rejectChallengeParticipation 
} from '../controllers/challengeParticipation.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * /challenge-participations:
 *   get:
 *     summary: Get all challenge participations
 *     tags: [Challenge Participations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of challenge participations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/', getChallengeParticipations);

/**
 * @swagger
 * /challenge-participations/{id}/approve:
 *   patch:
 *     summary: Approve challenge participation and award XP / badges
 *     tags: [Challenge Participations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenge participation approved successfully
 *       400:
 *         description: Proof required or other business logic failure
 */
router.patch('/:id/approve', approveChallengeParticipation);

/**
 * @swagger
 * /challenge-participations/{id}/reject:
 *   patch:
 *     summary: Reject challenge participation
 *     tags: [Challenge Participations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenge participation rejected successfully
 */
router.patch('/:id/reject', rejectChallengeParticipation);

export default router;
