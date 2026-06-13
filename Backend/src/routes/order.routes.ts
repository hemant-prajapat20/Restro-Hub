import { Role } from '../models/User';
import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus, updateOrder, verifyOtp } from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .put(updateOrder);

router.route('/:id/status')
  .patch(updateOrderStatus)
  .put(updateOrderStatus); // Support both PATCH and PUT

router.route('/:id/verify-otp')
  .post(verifyOtp);

export default router;
