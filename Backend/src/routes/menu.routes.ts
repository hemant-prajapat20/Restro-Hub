import { Role } from '../models/User';
import { Router } from 'express';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menu.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// All menu routes require the user to be logged in and be a Business Admin
router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/')
  .get(getMenuItems)
  .post(addMenuItem);

router.route('/:id')
  .put(updateMenuItem)
  .delete(deleteMenuItem);

export default router;
