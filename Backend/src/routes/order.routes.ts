import { Role } from '../models/User';
import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id/status')
  .patch(updateOrderStatus);

export default router;
