import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  quantityInStock: number;
  unit: string;
  reorderThreshold: number;
  supplier: string;
}

const InventoryItemSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantityInStock: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  reorderThreshold: { type: Number, required: true, default: 10 },
  supplier: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
