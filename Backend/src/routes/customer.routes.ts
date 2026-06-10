import express from 'express';
import { getCustomers, getCustomerById, addCustomer } from '../controllers/customer.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/')
  .get(getCustomers)
  .post(addCustomer);

router.route('/:id')
  .get(getCustomerById);

export default router;
