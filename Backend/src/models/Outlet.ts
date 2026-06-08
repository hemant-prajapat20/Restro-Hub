import mongoose, { Document, Schema } from 'mongoose';

export interface IOutlet extends Document {
  name: string;
  businessId: mongoose.Types.ObjectId;
  location: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const outletSchema = new Schema<IOutlet>(
  {
    name: { type: String, required: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    location: { type: String, required: true },
    contactPhone: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IOutlet>('Outlet', outletSchema);
