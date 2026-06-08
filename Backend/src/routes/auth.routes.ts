import express from 'express';
import { login, registerSuperAdmin, registerCustomer, getProfile, sendOtp, verifyOtp } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register/super', registerSuperAdmin); // Initial super admin setup
router.post('/register/customer', registerCustomer); // Public customer setup
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', protect, getProfile);

export default router;
