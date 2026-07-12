import { Router } from 'express';
import { getRewards, redeemReward } from '../controllers/reward.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * /rewards:
 *   get:
 *     summary: Get all rewards available for redemption
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/', getRewards);

/**
 * @swagger
 * /rewards/{id}/redeem:
 *   post:
 *     summary: Redeem a reward with atomic transactions (points deduction and stock decrement)
 *     tags: [Rewards]
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
 *         description: Reward redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pointsBalance:
 *                       type: number
 *                     stockRemaining:
 *                       type: number
 *       400:
 *         description: Out of stock or insufficient points balance
 */
router.post('/:id/redeem', redeemReward);

export default router;
