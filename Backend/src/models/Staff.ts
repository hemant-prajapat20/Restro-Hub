import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  role: string;
  contact: string;
  shift: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
}

const StaffSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  contact: { type: String, required: true },
  shift: { type: String, required: true },
  salary: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model<IStaff>('Staff', StaffSchema);
