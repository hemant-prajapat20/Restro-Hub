import mongoose, { Document, Schema } from 'mongoose';

export interface ICafeItem extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  category: 'Specialty Beans' | 'Artisan Patisserie' | 'Cold Brew' | 'Signature Beverage';
  originOrType: string;
  price: number;
  stockCount: number;
  roastOrBakeTime: string;
  scoreOrAward: string;
  image: string;
}

const CafeItemSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Specialty Beans', 'Artisan Patisserie', 'Cold Brew', 'Signature Beverage'], required: true },
  originOrType: { type: String, required: true },
  price: { type: Number, required: true },
  stockCount: { type: Number, required: true },
  roastOrBakeTime: { type: String, required: true },
  scoreOrAward: { type: String, required: true },
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ICafeItem>('CafeItem', CafeItemSchema);
