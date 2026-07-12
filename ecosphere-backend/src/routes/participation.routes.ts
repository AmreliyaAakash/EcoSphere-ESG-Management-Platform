import { Router } from 'express';
import { getEmployeeParticipations, approveParticipation, rejectParticipation } from '../controllers/participation.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * /employee-participations:
 *   get:
 *     summary: Get all employee CSR activity participations
 *     tags: [CSR Participations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of participations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/', getEmployeeParticipations);

/**
 * @swagger
 * /employee-participations/{id}/approve:
 *   patch:
 *     summary: Approve an employee CSR activity participation
 *     tags: [CSR Participations]
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
 *         description: Participation approved successfully
 *       400:
 *         description: Proof required before approval or invalid status
 */
router.patch('/:id/approve', approveParticipation);

/**
 * @swagger
 * /employee-participations/{id}/reject:
 *   patch:
 *     summary: Reject an employee CSR activity participation
 *     tags: [CSR Participations]
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
 *         description: Participation rejected successfully
 */
router.patch('/:id/reject', rejectParticipation);

export default router;
