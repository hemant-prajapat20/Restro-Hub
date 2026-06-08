import { Router } from 'express';
import { createBusiness, getAllBusinesses, updateBusiness } from '../controllers/business.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = Router();

// All routes here are protected and require SUPER_ADMIN role
router.use(protect);
router.use(authorize(Role.SUPER_ADMIN));

router.post('/', createBusiness);
router.get('/', getAllBusinesses);
router.put('/:id', updateBusiness);

export default router;
