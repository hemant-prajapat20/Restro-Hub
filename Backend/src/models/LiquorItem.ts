import mongoose, { Document, Schema } from 'mongoose';

export interface ILiquorItem extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  vintage: string;
  category: 'Single Malt' | 'Vintage Wine' | 'Cognac' | 'Craft Cocktail';
  alcoholContent: string;
  pricePerGlass: number;
  stockBottles: number;
  capacityMl: number;
  origin: string;
  image: string;
}

const LiquorItemSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  vintage: { type: String, required: true },
  category: { type: String, enum: ['Single Malt', 'Vintage Wine', 'Cognac', 'Craft Cocktail'], required: true },
  alcoholContent: { type: String, required: true },
  pricePerGlass: { type: Number, required: true },
  stockBottles: { type: Number, required: true },
  capacityMl: { type: Number, required: true },
  origin: { type: String, required: true },
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ILiquorItem>('LiquorItem', LiquorItemSchema);
