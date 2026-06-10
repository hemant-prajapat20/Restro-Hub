import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  lifetimeSpent: number;
  lastVisit: Date;
}

const CustomerSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  totalVisits: { type: Number, default: 0 },
  lifetimeSpent: { type: Number, default: 0 },
  lastVisit: { type: Date }
}, { timestamps: true });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
