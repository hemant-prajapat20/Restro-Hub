import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryLog extends Document {
  businessId: mongoose.Types.ObjectId;
  inventoryItemId: mongoose.Types.ObjectId;
  type: 'Add' | 'Remove' | 'Wastage';
  quantity: number;
  reason: string;
  performedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLogSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  type: { type: String, enum: ['Add', 'Remove', 'Wastage'], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, default: '' },
  performedBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema);
