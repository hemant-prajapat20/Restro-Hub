import { Role } from '../models/User';
import { Router } from 'express';
import { getSignatures, addSignature, getPdrs, addPdr, updatePdr, deletePdr, updatePdrStatus, checkoutPdr, updateRestroItem, deleteRestroItem } from '../controllers/restrosignature.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/signatures')
  .get(getSignatures)
  .post(addSignature);

router.route('/pdrs')
  .get(getPdrs)
  .post(addPdr);

router.route('/pdrs/:id')
  .put(updatePdr)
  .delete(deletePdr);

router.route('/pdrs/:id/status')
  .put(updatePdrStatus);

router.route('/pdrs/:id/checkout')
  .post(checkoutPdr);


router.route('/signatures/:id')
  .put(updateRestroItem)
  .delete(deleteRestroItem);

export default router;
