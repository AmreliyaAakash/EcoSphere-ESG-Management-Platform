import { Router } from 'express';
import { 
  getScoreTrend, 
  getDepartmentScores, 
  getOverallScore, 
  getOverdueComplianceIssues, 
  getTopLeaderboard 
} from '../controllers/dashboard.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);

router.get('/score-trend', getScoreTrend);
router.get('/department-scores', getDepartmentScores);
router.get('/overall-score', getOverallScore);
router.get('/overdue-compliance-issues', getOverdueComplianceIssues);
router.get('/top-leaderboard', getTopLeaderboard);

export default router;
