import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum BusinessModule {
  POS = 'POS',
  KDS = 'KDS',
  DELIVERY = 'DELIVERY',
  QRMENU = 'QRMENU'
}

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface IBusiness extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId; // Reference to User (BUSINESS_ADMIN)
  gstNumber?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl?: string;
  plan: SubscriptionPlan;
  activeModules: BusinessModule[];
  subscriptionExpiry: Date;
  status: BusinessStatus;
  isActive: boolean; // Legacy flag, kept for backward compatibility if needed
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
    plan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      default: SubscriptionPlan.BASIC
    },
    activeModules: [
      {
        type: String,
        enum: Object.values(BusinessModule)
      }
    ],
    subscriptionExpiry: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(BusinessStatus),
      default: BusinessStatus.ACTIVE
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBusiness>('Business', businessSchema);
