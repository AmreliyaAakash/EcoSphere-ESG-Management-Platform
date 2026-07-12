import { Router } from 'express';
import { getPolicies } from '../controllers/policy.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * /policies:
 *   get:
 *     summary: Get all ESG policies
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of policies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/', getPolicies);

export default router;
