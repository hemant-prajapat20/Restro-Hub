import { Role } from '../models/User';
import { Router } from 'express';
import { getSignatures, addSignature, getPdrs, updatePdrStatus, checkoutPdr } from '../controllers/restrosignature.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

router.route('/signatures')
  .get(getSignatures)
  .post(addSignature);

router.route('/pdrs')
  .get(getPdrs);

router.route('/pdrs/:id/status')
  .put(updatePdrStatus);

router.route('/pdrs/:id/checkout')
  .post(checkoutPdr);

export default router;
