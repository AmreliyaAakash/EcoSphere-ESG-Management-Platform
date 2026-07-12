import { Router } from 'express';
import { getDepartments, getCategories, getESGConfig } from '../controllers/config.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/departments', getDepartments);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories for CSR activities and challenges
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /config/esg:
 *   get:
 *     summary: Retrieve singleton ESG configuration details
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ESG Configuration document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/config/esg', getESGConfig);

export default router;
