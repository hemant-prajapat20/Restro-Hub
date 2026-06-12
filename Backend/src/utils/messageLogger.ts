import Message from '../models/Message';
import mongoose from 'mongoose';

export const logMessage = async (
  businessId: mongoose.Types.ObjectId | string,
  action: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'error' = 'info'
) => {
  try {
    await Message.create({
      businessId,
      action,
      message,
      type
    });
  } catch (error) {
    console.error('Failed to log message:', error);
  }
};
