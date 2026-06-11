import mongoose, { Document, Schema } from 'mongoose';

export interface IPrivateDiningRoom extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  activeBill: number;
  minSpend: number;
  notes: string;
  image?: string;
  benefits?: string[];
  isActive?: boolean;
}

const PrivateDiningRoomSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved'], default: 'Available' },
  activeBill: { type: Number, default: 0 },
  minSpend: { type: Number, required: true },
  notes: { type: String },
  image: { type: String },
  benefits: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IPrivateDiningRoom>('PrivateDiningRoom', PrivateDiningRoomSchema);
