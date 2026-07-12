import { Router } from 'express';
import { getAudits, getComplianceIssues } from '../controllers/compliance.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * /audits:
 *   get:
 *     summary: Get all audit logs
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/audits', getAudits);

/**
 * @swagger
 * /compliance-issues:
 *   get:
 *     summary: Get all compliance issues
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of compliance issues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/compliance-issues', getComplianceIssues);

export default router;
