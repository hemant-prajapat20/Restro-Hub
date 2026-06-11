require('dotenv').config();
const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  number: String,
  capacity: Number,
  status: String,
  floor: Number
}, { collection: 'tables' });

const Table = mongoose.model('Table', TableSchema);

const ReservationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  guests: Number,
  time: String,
  status: String,
  tableNumber: String,
  floor: Number,
  tableId: String
}, { collection: 'reservations' });

const Reservation = mongoose.model('Reservation', ReservationSchema);

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find all awaiting reservations
  const reservations = await Reservation.find({ status: 'Awaiting' });
  console.log('Found awaiting reservations:', reservations.length);

  for (const res of reservations) {
    if (res.tableNumber) {
      console.log(`Fixing table ${res.tableNumber} on floor ${res.floor}`);
      await Table.updateMany(
        { number: res.tableNumber, floor: res.floor },
        { status: 'Reserved' }
      );
    }
  }

  console.log('Done fixing tables!');
  process.exit(0);
}

fix().catch(console.error);
