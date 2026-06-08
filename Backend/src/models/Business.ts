import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionPlan {
  RESTAURANT = 'RESTAURANT',
  BAR = 'BAR',
  CAFETERIA = 'CAFETERIA',
  COMBO = 'COMBO'
}

export interface IBusiness extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId; // Reference to User (BUSINESS_ADMIN)
  gstNumber?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl?: string;
  activeModules: SubscriptionPlan[];
  subscriptionExpiry: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gstNumber: { type: String },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: { type: String, required: true },
    logoUrl: { type: String },
    activeModules: [
      {
        type: String,
        enum: Object.values(SubscriptionPlan)
      }
    ],
    subscriptionExpiry: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBusiness>('Business', businessSchema);
