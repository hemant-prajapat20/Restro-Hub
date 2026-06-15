import mongoose, { Document, Schema } from 'mongoose';

export interface ICafeteriaUser extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  employeeId: string; // or student ID
  department: string;
  email: string;
  phone: string;
  mealPlan: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CafeteriaUserSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  employeeId: { type: String, required: true },
  department: { type: String, default: 'General' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  mealPlan: { type: String, default: 'Pay-As-You-Go' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ICafeteriaUser>('CafeteriaUser', CafeteriaUserSchema);
