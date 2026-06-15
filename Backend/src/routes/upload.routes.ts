import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { Role } from '../models/User';

const router = Router();

// Any authenticated user can upload images
router.use(protect);

// Handle single file upload mapped to the "image" field
router.post('/', upload.single('image'), uploadImage);

export default router;
