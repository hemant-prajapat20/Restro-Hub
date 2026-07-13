import { Role } from '../models/User';
import { Router } from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus, updateOrder, verifyOtp, deleteOrder } from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder);

router.route('/:id/status')
  .patch(updateOrderStatus)
  .put(updateOrderStatus); // Support both PATCH and PUT

router.route('/:id/verify-otp')
  .post(verifyOtp);

export default router;
