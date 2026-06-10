import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { Role } from '../models/User';

const router = Router();

// Only Business Admins (or higher) can upload images
router.use(protect);
router.use(authorize(Role.BUSINESS_ADMIN));

// Handle single file upload mapped to the "image" field
router.post('/image', upload.single('image'), uploadImage);

export default router;
