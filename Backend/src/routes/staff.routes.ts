import { Role } from '../models/User';
import { Router } from 'express';
import { getStaff, addStaff, updateStaff, deleteStaff, getStaffCategories, updateStaffCategories } from '../controllers/staff.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/')
  .get(getStaff)
  .post(addStaff);

router.route('/categories')
  .get(getStaffCategories)
  .post(updateStaffCategories);

router.route('/:id')
  .put(updateStaff)
  .delete(deleteStaff);

export default router;
