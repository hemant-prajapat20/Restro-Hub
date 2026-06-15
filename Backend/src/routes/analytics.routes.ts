import express from 'express';
import { getSuperAdminAnalytics, getBusinessAnalytics, getBusinessReports, getSubscriptionTransactions } from '../controllers/analytics.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = express.Router();

router.route('/superadmin')
  .get(protect, authorize(Role.SUPER_ADMIN), getSuperAdminAnalytics);

router.route('/superadmin/transactions')
  .get(protect, authorize(Role.SUPER_ADMIN), getSubscriptionTransactions);

router.route('/business')
  .get(protect, authorize(Role.BUSINESS_ADMIN), getBusinessAnalytics);

router.route('/business/reports')
  .get(protect, authorize(Role.BUSINESS_ADMIN), getBusinessReports);

export default router;
