import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
