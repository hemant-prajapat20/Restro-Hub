import mongoose, { Document, Schema } from 'mongoose';

export interface IReservation extends Document {
  name: string;
  phone: string;
  guests: number;
  time: string;
  date: Date;
  floor?: number;
  seats?: number;
  tableNumber?: string;
  status: 'Awaiting' | 'Confirmed' | 'Delayed' | 'Cancelled' | 'Completed';
  businessId?: mongoose.Types.ObjectId;
}

const reservationSchema = new Schema<IReservation>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    time: { type: String, required: true },
    date: { type: Date, default: Date.now },
    floor: { type: Number },
    seats: { type: Number },
    tableNumber: { type: String },
    status: { 
      type: String, 
      enum: ['Awaiting', 'Confirmed', 'Delayed', 'Cancelled', 'Completed'],
      default: 'Awaiting'
    },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business' }
  },
  { timestamps: true }
);

export default mongoose.model<IReservation>('Reservation', reservationSchema);
