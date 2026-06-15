const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/restrohub');
  const users = await mongoose.connection.collection('users').find({email: 'hp@gmail.com'}).toArray();
  console.log('User:', JSON.stringify(users, null, 2));
  
  if (users.length > 0 && users[0].businessId) {
    const business = await mongoose.connection.collection('businesses').findOne({_id: new mongoose.Types.ObjectId(users[0].businessId)});
    console.log('Business:', JSON.stringify(business, null, 2));
  }
  process.exit(0);
}

check();
