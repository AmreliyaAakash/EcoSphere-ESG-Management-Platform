import { Router } from 'express';
import { 
  getEmissionFactors, 
  getEmissionFactorById, 
  createEmissionFactor, 
  updateEmissionFactor, 
  deleteEmissionFactor 
} from '../controllers/emissionFactor.controller';
import { verifyJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate as val } from '../middleware/validate.middleware';
import { createEmissionFactorSchema, updateEmissionFactorSchema } from '../schemas/emissionFactor.schema';

const router = Router();

router.use(verifyJWT);

router.get('/', getEmissionFactors);
router.get('/:id', getEmissionFactorById);

// Admin-only CRUD operations
router.post('/', requireRole('admin'), val(createEmissionFactorSchema), createEmissionFactor);
router.put('/:id', requireRole('admin'), val(updateEmissionFactorSchema), updateEmissionFactor);
router.delete('/:id', requireRole('admin'), deleteEmissionFactor);

export default router;
