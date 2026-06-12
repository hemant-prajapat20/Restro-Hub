import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  role: string;
  contact: string;
  email?: string;
  shift: string;
  salary: number;
  score?: number;
  image?: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Clocked In' | 'On Break' | 'Off-Duty';
}

const StaffSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  contact: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        // Strip non-digits and check length is 10
        const digits = v.replace(/\D/g, '');
        return digits.length === 10;
      },
      message: 'Contact must be a valid 10-digit mobile number'
    }
  },
  email: { type: String },
  shift: { type: String, required: true },
  salary: { type: Number, required: true },
  score: { type: Number, default: 5.0 },
  image: { type: String },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated', 'Clocked In', 'On Break', 'Off-Duty'],
    default: 'Active'
  }
}, { timestamps: true });

export default mongoose.model<IStaff>('Staff', StaffSchema);
