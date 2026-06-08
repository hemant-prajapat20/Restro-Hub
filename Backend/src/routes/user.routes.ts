import express from 'express';
import { getUsers } from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { Role } from '../models/User';

const router = express.Router();

router.route('/')
  .get(protect, authorize(Role.SUPER_ADMIN), getUsers);

export default router;
