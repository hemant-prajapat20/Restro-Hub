import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  status: 'Pending' | 'In Kitchen' | 'Ready' | 'Served';
}

export interface IOrder extends Document {
  businessId: mongoose.Types.ObjectId;
  type: 'POS' | 'Delivery' | 'Signature' | 'Bar' | 'Cafe';
  tableId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'In Kitchen' | 'Ready' | 'Completed' | 'Cancelled' | 'Out for Delivery';
  paymentMethod?: string;
  source?: 'Zomato' | 'Swiggy' | 'Direct';
  customerDetails?: {
    name: string;
    phone: string;
    address?: string;
  };
  estimatedPrepTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  type: { type: String, required: true },
  tableId: { type: Schema.Types.ObjectId, ref: 'Table' },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  items: [{
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'In Kitchen', 'Ready', 'Served'], default: 'Pending' }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'In Kitchen', 'Ready', 'Completed', 'Cancelled', 'Out for Delivery'], default: 'Pending' },
  paymentMethod: { type: String },
  source: { type: String, enum: ['Zomato', 'Swiggy', 'Direct'] },
  customerDetails: {
    name: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  estimatedPrepTime: { type: Number }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
