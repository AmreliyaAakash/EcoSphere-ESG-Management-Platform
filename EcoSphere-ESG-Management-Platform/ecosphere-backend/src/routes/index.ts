import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import emissionFactorRoutes from './emissionFactor.routes';
import carbonTransactionRoutes from './carbonTransaction.routes';
import environmentalGoalRoutes from './environmentalGoal.routes';
import csrActivityRoutes from './csrActivity.routes';
import participationRoutes from './participation.routes';
import challengeRoutes from './challenge.routes';
import challengeParticipationRoutes from './challengeParticipation.routes';
import badgeRoutes from './badge.routes';
import rewardRoutes from './reward.routes';
import employeeRoutes from './employee.routes';
import notificationRoutes from './notification.routes';
import reportRoutes from './report.routes';

// Import individual controller handlers for scattered routes
import { getPolicyAcknowledgements } from '../controllers/policy.controller';
import { 
  getAudits, 
  createAudit,
  updateAudit,
  deleteAudit,
  getComplianceIssues, 
  createComplianceIssue, 
  updateComplianceIssue,
  deleteComplianceIssue,
  runComplianceCheckJob,
  runChallengeRemindersJob
} from '../controllers/compliance.controller';
import { getLeaderboard } from '../controllers/employee.controller';
import { 
  getDepartments, 
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCategories, 
  createCategory,
  updateCategory,
  deleteCategory,
  getESGConfig, 
  updateESGConfig 
} from '../controllers/config.controller';
import policyRoutes from './policy.routes';
import { verifyJWT } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createComplianceIssueSchema } from '../schemas/compliance.schema';
import { requireRole } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';
import { storageService } from '../services/storage.service';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/dashboard', dashboardRoutes);
router.use('/emission-factors', emissionFactorRoutes);
router.use('/carbon-transactions', carbonTransactionRoutes);
router.use('/environmental-goals', environmentalGoalRoutes);
router.use('/csr-activities', csrActivityRoutes);
router.use('/employee-participations', participationRoutes);
router.use('/challenges', challengeRoutes);
router.use('/challenge-participations', challengeParticipationRoutes);
router.use('/badges', badgeRoutes);
router.use('/rewards', rewardRoutes);
router.use('/employees', employeeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

// Scattered / flat endpoints
router.get('/policy-acknowledgements', verifyJWT, getPolicyAcknowledgements);
router.use('/policies', policyRoutes);

// Audits CRUD
router.get('/audits', verifyJWT, getAudits);
router.post('/audits', verifyJWT, createAudit);
router.patch('/audits/:id', verifyJWT, updateAudit);
router.delete('/audits/:id', verifyJWT, deleteAudit);

// Compliance Issues CRUD
router.get('/compliance-issues', verifyJWT, getComplianceIssues);
router.post('/compliance-issues', verifyJWT, validate(createComplianceIssueSchema), createComplianceIssue);
router.patch('/compliance-issues/:id', verifyJWT, updateComplianceIssue);
router.delete('/compliance-issues/:id', verifyJWT, deleteComplianceIssue);

router.post('/admin/jobs/run-compliance-check', verifyJWT, requireRole('ADMIN'), runComplianceCheckJob);
router.post('/admin/jobs/run-challenge-reminders', verifyJWT, requireRole('ADMIN'), runChallengeRemindersJob);

router.get('/leaderboard', verifyJWT, getLeaderboard);

// Departments CRUD
router.get('/departments', verifyJWT, getDepartments);
router.post('/departments', verifyJWT, createDepartment);
router.patch('/departments/:id', verifyJWT, updateDepartment);
router.delete('/departments/:id', verifyJWT, deleteDepartment);

// Categories CRUD
router.get('/categories', verifyJWT, getCategories);
router.post('/categories', verifyJWT, createCategory);
router.patch('/categories/:id', verifyJWT, updateCategory);
router.delete('/categories/:id', verifyJWT, deleteCategory);

router.get('/config/esg', verifyJWT, getESGConfig);
router.patch('/config/esg', verifyJWT, requireRole('ADMIN'), updateESGConfig);

router.post('/uploads/proof', verifyJWT, upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file;
  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }
  const fileUrl = await storageService.uploadFile(file);
  return res.status(200).json(new ApiResponse(200, { fileUrl }, 'Proof file uploaded successfully'));
}));

router.post('/uploads/policy', verifyJWT, requireRole('ADMIN'), upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file;
  if (!file) {
    throw new ApiError(400, 'No file uploaded');
  }
  const fileUrl = await storageService.uploadFile(file);
  return res.status(200).json(new ApiResponse(200, { fileUrl }, 'Policy file uploaded successfully'));
}));

export default router;
