import { Router } from 'express';
import { getCarbonTransactions } from '../controllers/carbonTransaction.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyJWT);
router.get('/', getCarbonTransactions);

export default router;
