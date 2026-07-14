const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://RestroHub:restro12345@ac-jgcl1jz-shard-00-00.zjrojih.mongodb.net:27017,ac-jgcl1jz-shard-00-01.zjrojih.mongodb.net:27017,ac-jgcl1jz-shard-00-02.zjrojih.mongodb.net:27017/?ssl=true&replicaSet=atlas-13fvga-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Dynamically load models (assumes we are running from Backend folder with compiled TS or just using raw mongoose queries if models aren't compiled)
    // Actually, I can just use raw mongoose connections since we don't need the Mongoose schemas if we use native driver or weak schemas
    
    const businessSchema = new mongoose.Schema({}, { strict: false });
    const staffSchema = new mongoose.Schema({}, { strict: false });
    
    const Business = mongoose.model('Business', businessSchema, 'businesses');
    const Staff = mongoose.model('Staff', staffSchema, 'staff');

    // Get the first business (usually the one being tested)
    const business = await Business.findOne();
    if (!business) {
      console.log('No business found');
      process.exit(1);
    }

    console.log('Found business:', business.name);

    // 1. Update staff categories
    await Business.updateOne(
      { _id: business._id },
      { $set: { staffCategories: ['Waiter', 'Manager', 'Chef'] } }
    );
    console.log('Updated staff categories to [Waiter, Manager, Chef]');

    // 2. Add 4 Indian staff members
    const staffMembers = [
      {
        businessId: business._id,
        name: 'Rahul Sharma',
        role: 'Junior Waiter',
        shift: 'General (10 AM - 7 PM)',
        salary: 15000,
        contact: '9876543210',
        email: 'rahul.s@example.com',
        status: 'Off-Duty',
        score: 4.8,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix-Rahul Sharma',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        businessId: business._id,
        name: 'Priya Patel',
        role: 'Senior Waitress',
        shift: 'Morning (6 AM - 2 PM)',
        salary: 22000,
        contact: '9876543211',
        email: 'priya.p@example.com',
        status: 'Off-Duty',
        score: 4.9,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia-Priya Patel',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        businessId: business._id,
        name: 'Amit Kumar',
        role: 'Restaurant Manager',
        shift: 'General (10 AM - 7 PM)',
        salary: 45000,
        contact: '9876543212',
        email: 'amit.k@example.com',
        status: 'Clocked In',
        score: 5.0,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix-Amit Kumar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        businessId: business._id,
        name: 'Sanjay Singh',
        role: 'Executive Chef',
        shift: 'Evening (4 PM - 12 AM)',
        salary: 60000,
        contact: '9876543213',
        email: 'sanjay.s@example.com',
        status: 'Clocked In',
        score: 4.9,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix-Sanjay Singh',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const staff of staffMembers) {
      await Staff.create(staff);
      console.log(`Added staff: ${staff.name}`);
    }

    console.log('Database seeded successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
