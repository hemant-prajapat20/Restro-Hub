import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomerNotification extends Document {
  customerId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'booking' | 'order' | 'system' | 'cart';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerNotificationSchema = new Schema<ICustomerNotification>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['booking', 'order', 'system', 'cart'], default: 'system' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomerNotification>('CustomerNotification', customerNotificationSchema);
