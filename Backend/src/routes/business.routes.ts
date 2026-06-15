import { Router } from 'express';
import { createBusiness, getAllBusinesses, updateBusiness, getPublicBusinesses, updateMyBusinessLogo, updateMyHotelImages } from '../controllers/business.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = Router();

router.get('/public', getPublicBusinesses);

// Protected routes
router.use(protect);

// Routes for Business Admin
router.put('/me/logo', authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), updateMyBusinessLogo);
router.put('/me/hotel-images', authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), updateMyHotelImages);

// Routes for Super Admin
router.post('/', authorize(Role.SUPER_ADMIN), createBusiness);
router.get('/', authorize(Role.SUPER_ADMIN), getAllBusinesses);
router.put('/:id', authorize(Role.SUPER_ADMIN), updateBusiness);

export default router;
