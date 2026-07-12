import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/auth.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', verifyJWT, getCurrentUser);

export default router;
