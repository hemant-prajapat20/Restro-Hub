import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = express.Router();

router.route('/')
  .get(protect, authorize(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN), getSettings)
  .put(protect, authorize(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN), updateSettings);

export default router;
