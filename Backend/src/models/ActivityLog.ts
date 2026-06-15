import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  message: string;
  category: 'business' | 'subscription' | 'payment' | 'system';
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, enum: ['business', 'subscription', 'payment', 'system'], default: 'system' },
    type: { type: String, enum: ['success', 'info', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
