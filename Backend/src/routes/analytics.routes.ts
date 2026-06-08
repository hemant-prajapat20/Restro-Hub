import express from 'express';
import { getSuperAdminAnalytics } from '../controllers/analytics.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = express.Router();

router.route('/superadmin')
  .get(protect, authorize(Role.SUPER_ADMIN), getSuperAdminAnalytics);

export default router;
