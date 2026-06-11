const mongoose = require('mongoose');
const uri = 'mongodb://RestroHub:restro12345@ac-jgcl1jz-shard-00-00.zjrojih.mongodb.net:27017,ac-jgcl1jz-shard-00-01.zjrojih.mongodb.net:27017,ac-jgcl1jz-shard-00-02.zjrojih.mongodb.net:27017/?ssl=true&replicaSet=atlas-13fvga-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(uri).then(async () => {
  await mongoose.connection.collection('tables').deleteMany({});
  await mongoose.connection.collection('reservations').deleteMany({});
  console.log('Cleared tables and reservations');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
