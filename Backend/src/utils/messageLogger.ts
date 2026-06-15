import Message from '../models/Message';
import mongoose from 'mongoose';
import app from '../app';

export const logMessage = async (
  businessId: mongoose.Types.ObjectId | string,
  category: 'order' | 'payment' | 'inventory' | 'reservation' | 'staff' | 'system',
  action: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'error' = 'info'
) => {
  try {
    const savedMessage = await Message.create({
      businessId,
      category,
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
