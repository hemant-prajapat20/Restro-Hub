import mongoose, { Document, Schema } from 'mongoose';

export interface IBarVipSuite extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  capacity: number;
  bookingFee: number;
  image?: string;
  status: 'Available' | 'Occupied';
  activeBill: number;
}

const BarVipSuiteSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  bookingFee: { type: Number, default: 0 },
  image: { type: String },
  status: { type: String, enum: ['Available', 'Occupied'], default: 'Available' },
  activeBill: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IBarVipSuite>('BarVipSuite', BarVipSuiteSchema);
