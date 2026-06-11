import { Role } from '../models/User';
import { Router } from 'express';
import { getLiquorItems, addLiquorItem, updateLiquorStock, checkoutBarLounge, updateBarItem, deleteBarItem } from '../controllers/barlounge.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/liquor')
  .get(getLiquorItems)
  .post(addLiquorItem);

router.route('/liquor/:id/stock')
  .put(updateLiquorStock);

router.route('/checkout')
  .post(checkoutBarLounge);


router.route('/items/:id')
  .put(updateBarItem)
  .delete(deleteBarItem);

export default router;
