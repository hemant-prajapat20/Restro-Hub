import { Role } from '../models/User';
import { Router } from 'express';
import { getCafeItems, addCafeItem, updateCafeStock, checkoutCafe, updateCafeItem, deleteCafeItem, getCafeteriaUsers, addCafeteriaUser } from '../controllers/cafebakery.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/items')
  .get(getCafeItems)
  .post(addCafeItem);

router.route('/items/:id/stock')
  .put(updateCafeStock);

router.route('/checkout')
  .post(checkoutCafe);

router.route('/items/:id')
  .put(updateCafeItem)
  .delete(deleteCafeItem);

router.route('/users')
  .get(getCafeteriaUsers)
  .post(addCafeteriaUser);

export default router;
