import express from 'express';
import { 
  getPricingConfig, 
  updatePricingConfig
} from '../controllers/subscription.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = express.Router();

router.use(protect);
router.use(authorize(Role.SUPER_ADMIN));

router.route('/')
  .get(getPricingConfig)
  .put(updatePricingConfig);

export default router;
