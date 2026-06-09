import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['success', 'info', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
