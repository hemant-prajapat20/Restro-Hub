import express from 'express';
import { login, registerSuperAdmin, registerCustomer, getProfile, sendOtp, verifyOtp, secretLogin } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register/super', registerSuperAdmin); // Initial super admin setup
router.post('/register/customer', registerCustomer); // Public customer setup
router.post('/login', login);
router.post('/secret-login', secretLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', protect, getProfile);

export default router;
