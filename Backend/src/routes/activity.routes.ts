import express from 'express';
import { getActivities, markAsRead } from '../controllers/activity.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = express.Router();

router.use(protect);
router.use(authorize(Role.SUPER_ADMIN));

router.route('/')
  .get(getActivities);

router.route('/read')
  .put(markAsRead);

export default router;
