import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  name: string;
  category?: string;
  quantity: number;
  price: number;
  status: 'Pending' | 'In Kitchen' | 'Ready' | 'Served';
  variant?: { name: string; price: number };
  addons?: { name: string; price: number }[];
}

export interface IOrder extends Document {
  businessId: mongoose.Types.ObjectId;
  type: 'POS' | 'Delivery' | 'Signature' | 'Bar' | 'Cafe' | 'Dine-In' | 'Takeaway' | 'Online';
  tableId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'In Kitchen' | 'Ready' | 'Completed' | 'Cancelled' | 'Out for Delivery';
  paymentMethod?: string;
  transactionId?: string;
  source?: 'Zomato' | 'Swiggy' | 'Direct' | 'Online';
  customerDetails?: {
    name: string;
    phone: string;
    address?: string;
  };
  driverDetails?: {
    name: string;
    phone: string;
  };
  deliveryOtp?: string;
  notes?: string;
  estimatedPrepTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  type: { type: String, required: true, enum: ['POS', 'Delivery', 'Signature', 'Bar', 'Cafe', 'Dine-In', 'Takeaway', 'Online'] },
  tableId: { type: Schema.Types.ObjectId, ref: 'Table' },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  items: [{
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    category: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'In Kitchen', 'Ready', 'Served'], default: 'Pending' },
    variant: { name: { type: String }, price: { type: Number } },
    addons: [{ name: { type: String }, price: { type: Number } }]
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'In Kitchen', 'Ready', 'Completed', 'Cancelled', 'Out for Delivery'], default: 'Pending' },
  paymentMethod: { type: String },
  transactionId: { type: String },
  source: { type: String, enum: ['Zomato', 'Swiggy', 'Direct', 'Online'] },
  customerDetails: {
    name: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  driverDetails: {
    name: { type: String },
    phone: { type: String }
  },
  deliveryOtp: { type: String },
  notes: { type: String },
  estimatedPrepTime: { type: Number }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
