import Message from '../models/Message';
import mongoose from 'mongoose';
import app from '../app';

export const logMessage = async (
  businessId: mongoose.Types.ObjectId | string,
  action: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'error' = 'info'
) => {
  try {
    const savedMessage = await Message.create({
      businessId,
      action,
      message,
      type
    });

    const io = app.get('io');
    if (io) {
      io.emit('newMessage', savedMessage);
    }
  } catch (error) {
    console.error('Failed to log message:', error);
  }
};
