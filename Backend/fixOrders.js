const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const res = await mongoose.connection.collection('orders').updateMany(
    { status: { $ne: 'Completed' } },
    { $set: { status: 'Completed', deliveryOtp: '' } }
  );
  console.log('Updated:', res.modifiedCount);
  mongoose.disconnect();
}).catch(console.error);
