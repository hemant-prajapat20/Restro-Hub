import { Request, Response } from 'express';
import Message from '../models/Message';

export interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all messages for a business
// @route   GET /api/messages
// @access  Private/BusinessAdmin
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user.businessId || req.user._id;
    const messages = await Message.find({ businessId }).sort({ createdAt: -1 }).limit(100);
    res.json({
      status: 'success',
      data: messages
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Mark specific or all messages as read
// @route   PUT /api/messages/read
// @access  Private/BusinessAdmin
export const markMessagesAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user.businessId || req.user._id;
    const { messageId } = req.body; 

    if (messageId) {
      await Message.findOneAndUpdate({ _id: messageId, businessId }, { isRead: true });
    } else {
      await Message.updateMany({ businessId, isRead: false }, { isRead: true });
    }

    res.json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
