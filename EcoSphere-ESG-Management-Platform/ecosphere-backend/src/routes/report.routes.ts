import { Router } from 'express';
import { 
  getReportPreview, 
  exportReport,
  getDiversityMetrics,
  getDiversityByDepartment,
  getEthnicityMetrics,
  getTrainingRecords
} from '../controllers/report.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

router.get('/diversity-metrics', getDiversityMetrics);
router.get('/diversity-by-department', getDiversityByDepartment);
router.get('/ethnicity-metrics', getEthnicityMetrics);
router.get('/training-records', getTrainingRecords);

/**
 * @swagger
 * /reports/{type}/preview:
 *   get:
 *     summary: Retrieve first 20 rows of report raw data for preview
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [carbon-transactions, csr-participation, compliance-issues, leaderboard]
 *     responses:
 *       200:
 *         description: Report preview data successfully fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:type/preview', getReportPreview);

/**
 * @swagger
 * /reports/{type}/export:
 *   get:
 *     summary: Export full report formatted as CSV, Excel (XLSX), or PDF
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [carbon-transactions, csr-participation, compliance-issues, leaderboard]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx, pdf]
 *           default: csv
 *     responses:
 *       200:
 *         description: Styled binary report stream download
 */
router.get('/:type/export', exportReport);

export default router;
