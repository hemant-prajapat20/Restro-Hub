import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  businessId: mongoose.Types.ObjectId;
  action: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    action: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['success', 'info', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', messageSchema);
