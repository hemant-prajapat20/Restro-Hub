import express from 'express';
import { getMessages, markMessagesAsRead } from '../controllers/message.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', getMessages);
router.put('/read', markMessagesAsRead);

export default router;
