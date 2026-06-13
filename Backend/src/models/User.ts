import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  CHEF = 'CHEF',
  WAITER = 'WAITER',
  CUSTOMER = 'CUSTOMER'
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: Role;
  businessId?: mongoose.Types.ObjectId; // Null for Super Admin
  outletId?: mongoose.Types.ObjectId;   // Null for Business Admin
  staffCategory?: string;
  otp?: string;
  otpExpires?: Date;
  businessAdminCode?: string;
  isActive: boolean;
  savedAddresses?: {
    _id?: mongoose.Types.ObjectId;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: { 
      type: String, 
      enum: Object.values(Role), 
      default: Role.CASHIER,
      required: true 
    },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet' },
    staffCategory: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    businessAdminCode: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    savedAddresses: [{
      label: { type: String }, // 'Home', 'Work', 'Other'
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      isDefault: { type: Boolean, default: false }
    }]
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
