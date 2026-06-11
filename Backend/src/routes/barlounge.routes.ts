import { Role } from '../models/User';
import { Router } from 'express';
import { getVipSuites, addVipSuite, updateVipSuite, deleteVipSuite, checkoutVipSuite, getLiquorItems, addLiquorItem, updateLiquorStock, checkoutBarLounge, updateLiquorItem, deleteLiquorItem } from '../controllers/barlounge.controller';
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
  .put(updateLiquorItem)
  .delete(deleteLiquorItem);


// VIP Suites
router.route('/suites')
  .get(getVipSuites)
  .post(addVipSuite);

router.route('/suites/:id')
  .put(updateVipSuite)
  .delete(deleteVipSuite);

router.route('/suites/:id/checkout')
  .post(checkoutVipSuite);


export default router;
