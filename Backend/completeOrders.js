const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Order = require('./src/models/order.model').default;
  const res = await Order.updateMany({ status: { $ne: 'Completed' } }, { status: 'Completed', deliveryOtp: '' });
  console.log('Updated:', res.modifiedCount);
  mongoose.disconnect();
}).catch(console.error);
