import mongoose, { Document, Schema } from 'mongoose';

export interface ISignatureItem extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  course: 'Starter' | 'Main Course' | 'Dessert';
  price: number;
  chefName: string;
  isVeg: boolean;
  isAvailable: boolean;
  image: string;
}

const SignatureItemSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: String, enum: ['Starter', 'Main Course', 'Dessert'], required: true },
  price: { type: Number, required: true },
  chefName: { type: String, required: true },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ISignatureItem>('SignatureItem', SignatureItemSchema);
