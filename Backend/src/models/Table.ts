import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
  businessId: mongoose.Types.ObjectId;
  number: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Merged';
  currentOrderId?: mongoose.Types.ObjectId;
  assignedWaiter?: string;
  linkedTables?: mongoose.Types.ObjectId[];
  floor?: number;
}

const TableSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  number: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Merged'], default: 'Available' },
  currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  assignedWaiter: { type: String },
  linkedTables: [{ type: Schema.Types.ObjectId, ref: 'Table' }],
  floor: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model<ITable>('Table', TableSchema);
